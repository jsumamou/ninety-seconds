// 「论文对撞」数据：每组 2–3 篇关系最紧的论文，分界线与易混点均核对自论文原文/摘要。
// 只做对照入口，不复制课稿；微课仍走 #/paper/:id。

export interface ClashSide {
  paperId: string;
  gist: string;
  difference: string;
  scene: string;
}

export interface ClashPair {
  id: string;
  title: string;
  papers: string[];
  divider: string;
  confusion: string;
  notReplace: string;
  scene: string;
  sides: ClashSide[];
}

export const CLASH_PAIRS: ClashPair[] = [
  {
    id: "lora-vs-qlora",
    title: "LoRA vs QLoRA",
    papers: ["2106.09685", "2305.14314"],
    divider:
      "冻结的基座要不要先压到 4 比特：LoRA 在 16 位权重旁挂低秩旁路，QLoRA 在此基础上把基座量化成 4 位再训练。",
    confusion:
      "容易以为 QLoRA 换了一种微调算法。它其实包含 LoRA：适配器仍按 16 位训练，省显存靠的是 NF4 量化、双重量化和分页优化器。",
    notReplace:
      "显存充足、要求与 16 位基座尽量等价时，标准 LoRA 更稳；只有一张 48GB 卡想微调 650 亿参数模型，QLoRA 才不可替代。",
    scene: "显存够用先上 LoRA；单卡硬啃 65B 级模型，选 QLoRA。",
    sides: [
      {
        paperId: "2106.09685",
        gist: "冻结预训练权重，只训练低秩分解矩阵，可训练参数减少一万倍。",
        difference: "在每层注入低秩矩阵 A·B，原权重不动；显存降三倍，效果接近全量微调。",
        scene: "显存中等、要最小改动接上现有大模型。",
      },
      {
        paperId: "2305.14314",
        gist: "把基座压到 4 比特，梯度只回传给 LoRA 适配器，单卡 48GB 微调 65B。",
        difference: "NF4 量化 + 双重量化 + 分页优化器；适配器仍是 16 位，量化误差由适配器吸收。",
        scene: "只有一张消费级/48GB 显卡，又要动超大模型。",
      },
    ],
  },
  {
    id: "rag-vs-dpr-vs-realm",
    title: "RAG vs DPR vs REALM",
    papers: ["2005.11401", "2004.04906", "2002.08909"],
    divider:
      "同样是「检索」，干的事完全不同：DPR 只是检索器本身，RAG 把检索结果拼进输入喂给生成器，REALM 让检索在预训练阶段就参与训练。",
    confusion:
      "最容易把 REALM 也当成「检索增强生成」。REALM 没有独立的生成器，它增强的是语言模型预训练本身。",
    notReplace:
      "要可溯源的问答（答案带着原文段落），RAG 有生成器；只搭向量检索底座，DPR 更轻；研究检索器能否端到端训练，才看 REALM。",
    scene: "做知识问答产品先看 RAG；搭检索底座看 DPR；关注检索与预训练联合优化看 REALM。",
    sides: [
      {
        paperId: "2004.04906",
        gist: "双塔编码器把问题与段落映射到同一向量空间，靠最近邻检索。",
        difference: "纯检索：只负责找段落，不生成答案。",
        scene: "向量检索底座、开放域检索评测。",
      },
      {
        paperId: "2005.11401",
        gist: "先检索相关段落，再让生成器带着段落作答，知识可更新、答案可溯源。",
        difference: "检索器（DPR）+ 生成器（BART）拼接：检索发生在推理时，文档直接拼进输入。",
        scene: "知识密集问答，需要引用出处。",
      },
      {
        paperId: "2002.08909",
        gist: "在预训练阶段就让模型学会检索，把查资料变成语言模型能力的一部分。",
        difference: "检索器参与预训练，通过掩码语言建模端到端训练；无独立生成器。",
        scene: "研究检索与语言模型联合训练。",
      },
    ],
  },
  {
    id: "cot-vs-self-consistency",
    title: "CoT vs 自洽性",
    papers: ["2201.11903", "2203.11171"],
    divider:
      "思维链是「把步骤写出来」的一问一答；自洽性是「同一题写多条路径，投票选答案」的采样策略。",
    confusion:
      "自洽性不是新的推理方法，它建立在思维链之上：差异只在生成之后——一条直接取答案，还是多条多数投票。",
    notReplace:
      "要延迟和成本最低，单条思维链就够；准确率优先、愿意多花采样预算，自洽性才值得上。",
    scene: "在线实时问答用思维链；离线评测、难题攻坚用自洽性。",
    sides: [
      {
        paperId: "2201.11903",
        gist: "在示例里给出中间推理步骤，模型就会模仿着先写过程再给答案。",
        difference: "单次生成：一条推理路径，直接取最终答案。",
        scene: "延迟敏感、预算有限。",
      },
      {
        paperId: "2203.11171",
        gist: "对同一道题采样多条推理路径，对最终答案投票，用多数一致提升准确率。",
        difference: "多次采样 + 投票：不改变单条推理方式，只改变如何汇总。",
        scene: "准确率优先、可接受多倍采样成本。",
      },
    ],
  },
  {
    id: "ddpm-vs-ldm",
    title: "DDPM vs 潜空间扩散",
    papers: ["2006.11239", "2112.10752"],
    divider:
      "扩散过程在哪做：DDPM 直接在像素上加噪去噪；潜空间扩散先压缩成 latent 再扩散，最后解码回像素。",
    confusion:
      "LDM 不是另一种去噪公式，扩散公式基本沿用 DDPM；它省算力靠的是把扩散搬进压缩后的潜空间。",
    notReplace:
      "不依赖预训练自编码器、追求最大像素保真时看 DDPM；高分辨率、算力有限时 LDM 更合适。",
    scene: "512 以上的高清生成看 LDM；研究扩散原理、小分辨率实验看 DDPM。",
    sides: [
      {
        paperId: "2006.11239",
        gist: "先逐步加噪，再训练网络逐步去噪，从纯噪声反向生成高质量图像。",
        difference: "扩散直接发生在像素空间，训练目标是对噪声的回归。",
        scene: "研究去噪扩散原理、小分辨率图像。",
      },
      {
        paperId: "2112.10752",
        gist: "把扩散放到压缩后的潜空间里做，质量不降、计算量大减，是 Stable Diffusion 的基础。",
        difference: "先训练自编码器压缩到 latent，扩散在潜空间进行，再解码回像素。",
        scene: "高分辨率图像生成、算力受限。",
      },
    ],
  },
  {
    id: "transformer-vs-flashattention",
    title: "Transformer vs FlashAttention",
    papers: ["1706.03762", "2205.14135"],
    divider:
      "一个是架构，一个是实现：Transformer 定义了注意力怎么算；FlashAttention 只改「在哪算、怎么搬」，数学结果完全一致。",
    confusion:
      "以为 FlashAttention 是近似注意力或新架构——它是精确注意力，只是按 IO 分块，避免整个 N×N 矩阵写进显存。",
    notReplace:
      "理解模型结构看 Transformer；关心训练/推理吞吐与显存占用，看 FlashAttention，两者不是替代关系。",
    scene: "读模型结构论文先 Transformer；做工程加速时换成 FlashAttention。",
    sides: [
      {
        paperId: "1706.03762",
        gist: "提出完全基于注意力机制的 Transformer，去掉循环与卷积。",
        difference: "定义架构：多头自注意力 + 前馈层，取代循环结构。",
        scene: "理解大模型骨架的起点。",
      },
      {
        paperId: "2205.14135",
        gist: "按显存读写规律分块计算注意力，减少搬运，结果精确且更快。",
        difference: "不换公式：tiling + 重计算，把中间矩阵留在片上 SRAM。",
        scene: "长序列训练、显存与吞吐优化。",
      },
    ],
  },
  {
    id: "gan-vs-ddpm",
    title: "GAN vs DDPM",
    papers: ["1406.2661", "2006.11239"],
    divider:
      "生成一张图的两条路线：GAN 让判别器当裁判、一次前向出图；DDPM 学着一步步去噪，用多次迭代换训练稳定。",
    confusion:
      "容易把「扩散更强」当成结论。训练信号其实相反：GAN 是生成器与判别器的对抗博弈；DDPM 是逐噪声步的回归目标。",
    notReplace:
      "要一步生成的实时场景，GAN 系更合适；追求训练稳定与分布覆盖，扩散更省心。",
    scene: "实时、单步生成看 GAN；质量与稳定性优先看 DDPM。",
    sides: [
      {
        paperId: "1406.2661",
        gist: "生成器与判别器互相对抗，在博弈中逼近真实数据分布。",
        difference: "对抗训练：判别器分辨真假，生成器学习骗过它；一次前向出样本。",
        scene: "实时生成、能接受对抗训练的不稳定。",
      },
      {
        paperId: "2006.11239",
        gist: "先逐步加噪，再训练网络逐步去噪，从纯噪声反向生成图像。",
        difference: "似然驱动的去噪回归：训练稳定，但采样要多次迭代。",
        scene: "质量与训练稳定性优先。",
      },
    ],
  },
];