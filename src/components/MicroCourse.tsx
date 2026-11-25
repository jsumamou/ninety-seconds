import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Heart,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Table2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BoardStage } from "./BoardStage";
import { TableReadingCardView } from "./TableReadingCard";
import type { Course, FollowUp } from "../data/types";
import { arxivAnchor } from "../lib/arxiv";
import { loadAudio } from "../lib/audio";
import type { AudioManifest } from "../lib/audio";
import { getTableCard } from "../data/tableCards";
import { COACHING_CARDS } from "../data/coachingCards";

function formatTime(ms: number) {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function splitSentences(text: string): string[] {
  const parts = text
    .split(/(?<=[。！？；])/g)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

function sentenceStarts(sentences: string[], duration: number): number[] {
  const weights = sentences.map((sentence) => Math.max(1, sentence.length));
  const sum = weights.reduce((total, weight) => total + weight, 0);
  const starts: number[] = [];
  let cursor = 0;
  for (const weight of weights) {
    starts.push(cursor);
    cursor += (weight / sum) * duration;
  }
  return starts;
}

function FollowupPanel({
  item,
  paperId,
  onClose,
}: {
  item: FollowUp;
  paperId: string;
  onClose: () => void;
}) {
  const source = item.anchor ? arxivAnchor(paperId, item.anchor) : null;
  return (
    <div className="mt-3 rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--site-fg)]">{item.question}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="收起追问"
          className="shrink-0 rounded-full p-1 text-[var(--site-muted)] hover:bg-[var(--site-bg)] hover:text-[var(--site-fg)]"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-2 text-[18px] leading-[1.7] text-[var(--site-fg)]">{item.answer}</p>
      {source ? (
        <p className="mt-3 text-xs text-[var(--site-muted)]">
          核对原文 ·{" "}
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--site-accent)]"
          >
            {source.label}
          </a>
        </p>
      ) : null}
    </div>
  );
}

