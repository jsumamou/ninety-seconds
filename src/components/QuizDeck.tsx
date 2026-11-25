import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { PAPER_MAP } from "../data/papers";
import type { QuizCard } from "../data/types";
import { arxivAnchor } from "../lib/arxiv";
import { useLibrary } from "../lib/store";

interface QuizDeckProps {
  cards: QuizCard[];
  onExit: () => void;
  exitLabel?: string;
  context?: (paperId: string) => string;
}

export function QuizDeck({ cards, onExit, exitLabel = "返回资料库", context }: QuizDeckProps) {
  const { recordGrade } = useLibrary();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [round, setRound] = useState(0);

  const card = cards[index];
  const correctCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );
  const finished = index >= cards.length;

  if (cards.length === 0) {
    return (
      <div className="rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] p-10 text-center text-sm text-[var(--site-muted)]">
        还没有可用的自测卡。
      </div>
    );
  }

  if (finished) {
    const wrong = cards.filter((item) => answers[item.id] === false);
    return (
      <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)] p-6 sm:p-8">
        <span className="text-[11px] font-medium tracking-[0.22em] text-[var(--site-accent)] uppercase">
          Session complete
        </span>
        <h3 className="font-display mt-3 text-2xl font-semibold text-[var(--site-fg)]">
          这一组完成：{correctCount} / {cards.length} 答对
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--site-muted)]">
          答错的卡片已进入「今日复习」。复习队列按错误优先，下次打开会先遇到它们。
        </p>

        {wrong.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {wrong.map((item) => {
              const paper = PAPER_MAP.get(item.paperId);
              return (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--site-border)] px-3 py-2 text-sm text-[var(--site-fg)]"
                >
                  <span className="mr-2 text-xs text-[var(--site-muted)]">
                    {paper?.titleZh ?? item.paperId}
                  </span>
                  {item.question}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-md bg-[var(--site-surface)] px-3 py-2 text-sm text-[var(--site-fg)]">
            全部答对。可以去资料库挑下一篇论文。
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setIndex(0);
              setSelected(null);
              setRound((current) => current + 1);
            }}
            className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
          >
            <RotateCcw size={15} />
            再练一次
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
          >
            {exitLabel}
          </button>
        </div>
        <span className="sr-only">第 {round + 1} 轮</span>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === card.answer;
  const source = arxivAnchor(card.paperId, card.anchor);

  const choose = (option: number) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === card.answer;
    setAnswers((current) => ({ ...current, [card.id]: correct }));
    recordGrade(card.id, card.paperId, correct ? "known" : "forgot", option);
  };

  return (
    <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--site-border)] px-5 py-3">
        <span className="text-xs font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
          自测 · {index + 1} / {cards.length}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex max-w-[180px] flex-wrap gap-1" aria-hidden="true">
            {cards.map((item, itemIndex) => (
              <span
                key={item.id}
                style={{ width: cards.length > 8 ? 6 : 24 }}
                className={`h-1.5 shrink-0 rounded-full ${
                  answers[item.id] === true
                    ? "bg-[var(--site-accent)]"
                    : answers[item.id] === false
                      ? "bg-[var(--site-fg)]/35"
                      : "bg-[var(--site-surface)]"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onExit}
            className="text-xs text-[var(--site-muted)] underline-offset-4 hover:underline"
          >
            退出
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {context ? (
          <p className="mb-2 text-xs text-[var(--site-muted)]">{context(card.paperId)}</p>
        ) : null}
        <h3 className="text-lg leading-relaxed font-medium text-[var(--site-fg)]">
          {card.question}
        </h3>

        <div className="mt-5 space-y-2">
          {card.options.map((option, optionIndex) => {
            const isAnswer = optionIndex === card.answer;
            const isPicked = optionIndex === selected;
            const showState = selected !== null;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(optionIndex)}
                disabled={selected !== null}
                className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm leading-relaxed transition-colors ${
                  showState && isAnswer
                    ? "border-[var(--site-accent)] bg-[var(--site-surface)] text-[var(--site-fg)]"
                    : showState && isPicked
                      ? "border-[var(--site-fg)]/40 bg-[var(--site-bg)] text-[var(--site-fg)]"
                      : "border-[var(--site-border)] text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/25 text-[11px] font-semibold">
                  {showState && isAnswer ? (
                    <Check size={12} />
                  ) : showState && isPicked ? (
                    <X size={12} />
                  ) : (
                    String.fromCharCode(65 + optionIndex)
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null ? (
          <div className="mt-5 rounded-md bg-[var(--site-surface)] p-4">
            <p className="text-sm font-medium text-[var(--site-fg)]">
              {isCorrect ? "答对了。" : "还差一步。"}
              <span className="ml-1 font-normal text-[var(--site-muted)]">{card.explanation}</span>
            </p>
            <p className="mt-2 text-xs text-[var(--site-muted)]">
              原文位置：
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-2 hover:text-[var(--site-accent)]"
              >
                {source.label}
              </a>
            </p>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setIndex((current) => current + 1);
              }}
              className="mt-4 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
            >
              {index + 1 >= cards.length ? "查看结果" : "下一题"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}