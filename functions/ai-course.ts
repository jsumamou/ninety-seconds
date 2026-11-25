import { CloudAgentsError, createCloudAgentsClient } from "./cloud-agents.mjs";

const CLOUD_ORIGIN = "https://api.qoder.com.cn";
const AGENT_NAME = "九十秒 · 微课生成器 v2";
const ENV_NAME = "九十秒 · 微课生成环境 v2";
const SCOPE_META = { app: "ninety-seconds", purpose: "course-generator", revision: "v2" } as const;

const COURSE_SYSTEM = `你是「九十秒」的中文技术编辑，把一篇 AI 论文改写成 6 幕、总时长恰好 90 秒的微课。
你只输出一个 JSON 对象，不输出 Markdown、代码围栏或任何解释。
讲解必须是你自己的中文改写，禁止整句照搬论文摘要。
叙述顺序固定为：钩子 → 问题 → 方法一 → 方法二 → 结果 → 一句话带走。
数字纪律：解说和板书里出现的每一个数字，必须能在论文摘要或原文明文找到；找不到就不写数字，改用定性表述，禁止估算和「约」「大概」。
你写的是"讲出来的话"，不是"翻译出来的句子"。额外遵守：
1. 短句优先：一句话不超过 22 个汉字；超过就拆成两句。
2. 少用"进行""实现""通过…的方式"这类书面壳：
   把"通过引入自注意力机制的方式"改成"它加进了一个自注意力机制"。
3. 名词不要堆叠：一句话里连续出现 3 个以上术语时，拆成两句，或删掉次要术语。
4. 一个概念只出现一个英文名：同一场景里 self-attention 不要又写"自注意力"
   又写"自我注意"，定了就统一。
5. 可以用"我们""它""你"这类人称，让句子像对话；但一段里人称最多切换一次。
6. 禁止"众所周知""不难发现""值得注意的是"这类空话开头。`;

const BOARD_KINDS = new Set(["text", "box", "arrow", "circle", "formula", "path"]);
const TEXT_SIZES = new Set([20, 24, 28, 34]);

export class AiError extends Error {
  status: number;
  code: string;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.status = status;
  }
}

interface Channel {
  kind: "qca" | "openai";
  model: string;
}

interface SessionBinding {
  agent: { type: "agent"; id: string; version: number };
  environmentId: string;
}

let channelPromise: Promise<Channel> | null = null;
let bindingPromise: Promise<SessionBinding> | null = null;

function hasEnv(name: string): string {
  try {
    return Deno.env.get(name)?.trim() ?? "";
  } catch {
    return "";
  }
}

async function resolveChannel(): Promise<Channel> {
  const baseUrl = hasEnv("LLM_BASE_URL");
  const apiKey = hasEnv("LLM_API_KEY");
  const model = hasEnv("LLM_MODEL");
  if (baseUrl && apiKey && model) return { kind: "openai", model };

  if (hasEnv("QODER_PAT")) {
    const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
    try {
      const payload = await client.request("/api/v1/cloud/models");
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const enabled = list.filter(
        (item: { id?: unknown; enabled?: unknown }) =>
          item && typeof item.id === "string" && item.enabled !== false,
      );
      if (!enabled) throw new AiError("llm_not_configured", 503, "Qoder 模型列表为空。");
      const picked =
        enabled.find((item: { id: string }) => item.id === "fast") ??
        enabled.find((item: { id: string }) => item.id === "auto") ??
        enabled[0];
      return { kind: "qca", model: picked.id };
    } catch (error) {
      if (error instanceof AiError) throw error;
      throw new AiError("llm_not_configured", 503, "Qoder 模型通道暂不可用。");
    }
  }

  throw new AiError("llm_not_configured", 503, "没有可用的模型通道：请开启站点 Qoder 后端，或配置 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL。");
}

