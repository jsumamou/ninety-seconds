import type { BoardElement, Ink, Scene } from "../data/types";

const INK_COLORS: Record<Ink, string> = {
  chalk: "#ece7dc",
  dim: "#8c887f",
  accent: "#e9a178",
  mint: "#9ec9b7",
};

const FONT = 'var(--site-font, "Noto Sans SC", sans-serif)';
const ANIM_MS = 700;

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3);
}

function easeInOutQuad(p: number) {
  return p * (2 - p);
}

function progress(localT: number, at?: number): number {
  return Math.max(0, Math.min(1, (localT - (at ?? 0)) / ANIM_MS));
}

function reveal(p: number): number {
  if (p <= 0.85) return 0;
  return Math.min(1, (p - 0.85) / 0.15);
}

function RenderElement({ element, p }: { element: BoardElement; p: number }) {
  const ink = element.ink ?? "chalk";
  const color = INK_COLORS[ink];
  const write = easeOutCubic(p);
  const draw = easeInOutQuad(p);

  switch (element.kind) {
    case "text":
      return (
        <text
          x={element.x}
          y={element.y}
          fill={color}
          fontFamily={FONT}
          fontSize={element.size ?? 26}
          fontWeight={element.weight ?? 400}
          textAnchor={element.anchor ?? "start"}
          style={{ clipPath: `inset(0 ${(1 - write) * 100}% 0 0)` }}
        >
          {element.text}
        </text>
      );
    case "formula":
      return (
        <text
          x={element.x}
          y={element.y}
          fill={color}
          fontFamily={'"Cambria Math", Georgia, serif'}
          fontSize={element.size ?? 28}
          fontStyle="italic"
          style={{ clipPath: `inset(0 ${(1 - write) * 100}% 0 0)` }}
        >
          {element.text}
        </text>
      );
    case "arrow":
      return (
        <line
          x1={element.x1}
          y1={element.y1}
          x2={element.x2}
          y2={element.y2}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={element.dashed ? "8 8" : undefined}
          markerEnd={
            element.head === false || draw < 0.85 ? undefined : `url(#arrow-${ink})`
          }
          pathLength={element.dashed ? undefined : 1}
          strokeDashoffset={element.dashed ? undefined : 1 - draw}
          opacity={element.dashed ? draw : undefined}
        />
      );
    case "path":
      return (
        <path
          d={element.d}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDashoffset={1 - draw}
        />
      );
    case "box": {
      const label = element.label;
      const sub = element.sub;
      const centerX = element.x + element.w / 2;
      const centerY = element.y + element.h / 2;
      const labelP = reveal(p);
      return (
        <g>
          <rect
            x={element.x}
            y={element.y}
            width={element.w}
            height={element.h}
            rx={10}
            fill="rgba(255,255,255,0.022)"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={element.dashed ? "8 8" : undefined}
            pathLength={element.dashed ? undefined : 1}
            strokeDashoffset={element.dashed ? undefined : 1 - draw}
            opacity={element.dashed ? draw : undefined}
          />
          {label ? (
            <text
              x={centerX}
              y={sub ? centerY - 3 : centerY + 8}
              fill={color}
              fontFamily={FONT}
              fontSize={24}
              textAnchor="middle"
              opacity={labelP}
            >
              {label}
            </text>
          ) : null}
          {sub ? (
            <text
              x={centerX}
              y={centerY + 30}
              fill={INK_COLORS.dim}
              fontFamily={FONT}
              fontSize={17}
              textAnchor="middle"
              opacity={labelP}
            >
              {sub}
            </text>
          ) : null}
        </g>
      );
    }
    case "circle": {
      const labelP = reveal(p);
      return (
        <g opacity={p <= 0 ? 0 : 1}>
          <circle
            cx={element.cx}
            cy={element.cy}
            r={element.r * write}
            fill="rgba(255,255,255,0.03)"
            stroke={color}
            strokeWidth={2}
          />
          {element.label ? (
            <text
              x={element.cx}
              y={element.cy + 7}
              fill={color}
              fontFamily={FONT}
              fontSize={20}
              textAnchor="middle"
              opacity={labelP}
            >
              {element.label}
            </text>
          ) : null}
        </g>
      );
    }
    default:
      return null;
  }
}

export function BoardStage({
  scene,
  label,
  playing,
  localT,
}: {
  scene: Scene;
  label: string;
  playing: boolean;
  localT: number;
}) {
  return (
    <div className="board-surface relative overflow-hidden">
      <div className="board-grid absolute inset-0" aria-hidden="true" />
      <svg
        key={`${scene.id}-${label}`}
        viewBox="0 0 960 540"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label={`${scene.title} 的板书动画`}
      >
        <defs>
          {(Object.keys(INK_COLORS) as Ink[]).map((ink) => (
            <marker
              key={ink}
              id={`arrow-${ink}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={INK_COLORS[ink]} />
            </marker>
          ))}
        </defs>
        {scene.board.map((element, index) => {
          const p = progress(localT, element.at);
          if (p <= 0) return null;
          return <RenderElement key={index} element={element} p={p} />;
        })}
      </svg>
      <div className="board-glow pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}
