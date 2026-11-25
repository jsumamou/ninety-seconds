import {
  AiError,
  buildCoursePrompt,
  buildRetryPrompt,
  callModel,
  callModelWithProgress,
  callQcaTest,
  createCourseStart,
  describeChannel,
  extractJson,
  getChannel,
  languageIssues,
  peekSession,
  pollCourseSession,
  postRetryMessage,
  probeModel,
  validateCourse,
  type ValidatedCourse,
} from "./ai-course.ts";
import { LOCAL_PAPERS } from "./paper-meta.ts";

type TopicId =
  | "foundation"
  | "efficient"
  | "generative"
  | "retrieval"
  | "reasoning";

interface Paper {
  id: string;
  title: string;
  titleZh: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
  abstractZh: string;
  topics: TopicId[];
  addedAt: string;
  status: "queued";
  sourceUrl: string;
}

const ARXIV_ID = /^(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})$/;

const TOPIC_RULES: { id: TopicId; terms: string[] }[] = [
  {
    id: "reasoning",
    terms: [
      "chain-of-thought",
      "chain of thought",
      "reasoning",
      "reasoner",
      "self-consistency",
      "agent",
      "tool use",
      "react",
      "planning",
    ],
  },
  {
    id: "retrieval",
    terms: [
      "retrieval",
      "retriever",
      "rag",
      "passage",
      "open-domain",
      "question answering",
      "dense retrieval",
      "knowledge base",
      "vector search",
    ],
  },
  {
    id: "efficient",
    terms: [
      "lora",
      "low-rank",
      "fine-tun",
      "quantization",
      "quantized",
      "distillation",
      "pruning",
      "memory-efficient",
      "flashattention",
      "adapter",
    ],
  },
  {
    id: "generative",
    terms: [
      "diffusion",
      "generative",
      "image synthesis",
      "text-to-image",
      "denoising",
      "gan",
      "adversarial",
      "autoencoder",
      "video generation",
    ],
  },
  {
    id: "foundation",
    terms: [
      "language model",
      "transformer",
      "pre-train",
      "pretrain",
      "scaling",
      "large language",
      "gpt",
      "llm",
      "attention",
    ],
  },
];

const cache = new Map<string, { at: number; paper: Paper }>();
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_LIMIT = 200;

const COURSE_TTL = 60 * 60 * 1000;
const COURSE_LIMIT = 200;
const courseCache = new Map<string, { at: number; course: ValidatedCourse; model: string }>();
const courseIndex = new Map<string, string>();

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=1800",
};

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function clean(value: string): string {
  return decodeXml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function firstTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? clean(match[1]) : "";
}

function classify(title: string, abstract: string): TopicId[] {
  const haystack = `${title} ${abstract}`.toLowerCase();
  const scored = TOPIC_RULES.map((rule) => {
    let score = 0;
    for (const term of rule.terms) {
      if (title.toLowerCase().includes(term)) score += 3;
      if (haystack.includes(term)) score += 1;
    }
    return { id: rule.id, score };
  }).sort((a, b) => b.score - a.score);

  const primary = scored[0].score > 0 ? scored[0].id : "foundation";
  const topics: TopicId[] = [primary];
  const secondary = scored[1];
  if (secondary && secondary.score >= 4 && secondary.id !== primary) {
    topics.push(secondary.id);
  }
  return topics;
}

