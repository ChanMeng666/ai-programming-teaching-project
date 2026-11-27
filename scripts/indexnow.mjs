/**
 * IndexNow ping for programming.chanmeng.org: tells Bing, Yandex, Seznam, Naver
 * and the other participating engines which URLs exist, instead of waiting for
 * their crawlers. Run it after a deploy that adds or changes pages:
 *
 *   npm run indexnow            # both locales' live sitemaps
 *   npm run indexnow -- --dry   # print what would be sent, send nothing
 *
 * The URL list is the live sitemaps (en and zh-Hans), so nothing is hardcoded.
 * The key is public on purpose: IndexNow proves ownership by fetching
 * https://programming.chanmeng.org/<key>.txt, the file in static/. Same design
 * as 2d-portfolio's scripts/site/indexnow.mjs (chanmeng.org has its own key).
 *
 * Always exits 0: a ping is never a reason to treat a deploy as failed.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "programming.chanmeng.org";
const BASE = `https://${HOST}`;
const SITEMAPS = [`${BASE}/sitemap.xml`, `${BASE}/zh-Hans/sitemap.xml`];
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const dry = process.argv.includes("--dry");

const staticDir = join(dirname(fileURLToPath(import.meta.url)), "..", "static");
const keyFile = readdirSync(staticDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));

async function main() {
  if (!keyFile) return console.warn("::warning::no <32-hex>.txt key file in static/; nothing sent");
  const key = keyFile.replace(/\.txt$/, "");

  const urls = new Set();
  for (const sm of SITEMAPS) {
    const res = await fetch(sm);
    if (!res.ok) return console.warn(`::warning::${sm} answered ${res.status}; nothing sent`);
    for (const m of (await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = m[1].replace(/&amp;/g, "&").trim();
      try { if (new URL(u).host === HOST) urls.add(u); } catch {}
    }
  }
  const urlList = [...urls].slice(0, 10000);

  const keyCheck = await fetch(`${BASE}/${keyFile}`);
  if (!keyCheck.ok || (await keyCheck.text()).trim() !== key) {
    return console.warn(`::warning::${BASE}/${keyFile} is not live yet (deploy first); nothing sent`);
  }

  const payload = { host: HOST, key, keyLocation: `${BASE}/${keyFile}`, urlList };
  if (dry) return console.log(`dry run: would send ${urlList.length} URLs`, urlList.slice(0, 5));

  const ping = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  // 200 and 202 both mean accepted; 202 = key validation still pending.
  console.log(`IndexNow: HTTP ${ping.status} for ${urlList.length} URLs`);
  if (ping.status >= 300) console.warn(`::warning::${await ping.text()}`);
}

main().catch((e) => console.warn(`::warning::${e.message}`)).finally(() => process.exit(0));
