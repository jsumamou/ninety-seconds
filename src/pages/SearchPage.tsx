import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, BookPlus, Check, ExternalLink, LoaderCircle, Search } from "lucide-react";
import { PAPERS } from "../data/papers";
import type { Paper } from "../data/types";
import { searchArxivPapers } from "../lib/search";
import { useLibrary } from "../lib/store";

// 后端不可达时（纯静态部署、断网），退化成库内 15 篇的关键词检索，
// 保证「搜索」这个入口不会变成一个报错框。
function searchInLibrary(query: string): Paper[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PAPERS.filter((paper) => {
    const haystack = [
      paper.title,
      paper.titleZh,
      paper.abstract,
      paper.abstractZh,
      paper.venue,
      ...paper.topics,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function SearchPage({ initialQuery }: { initialQuery: string }) {
  const { library, addPaper } = useLibrary();
  const [input, setInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery.trim());
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchNote, setBatchNote] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestRef = useRef(0);

  const inLibrary = useMemo(() => new Set(library.map((paper) => paper.id)), [library]);

  useEffect(() => {
    setInput(initialQuery);
    const query = initialQuery.trim();
    setActiveQuery(query);
    setBatchNote(null);
    if (!query) {
      setPapers(null);
      setError(null);
      setLoading(false);
      return;
    }
    const ticket = ++requestRef.current;
    setLoading(true);
    setError(null);
    setPapers(null);
    // 兜底顺序：① 后端（有缓存与限流）→ ② 浏览器直连 OpenAlex 的 arXiv 收录
    // → ③ 库内 15 篇关键词检索。② 是为了纯静态部署（没有 /functions）也能搜。
    const direct = async () => {
      try {
        const hits = await searchArxivPapers(query, 30);
        if (ticket !== requestRef.current) return;
        setPapers(hits);
      } catch {
        if (ticket !== requestRef.current) return;
        const local = searchInLibrary(query);
        setPapers(local);
        setError(
          `联网检索暂时不可用，已改为库内检索：命中 ${local.length} 篇（库内共 ${PAPERS.length} 篇）。`,
        );
      }
    };
    fetch(`/functions/v1/app?action=search&q=${encodeURIComponent(query)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (ticket !== requestRef.current) return;
        if (!response.ok || !payload?.ok) {
          await direct();
          return;
        }
        const list = Array.isArray(payload.papers) ? (payload.papers as Paper[]) : [];
        setPapers(list.length > 0 ? list : await searchArxivPapers(query, 30).catch(() => []));
      })
      .catch(() => {
        void direct();
      })
      .finally(() => {
        if (ticket === requestRef.current) setLoading(false);
      });
  }, [initialQuery, reloadKey]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const query = input.trim();
    if (!query) return;
    if (/[\u4e00-\u9fff]/.test(query)) {
      setError("英文检索只收英文关键词；中文主题请回资料库用「按主题检索」。");
      return;
    }
    if (query === activeQuery) {
      setReloadKey((current) => current + 1);
      return;
    }
    window.location.hash = `#/search?q=${encodeURIComponent(query)}`;
  };

  const importAll = () => {
    if (!papers) return;
    let added = 0;
    for (const paper of papers) {
      if (addPaper(paper)) added += 1;
    }
    setBatchNote(
      added > 0
        ? `已收录 ${added} 篇新论文。点开任意一篇，可在论文页按需生成微课。`
        : "这些论文都已在资料库里了。",
    );
  };

  const total = papers?.length ?? 0;
  const addedCount = papers ? papers.filter((paper) => inLibrary.has(paper.id)).length : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pt-10 pb-16 sm:px-8">
      <a
        href="#/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--site-muted)] hover:text-[var(--site-fg)]"
      >
        <ArrowLeft size={15} />
        资料库
      </a>
      <p className="mt-6 text-[11px] font-medium tracking-[0.22em] text-[var(--site-accent)] uppercase">
        arXiv · English search
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-[var(--site-fg)]">
        一次搜三十篇，再决定读哪篇
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--site-muted)]">
        输入英文关键词，从 OpenAlex 的 arXiv 收录里按相关性取最相关的三十篇。
        <span className="text-[var(--site-fg)]">只收录进资料库，不自动生成微课</span>
        ——想精读哪篇，点进论文页再生成。
      </p>

      <form
        onSubmit={submit}
        className="mt-7 rounded-[calc(var(--site-radius)+4px)] border border-[var(--site-border)] bg-[var(--site-bg)] p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--site-muted)]"
            />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="retrieval augmented generation"
              className="h-11 w-full rounded-full border border-[var(--site-border)] bg-[var(--site-bg)] pr-4 pl-10 text-sm text-[var(--site-fg)] outline-none placeholder:text-[var(--site-muted)]/80 focus:border-[var(--site-accent)]"
              aria-label="英文关键词"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--site-accent)] px-6 text-sm font-medium text-[var(--site-on-accent)] disabled:opacity-50"
          >
            检索 30 篇
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--site-muted)]">
          元数据来自 OpenAlex 开放目录的 arXiv 收录，按相关性排序；浏览器直连，无需后端。中文主题请回资料库用「按主题检索」。
        </p>
      </form>

      {error ? (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-[var(--site-surface)] px-4 py-3 text-sm text-[var(--site-fg)]"
        >
          <span>{error}</span>
          {activeQuery ? (
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="rounded-full border border-[var(--site-border)] px-3 py-1 text-xs hover:bg-[var(--site-bg)]"
            >
              重试
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[var(--site-muted)]">
          <LoaderCircle size={16} className="animate-spin" />
          正在检索「{activeQuery}」…
        </div>
      ) : null}

      {!loading && papers ? (
        <section className="mt-8">
          <div className="flex flex-col gap-3 rounded-[var(--site-radius)] bg-[var(--site-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--site-fg)]">
                「{activeQuery}」共 {total} 篇
                <span className="text-[var(--site-muted)]"> · 已在资料库 {addedCount} 篇</span>
              </p>
              <p className="mt-1 text-xs text-[var(--site-muted)]">
                收录不会生微课；生成只在你点开论文页并主动点击时发生。
              </p>
            </div>
            <button
              type="button"
              onClick={importAll}
              disabled={total === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-bg)] disabled:opacity-50"
            >
              <BookPlus size={15} />
              全部收录
            </button>
          </div>
          {batchNote ? (
            <p role="status" className="mt-3 text-sm text-[var(--site-accent)]">
              {batchNote}
            </p>
          ) : null}

          {total === 0 ? (
            <p className="mt-8 rounded-[calc(var(--site-radius)+4px)] border border-dashed border-[var(--site-border)] px-6 py-14 text-center text-sm text-[var(--site-muted)]">
              没有找到相关论文，换个英文关键词试试。
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {papers.map((paper) => {
                const added = inLibrary.has(paper.id);
                return (
                  <li
                    key={paper.id}
                    className="flex flex-col gap-3 rounded-[var(--site-radius)] border border-[var(--site-border)] px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <a
                        href={paper.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 font-medium text-[var(--site-fg)] hover:text-[var(--site-accent)]"
                      >
                        <span className="line-clamp-2">{paper.title}</span>
                        <ExternalLink size={13} className="mt-1 shrink-0 text-[var(--site-muted)]" />
                      </a>
                      <p className="mt-1 text-xs text-[var(--site-muted)]">
                        {paper.authors.slice(0, 3).join(", ")}
                        {paper.authors.length > 3 ? " 等" : ""} · {paper.year} · {paper.id}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--site-muted)]">
                        {paper.abstract}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      {added ? (
                        <a
                          href={`#/paper/${paper.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                        >
                          <Check size={13} className="text-[var(--site-accent)]" />
                          已收录 · 打开
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addPaper(paper)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--site-accent)] px-3.5 py-1.5 text-xs font-medium text-[var(--site-on-accent)]"
                        >
                          <BookPlus size={13} />
                          收录
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}