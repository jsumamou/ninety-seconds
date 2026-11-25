// 抓取 15 篇内置论文的原文结论（英文），生成 src/data/originalConclusions.ts。
// 有 Conclusion 章节就抓结论；没有则退回结尾的 Discussion/Limitations/Future Work 章节并标注 source="fallback"。
// 用法：node scripts/fetch-conclusions.mjs
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
const OUT = resolve(ROOT, "src", "data", "originalConclusions.ts");

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

const MAX_LEN = 5000;

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function textFromHtml(fragment) {
  let text = fragment
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, " ")
    .replace(/<table[\s\S]*?<\/table>/gi, " ");
  // 用 MathML 渲染后的文本（去掉 LaTeX annotation 源码），而不是 alttext 里的 \Delta 之类
  text = text.replace(/<math[^>]*>[\s\S]*?<\/math>/gi, (block) => {
    const t = block
      .replace(/<annotation(?:-xml)?[\s\S]*?<\/annotation(?:-xml)?>/gi, "")
      .replace(/<\/?semantics[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return t ? ` ${t} ` : " ";
  });
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  // 去掉零宽字符、数字引用标记（[72] / [ 72 ] / [72, 73]）、以及标点前的多余空格
  text = text.replace(/[\u200b\u200c\u200d\ufeff]/g, "");
  text = text.replace(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g, " ");
  text = text.replace(/\s+([.,;:!?)])/g, "$1");
  return text.replace(/\s+/g, " ").trim();
}

async function fetchHtml(id) {
  const url = `https://arxiv.org/html/${id}`;
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function sectionList(html) {
  const opens = [
    ...html.matchAll(/<section[^>]*class="ltx_(?:section|bibliography|appendix)"[^>]*>/gi),
  ];
  const sections = [];
  for (let i = 0; i < opens.length; i += 1) {
    const start = opens[i].index;
    const end = i + 1 < opens.length ? opens[i + 1].index : html.length;
    const block = html.slice(start, end);
    const h2 = block.match(/<h2[\s\S]*?<\/h2>/i);
    const heading = h2 ? textFromHtml(h2[0]) : "";
    sections.push({ heading, block });
  }
  return sections;
}

// 结论章节内部常混入 Acknowledgements / Funding / Appendix 等后置段落标题，
// 在提取正文前于第一个这类标题处截断，避免把致谢和参考文献带进来。
const BACK_MATTER =
  /^(?:Acknowledg(?:e?ments?|gment)|Funding|Disclosure|Appendix|Appendices|References|Bibliography|Author Contributions?|Competing Interests?|Data Availability|Ethics Statement|Reproducibility Statement|Broader Impact)\b/i;

function cutBackMatter(block) {
  const headings = [...block.matchAll(/<h[2-6][^>]*>[\s\S]*?<\/h[2-6]>/gi)];
  for (const h of headings) {
    if (BACK_MATTER.test(textFromHtml(h[0]))) {
      return block.slice(0, h.index);
    }
  }
  return block;
}

function pickConclusion(sections) {
  for (const section of sections) {
    if (/Conclusion/.test(section.heading)) return { ...section, source: "conclusion" };
  }
  let fallback = null;
  for (const section of sections) {
    if (/Discussion|Limitations/.test(section.heading)) fallback = section;
  }
  if (fallback) return { ...fallback, source: "fallback" };
  for (const section of sections) {
    if (/Future Work|Future Directions/.test(section.heading)) fallback = section;
  }
  if (fallback) return { ...fallback, source: "fallback" };
  return null;
}

const map = {};
for (const id of PAPERS) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const html = await fetchHtml(id);
      const sections = sectionList(html);
      const picked = pickConclusion(sections);
      if (!picked) {
        console.log(`${id}: NO conclusion section`);
        break;
      }
      const body = cutBackMatter(picked.block.replace(/<h2[\s\S]*?<\/h2>/i, " "));
      const text = textFromHtml(body).slice(0, MAX_LEN);
      map[id] = { heading: picked.heading, text, source: picked.source };
      console.log(
        `${id}: [${picked.source}] "${picked.heading}" -> ${text.length} chars`,
      );
      break;
    } catch (error) {
      console.log(`${id}: attempt ${attempt} failed (${error.message})`);
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
}

const lines = Object.keys(map).map((id) => {
  const entry = map[id];
  return `  ${JSON.stringify(id)}: { heading: ${JSON.stringify(entry.heading)}, text: ${JSON.stringify(entry.text)}, source: ${JSON.stringify(entry.source)} },`;
});
const content =
  `// 15 篇内置论文的原文结论/结尾章节（英文），由 scripts/fetch-conclusions.mjs 生成，勿手改。\n` +
  `export type ConclusionSource = "conclusion" | "fallback";\n` +
  `export type ConclusionEntry = { heading: string; text: string; source: ConclusionSource };\n` +
  `export const ORIGINAL_CONCLUSIONS: Record<string, ConclusionEntry> = {\n${lines.join("\n")}\n};\n`;

writeFileSync(OUT, content, "utf8");
console.log(`\nwritten ${OUT} (${Object.keys(map).length} papers)`);