async function ensureBinding(
  client: ReturnType<typeof createCloudAgentsClient>,
  model: string,
  scopeMeta: Record<string, string> = SCOPE_META,
): Promise<SessionBinding> {
  const environments = await client.findResources("environments", scopeMeta);
  let environmentId: string;
  if (environments.length === 1) {
    environmentId = environments[0].id;
  } else if (environments.length > 1) {
    throw new AiError("llm_channel_conflict", 503, "生成环境存在多个候选，已停止以避免误用。");
  } else {
    const created = await client.request("/api/v1/cloud/environments", {
      method: "POST",
      body: { name: ENV_NAME, config: { type: "cloud" }, metadata: scopeMeta },
    });
    environmentId = created?.id;
    if (!/^env_[A-Za-z0-9_-]+$/.test(environmentId ?? "")) {
      throw new AiError("llm_upstream_invalid", 502, "生成环境创建返回异常。");
    }
  }

  const agents = await client.findResources("agents", scopeMeta);
  let agent: SessionBinding["agent"];
  if (agents.length === 1) {
    let version = Number(agents[0].version);
    if (!Number.isInteger(version)) {
      const detail = await client.request(`/api/v1/cloud/agents/${agents[0].id}`);
      version = Number(detail?.version);
    }
    agent = { type: "agent", id: agents[0].id, version };
  } else if (agents.length > 1) {
    throw new AiError("llm_channel_conflict", 503, "生成器存在多个候选，已停止以避免误用。");
  } else {
    const created = await client.request("/api/v1/cloud/agents", {
      method: "POST",
      idempotencyKey: `ninety-seconds-course-agent-${model.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60)}`,
      body: { name: AGENT_NAME, model, system: COURSE_SYSTEM, metadata: scopeMeta },
    });
    agent = { type: "agent", id: created?.id, version: created?.version };
    if (!/^agent_[A-Za-z0-9_-]+$/.test(agent.id ?? "") || !Number.isInteger(agent.version)) {
      throw new AiError("llm_upstream_invalid", 502, "生成器创建返回异常。");
    }
  }
  if (!/^agent_[A-Za-z0-9_-]+$/.test(agent.id ?? "") || !Number.isInteger(agent.version) || agent.version < 1) {
    throw new AiError("llm_upstream_invalid", 502, "生成器信息异常，请稍后重试。");
  }
  return { agent, environmentId };
}

