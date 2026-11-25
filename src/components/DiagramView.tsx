import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { CourseDiagram } from "../data/types";
import { arxivAnchor } from "../lib/arxiv";

export function DiagramView({ diagram, paperId }: { diagram: CourseDiagram; paperId?: string }) {
  return (
    <article className="relative overflow-hidden rounded-[calc(var(--site-radius)+4px)] border border-[var(--site-border)] bg-[var(--site-bg)]">
      <div className="diagram-rules pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-medium tracking-[0.22em] text-[var(--site-accent)] uppercase">
            One-page · 机制图解
          </span>
          <span className="text-xs text-[var(--site-muted)]">90 秒读不完，30 秒够用</span>
        </div>
        <h2 className="font-display mt-4 max-w-3xl text-2xl leading-snug font-semibold text-[var(--site-fg)] sm:text-3xl">
          {diagram.headline}
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
              机制链
            </h3>
            <ol className="mt-4 space-y-0">
              {diagram.steps.map((step, index) => (
                <li key={step.label} className="relative flex gap-4 pb-5">
                  {index < diagram.steps.length - 1 ? (
                    <span
                      className="absolute top-8 left-[15px] h-[calc(100%-26px)] w-px bg-[var(--site-border)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--site-border)] bg-[var(--site-bg)] text-xs font-semibold tabular-nums text-[var(--site-fg)]">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <p className="text-[15px] font-medium text-[var(--site-fg)]">{step.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--site-muted)]">
                      {step.note}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 rounded-[var(--site-radius)] bg-[var(--site-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--site-fg)]">
              <ArrowDown size={16} className="shrink-0 text-[var(--site-accent)]" />
              {diagram.insight}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
                三个结论
              </h3>
              <ul className="mt-3 space-y-3">
                {diagram.conclusions.map((conclusion, index) => (
                  <li
                    key={conclusion}
                    className="flex gap-3 rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)]/70 p-3.5"
                  >
                    <span className="font-display text-lg leading-none text-[var(--site-accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-relaxed text-[var(--site-fg)]">{conclusion}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
                原文依据
              </h3>
              <dl className="mt-3 divide-y divide-[var(--site-border)] border-y border-[var(--site-border)]">
                {diagram.anchors.map((anchor) => {
                  const link = paperId ? arxivAnchor(paperId, anchor.label) : null;
                  return (
                    <div key={anchor.label} className="flex gap-3 py-2.5">
                      <dt className="w-28 shrink-0 text-xs font-medium text-[var(--site-accent)]">
                        {link ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1 hover:underline hover:decoration-dotted hover:underline-offset-2"
                          >
                            {link.label}
                            <ArrowUpRight size={12} className="mt-0.5 shrink-0" />
                          </a>
                        ) : (
                          anchor.label
                        )}
                      </dt>
                      <dd className="text-xs leading-relaxed text-[var(--site-muted)]">
                        {anchor.detail}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}