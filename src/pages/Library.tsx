import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Library as LibraryIcon,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { TOPICS } from "../data/papers";
import type { TopicId } from "../data/types";
import { searchPapers, type SearchHit } from "../lib/search";
import { getCourse } from "../lib/generated";
import { importPaper, parseArxivInput, topicLabel, useLibrary } from "../lib/store";

type Feedback = {
  kind: "ok" | "warn" | "error";
  text: string;
  paperId?: string;
} | null;

const ENGLISH_QUERY = /^[A-Za-z][A-Za-z0-9\s\-'.]*$/;

function isEnglishQuery(raw: string): boolean {
  const value = raw.trim();
  return value.length > 0 && ENGLISH_QUERY.test(value);
}

export function Library() {
  const { library, addPaper } = useLibrary();
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  const counts = useMemo(() => {
    const result = new Map<TopicId, number>();
    for (const paper of library) {
      for (const item of paper.topics) {
        result.set(item, (result.get(item) ?? 0) + 1);
      }
    }
    return result;
  }, [library]);

  const readyCount = library.filter((paper) => paper.status === "ready").length;

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return library.filter((paper) => {
      const topicMatch = topic === "all" || paper.topics.includes(topic);
      if (!topicMatch) return false;
      if (!keyword) return true;
      return (
        paper.title.toLowerCase().includes(keyword) ||
        paper.titleZh.includes(keyword) ||
        paper.authors.some((author) => author.toLowerCase().includes(keyword))
      );
    });
  }, [library, topic, query]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (busy || !value.trim()) return;
    setFeedback(null);
    const arxivId = parseArxivInput(value);
    if (arxivId) {
      setBusy(true);
      setHits(null);
      const result = await importPaper(value);
      if (result.paper) {
        const added = addPaper(result.paper);
        if (!added) {
          setFeedback({
            kind: "warn",
            text: "这篇已经在资料库里了，可以直接打开。",
            paperId: result.paper.id,
          });
        } else {
          setFeedback({
            kind: "ok",
            text: result.message,
            paperId: result.paper.id,
          });
          setValue("");
        }
      } else {
        setFeedback({ kind: "error", text: result.message });
      }
      setBusy(false);
      return;
    }
    if (isEnglishQuery(value)) {
      window.location.hash = `#/search?q=${encodeURIComponent(value.trim())}`;
      return;
    }
    setBusy(true);
    setHits(null);
    const outcome = await searchPapers(value);
    if (outcome.ok) {
      setHits(outcome.hits);
    } else {
      setFeedback({ kind: "error", text: outcome.error });
    }
    setBusy(false);
  };

  const pickHit = async (hit: SearchHit) => {
    if (busy) return;
    setFeedback(null);
    if (!hit.arxivId) {
      setFeedback({
        kind: "error",
        text: "这篇只有 DOI，没有找到 arXiv 版本，暂时生成不了微课。",
      });
      return;
    }
    setBusy(true);
    const result = await importPaper(hit.arxivId);
    if (result.paper) {
      const added = addPaper(result.paper);
      const viaArxiv = Boolean(hit.doi?.match(/arxiv/i));
      if (!added) {
        setFeedback({
          kind: "warn",
          text: "这篇已经在资料库里了，可以直接打开。",
          paperId: result.paper.id,
        });
      } else {
        setFeedback({
          kind: "ok",
          text: viaArxiv
            ? result.message
            : `这篇暂时没法直接生成微课，已为你找到 ${hit.arxivIds.length} 篇 arXiv 上的相关论文。${result.message}`,
          paperId: result.paper.id,
        });
      }
    } else {
      setFeedback({ kind: "error", text: result.message });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <section className="relative">
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-[var(--site-accent)] uppercase">
          <Sparkles size={13} />
          StudyHack · 学习科研
        </p>
        <h1 className="font-display mt-4 text-4xl leading-[1.15] font-semibold tracking-tight text-[var(--site-fg)] sm:text-5xl">
          把收藏的论文，
          <br className="sm:hidden" />
          读成 90 秒。
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--site-muted)]">
          <span className="font-medium text-[var(--site-fg)]">
            一篇典型的论文 4,200 词，精读要 47 分钟；你收藏了 200 篇，一篇都没打开。
          </span>
          <br />
          九十秒 —— 把一篇论文压成一节能看、能听、能自测的微课，每一句都能跳回原文。
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--site-accent)]">
          它不是聊天框。它是一个能暂停、能追问、能带走的 90 秒课堂。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--site-muted)]">
          <span className="flex items-center gap-1.5">
            <LibraryIcon size={15} />
            已收藏 {library.length} 篇
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} />
            {readyCount} 篇已生成微课
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} />
            每篇 90 秒 · 可反复回看
          </span>
        </div>
      </section>

      <section className="mt-9">
        <form
          onSubmit={submit}
          className="rounded-[calc(var(--site-radius)+4px)] border border-[var(--site-border)] bg-[var(--site-bg)] p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--site-muted)]"
              />
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="粘贴 arXiv 编号、中文主题，或英文关键词"
                className="h-11 w-full rounded-full border border-[var(--site-border)] bg-[var(--site-bg)] pr-4 pl-10 text-sm text-[var(--site-fg)] outline-none placeholder:text-[var(--site-muted)]/80 focus:border-[var(--site-accent)]"
                aria-label="论文编号、主题或英文关键词"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--site-accent)] px-6 text-sm font-medium text-[var(--site-on-accent)] disabled:opacity-50"
            >
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {busy
                ? parseArxivInput(value)
                  ? "正在读取"
                  : "正在检索"
                : parseArxivInput(value)
                  ? "导入并归类"
                  : isEnglishQuery(value)
                    ? "检索 30 篇"
                    : "按主题检索"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--site-muted)]">
            <span>元数据来自 arXiv 与 OpenAlex 开放接口，不抓取私人收藏。</span>
            <a
              href="#/search"
              className="rounded-full border border-[var(--site-border)] px-2.5 py-1 text-[11px] hover:bg-[var(--site-surface)]"
            >
              英文检索：一次 30 篇 →
            </a>
            <button
              type="button"
              onClick={() => {
                setValue("2106.09685");
                setFeedback(null);
              }}
              className="rounded-full border border-[var(--site-border)] px-2.5 py-1 text-[11px] hover:bg-[var(--site-surface)]"
            >
              试试：2106.09685
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("2305.14314");
                setFeedback(null);
              }}
              className="rounded-full border border-[var(--site-border)] px-2.5 py-1 text-[11px] hover:bg-[var(--site-surface)]"
            >
              试试：2305.14314
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("大模型幻觉");
                setFeedback(null);
              }}
              className="rounded-full border border-[var(--site-border)] px-2.5 py-1 text-[11px] hover:bg-[var(--site-surface)]"
            >
              试试：大模型幻觉
            </button>
          </div>
          {feedback ? (
            <div
              role="status"
              className={`mt-3 flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm ${
                feedback.kind === "ok"
                  ? "bg-[var(--site-surface)] text-[var(--site-fg)]"
                  : feedback.kind === "warn"
                    ? "bg-[var(--site-surface)] text-[var(--site-fg)]"
                    : "bg-[var(--site-bg)] text-[var(--site-accent)] ring-1 ring-[var(--site-border)]"
              }`}
            >
              {feedback.kind === "ok" ? <Check size={15} /> : null}
              <span className="flex-1">{feedback.text}</span>
              {feedback.paperId ? (
                <a
                  href={`#/paper/${feedback.paperId}`}
                  className="text-xs font-medium underline underline-offset-4"
                >
                  打开
                </a>
              ) : null}
            </div>
          ) : null}
        </form>
      </section>

      <a
        href="#/feed"
        className="mt-5 flex flex-col gap-3 rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-surface)]/60 p-5 transition-colors hover:border-[var(--site-fg)]/30 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex items-start gap-3">
          <span className="font-display mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--site-accent)] text-sm font-semibold text-[var(--site-on-accent)]">
            速
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--site-fg)]">
              一屏速览 · 不知道先读哪篇？
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--site-muted)]">
              像刷短视频一样竖滑论文：每篇只看标题、一句话结论、3 个关键词和一个核心数字。刷到哪记到哪。
            </span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm font-medium text-[var(--site-fg)]">
          进入速览
          <ArrowUpRight size={15} />
        </span>
      </a>

      {hits !== null ? (
        <section className="mt-8" aria-label="OpenAlex 检索结果">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--site-fg)]">
              检索结果 · {hits.length} 条
            </h2>
            <span className="text-[11px] text-[var(--site-muted)]">
              英文元数据 · 由 OpenAlex 提供
            </span>
          </div>
          {hits.length === 0 ? (
            <div className="mt-4 rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] px-6 py-10 text-center text-sm text-[var(--site-muted)]">
              没有找到相关论文，换个关键词试试。
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {hits.map((hit) => (
                <li key={hit.doi ?? hit.title}>
                  <button
                    type="button"
                    onClick={() => pickHit(hit)}
                    className="flex w-full flex-col rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)] p-4 text-left transition-colors hover:border-[var(--site-fg)]/30 hover:bg-[var(--site-surface)]/40"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-[var(--site-fg)]">
                      {hit.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--site-muted)]">
                      {hit.firstAuthor ?? "作者未知"}
                      {hit.year ? ` · ${hit.year}` : ""} · 被引 {hit.citedBy} 次
                    </p>
                    <span className="mt-2 flex items-center justify-between text-[11px] text-[var(--site-muted)]">
                      <span className={hit.arxivId ? "text-[var(--site-fg)]/80" : ""}>
                        {hit.arxivId ? `arXiv:${hit.arxivId}` : "仅 DOI"}
                      </span>
                      <span>由 OpenAlex 提供</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-col gap-4 border-b border-[var(--site-border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTopic("all")}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                topic === "all"
                  ? "bg-[var(--site-fg)] text-[var(--site-bg)]"
                  : "border border-[var(--site-border)] text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
              }`}
            >
              全部 · {library.length}
            </button>
            {TOPICS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTopic(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  topic === item.id
                    ? "bg-[var(--site-fg)] text-[var(--site-bg)]"
                    : "border border-[var(--site-border)] text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
                }`}
              >
                {item.name} · {counts.get(item.id) ?? 0}
              </button>
            ))}
          </div>
          <label className="relative w-full sm:w-56">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--site-muted)]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题或作者"
              className="h-9 w-full rounded-full border border-[var(--site-border)] bg-transparent pr-3 pl-8 text-sm text-[var(--site-fg)] outline-none placeholder:text-[var(--site-muted)]/80 focus:border-[var(--site-accent)]"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] px-6 py-16 text-center">
            <p className="text-sm text-[var(--site-muted)]">没有匹配的论文，换个主题或导入一篇。</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((paper) => {
              const ready = paper.status === "ready";
              const course = getCourse(paper.id);
              return (
                <a
                  key={paper.id}
                  href={`#/paper/${paper.id}`}
                  className="group flex flex-col rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)] p-5 transition-colors hover:border-[var(--site-fg)]/30 hover:bg-[var(--site-surface)]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[var(--site-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-fg)]">
                      {topicLabel(paper.topics[0])}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-[11px] ${
                        ready ? "text-[var(--site-accent)]" : "text-[var(--site-muted)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          ready ? "bg-[var(--site-accent)]" : "bg-[var(--site-muted)]/50"
                        }`}
                      />
                      {ready ? "微课就绪" : "已收藏"}
                    </span>
                  </div>
                  <h2 className="font-display mt-4 line-clamp-2 text-xl leading-snug font-semibold text-[var(--site-fg)]">
                    {paper.titleZh}
                  </h2>
                  {paper.titleZh !== paper.title ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--site-muted)]">
                      {paper.title}
                    </p>
                  ) : null}
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--site-muted)]">
                    {paper.abstractZh}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--site-border)] pt-3 text-xs text-[var(--site-muted)]">
                    <span className="truncate pr-3">
                      {paper.authors[0]}
                      {paper.authors.length > 1 ? " 等" : ""} · {paper.year}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[var(--site-fg)]">
                      {ready ? `${course?.quiz.length ?? 12} 张卡 · 90 秒` : "查看摘要"}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-10 text-xs leading-relaxed text-[var(--site-muted)]">
        元数据来自 arXiv 与 OpenAlex 开放接口；微课与图解是学习用途的改写，不替代原文。关键数字与结论均标注了原文位置。
      </p>
    </div>
  );
}