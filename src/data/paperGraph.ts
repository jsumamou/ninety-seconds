export type RelationKind = "improves" | "extends" | "cites" | "compares";

export interface PaperRelation {
  from: string;
  to: string;
  kind: RelationKind;
}

// 全部关系均与 arXiv HTML 版参考文献区逐条核对（2026-11-20），不编造。
export const PAPER_RELATIONS: PaperRelation[] = [
  { from: "2005.14165", to: "1706.03762", kind: "extends" },
  { from: "2005.14165", to: "2001.08361", kind: "cites" },
  { from: "2305.14314", to: "2106.09685", kind: "extends" },
  { from: "2106.09685", to: "2005.14165", kind: "cites" },
  { from: "2205.14135", to: "1706.03762", kind: "improves" },
  { from: "2112.10752", to: "2006.11239", kind: "improves" },
  { from: "2006.11239", to: "1406.2661", kind: "compares" },
  { from: "2005.11401", to: "2004.04906", kind: "extends" },
  { from: "2005.11401", to: "2002.08909", kind: "cites" },
  { from: "2004.04906", to: "2002.08909", kind: "cites" },
  { from: "2210.03629", to: "2201.11903", kind: "extends" },
  { from: "2203.11171", to: "2201.11903", kind: "improves" },
  { from: "2201.11903", to: "2001.08361", kind: "cites" },
  { from: "2201.11903", to: "2005.14165", kind: "cites" },
];

export const KIND_LABEL: Record<RelationKind, string> = {
  improves: "改进",
  extends: "延伸",
  cites: "引用",
  compares: "对比",
};

export const KIND_DASH: Record<RelationKind, string | undefined> = {
  improves: undefined,
  extends: undefined,
  cites: "7 5",
  compares: "2 5",
};

export const TOPIC_COLORS: Record<string, string> = {
  foundation: "#3b82f6",
  efficient: "#f59e0b",
  generative: "#8b5cf6",
  retrieval: "#10b981",
  reasoning: "#f43f5e",
};

export const NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  "1706.03762": { x: 620, y: 250 },
  "2005.14165": { x: 470, y: 120 },
  "2001.08361": { x: 770, y: 120 },
  "2205.14135": { x: 210, y: 120 },
  "2106.09685": { x: 140, y: 330 },
  "2305.14314": { x: 90, y: 540 },
  "1406.2661": { x: 1060, y: 90 },
  "2006.11239": { x: 1110, y: 270 },
  "2112.10752": { x: 950, y: 180 },
  "2002.08909": { x: 1080, y: 500 },
  "2004.04906": { x: 1000, y: 660 },
  "2005.11401": { x: 850, y: 580 },
  "2201.11903": { x: 560, y: 690 },
  "2210.03629": { x: 400, y: 800 },
  "2203.11171": { x: 720, y: 800 },
};

export const NODE_SHORT_LABEL: Record<string, string> = {
  "1706.03762": "Transformer",
  "2005.14165": "GPT-3",
  "2001.08361": "缩放定律",
  "2106.09685": "LoRA",
  "2305.14314": "QLoRA",
  "2205.14135": "FlashAttention",
  "2006.11239": "DDPM",
  "2112.10752": "潜空间扩散",
  "1406.2661": "GAN",
  "2005.11401": "RAG",
  "2004.04906": "DPR",
  "2002.08909": "REALM",
  "2201.11903": "思维链 CoT",
  "2210.03629": "ReAct",
  "2203.11171": "自洽性",
};
