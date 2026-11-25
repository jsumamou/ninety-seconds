import type { Paper } from "../data/types";

export interface SearchHit {
  title: string;
  doi: string | null;
  year: number | null;
  firstAuthor: string | null;
  citedBy: number;
  arxivId: string | null;
  arxivIds: string[];
}

export type SearchOutcome = { ok: true; hits: SearchHit[] } | { ok: false; error: string };

interface OpenAlexLocation {
  landing_page_url?: string | null;
  pdf_url?: string | null;
}

interface OpenAlexWork {
  title?: string | null;
  doi?: string | null;
  publication_year?: number | null;
  cited_by_count?: number | null;
  authorships?: { author?: { display_name?: string | null } | null }[];
  locations?: OpenAlexLocation[] | null;
  primary_location?: {
    landing_page_url?: string | null;
    source?: { display_name?: string | null } | null;
  } | null;
  abstract_inverted_index?: Record<string, number[]> | null;
}

const ARXIV_IN_URL = /arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(v\d+)?/i;
const ARXIV_IN_DOI = /10\.48550\/arxiv\.(\d{4}\.\d{4,5})(v\d+)?/i;

function versionOf(id: string): number {
  const match = id.match(/v(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function collectArxivIds(work: OpenAlexWork): string[] {
  const ids: string[] = [];
  const add = (candidate: string | null | undefined) => {
    if (!candidate) return;
    const match = candidate.match(ARXIV_IN_URL) ?? candidate.match(ARXIV_IN_DOI);
    if (!match) return;
    const id = `${match[1]}${match[2] ?? ""}`;
    if (!ids.includes(id)) ids.push(id);
  };
  add(work.doi);
  for (const location of work.locations ?? []) {
    add(location.landing_page_url);
    add(location.pdf_url);
  }
  return ids.sort((a, b) => versionOf(b) - versionOf(a));
}

export async function searchPapers(query: string): Promise<SearchOutcome> {  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=8`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as { results?: OpenAlexWork[] };
    const works = Array.isArray(payload.results) ? payload.results : [];
    const hits: SearchHit[] = works.map((work) => {
      const arxivIds = collectArxivIds(work);
      return {
        title: work.title ?? "（无标题）",
        doi: work.doi ?? null,
        year: work.publication_year ?? null,
        firstAuthor: work.authorships?.[0]?.author?.display_name ?? null,
        citedBy: work.cited_by_count ?? 0,
        arxivId: arxivIds[0] ?? null,
        arxivIds,
      };
    });
    return { ok: true, hits };
  } catch {
    return { ok: false, error: "检索没连上，请稍后再试。" };
  }
}

// —— 浏览器直连的 arXiv 检索 ——
// arXiv 自己的 API 不带 CORS 头，浏览器拿不到；OpenAlex 带 `Access-Control-Allow-Origin: *`，
// 而且它把 arXiv 作为一个来源（S4306400194）单独收录，所以用 OpenAlex 过滤出 arXiv 论文，
// 就能在没有后端（纯静态部署）的情况下直接在浏览器里检索。

const ARXIV_SOURCE_ID = "S4306400194";
const ABSTRACT_LIMIT = 900;

function abstractFromIndex(index?: Record<string, number[]> | null): string {
  if (!index || typeof index !== "object") return "";
  const slots: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) slots[position] = word;
  }
  return slots.filter((word) => typeof word === "string").join(" ").slice(0, ABSTRACT_LIMIT);
}

function toPaper(work: OpenAlexWork, id: string): Paper | null {
  const title = (work.title ?? "").trim();
  if (!title) return null;
  const abstract = abstractFromIndex(work.abstract_inverted_index);
  const authors = (work.authorships ?? [])
    .map((entry) => entry.author?.display_name ?? "")
    .filter((name) => name.length > 0)
    .slice(0, 10);

  return {
    id,
    title,
    // 外部论文没有中译，标题与摘要先占位成英文，避免卡片出现空行
    titleZh: title,
    authors,
    year: work.publication_year ?? 0,
    venue: work.primary_location?.source?.display_name ?? "arXiv",
    abstract,
    abstractZh: abstract,
    topics: [],
    addedAt: new Date().toISOString(),
    status: "queued",
    sourceUrl: `https://arxiv.org/abs/${id}`,
  };
}

/**
 * 按关键词检索「arXiv 收录」的论文，返回可直接收录进资料库的 Paper[]。
 * 失败时抛错，由调用方决定是否退化为库内检索。
 */
export async function searchArxivPapers(query: string, want = 30): Promise<Paper[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("filter", `primary_location.source.id:${ARXIV_SOURCE_ID}`);
  url.searchParams.set("per-page", String(Math.min(Math.max(want, 1), 100)));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`openalex ${response.status}`);

  const payload = (await response.json()) as { results?: OpenAlexWork[] };
  const works = Array.isArray(payload.results) ? payload.results : [];
  const papers: Paper[] = [];
  const seen = new Set<string>();

  for (const work of works) {
    const id = (collectArxivIds(work)[0] ?? "").replace(/v\d+$/, "");
    if (!id || seen.has(id)) continue;
    const paper = toPaper(work, id);
    if (!paper) continue;
    seen.add(id);
    papers.push(paper);
    if (papers.length >= want) break;
  }

  return papers;
}

/** 按 arXiv 编号从 OpenAlex 取单篇元数据（无需后端；arXiv 官方 API 不带 CORS）。 */
export async function fetchArxivPaper(id: string): Promise<Paper | null> {
  const doi = `https://doi.org/10.48550/arxiv.${id}`;
  const response = await fetch(`https://api.openalex.org/works/${encodeURIComponent(doi)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;
  const work = (await response.json()) as OpenAlexWork;
  return toPaper(work, id);
}
