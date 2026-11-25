import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Clock,
  ExternalLink,
  GitBranch,
  Images,
  ListChecks,
  Sparkles,
  Timer,
} from "lucide-react";
import { DiagramView } from "../components/DiagramView";
import { MicroCourse } from "../components/MicroCourse";
import { PaperFigures } from "../components/PaperFigures";
import { QuizDeck } from "../components/QuizDeck";
import { getPaperFigures } from "../data/paperFigures";
import type { Course } from "../data/types";
import {
  getCourse,
  PROGRESS_STEPS,
  requestCourse,
  saveGeneratedCourse,
} from "../lib/generated";
import { topicLabel, useLibrary } from "../lib/store";

type Tab = "course" | "diagram" | "quiz" | "figures";

export function PaperPage({ paperId }: { paperId: string }) {
  const { library, answers } = useLibrary();
  const paper = library.find((item) => item.id === paperId);
  const [generated, setGenerated] = useState<Course | null>(() => getCourse(paperId));
  const course = generated;
  const [genState, setGenState] = useState<"idle" | "loading" | "error">("idle");
  const [genError, setGenError] = useState("");
  const [genTone, setGenTone] = useState<"standard" | "grandma">("standard");
  const [progressIndex, setProgressIndex] = useState(0);
  const [tab, setTab] = useState<Tab>("course");

  useEffect(() => {
    setTab("course");
    setGenerated(getCourse(paperId));
    setGenState("idle");
    setGenError("");
  }, [paperId]);

  useEffect(() => {
    if (genState !== "loading") return;
    const timer = window.setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, PROGRESS_STEPS.length - 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [genState]);

  const startGenerate = async () => {
    setGenState("loading");
    setGenError("");
    setProgressIndex(0);
    try {
      const next = await requestCourse(paperId, genTone);
      saveGeneratedCourse(next);
      setGenerated(next);
      setGenState("idle");
      setTab("course");
    } catch (error) {
      setGenError(error instanceof Error ? error.message : "这次没生成成功，请重试。");
      setGenState("error");
    }
  };

  const answered = useMemo(
    () => (course ? course.quiz.filter((card) => answers[card.id]).length : 0),
    [course, answers],
  );
  const due = useMemo(
    () =>
      course
        ? course.quiz.filter((card) => {
            const record = answers[card.id];
            return record && record.grade !== "known";
          }).length
        : 0,
    [course, answers],
  );

  if (!paper) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--site-muted)]">资料库里没有这篇论文。</p>
        <a
          href="#/"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
        >
          <ArrowLeft size={15} />
          返回资料库
        </a>
      </div>
    );
  }

  const figureItems = getPaperFigures(paperId);
  const tabs: { id: Tab; label: string; note: string; icon: typeof Sparkles }[] = [
    { id: "course", label: "90 秒微课", note: "口播 + 板书", icon: Clock },
    { id: "diagram", label: "一页图解", note: "机制链 + 结论", icon: BookOpen },
    { id: "quiz", label: "自测卡", note: `${course?.quiz.length ?? 0} 道`, icon: ListChecks },
    ...(figureItems.length > 0
      ? [{ id: "figures" as Tab, label: "原文图表", note: `${figureItems.length} 项`, icon: Images }]
      : []),
  ];

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
        <div className="flex flex-wrap items-center gap-2">
          {paper.topics.map((item) => (
            <span
              key={item}
              className="rounded-full bg-[var(--site-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-fg)]"
            >
              {topicLabel(item)}
            </span>
          ))}
          <span className="text-[11px] text-[var(--site-muted)]">
            {paper.venue} · {paper.year} · arXiv:{paper.id}
          </span>
          <a
            href={`#/map/${paper.id}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--site-accent)] hover:underline"
          >
            <GitBranch size={12} />
            在文献地图里看这篇
          </a>
        </div>
        <h1 className="font-display mt-4 text-3xl leading-tight font-semibold tracking-tight text-[var(--site-fg)] sm:text-4xl">
          {course?.titleZh ?? paper.titleZh}
        </h1>
        {paper.titleZh !== paper.title ? (
          <p className="mt-2 text-sm text-[var(--site-muted)]">{paper.title}</p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
          {paper.authors.slice(0, 4).join("，")}
          {paper.authors.length > 4 ? ` 等 ${paper.authors.length} 人` : ""}
        </p>
      </header>

      {!course ? (
        <section className="mt-10 grid gap-6 rounded-[calc(var(--site-radius)+4px)] border border-[var(--site-border)] bg-[var(--site-bg)] p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="text-[11px] font-medium tracking-[0.2em] text-[var(--site-muted)] uppercase">
              Saved · 等待生成
            </span>
            <h2 className="font-display mt-3 text-2xl font-semibold text-[var(--site-fg)]">
              这篇已收录，可以用 AI 现场生成。
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
              生成时会读取摘要，拆成 6 个场景并配好板书、图解与自测卡；结果保存在本机，刷新后仍在。
            </p>
            <div className="mt-5 rounded-[var(--site-radius)] bg-[var(--site-surface)] p-4 text-sm leading-relaxed text-[var(--site-fg)]">
              {paper.abstractZh}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="讲解口吻"
                className="inline-flex items-center rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] p-1"
              >
                <button
                  type="button"
                  onClick={() => setGenTone("standard")}
                  disabled={genState === "loading"}
                  aria-pressed={genTone === "standard"}
                  className={`rounded-full px-3 py-1 text-sm ${
                    genTone === "standard"
                      ? "bg-[var(--site-bg)] font-medium text-[var(--site-fg)] shadow-sm"
                      : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
                  }`}
                >
                  标准版
                </button>
                <button
                  type="button"
                  onClick={() => setGenTone("grandma")}
                  disabled={genState === "loading"}
                  aria-pressed={genTone === "grandma"}
                  className={`rounded-full px-3 py-1 text-sm ${
                    genTone === "grandma"
                      ? "bg-[var(--site-bg)] font-medium text-[var(--site-fg)] shadow-sm"
                      : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
                  }`}
                >
                  太奶版
                </button>
              </div>
              <button
                type="button"
                onClick={startGenerate}
                disabled={genState === "loading"}
                aria-busy={genState === "loading"}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)] disabled:cursor-wait disabled:opacity-80"
              >
                <Sparkles size={14} />
                {genState === "loading"
                  ? PROGRESS_STEPS[progressIndex]
                  : genState === "error"
                    ? "重试生成"
                    : `生成 90 秒微课 · ${genTone === "grandma" ? "太奶版" : "标准版"}`}
              </button>
              <a
                href={paper.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
              >
                读原文
                <ExternalLink size={14} />
              </a>
              <a
                href="#/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
              >
                挑一篇已生成的
              </a>
            </div>
            {genState === "loading" ? (
              <p className="mt-3 text-xs text-[var(--site-muted)]">
                约需 30–90 秒，请保持页面打开；生成完成后会停在第一幕。
              </p>
            ) : null}
            {genState === "error" ? (
              <p role="alert" className="mt-3 text-xs leading-relaxed text-[var(--site-accent)]">
                {genError}
              </p>
            ) : null}
          </div>
          <div className="rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
              生成一篇微课要经过
            </p>
            <ol className="mt-3 space-y-3 text-sm text-[var(--site-fg)]">
              {["读摘要与章节结构", "拆成 6 个「讲解单元」", "为每个单元写板书与口播", "生成图解与自测卡", "标注原文位置"].map(
                (step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-display text-[var(--site-accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ),
              )}
            </ol>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-7 flex items-start gap-3 rounded-[var(--site-radius)] border-l-2 border-[var(--site-accent)] bg-[var(--site-surface)] px-4 py-3.5">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--site-accent)]" />
            <p className="text-sm leading-relaxed text-[var(--site-fg)]">
              <span className="font-medium">一句话：</span>
              {course.bigIdea}
            </p>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5 rounded-[var(--site-radius)] bg-[var(--site-surface)] p-1.5">
                {tabs.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-[calc(var(--site-radius)-4px)] px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-[var(--site-bg)] font-medium text-[var(--site-fg)] shadow-sm"
                          : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
                      }`}
                      aria-pressed={active}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                      <span className="hidden text-[11px] opacity-60 sm:inline">{item.note}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`#/card/${paper.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                >
                  <Sparkles size={14} />
                  生成学习卡
                </a>
                <span className="text-[11px] text-[var(--site-muted)]">1080×1440 · 可保存 PNG</span>
              </div>

              <div className="mt-5">
                {tab === "course" ? <MicroCourse key={course.paperId} course={course} /> : null}
                {tab === "diagram" ? (
                  <DiagramView diagram={course.diagram} paperId={course.paperId} />
                ) : null}
                {tab === "quiz" ? (
                  <QuizDeck
                    cards={course.quiz}
                    onExit={() => {
                      window.location.hash = "#/";
                    }}
                  />
                ) : null}
                {tab === "figures" ? <PaperFigures paperId={course.paperId} /> : null}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
                  学习记录
                </p>
                <p className="font-display mt-3 text-3xl font-semibold text-[var(--site-fg)]">
                  {answered}
                  <span className="text-base font-normal text-[var(--site-muted)]">
                    {" "}
                    / {course.quiz.length}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[var(--site-muted)]">张自测卡已完成</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--site-surface)]">
                  <div
                    className="h-full bg-[var(--site-accent)]"
                    style={{
                      width: `${course.quiz.length ? (answered / course.quiz.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                {due > 0 ? (
                  <a
                    href="#/review"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--site-accent)]"
                  >
                    <Timer size={13} />
                    这篇有 {due} 张卡待复习
                  </a>
                ) : null}
              </div>

              <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
                  原文
                </p>
                <a
                  href={paper.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[var(--site-fg)] hover:text-[var(--site-accent)]"
                >
                  arXiv:{paper.id}
                  <ArrowUpRight size={14} className="mt-1 shrink-0" />
                </a>
                <p className="mt-2 text-xs leading-relaxed text-[var(--site-muted)]">
                  微课与图解是学习改写；遇到关键数字，请回到原文核对。
                </p>
              </div>

              <div className="rounded-[var(--site-radius)] bg-[var(--site-surface)] p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-[var(--site-muted)] uppercase">
                  四种读法
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--site-muted)]">
                  <li>第一次：看 90 秒微课，抓住主线。</li>
                  <li>第二次：扫一页图解，记住结构。</li>
                  <li>第三次：点开结果表，学会怎么比。</li>
                  <li>以后：用自测卡，从错题开始复习。</li>
                </ul>
              </div>
            </aside>
          </div>

          <div className="mt-10 rounded-[var(--site-radius)] border border-dashed border-[var(--site-border)] px-4 py-3.5">
            <p className="text-xs leading-relaxed text-[var(--site-muted)]">
              与"AI 读论文"聊天工具的区别：我们做的是——可视化板书（不是文字）、可核对原文（不是转述）、
              会带你看结果表（不是只会讲方法）、可带走的学习卡（不是会话记录）、严格的 90 秒（不是大约几分钟）。
            </p>
          </div>
        </>
      )}
    </div>
  );
}