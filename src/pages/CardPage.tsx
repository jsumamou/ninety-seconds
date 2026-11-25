import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { PAPER_MAP } from "../data/papers";
import type { Paper } from "../data/types";
import { exportSvgAsPng, wrapText } from "../lib/exportCard";
import { getCourse } from "../lib/generated";
import { topicLabel, useLibrary } from "../lib/store";

const W = 1080;
const H = 1440;
const PAD = 84;

export function CardPage({ paperId }: { paperId: string }) {
  const { library } = useLibrary();
  const paper: Paper | undefined = library.find((item) => item.id === paperId) ?? PAPER_MAP.get(paperId);
  const course = getCourse(paperId);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  if (!paper) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--site-muted)]">没有这篇论文的学习卡。</p>
        <a href="#/" className="mt-4 inline-block text-sm text-[var(--site-accent)]">返回资料库</a>
      </div>
    );
  }

  const displayTitle = course?.titleZh ?? paper.titleZh;
  const titleLines = wrapText(displayTitle, 18, 2);
  const idea = course?.bigIdea ?? paper.abstractZh;
  const ideaLines = wrapText(idea, 22, 3);
  const concepts =
    course?.scenes.slice(0, 3).map((scene) => scene.title) ??
    [topicLabel(paper.topics[0]), "90 秒微课", "一页图解"];

  const titleStart = 300;
  const ideaStart = titleStart + titleLines.length * 70 + 96;
  const ideaEnd = ideaStart + ideaLines.length * 84;
  const conceptStart = ideaEnd + 110;

  const save = async () => {
    const svg = svgRef.current;
    if (!svg || busy) return;
    setBusy(true);
    setNote("");
    try {
      const outcome = await exportSvgAsPng(svg, W, H, `九十秒-${paper.id}.png`);
      if (outcome === "ok") setNote("学习卡已保存。");
      else if (outcome === "svg-fallback") setNote("这个浏览器导不出 PNG，已在新标签打开 SVG。");
      else setNote("保存失败，请重试。");
    } catch {
      setNote("保存失败，请重试。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 px-4 py-8">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="h-auto w-full rounded-[18px] shadow-xl"
        role="img"
        aria-label={`${displayTitle} 的学习卡`}
      >
        <rect width={W} height={H} fill="#14181d" />
        <rect x="0" y="0" width="10" height={H} fill="#b4472e" />
        <text x={PAD} y="122" fill="#ece7dc" fontFamily="'Source Han Serif SC', 'Noto Serif SC', serif" fontSize="38" fontWeight="600">
          九十秒
        </text>
        <text x={W - PAD} y="120" fill="#8c887f" fontFamily="'Noto Sans SC', sans-serif" fontSize="20" textAnchor="end" letterSpacing="4">
          PAPER CARD
        </text>
        <line x1={PAD} y1="164" x2={W - PAD} y2="164" stroke="#2c3238" strokeWidth="2" />

        <text x={PAD} y="232" fill="#e9a178" fontFamily="'Noto Sans SC', sans-serif" fontSize="20" letterSpacing="6">
          {paper.venue.toUpperCase().includes(String(paper.year))
            ? paper.venue.toUpperCase()
            : `${paper.venue.toUpperCase()} · ${paper.year}`}
        </text>

        {titleLines.map((line, index) => (
          <text
            key={`title-${index}`}
            x={PAD}
            y={titleStart + index * 70}
            fill="#ece7dc"
            fontFamily="'Source Han Serif SC', 'Noto Serif SC', serif"
            fontSize="58"
            fontWeight="600"
          >
            {line}
          </text>
        ))}

        {ideaLines.map((line, index) => (
          <text
            key={`idea-${index}`}
            x={PAD}
            y={ideaStart + index * 84}
            fill="#e9a178"
            fontFamily="'Source Han Serif SC', 'Noto Serif SC', serif"
            fontSize="62"
            fontWeight="600"
          >
            {line}
          </text>
        ))}

        <text x={PAD} y={conceptStart} fill="#8c887f" fontFamily="'Noto Sans SC', sans-serif" fontSize="20" letterSpacing="6">
          三个核心概念
        </text>
        {concepts.slice(0, 3).map((concept, index) => (
          <g key={`concept-${index}`}>
            <text
              x={PAD}
              y={conceptStart + 78 + index * 108}
              fill="#b4472e"
              fontFamily="'Noto Serif SC', serif"
              fontSize="30"
            >
              {String(index + 1).padStart(2, "0")}
            </text>
            <text
              x={PAD + 72}
              y={conceptStart + 78 + index * 108}
              fill="#ece7dc"
              fontFamily="'Noto Sans SC', sans-serif"
              fontSize="34"
            >
              {concept}
            </text>
          </g>
        ))}

        <line x1={PAD} y1="1276" x2={W - PAD} y2="1276" stroke="#2c3238" strokeWidth="2" />
        <text x={PAD} y="1332" fill="#8c887f" fontFamily="'Noto Sans SC', sans-serif" fontSize="24">
          本篇 90 秒 · {course?.quiz.length ?? 12} 道自测 · 来源 arxiv.org/abs/{paper.id}
        </text>
        <text x={W - PAD} y="1394" fill="#5d5952" fontFamily="'Noto Sans SC', sans-serif" fontSize="20" textAnchor="end">
          © 2026 九十秒
        </text>
      </svg>

      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <a href="#/" className="text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]">
          ← 返回
        </a>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)] disabled:opacity-70"
        >
          <Download size={15} />
          {busy ? "正在保存…" : "保存学习卡"}
        </button>
      </div>
      {note ? <p className="w-full text-xs text-[var(--site-muted)]">{note}</p> : null}
    </div>
  );
}