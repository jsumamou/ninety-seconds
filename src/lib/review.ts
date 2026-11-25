import { ALL_QUIZ_CARDS, COURSES } from "../data/courses";
import { PAPERS } from "../data/papers";
import { getTableCard, TABLE_CARDS } from "../data/tableCards";
import type { AnswerRecord, QuizCard, TableReadingCard } from "../data/types";
import { getCourse } from "./generated";

/** 读表题（第一问）的答题记录 id，与自测卡 id 不冲突 */
export function tableCardId(card: TableReadingCard): string {
  return `${card.paperId}-table-${card.tableId}`;
}

/** 把读表题（第一问）映射成自测卡同构的题卡，供复习队列使用 */
export function tableQuizCard(card: TableReadingCard): QuizCard {
  const section = card.sourceVersion.match(/第\s*([\d.]+)\s*节/)?.[1];
  return {
    id: tableCardId(card),
    paperId: card.paperId,
    question: card.question.prompt,
    options: card.question.options,
    answer: card.question.answer,
    explanation: card.question.explain.join(" "),
    anchor: section ? `§${section} ${card.tableId}` : card.tableId,
  };
}

/** 手写课、生成课、读表题共用同一套查找：按答题记录还原题卡 */
export function resolveReviewCard(record: AnswerRecord): QuizCard | null {
  const direct = ALL_QUIZ_CARDS.find((card) => card.id === record.cardId);
  if (direct) return direct;
  const course = getCourse(record.paperId);
  const fromCourse = course?.quiz.find((card) => card.id === record.cardId);
  if (fromCourse) return fromCourse;
  const table = getTableCard(record.paperId);
  if (table && tableCardId(table) === record.cardId) return tableQuizCard(table);
  return null;
}

/**
 * 当前「可用」的全部题卡 id（手写课 + 生成课 + 读表题），去重。
 * 用于统计「还没做过的卡」，口径与 resolveReviewCard 一致，避免分母错位。
 */
export function allAvailableQuizIds(): string[] {
  const ids = new Set<string>();

  // 手写课（COURSES 常量里就有，含 ALL_QUIZ_CARDS 的题）
  for (const course of Object.values(COURSES)) {
    for (const card of course.quiz) ids.add(card.id);
  }

  // 生成课：遍历库内论文，若已有生成课（localStorage）则纳入其题卡
  for (const paper of PAPERS) {
    const course = getCourse(paper.id);
    if (course && course.quiz) {
      for (const card of course.quiz) ids.add(card.id);
    }
  }

  // 读表题：库内论文若配置了读表卡，其第一问也算一道题
  for (const card of Object.values(TABLE_CARDS)) {
    ids.add(tableCardId(card));
  }

  return [...ids];
}