async function fetchArxiv(id: string): Promise<Paper | null> {
  // 库内 15 篇优先用本地元数据：不依赖 arXiv 接口可用性，生成链路不被外部网络卡住。
  const local = LOCAL_PAPERS[id];
  if (local) {
    return {
      id: local.id,
      title: local.title,
      titleZh: local.titleZh,
      authors: local.authors,
      year: local.year,
      venue: local.venue,
      abstract: local.abstract,
      abstractZh: local.abstractZh,
      topics: local.topics as TopicId[],
      addedAt: new Date().toISOString().slice(0, 10),
      status: "queued",
      sourceUrl: local.sourceUrl,
    };
  }

  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("id_list", id);
  url.searchParams.set("max_results", "1");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Jiushimiao/0.1 (learning project; arXiv metadata only)",
      Accept: "application/atom+xml",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;

  const xml = await response.text();
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryMatch) return null;
  const entry = entryMatch[1];

  const rawId = firstTag(entry, "id");
  const matchedId = rawId.match(/abs\/(.+?)(v\d+)?$/);
  const resolvedId = matchedId ? matchedId[1] : id;
  const title = firstTag(entry, "title");
  if (!title) return null;

  const abstract = firstTag(entry, "summary");
  const authors = Array.from(entry.matchAll(/<author>([\s\S]*?)<\/author>/g))
    .map((match) => firstTag(match[1], "name"))
    .filter(Boolean)
    .slice(0, 16);
  const published = firstTag(entry, "published");
  const year = published ? Number(published.slice(0, 4)) || new Date().getFullYear() : new Date().getFullYear();
  const topics = classify(title, abstract);

  return {
    id: resolvedId,
    title,
    titleZh: title,
    authors: authors.length > 0 ? authors : ["arXiv"],
    year,
    venue: "arXiv preprint",
    abstract,
    abstractZh: abstract,
    topics,
    addedAt: new Date().toISOString().slice(0, 10),
    status: "queued",
    sourceUrl: `https://arxiv.org/abs/${resolvedId}`,
  };
}

// —— 英文关键词检索：一次取 arXiv 最相关的 30 篇元数据（不触发生成，不做抓取） ——
const searchCache = new Map<string, { at: number; papers: Paper[] }>();
const SEARCH_TTL = 30 * 60 * 1000;
const SEARCH_CACHE_LIMIT = 60;
let lastArxivSearchAt = 0;

function normalizeSearchTokens(raw: string): string[] {
  return raw
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-z0-9\-'.]/g, ""))
    .filter((token) => token.length > 0 && /^[A-Za-z0-9]/.test(token))
    .slice(0, 8);
}

async function searchArxiv(tokens: string[]): Promise<Paper[]> {
  // arXiv 建议请求间隔 3 秒；同实例内做最小间隔，缓存命中则完全不发请求
  const wait = lastArxivSearchAt + 3000 - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastArxivSearchAt = Date.now();

  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", tokens.map((token) => `all:${token}`).join(" AND "));
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", "30");
  url.searchParams.set("sortBy", "relevance");
  url.searchParams.set("sortOrder", "descending");

  // arXiv 对突发请求会临时拒绝或超时；退避一次再试，仍失败才算不可用
  let response: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const candidate = await fetch(url, {
        headers: {
          "User-Agent": "Jiushimiao/0.1 (learning project; arXiv metadata only)",
          Accept: "application/atom+xml",
        },
        signal: AbortSignal.timeout(25000),
      });
      if (candidate.ok) {
        response = candidate;
        break;
      }
      if (attempt === 1) throw new Error(`arxiv ${candidate.status}`);
    } catch (error) {
      if (attempt === 1) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  if (!response) throw new Error("arxiv unreachable");

  const xml = await response.text();
  const papers: Paper[] = [];
  const seen = new Set<string>();
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    const rawId = firstTag(entry, "id");
    const idMatch = rawId.match(/abs\/(.+?)(v\d+)?$/);
    if (!idMatch) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    const title = firstTag(entry, "title");
    if (!title) continue;
    seen.add(id);
    const abstract = firstTag(entry, "summary");
    const authors = Array.from(entry.matchAll(/<author>([\s\S]*?)<\/author>/g))
      .map((item) => firstTag(item[1], "name"))
      .filter(Boolean)
      .slice(0, 16);
    const published = firstTag(entry, "published");
    const year = published
      ? Number(published.slice(0, 4)) || new Date().getFullYear()
      : new Date().getFullYear();
    const journalRef = firstTag(entry, "arxiv:journal_ref");
    papers.push({
      id,
      title,
      titleZh: title,
      authors: authors.length > 0 ? authors : ["arXiv"],
      year,
      venue: journalRef || "arXiv preprint",
      abstract,
      abstractZh: abstract,
      topics: classify(title, abstract),
      addedAt: new Date().toISOString().slice(0, 10),
      status: "queued",
      sourceUrl: `https://arxiv.org/abs/${id}`,
    });
  }
  return papers;
}

