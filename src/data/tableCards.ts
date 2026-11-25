import type { TableReadingCard } from "./types";

/**
 * 读表卡（带我读懂这张表）
 *
 * 第一版只做《Attention Is All You Need》的一张真实结果表。
 * 数据来源：arXiv:1706.03762v7，Table 2（第 6.1 节 Machine Translation）。
 * 以下数字均人工对照原文核实，不做运行时生成、不靠模型记忆。
 */

export const TABLE_CARDS: Record<string, TableReadingCard> = {
  "1706.03762": {
    paperId: "1706.03762",
    tableId: "Table 2",
    title: "Transformer 在英德、英法翻译上的 BLEU 与训练成本",
    sourceVersion: "arXiv:1706.03762v7 · 第 6.1 节",
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    excerptNote: "据原表节选 4 个代表性模型；保留表头与单位。原表「训练成本（英→法）」一列，Transformer 两行未报告，记为「—」。",
    columns: [
      { name: "模型", unit: undefined },
      { name: "BLEU 英→德", unit: "BLEU" },
      { name: "BLEU 英→法", unit: "BLEU" },
      { name: "训练成本（英→德）", unit: "FLOPs" },
      { name: "训练成本（英→法）", unit: "FLOPs" },
    ],
    rows: [
      {
        label: "GNMT+RL 集成",
        cells: [
          { col: 0, text: "GNMT+RL 集成" },
          { col: 1, text: "26.30" },
          { col: 2, text: "41.16" },
          { col: 3, text: "1.8 × 10²⁰" },
          { col: 4, text: "1.1 × 10²¹" },
        ],
      },
      {
        label: "ConvS2S 集成",
        cells: [
          { col: 0, text: "ConvS2S 集成" },
          { col: 1, text: "26.36" },
          { col: 2, text: "41.29" },
          { col: 3, text: "7.7 × 10¹⁹" },
          { col: 4, text: "1.2 × 10²¹" },
        ],
      },
      {
        label: "Transformer（base）",
        cells: [
          { col: 0, text: "Transformer（base）" },
          { col: 1, text: "27.3", highlight: true },
          { col: 2, text: "38.1" },
          { col: 3, text: "3.3 × 10¹⁸" },
          { col: 4, text: "—", missing: true },
        ],
      },
      {
        label: "Transformer（big）",
        emphasis: true,
        cells: [
          { col: 0, text: "Transformer（big）" },
          { col: 1, text: "28.4", highlight: true },
          { col: 2, text: "41.8", highlight: true },
          { col: 3, text: "2.3 × 10¹⁹" },
          { col: 4, text: "—", missing: true },
        ],
      },
    ],
    question: {
      prompt:
        "只看这张表：Transformer（big）凭什么说它「又准又省」？请点选最能说明这一点的那一格。",
      options: [
        "Transformer（big）｜BLEU 英→德",
        "Transformer（big）｜训练成本（英→德）",
        "GNMT+RL 集成｜BLEU 英→法",
        "Transformer（base）｜训练成本（英→德）",
      ],
      answer: 0,
      wrongHint: "先看「BLEU 英→德」这一列表头，再沿 Transformer（big）那一行找最高值。",
      explain: [
        "28.4 是这张表里「BLEU 英→德」一列的最高分，比集成模型 ConvS2S 的 26.36 还高出 2.0 分——说明它的翻译质量不靠多个模型堆砌就已经领先。",
        "再看右边「训练成本」一列：拿这个 28.4 分只用了 2.3 × 10¹⁹ FLOPs，而 GNMT+RL 集成拿 26.30 分却花了 1.8 × 10²⁰ FLOPs，差了近一个数量级。分数更高、算力还更省，这就是它「又准又省」的核心。",
      ],
    },
    boundary: {
      prompt: "这张表不能证明下面哪一件事？",
      observation:
        "表里能直接看到的，只是「BLEU 分数更高、估算的训练 FLOPs 更低」这两个实验观察。注意左上角：Transformer 两行的「训练成本（英→法）」都是「—」——作者没报这个数，读表时要把「没报」和「等于零」分开。",
      inference:
        "但「Transformer 更快、所以未来更省」是作者由此推出来的判断——训练成本那一列是作者按「训练时间 × GPU 数 × 单卡算力」估算的，不是实测值；而且这里只覆盖了英德、英法两个翻译任务，不能外推到所有任务。",
    },
    takeaway: {
      compare:
        "看「BLEU 英→德」：Transformer（big）28.4 比 ConvS2S 集成 26.36 高 2.0 分；看「训练成本（英→德）」：2.3 × 10¹⁹ 只有 GNMT+RL 集成的约八分之一。",
      pitfall:
        "Transformer 两行「训练成本（英→法）」是「—」：没报不等于零；训练成本列是按「训练时间 × GPU 数 × 单卡算力」估算的，不是实测值。",
    },
    relatedSceneIndex: 5,
    relatedSceneTitle: "代价与结果",
  },
};

export function getTableCard(paperId: string): TableReadingCard | undefined {
  return TABLE_CARDS[paperId];
}
