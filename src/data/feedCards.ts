import type { Paper } from "./types";

export interface FeedNumber {
  /** 展示的数字（来自课稿或摘要原文） */
  value: string;
  /** 数字的含义说明 */
  label: string;
}

export interface FeedCardInfo {
  /** 3 个关键词，均来自论文标题/摘要里的真实术语 */
  keywords: string[];
  /** 核心数字：来自已有课稿或摘要；没有就不给，前端不显示 */
  number?: FeedNumber;
}

// 数字逐条核对过来源：
// - 1706.03762「8 张显卡 / 3.5 天」= 课稿第 6 幕（论文：8 张 P100 训练 3.5 天）
// - 2005.14165「1750 亿」= 摘要（175B parameters）
// - 2106.09685「1 万倍」= 摘要（10,000× 可训练参数）
// - 2305.14314「650 亿」= 摘要（65B 模型 + 单张 48GB 显卡）
// - 2201.11903「约 100B」= 课稿（论文中推理能力在 ~100B 规模明显提升）
// 其余论文摘要与课稿没有可靠数字，按红线不显示。
export const FEED_CARDS: Record<string, FeedCardInfo> = {
  "1706.03762": {
    keywords: ["自注意力", "多头", "位置编码"],
    number: { value: "8 张显卡 / 3.5 天", label: "当年训练成本（训练 Transformer big）" },
  },
  "2005.14165": {
    keywords: ["少样本学习", "自回归模型", "零梯度更新"],
    number: { value: "1750 亿", label: "GPT-3 参数量" },
  },
  "2001.08361": {
    keywords: ["幂律", "模型规模", "计算量"],
  },
  "2106.09685": {
    keywords: ["低秩分解", "冻结权重", "省显存"],
    number: { value: "1 万倍", label: "可训练参数降幅（相对全量微调）" },
  },
  "2305.14314": {
    keywords: ["4 比特量化", "NF4", "单卡微调"],
    number: { value: "650 亿", label: "单张 48GB 显卡可微调的模型规模" },
  },
  "2205.14135": {
    keywords: ["分块计算", "IO 感知", "SRAM"],
  },
  "2006.11239": {
    keywords: ["逐步加噪", "反向去噪", "图像生成"],
  },
  "2112.10752": {
    keywords: ["潜空间", "自编码器", "Stable Diffusion"],
  },
  "1406.2661": {
    keywords: ["生成器", "判别器", "对抗博弈"],
  },
  "2005.11401": {
    keywords: ["先检索后生成", "维基百科", "答案溯源"],
  },
  "2004.04906": {
    keywords: ["双塔编码器", "稠密向量", "最近邻检索"],
  },
  "2002.08909": {
    keywords: ["预训练检索", "掩码语言模型", "文档检索"],
  },
  "2201.11903": {
    keywords: ["思维链", "中间步骤", "大模型涌现"],
    number: { value: "约 100B", label: "推理能力开始明显的参数规模" },
  },
  "2210.03629": {
    keywords: ["推理与行动", "外部工具", "交替生成"],
  },
  "2203.11171": {
    keywords: ["多条路径", "多数投票", "自洽"],
  },
};

/** abstractZh 的前半句（没有课稿 bigIdea 时作一句话结论） */
export function firstHalf(abstractZh: string): string {
  const first = abstractZh.split(/[。！？]/).find((part) => part.trim().length > 0) ?? abstractZh;
  if (first.length <= 34) return first;
  const cut = first.indexOf("，");
  return cut > 0 ? first.slice(0, cut) : first.slice(0, 34);
}

export function feedKeywordOf(paper: Paper): string[] {
  return FEED_CARDS[paper.id]?.keywords ?? [];
}

export function feedNumberLabelOf(paper: Paper): FeedNumber | undefined {
  return FEED_CARDS[paper.id]?.number;
}
