import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, CornerDownRight, Download, Star } from "lucide-react";
import type { TableReadingCard } from "../data/types";
import { exportSvgAsPng, wrapText } from "../lib/exportCard";
import { tableCardId } from "../lib/review";
import { useLibrary } from "../lib/store";

type Step = "read" | "picked";

const W = 1080;
const H = 1440;
const PAD = 84;

/**
 * 读表卡（带我读懂这张表）
 * 三步交互：进卡 → 点选（选错给提示 / 选对看证据边界）→ 返回。
 * 高亮不依赖颜色：加粗 + 边框 + ★ 角标 + 文字标注并用。
 */
export function TableReadingCardView({
  card,
  onBack,
}: {
  card: TableReadingCard;
  onBack: () => void;
}) {
  const { recordGrade } = useLibrary();
  const [step, setStep] = useState<Step>("read");
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongAt, setWrongAt] = useState<number | null>(null);
  const [showBoundary, setShowBoundary] = useState(false);
  const wrongHintRef = useRef<HTMLParagraphElement | null>(null);
  const guideSvgRef = useRef<SVGSVGElement | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveNote, setSaveNote] = useState("");

  const resolved = picked !== null && picked === card.question.answer;

  const reset = () => {
    setStep("read");
    setPicked(null);
    setWrongAt(null);
    setShowBoundary(false);
    setSaveNote("");
  };

  const pick = (index: number) => {
    setPicked(index);
    recordGrade(
      tableCardId(card),
      card.paperId,
      index === card.question.answer ? "known" : "forgot",
      index,
    );
    if (index === card.question.answer) {
      setWrongAt(null);
      setStep("picked");
    } else {
      setWrongAt(index);
    }
  };

  useEffect(() => {
    if (wrongAt !== null && !resolved) wrongHintRef.current?.focus();
  }, [wrongAt, resolved]);

  const isHighlightedCell = (rowIndex: number, col: number) => {
    if (!resolved) return false;
    return card.rows[rowIndex].cells.some((cell) => cell.col === col && cell.highlight);
  };

  const saveGuide = async () => {
    const svg = guideSvgRef.current;
    if (!svg || saveBusy) return;
    setSaveBusy(true);
    setSaveNote("");
    try {
      const outcome = await exportSvgAsPng(svg, W, H, `九十秒-读表要点-${card.paperId}.png`);
      if (outcome === "ok") setSaveNote("读表要点已保存。");
      else if (outcome === "svg-fallback") setSaveNote("这个浏览器导不出 PNG，已在新标签打开 SVG。");
      else setSaveNote("保存失败，请重试。");
    } catch {
      setSaveNote("保存失败，请重试。");
    } finally {
      setSaveBusy(false);
    }
  };

  // —— 读表要点卡（1080×1440 纯 SVG，导出链路与学习卡共用）——
  const titleLines = wrapText(card.title, 22, 2);
  const headerItems = card.columns.map((column) =>
    column.unit ? `${column.name} · ${column.unit}` : column.name,
  );
  const compareLines = wrapText(card.takeaway.compare, 26, 4);
  const pitfallLines = wrapText(card.takeaway.pitfall, 26, 4);

  const titleStart = 296;
  const headersLabelY = titleStart + (titleLines.length - 1) * 52 + 92;
  const headersStart = headersLabelY + 54;
  const compareLabelY = headersStart + (headerItems.length - 1) * 42 + 88;
  const compareStart = compareLabelY + 54;
  const pitfallLabelY = compareStart + (compareLines.length - 1) * 42 + 88;
  const pitfallStart = pitfallLabelY + 54;

  return (
    <section
      className="overflow-hidden rounded-[calc(var(--site-radius)+4px)] border border-[var(--site-border)] bg-[var(--site-bg)]"
      aria-label="读表卡：带我读懂这张表"
    >
      {/* 要点卡 SVG 离屏渲染，仅供导出 */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0">
        <svg
          ref={guideSvgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
        >
          <rect width={W} height={H} fill="#14181d" />
          <rect x="0" y="0" width="10" height={H} fill="#b4472e" />
          <text
            x={PAD}
            y="122"
            fill="#ece7dc"
            fontFamily="'Source Han Serif SC', 'Noto Serif SC', serif"
            fontSize="38"
            fontWeight="600"
          >
            九十秒
          </text>
          <text
            x={W - PAD}
            y="120"
            fill="#8c887f"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            textAnchor="end"
            letterSpacing="4"
          >
            TABLE GUIDE
          </text>
          <line x1={PAD} y1="164" x2={W - PAD} y2="164" stroke="#2c3238" strokeWidth="2" />

          <text
            x={PAD}
            y="232"
            fill="#e9a178"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            letterSpacing="6"
          >
            带我读懂这张表 · {card.tableId}
          </text>

          {titleLines.map((line, index) => (
            <text
              key={`title-${index}`}
              x={PAD}
              y={titleStart + index * 52}
              fill="#ece7dc"
              fontFamily="'Source Han Serif SC', 'Noto Serif SC', serif"
              fontSize="42"
              fontWeight="600"
            >
              {line}
            </text>
          ))}

          <text
            x={PAD}
            y={headersLabelY}
            fill="#8c887f"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            letterSpacing="6"
          >
            表头速记
          </text>
          {headerItems.map((item, index) => (
            <text
              key={`header-${index}`}
              x={PAD}
              y={headersStart + index * 42}
              fill="#ece7dc"
              fontFamily="'Noto Sans SC', sans-serif"
              fontSize="32"
            >
              {item}
            </text>
          ))}

          <text
            x={PAD}
            y={compareLabelY}
            fill="#8c887f"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            letterSpacing="6"
          >
            怎么比
          </text>
          {compareLines.map((line, index) => (
            <text
              key={`compare-${index}`}
              x={PAD}
              y={compareStart + index * 42}
              fill="#ece7dc"
              fontFamily="'Noto Sans SC', sans-serif"
              fontSize="32"
            >
              {line}
            </text>
          ))}

          <text
            x={PAD}
            y={pitfallLabelY}
            fill="#8c887f"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            letterSpacing="6"
          >
            别看走眼
          </text>
          {pitfallLines.map((line, index) => (
            <text
              key={`pitfall-${index}`}
              x={PAD}
              y={pitfallStart + index * 42}
              fill="#ece7dc"
              fontFamily="'Noto Sans SC', sans-serif"
              fontSize="32"
            >
              {line}
            </text>
          ))}

          <line x1={PAD} y1="1240" x2={W - PAD} y2="1240" stroke="#2c3238" strokeWidth="2" />
          <text x={PAD} y="1296" fill="#8c887f" fontFamily="'Noto Sans SC', sans-serif" fontSize="24">
            本表数字经人工对照 {card.sourceVersion} {card.tableId} 核对，非模型生成
          </text>
          <text
            x={W - PAD}
            y="1358"
            fill="#5d5952"
            fontFamily="'Noto Sans SC', sans-serif"
            fontSize="20"
            textAnchor="end"
          >
            © 2026 九十秒
          </text>
        </svg>
      </div>

      {/* 头 */}
      <header className="border-b border-[var(--site-border)] bg-[var(--site-surface)]/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
          <span>带我读懂这张表</span>
          <span className="text-[var(--site-accent)]">{card.tableId}</span>
          <span>{card.sourceVersion}</span>
        </div>
        <h3 className="font-display mt-2 text-xl leading-snug font-semibold text-[var(--site-fg)] sm:text-2xl">
          {card.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-[var(--site-muted)]">
          {card.excerptNote}
        </p>
      </header>

      {/* 表体：窄屏可横向滑动，左右边缘渐变提示 */}
      <div
        className="overflow-x-auto px-5 py-5 sm:px-6"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--site-bg) 24%, transparent), linear-gradient(270deg, var(--site-bg) 24%, transparent), linear-gradient(90deg, rgba(20,24,29,0.28), transparent), linear-gradient(270deg, rgba(20,24,29,0.28), transparent)",
          backgroundPosition: "left center, right center, left center, right center",
          backgroundSize: "44px 100%, 44px 100%, 22px 100%, 22px 100%",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "local, local, scroll, scroll",
        }}
      >
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr>
              {card.columns.map((column, index) => (
                <th
                  key={column.name}
                  scope="col"
                  className={`border-b-2 border-[var(--site-border)] px-3 py-2.5 text-left align-bottom ${
                    index === 0 ? "" : "text-right"
                  }`}
                >
                  <span className="font-semibold text-[var(--site-fg)]">{column.name}</span>
                  {column.unit ? (
                    <span className="mt-0.5 block text-[11px] font-normal text-[var(--site-muted)]">
                      {column.unit}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {card.rows.map((row, rowIndex) => (
              <tr
                key={row.label}
                className={
                  row.emphasis ? "border-b border-[var(--site-border)]" : "border-b border-[var(--site-border)]/60"
                }
              >
                <td className="px-3 py-3 align-middle">
                  <span
                    className={
                      row.emphasis ? "font-semibold text-[var(--site-fg)]" : "text-[var(--site-fg)]"
                    }
                  >
                    {row.label}
                    {row.emphasis ? (
                      <span className="ml-1.5 text-[10px] font-normal text-[var(--site-muted)]">
                        本文
                      </span>
                    ) : null}
                  </span>
                </td>
                {card.columns.slice(1).map((column, colIndex) => {
                  const col = colIndex + 1;
                  const cell = row.cells.find((item) => item.col === col);
                  const highlighted = isHighlightedCell(rowIndex, col);
                  return (
                    <td key={column.name} className="px-3 py-3 text-right align-middle">
                      {cell?.missing ? (
                        <span className="text-[var(--site-muted)]" aria-label="缺失值">
                          —
                        </span>
                      ) : (
                        <span
                          className={
                            highlighted
                              ? "inline-flex items-center gap-1 rounded-md border-2 border-[var(--site-accent)] px-2 py-1 font-bold tabular-nums text-[var(--site-fg)]"
                              : "tabular-nums text-[var(--site-fg)]"
                          }
                        >
                          {highlighted ? <Star size={13} className="fill-current text-[var(--site-accent)]" /> : null}
                          {cell?.text ?? "—"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 第一问：点选 */}
      <div className="border-t border-[var(--site-border)] px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--site-muted)] uppercase">
          第一问 · 必须看表
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--site-fg)]">
          {card.question.prompt}
        </p>

        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="选择单元格">
          {card.question.options.map((option, index) => {
            const isAnswer = index === card.question.answer;
            const isWrong = wrongAt === index;
            const isPicked = picked === index;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isPicked}
                onClick={() => pick(index)}
                disabled={resolved}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  resolved && isAnswer
                    ? "border-[var(--site-accent)] bg-[var(--site-surface)] font-semibold text-[var(--site-accent)]"
                    : resolved
                      ? "border-[var(--site-border)] text-[var(--site-muted)] opacity-60"
                      : isWrong
                        ? "border-[var(--site-accent)] text-[var(--site-accent)]"
                        : "border-[var(--site-border)] text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                }`}
              >
                {resolved && isAnswer ? <Check size={14} className="mr-1 inline" /> : null}
                {option}
              </button>
            );
          })}
        </div>

        {wrongAt !== null && !resolved ? (
          <p
            ref={wrongHintRef}
            tabIndex={-1}
            role="status"
            className="mt-3 flex items-start gap-2 rounded-md border-l-2 border-[var(--site-accent)] bg-[var(--site-surface)] px-3 py-2.5 text-sm text-[var(--site-fg)] outline-none"
          >
            <CornerDownRight size={15} className="mt-0.5 shrink-0 text-[var(--site-accent)]" />
            <span>再看这个表头：{card.question.wrongHint}</span>
          </p>
        ) : null}
      </div>

      {/* 选对后的证据边界 */}
      {resolved ? (
        <div className="border-t border-[var(--site-border)] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--site-fg)]">
            <Check size={16} className="text-[var(--site-accent)]" />
            选对了。看这两处怎么比较：
          </div>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--site-fg)]">
            {card.question.explain.map((sentence) => (
              <li key={sentence} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--site-accent)]" />
                <span>{sentence}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShowBoundary((current) => !current)}
            aria-expanded={showBoundary}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
          >
            第二问：这张表不能证明什么？
            <span className="text-[var(--site-muted)]">{showBoundary ? "收起" : "展开"}</span>
          </button>

          {showBoundary ? (
            <>
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] p-4">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[var(--site-muted)] uppercase">
                    实验观察（表里直接可见）
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--site-fg)]">
                    {card.boundary.observation}
                  </p>
                </div>
                <div className="rounded-md border-l-2 border-[var(--site-accent)] bg-[var(--site-surface)] p-4">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[var(--site-muted)] uppercase">
                    作者推断（由此推出来的，不是表本身证明的）
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--site-fg)]">
                    {card.boundary.inference}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-[var(--site-muted)]">
                  读表的要点：把「表里实测的数」和「作者由此说的话」分开，才不会把推断当成事实。
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveGuide}
                  disabled={saveBusy}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)] disabled:opacity-70"
                >
                  <Download size={15} />
                  {saveBusy ? "正在保存…" : "保存读表要点"}
                </button>
                <span className="text-[11px] text-[var(--site-muted)]">1080×1440 · 可保存 PNG</span>
                {saveNote ? (
                  <p role="status" className="w-full text-xs text-[var(--site-muted)]">
                    {saveNote}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {/* 底部操作 */}
      <footer className="border-t border-[var(--site-border)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
            >
              <ArrowLeft size={15} />
              回到「{card.relatedSceneTitle}」那一幕
            </button>
            {resolved ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
              >
                重新读一遍
              </button>
            ) : null}
          </div>
          <a
            href={card.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--site-muted)] hover:text-[var(--site-accent)] sm:ml-auto"
          >
            核对原文 {card.tableId}
            <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>

      {/* 数据来源声明 */}
      <p className="border-t border-[var(--site-border)] px-5 py-3 text-[11px] leading-relaxed text-[var(--site-muted)] sm:px-6">
        本表数字经人工对照 {card.sourceVersion} {card.tableId} 核对，非模型生成；训练成本为作者估算值。数据如有出入，以原文为准。
      </p>
    </section>
  );
}
