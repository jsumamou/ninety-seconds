// 中文关键词 → 英文检索词。
// 原因：OpenAlex 的索引以英文论文为主，直接拿中文短语去 search，命中率极低
// （「注意力机制」在 arXiv 收录里几乎没有可用的英文论文）；
// 所以在检索前把认得的中文术语换成英文，再把残渣去掉。
// 认不出来的中文保持原样发出，不做猜测。

interface Pair {
  zh: string;
  en: string;
}

// 长词优先替换，避免「大模型」先吃掉「大模型基础」
const GLOSSARY: Pair[] = [
  { zh: "大语言模型", en: "large language model" },
  { zh: "大模型基础", en: "large language model foundation" },
  { zh: "大模型", en: "large language model" },
  { zh: "语言模型", en: "language model" },
  { zh: "指令微调", en: "instruction tuning" },
  { zh: "监督微调", en: "supervised fine-tuning" },
  { zh: "参数高效微调", en: "parameter efficient fine-tuning" },
  { zh: "低秩适配", en: "low-rank adaptation" },
  { zh: "微调", en: "fine-tuning" },
  { zh: "提示词", en: "prompt" },
  { zh: "提示学习", en: "prompt learning" },
  { zh: "提示工程", en: "prompt engineering" },
  { zh: "提示", en: "prompt" },
  { zh: "人类反馈强化学习", en: "reinforcement learning from human feedback" },
  { zh: "人类反馈", en: "human feedback" },
  { zh: "强化学习", en: "reinforcement learning" },
  { zh: "对齐", en: "alignment" },
  { zh: "扩散模型", en: "diffusion model" },
  { zh: "生成对抗", en: "generative adversarial" },
  { zh: "生成模型", en: "generative model" },
  { zh: "检索增强生成", en: "retrieval augmented generation" },
  { zh: "检索增强", en: "retrieval augmented" },
  { zh: "检索", en: "retrieval" },
  { zh: "知识图谱", en: "knowledge graph" },
  { zh: "向量检索", en: "dense retrieval" },
  { zh: "思维链", en: "chain of thought" },
  { zh: "思维树", en: "tree of thoughts" },
  { zh: "推理", en: "reasoning" },
  { zh: "智能体", en: "agent" },
  { zh: "工具调用", en: "tool use" },
  { zh: "知识蒸馏", en: "knowledge distillation" },
  { zh: "蒸馏", en: "distillation" },
  { zh: "量化", en: "quantization" },
  { zh: "剪枝", en: "pruning" },
  { zh: "稀疏", en: "sparse" },
  { zh: "注意力机制", en: "attention mechanism" },
  { zh: "注意力", en: "attention" },
  { zh: "自注意力", en: "self-attention" },
  { zh: "缩放定律", en: "scaling law" },
  { zh: "位置编码", en: "positional encoding" },
  { zh: "长上下文", en: "long context" },
  { zh: "上下文学习", en: "in-context learning" },
  { zh: "多模态", en: "multimodal" },
  { zh: "对比学习", en: "contrastive learning" },
  { zh: "自监督", en: "self-supervised" },
  { zh: "图神经网络", en: "graph neural network" },
  { zh: "代码生成", en: "code generation" },
  { zh: "幻觉", en: "hallucination" },
  { zh: "越狱", en: "jailbreak" },
  { zh: "评测", en: "evaluation" },
  { zh: "评估", en: "evaluation" },
  { zh: "推荐系统", en: "recommender system" },
  { zh: "高效训练", en: "efficient training" },
  { zh: "训练", en: "training" },
  { zh: "模型", en: "model" },
].sort((a, b) => b.zh.length - a.zh.length);

const CJK = /[\u4e00-\u9fff]/;

export interface TranslatedQuery {
  /** 实际发给检索接口的关键词 */
  query: string;
  /** 是否发生了中→英替换 */
  translated: boolean;
  /** 命中的术语，用于在界面上说明「按什么词搜的」 */
  matched: string[];
  /** 没能识别的中文片段，提示用户换词 */
  leftover: string;
}

export function toEnglishQuery(raw: string): TranslatedQuery {
  const text = raw.trim();
  if (!text) return { query: "", translated: false, matched: [], leftover: "" };
  if (!CJK.test(text)) return { query: text, translated: false, matched: [], leftover: "" };

  let out = text;
  const matched: string[] = [];
  for (const { zh, en } of GLOSSARY) {
    if (!out.includes(zh)) continue;
    out = out.split(zh).join(` ${en} `);
    matched.push(`${zh} → ${en}`);
  }

  const residual = out.replace(/[\u4e00-\u9fff]+/g, " ").replace(/\s+/g, " ").trim();
  const leftover = (text.match(/[\u4e00-\u9fff]+/g) ?? [])
    .filter((chunk) => !GLOSSARY.some(({ zh }) => zh.includes(chunk) || chunk.includes(zh)))
    .join(" ");

  return {
    // 一个词都没认出来时保持原样，交给 OpenAlex 自己碰运气
    query: residual.length > 0 ? residual : text,
    translated: matched.length > 0,
    matched,
    leftover,
  };
}