export function MicroCourse({ course }: { course: Course }) {
  const [grandmaMode, setGrandmaMode] = useState(false);
  const grandmaOn = grandmaMode && !!course.grandma;
  const scenes = useMemo(() => {
    if (!course.grandma || !grandmaOn) return course.scenes;
    return course.scenes.map((scene, index) => {
      const grandmaScene = course.grandma?.scenes[index];
      return grandmaScene
        ? { ...scene, title: grandmaScene.title, narration: grandmaScene.narration }
        : scene;
    });
  }, [course, grandmaOn]);
  const starts = useMemo(() => {
    const result: number[] = [];
    let cursor = 0;
    for (const scene of scenes) {
      result.push(cursor);
      cursor += scene.duration;
    }
    return result;
  }, [scenes]);
  const total = useMemo(
    () => scenes.reduce((sum, scene) => sum + scene.duration, 0),
    [scenes],
  );

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [replayTick, setReplayTick] = useState(0);
  const lastSpokenScene = useRef(-1);
  const [openFollowup, setOpenFollowup] = useState<number | null>(null);
  const followupWasPlaying = useRef(false);
  const tableCard = getTableCard(course.paperId);
  const [showTableCard, setShowTableCard] = useState(false);
  const tableCardWasPlaying = useRef(false);
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [audioFailed, setAudioFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAuto = useRef(true);
  const lastTickT = useRef(0);
  const coachingCards = COACHING_CARDS[course.paperId];
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachChoice, setCoachChoice] = useState<number | null>(null);
  const [coachWrong, setCoachWrong] = useState<number[]>([]);
  const [coachRevealed, setCoachRevealed] = useState(false);
  const [ttsResume, setTtsResume] = useState<"ask" | null>(null);
  const coachSnapshot = useRef({ t: 0, wasPlaying: false, sceneIndex: 0 });
  const ttsFromSentence = useRef(0);
  const coachCardRef = useRef<HTMLDivElement | null>(null);
  const audioScenes = useMemo(
    () => (grandmaOn ? manifest?.grandma ?? null : manifest?.scenes ?? null),
    [grandmaOn, manifest],
  );
  const useAudio = !!audioScenes && !audioFailed;

  const sceneIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < starts.length; i += 1) {
      if (t >= starts[i]) index = i;
    }
    return index;
  }, [t, starts]);
  const scene = scenes[sceneIndex];
  const localT = Math.max(0, Math.min(scene.duration, t - starts[sceneIndex]));
  const coachCard = coachingCards?.[sceneIndex] ?? null;

  useEffect(() => {
    setTtsReady("speechSynthesis" in window);
  }, []);

  useEffect(() => {
    let alive = true;
    setAudioFailed(false);
    loadAudio(course.paperId).then((loaded) => {
      if (!alive || !loaded) return;
      setManifest(loaded);
      if (ttsAuto.current) setTtsOn(true);
    });
    return () => {
      alive = false;
    };
  }, [course.paperId]);

  useEffect(() => {
    if (!manifest) return;
    const audio = new Audio();
    audio.preload = "auto";
    const onError = () => {
      if (audioRef.current === audio) setAudioFailed(true);
    };
    audio.addEventListener("error", onError);
    audioRef.current = audio;
    return () => {
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [manifest]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !useAudio) return;
    const entry = audioScenes?.[sceneIndex];
    if (!entry) return;
    if (!audio.src.endsWith(entry.src)) {
      audio.src = `${import.meta.env.BASE_URL}${entry.src}`;
      audio.currentTime = localT / 1000;
    }
    if (playing && ttsOn) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [useAudio, audioScenes, sceneIndex, playing, ttsOn, localT]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !useAudio) return;
    if (Math.abs(t - lastTickT.current) > 350) {
      audio.currentTime = Math.max(0, Math.min(scene.duration, t - starts[sceneIndex])) / 1000;
    }
    lastTickT.current = t;
  }, [t, useAudio, starts, sceneIndex, scene.duration]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - last, 1000);
      last = now;
      setT((current) => Math.min(current + delta, total));
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  useEffect(() => {
    if (t < total) return;
    setPlaying(false);
    setFinished(true);
    if (ttsReady) window.speechSynthesis.cancel();
  }, [t, total, ttsReady]);

  useEffect(() => {
    if (useAudio) {
      window.speechSynthesis?.cancel();
      lastSpokenScene.current = -1;
      return;
    }
    if (!ttsReady) return;
    if (!playing || !ttsOn) {
      window.speechSynthesis.cancel();
      lastSpokenScene.current = -1;
      return;
    }
    if (lastSpokenScene.current === sceneIndex) return;
    lastSpokenScene.current = sceneIndex;
    const fromSentence = ttsFromSentence.current;
    ttsFromSentence.current = 0;
    const text =
      fromSentence > 0
        ? splitSentences(scene.narration).slice(fromSentence).join("")
        : scene.narration;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1.12;
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.startsWith("zh"));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [sceneIndex, scene.narration, playing, ttsOn, ttsReady, useAudio]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    },
    [],
  );

  useEffect(() => {
    setOpenFollowup(null);
    followupWasPlaying.current = false;
  }, [sceneIndex]);

  useEffect(() => {
    if (coachOpen) coachCardRef.current?.focus();
  }, [coachOpen]);

  useEffect(() => {
    if (!coachOpen) return;
    setCoachOpen(false);
    setCoachChoice(null);
    setCoachWrong([]);
    setCoachRevealed(false);
    setTtsResume(null);
  }, [sceneIndex]);

  const togglePlay = () => {
    if (t >= total) {
      setT(0);
      setFinished(false);
      setPlaying(true);
      lastSpokenScene.current = -1;
      setReplayTick((tick) => tick + 1);
      return;
    }
    setFinished(false);
    setPlaying((current) => !current);
  };

  const replayScene = () => {
    setT(starts[sceneIndex]);
    setFinished(false);
    lastSpokenScene.current = -1;
    setReplayTick((tick) => tick + 1);
  };

  const seekScene = (index: number) => {
    setT(starts[index]);
    setFinished(false);
    lastSpokenScene.current = -1;
    setReplayTick((tick) => tick + 1);
  };

  const toggleFollowup = (index: number) => {
    if (openFollowup === index) {
      setOpenFollowup(null);
      if (followupWasPlaying.current) setPlaying(true);
      followupWasPlaying.current = false;
      return;
    }
    followupWasPlaying.current = playing;
    setPlaying(false);
    setOpenFollowup(index);
  };

  const resetCoachAnswer = () => {
    setCoachChoice(null);
    setCoachWrong([]);
    setCoachRevealed(false);
    setTtsResume(null);
  };

  const openCoach = () => {
    if (!coachCard || coachOpen) return;
    coachSnapshot.current = { t, wasPlaying: playing, sceneIndex };
    setPlaying(false);
    setOpenFollowup(null);
    followupWasPlaying.current = false;
    resetCoachAnswer();
    setCoachOpen(true);
  };

  const closeCoach = () => {
    setCoachOpen(false);
    resetCoachAnswer();
  };

  const resumeCoach = () => {
    const saved = coachSnapshot.current;
    if (saved.wasPlaying && !useAudio && ttsReady && ttsOn) {
      setTtsResume("ask");
      return;
    }
    closeCoach();
    if (saved.wasPlaying) setPlaying(true);
  };

  const ttsResumeAt = (mode: "sentence" | "scene") => {
    const saved = coachSnapshot.current;
    closeCoach();
    if (mode === "scene") {
      setT(starts[saved.sceneIndex]);
    } else {
      const target = scenes[saved.sceneIndex];
      const sents = splitSentences(target.narration);
      const sStarts = sentenceStarts(sents, target.duration);
      const local = saved.t - starts[saved.sceneIndex];
      let index = 0;
      for (let i = 0; i < sStarts.length; i += 1) {
        if (local >= sStarts[i]) index = i;
      }
      ttsFromSentence.current = index;
      setT(starts[saved.sceneIndex] + sStarts[index]);
    }
    lastSpokenScene.current = -1;
    setReplayTick((tick) => tick + 1);
    setPlaying(true);
  };

  const toggleCoach = () => {
    if (coachOpen) {
      if (ttsResume === "ask") {
        closeCoach();
      } else {
        resumeCoach();
      }
      return;
    }
    openCoach();
  };

  const chooseOption = (index: number) => {
    if (!coachCard || coachRevealed || coachWrong.includes(index)) return;
    if (index === coachCard.correct) {
      setCoachChoice(index);
      setCoachRevealed(true);
      return;
    }
    const next = [...coachWrong, index];
    setCoachWrong(next);
    if (next.length >= 2) setCoachRevealed(true);
  };

  const openTableCard = () => {
    tableCardWasPlaying.current = playing;
    setPlaying(false);
    setOpenFollowup(null);
    setShowTableCard(true);
  };

  const closeTableCard = () => {
    setShowTableCard(false);
    // 回到原来那一幕（不重播整节课）
    if (tableCard && tableCard.relatedSceneIndex >= 0) {
      seekScene(tableCard.relatedSceneIndex);
    }
  };

  const progress = total === 0 ? 0 : Math.min(1, t / total);

  const sentences = useMemo(() => splitSentences(scene.narration), [scene.narration]);
  const startsInScene = useMemo(
    () => sentenceStarts(sentences, scene.duration),
    [sentences, scene.duration],
  );
  let activeSentence = 0;
  for (let index = 0; index < startsInScene.length; index += 1) {
    if (localT >= startsInScene[index]) activeSentence = index;
  }

  return (
    <div className="flex flex-col gap-4">
      {showTableCard && tableCard ? (
        <TableReadingCardView card={tableCard} onBack={closeTableCard} />
      ) : (
        <>
      <div className="rounded-[var(--site-radius)] bg-[#14181d] p-5 sm:hidden">
        <p className="text-[15px] font-medium tracking-[0.14em] text-[#e9a178] uppercase">
          {scene.kicker}
        </p>
        <h3 className="font-display mt-2 text-[28px] leading-snug font-semibold text-[#ece7dc]">
          {scene.title}
        </h3>
        <div className="mt-4 min-h-[148px] space-y-2 text-[17px] leading-relaxed">
          {sentences.map((sentence, index) =>
            index <= activeSentence ? (
              <p
                key={`${sentence}-${index}`}
                className={
                  index === activeSentence
                    ? "board-rise text-[#ece7dc]"
                    : "text-[#8c887f]"
                }
              >
                {sentence}
              </p>
            ) : null,
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-[15px] text-[#8c887f]">
          <span>手机版：字幕优先</span>
          <span className="tabular-nums">
            {formatTime(localT)} / {formatTime(scene.duration)}
          </span>
        </div>
        {t === 0 && !playing && !finished ? (
          <button
            type="button"
            onClick={togglePlay}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ece7dc] px-4 py-2 text-[15px] font-medium text-[#14181d]"
          >
            <Play size={16} className="fill-current" />
            播放 · {formatTime(total)}
          </button>
        ) : null}
      </div>

      <div className="relative hidden sm:block">
        <BoardStage
          scene={scene}
          label={`${sceneIndex}-${replayTick}`}
          playing={playing}
          localT={localT}
        />
        {t === 0 && !playing && !finished ? (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-[#14181d]/35 transition-colors hover:bg-[#14181d]/25"
            aria-label="播放 90 秒微课"
          >
            <span className="flex items-center gap-2.5 rounded-full bg-[var(--site-bg)] px-6 py-3 text-base font-medium text-[var(--site-fg)] shadow-lg">
              <Play size={18} className="fill-current" />
              播放 · {formatTime(total)}
            </span>
          </button>
        ) : null}
        <div className="pointer-events-none absolute left-5 top-4 z-20 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-[#ece7dc]/60 uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e9a178]" />
          {scene.kicker}
        </div>
      </div>

      {coachOpen && coachCard ? (
        <div
          ref={coachCardRef}
          tabIndex={-1}
          className="rounded-[var(--site-radius)] border border-[var(--site-accent)]/30 bg-[var(--site-surface)]/70 p-5 shadow-sm outline-none"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-[var(--site-accent)] uppercase">
              <HelpCircle size={14} />
              这一步没懂 · 第 {sceneIndex + 1} 幕 · 课程暂停中
            </p>
            <button
              type="button"
              onClick={() => (ttsResume === "ask" ? closeCoach() : resumeCoach())}
              aria-label="收起辅导卡"
              className="shrink-0 rounded-full p-1 text-[var(--site-muted)] hover:bg-[var(--site-bg)] hover:text-[var(--site-fg)]"
            >
              <X size={16} />
            </button>
          </div>
          {ttsResume === "ask" ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--site-fg)]">
                浏览器朗读没法从半句处接着读。选一种回跳方式，声音和板书会一起回到对应位置。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => ttsResumeAt("sentence")}
                  className="flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
                >
                  从本句重听
                </button>
                <button
                  type="button"
                  onClick={() => ttsResumeAt("scene")}
                  className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                >
                  从本幕重听
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm font-medium text-[var(--site-fg)]">{coachCard.focus}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--site-fg)]">
                {coachCard.example}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--site-muted)]">
                {coachCard.mapping}
              </p>
              {coachCard.hypothetical ? (
                <p className="mt-1 text-[11px] text-[var(--site-muted)]">
                  示例里的数字是教学假设，不是论文实验数据。
                </p>
              ) : null}
              <fieldset className="mt-4 border-t border-[var(--site-border)] pt-4">
                <legend className="text-sm font-semibold text-[var(--site-fg)]">
                  {coachCard.question}
                </legend>
                <div className="mt-2 flex flex-col gap-2">
                  {coachCard.options.map((option, index) => {
                    const isCorrect = index === coachCard.correct;
                    const chosenWrong = coachWrong.includes(index);
                    const showCorrect = coachRevealed && isCorrect;
                    const disabled =
                      coachRevealed || chosenWrong || (coachChoice !== null && !isCorrect);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => chooseOption(index)}
                        disabled={disabled}
                        className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${
                          showCorrect
                            ? "border-[var(--site-accent)] bg-[var(--site-accent)]/10 font-medium text-[var(--site-fg)]"
                            : chosenWrong
                              ? "border-[var(--site-border)] text-[var(--site-muted)] opacity-60"
                              : "border-[var(--site-border)] text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {showCorrect ? (
                            <CheckCircle2 size={15} className="text-[var(--site-accent)]" />
                          ) : chosenWrong ? (
                            <X size={15} />
                          ) : null}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-3 min-h-[24px] text-sm leading-relaxed"
                >
                  {!coachRevealed && coachWrong.length === 1 ? (
                    <p className="text-[var(--site-fg)]">
                      <span className="font-medium">再想想：</span>
                      {coachCard.wrongHints[coachWrong[0]]}
                    </p>
                  ) : null}
                  {coachRevealed && coachChoice === coachCard.correct ? (
                    <p className="text-[var(--site-accent)]">
                      <span className="font-medium">答对了。</span>
                      {coachCard.why}
                    </p>
                  ) : null}
                  {coachRevealed && coachChoice !== coachCard.correct ? (
                    <p className="text-[var(--site-fg)]">
                      <span className="font-medium">正确答案是第 {coachCard.correct + 1} 项。</span>
                      {coachCard.answerReason}
                    </p>
                  ) : null}
                </div>
              </fieldset>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resumeCoach}
                  className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
                >
                  先跳过
                </button>
                {coachRevealed ? (
                  <button
                    type="button"
                    onClick={resumeCoach}
                    className="flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)]"
                  >
                    从刚才的位置继续
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="rounded-[var(--site-radius)] border border-[var(--site-border)] bg-[var(--site-bg)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-[var(--site-fg)]">
              {sceneIndex + 1}. {scene.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--site-muted)]">
              {scene.narration}
            </p>
          </div>
          <span className="text-xs tabular-nums text-[var(--site-muted)]">
            {formatTime(t)} / {formatTime(total)}
          </span>
        </div>

        {scene.followups && scene.followups.length > 0 ? (
          <div className="mt-4 border-t border-[var(--site-border)] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] font-medium tracking-[0.18em] text-[var(--site-muted)] uppercase">
                追问
              </span>
              {scene.followups.map((item, index) => {
                const open = openFollowup === index;
                const dimmed = (openFollowup !== null && !open) || coachOpen;
                return (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => toggleFollowup(index)}
                    aria-expanded={open}
                    disabled={coachOpen}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-opacity ${
                      open
                        ? "border-[var(--site-accent)] bg-[var(--site-surface)] font-medium text-[var(--site-accent)]"
                        : dimmed
                          ? "border-[var(--site-border)] text-[var(--site-muted)] opacity-50"
                          : "border-[var(--site-border)] text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
                    }`}
                  >
                    {item.question}
                  </button>
                );
              })}
            </div>
            {openFollowup !== null && scene.followups[openFollowup] ? (
              <FollowupPanel
                item={scene.followups[openFollowup]}
                paperId={course.paperId}
                onClose={() => toggleFollowup(openFollowup)}
              />
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--site-surface)]">
            <div
              className="h-full rounded-full bg-[var(--site-accent)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="shrink-0 rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] px-2.5 py-1 text-[11px] font-medium tabular-nums text-[var(--site-fg)]">
            总时长 {(total / 1000).toFixed(1)}s
          </span>
        </div>

        {tableCard && (finished || sceneIndex === tableCard.relatedSceneIndex) ? (
          <p className="text-[11px] leading-relaxed text-[var(--site-muted)]">
            第一次读论文，最难的不是公式，是看结果表。
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={coachOpen}
            className="flex items-center gap-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-medium text-[var(--site-on-accent)] disabled:opacity-40"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "暂停" : finished ? "重播" : "播放"}
          </button>
          <button
            type="button"
            onClick={replayScene}
            disabled={coachOpen}
            className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-fg)] hover:bg-[var(--site-surface)] disabled:opacity-40"
          >
            <RotateCcw size={15} />
            本段重放
          </button>
          {coachingCards && coachCard && !finished ? (
            <button
              type="button"
              onClick={toggleCoach}
              aria-pressed={coachOpen}
              className={`flex items-center gap-2 rounded-full border border-dashed px-4 py-2 text-sm ${
                coachOpen
                  ? "border-[var(--site-accent)] bg-[var(--site-surface)] font-medium text-[var(--site-accent)]"
                  : "border-[var(--site-border)] text-[var(--site-fg)] hover:bg-[var(--site-surface)]"
              }`}
            >
              <HelpCircle size={15} />
              这一步没懂
            </button>
          ) : null}
          {course.grandma ? (
            <button
              type="button"
              onClick={() => {
                setGrandmaMode((current) => !current);
                lastSpokenScene.current = -1;
              }}
              aria-pressed={grandmaOn}
              disabled={coachOpen}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-40 ${
                grandmaOn
                  ? "border-[var(--site-accent)] text-[var(--site-accent)]"
                  : "border-[var(--site-border)] text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
              }`}
            >
              <Heart size={15} className={grandmaOn ? "fill-current" : ""} />
              {grandmaOn ? "太奶模式开" : "太奶模式"}
            </button>
          ) : null}
          {ttsReady || (manifest && !audioFailed) ? (
            <button
              type="button"
              onClick={() => {
                ttsAuto.current = false;
                setTtsOn((current) => !current);
              }}
              disabled={coachOpen}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm disabled:opacity-40 ${
                ttsOn
                  ? "border-[var(--site-accent)] text-[var(--site-accent)]"
                  : "border-[var(--site-border)] text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
              }`}
              aria-pressed={ttsOn}
            >
              {ttsOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {ttsOn ? "朗读开" : "朗读关"}
            </button>
          ) : null}
          {tableCard && (finished || sceneIndex === tableCard.relatedSceneIndex) ? (
            <button
              type="button"
              onClick={openTableCard}
              disabled={coachOpen}
              className="flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm font-medium text-[var(--site-accent)] hover:bg-[var(--site-surface)] disabled:opacity-40"
            >
              <Table2 size={15} />
              带我读懂这张表
            </button>
          ) : null}
          <span className="ml-auto hidden text-xs text-[var(--site-muted)] sm:inline">
            字幕随讲解同步 · 板书逐笔出现
          </span>
        </div>

        <ol className="mt-4 grid grid-cols-2 gap-1.5 border-t border-[var(--site-border)] pt-4 sm:grid-cols-3 lg:grid-cols-6">
          {scenes.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => seekScene(index)}
                disabled={coachOpen}
                className={`w-full rounded-md px-2 py-2 text-left text-xs leading-snug transition-colors disabled:opacity-40 ${
                  index === sceneIndex
                    ? "bg-[var(--site-surface)] font-medium text-[var(--site-fg)]"
                    : "text-[var(--site-muted)] hover:bg-[var(--site-surface)]"
                }`}
              >
                <span className="mr-1 tabular-nums opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
        </>
      )}
    </div>
  );
}