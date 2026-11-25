// 抓取 15 篇内置论文的 arXiv 原文英文摘要，生成 src/data/originalAbstracts.ts。
// 用法：node scripts/fetch-abstracts.mjs
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
const OUT = resolve(ROOT, "src", "data", "originalAbstracts.ts");

const PAPERS = [
  "1706.03762",
  "2005.14165",
  "2001.08361",
  "2106.09685",
  "2305.14314",
  "2205.14135",
  "2006.11239",
  "2112.10752",
  "1406.2661",
  "2005.11401",
  "2004.04906",
  "2002.08909",
  "2201.11903",
  "2210.03629",
  "2203.11171",
];

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function fetchAbstract(id) {
  const url = `https://export.arxiv.org/api/query?id_list=${id}&max_results=1`;
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const xml = await response.text();
  const match = xml.match(/<summary>([\s\S]*?)<\/summary>/);
  if (!match) throw new Error("no <summary>");
  const text = decodeEntities(match[1])
    .replace(/\\times\b/g, "×")
    .replace(/\$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) throw new Error("empty summary");
  return text;
}

const map = {};
for (const id of PAPERS) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      map[id] = await fetchAbstract(id);
      console.log(`${id}: ${map[id].length} chars`);
      break;
    } catch (error) {
      console.log(`${id}: attempt ${attempt} failed (${error.message})`);
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
}

const lines = Object.keys(map).map(
  (id) => `  ${JSON.stringify(id)}: ${JSON.stringify(map[id])},`,
);
const content =
  `// 15 篇内置论文的 arXiv 原文摘要（英文），由 scripts/fetch-abstracts.mjs 生成，勿手改。\n` +
  `export const ORIGINAL_ABSTRACTS: Record<string, string> = {\n${lines.join("\n")}\n};\n`;

writeFileSync(OUT, content, "utf8");
console.log(`\nwritten ${OUT} (${Object.keys(map).length} abstracts)`);