async function* readSSEFrames(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<{ event: string; id: string; data: string }> {
  const reader = body.getReader();
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  const decoder = new TextDecoder();
  let buffer = "";
  let data: string[] = [];
  let event = "";
  let id = "";
  try {
    while (true) {
      if (signal?.aborted) throw new Error("sse_aborted");
      const chunk = await reader.read();
      if (signal?.aborted) throw new Error("sse_aborted");
      buffer += chunk.done ? decoder.decode() : decoder.decode(chunk.value, { stream: true });
      while (true) {
        if (signal?.aborted) throw new Error("sse_aborted");
        const match = /[\r\n]/.exec(buffer);
        if (!match || (!chunk.done && buffer[match.index] === "\r" && match.index === buffer.length - 1)) break;
        const line = buffer.slice(0, match.index);
        const width = buffer[match.index] === "\r" && buffer[match.index + 1] === "\n" ? 2 : 1;
        buffer = buffer.slice(match.index + width);
        if (!line) {
          if (data.length) yield { event: event || "message", id, data: data.join("\n") };
          data = [];
          event = "";
          id = "";
        } else if (!line.startsWith(":")) {
          const colon = line.indexOf(":");
          const field = colon < 0 ? line : line.slice(0, colon);
          let value = colon < 0 ? "" : line.slice(colon + 1);
          if (value.startsWith(" ")) value = value.slice(1);
          if (field === "data") data.push(value);
          else if (field === "event") event = value;
          else if (field === "id" && !value.includes("\0")) id = value;
        }
      }
      if (chunk.done) break;
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

async function pollRested(
  client: ReturnType<typeof createCloudAgentsClient>,
  sessionId: string,
  deadline: number,
  onProgress?: (info: Record<string, unknown>) => void,
): Promise<string> {
  let lastParts: string[] = [];
  let poll = 0;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const payload = await client.request(
      `/api/v1/cloud/sessions/${sessionId}/events?order=asc&limit=100`,
    );
    poll += 1;
    const parts = collectAgentText(payload);
    if (parts.length > 0) {
      lastParts = parts;
      for (const part of parts) {
        if (extractJson(part)) return part;
      }
    }
    onProgress?.({ kind: "poll", poll, parts: parts.length, total: lastParts.join("").length, idle: sessionIdle(payload) });
    if (sessionIdle(payload) && lastParts.length > 0) {
      return lastParts[lastParts.length - 1];
    }
  }
  if (lastParts.length > 0) return lastParts[lastParts.length - 1];
  throw new AiError("llm_timeout", 502, "模型响应超时，请重试。");
}

async function createQcaSession(
  client: ReturnType<typeof createCloudAgentsClient>,
  binding: SessionBinding,
): Promise<string> {
  const session = await client.request("/api/v1/cloud/sessions", {
    method: "POST",
    body: {
      agent: binding.agent,
      environment_id: binding.environmentId,
      title: "九十秒 · 课程生成",
      metadata: { app: "ninety-seconds", purpose: "course-generation" },
    },
  });
  const sessionId: unknown = session?.id;
  if (typeof sessionId !== "string" || !/^sess_[A-Za-z0-9_-]+$/.test(sessionId)) {
    throw new AiError("llm_upstream_invalid", 502, "会话创建返回异常。");
  }
  return sessionId;
}

async function postUserMessage(
  client: ReturnType<typeof createCloudAgentsClient>,
  sessionId: string,
  prompt: string,
): Promise<void> {
  await client.request(`/api/v1/cloud/sessions/${sessionId}/events`, {
    method: "POST",
    body: {
      events: [{ type: "user.message", content: [{ type: "text", text: prompt }] }],
    },
  });
}

async function callQca(
  prompt: string,
  model: string,
  opts: {
    deadlineMs?: number;
    onProgress?: (info: Record<string, unknown>) => void;
    onFrame?: (info: Record<string, unknown>) => void;
    binding?: SessionBinding;
  } = {},
): Promise<string> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  let binding: SessionBinding;
  if (opts.binding) {
    binding = opts.binding;
  } else {
    bindingPromise ??= ensureBinding(client, model).catch((error) => {
      bindingPromise = null;
      throw error;
    });
    binding = await bindingPromise;
  }

  const sessionId = await createQcaSession(client, binding);

  // 网关在 60 秒处掐连接，任何路径都必须在 deadline 前返回
  const deadline = Date.now() + (opts.deadlineMs ?? 50_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, deadline - Date.now()));
  try {
    let stream: { body: ReadableStream<Uint8Array>; close: () => void } | null = null;
    try {
      stream = await client.openStream(sessionId, { signal: controller.signal });
    } catch {
      // SSE 通道不可用时退回 REST 轮询
      clearTimeout(timer);
      await postUserMessage(client, sessionId, prompt);
      return pollRested(client, sessionId, deadline, opts.onProgress);
    }
    try {
      // 先启动读取，再发送消息（平台约定：连接就绪后再发第一条消息）
      const readLoop = (async (): Promise<string> => {
        let draft = "";
        let canonical: string | null = null;
        const startedAt = Date.now();
        try {
          for await (const frame of readSSEFrames(stream.body, controller.signal)) {
            opts.onFrame?.({ event: frame.event, id: frame.id, data: frame.data.slice(0, 300) });
            let event: Record<string, unknown> | null = null;
            try {
              event = JSON.parse(frame.data) as Record<string, unknown>;
            } catch {
              continue;
            }
            if (!event || typeof event !== "object") continue;
            const type = String(event.type ?? "");
            const inner = (event.event ?? {}) as Record<string, unknown>;
            const innerType = String(inner.type ?? "");
            if (type === "event_delta") {
              const delta = (event.delta ?? {}) as Record<string, unknown>;
              const text =
                typeof (delta.content as Record<string, unknown> | undefined)?.text === "string"
                  ? String((delta.content as Record<string, unknown>).text)
                  : typeof delta.text === "string"
                    ? delta.text
                    : "";
              if (text) {
                draft += text;
                const parsed = extractJson(draft);
                opts.onProgress?.({ kind: "sse", draft: draft.length, startedAt: Date.now() - startedAt, hit: parsed ? true : false });
                if (parsed) return draft;
              }
            } else if (type === "agent.message" || innerType === "agent.message") {
              const blocks = Array.isArray(event.content)
                ? event.content
                : Array.isArray(inner.content)
                  ? inner.content
                  : [];
              const parts = blocks
                .filter(
                  (block): block is { type: string; text: string } =>
                    !!block &&
                    typeof block === "object" &&
                    (block as Record<string, unknown>).type === "text" &&
                    typeof (block as Record<string, unknown>).text === "string",
                )
                .map((block) => block.text);
              canonical = parts.join("");
              opts.onProgress?.({ kind: "sse", canonical: canonical.length, startedAt: Date.now() - startedAt, hit: extractJson(canonical) ? true : false });
              if (extractJson(canonical)) return canonical;
            } else if (type === "session.status_idle" || type === "session.status_stopped" || innerType === "session.status_idle" || innerType === "session.status_stopped") {
              if (canonical !== null) return canonical;
              if (draft) return draft;
              throw new AiError("llm_upstream_error", 502, "模型没有返回内容，请重试。");
            } else if (type === "session.status_error" || innerType === "session.status_error") {
              if (canonical !== null) return canonical;
              if (draft) return draft;
              throw new AiError("llm_upstream_error", 502, "模型生成出错，请重试。");
            }
            if (Date.now() >= deadline) break;
          }
        } catch (error) {
          if (error instanceof Error && error.message === "sse_aborted") {
            if (canonical !== null) return canonical;
            if (draft) return draft;
            throw new AiError("llm_timeout", 502, "模型响应超时，请重试。");
          }
          throw error;
        }
        if (canonical !== null) return canonical;
        if (draft) return draft;
        throw new AiError("llm_timeout", 502, "模型响应超时，请重试。");
      })();
      await postUserMessage(client, sessionId, prompt);
      return await readLoop;
    } finally {
      stream.close();
      clearTimeout(timer);
    }
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

function countUserMessages(payload: unknown): number {
  const data = (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) return 0;
  return data.filter(
    (event) => String((event as { type?: unknown })?.type ?? "") === "user.message",
  ).length;
}

function sessionIdle(payload: unknown): boolean {
  const data = (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) return false;
  let lastStatus = "";
  for (const event of data) {
    const type = String((event as { type?: unknown })?.type ?? "");
    if (type.startsWith("session.status_")) lastStatus = type;
  }
  return (
    lastStatus === "session.status_idle" ||
    lastStatus === "session.status_stopped" ||
    lastStatus === "session.status_error"
  );
}

function collectAgentText(payload: unknown): string[] {
  const data = (payload as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  let lastUserIndex = -1;
  data.forEach((event, index) => {
    if (String((event as { type?: unknown })?.type ?? "") === "user.message") {
      lastUserIndex = index;
    }
  });
  const seen = new Set<string>();
  const parts: string[] = [];
  for (let i = lastUserIndex + 1; i < data.length; i++) {
    const event = data[i];
    if (!event || typeof event !== "object") continue;
    const item = event as {
      id?: unknown;
      type?: unknown;
      text?: unknown;
      content?: unknown;
    };
    const type = String(item.type ?? "");
    if (type.includes("user")) continue;
    if (!type.includes("agent.message") && !type.includes("message.delta")) continue;
    const key = typeof item.id === "string" ? item.id : "";
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    if (typeof item.text === "string") {
      parts.push(item.text);
      continue;
    }
    if (Array.isArray(item.content)) {
      for (const block of item.content) {
        if (block && typeof block === "object" && (block as { type?: unknown }).type === "text") {
          const value = (block as { text?: unknown }).text;
          if (typeof value === "string") parts.push(value);
        }
      }
    }
  }
  return parts;
}

async function callOpenAi(prompt: string, model: string, system = COURSE_SYSTEM): Promise<string> {
  const base = hasEnv("LLM_BASE_URL").replace(/\/+$/, "");
  const key = hasEnv("LLM_API_KEY");
  let response: Response;
  try {
    response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new AiError("llm_upstream_unavailable", 502, "模型服务暂不可用，请重试。");
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    if (response.status === 401 || response.status === 403) {
      throw new AiError("llm_access_denied", 502, "模型鉴权失败，请检查站点密钥。");
    }
    throw new AiError("llm_upstream_error", 502, "模型服务返回错误，请重试。");
  }
  const payload = (await response.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AiError("llm_upstream_invalid", 502, "模型返回为空，请重试。");
  }
  return content;
}

export async function callModel(prompt: string): Promise<{ text: string; model: string }> {
  channelPromise ??= resolveChannel().catch((error) => {
    channelPromise = null;
    throw error;
  });
  const channel = await channelPromise;
  try {
    const text =
      channel.kind === "qca"
        ? await callQca(prompt, channel.model)
        : await callOpenAi(prompt, channel.model);
    return { text, model: channel.model };
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof CloudAgentsError) {
      throw new AiError(
        error.code,
        error.status === 401 || error.status === 403 ? 502 : 502,
        error.code === "ai_rate_limited" ? "模型调用频率受限，请稍后再试。" : "模型通道暂不可用，请重试。",
      );
    }
    throw new AiError("llm_upstream_error", 502, "模型调用失败，请重试。");
  }
}

export async function callModelWithProgress(
  prompt: string,
  onProgress: (info: Record<string, unknown>) => void,
  onFrame?: (info: Record<string, unknown>) => void,
): Promise<{ text: string; model: string }> {
  channelPromise ??= resolveChannel().catch((error) => {
    channelPromise = null;
    throw error;
  });
  const channel = await channelPromise;
  try {
    const text =
      channel.kind === "qca"
        ? await callQca(prompt, channel.model, { deadlineMs: 150_000, onProgress, onFrame })
        : await callOpenAi(prompt, channel.model);
    return { text, model: channel.model };
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (error instanceof CloudAgentsError) {
      throw new AiError(
        error.code,
        error.status === 401 || error.status === 403 ? 502 : 502,
        error.code === "ai_rate_limited" ? "模型调用频率受限，请稍后再试。" : "模型通道暂不可用，请重试。",
      );
    }
    throw new AiError("llm_upstream_error", 502, "模型调用失败，请重试。");
  }
}

export async function callQcaTest(
  prompt: string,
  model: string,
  onProgress: (info: Record<string, unknown>) => void,
  onFrame?: (info: Record<string, unknown>) => void,
): Promise<string> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  const scopeMeta = { app: "ninety-seconds", purpose: "course-generator", revision: `test-${model}` };
  const binding = await ensureBinding(client, model, scopeMeta);
  return callQca(prompt, model, { deadlineMs: 150_000, onProgress, onFrame, binding });
}

export async function getChannel(): Promise<Channel> {
  channelPromise ??= resolveChannel().catch((error) => {
    channelPromise = null;
    throw error;
  });
  return channelPromise;
}

export async function createCourseStart(prompt: string): Promise<{ sessionId: string; model: string }> {
  const channel = await getChannel();
  if (channel.kind === "openai") {
    throw new AiError("llm_channel_mismatch", 503, "当前通道不支持异步会话。");
  }
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  bindingPromise ??= ensureBinding(client, channel.model).catch((error) => {
    bindingPromise = null;
    throw error;
  });
  const binding = await bindingPromise;
  const sessionId = await createQcaSession(client, binding);
  await postUserMessage(client, sessionId, prompt);
  return { sessionId, model: channel.model };
}

async function fetchEvents(
  client: ReturnType<typeof createCloudAgentsClient>,
  path: string,
  attempts = 3,
): Promise<unknown> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await client.request(path);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw lastError;
}

export async function pollCourseSession(
  sessionId: string,
  deadlineMs = 50_000,
): Promise<{ text: string | null; ended: boolean; userMessages: number }> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  const deadline = Date.now() + deadlineMs;
  let lastParts: string[] = [];
  let userMessages = 0;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const payload = await fetchEvents(
      client,
      `/api/v1/cloud/sessions/${sessionId}/events?order=asc&limit=100`,
    );
    userMessages = countUserMessages(payload);
    const parts = collectAgentText(payload);
    if (parts.length > 0) lastParts = parts;
    for (const part of parts) {
      if (extractJson(part)) return { text: part, ended: true, userMessages };
    }
    if (sessionIdle(payload)) {
      return {
        text: lastParts.length > 0 ? lastParts[lastParts.length - 1] : null,
        ended: true,
        userMessages,
      };
    }
  }
  return { text: null, ended: false, userMessages };
}

