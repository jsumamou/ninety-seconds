import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");
const FIG_DIR = join(ROOT, "public", "figures");
const TABLE_DIR = join(ROOT, "public", "tables");

const PAPERS = [
  { id: "1706.03762", label: "Transformer" },
  { id: "2005.14165", label: "GPT-3" },
  { id: "2001.08361", label: "Scaling Laws" },
  { id: "2106.09685", label: "LoRA" },
  { id: "2305.14314", label: "QLoRA" },
  { id: "2205.14135", label: "FlashAttention" },
  { id: "2006.11239", label: "DDPM" },
  { id: "2112.10752", label: "Latent Diffusion" },
  { id: "1406.2661", label: "GAN" },
  { id: "2005.11401", label: "RAG" },
  { id: "2004.04906", label: "DPR" },
  { id: "2002.08909", label: "REALM" },
  { id: "2201.11903", label: "CoT" },
  { id: "2210.03629", label: "ReAct" },
  { id: "2203.11171", label: "Self-Consistency" },
];

// 每篇最多保留的图表条数（多图拼版算 1 条），避免静态资源过大
const MAX_FIGURE_ITEMS = 5;
const MAX_TABLE_ITEMS = 4;


async function fetchWithRetry(url, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(60000) });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)));
  }
  throw lastError;
}

