import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  GitCompareArrows,
  Images,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";
import { PaperFigures } from "../components/PaperFigures";
import { CLASH_PAIRS, type ClashPair } from "../data/clashPairs";
import { getPaperFigures } from "../data/paperFigures";
import {
  KIND_DASH,
  KIND_LABEL,
  NODE_SHORT_LABEL,
  PAPER_RELATIONS,
  TOPIC_COLORS,
} from "../data/paperGraph";
import { PAPERS, PAPER_MAP, TOPIC_MAP } from "../data/papers";
import type { TopicId } from "../data/types";
import { CANVAS, CLUSTERS, STAR_POS, bendOf, curvePath } from "../data/starMap";
import { useLibrary } from "../lib/store";

const BASE = import.meta.env.BASE_URL;
const CLASH_COLOR = "#e11d48";

const topicOf = (id: string) => TOPIC_MAP.get(id as TopicId);

/** venue 常自带年份（如 "NeurIPS 2017"），再拼 year 会出现「2017 2017」 */
const venueLabel = (venue: string, year: number) =>
  /\b(19|20)\d{2}\b/.test(venue) ? venue : `${venue} ${year}`;

type Selection =
  | { type: "paper"; id: string }
  | { type: "pair"; id: string }
  | { type: "topic"; id: string }
  | null;

// 论文 → 所属主题簇（取第一个主题）
const CLUSTER_OF: Record<string, string> = Object.fromEntries(
  PAPERS.map((paper) => [paper.id, paper.topics[0] ?? "foundation"]),
);

// 论文 → 参与的对撞组
const PAIRS_OF: Record<string, ClashPair[]> = {};
for (const pair of CLASH_PAIRS) {
  for (const id of pair.papers) {
    PAIRS_OF[id] = PAIRS_OF[id] ?? [];
    PAIRS_OF[id].push(pair);
  }
}

// 对撞边：同一组内的两两连线
const CLASH_EDGES = (() => {
  const seen = new Set<string>();
  const edges: { a: string; b: string; pair: ClashPair }[] = [];
  for (const pair of CLASH_PAIRS) {
    for (let i = 0; i < pair.papers.length; i += 1) {
      for (let j = i + 1; j < pair.papers.length; j += 1) {
        const a = pair.papers[i];
        const b = pair.papers[j];
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ a, b, pair });
      }
    }
  }
  return edges;
})();

// 背景散点：固定种子，保证每次渲染一致
const STARS = (() => {
  let seed = 20261125;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const palette = Object.values(TOPIC_COLORS);
  return Array.from({ length: 64 }, (_, i) => ({
    id: i,
    x: next() * CANVAS.w,
    y: next() * CANVAS.h,
    r: 0.7 + next() * 1.6,
    o: 0.08 + next() * 0.2,
    c: palette[Math.floor(next() * palette.length)],
  }));
})();

// 系统级「减少动效」偏好：命中时不渲染 SMIL 光点与闪烁
function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduce;
}

