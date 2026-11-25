import type { Paper } from "../data/types";
import { toEnglishQuery } from "./query";

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

// OpenAlex 的「polite pool」：带上联系方式后限流阈值高得多。
// 不带的话，国内家宽/校园网的共享出口 IP 很容易被直接 429。
const MAILTO = "ninety.seconds@outlook.com";

export type SearchFailReason = "rate-limit" | "network" | "server";

export class SearchError extends Error {
  reason: SearchFailReason;
  status?: number;
  attempts: number;

  constructor(reason: SearchFailReason, message: string, attempts: number, status?: number) {
    super(message);
    this.name = "SearchError";
    this.reason = reason;
    this.attempts = attempts;
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * OpenAlex JSON 请求：429 / 5xx / 超时自动退避重试（0.7s → 1.4s）。
 * 三次都失败才抛错，并带上失败原因，方便界面说清楚到底卡在哪。
 */
async function openAlexJson(url: string, timeoutMs: number, attempts = 3): Promise<unknown> {
  let last: SearchError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (attempt > 1) await sleep(700 * 2 ** (attempt - 2) + Math.random() * 250);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) return await response.json();

      if (response.status === 429 || response.status >= 500) {
        last = new SearchError("rate-limit", `OpenAlex 返回 HTTP ${response.status}`, attempt, response.status);
        continue;
      }

      throw new SearchError("server", `OpenAlex 返回 HTTP ${response.status}`, attempt, response.status);
    } catch (error) {
      if (error instanceof SearchError) {
        // 4xx（非 429）没必要重试
        if (error.reason === "server") throw error;
        continue;
      }
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      last = new SearchError(
        "network",
        timedOut ? "请求 OpenAlex 超时" : "网络没连上 api.openalex.org",
        attempt,
      );
    }
  }

  throw last ?? new SearchError("network", "检索没连上", attempts);
}

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

export async function searchPapers(query: string): Promise<SearchOutcome> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=8&mailto=${MAILTO}`;
  try {
    const payload = (await openAlexJson(url, 9000)) as { results?: OpenAlexWork[] };
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
const ABSTRACT_LIMIT = 4000;

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
  // 中文关键词先换成英文术语，否则 arXiv 收录里基本搜不到东西
  const { query: remoteQuery } = toEnglishQuery(query);

  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", remoteQuery);
  url.searchParams.set("filter", `primary_location.source.id:${ARXIV_SOURCE_ID}`);
  url.searchParams.set("per-page", String(Math.min(Math.max(want, 1), 100)));
  url.searchParams.set("mailto", MAILTO);

  const payload = (await openAlexJson(url.toString(), 15000)) as { results?: OpenAlexWork[] };
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
  try {
    const work = (await openAlexJson(
      `https://api.openalex.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`,
      12000,
      2,
    )) as OpenAlexWork;
    return toPaper(work, id);
  } catch {
    return null;
  }
}
