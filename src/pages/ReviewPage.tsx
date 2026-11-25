import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, Copy, ListChecks, RotateCcw } from "lucide-react";
import { QuizDeck } from "../components/QuizDeck";
import { PAPER_MAP } from "../data/papers";
import type { QuizCard } from "../data/types";
import { getCourse } from "../lib/generated";
import { allAvailableQuizIds, resolveReviewCard } from "../lib/review";
import { useLibrary } from "../lib/store";

export function ReviewPage() {
  const { answers, resetAnswers } = useLibrary();
  const [session, setSession] = useState<QuizCard[] | null>(null);

  const answeredRecords = Object.values(answers);
  const knownCount = answeredRecords.filter((record) => record.grade === "known").length;
  const dueRecords = useMemo(
    () =>
      answeredRecords
        .filter((record) => record.grade !== "known")
        .sort((a, b) => a.at.localeCompare(b.at)),
    [answeredRecords],
  );
  const dueCards = useMemo(
    () =>
      dueRecords
        .map((record) => resolveReviewCard(record))
        .filter((card): card is QuizCard => Boolean(card)),
    [dueRecords],
  );
  const newCount = useMemo(() => {
    const total = allAvailableQuizIds().length;
    const answered = new Set(Object.keys(answers)).size;
    return Math.max(0, total - answered);
  }, [answers]);
  const [exportState, setExportState] = useState<"idle" | "copied" | "error">("idle");

  const exportList = async () => {
    const lines = [
      "# 九十秒 · 今日复习清单",
      "",
      `共 ${dueCards.length} 张待复习卡片，按错误时间排序。`,
      "",
    ];
    dueCards.forEach((card, index) => {
      const record = answers[card.id];
      const paper = PAPER_MAP.get(card.paperId);
      const chosenText =
        record && record.chosen != null && card.options[record.chosen]
          ? card.options[record.chosen]
          : "未记录";
      lines.push(
        `${index + 1}. **${card.question}**`,
        `   - 你的答案：${chosenText}`,
        `   - 正确解释：${card.explanation}`,
        `   - 出处：${paper?.titleZh ?? card.paperId} · ${card.anchor}`,
        "",
      );
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setExportState("copied");
    } catch {
      setExportState("error");
    }
    window.setTimeout(() => setExportState("idle"), 2000);
  };

  if (session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-16 sm:px-8">
        <button
          type="button"
          onClick={() => setSession(null)}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]"
        >
          <ArrowLeft size={15} />
          结束复习
        </button>
        <h1 className="font-display mt-5 text-3xl font-semibold text-[var(--site-fg)]">
          复习队列
        </h1>
        <p className="mt-2 text-sm text-[var(--site-muted)]">
          答对即移出队列；再次答错，会留在明天的复习里。
        </p>
        <div className="mt-6">
          <QuizDeck
            cards={session}
            onExit={() => setSession(null)}
            exitLabel="回到复习概览"
            context={(paperId) => {
              const paper = PAPER_MAP.get(paperId);
              const course = getCourse(paperId);
              return `${paper?.titleZh ?? paperId} · ${course?.bigIdea ?? ""}`;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-10 pb-16 sm:px-8">
      <a
        href="#/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]"
      >
        <ArrowLeft size={15} />
        资料库
      </a>
      <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[var(--site-fg)]">
        今日复习
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--site-muted)]">
        自测答错的卡片会自动进入这里。只复习没掌握的，不从头再刷一遍。
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-4">
          <p className="font-display text-3xl font-semibold text-[var(--site-accent)]">
            {dueCards.length}
          </p>
          <p className="mt-1 text-xs text-[var(--site-muted)]">待复习</p>
        </div>
        <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-4">
          <p className="font-display text-3xl font-semibold text-[var(--site-fg)]">
            {knownCount}
          </p>
          <p className="mt-1 text-xs text-[var(--site-muted)]">已掌握</p>
        </div>
        <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-4">
          <p className="font-display text-3xl font-semibold text-[var(--site-fg)]">
            {newCount}
          </p>
          <p className="mt-1 text-xs text-[var(--site-muted)]">还没做过的卡</p>
        </div>
      </div>

      {dueCards.length === 0 ? (
        <div className="mt-8 rounded-[calc(var(--site-radius)+4px)] border border-dashed border-[var(--site-border)] px-6 py-14 text-center">
          <CheckCheck size={28} className="mx-auto text-[var(--site-accent)]" />
          <h2 className="font-display mt-3 text-xl font-semibold text-[var(--site-fg)]">
            队列是空的
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--site-muted)]">
            {answeredRecords.length === 0
              ? "先挑一篇论文，做完一组自测卡。答错的会自动排进这里。"
              : "没有待复习的卡片。可以去资料库看看还没读的论文。"}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
            >
              去资料库
              <ArrowRight size={15} />
            </a>
            {answeredRecords.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("清空本地的全部自测记录？")) resetAnswers();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
              >
                <RotateCcw size={14} />
                清空记录
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 rounded-[var(--site-radius)] bg-[var(--site-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--site-fg)]">
              <ListChecks size={16} className="text-[var(--site-accent)]" />
              {dueCards.length} 张卡按错误时间排序，最早的先来。
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportList}
                className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-bg)]"
              >
                {exportState === "copied" ? (
                  <Check size={15} className="text-[var(--site-accent)]" />
                ) : (
                  <Copy size={15} />
                )}
                {exportState === "copied"
                  ? "已复制"
                  : exportState === "error"
                    ? "复制失败，重试"
                    : "导出复习清单"}
              </button>
              <button
                type="button"
                onClick={() => setSession(dueCards)}
                className="rounded-full bg-[var(--site-accent)] px-5 py-2 text-sm font-medium text-[var(--site-on-accent)]"
              >
                开始复习
              </button>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {dueCards.map((card) => {
              const record = answers[card.id];
              const paper = PAPER_MAP.get(card.paperId);
              return (
                <li
                  key={card.id}
                  className="flex flex-col gap-1 rounded-[var(--site-radius)] border border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-[var(--site-fg)]">{card.question}</p>
                    <p className="mt-1 text-xs text-[var(--site-muted)]">
                      {paper?.titleZh ?? card.paperId} · {card.anchor}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--site-surface)] px-2.5 py-1 text-[11px] text-[var(--site-muted)]">
                    {record?.grade === "fuzzy" ? "没把握" : "答错过"}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}