async function generateCourse(
  id: string,
  tone: "standard" | "grandma" = "standard",
): Promise<{ course: ValidatedCourse; model: string }> {
  const paper = await fetchArxiv(id);
  if (!paper) throw new AiError("paper_not_found", 404, "arXiv 上没有找到这个编号。");

  const base = buildCoursePrompt(paper, tone);
  let attempt = await callModel(base);
  let parsed = extractJson(attempt.text);
  let check = parsed
    ? validateCourse(parsed, id)
    : { errors: ["输出不是合法 JSON 对象"] };
  let issues = check.course ? languageIssues(check.course) : [];

  for (let retry = 0; retry < 4 && (!check.course || issues.length > 0); retry++) {
    const problems = issues.length > 0 ? issues : check.errors;
    try {
      attempt = await callModel(buildRetryPrompt(base, problems, attempt.text));
      parsed = extractJson(attempt.text);
      check = parsed
        ? validateCourse(parsed, id)
        : { errors: ["输出不是合法 JSON 对象"] };
      issues = check.course ? languageIssues(check.course) : [];
    } catch {
      break;
    }
  }

  if (!check.course || issues.length > 0) {
    throw new AiError("llm_output_invalid", 502, "模型输出未通过校验，请重试一次。");
  }
  return { course: check.course, model: attempt.model };
}

function readCachedCourse(
  id: string,
  tone: "standard" | "grandma",
): { course: ValidatedCourse; model: string } | null {
  const indexKey = `${tone}:${id}`;
  const key = courseIndex.get(indexKey);
  if (!key) return null;
  const hit = courseCache.get(key);
  if (!hit) {
    courseIndex.delete(indexKey);
    return null;
  }
  if (Date.now() - hit.at >= COURSE_TTL) {
    courseCache.delete(key);
    courseIndex.delete(indexKey);
    return null;
  }
  return { course: hit.course, model: hit.model };
}

function writeCachedCourse(
  id: string,
  course: ValidatedCourse,
  model: string,
  tone: "standard" | "grandma",
) {
  const key = `${model}:${id}:${tone}:v1`;
  if (courseCache.size >= COURSE_LIMIT) {
    const oldest = courseCache.keys().next().value;
    if (oldest) courseCache.delete(oldest);
  }
  courseCache.set(key, { at: Date.now(), course, model });
  courseIndex.set(`${tone}:${id}`, key);
}

// —— 每 IP 限流：只统计「新生成」的开始，缓存命中与 resume 轮询不计数 ——
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_STARTS = 6;
const RATE_BUCKET_LIMIT = 500;
const rateBuckets = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (request.headers.get("x-real-ip") ?? "unknown").trim();
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX_STARTS) {
    const oldest = hits[0] ?? now;
    rateBuckets.set(ip, hits);
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000)),
    };
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  if (rateBuckets.size > RATE_BUCKET_LIMIT) {
    for (const [key, stamps] of rateBuckets) {
      if (!stamps.some((t) => now - t < RATE_WINDOW_MS)) rateBuckets.delete(key);
    }
  }
  return { allowed: true, retryAfter: 0 };
}

function envPresent(name: string): "set" | "unset" {
  try {
    return Deno.env.get(name)?.trim() ? "set" : "unset";
  } catch {
    return "unset";
  }
}

async function arxivReachable(): Promise<"reachable" | "unreachable"> {
  try {
    await fetch("https://export.arxiv.org/api/query", {
      headers: {
        Range: "bytes=0-0",
        "User-Agent": "Jiushimiao/0.1 (diag probe; arXiv metadata only)",
      },
      signal: AbortSignal.timeout(5000),
    });
    return "reachable";
  } catch {
    return "unreachable";
  }
}

