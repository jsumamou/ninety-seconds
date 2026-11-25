// 由 scripts/figures-inventory.json 生成 src/data/paperFigures.ts。
// 用法：node scripts/build-figures-data.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INV = path.join(ROOT, "scripts", "figures-inventory.json");
const OUT = path.join(ROOT, "src", "data", "paperFigures.ts");

const MAX_FIGURES = 5;
const MAX_TABLES = 4;

const inventory = JSON.parse(fs.readFileSync(INV, "utf8"));

function splitTag(caption) {
  const raw = (caption || "").trim();
  const m = /^\s*((?:Figure|Table|Fig\.)\s*\d+[a-z]?)\s*[:.]\s*/i.exec(raw);
  if (!m) return { tag: "", caption: raw };
  let tag = m[1].replace(/\s+/g, " ");
  let rest = raw.slice(m[0].length).trim();
  // 部分论文（如 GPT-3）用「图 1.1 / 1.2」分节编号：图注里带一个序号前缀，
  // 拼回标签，避免同一篇里出现三个「Figure 1」。
  const sub = /^(\d+)\s*[:.]\s*/.exec(rest);
  if (sub) {
    tag = `${tag}.${sub[1]}`;
    rest = rest.slice(sub[0].length).trim();
  }
  return { tag, caption: rest };
}

const data = {};

for (const paper of inventory) {
  const items = [];
  let figs = 0;
  let tables = 0;
  for (const item of paper.items || []) {
    const hasFiles = Array.isArray(item.files) && item.files.length > 0;
    const hasTable = Boolean(item.tableHtml);

    // 图注前缀优先于「块内是否含 <table>」：有些图是用排版表格拼的，不能当数据表
    const capHead = (item.caption || "").trim().toLowerCase();
    const capLooksFigure = capHead.startsWith("figure") || capHead.startsWith("fig.");
    const capLooksTable = capHead.startsWith("table");
    const kind = capLooksFigure ? "figure" : capLooksTable ? "table" : item.kind;

    if (kind === "figure" && !hasFiles) continue;
    if (kind === "table" && !hasTable) continue;

    if (kind === "figure") {
      if (figs >= MAX_FIGURES) continue;
      figs += 1;
    } else {
      if (tables >= MAX_TABLES) continue;
      tables += 1;
    }
    const { tag, caption } = splitTag(item.caption);
    items.push({
      id: item.id,
      kind,
      tag: tag || (kind === "table" ? "Table" : "Figure"),
      caption,
      ...(hasFiles ? { files: item.files } : {}),
      ...(hasTable ? { tableSrc: item.tableHtml } : {}),
    });
  }
  // 兜底：万一还有重名标签，加序号区分，避免页面上出现两个「Table 3」
  const seen = new Map();
  for (const item of items) {
    const n = seen.get(item.tag) ?? 0;
    seen.set(item.tag, n + 1);
    if (n > 0) item.tag = `${item.tag}-${n + 1}`;
  }

  if (items.length) data[paper.paperId] = items;
}

const header = `// 由 scripts/build-figures-data.mjs 从 scripts/figures-inventory.json 生成，勿手改。
// 数据来源：arXiv HTML 版原文，图片在 public/figures/ 下，表格 HTML 在 public/tables/ 下。

export interface PaperFigureItem {
  id: string;
  kind: "figure" | "table";
  tag: string;
  caption: string;
  files?: string[];
  tableSrc?: string;
}

const PAPER_FIGURES: Record<string, PaperFigureItem[]> = `;

const body = JSON.stringify(data, null, 2);

const footer = `

export function getPaperFigures(paperId: string): PaperFigureItem[] {
  return PAPER_FIGURES[paperId] ?? [];
}

export function hasPaperFigures(paperId: string): boolean {
  return (PAPER_FIGURES[paperId]?.length ?? 0) > 0;
}

export function figureCountOf(paperId: string): { figures: number; tables: number } {
  const items = PAPER_FIGURES[paperId] ?? [];
  const figures = items.filter((item) => item.kind === "figure").length;
  return { figures, tables: items.length - figures };
}
`;

fs.writeFileSync(OUT, header + body + ";\n" + footer, "utf8");

const total = Object.keys(data).length;
const figTotal = Object.values(data).reduce(
  (a, list) => a + list.filter((i) => i.kind === "figure").length,
  0,
);
const tabTotal = Object.values(data).reduce(
  (a, list) => a + list.filter((i) => i.kind === "table").length,
  0,
);
console.log(`已生成 ${path.relative(ROOT, OUT)}：${total} 篇 / 图 ${figTotal} / 表 ${tabTotal}`);
