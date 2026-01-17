import type { Env, ChatMessage, Session } from './types';
import { buildSystemPrompt } from './rag';

const MAX_HISTORY_MESSAGES = 10;
const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get or create a session
 */
export async function getSession(
  env: Env,
  sessionId?: string
): Promise<Session> {
  if (sessionId) {
    const stored = await env.CHAT_SESSIONS.get(sessionId, 'json');
    if (stored) {
      return stored as Session;
    }
  }

  const newSession: Session = {
    id: generateSessionId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return newSession;
}

/**
 * Save session to KV
 */
export async function saveSession(env: Env, session: Session): Promise<void> {
  session.updatedAt = Date.now();

  // Keep only the last N messages to avoid context overflow
  if (session.messages.length > MAX_HISTORY_MESSAGES) {
    session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);
  }

  await env.CHAT_SESSIONS.put(session.id, JSON.stringify(session), {
    expirationTtl: SESSION_TTL,
  });
}

/**
 * Process a chat message and generate a response
 */
export async function processChat(
  env: Env,
  userMessage: string,
  sessionId?: string
): Promise<{ response: ReadableStream; sessionId: string }> {
  // Get or create session
  const session = await getSession(env, sessionId);

  // Build system prompt with RAG context
  const systemPrompt = await buildSystemPrompt(env, userMessage);

  // Add user message to history
  session.messages.push({
    role: 'user',
    content: userMessage,
  });

  // Prepare messages for AI
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...session.messages,
  ];

  // Call Workers AI with streaming
  const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    stream: true,
  });

  // Create a transform stream to capture the response
  let fullResponse = '';
  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      // Parse the SSE data
      const text = new TextDecoder().decode(chunk);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.response) {
              fullResponse += parsed.response;
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }

      controller.enqueue(chunk);
    },
    async flush() {
      // Save the complete response to session
      if (fullResponse) {
        session.messages.push({
          role: 'assistant',
          content: fullResponse,
        });
        await saveSession(env, session);
      }
    },
  });

  // Pipe the AI stream through our transform
  (stream as ReadableStream).pipeTo(writable);

  return {
    response: readable,
    sessionId: session.id,
  };
}
