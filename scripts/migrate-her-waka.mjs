#!/usr/bin/env node
// 一次性脚本：把 D:\github_repository\her-waka 的 MDX 内容搬到本项目
// 两个位置：
//   1) versioned_docs/version-2026-her-waka/  (中文占位，当前先原样英文，待翻译)
//   2) i18n/en/docusaurus-plugin-content-docs/version-2026-her-waka/  (英文内容覆盖)
// 同步重写路径：
//   - /images/...         → /img/her-waka/...
//   - /snippets/X.mdx     → <相对路径>/_snippets/X.mdx
//   - /tutorial/<p>/<q>   → 相对 md 链接或保留（Docusaurus 会按 link 解析）
// 跳过：dev-docs、style.css、fix-mobile.js、docs.json、favicon.svg、README.md、AGENTS.md、CONTRIBUTING.md

import fs from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT = 'D:/github_repository/her-waka';
const DEST_ZH = 'D:/github_repository/ai-programming-teaching-project/versioned_docs/version-2026-her-waka';
const DEST_EN = 'D:/github_repository/ai-programming-teaching-project/i18n/en/docusaurus-plugin-content-docs/version-2026-her-waka';

// 源 -> 目标 (相对于版本根) 的映射函数
function mapSrcToDest(relFromSrc) {
  const posixRel = relFromSrc.replace(/\\/g, '/');

  // snippets/ → _snippets/
  if (posixRel.startsWith('snippets/')) {
    return '_snippets/' + posixRel.slice('snippets/'.length);
  }

  // workshop/overview.mdx → workshop/index.mdx
  if (posixRel === 'workshop/overview.mdx') {
    return 'workshop/index.mdx';
  }

  // tutorial/overview.mdx → tutorial/index.mdx
  if (posixRel === 'tutorial/overview.mdx') {
    return 'tutorial/index.mdx';
  }

  // 其他保持原样（programme/, workshop/<session>/..., tutorial/<topic>/..., resources/）
  return posixRel;
}

// 针对单篇 MDX 的内容改写
function rewriteMdx(content, destRelPosix) {
  let out = content;

  // 1) 图片路径：/images/banners|speakers|partners/... → /img/her-waka/banners|speakers|partners/...
  out = out.replace(/\/images\/(banners|speakers|partners)\//g, '/img/her-waka/$1/');

  // 2) snippets import：
  //    原： import X from "/snippets/FILE.mdx";
  //    新： import X from "<相对路径到 _snippets/FILE.mdx>";
  //    计算目标文件到 _snippets/ 的相对路径
  const fileDirParts = destRelPosix.split('/').slice(0, -1); // 去掉文件名
  const depth = fileDirParts.length; // 当前文件距版本根的深度
  const relPrefix = depth === 0 ? './' : '../'.repeat(depth);

  out = out.replace(
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']\/snippets\/([^"']+?)["']\s*;/g,
    (_m, varName, fname) => `import ${varName} from "${relPrefix}_snippets/${fname}";`
  );

  // 3) 站内绝对链接：/programme|workshop|tutorial|resources/... → /docs/2026-her-waka/...
  //    覆盖 href="..." / src="..." / markdown [](/xxx) 三种写法
  //    并把 overview 对齐到 index 或保持原样（overview.mdx 已在目录里存在）
  const TOP_DIRS = '(?:programme|workshop|tutorial|resources)';
  // href="/xxx/..." 和 href='/xxx/...'
  out = out.replace(
    new RegExp(`href=(["'])\\/(${TOP_DIRS})\\/([^"']*)\\1`, 'g'),
    (_m, q, dir, rest) => `href=${q}/docs/2026-her-waka/${dir}/${rest}${q}`
  );
  // markdown 链接 [text](/xxx/...)
  out = out.replace(
    new RegExp(`\\]\\(\\/(${TOP_DIRS})\\/([^)]*)\\)`, 'g'),
    (_m, dir, rest) => `](/docs/2026-her-waka/${dir}/${rest})`
  );

  // workshop/overview 和 tutorial/overview 是 index 文件，链接到它们要变成目录 URL
  out = out.replace(/\/docs\/2026-her-waka\/workshop\/overview(?=\b|$)/g, '/docs/2026-her-waka/workshop/');
  out = out.replace(/\/docs\/2026-her-waka\/tutorial\/overview(?=\b|$)/g, '/docs/2026-her-waka/tutorial/');

  return out;
}

async function walk(dir, baseDir = dir) {
  const out = [];
  const entries = await fs.readdir(dir, {withFileTypes: true});
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // 跳过不迁移的目录
      if (['dev-docs', 'node_modules', '.git', '.github'].includes(ent.name)) continue;
      out.push(...(await walk(full, baseDir)));
    } else if (ent.isFile() && full.endsWith('.mdx')) {
      const rel = path.relative(baseDir, full);
      // 跳过根目录的非教学 mdx
      out.push(rel);
    }
  }
  return out;
}

async function main() {
  const files = await walk(SRC_ROOT);
  console.log(`Found ${files.length} .mdx files to migrate`);

  const counts = {zh: 0, en: 0};

  for (const relPath of files) {
    const posixRel = relPath.replace(/\\/g, '/');
    const destRel = mapSrcToDest(posixRel);
    const srcFull = path.join(SRC_ROOT, relPath);
    const content = await fs.readFile(srcFull, 'utf8');
    const rewritten = rewriteMdx(content, destRel);

    for (const [loc, destRoot, counter] of [
      ['zh', DEST_ZH, 'zh'],
      ['en', DEST_EN, 'en'],
    ]) {
      const destFull = path.join(destRoot, destRel);
      await fs.mkdir(path.dirname(destFull), {recursive: true});
      await fs.writeFile(destFull, rewritten, 'utf8');
      counts[counter]++;
    }
  }

  console.log(`Wrote ${counts.zh} files to versioned_docs, ${counts.en} files to i18n/en.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
