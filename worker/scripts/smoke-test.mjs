/**
 * Smoke test for the AI chat assistant.
 * POSTs each question to /api/chat, accumulates the SSE response,
 * and prints the full answer so we can manually verify references.
 */

const WORKER_URL = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const QUESTIONS = [
  'What dev tools do I need to install for TECHNEST 2026 Week 1?',
  'How do I make a CV with Typst in TECHNEST Week 8?',
  "What's the Auckland Commute tutorial in HER WAKA about?",
  'How does Capstone 2026 voting work?',
  "What's covered in the Gemini CLI complete guide blog post?",
  '2024 winter 课程和 2025 summer 有什么区别？',
];

async function ask(question) {
  const res = await fetch(`${WORKER_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question }),
  });

  if (!res.ok) {
    return { error: `HTTP ${res.status}`, body: await res.text() };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.response) full += parsed.response;
      } catch {}
    }
  }

  return { sessionId: res.headers.get('X-Session-Id'), answer: full };
}

(async () => {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    console.log(`\n=================================================================`);
    console.log(`Q${i + 1}: ${q}`);
    console.log(`=================================================================`);
    const t0 = Date.now();
    try {
      const result = await ask(q);
      const ms = Date.now() - t0;
      if (result.error) {
        console.log(`ERROR (${ms}ms):`, result.error, result.body);
      } else {
        console.log(`(latency: ${ms}ms, session: ${result.sessionId})`);
        console.log(result.answer);
        console.log(`\n[has Reference line: ${/—\s*Reference:/i.test(result.answer) ? 'YES' : 'NO'}]`);
      }
    } catch (e) {
      console.log('THREW:', e?.message || e);
    }
  }
})();
