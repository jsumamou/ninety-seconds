import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PAPERS, PAPER_MAP } from "../data/papers";
import type { AnswerRecord, Grade, Paper, TopicId } from "../data/types";
import { fetchArxivPaper } from "./search";

const STORAGE_KEY = "jiushimiao.library.v1";

interface StoredState {
  library: Paper[];
  answers: Record<string, AnswerRecord>;
}

interface LibraryContextValue {
  library: Paper[];
  answers: Record<string, AnswerRecord>;
  dueCount: number;
  addPaper: (paper: Paper) => boolean;
  recordGrade: (cardId: string, paperId: string, grade: Grade, chosen?: number) => void;
  resetAnswers: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function initialState(): StoredState {
  const fallback: StoredState = {
    library: PAPERS,
    answers: {},
  };

  try {
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      window.localStorage.removeItem(STORAGE_KEY);
      return fallback;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const stored = Array.isArray(parsed.library) && parsed.library.length > 0
      ? parsed.library
      : [];

    // 老访客迁移：保留原有顺序与自行导入的论文；内置论文刷新状态（如预生成微课就绪），
    // 并补齐后来新增的内置论文，保证新内容对所有人可见。
    const merged = [...stored];
    for (const paper of PAPERS) {
      const index = merged.findIndex((item) => item.id === paper.id);
      if (index >= 0) {
        merged[index] = { ...merged[index], status: paper.status };
      } else {
        merged.push(paper);
      }
    }

    return {
      library: merged,
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
    };
  } catch {
    return fallback;
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(initialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 存储不可用时仍允许本次会话继续使用
    }
  }, [state]);

  const addPaper = useCallback(
    (paper: Paper) => {
      if (state.library.some((item) => item.id === paper.id)) return false;
      setState((current) =>
        current.library.some((item) => item.id === paper.id)
          ? current
          : { ...current, library: [paper, ...current.library] },
      );
      return true;
    },
    [state.library],
  );

  const recordGrade = useCallback(
    (cardId: string, paperId: string, grade: Grade, chosen?: number) => {
      setState((current) => ({
        ...current,
        answers: {
          ...current.answers,
          [cardId]: {
            cardId,
            paperId,
            grade,
            at: new Date().toISOString(),
            ...(chosen === undefined ? {} : { chosen }),
          },
        },
      }));
    },
    [],
  );

  const resetAnswers = useCallback(() => {
    setState((current) => ({ ...current, answers: {} }));
  }, []);

  const dueCount = useMemo(
    () => Object.values(state.answers).filter((answer) => answer.grade !== "known").length,
    [state.answers],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      library: state.library,
      answers: state.answers,
      dueCount,
      addPaper,
      recordGrade,
      resetAnswers,
    }),
    [state.library, state.answers, dueCount, addPaper, recordGrade, resetAnswers],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("useLibrary 必须在 LibraryProvider 内使用");
  return value;
}

export interface ImportResult {
  status: "added" | "duplicate" | "not-found";
  paper?: Paper;
  topic?: TopicId;
  message: string;
}

const ARXIV_ID = /(\d{4}\.\d{4,5})(v\d+)?/;

export function parseArxivInput(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const match = value.match(ARXIV_ID);
  return match ? match[1] : null;
}

export async function importPaper(raw: string): Promise<ImportResult> {
  const id = parseArxivInput(raw);
  if (!id) {
    return {
      status: "not-found",
      message: "没有识别出 arXiv 编号。请粘贴形如 1706.03762 的链接或编号。",
    };
  }

  const known = PAPERS.find((paper) => paper.id === id) ?? PAPER_MAP.get(id);
  if (known) {
    return {
      status: "added",
      paper: known,
      topic: known.topics[0],
      message: `已收录《${known.titleZh}》，自动归入「${topicLabel(known.topics[0])}」。`,
    };
  }

  try {
    const response = await fetch(`/functions/v1/app?action=paper&id=${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as { paper?: Paper };
    if (!payload.paper) throw new Error("empty");
    return {
      status: "added",
      paper: payload.paper,
      topic: payload.paper.topics[0],
      message: `已从 arXiv 获取《${payload.paper.titleZh || payload.paper.title}》。`,
    };
  } catch {
    // 纯静态部署没有 /functions：退到浏览器直连 OpenAlex 取同一篇的元数据
    const offline = await fetchArxivPaper(id).catch(() => null);
    if (offline) {
      return {
        status: "added",
        paper: offline,
        message: `已从 OpenAlex 获取《${offline.title}》。`,
      };
    }
    return {
      status: "not-found",
      message: `暂时取不到 ${id} 的元数据。请检查网络，或稍后再试。`,
    };
  }
}

export function resetLibraryStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 存储不可用时无需清理
  }
}

export function topicLabel(topicId: TopicId): string {
  switch (topicId) {
    case "foundation":
      return "大模型基础";
    case "efficient":
      return "高效训练与微调";
    case "generative":
      return "生成模型";
    case "retrieval":
      return "检索与知识";
    case "reasoning":
      return "推理与智能体";
    default:
      return "未分类";
  }
}