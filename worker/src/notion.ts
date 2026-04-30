import type { Env } from './types';

export const NOTION_API = 'https://api.notion.com/v1';
export const NOTION_VERSION = '2022-06-28';

export async function notionFetch(
  env: Env,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${env.NOTION_TOKEN}`);
  headers.set('Notion-Version', NOTION_VERSION);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${NOTION_API}${endpoint}`, { ...options, headers });
}

export interface NotionRichText {
  type: 'text';
  text: { content: string };
}

export function richText(content: string): NotionRichText[] {
  return [{ type: 'text', text: { content } }];
}

export function readRichText(
  value: { rich_text?: NotionRichText[] } | undefined
): string {
  return value?.rich_text?.[0]?.text?.content ?? '';
}

export function readTitle(
  value: { title?: NotionRichText[] } | undefined
): string {
  return value?.title?.[0]?.text?.content ?? '';
}