function StarMap({
  selected,
  onSelect,
}: {
  selected: Selection;
  onSelect: (value: Selection) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const focusId = selected?.type === "paper" ? selected.id : null;
  const activePairId = selected?.type === "pair" ? selected.id : null;

  // 选中一篇时，把「引用/延伸」和「对撞」两类邻居都算作高亮范围
  const neighbors = useMemo(() => {
    const set = new Set<string>();
    if (!focusId) return set;
    for (const relation of PAPER_RELATIONS) {
      if (relation.from === focusId) set.add(relation.to);
      if (relation.to === focusId) set.add(relation.from);
    }
    for (const edge of CLASH_EDGES) {
      if (edge.a === focusId) set.add(edge.b);
      if (edge.b === focusId) set.add(edge.a);
    }
    return set;
  }, [focusId]);

  const nodeState = (id: string) => {
    if (hover === id) return "hover";
    if (focusId === id) return "active";
    if (focusId) return neighbors.has(id) ? "related" : "dim";
    if (activePairId) {
      const pair = CLASH_PAIRS.find((item) => item.id === activePairId);
      if (pair?.papers.includes(id)) return "related";
      return "dim";
    }
    return "idle";
  };

  const hovered = hover ? PAPER_MAP.get(hover) : null;
  const hoverFigs = hover ? getPaperFigures(hover) : [];

  return (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-full w-full"
          role="group"
          aria-label="论文对撞星图"
        >
          {/* 渐晕：让每个簇像一团星云，而不是一个实心圆 */}
          <defs>
            {CLUSTERS.map((cluster) => {
              const color = TOPIC_COLORS[cluster.topic] ?? "#3b82f6";
              return (
                <radialGradient id={`blob-${cluster.topic}`} key={cluster.topic}>
                  <stop offset="0%" stopColor={color} stopOpacity="0.16" />
                  <stop offset="62%" stopColor={color} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.015" />
                </radialGradient>
              );
            })}
          </defs>

          {/* 背景散点（极缓慢明暗呼吸，像真的星空） */}
          {STARS.map((star) => (
            <circle key={star.id} cx={star.x} cy={star.y} r={star.r} fill={star.c} opacity={star.o}>
              {reduceMotion ? null : (
                <animate
                  attributeName="opacity"
                  values={`${star.o};${Math.min(0.9, star.o * 2.6)};${star.o}`}
                  dur={`${4.5 + (star.id % 7) * 1.3}s`}
                  begin={`${(star.id % 11) * 0.6}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}

          {/* 主题簇 */}
          {CLUSTERS.map((cluster, clusterIndex) => {
            const color = TOPIC_COLORS[cluster.topic] ?? "#3b82f6";
            const topic = topicOf(cluster.topic);
            const count = PAPERS.filter((paper) => CLUSTER_OF[paper.id] === cluster.topic).length;
            const active = selected?.type === "topic" && selected.id === cluster.topic;
            return (
              <g
                key={cluster.topic}
                role="button"
                tabIndex={0}
                aria-label={`${topic?.name ?? cluster.topic}，${count} 篇`}
                className="cursor-pointer"
                onClick={() => onSelect(active ? null : { type: "topic", id: cluster.topic })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(active ? null : { type: "topic", id: cluster.topic });
                  }
                }}
              >
                <circle
                  cx={cluster.cx}
                  cy={cluster.cy}
                  r={cluster.r}
                  fill={`url(#blob-${cluster.topic})`}
                  stroke={color}
                  strokeOpacity={active ? 0.45 : 0.22}
                  strokeWidth={active ? 1.6 : 1}
                  strokeDasharray="3 7"
                  className="star-orbit transition-all duration-300"
                  style={{ animationDelay: `${clusterIndex * -2.4}s` }}
                />
                <text
                  x={cluster.cx}
                  y={cluster.cy - cluster.r - 12}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={650}
                  fill={color}
                  opacity={0.9}
                  letterSpacing={0.6}
                >
                  {topic?.name ?? cluster.topic} · {count}
                </text>
              </g>
            );
          })}

          {/* 引用 / 延伸关系（底层淡线 + 沿线流动的光包） */}
          <g>
            {PAPER_RELATIONS.map((relation, relationIndex) => {
              const a = STAR_POS[relation.from];
              const b = STAR_POS[relation.to];
              if (!a || !b) return null;
              const touching =
                focusId === relation.from ||
                focusId === relation.to ||
                hover === relation.from ||
                hover === relation.to;
              const d = curvePath(a, b, bendOf(relation.from, relation.to, 14));
              const flowColor = TOPIC_COLORS[CLUSTER_OF[relation.from]] ?? "#3b82f6";
              return (
                <g key={`${relation.from}-${relation.to}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--site-fg)"
                    strokeOpacity={touching ? 0.45 : 0.18}
                    strokeWidth={touching ? 1.3 : 1}
                    strokeDasharray={KIND_DASH[relation.kind]}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={flowColor}
                    strokeOpacity={touching ? 1 : 0.72}
                    strokeWidth={touching ? 2.6 : 2.1}
                    strokeDasharray="3 29"
                    strokeLinecap="round"
                    className="star-pulse"
                    style={{
                      animationDelay: `${-(relationIndex % 12) * 0.75}s`,
                      animationDuration: `${5 + (relationIndex % 5)}s`,
                    }}
                  />
                  <title>{`${NODE_SHORT_LABEL[relation.from]} → ${NODE_SHORT_LABEL[relation.to]} · ${KIND_LABEL[relation.kind]}`}</title>
                </g>
              );
            })}
          </g>

          {/* 对撞边（易混关系，红色虚线：电流式流动 + 沿线的光点） */}
          <g>
            {CLASH_EDGES.map((edge, edgeIndex) => {
              const a = STAR_POS[edge.a];
              const b = STAR_POS[edge.b];
              if (!a || !b) return null;
              const d = curvePath(a, b, bendOf(edge.a, edge.b, 26));
              const active =
                activePairId === edge.pair.id ||
                focusId === edge.a ||
                focusId === edge.b ||
                hover === edge.a ||
                hover === edge.b;
              const cometDur = 3.4 + (edgeIndex % 4) * 0.55;
              return (
                <g
                  key={`${edge.a}-${edge.b}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${edge.pair.title} 对照`}
                  className="cursor-pointer"
                  onClick={() => onSelect({ type: "pair", id: edge.pair.id })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect({ type: "pair", id: edge.pair.id });
                    }
                  }}
                >
                  <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
                  <path
                    d={d}
                    fill="none"
                    stroke={CLASH_COLOR}
                    strokeOpacity={active ? 0.95 : 0.5}
                    strokeWidth={active ? 2.1 : 1.5}
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                    className={`star-flow transition-all duration-200${active ? " star-flow-hot" : ""}`}
                  />
                  {reduceMotion ? null : (
                    <g style={{ pointerEvents: "none" }}>
                      <circle r={5.5} fill={CLASH_COLOR} opacity={0.16} />
                      <circle r={2.2} fill={CLASH_COLOR} opacity={0.9} />
                      <animateMotion
                        dur={`${cometDur}s`}
                        begin={`${(edgeIndex % 6) * 0.55}s`}
                        repeatCount="indefinite"
                        path={d}
                      />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.12;0.86;1"
                        dur={`${cometDur}s`}
                        begin={`${(edgeIndex % 6) * 0.55}s`}
                        repeatCount="indefinite"
                      />
                    </g>
                  )}
                  <title>{`${edge.pair.title} · 点这条线看对照`}</title>
                </g>
              );
            })}
          </g>

          {/* 论文星球 */}
          {PAPERS.map((paper) => {
            const pos = STAR_POS[paper.id];
            if (!pos) return null;
            const color = TOPIC_COLORS[CLUSTER_OF[paper.id]] ?? "#3b82f6";
            const state = nodeState(paper.id);
            const dim = state === "dim";
            const strong = state === "hover" || state === "active";
            const figs = getPaperFigures(paper.id).filter((item) => item.kind === "figure");
            return (
              <g
                key={paper.id}
                transform={`translate(${pos.x} ${pos.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${paper.titleZh}，${venueLabel(paper.venue, paper.year)}`}
                className="cursor-pointer outline-none"
                opacity={dim ? 0.52 : 1}
                onClick={() => onSelect({ type: "paper", id: paper.id })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect({ type: "paper", id: paper.id });
                  }
                }}
                onMouseEnter={() => setHover(paper.id)}
                onMouseLeave={() => setHover((current) => (current === paper.id ? null : current))}
                onFocus={() => setHover(paper.id)}
                onBlur={() => setHover((current) => (current === paper.id ? null : current))}
              >
                {strong ? <circle r={24} fill={color} opacity={0.12} /> : null}
                <circle
                  r={17.5}
                  fill="none"
                  stroke={color}
                  strokeOpacity={strong ? 0.5 : 0.22}
                  strokeWidth={1}
                  strokeDasharray={strong ? undefined : "2 3"}
                />
                <circle
                  r={strong ? 14.5 : 13}
                  fill="var(--site-bg)"
                  stroke={color}
                  strokeWidth={strong ? 2.4 : 1.7}
                  className="transition-all duration-200"
                />
                <circle r={6.2} fill={color} />
                {figs.length ? (
                  <circle cx={9.5} cy={-9.5} r={3.4} fill="var(--site-bg)" stroke={color} strokeWidth={1.2} />
                ) : null}
                <text
                  y={27}
                  textAnchor="middle"
                  fontSize={13.5}
                  fontWeight={strong ? 650 : 500}
                  fill="var(--site-fg)"
                  opacity={0.85}
                  style={{ paintOrder: "stroke", stroke: "var(--site-bg)", strokeWidth: 3.2 }}
                >
                  {NODE_SHORT_LABEL[paper.id] ?? paper.titleZh}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 悬停信息：固定在画布左下角的 HUD，避免浮层遮挡星图 */}
        {hovered ? (
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden w-64 rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)]/92 px-3.5 py-3 shadow-xl backdrop-blur sm:block">
            <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
              arXiv:{hovered.id}
            </p>
            <p className="font-display mt-1 text-sm leading-snug font-semibold text-[var(--site-fg)]">
              {hovered.titleZh}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--site-muted)]">
              {venueLabel(hovered.venue, hovered.year)}
              {hoverFigs.length
                ? ` · 原文图 ${hoverFigs.filter((i) => i.kind === "figure").length} 张`
                : ""}
            </p>
            <p className="mt-2 text-[11px] text-[var(--site-muted)]">点击查看对照与原文图表</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MobileClusters({
  selected,
  onSelect,
}: {
  selected: Selection;
  onSelect: (value: Selection) => void;
}) {
  return (
    <div className="mt-3 space-y-3 sm:hidden">
      {CLUSTERS.map((cluster) => {
        const color = TOPIC_COLORS[cluster.topic] ?? "#3b82f6";
        const topic = topicOf(cluster.topic);
        const papers = PAPERS.filter((paper) => CLUSTER_OF[paper.id] === cluster.topic);
        const active = selected?.type === "topic" && selected.id === cluster.topic;
        return (
          <div
            key={cluster.topic}
            className="rounded-[calc(var(--site-radius)+4px)] border p-3.5"
            style={{
              borderColor: active ? color : "var(--site-border)",
              background: active ? `${color}0d` : "transparent",
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(active ? null : { type: "topic", id: cluster.topic })}
              className="flex w-full items-baseline justify-between gap-2 text-left"
            >
              <span className="text-sm font-semibold" style={{ color }}>
                {topic?.name ?? cluster.topic} · {papers.length}
              </span>
              <span className="truncate text-[11px] text-[var(--site-muted)]">{topic?.note}</span>
            </button>
            <div className="mt-2.5 space-y-1.5">
              {papers.map((paper) => {
                const figs = getPaperFigures(paper.id).filter((item) => item.kind === "figure");
                const picked = selected?.type === "paper" && selected.id === paper.id;
                return (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => onSelect({ type: "paper", id: paper.id })}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      picked ? "bg-[var(--site-fg)] text-[var(--site-bg)]" : "bg-[var(--site-surface)]"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-offset-1"
                      style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}22` }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {paper.titleZh}
                      </span>
                      <span
                        className={`block text-[11px] ${
                          picked ? "text-[var(--site-bg)]/70" : "text-[var(--site-muted)]"
                        }`}
                      >
                        {venueLabel(paper.venue, paper.year)}
                      </span>
                    </span>
                    {figs.length ? (
                      <span
                        className={`shrink-0 text-[10px] ${
                          picked ? "text-[var(--site-bg)]/70" : "text-[var(--site-muted)]"
                        }`}
                      >
                        图 {figs.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PairBody({ pair, compact = false }: { pair: ClashPair; compact?: boolean }) {
  const sides = pair.sides
    .map((side) => ({ side, paper: PAPER_MAP.get(side.paperId) }))
    .filter((item) => Boolean(item.paper));

  return (
    <div>
      <p className="border-l-2 border-[var(--site-fg)] pl-3 text-sm leading-relaxed text-[var(--site-fg)]">
        {pair.divider}
      </p>

      <div
        className={`mt-4 grid gap-3 ${
          compact
            ? "grid-cols-1"
            : sides.length >= 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2"
        }`}
      >
        {sides.map(({ side, paper }) => {
          const figs = getPaperFigures(side.paperId).filter((item) => item.kind === "figure");
          return (
            <article
              key={side.paperId}
              className="flex min-w-0 flex-col rounded-[var(--site-radius)] bg-[var(--site-surface)] p-4"
            >
              {figs.length ? (
                <div className="mb-3 overflow-hidden rounded-md border border-[var(--site-border)] bg-white">
                  <img
                    src={`${BASE}${figs[0].files?.[0] ?? ""}`}
                    alt={`${figs[0].tag}：${figs[0].caption}`}
                    loading="lazy"
                    className="h-28 w-full object-contain"
                  />
                </div>
              ) : null}
              <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
                arXiv:{side.paperId} · {venueLabel(paper!.venue, paper!.year)}
              </p>
              <h3 className="font-display mt-1.5 text-base leading-snug font-semibold text-[var(--site-fg)]">
                {paper!.titleZh}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--site-fg)]">
                <span className="font-medium">一句话：</span>
                {side.gist}
              </p>
              <dl className="mt-3 space-y-2 text-xs leading-relaxed">
                <div>
                  <dt className="font-medium text-[var(--site-muted)]">方法差异</dt>
                  <dd className="mt-0.5 text-[var(--site-fg)]">{side.difference}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[var(--site-muted)]">适用场景</dt>
                  <dd className="mt-0.5 text-[var(--site-fg)]">{side.scene}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={`#/paper/${side.paperId}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--site-fg)] px-3.5 py-1.5 text-xs font-medium text-[var(--site-bg)]"
                >
                  进 90 秒微课
                  <ArrowUpRight size={13} />
                </a>
                <a
                  href={`#/paper/${side.paperId}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-medium text-[var(--site-muted)]"
                >
                  <Images size={12} />
                  原文图表 {figs.length}
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-start gap-2.5 rounded-[var(--site-radius)] border-l-2 px-4 py-3"
          style={{ borderColor: CLASH_COLOR, background: "var(--site-surface)" }}
        >
          <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: CLASH_COLOR }} />
          <p className="text-xs leading-relaxed text-[var(--site-fg)]">
            <span className="font-medium">最易混：</span>
            {pair.confusion}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-[var(--site-muted)]">
          <span className="font-medium text-[var(--site-fg)]">不能互相替代：</span>
          {pair.notReplace}
        </p>
        <p className="text-xs leading-relaxed text-[var(--site-muted)]">
          <span className="font-medium text-[var(--site-fg)]">怎么选：</span>
          {pair.scene}
        </p>
      </div>
    </div>
  );
}

function PaperPanel({ paperId, onSelectPair }: { paperId: string; onSelectPair: (id: string) => void }) {
  const paper = PAPER_MAP.get(paperId);
  const [openFigures, setOpenFigures] = useState(false);
  if (!paper) return null;

  const pairs = PAIRS_OF[paperId] ?? [];
  const side = pairs.flatMap((pair) => pair.sides).find((item) => item.paperId === paperId);
  const figures = getPaperFigures(paperId);
  const figCount = figures.filter((item) => item.kind === "figure").length;
  const tableCount = figures.length - figCount;
  const inbound = PAPER_RELATIONS.filter((relation) => relation.to === paperId);
  const outbound = PAPER_RELATIONS.filter((relation) => relation.from === paperId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
            arXiv:{paper.id} · {venueLabel(paper.venue, paper.year)}
          </p>
          <h2 className="font-display mt-1.5 text-xl leading-snug font-semibold text-[var(--site-fg)]">
            {paper.titleZh}
          </h2>
          <p className="mt-1 text-xs text-[var(--site-muted)]">{paper.title}</p>
        </div>
        <a
          href={`#/paper/${paper.id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--site-fg)] px-4 py-2 text-xs font-medium text-[var(--site-bg)]"
        >
          进 90 秒微课
          <ArrowUpRight size={13} />
        </a>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--site-fg)]">
        {side?.gist ?? paper.abstractZh}
      </p>

      {pairs.length ? (
        <div className="mt-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
            参与的对照
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pairs.map((pair) => (
              <button
                type="button"
                key={pair.id}
                onClick={() => onSelectPair(pair.id)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: CLASH_COLOR, color: CLASH_COLOR }}
              >
                <GitCompareArrows size={12} />
                {pair.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {figures.length ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
              原文图表 · 图 {figCount} / 表 {tableCount}
            </p>
            <button
              type="button"
              onClick={() => setOpenFigures((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs text-[var(--site-fg)]"
            >
              {openFigures ? <X size={12} /> : <Maximize2 size={12} />}
              {openFigures ? "收起图表" : "展开全部图表"}
            </button>
          </div>
          {openFigures ? (
            <div className="mt-4">
              <PaperFigures paperId={paperId} />
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {figures
                .filter((item) => item.kind === "figure")
                .slice(0, 4)
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setOpenFigures(true)}
                    className="group overflow-hidden rounded-lg border border-[var(--site-border)] bg-white"
                    aria-label={`查看${item.tag}`}
                  >
                    <img
                      src={`${BASE}${item.files?.[0] ?? ""}`}
                      alt={`${item.tag}：${item.caption}`}
                      loading="lazy"
                      className="h-24 w-full object-contain p-1.5 transition-transform group-hover:scale-[1.03]"
                    />
                    <span className="block border-t border-[var(--site-border)] px-2 py-1 text-left text-[10px] font-medium text-neutral-500">
                      {item.tag}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--site-muted)]">
          这篇还没抓取原文图表，可到{" "}
          <a
            href={`https://arxiv.org/html/${paper.id}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2"
          >
            arXiv 原文
          </a>{" "}
          查看。
        </p>
      )}

      <div className="mt-5 grid gap-2 text-xs leading-relaxed sm:grid-cols-2">
        <div>
          <p className="font-medium text-[var(--site-muted)]">它建立在</p>
          <ul className="mt-1 space-y-1">
            {outbound.length ? (
              outbound.map((relation) => (
                <li key={`out-${relation.to}`} className="text-[var(--site-fg)]">
                  {NODE_SHORT_LABEL[relation.to]}（{KIND_LABEL[relation.kind]}）
                </li>
              ))
            ) : (
              <li className="text-[var(--site-muted)]">库里暂无更早的关联论文</li>
            )}
          </ul>
        </div>
        <div>
          <p className="font-medium text-[var(--site-muted)]">谁建立在它之上</p>
          <ul className="mt-1 space-y-1">
            {inbound.length ? (
              inbound.map((relation) => (
                <li key={`in-${relation.from}`} className="text-[var(--site-fg)]">
                  {NODE_SHORT_LABEL[relation.from]}（{KIND_LABEL[relation.kind]}）
                </li>
              ))
            ) : (
              <li className="text-[var(--site-muted)]">暂无</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TopicPanel({ topicId }: { topicId: string }) {
  const topic = topicOf(topicId);
  const color = TOPIC_COLORS[topicId] ?? "#3b82f6";
  const papers = PAPERS.filter((paper) => CLUSTER_OF[paper.id] === topicId);
  const intra = CLASH_PAIRS.filter((pair) =>
    pair.papers.every((id) => CLUSTER_OF[id] === topicId),
  );

  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase" style={{ color }}>
        {topic?.name ?? topicId} · {papers.length} 篇
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--site-muted)]">{topic?.note}</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {papers.map((paper) => (
          <a
            key={paper.id}
            href={`#/paper/${paper.id}`}
            className="rounded-[var(--site-radius)] bg-[var(--site-surface)] px-3.5 py-3"
          >
            <p className="text-[11px] text-[var(--site-muted)]">
              {venueLabel(paper.venue, paper.year)}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--site-fg)]">{paper.titleZh}</p>
            <p className="mt-1 text-[11px] text-[var(--site-muted)]">{paper.abstractZh}</p>
          </a>
        ))}
      </div>

      {intra.length ? (
        <div className="mt-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
            簇内对照
          </p>
          <div className="mt-2 space-y-1.5">
            {intra.map((pair) => (
              <p key={pair.id} className="text-xs leading-relaxed text-[var(--site-fg)]">
                <span className="font-medium">{pair.title}</span>
                <span className="text-[var(--site-muted)]">：{pair.divider}</span>
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)]/70 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-[var(--site-muted)] uppercase">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color ?? "var(--site-accent)" }}
        />
        {label}
      </p>
      <p
        className="font-display mt-1 text-[26px] leading-none font-semibold tabular-nums"
        style={{ color: color ?? "var(--site-fg)" }}
      >
        {value}
      </p>
    </div>
  );
}

const GUIDE_STEPS = [
  {
    n: "01",
    title: "点一颗星球",
    desc: "看这篇的一句话定位、原文图表，以及它跟谁最容易混。",
  },
  {
    n: "02",
    title: "点一条红线",
    desc: "红色虚线 = 最容易搞混的那一对，点它看「一句话分界线」。",
  },
  {
    n: "03",
    title: "进对照或微课",
    desc: "对照卡里能直接跳 90 秒微课与原文，读完再回来。",
  },
];

const FIGURE_COUNT = PAPERS.reduce(
  (total, paper) => total + getPaperFigures(paper.id).filter((item) => item.kind === "figure").length,
  0,
);
const TABLE_COUNT = PAPERS.reduce(
  (total, paper) => total + getPaperFigures(paper.id).filter((item) => item.kind === "table").length,
  0,
);

export function ClashPage() {
  const { library } = useLibrary();
  const [view, setView] = useState<"map" | "list">("map");
  const [selected, setSelected] = useState<Selection>(null);
  const [openPairId, setOpenPairId] = useState<string | null>(CLASH_PAIRS[0]?.id ?? null);

  const paperOf = (id: string) => library.find((paper) => paper.id === id) ?? PAPER_MAP.get(id);

  const selectedPair = useMemo(
    () =>
      selected?.type === "pair" ? CLASH_PAIRS.find((p) => p.id === selected.id) ?? null : null,
    [selected],
  );

  const activeTopic = selected?.type === "topic" ? selected.id : null;

  return (
    <div className="mx-auto flex w-full flex-col px-3 pt-4 pb-6 sm:px-5 lg:h-full lg:min-h-0 lg:px-4 lg:pt-3 lg:pb-3">
      {/* 顶部：定位 + 四个统计 */}
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-[0.2em] text-[var(--site-muted)] uppercase">
            Clash · 对照着读
          </p>
          <h1 className="font-display mt-2 text-[26px] leading-none font-semibold tracking-tight text-[var(--site-fg)] sm:text-[32px]">
            论文对撞
          </h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-[var(--site-muted)]">
            五个方向、十五颗星球。灰线是引用与延伸，红线是「最容易搞混」的那一对——先看分界线，再进单篇。
          </p>
        </div>

        <div className="grid w-full grid-cols-4 gap-2 sm:w-auto">
          <Stat label="论文" value={PAPERS.length} />
          <Stat label="对撞组" value={CLASH_PAIRS.length} color={CLASH_COLOR} />
          <Stat label="原文图表" value={FIGURE_COUNT + TABLE_COUNT} />
          <Stat label="方向" value={CLUSTERS.length} />
        </div>
      </header>

      {/* 上手条：图例 + 一键演示 */}
      <div className="mt-3 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)]/80 px-3 py-2 text-[11.5px] text-[var(--site-muted)]">
        <span className="rounded-full bg-[var(--site-fg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--site-bg)]">
          90″ 上手
        </span>
        <span className="hidden sm:inline">图例：</span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="18"
              y2="3"
              stroke="var(--site-fg)"
              strokeOpacity="0.4"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          </svg>
          引用 / 延伸
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="18"
              y2="3"
              stroke={CLASH_COLOR}
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
          </svg>
          易混对撞
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative inline-block h-3 w-3 rounded-full border border-[var(--site-muted)]">
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--site-fg)]" />
          </span>
          有原文图表
        </span>
        <span className="hidden items-center gap-1.5 md:inline-flex">
          {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
            <span
              key={topic}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              title={topicOf(topic)?.name ?? topic}
            />
          ))}
          五个方向
        </span>

        <button
          type="button"
          onClick={() => {
            setView("map");
            setSelected({ type: "pair", id: CLASH_PAIRS[0].id });
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--site-accent)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--site-on-accent)] transition-opacity hover:opacity-90"
        >
          <Sparkles size={13} />
          先看一组对撞
        </button>
      </div>

      {/* 主体：左栏筛选 + 画布 + 右侧详情 */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="star-board relative flex min-h-[380px] flex-1 flex-col overflow-hidden rounded-[16px] border border-[var(--site-border)] lg:min-h-0 lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* 画布顶栏 */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--site-border)] px-4 py-2">
            <p className="truncate text-[10px] font-medium tracking-[0.18em] text-[var(--site-muted)] uppercase">
              <span className="hidden sm:inline">Clash constellation · </span>
              {view === "map" ? "论文对撞星图" : "对照清单"}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[11px] text-[var(--site-muted)] sm:block">
                {activeTopic ? `${topicOf(activeTopic)?.name ?? activeTopic} · 已聚焦` : "15 篇 · 6 组易混"}
              </span>
              <div className="flex rounded-full border border-[var(--site-border)] p-0.5 text-[11px] lg:hidden">
                {(
                  [
                    { id: "map", label: "星图" },
                    { id: "list", label: "清单" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    aria-pressed={view === item.id}
                    className={`rounded-full px-2.5 py-1 font-medium whitespace-nowrap transition-colors ${
                      view === item.id
                        ? "bg-[var(--site-fg)] text-[var(--site-bg)]"
                        : "text-[var(--site-muted)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 画布本体 */}
          <div className="relative min-h-0 flex-1">
            {!selected && view === "map" ? (
              <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-[var(--site-border)] bg-[var(--site-bg)]/85 px-3 py-1.5 text-[11px] whitespace-nowrap text-[var(--site-muted)] backdrop-blur sm:block">
                点一颗星球看原文图表 · 点一条红线看「最容易搞混」的分界线
              </p>
            ) : null}
            {view === "map" ? (
              <>
                <div className="hidden h-full sm:block">
                  <StarMap selected={selected} onSelect={setSelected} />
                </div>
                <div className="h-full overflow-y-auto p-3 sm:hidden">
                  <MobileClusters selected={selected} onSelect={setSelected} />
                </div>
              </>
            ) : (              <div className="h-full overflow-y-auto p-3 sm:p-4">
                <div className="space-y-3">
                  {CLASH_PAIRS.map((pair) => {
                    const open = openPairId === pair.id;
                    const sides = pair.sides
                      .map((side) => ({ side, paper: paperOf(side.paperId) }))
                      .filter((item) => Boolean(item.paper));

                    return (
                      <section
                        key={pair.id}
                        className="rounded-[calc(var(--site-radius)+2px)] border border-[var(--site-border)] bg-[var(--site-bg)]"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenPairId(open ? null : pair.id)}
                          aria-expanded={open}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left"
                        >
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[var(--site-surface)] text-[var(--site-fg)]">
                            <GitCompareArrows size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-2">
                              <span className="font-display text-base font-semibold text-[var(--site-fg)]">
                                {pair.title}
                              </span>
                              <span className="text-[11px] text-[var(--site-muted)]">
                                {sides.map(({ paper }) => paper!.titleZh).join(" · ")}
                              </span>
                            </span>
                            <span className="mt-1.5 block border-l-2 border-[var(--site-fg)] pl-2.5 text-[13px] leading-relaxed text-[var(--site-fg)]">
                              {pair.divider}
                            </span>
                          </span>
                          <ChevronDown
                            size={15}
                            className={`mt-1 shrink-0 text-[var(--site-muted)] transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {open ? (
                          <div className="border-t border-[var(--site-border)] px-4 py-4">
                            <PairBody pair={pair} />
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* 详情：桌面并排成右栏（不遮挡星图），手机跟在下方 */}
          {selected ? (
            <aside className="star-panel shrink-0 border-t border-[var(--site-border)] p-4 lg:w-[352px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.14em] text-[var(--site-muted)] uppercase">
                  {selected.type === "paper"
                    ? "论文星球"
                    : selected.type === "pair"
                      ? "对撞详情"
                      : "主题簇"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="关闭详情"
                  className="rounded-full p-1.5 text-[var(--site-muted)] hover:bg-[var(--site-surface)] hover:text-[var(--site-fg)]"
                >
                  <X size={15} />
                </button>
              </div>
              {selected.type === "paper" ? (
                <PaperPanel
                  paperId={selected.id}
                  onSelectPair={(id) => setSelected({ type: "pair", id })}
                />
              ) : null}
              {selected.type === "pair" && selectedPair ? (
                <>
                  <h2 className="font-display text-lg leading-snug font-semibold text-[var(--site-fg)]">
                    {selectedPair.title}
                  </h2>
                  <div className="mt-2.5">
                    <PairBody pair={selectedPair} compact />
                  </div>
                </>
              ) : null}
              {selected.type === "topic" ? <TopicPanel topicId={selected.id} /> : null}
            </aside>
          ) : null}
        </div>

        {/* 左栏：筛选 / 视图 / 说明（桌面） */}
        <aside className="hidden w-[212px] shrink-0 flex-col gap-2 lg:flex lg:order-first lg:min-h-0 lg:overflow-y-auto lg:pr-0.5">
          <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-2.5">
            <p className="px-1 text-[10px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
              筛选 · 主题簇
            </p>
            <div className="mt-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors ${
                  activeTopic ? "hover:bg-[var(--site-surface)]" : "bg-[var(--site-surface)] font-medium"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-[var(--site-fg)]" />
                <span className="flex-1">全部</span>
                <span className="text-[11px] text-[var(--site-muted)]">{PAPERS.length}</span>
              </button>
              {CLUSTERS.map((cluster) => {
                const color = TOPIC_COLORS[cluster.topic] ?? "#3b82f6";
                const count = PAPERS.filter((paper) => CLUSTER_OF[paper.id] === cluster.topic).length;
                const active = activeTopic === cluster.topic;
                return (
                  <button
                    key={cluster.topic}
                    type="button"
                    onClick={() =>
                      setSelected(active ? null : { type: "topic", id: cluster.topic })
                    }
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors ${
                      active ? "bg-[var(--site-surface)] font-medium" : "hover:bg-[var(--site-surface)]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="flex-1 truncate">{topicOf(cluster.topic)?.name ?? cluster.topic}</span>
                    <span className="text-[11px] text-[var(--site-muted)]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-2.5">
            <p className="px-1 text-[10px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
              视图
            </p>
            <div className="mt-1.5 flex rounded-full border border-[var(--site-border)] p-0.5 text-[11.5px]">
              {(
                [
                  { id: "map", label: "星图" },
                  { id: "list", label: "对照清单" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  aria-pressed={view === item.id}
                  className={`flex-1 rounded-full px-2 py-1 font-medium transition-colors ${
                    view === item.id
                      ? "bg-[var(--site-fg)] text-[var(--site-bg)]"
                      : "text-[var(--site-muted)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-2.5">
            <p className="px-1 text-[10px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
              怎么用
            </p>
            <ol className="mt-1.5 space-y-1.5">
              {GUIDE_STEPS.map((step) => (
                <li key={step.n} className="flex gap-1.5 text-[11.5px] leading-relaxed">
                  <span className="font-display shrink-0 font-semibold text-[var(--site-accent)]">
                    {step.n}
                  </span>
                  <span className="text-[var(--site-muted)]">
                    <span className="font-medium text-[var(--site-fg)]">{step.title}</span>
                    <span className="mt-0.5 block">{step.desc}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* 手机：使用说明 */}
      <div className="mt-3 rounded-[var(--site-radius)] border border-[var(--site-border)] p-3 lg:hidden">
        <p className="text-[10px] font-medium tracking-[0.16em] text-[var(--site-muted)] uppercase">
          怎么用 · 三步
        </p>
        <ol className="mt-2 space-y-1.5">
          {GUIDE_STEPS.map((step) => (
            <li key={step.n} className="flex gap-2 text-[11.5px] leading-snug">
              <span className="font-display shrink-0 font-semibold text-[var(--site-accent)]">
                {step.n}
              </span>
              <span className="text-[var(--site-muted)]">
                <span className="font-medium text-[var(--site-fg)]">{step.title}</span> · {step.desc}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--site-muted)]">
        分界线与差异点对照论文摘要 / 原文整理；图上图表取自 arXiv HTML 版原文（{FIGURE_COUNT} 张图、
        {TABLE_COUNT} 张表），点开可放大。
      </p>
    </div>
  );
}
