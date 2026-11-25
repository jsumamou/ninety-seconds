import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { PAPERS, TOPICS } from "../data/papers";
import {
  KIND_DASH,
  KIND_LABEL,
  NODE_LAYOUT,
  NODE_SHORT_LABEL,
  PAPER_RELATIONS,
  TOPIC_COLORS,
} from "../data/paperGraph";

const NODE_W = 136;
const NODE_H = 54;
const EDGE_COLOR = "#9ca3af";

interface Point {
  x: number;
  y: number;
}

function edgePoint(from: Point, to: Point, pad: number): Point {
  const hw = NODE_W / 2 + pad;
  const hh = NODE_H / 2 + pad;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: to.x, y: to.y };
  const tx = Math.abs(dx) < 1e-6 ? Infinity : hw / Math.abs(dx);
  const ty = Math.abs(dy) < 1e-6 ? Infinity : hh / Math.abs(dy);
  const t = Math.min(tx, ty);
  return { x: to.x - dx * t, y: to.y - dy * t };
}

function LegendLine({ dash, label }: { dash?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[var(--site-muted)]">
      <svg width="34" height="10" aria-hidden="true">
        <line
          x1="0"
          y1="5"
          x2="34"
          y2="5"
          stroke={EDGE_COLOR}
          strokeWidth="1.6"
          strokeDasharray={dash}
        />
      </svg>
      {label}
    </span>
  );
}

export function MapPage({ focusId }: { focusId?: string }) {
  const nodes = useMemo(
    () =>
      PAPERS.map((paper) => {
        const pos = NODE_LAYOUT[paper.id];
        const topic = paper.topics[0] ?? "foundation";
        return {
          id: paper.id,
          x: pos.x,
          y: pos.y,
          label: NODE_SHORT_LABEL[paper.id] ?? paper.titleZh,
          year: paper.year,
          topic,
          color: TOPIC_COLORS[topic] ?? "#3b82f6",
        };
      }),
    [],
  );

  const edges = useMemo(() => {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    return PAPER_RELATIONS.filter(
      (rel) => byId.has(rel.from) && byId.has(rel.to),
    ).map((rel) => {
      const from = byId.get(rel.from)!;
      const to = byId.get(rel.to)!;
      return {
        ...rel,
        start: edgePoint(to, from, 2),
        end: edgePoint(from, to, 2),
      };
    });
  }, [nodes]);

  const focused = focusId && NODE_LAYOUT[focusId] ? focusId : undefined;
  const focusedNode = focused ? nodes.find((node) => node.id === focused) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16 sm:px-8">
      <a
        href="#/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]"
      >
        <ArrowLeft size={15} />
        资料库
      </a>

      <header className="mt-6">
        <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-[var(--site-fg)] sm:text-4xl">
          文献地图
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--site-muted)]">
          资料库里 15 篇论文的真实学术脉络：谁基于谁、谁改进了谁、谁和谁是同一问题的不同解法。
          14 条关系均与 arXiv 原文的参考文献逐一核对。点任意节点进入该篇论文。
        </p>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendLine label="改进 / 延伸" />
        <LegendLine dash="7 5" label="引用" />
        <LegendLine dash="2 5" label="对比" />
        <span className="inline-flex items-center gap-2 text-xs text-[var(--site-muted)]">
          <svg width="16" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="12" y2="5" stroke={EDGE_COLOR} strokeWidth="1.6" />
            <path d="M 9 1.5 L 14 5 L 9 8.5 z" fill={EDGE_COLOR} />
          </svg>
          箭头指向被引用 / 被改进的论文
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {TOPICS.map((topic) => (
          <span
            key={topic.id}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--site-muted)]"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TOPIC_COLORS[topic.id] ?? "#3b82f6" }}
            />
            {topic.name}
          </span>
        ))}
        {focusedNode ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--site-surface)] px-2.5 py-1 text-[11px] text-[var(--site-fg)]">
            高亮中：{focusedNode.label}
            <a href="#/map" className="text-[var(--site-accent)] hover:underline">
              取消
            </a>
          </span>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-surface)] p-3 sm:p-4">
        <svg
          viewBox="0 0 1200 860"
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full min-w-[560px] text-[var(--site-fg)] sm:min-w-[820px]"
          role="img"
          aria-label="十五篇论文的引用关系图，按主题分组着色"
        >
          <defs>
            <marker
              id="map-arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1 L 8.5 5 L 0 9 z" fill={EDGE_COLOR} />
            </marker>
          </defs>

          {edges.map((edge) => {
            const incident = focused
              ? edge.from === focused || edge.to === focused
              : true;
            return (
              <g key={`${edge.from}-${edge.to}`} opacity={focused && !incident ? 0.18 : 1}>
                <title>
                  {`${NODE_SHORT_LABEL[edge.from]} ${KIND_LABEL[edge.kind]} ${
                    NODE_SHORT_LABEL[edge.to]
                  }`}
                </title>
                <line
                  x1={edge.start.x}
                  y1={edge.start.y}
                  x2={edge.end.x}
                  y2={edge.end.y}
                  stroke={EDGE_COLOR}
                  strokeWidth={focused && incident ? 2 : 1.5}
                  strokeDasharray={KIND_DASH[edge.kind]}
                  markerEnd="url(#map-arrow)"
                />
              </g>
            );
          })}

          {nodes.map((node) => {
            const dimmed = focused ? node.id !== focused : false;
            return (
              <a
                key={node.id}
                href={`#/paper/${node.id}`}
                className="map-node"
                aria-label={`${node.label}（${node.year}）`}
              >
                <g opacity={dimmed ? 0.4 : 1}>
                  <title>{`${node.label} · ${node.year} · ${TOPICS.find((t) => t.id === node.topic)?.name ?? ""}`}</title>
                  {focused === node.id ? (
                    <rect
                      x={node.x - 72}
                      y={node.y - 31}
                      width={NODE_W + 8}
                      height={NODE_H + 8}
                      rx={12}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="3.5"
                      opacity="0.35"
                    />
                  ) : null}
                  <rect
                    x={node.x - NODE_W / 2}
                    y={node.y - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={`${node.color}26`}
                    stroke={node.color}
                    strokeWidth={focused === node.id ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 3}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={focused === node.id ? 700 : 500}
                    fill="currentColor"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 19}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {node.year}
                  </text>
                </g>
              </a>
            );
          })}
        </svg>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--site-muted)]">
        关系标注原则：只标能核实的真实脉络，标不准的宁可不标。库里论文数量少，图用固定坐标布局，稳定优先。
      </p>
    </div>
  );
}