export async function postRetryMessage(sessionId: string, prompt: string): Promise<void> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  await postUserMessage(client, sessionId, prompt);
}

export async function peekSession(sessionId: string): Promise<{ count: number; types: string[]; idle: boolean }> {
  const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
  const payload = await client.request(
    `/api/v1/cloud/sessions/${sessionId}/events?order=asc&limit=100`,
  );
  const data = Array.isArray((payload as { data?: unknown })?.data)
    ? ((payload as { data: unknown[] }).data)
    : [];
  const types = data.map((event) => String((event as { type?: unknown })?.type ?? "?"));
  return {
    count: types.length,
    types: types.slice(-24),
    idle: types.includes("session.status_idle"),
  };
}

export async function describeChannel(): Promise<{
  channel: "openai" | "qca" | "none";
  models: string[];
}> {
  const baseUrl = hasEnv("LLM_BASE_URL");
  const apiKey = hasEnv("LLM_API_KEY");
  const model = hasEnv("LLM_MODEL");
  if (baseUrl && apiKey && model) return { channel: "openai", models: [] };
  if (hasEnv("QODER_PAT")) {
    try {
      const client = createCloudAgentsClient({ origin: CLOUD_ORIGIN });
      const payload = await client.request("/api/v1/cloud/models");
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const models = list
        .filter(
          (item: { id?: unknown; enabled?: unknown }) =>
            item && typeof item.id === "string" && item.enabled !== false,
        )
        .map((item: { id: string }) => item.id);
      return { channel: "qca", models };
    } catch {
      return { channel: "qca", models: [] };
    }
  }
  return { channel: "none", models: [] };
}

