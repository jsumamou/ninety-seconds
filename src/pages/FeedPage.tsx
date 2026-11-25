import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Play, RotateCcw, Sparkles } from "lucide-react";
import { FEED_CARDS, firstHalf } from "../data/feedCards";
import { PAPERS } from "../data/papers";
import { getCourse } from "../lib/generated";
import { topicLabel } from "../lib/store";

const STORAGE_KEY = "jsm:feed:v1";

function readSaved(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeSaved(index: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // 存储满时只保留本次会话进度
  }
}

function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 忽略
  }
}

export function FeedPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<number | null>(null);
  const restored = useRef(false);
  const [index, setIndex] = useState(0);

  const cards = useMemo(
    () =>
      PAPERS.map((paper) => ({
        paper,
        info: FEED_CARDS[paper.id],
        hasCourse: Boolean(getCourse(paper.id)),
        conclusion: getCourse(paper.id)?.bigIdea ?? firstHalf(paper.abstractZh),
      })),
    [],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || restored.current) return;
    restored.current = true;
    const saved = readSaved();
    if (saved !== null && saved < cards.length) {
      el.scrollTo({ top: saved * el.clientHeight });
      setIndex(saved);
    }
  }, [cards.length]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const current = Math.min(
      cards.length - 1,
      Math.max(0, Math.round(el.scrollTop / Math.max(1, el.clientHeight))),
    );
    setIndex(current);
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => writeSaved(current), 250);
  };

  const skip = () => {
    const el = containerRef.current;
    if (!el) return;
    const next = index + 1 >= cards.length ? 0 : index + 1;
    el.scrollTo({ top: next * el.clientHeight });
    setIndex(next);
    writeSaved(next);
  };

  const restart = () => {
    const el = containerRef.current;
    clearSaved();
    if (el) el.scrollTo({ top: 0 });
    setIndex(0);
  };

  return (
    <div className="relative bg-[var(--site-bg)]">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-10 bg-gradient-to-b from-[var(--site-bg)] to-transparent" />
      <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 px-4 py-2.5 sm:px-8">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] whitespace-nowrap text-[var(--site-muted)] uppercase sm:gap-2 sm:tracking-[0.18em]">
          <Sparkles size={12} className="shrink-0 text-[var(--site-accent)]" />
          一屏速览 · {index + 1}/{cards.length}
        </span>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-1.5 rounded-full border border-[var(--site-border)] bg-[var(--site-bg)]/90 px-2.5 py-1 text-[11px] whitespace-nowrap text-[var(--site-muted)] hover:text-[var(--site-fg)]"
          >
            <RotateCcw size={11} />
            从头刷
          </button>
          <a
            href="#/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-bg)]/90 px-2.5 py-1 text-[11px] whitespace-nowrap text-[var(--site-muted)] hover:text-[var(--site-fg)]"
          >
            返回资料库
          </a>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[calc(100dvh-61px)] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {cards.map(({ paper, info, hasCourse, conclusion }, cardIndex) => (
          <section
            key={paper.id}
            className="flex h-full snap-start flex-col justify-center px-6 pt-14 pb-6"
            aria-label={`${cardIndex + 1}. ${paper.titleZh}`}
          >
            <div className="mx-auto flex w-full max-w-xl flex-col">
              <p className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[var(--site-accent)] uppercase">
                <span className="rounded-full bg-[var(--site-surface)] px-2.5 py-1 text-[var(--site-fg)]">
                  {topicLabel(paper.topics[0])}
                </span>
                <span className="text-[var(--site-muted)]">
                  {paper.venue} · {paper.year}
                </span>
              </p>

              <h2 className="font-display mt-4 text-3xl leading-tight font-semibold text-[var(--site-fg)] sm:text-4xl">
                {paper.titleZh}
              </h2>
              {paper.titleZh !== paper.title ? (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--site-muted)]">
                  {paper.title}
                </p>
              ) : null}

              <div className="mt-5 border-l-2 border-[var(--site-accent)] pl-4">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
                  一句话
                </p>
                <p className="mt-1.5 line-clamp-3 text-[17px] leading-relaxed font-medium break-words text-[var(--site-fg)]">
                  {conclusion}
                </p>
              </div>

              {info ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {info.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-[var(--site-border)] bg-[var(--site-bg)] px-3 py-1 text-xs text-[var(--site-fg)]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}

              {info?.number ? (
                <div className="mt-5 flex flex-col gap-2 rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-surface)] px-5 py-4 sm:flex-row sm:items-end sm:gap-4">
                  <p className="font-display text-2xl leading-tight font-semibold text-[var(--site-accent)] sm:text-3xl">
                    {info.number.value}
                  </p>
                  <p className="min-w-0 text-xs leading-relaxed text-[var(--site-muted)]">
                    {info.number.label}
                    <span className="mt-1 block opacity-70">数字来自课稿或摘要原文</span>
                  </p>
                </div>
              ) : null}

              <a
                href={`#/paper/${paper.id}`}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-[var(--site-on-accent)] ${
                  hasCourse ? "bg-[var(--site-accent)]" : "bg-[var(--site-fg)]"
                }`}
              >
                {hasCourse ? <Play size={16} className="fill-current" /> : <Sparkles size={15} />}
                {hasCourse ? "进入 90 秒微课" : "生成微课"}
                <ArrowUpRight size={15} />
              </a>

              <button
                type="button"
                onClick={skip}
                className="mx-auto mt-5 flex items-center gap-1.5 rounded-full border border-[var(--site-border)] px-4 py-2 text-xs text-[var(--site-muted)] hover:bg-[var(--site-surface)] hover:text-[var(--site-fg)]"
              >
                <ChevronDown size={14} />
                {cardIndex + 1 >= cards.length ? "回到第一篇" : "跳过，看下一篇"}
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
