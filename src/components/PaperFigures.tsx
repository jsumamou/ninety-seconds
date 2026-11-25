import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, X, ZoomIn } from "lucide-react";
import { getPaperFigures, type PaperFigureItem } from "../data/paperFigures";

function TablePanel({
  item,
  paperId,
  html,
  failed,
}: {
  item: PaperFigureItem;
  paperId: string;
  html: string | null;
  failed: boolean;
}) {
  return (
    <div className="arxiv-table max-h-[520px] overflow-auto rounded-b-[calc(var(--site-radius)-2px)] border border-[var(--site-border)] bg-white p-3 sm:p-4">
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
      {!html && !failed ? <p className="p-4 text-xs text-neutral-400">正在加载表格…</p> : null}
      {failed ? (
        <p className="p-4 text-xs leading-relaxed text-neutral-500">
          表格加载失败，请到{" "}
          <a
            href={`https://arxiv.org/html/${paperId}#${item.id}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2"
          >
            原文
          </a>{" "}
          查看。
        </p>
      ) : null}
    </div>
  );
}

function ItemHeader({ item, paperId }: { item: PaperFigureItem; paperId: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-[var(--site-radius)] border border-[var(--site-border)] border-b-0 bg-[var(--site-surface)] px-4 py-2.5">
      <span className="text-xs font-semibold tracking-[0.14em] text-[var(--site-fg)]">
        {item.tag}
      </span>
      <a
        href={`https://arxiv.org/html/${paperId}#${item.id}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[11px] text-[var(--site-muted)] hover:text-[var(--site-accent)]"
      >
        原文位置
        <ArrowUpRight size={12} />
      </a>
    </div>
  );
}

function FigureAsset({
  file,
  caption,
  variant = "card",
}: {
  file: string;
  caption: string;
  variant?: "card" | "lightbox";
}) {
  const src = `${import.meta.env.BASE_URL}${file}`;
  const sizeClass = variant === "lightbox" ? "max-h-[64vh]" : "max-h-[420px]";
  if (file.toLowerCase().endsWith(".svg")) {
    return (
      <object
        data={src}
        type="image/svg+xml"
        aria-label={caption}
        className={`pointer-events-none w-auto max-w-full rounded-sm ${sizeClass}`}
      >
        <img src={src} alt={caption} className={`w-auto max-w-full rounded-sm ${sizeClass}`} />
      </object>
    );
  }
  return (
    <img
      src={src}
      alt={caption}
      loading="lazy"
      className={`w-auto max-w-full rounded-sm ${sizeClass}`}
    />
  );
}

export function PaperFigures({ paperId }: { paperId: string }) {
  const items = useMemo(() => getPaperFigures(paperId), [paperId]);
  const [tables, setTables] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<PaperFigureItem | null>(null);

  useEffect(() => {
    let alive = true;
    setTables({});
    setFailed({});
    for (const item of items) {
      if (item.kind !== "table" || !item.tableSrc) continue;
      fetch(`${import.meta.env.BASE_URL}${item.tableSrc}`)
        .then((response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.text();
        })
        .then((text) => {
          if (!alive) return;
          setTables((current) => ({ ...current, [item.id]: text }));
        })
        .catch(() => {
          if (!alive) return;
          setFailed((current) => ({ ...current, [item.id]: true }));
        });
    }
    return () => {
      alive = false;
    };
  }, [items]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const figureCount = items.filter((item) => item.kind === "figure").length;
  const tableCount = items.length - figureCount;

  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-[var(--site-muted)]">
        共 {figureCount} 张图 · {tableCount} 张表，取自论文原文（arXiv HTML 版）。点击图片可放大，表格可横向滚动。
      </p>
      {items.map((item) => (
        <div key={item.id}>
          <ItemHeader item={item} paperId={paperId} />
          {item.kind === "figure" && item.files ? (
            <div className="rounded-b-[var(--site-radius)] border border-[var(--site-border)] bg-white px-3 pt-4 pb-4 sm:px-4">
              <div className="flex flex-wrap items-start justify-center gap-3">
                {item.files.map((file, index) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => setLightbox(item)}
                    aria-label={`放大${item.tag}（第 ${index + 1} 幅）`}
                    className="group relative max-w-full cursor-zoom-in"
                  >
                    <FigureAsset file={file} caption={`${item.tag} ${item.caption}`} />
                    <span className="absolute right-2 bottom-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <ZoomIn size={14} />
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 px-1 text-[13px] leading-relaxed text-neutral-600">
                <span className="mr-1.5 font-semibold text-neutral-800">{item.tag}.</span>
                {item.caption}
              </p>
            </div>
          ) : null}
          {item.kind === "table" ? (
            <>
              <TablePanel
                item={item}
                paperId={paperId}
                html={tables[item.id] ?? null}
                failed={failed[item.id] ?? false}
              />
              <p className="mt-2.5 px-1 text-[13px] leading-relaxed text-[var(--site-muted)]">
                <span className="mr-1.5 font-semibold text-[var(--site-fg)]">{item.tag}.</span>
                {item.caption}
              </p>
            </>
          ) : null}
        </div>
      ))}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.tag} 放大查看`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-neutral-700">
                {lightbox.tag}
              </p>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="关闭放大视图"
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex flex-col items-center gap-3">
              {lightbox.files?.map((file) => (
                <FigureAsset key={file} file={file} caption={lightbox.caption} variant="lightbox" />
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
              <span className="mr-1.5 font-semibold text-neutral-800">{lightbox.tag}.</span>
              {lightbox.caption}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
