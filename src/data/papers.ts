import type { Paper, Topic } from "./types";

export const TOPICS: Topic[] = [
  { id: "foundation", name: "大模型基础", note: "架构、规模与训练范式" },
  { id: "efficient", name: "高效训练与微调", note: "用更少算力改模型" },
  { id: "generative", name: "生成模型", note: "图像与内容的生成机制" },
  { id: "retrieval", name: "检索与知识", note: "让模型用上外部知识" },
  { id: "reasoning", name: "推理与智能体", note: "让模型多想一步" },
];

export const PAPERS: Paper[] = [
  {
    id: "1706.03762",
    title: "Attention Is All You Need",
    titleZh: "注意力就是全部",
    authors: [
      "Ashish Vaswani",
      "Noam Shazeer",
      "Niki Parmar",
      "Jakob Uszkoreit",
      "Llion Jones",
      "Aidan N. Gomez",
      "Łukasz Kaiser",
      "Illia Polosukhin",
    ],
    year: 2017,
    venue: "NeurIPS 2017",
    abstract:
      "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable.",
    abstractZh:
      "提出完全基于注意力机制的 Transformer，去掉循环与卷积。翻译质量更好，训练可以高度并行。",
    topics: ["foundation"],
    addedAt: "2026-11-12",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/1706.03762",
  },
  {
    id: "2005.14165",
    title: "Language Models are Few-Shot Learners",
    titleZh: "少样本学习的大模型",
    authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder", "Melanie Subbiah", "Jared Kaplan"],
    year: 2020,
    venue: "NeurIPS 2020",
    abstract:
      "We train GPT-3, an autoregressive language model with 175 billion parameters, and test its performance in the few-shot setting, where the model is given only a handful of demonstrations at inference time.",
    abstractZh:
      "训练 1750 亿参数的 GPT-3，展示只给少量示例、不更新参数也能完成新任务的能力。",
    topics: ["foundation"],
    addedAt: "2026-11-12",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2005.14165",
  },
  {
    id: "2001.08361",
    title: "Scaling Laws for Neural Language Models",
    titleZh: "大模型的缩放定律",
    authors: ["Jared Kaplan", "Sam McCandlish", "Tom Henighan", "Tom B. Brown", "Chester Chess"],
    year: 2020,
    venue: "arXiv preprint",
    abstract:
      "We study empirical scaling laws for language model performance on the cross-entropy loss. Loss scales as a power-law with model size, dataset size, and the amount of compute used for training.",
    abstractZh:
      "损失随模型规模、数据量与计算量呈幂律下降，为「把模型做大」提供了可预测的经验规律。",
    topics: ["foundation"],
    addedAt: "2026-11-13",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2001.08361",
  },
  {
    id: "2106.09685",
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    titleZh: "LoRA：冻结大模型，只学一小块",
    authors: [
      "Edward J. Hu",
      "Yelong Shen",
      "Phillip Wallis",
      "Zeyuan Allen-Zhu",
      "Yuanzhi Li",
      "Shean Wang",
      "Lu Wang",
      "Weizhu Chen",
    ],
    year: 2021,
    venue: "ICLR 2022",
    abstract:
      "We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer. Compared to fine-tuning GPT-3 175B, LoRA reduces trainable parameters by 10,000 times and GPU memory by 3 times, while maintaining model quality.",
    abstractZh:
      "冻结预训练权重，只训练低秩分解矩阵。可训练参数减少一万倍、显存减少三倍，效果接近全量微调。",
    topics: ["efficient"],
    addedAt: "2026-11-13",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2106.09685",
  },
  {
    id: "2305.14314",
    title: "QLoRA: Efficient Finetuning of Quantized LLMs",
    titleZh: "QLoRA：在 4 比特模型上微调",
    authors: ["Tim Dettmers", "Artidoro Pagnoni", "Ari Holtzman", "Luke Zettlemoyer"],
    year: 2023,
    venue: "NeurIPS 2023",
    abstract:
      "QLoRA uses a frozen, 4-bit quantized pretrained language model and backpropagates gradients into Low Rank Adapters, enabling finetuning of a 65B parameter model on a single 48GB GPU.",
    abstractZh:
      "把基座模型压到 4 比特，梯度只回传给 LoRA 适配器，单张 48GB 显卡即可微调 650 亿参数模型。",
    topics: ["efficient"],
    addedAt: "2026-11-14",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2305.14314",
  },
  {
    id: "2205.14135",
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    titleZh: "FlashAttention：把注意力算得更快",
    authors: ["Tri Dao", "Daniel Y. Fu", "Stefano Ermon", "Atri Rudra", "Christopher Ré"],
    year: 2022,
    venue: "NeurIPS 2022",
    abstract:
      "We propose FlashAttention, an IO-aware exact attention algorithm that uses tiling to reduce the number of memory reads and writes between GPU high bandwidth memory and on-chip SRAM.",
    abstractZh:
      "按显存读写规律分块计算注意力，减少 HBM 与片上 SRAM 之间的搬运，结果精确且更快。",
    topics: ["efficient"],
    addedAt: "2026-11-14",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2205.14135",
  },
  {
    id: "2006.11239",
    title: "Denoising Diffusion Probabilistic Models",
    titleZh: "扩散模型：从噪声里长出一张图",
    authors: ["Jonathan Ho", "Ajay Jain", "Pieter Abbeel"],
    year: 2020,
    venue: "NeurIPS 2020",
    abstract:
      "We present high quality image synthesis results using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics. The model learns to reverse a gradual noising process.",
    abstractZh:
      "先逐步加噪，再训练网络学会逐步去噪；从纯噪声出发，反向生成高质量图像。",
    topics: ["generative"],
    addedAt: "2026-11-15",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2006.11239",
  },
  {
    id: "2112.10752",
    title: "High-Resolution Image Synthesis with Latent Diffusion Models",
    titleZh: "潜空间扩散：高分辨率图像生成",
    authors: ["Robin Rombach", "Andreas Blattmann", "Dominik Lorenz", "Patrick Esser", "Björn Ommer"],
    year: 2021,
    venue: "CVPR 2022",
    abstract:
      "By decomposing the image formation process into a sequential application of denoising autoencoders, diffusion models achieve state-of-the-art synthesis results. We apply them in the latent space of pretrained autoencoders to reduce compute.",
    abstractZh:
      "把扩散过程放到压缩后的潜空间里做，在保持图像质量的同时大幅降低计算量，是 Stable Diffusion 的基础。",
    topics: ["generative"],
    addedAt: "2026-11-15",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2112.10752",
  },
  {
    id: "1406.2661",
    title: "Generative Adversarial Networks",
    titleZh: "生成对抗网络 GAN",
    authors: ["Ian J. Goodfellow", "Jean Pouget-Abadie", "Mehdi Mirza", "Bing Xu", "David Warde-Farley"],
    year: 2014,
    venue: "NeurIPS 2014",
    abstract:
      "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G and a discriminative model D.",
    abstractZh:
      "生成器与判别器互相对抗：一个负责造假，一个负责识破，在博弈中逼近真实数据分布。",
    topics: ["generative"],
    addedAt: "2026-11-16",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/1406.2661",
  },
  {
    id: "2005.11401",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    titleZh: "RAG：让模型开卷考试",
    authors: [
      "Patrick Lewis",
      "Ethan Perez",
      "Aleksandra Piktus",
      "Fabio Petroni",
      "Vladimir Karpukhin",
      "Naman Goyal",
      "Heinrich Küttler",
      "Mike Lewis",
      "Wen-tau Yih",
      "Tim Rocktäschel",
      "Sebastian Riedel",
      "Douwe Kiela",
    ],
    year: 2020,
    venue: "NeurIPS 2020",
    abstract:
      "We combine pre-trained parametric and non-parametric memory for language generation. The retriever returns relevant passages from Wikipedia and the generator produces answers conditioned on both the question and the retrieved passages.",
    abstractZh:
      "把参数记忆与外部文档库结合：先检索相关段落，再让生成器带着段落作答，知识可更新、答案可溯源。",
    topics: ["retrieval"],
    addedAt: "2026-11-16",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2005.11401",
  },
  {
    id: "2004.04906",
    title: "Dense Passage Retrieval for Open-Domain Question Answering",
    titleZh: "DPR：用向量找段落",
    authors: ["Vladimir Karpukhin", "Barlas Oğuz", "Sewon Min", "Patrick Lewis", "Ledell Wu"],
    year: 2020,
    venue: "EMNLP 2020",
    abstract:
      "We show that retrieval can be practically implemented using dense representations alone, where embeddings are learned from a small number of questions and passages by a simple dual-encoder framework.",
    abstractZh:
      "用双塔编码器把问题和段落映射到同一向量空间，靠最近邻检索，效果超过传统稀疏检索。",
    topics: ["retrieval"],
    addedAt: "2026-11-17",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2004.04906",
  },
  {
    id: "2002.08909",
    title: "REALM: Retrieval-Augmented Language Model Pre-Training",
    titleZh: "REALM：预训练时就学会检索",
    authors: ["Kelvin Guu", "Kenton Lee", "Zora Tung", "Panupong Pasupat", "Ming-Wei Chang"],
    year: 2020,
    venue: "ICML 2020",
    abstract:
      "We present REALM, a retrieval-augmented language model that learns to retrieve and attend over documents from a large corpus during pre-training, using masked language modeling as the learning signal.",
    abstractZh:
      "在预训练阶段就让模型学会检索文档，把「查资料」变成语言模型能力的一部分。",
    topics: ["retrieval"],
    addedAt: "2026-11-17",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2002.08909",
  },
  {
    id: "2201.11903",
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    titleZh: "思维链：让模型把步骤写出来",
    authors: ["Jason Wei", "Xuezhi Wang", "Dale Schuurmans", "Maarten Bosma", "Brian Ichter"],
    year: 2022,
    venue: "NeurIPS 2022",
    abstract:
      "We explore how generating a chain of thought — a series of intermediate reasoning steps — significantly improves the ability of large language models to perform complex reasoning. Experiments show that such reasoning abilities emerge naturally in sufficiently large models.",
    abstractZh:
      "在示例里给出中间推理步骤，模型就会模仿着先写过程再给答案；这种能力在足够大的模型上才明显出现。",
    topics: ["reasoning"],
    addedAt: "2026-11-18",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2201.11903",
  },
  {
    id: "2210.03629",
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    titleZh: "ReAct：边推理，边行动",
    authors: ["Shunyu Yao", "Jeffrey Zhao", "Dian Yu", "Nan Du", "Izhak Shafran"],
    year: 2022,
    venue: "ICLR 2023",
    abstract:
      "We explore the use of large language models to generate both reasoning traces and task-specific actions in an interleaved manner, allowing the model to interact with external environments.",
    abstractZh:
      "让模型交替生成推理与动作：想一想、查一下、再想一想，把外部工具纳入解决问题的主循环。",
    topics: ["reasoning"],
    addedAt: "2026-11-18",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2210.03629",
  },
  {
    id: "2203.11171",
    title: "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
    titleZh: "自洽性：让模型多推几条路",
    authors: ["Xuezhi Wang", "Jason Wei", "Dale Schuurmans", "Quoc Le", "Ed Chi"],
    year: 2022,
    venue: "ICLR 2023",
    abstract:
      "We propose self-consistency, a decoding strategy that samples diverse reasoning paths and selects the most consistent answer by marginalizing out the sampled reasoning paths.",
    abstractZh:
      "对同一道题采样多条推理路径，对最终答案投票，用「多数一致」提升复杂推理的准确率。",
    topics: ["reasoning"],
    addedAt: "2026-11-18",
    status: "ready",
    sourceUrl: "https://arxiv.org/abs/2203.11171",
  },
];

export const PAPER_MAP = new Map(PAPERS.map((paper) => [paper.id, paper]));

export const TOPIC_MAP = new Map(TOPICS.map((topic) => [topic.id, topic]));