function sanitizeSvg(svg, symbolsMap) {
  let out = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  if (!/<svg[^>]*\sxmlns=/.test(out)) {
    out = out.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (/xlink:href=/.test(out) && !/xmlns:xlink=/.test(out)) {
    out = out.replace(/<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  out = out.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, "");
  out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  out = out.replace(/<(embed|base|meta|link)\b[^>]*>/gi, "");
  if (/<math\b/.test(out)) {
    if (!/xmlns:math=/.test(out)) {
      out = out.replace(/<svg/, '<svg xmlns:math="http://www.w3.org/1998/Math/MathML"');
    }
    out = out.replace(/<math\b/g, '<math xmlns="http://www.w3.org/1998/Math/MathML"');
  }
  const needed = new Set();
  const collect = (fragment) => {
    const refs = [...fragment.matchAll(/(?:href|xlink:href)="?#([A-Za-z0-9_.-]+)"?/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (needed.has(ref)) continue;
      needed.add(ref);
      if (symbolsMap.has(ref)) collect(symbolsMap.get(ref));
    }
  };
  collect(out);
  const defs = [...needed].map((id) => symbolsMap.get(id)).filter(Boolean).join("\n");
  if (defs) out = out.replace(/<\/svg>/i, `<defs>${defs}</defs></svg>`);
  return out;
}

async function fetchHtml(id) {
  const url = `https://arxiv.org/html/${id}`;
  const response = await fetchWithRetry(url);
  const html = await response.text();
  return { finalUrl: response.url, html };
}

function stripTagsForCaption(raw) {
  let text = raw.replace(/<math[^>]*alttext="([^"]*)"[\s\S]*?<\/math>/gi, " $1 ");
  text = text.replace(/<math[\s\S]*?<\/math>/gi, (block) => {
    const items = [...block.matchAll(/<mi[^>]*>([^<]*)<\/mi>/gi)].map((m) => m[1].trim());
    return items.length > 0 ? ` ${items.join(" ")} ` : " ";
  });
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeTable(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/<a\b[^>]*>/gi, "<span>")
    .replace(/<\/a>/gi, "</span>");
}

async function downloadFile(src, finalUrl, outPath, svgSanitize = false) {
  const attempt = async (url) => {
    const response = await fetchWithRetry(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (svgSanitize) {
      const text = buffer.toString("utf8");
      const cleaned = sanitizeSvg(text, new Map());
      if (cleaned && cleaned.includes("<svg")) {
        writeFileSync(outPath, cleaned, "utf8");
        return true;
      }
      return false;
    }
    writeFileSync(outPath, buffer);
    return true;
  };
  try {
    return await attempt(new URL(src, finalUrl).href);
  } catch {
    const versionMatch = src.match(/^(\d{4}\.\d{5,}v\d+)\//);
    if (versionMatch) {
      const alt = `https://arxiv.org/html/${versionMatch[1]}/${src.slice(versionMatch[0].length)}`;
      try {
        return await attempt(alt);
      } catch {
        return false;
      }
    }
    return false;
  }
}

function isMainBody(id) {
  return /^S\d+\.(F|T)/.test(id) || /^Sx\d+\.F/.test(id);
}

function ownFigureRegion(html, at) {
  let depth = 0;
  let cursor = at;
  while (cursor < html.length) {
    const nextOpen = html.indexOf("<figure", cursor);
    const nextClose = html.indexOf("</figure>", cursor);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 7;
    } else {
      depth -= 1;
      cursor = nextClose + 9;
      if (depth === 0) return { html: html.slice(at, cursor), end: cursor };
    }
  }
  return null;
}

const inventory = [];

for (const paper of PAPERS) {
  const { finalUrl, html } = await fetchHtml(paper.id);
  const symbolsMap = new Map();
  for (const match of html.matchAll(/<symbol[^>]*id="([A-Za-z0-9_.-]+)"[\s\S]*?<\/symbol>/gi)) {
    symbolsMap.set(match[1], match[0]);
  }
  const idPositions = [...html.matchAll(/<figure[^>]*id="([^"]+)"/g)].map((m) => ({
    id: m[1],
    at: m.index,
  }));
  const items = [];
  let figureItems = 0;
  let tableItems = 0;
  for (const { id, at } of idPositions) {
    if (!isMainBody(id)) continue;
    const regionInfo = ownFigureRegion(html, at);
    if (!regionInfo) continue;
    const region = regionInfo.html;
    const nestedIds = [...region.matchAll(/<figure[^>]*id="([^"]+)"/g)].map((m) => m[1]);
    if (nestedIds.length > 1) continue;
    const captionMatch = region.match(/<figcaption[\s\S]*?<\/figcaption>/i);
    const tableMatch = region.match(/<table[\s\S]*?<\/table>/i);
    const imgs = [...region.matchAll(/<img[^>]*src="([^"]+)"/gi)].map((m) => m[1]);
    const objects = [...region.matchAll(/<object[^>]*data="([^"]+)"/gi)].map((m) => m[1]);
    if (!captionMatch && !tableMatch && imgs.length === 0 && objects.length === 0) continue;
    const kind = tableMatch ? "table" : "figure";
    if (kind === "figure" && figureItems >= MAX_FIGURE_ITEMS) continue;
    if (kind === "table" && tableItems >= MAX_TABLE_ITEMS) continue;
    if (kind === "figure") figureItems += 1;
    else tableItems += 1;

    const item = {
      paperId: paper.id,
      id,
      kind,
      caption: captionMatch ? stripTagsForCaption(captionMatch[0]) : "",
      files: [],
      tableHtml: null,
    };
    if (kind === "table") {
      const tableDir = join(TABLE_DIR, paper.id);
      mkdirSync(tableDir, { recursive: true });
      const file = `table-${id}.html`;
      writeFileSync(join(tableDir, file), sanitizeTable(tableMatch[0]), "utf8");
      item.tableHtml = `tables/${paper.id}/${file}`;
    } else {
      const figDir = join(FIG_DIR, paper.id);
      mkdirSync(figDir, { recursive: true });
      const inlineSvgs = [...region.matchAll(/<svg[\s\S]*?<\/svg>/gi)].map((m) => m[0]);
      if (inlineSvgs.length > 0) {
        for (let j = 0; j < inlineSvgs.length; j += 1) {
          const file = `fig-${id}-${j + 1}.svg`;
          writeFileSync(join(figDir, file), sanitizeSvg(inlineSvgs[j], symbolsMap), "utf8");
          item.files.push(`figures/${paper.id}/${file}`);
        }
      } else {
        const sources = [...objects.map((s) => ({ src: s, ext: "svg" })), ...imgs.map((s) => {
          const lower = s.toLowerCase();
          const ext = lower.endsWith(".png") ? "png" : lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "jpg" : "bin";
          return { src: s, ext };
        })];
        for (let j = 0; j < sources.length; j += 1) {
          const { src, ext } = sources[j];
          const file = `fig-${id}-${j + 1}.${ext}`;
          const ok = await downloadFile(src, finalUrl, join(figDir, file), ext === "svg");
          if (ok) item.files.push(`figures/${paper.id}/${file}`);
          else console.log(`  !! download failed: ${paper.id} ${id} ${src}`);
        }
      }
    }
    items.push(item);
  }
  inventory.push({ paperId: paper.id, label: paper.label, items });
  const figs = items.filter((i) => i.kind === "figure").length;
  const tables = items.filter((i) => i.kind === "table").length;
  console.log(`\n${paper.id} ${paper.label}: ${items.length} items (figs=${figs}, tables=${tables})`);
  for (const item of items) {
    console.log(`  ${item.id} [${item.kind}] ${item.caption.slice(0, 66)}${item.files.length ? ` files=${item.files.length}` : ""}`);
  }
}

writeFileSync(join(ROOT, "scripts", "figures-inventory.json"), JSON.stringify(inventory, null, 2), "utf8");
console.log("\ninventory written to scripts/figures-inventory.json");
