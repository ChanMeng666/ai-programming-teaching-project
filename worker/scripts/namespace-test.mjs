/**
 * Namespace-aware retrieval test.
 *
 * Sends the SAME query with different contextNamespace values and prints what
 * each one cites. If filtering works, the references should differ.
 */

const WORKER_URL = 'https://ai-chat-worker.chanmeng-dev.workers.dev';

const SCENARIOS = [
  {
    label: 'no namespace (default behavior)',
    namespace: null,
    query: 'How do I set up the development environment?',
  },
  {
    label: 'on /docs/2024-winter/ page',
    namespace: '2024-winter',
    query: 'How do I set up the development environment?',
  },
  {
    label: 'on /docs/2025-summer/ page',
    namespace: '2025-summer',
    query: 'How do I set up the development environment?',
  },
  {
    label: 'on /docs/2026-her-waka/ page',
    namespace: '2026-her-waka',
    query: 'How do I set up the development environment?',
  },
  {
    label: 'on /docs/2026-technest/ page',
    namespace: '2026-technest',
    query: 'How do I set up the development environment?',
  },
];

async function ask({ namespace, query }) {
  const body = { message: query };
  if (namespace) body.contextNamespace = namespace;
  const res = await fetch(`${WORKER_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { error: `HTTP ${res.status}` };

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = '';
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const d = line.slice(6);
      if (d === '[DONE]') continue;
      try {
        const p = JSON.parse(d);
        if (p.response) full += p.response;
      } catch {}
    }
  }
  return { answer: full };
}

(async () => {
  for (const sc of SCENARIOS) {
    console.log(`\n=================================================================`);
    console.log(`Scenario: ${sc.label}`);
    console.log(`Query:    ${sc.query}`);
    console.log(`=================================================================`);
    const t0 = Date.now();
    const { answer, error } = await ask(sc);
    const ms = Date.now() - t0;
    if (error) {
      console.log(`ERROR (${ms}ms): ${error}`);
      continue;
    }
    // Extract reference lines for at-a-glance comparison
    const refs = (answer.match(/—\s*Reference:.*$/gim) || []).map((s) => s.trim());
    console.log(`(${ms}ms)`);
    console.log(answer.slice(0, 600) + (answer.length > 600 ? '\n...[truncated]' : ''));
    console.log(`\nReferences (${refs.length}):`);
    for (const r of refs) console.log(`  ${r}`);
  }
})();