export async function probeModel(): Promise<{
  ok: boolean;
  channel: "openai" | "qca" | "none";
  model: string;
  latencyMs: number;
  raw: string;
  error?: string;
}> {
  const started = Date.now();
  let channel: Channel;
  try {
    channel = await resolveChannel();
  } catch (error) {
    return {
      ok: false,
      channel: "none",
      model: "",
      latencyMs: Date.now() - started,
      raw: "",
      error: error instanceof AiError ? error.message : "没有可用的模型通道。",
    };
  }
  try {
    const text =
      channel.kind === "qca"
        ? await callQca("只回答 OK 两个字母。\nping", channel.model)
        : await callOpenAi("ping", channel.model, "只回答 OK 两个字母。");
    return {
      ok: true,
      channel: channel.kind,
      model: channel.model,
      latencyMs: Date.now() - started,
      raw: text.slice(0, 200),
    };
  } catch (error) {
    return {
      ok: false,
      channel: channel.kind,
      model: channel.model,
      latencyMs: Date.now() - started,
      raw: "",
      error: error instanceof AiError ? error.message : "模型调用失败。",
    };
  }
}

export function extractJson(text: string): unknown | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function hanCount(value: string): number {
  return (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

const FORBIDDEN_PHRASES = /进行|通过.{0,8}的方式|众所周知|不难发现|值得注意的是/;

export function languageIssues(course: ValidatedCourse): string[] {
  const issues: string[] = [];
  const scenes = Array.isArray(course.scenes) ? course.scenes : [];
  scenes.forEach((scene, index) => {
    const item = (scene ?? {}) as SceneLike;
    const narration = typeof item.narration === "string" ? item.narration : "";
    const sentences = narration
      .split(/(?<=[。！？；])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    sentences.forEach((sentence, sentenceIndex) => {
      if (hanCount(sentence) > 22) {
        issues.push(
          `scene[${index}].narration 第 ${sentenceIndex + 1} 句 ${hanCount(sentence)} 字，超过 22 字，请拆成两句。`,
        );
      }
      if (FORBIDDEN_PHRASES.test(sentence)) {
        issues.push(
          `scene[${index}].narration 第 ${sentenceIndex + 1} 句含"进行""通过…的方式"等书面壳或空话开头，请改成口语。`,
        );
      }
    });
    const title = typeof item.title === "string" ? item.title : "";
    if (hanCount(title) > 12) {
      issues.push(`scene[${index}].title ${hanCount(title)} 字，超过 12 字，请改短。`);
    }
  });
  return issues.slice(0, 12);
}

interface SceneLike {
  id?: unknown;
  kicker?: unknown;
  title?: unknown;
  narration?: unknown;
  duration?: unknown;
  board?: unknown;
}

export interface ValidatedCourse {
  paperId: string;
  bigIdea: string;
  scenes: unknown[];
  diagram: unknown;
  quiz: unknown[];
}

export function validateCourse(raw: unknown, paperId: string): { course?: ValidatedCourse; errors: string[] } {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") return { errors: ["输出不是 JSON 对象"] };
  const data = raw as Record<string, unknown>;

  if (typeof data.bigIdea !== "string" || !data.bigIdea.trim()) errors.push("bigIdea 缺失");

  const titleZh = typeof data.titleZh === "string" ? data.titleZh.trim() : "";
  const abstractZh = typeof data.abstractZh === "string" ? data.abstractZh.trim() : "";
  if (hanCount(titleZh) < 2) errors.push("titleZh 必须是中文译名");
  const abstractChars = hanCount(abstractZh);
  if (abstractChars < 60 || abstractChars > 260) {
    errors.push(`abstractZh 汉字数 ${abstractChars}，要求 60–260`);
  }

  const scenes = Array.isArray(data.scenes) ? data.scenes : [];
  if (scenes.length !== 6) errors.push(`scenes 必须正好 6 个，实际 ${scenes.length}`);

  let total = 0;
  const fixedScenes: Record<string, unknown>[] = [];
  scenes.forEach((scene, index) => {
    const item = (scene ?? {}) as SceneLike;
    const label = `scene[${index}]`;
    const narration = typeof item.narration === "string" ? item.narration : "";
    const chars = hanCount(narration);
    if (chars < 45 || chars > 65) errors.push(`${label}.narration 汉字数 ${chars}，要求 45–65`);
    const duration = typeof item.duration === "number" ? item.duration : NaN;
    if (!Number.isFinite(duration) || duration <= 0) errors.push(`${label}.duration 非法`);
    else total += duration;
    if (typeof item.title !== "string" || !item.title.trim()) errors.push(`${label}.title 缺失`);
    const board = Array.isArray(item.board) ? item.board : [];
    if (board.length < 3 || board.length > 7) errors.push(`${label}.board 元素数 ${board.length}，要求 3–7`);
    let lastAt = -1;
    board.forEach((element, elementIndex) => {
      const el = (element ?? {}) as Record<string, unknown>;
      const at = typeof el.at === "number" ? el.at : NaN;
      if (!Number.isFinite(at) || at < 0) {
        errors.push(`${label}.board[${elementIndex}].at 缺失`);
        return;
      }
      if (elementIndex === 0 && at !== 0) errors.push(`${label}.board 第一个元素 at 必须为 0`);
      if (at <= lastAt) errors.push(`${label}.board[${elementIndex}].at 必须递增`);
      if (Number.isFinite(duration) && at > duration - 500) {
        errors.push(`${label}.board[${elementIndex}].at 超出 duration-500`);
      }
      lastAt = at;
      const kind = String(el.kind ?? "");
      if (!BOARD_KINDS.has(kind)) {
        errors.push(`${label}.board[${elementIndex}].kind 不支持`);
        return;
      }
      if (kind === "text") {
        const x = Number(el.x);
        const y = Number(el.y);
        const size = Number(el.size);
        if (!Number.isFinite(x) || x < 60 || x > 900) errors.push(`${label}.board[${elementIndex}].x 越界`);
        if (!Number.isFinite(y) || y < 80 || y > 480) errors.push(`${label}.board[${elementIndex}].y 越界`);
        if (!TEXT_SIZES.has(size)) errors.push(`${label}.board[${elementIndex}].size 必须是 20/24/28/34`);
        if (el.anchor !== undefined && el.anchor !== "start" && el.anchor !== "middle") {
          errors.push(`${label}.board[${elementIndex}].anchor 非法`);
        }
        if (typeof el.text !== "string" || !el.text.trim()) errors.push(`${label}.board[${elementIndex}].text 缺失`);
      }
      if (kind === "arrow") {
        // 模型偶尔把起点写成 x/y，与渲染端约定不符；就地归一化避免整课重生成
        if (!Number.isFinite(Number(el.x1)) && Number.isFinite(Number(el.x))) el.x1 = el.x;
        if (!Number.isFinite(Number(el.y1)) && Number.isFinite(Number(el.y))) el.y1 = el.y;
        for (const [name, max] of [["x1", 960], ["y1", 540], ["x2", 960], ["y2", 540]] as const) {
          const value = Number(el[name]);
          if (!Number.isFinite(value) || value < 0 || value > max) {
            errors.push(`${label}.board[${elementIndex}].${name} 越界`);
          }
        }
      }
      if (kind === "box") {
        // 模型偶尔把框内文字写成 text，与渲染端约定不符；就地归一化为 label
        if (typeof el.label !== "string" && typeof el.text === "string" && el.text.trim()) {
          el.label = el.text;
        }
        const x = Number(el.x);
        const y = Number(el.y);
        const w = Number(el.w);
        const h = Number(el.h);
        if (!Number.isFinite(x) || x < 0 || x > 960) errors.push(`${label}.board[${elementIndex}].x 越界`);
        if (!Number.isFinite(y) || y < 0 || y > 540) errors.push(`${label}.board[${elementIndex}].y 越界`);
        if (!Number.isFinite(w) || w <= 0 || w > 960) errors.push(`${label}.board[${elementIndex}].w 越界`);
        if (!Number.isFinite(h) || h <= 0 || h > 540) errors.push(`${label}.board[${elementIndex}].h 越界`);
      }
    });
    fixedScenes.push({
      id: typeof item.id === "string" && item.id ? item.id : `scene-${index + 1}`,
      kicker: typeof item.kicker === "string" && item.kicker ? item.kicker : `0${index + 1}`,
      title: item.title,
      narration,
      duration,
      board,
    });
  });
  if (Math.abs(total - 90_000) > 0) errors.push(`duration 总和为 ${total}，必须等于 90000`);

  const narrationTotal = fixedScenes.reduce(
    (sum, scene) => sum + hanCount(String(scene.narration ?? "")),
    0,
  );
  if (narrationTotal < 300 || narrationTotal > 380) {
    errors.push(`narration 总汉字数 ${narrationTotal}，要求 300–380`);
  }

  const diagram = (data.diagram ?? {}) as Record<string, unknown>;
  if (typeof diagram.headline !== "string" || !diagram.headline.trim()) errors.push("diagram.headline 缺失");
  const steps = Array.isArray(diagram.steps) ? diagram.steps : [];
  if (steps.length < 3 || steps.length > 6) errors.push("diagram.steps 要求 3–6 个");
  const conclusions = Array.isArray(diagram.conclusions) ? diagram.conclusions : [];
  if (conclusions.length < 3) errors.push("diagram.conclusions 至少 3 条");
  if (typeof diagram.insight !== "string" || !diagram.insight.trim()) errors.push("diagram.insight 缺失");

  const quiz = Array.isArray(data.quiz) ? data.quiz : [];
  if (quiz.length !== 12) errors.push(`quiz 必须正好 12 道，实际 ${quiz.length}`);
  const fixedQuiz = quiz.slice(0, 12).map((card, index) => {
    const item = (card ?? {}) as Record<string, unknown>;
    const options = Array.isArray(item.options) ? item.options.filter((x) => typeof x === "string") : [];
    if (options.length !== 4) errors.push(`quiz[${index}].options 必须 4 个`);
    const answer = Number(item.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) errors.push(`quiz[${index}].answer 非法`);
    return {
      id: `${paperId}-ai-${index + 1}`,
      paperId,
      question: item.question,
      options,
      answer,
      explanation: item.explanation,
      anchor: typeof item.anchor === "string" && item.anchor ? item.anchor : "全文",
    };
  });

  if (errors.length > 0) return { errors: errors.slice(0, 40) };
  return {
    course: {
      paperId,
      titleZh,
      abstractZh,
      bigIdea: String(data.bigIdea),
      scenes: fixedScenes,
      diagram: {
        headline: diagram.headline,
        steps,
        insight: diagram.insight,
        conclusions,
        anchors: Array.isArray(diagram.anchors) ? diagram.anchors : [],
      },
      quiz: fixedQuiz,
    },
    errors: [],
  };
}

export function buildCoursePrompt(
  paper: { id: string; title: string; abstract: string },
  tone: "standard" | "grandma" = "standard",
): string {
  const abstract = paper.abstract.slice(0, 6000);
  return `把下面这篇论文改写成 90 秒微课，输出一个 JSON 对象。

论文编号：${paper.id}
论文标题：${paper.title}
论文摘要：${abstract}
${tone === "grandma" ? `
本次课稿要用「太奶模式」：
- 每个抽象术语第一次出现时，紧跟一个生活类比（排队、传话游戏、开卷考试、贴便利贴这类），用大白话把机制讲透。
- 句子短，一句一个意思，像给家里长辈讲故事。
- 数字、结论、场景顺序与标准版完全一致，不许借打比方改数字、漏结论。
- narration 仍为 45–65 个汉字，duration 仍为 15000×6。` : ""}

JSON 结构（字段名必须完全一致）：
{
  "titleZh": "论文标题的中文译名，保留英文术语并加括号，如：自注意力（self-attention）",
  "abstractZh": "摘要的中文改写，120–200 个汉字，学术口吻，不照抄英文句子",
  "bigIdea": "一句话主张，20–40 字",
  "scenes": [
    {
      "id": "hook",
      "kicker": "01 · 钩子",
      "title": "场景标题，≤12 字",
      "narration": "45–65 个汉字的口播，口语化，讲机制，不照抄摘要",
      "duration": 15000,
      "board": [
        { "kind": "text", "x": 60, "y": 90, "text": "标题", "size": 34, "weight": 600, "at": 0 },
        { "kind": "text", "x": 60, "y": 210, "text": "要点", "size": 24, "at": 1800 }
      ]
    }
  ],
  "diagram": {
    "headline": "一页图解的标题",
    "steps": [{ "label": "步骤名", "note": "一句话解释" }],
    "insight": "一句话总括",
    "conclusions": ["结论一", "结论二", "结论三"],
    "anchors": [{ "label": "§1", "detail": "原文里的位置说明" }]
  },
  "quiz": [
    { "question": "题干一", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "解析", "anchor": "§1" },
    { "question": "题干二", "options": ["A", "B", "C", "D"], "answer": 2, "explanation": "解析", "anchor": "§2.1" }
  ]
}
（quiz 实际要写满 12 道，这里只示范两道。）

硬性约束：
1. scenes 必须正好 6 个，顺序为 钩子、问题、方法一、方法二、结果、一句话带走；kicker 依次为 "01 · 钩子" 到 "06 · 带走"。
2. 每个 scene 的 duration 都是 15000，六个相加恰好 90000。
3. 每个 narration 45–65 个汉字；六段合计 300–380 个汉字。
4. 每个 scene 的 board 有 3–7 个元素，只使用 text / box / arrow；text 的 x 在 60–900，y 在 80–480，size 只能是 20、24、28、34，anchor 只能是 start 或 middle。
5. 每个 board 的第一个元素 at=0，之后 at 严格递增，最大值不超过 14500。
6. diagram.steps 3–5 个；conclusions 正好 3 条；quiz 正好 12 道，每题 4 个选项，answer 是 0–3 的整数。
7. 所有数字必须能在摘要或原文明文找到；找不到就用定性说法，禁止估算和「约」「大概」。
8. titleZh 必须是中文译名，abstractZh 必须是中文改写，不能保留英文原文；专业术语保留英文并加括号。
9. 只输出 JSON，不要任何其他文字。
10. narration 是口播稿：默读一遍，凡是要"咽一下才顺"的句子，就是不合格，重写。
11. 每个 scene 的 title 是"板书上的小标题"，≤12 字，用动词或问句更有力
    （如"问题不在大小，在排队"，而不是"串行计算的瓶颈分析"）。
12. 12 道自测卡是一套覆盖不同考点的题：动机与问题、核心方法、关键数字、与对照方案的区别、
    结果、局限与适用边界，各至少 1 题；不许两道题考同一个考点。
    错误选项要似是而非、但能明确证伪；explanation 一句话讲清为什么对；
    anchor 写清依据在摘要或原文的哪个位置。题目只问摘要能支撑的事实，禁止编造数字。`;
}

export function buildRetryPrompt(base: string, errors: string[], previous: string): string {
  return `${base}

上一次输出没有通过校验，问题如下：
${errors.slice(0, 12).map((error) => `- ${error}`).join("\n")}

上一次输出：
${previous}

请修正这些问题，重新输出完整 JSON，只输出 JSON。`;
}