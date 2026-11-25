import { COURSES } from "../data/courses";
import { GENERATED_COURSES } from "../data/generatedCourses";
import type { Course } from "../data/types";

const STORAGE_KEY = "jsm:generated:v1";
const LIMIT = 20;

interface StoredCourse {
  at: number;
  course: Course;
}

type CourseStore = Record<string, StoredCourse>;

function readStore(): CourseStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CourseStore;
  } catch {
    return {};
  }
}

function writeStore(store: CourseStore) {
  const entries = Object.entries(store).sort((a, b) => b[1].at - a[1].at);
  const trimmed = Object.fromEntries(entries.slice(0, LIMIT));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // 存储满时保留内存里的本次结果
  }
}

export function loadGeneratedCourse(paperId: string): Course | null {
  const entry = readStore()[paperId];
  if (!entry || !entry.course) return null;
  return entry.course;
}

export function saveGeneratedCourse(course: Course) {
  const store = readStore();
  store[course.paperId] = { at: Date.now(), course };
  writeStore(store);
}

export function getCourse(paperId: string): Course | null {
  return COURSES[paperId] ?? GENERATED_COURSES[paperId] ?? loadGeneratedCourse(paperId);
}

export const PROGRESS_STEPS = [
  "正在读摘要…",
  "拆分第 1 幕…",
  "拆分第 2 幕…",
  "拆分第 3 幕…",
  "拆分第 4 幕…",
  "拆分第 5 幕…",
  "拆分第 6 幕…",
  "即将开始…",
];

export async function requestCourse(
  paperId: string,
  tone: "standard" | "grandma" = "standard",
): Promise<Course> {
  const toneParam = tone === "grandma" ? "&tone=grandma" : "";
  const first = await fetch(
    `/functions/v1/app?action=course&id=${encodeURIComponent(paperId)}${toneParam}`,
    { signal: AbortSignal.timeout(30_000) },
  );
  let payload: { ok?: boolean; course?: Course; pending?: boolean; sessionId?: string; message?: string } = {};
  try {
    payload = (await first.json()) as typeof payload;
  } catch {
    throw new Error("服务返回的内容读不懂，请重试。");
  }
  if (first.status === 429) {
    const retryAfter = Number(first.headers.get("Retry-After"));
    const minutes =
      Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter / 60) : null;
    throw new Error(
      minutes
        ? `生成太频繁了，请约 ${minutes} 分钟后再试；已生成过的微课不受影响。`
        : "生成太频繁了，请稍等几分钟再试；已生成过的微课不受影响。",
    );
  }
  if (!first.ok || !payload.ok) {
    throw new Error(payload.message || "这次没生成成功，请重试。");
  }
  if (payload.course) {
    return assertCourse(payload.course);
  }
  if (!payload.pending || typeof payload.sessionId !== "string") {
    throw new Error(payload.message || "这次没生成成功，请重试。");
  }

  const sessionId = payload.sessionId;
  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline) {
    const response = await fetch(
      `/functions/v1/app?action=course&id=${encodeURIComponent(paperId)}&resume=${encodeURIComponent(sessionId)}${toneParam}`,
      { signal: AbortSignal.timeout(60_000) },
    );
    let resumed: typeof payload = {};
    try {
      resumed = (await response.json()) as typeof payload;
    } catch {
      throw new Error("服务返回的内容读不懂，请重试。");
    }
    if (!response.ok || !resumed.ok) {
      throw new Error(resumed.message || "这次没生成成功，请重试。");
    }
    if (resumed.course) {
      return assertCourse(resumed.course);
    }
    if (resumed.pending) continue;
    throw new Error(resumed.message || "这次没生成成功，请重试。");
  }
  throw new Error("生成超时了，请再试一次。");
}

function assertCourse(course: Course): Course {
  if (!Array.isArray(course.scenes) || course.scenes.length !== 6) {
    throw new Error("生成的微课结构不完整，请重试。");
  }
  return course;
}