export async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "method_not_allowed" },
      { status: 405, headers: { ...jsonHeaders, Allow: "GET" } },
    );
  }

  const action = url.searchParams.get("action") ?? "health";
  if (action === "health") {
    return Response.json({ ok: true, service: "jiushimiao", source: "arxiv" }, { headers: jsonHeaders });
  }

  if (action === "diag") {
    try {
      const [channelInfo, arxiv] = await Promise.all([describeChannel(), arxivReachable()]);
      return Response.json(
        {
          ok: true,
          runtime: typeof Deno !== "undefined" ? "deno" : "node",
          path: url.pathname,
          env: {
            LLM_BASE_URL: envPresent("LLM_BASE_URL"),
            LLM_API_KEY: envPresent("LLM_API_KEY"),
            LLM_MODEL: envPresent("LLM_MODEL"),
            QODER_PAT: envPresent("QODER_PAT"),
          },
          channel: channelInfo.channel,
          models: channelInfo.channel === "qca" ? channelInfo.models : [],
          arxiv,
        },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    } catch (error) {
      return Response.json(
        { ok: true, error: error instanceof Error ? error.message : "diag 执行异常" },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    }
  }

  if (action === "probe") {
    const result = await probeModel();
    return Response.json(result, { headers: { ...jsonHeaders, "Cache-Control": "no-store" } });
  }

  if (action === "slowtest") {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        for (let i = 1; i <= 18; i++) {
          controller.enqueue(encoder.encode(`tick ${i} ${new Date().toISOString()}\n`));
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (action === "streamtest") {
    const modelOverride = (url.searchParams.get("model") ?? "").trim();
    const paperId = (url.searchParams.get("id") ?? "").trim();
    const isPing = url.searchParams.get("ping") !== null;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (line: string) => {
          try {
            controller.enqueue(encoder.encode(`${line}\n`));
          } catch {
            // 客户端断开后忽略
          }
        };
        const heartbeat = setInterval(() => {
          send(`HB ${new Date().toISOString()}`);
        }, 5000);
        try {
          let prompt: string;
          if (isPing) {
            prompt = "只回答 OK 两个字母。\nping";
          } else {
            const paper = await fetchArxiv(paperId || "2006.11239");
            if (!paper) {
              send("ERR paper_not_found");
              return;
            }
            prompt = buildCoursePrompt(paper);
          }
          send(`BEGIN ${new Date().toISOString()} ping=${isPing} model=${modelOverride || "default"}`);
          const relay = (info: Record<string, unknown>) => send(`FRAME ${JSON.stringify(info)}`);
          let text: string;
          if (modelOverride) {
            text = await callQcaTest(prompt, modelOverride, (info) => send(`PROG ${JSON.stringify(info)}`), relay);
          } else {
            const result = await callModelWithProgress(prompt, (info) => send(`PROG ${JSON.stringify(info)}`), relay);
            text = result.text;
          }
          send(`DONE len=${text.length} at=${new Date().toISOString()}`);
          send(`JSON_OK ${extractJson(text) ? "yes" : "no"}`);
        } catch (error) {
          send(`ERR ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch {
            // 已关闭则忽略
          }
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (action === "gentest") {
    const modelOverride = (url.searchParams.get("model") ?? "").trim();
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (line: string) => {
          try {
            controller.enqueue(encoder.encode(`${line}\n`));
          } catch {
            // 客户端断开后忽略
          }
        };
        try {
          const paper = await fetchArxiv("2006.11239");
          if (!paper) {
            send("ERR paper_not_found");
            controller.close();
            return;
          }
          send(`BEGIN ${new Date().toISOString()} model=${modelOverride || "default"}`);
          const prompt = buildCoursePrompt(paper);
          if (modelOverride) {
            const text = await callQcaTest(prompt, modelOverride, (info) =>
              send(`PROG ${JSON.stringify(info)}`),
            );
            send(`DONE model=${modelOverride} len=${text.length} at=${new Date().toISOString()}`);
            send(`JSON_OK ${extractJson(text) ? "yes" : "no"}`);
          } else {
            const result = await callModelWithProgress(prompt, (info) =>
              send(`PROG ${JSON.stringify(info)}`),
            );
            send(`DONE model=${result.model} len=${result.text.length} at=${new Date().toISOString()}`);
            send(`JSON_OK ${extractJson(result.text) ? "yes" : "no"}`);
          }
        } catch (error) {
          send(`ERR ${error instanceof Error ? error.message : String(error)}`);
        }
        try {
          controller.close();
        } catch {
          // 已关闭则忽略
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (action === "peek") {
    const sessionId = (url.searchParams.get("session") ?? "").trim();
    if (!/^sess_[A-Za-z0-9_-]+$/.test(sessionId)) {
      return Response.json(
        { ok: false, error: "invalid_session" },
        { status: 400, headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    }
    try {
      const peeked = await peekSession(sessionId);
      return Response.json(
        { ok: true, ...peeked },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    } catch (error) {
      return Response.json(
        { ok: false, error: error instanceof Error ? error.message : "peek 执行异常" },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    }
  }

  if (action === "course") {
    const courseId = (url.searchParams.get("id") ?? "").trim().replace(/v\d+$/, "");
    if (!ARXIV_ID.test(courseId)) {
      return Response.json(
        { ok: false, error: "invalid_id", message: "只支持 arXiv 编号，例如 1706.03762。" },
        { status: 400, headers: jsonHeaders },
      );
    }

    const toneRaw = (url.searchParams.get("tone") ?? "standard").trim();
    const tone = toneRaw === "grandma" ? "grandma" : "standard";

    const cachedCourse = readCachedCourse(courseId, tone);
    if (cachedCourse) {
      return Response.json(
        { ok: true, course: cachedCourse.course, cached: true, model: cachedCourse.model },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    }

    const resume = (url.searchParams.get("resume") ?? "").trim();
    if (!resume) {
      const limited = checkRateLimit(clientIp(request));
      if (!limited.allowed) {
        return Response.json(
          {
            ok: false,
            error: "rate_limited",
            message: `生成请求太频繁，请约 ${Math.ceil(limited.retryAfter / 60)} 分钟后再试。`,
          },
          {
            status: 429,
            headers: {
              ...jsonHeaders,
              "Cache-Control": "no-store",
              "Retry-After": String(limited.retryAfter),
            },
          },
        );
      }
    }
    try {
      if (resume) {
        if (!/^sess_[A-Za-z0-9_-]+$/.test(resume)) {
          return Response.json(
            { ok: false, error: "invalid_resume", message: "恢复会话编号无效。" },
            { status: 400, headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
          );
        }
        const polled = await pollCourseSession(resume, 35_000);
        let text = polled.text;
        if (text === null && !polled.ended) {
          return Response.json(
            { ok: true, pending: true, sessionId: resume },
            { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
          );
        }
        if (text === null) {
          throw new AiError("llm_upstream_error", 502, "模型没有返回内容，请重试。");
        }
        let parsed = extractJson(text);
        let check = parsed
          ? validateCourse(parsed, courseId)
          : { errors: ["输出不是合法 JSON 对象"] };
        let issues = check.course ? languageIssues(check.course) : [];
        if ((!check.course || issues.length > 0) && polled.userMessages < 6) {
          const paper = await fetchArxiv(courseId);
          if (paper) {
            try {
              await postRetryMessage(
                resume,
                buildRetryPrompt(
                  buildCoursePrompt(paper, tone),
                  issues.length > 0 ? issues : check.errors,
                  text,
                ),
              );
              return Response.json(
                { ok: true, pending: true, sessionId: resume },
                { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
              );
            } catch {
              // 重试消息没发出去，下面按输出未通过校验处理
            }
          }
        }
        if (!check.course || issues.length > 0) {
          throw new AiError("llm_output_invalid", 502, "模型输出未通过校验，请重试一次。");
        }
        writeCachedCourse(courseId, check.course, "qca", tone);
        return Response.json(
          { ok: true, course: check.course, cached: false, model: "qca" },
          { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
        );
      }

      const channel = await getChannel();
      if (channel.kind === "openai") {
        const result = await generateCourse(courseId, tone);
        writeCachedCourse(courseId, result.course, result.model, tone);
        return Response.json(
          { ok: true, course: result.course, cached: false, model: result.model },
          { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
        );
      }

      const paper = await fetchArxiv(courseId);
      if (!paper) throw new AiError("paper_not_found", 404, "arXiv 上没有找到这个编号。");
      const start = await createCourseStart(buildCoursePrompt(paper, tone));
      return Response.json(
        { ok: true, pending: true, sessionId: start.sessionId, model: start.model },
        { headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    } catch (error) {
      if (error instanceof AiError) {
        return Response.json(
          { ok: false, error: error.code, message: error.message },
          { status: error.status, headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
        );
      }
      return Response.json(
        { ok: false, error: "llm_upstream_error", message: "生成失败，请稍后重试。" },
        { status: 502, headers: { ...jsonHeaders, "Cache-Control": "no-store" } },
      );
    }
  }

  if (action === "search") {
    const raw = (url.searchParams.get("q") ?? "").trim();
    if (!raw) {
      return Response.json(
        { ok: false, error: "empty_query", message: "请输入英文关键词，例如 retrieval augmented generation。" },
        { status: 400, headers: jsonHeaders },
      );
    }
    if (/[\u4e00-\u9fff]/.test(raw)) {
      return Response.json(
        { ok: false, error: "non_english", message: "英文检索只收英文关键词；中文主题请用首页的「按主题检索」。" },
        { status: 400, headers: jsonHeaders },
      );
    }
    if (raw.length > 120) {
      return Response.json(
        { ok: false, error: "query_too_long", message: "关键词太长，请缩到 120 个字符以内。" },
        { status: 400, headers: jsonHeaders },
      );
    }
    const tokens = normalizeSearchTokens(raw);
    if (tokens.length === 0) {
      return Response.json(
        { ok: false, error: "no_tokens", message: "关键词里没有可用的英文词。" },
        { status: 400, headers: jsonHeaders },
      );
    }

    const key = tokens.join(" ").toLowerCase();
    const hit = searchCache.get(key);
    if (hit && Date.now() - hit.at < SEARCH_TTL) {
      return Response.json(
        { ok: true, query: raw, count: hit.papers.length, papers: hit.papers, cached: true },
        { headers: { ...jsonHeaders, "Cache-Control": "public, max-age=600" } },
      );
    }

    try {
      const papers = await searchArxiv(tokens);
      if (searchCache.size >= SEARCH_CACHE_LIMIT) {
        const oldest = searchCache.keys().next().value;
        if (oldest) searchCache.delete(oldest);
      }
      searchCache.set(key, { at: Date.now(), papers });
      return Response.json(
        { ok: true, query: raw, count: papers.length, papers, cached: false },
        { headers: { ...jsonHeaders, "Cache-Control": "public, max-age=600" } },
      );
    } catch {
      return Response.json(
        { ok: false, error: "search_failed", message: "arXiv 检索暂时不可用，请稍后再试。" },
        { status: 502, headers: jsonHeaders },
      );
    }
  }

  if (action !== "paper") {
    return Response.json({ ok: false, error: "unknown_action" }, { status: 400, headers: jsonHeaders });
  }

  const id = (url.searchParams.get("id") ?? "").trim().replace(/v\d+$/, "");
  if (!ARXIV_ID.test(id)) {
    return Response.json(
      { ok: false, error: "invalid_id", message: "只支持 arXiv 编号，例如 1706.03762。" },
      { status: 400, headers: jsonHeaders },
    );
  }

  const cached = cache.get(id);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return Response.json({ ok: true, paper: cached.paper, cached: true }, { headers: jsonHeaders });
  }

  try {
    const paper = await fetchArxiv(id);
    if (!paper) {
      return Response.json(
        { ok: false, error: "not_found", message: "arXiv 上没有找到这个编号。" },
        { status: 404, headers: jsonHeaders },
      );
    }
    if (cache.size >= CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(id, { at: Date.now(), paper });
    return Response.json({ ok: true, paper }, { headers: jsonHeaders });
  } catch {
    return Response.json(
      { ok: false, error: "upstream_unavailable", message: "暂时连不上 arXiv，请稍后再试。" },
      { status: 502, headers: jsonHeaders },
    );
  }
}