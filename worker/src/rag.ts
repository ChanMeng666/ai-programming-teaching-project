import type { Env, VectorMatch } from './types';

const SYSTEM_PROMPT = `你是「AI编程教学平台」的智能助手。你的任务是帮助用户学习AI辅助编程。

你可以：
- 回答关于课程内容的问题
- 解释编程概念和AI工具使用方法
- 提供学习建议

请用简洁、友好的中文回答。如果问题超出课程范围，请礼貌告知并尝试提供一般性的帮助。`;

/**
 * Generate embeddings for a query using Workers AI
 */
export async function generateEmbedding(
  env: Env,
  text: string
): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text],
  });
  return response.data[0];
}

/**
 * Search for relevant documents using Vectorize
 */
export async function searchRelevantDocs(
  env: Env,
  query: string,
  topK: number = 3
): Promise<VectorMatch[]> {
  if (!env.VECTORIZE) {
    return [];
  }

  try {
    const queryEmbedding = await generateEmbedding(env, query);
    const results = await env.VECTORIZE.query(queryEmbedding, {
      topK,
      returnMetadata: 'all',
    });
    return results.matches as VectorMatch[];
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

/**
 * Build context from relevant documents
 */
export function buildContext(matches: VectorMatch[]): string {
  if (matches.length === 0) {
    return '';
  }

  const contextParts = matches
    .filter((match) => match.metadata?.content)
    .map((match, index) => {
      const title = match.metadata?.title || `文档 ${index + 1}`;
      const content = match.metadata?.content || '';
      return `### ${title}\n${content}`;
    });

  if (contextParts.length === 0) {
    return '';
  }

  return `\n\n以下是相关的课程内容供你参考：\n\n${contextParts.join('\n\n')}`;
}

/**
 * Build the system prompt with optional RAG context
 */
export async function buildSystemPrompt(
  env: Env,
  userQuery: string
): Promise<string> {
  const matches = await searchRelevantDocs(env, userQuery);
  const context = buildContext(matches);
  return SYSTEM_PROMPT + context;
}
