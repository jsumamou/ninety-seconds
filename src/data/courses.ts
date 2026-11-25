import type { Course } from "./types";

export const COURSES: Record<string, Course> = {
  "1706.03762": {
    paperId: "1706.03762",
    bigIdea: "把「逐词传递」换成「一步直连」，用注意力换掉循环。",
    scenes: [
      {
        id: "rnn",
        kicker: "01 · 问题",
        title: "老办法：一个词接一个词",
        narration:
          "先看老办法。循环神经网络处理一句话，必须一个词一个词往后算，第五个词要经过四步，才能用上第一个词的信息。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 96, text: "循环神经网络：只能串行", size: 34, weight: 600 },
          { kind: "box", x: 70, y: 230, w: 120, h: 64, label: "词 1" },
          { kind: "box", x: 245, y: 230, w: 120, h: 64, label: "词 2" },
          { kind: "box", x: 420, y: 230, w: 120, h: 64, label: "词 3" },
          { kind: "box", x: 595, y: 230, w: 120, h: 64, label: "词 4" },
          { kind: "box", x: 770, y: 230, w: 120, h: 64, label: "词 5" },
          { kind: "arrow", x1: 190, y1: 262, x2: 240, y2: 262, at: 900 },
          { kind: "arrow", x1: 365, y1: 262, x2: 415, y2: 262, at: 1400 },
          { kind: "arrow", x1: 540, y1: 262, x2: 590, y2: 262, at: 1900 },
          { kind: "arrow", x1: 715, y1: 262, x2: 765, y2: 262, at: 2400 },
          {
            kind: "text",
            x: 60,
            y: 360,
            text: "第 5 个词，要跨过 4 次传递，才能看到第 1 个词",
            size: 24,
            ink: "dim",
            at: 4200,
          },
          {
            kind: "text",
            x: 60,
            y: 446,
            text: "句子有多长，就要等多少步。",
            size: 26,
            ink: "accent",
            at: 7000,
          },
        ],
      },
      {
        id: "serial",
        kicker: "02 · 代价",
        title: "GPU 在等，而不是在算",
        narration:
          "问题不在于模型不够大，而在于排不上队。上一步没算完，下一步就只能干等，上万个计算核心里有大半在闲着。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 110, text: "显存里有上万核，却只能排队", size: 34, weight: 600 },
          { kind: "arrow", x1: 80, y1: 270, x2: 880, y2: 270, ink: "dim" },
          { kind: "circle", cx: 140, cy: 270, r: 10, ink: "chalk" },
          { kind: "circle", cx: 280, cy: 270, r: 10, ink: "chalk", at: 500 },
          { kind: "circle", cx: 420, cy: 270, r: 10, ink: "chalk", at: 1000 },
          { kind: "circle", cx: 560, cy: 270, r: 10, ink: "chalk", at: 1500 },
          { kind: "circle", cx: 700, cy: 270, r: 10, ink: "chalk", at: 2000 },
          { kind: "circle", cx: 840, cy: 270, r: 10, ink: "dim", at: 2500 },
          { kind: "text", x: 140, y: 320, text: "t=1", size: 18, ink: "dim", anchor: "middle" },
          { kind: "text", x: 280, y: 320, text: "t=2", size: 18, ink: "dim", anchor: "middle" },
          { kind: "text", x: 420, y: 320, text: "t=3", size: 18, ink: "dim", anchor: "middle" },
          { kind: "text", x: 560, y: 320, text: "t=4", size: 18, ink: "dim", anchor: "middle" },
          { kind: "text", x: 700, y: 320, text: "t=5", size: 18, ink: "dim", anchor: "middle" },
          { kind: "text", x: 840, y: 320, text: "t=6", size: 18, ink: "dim", anchor: "middle" },
          {
            kind: "text",
            x: 60,
            y: 410,
            text: "序列翻倍，训练时间也接近翻倍",
            size: 24,
            ink: "accent",
            at: 4000,
          },
          {
            kind: "text",
            x: 60,
            y: 476,
            text: "所以问题不是「不够大」，是「排不上队」",
            size: 22,
            ink: "dim",
            at: 6500,
          },
        ],
        followups: [
          {
            question: "循环网络到底卡在哪里？",
            answer:
              "卡在顺序。它必须一个词接一个词地读，后面的词要等前面的处理完，无法并行；词和词隔得越远，信息要传的步数越多，也越容易在路上丢。",
            anchor: "第 1 节",
          },
          {
            question: "并行对训练意味着什么？",
            answer:
              "意味着训练时间大幅缩短。原文报告：Transformer 用 8 张 P100 训练约 3.5 天，达到当时英德翻译的最好成绩，而此前的模型要长得多的时间。",
            anchor: "摘要",
          },
        ],
      },
      {
        id: "attend",
        kicker: "03 · 转念",
        title: "让每个词直接看所有词",
        narration:
          "Transformer 换了个问法：与其把信息一级一级传，不如让每个词直接看所有词，自己决定该关注谁。任意两个位置之间，只隔一步。",
        duration: 16000,
        board: [
          { kind: "text", x: 60, y: 96, text: "自注意力：一步建立任意连接", size: 34, weight: 600 },
          { kind: "circle", cx: 120, cy: 250, r: 30, label: "1" },
          { kind: "circle", cx: 260, cy: 250, r: 30, label: "2" },
          { kind: "circle", cx: 400, cy: 250, r: 30, label: "3", ink: "accent" },
          { kind: "circle", cx: 540, cy: 250, r: 30, label: "4" },
          { kind: "circle", cx: 680, cy: 250, r: 30, label: "5" },
          { kind: "circle", cx: 820, cy: 250, r: 30, label: "6" },
          { kind: "path", d: "M400,218 C340,150 200,150 140,222", ink: "accent", at: 1200 },
          { kind: "path", d: "M400,218 C360,120 280,120 262,218", ink: "chalk", at: 1800 },
          { kind: "path", d: "M402,220 C420,120 520,120 538,220", ink: "chalk", at: 2400 },
          { kind: "path", d: "M404,222 C460,150 620,150 678,220", ink: "chalk", at: 3000 },
          { kind: "path", d: "M406,224 C520,190 720,190 818,222", ink: "chalk", at: 3600 },
          {
            kind: "text",
            x: 60,
            y: 370,
            text: "以第 3 个词为例：它可以同时读取其他位置",
            size: 22,
            ink: "dim",
            at: 4500,
          },
          {
            kind: "text",
            x: 60,
            y: 456,
            text: "距离不再重要，相关才重要",
            size: 28,
            ink: "accent",
            at: 7000,
          },
        ],
        followups: [
          {
            question: "「直接看所有词」看的是什么？",
            answer:
              "看的是每个词的向量表示。每个词先变成向量，自注意力让它在所有词的向量上做加权平均：相关度高的词，权重就大，对它的新表示贡献就多。",
            anchor: "§3.2.1",
          },
          {
            question: "任意两词一步直连，代价是什么？",
            answer:
              "计算量随序列长度平方增长。句子长一倍，注意力矩阵大四倍。原文专门对比了自注意力与循环、卷积的复杂度，后来的稀疏注意力都在压这个代价。",
            anchor: "§3.2.1（表 1）",
          },
        ],
      },
      {
        id: "qkv",
        kicker: "04 · 机制",
        title: "一次注意力，就三步",
        narration:
          "具体怎么做？每个词先生成三个向量：query、key、value，也就是查询、键、值。查询和所有键做点积，算出相关度；softmax 变成权重；最后用权重把值加权求和。",
        duration: 18000,
        board: [
          { kind: "text", x: 60, y: 90, text: "查询、键、值", size: 34, weight: 600 },
          { kind: "box", x: 60, y: 140, w: 240, h: 84, label: "Q 查询", sub: "我想找什么" },
          { kind: "box", x: 360, y: 140, w: 240, h: 84, label: "K 键", sub: "我有什么标签" },
          { kind: "box", x: 660, y: 140, w: 240, h: 84, label: "V 值", sub: "我携带的信息" },
          { kind: "formula", x: 60, y: 310, text: "权重 = softmax( Q · Kᵀ / √d )", size: 32 },
          { kind: "formula", x: 60, y: 386, text: "输出 = 权重 · V", size: 32, ink: "accent" },
          {
            kind: "text",
            x: 60,
            y: 470,
            text: "除 √d：维度越高点积越大，softmax 会过早饱和",
            size: 20,
            ink: "dim",
            at: 9000,
          },
        ],
        followups: [
          {
            question: "为什么除以 √d_k，而不是 d_k？",
            answer:
              "d_k 变大时，点积的数值整体变大，softmax 会被推进梯度极小的区域，训练几乎学不动。除以 √d_k 把点积的方差拉回 1，训练才稳定。",
            anchor: "§3.2.1",
          },
          {
            question: "Q、K、V 到底有什么区别？",
            answer:
              "三者是同一个词的三种线性投影，分工不同。Q 代表「我在找什么」，K 代表「我身上有什么标签」，Q 和 K 点积算出相关度；V 是真正被加权取走的信息。",
            anchor: "§3.2.1",
          },
        ],
      },
      {
        id: "heads",
        kicker: "05 · 多头",
        title: "同时看八种关系",
        narration:
          "一次不够。多头注意力并行做很多组，每组有自己的查询、键和值，有的关注指代，有的关注结构。最后把结果拼起来。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 90, text: "多头：拆成多组问题", size: 34, weight: 600 },
          { kind: "box", x: 60, y: 170, w: 190, h: 110, label: "头 1", sub: "谁指代谁" },
          { kind: "box", x: 290, y: 170, w: 190, h: 110, label: "头 2", sub: "修饰关系" },
          { kind: "box", x: 520, y: 170, w: 190, h: 110, label: "头 3", sub: "句子结构" },
          { kind: "box", x: 750, y: 170, w: 150, h: 110, label: "头 8", sub: "……" },
          {
            kind: "text",
            x: 60,
            y: 350,
            text: "每组独立的 Q / K / V，最后拼接回一个向量",
            size: 24,
            at: 3500,
          },
          {
            kind: "text",
            x: 60,
            y: 430,
            text: "不是重复劳动，而是并行地看不同关系",
            size: 22,
            ink: "accent",
            at: 6500,
          },
        ],
        followups: [
          {
            question: "为什么用八个头，不用一个更大的？",
            answer:
              "一个头只能输出一种加权平均，抓不住所有关系。多个头把向量投到不同子空间，各看各的关系，最后拼起来。原文的基模型固定用 8 个头，每头 64 维。",
            anchor: "§3.2.2",
          },
          {
            question: "多头越多越好吗？",
            answer:
              "不是。头数超过每头的维度容量后，收益会递减，参数量和算力还要照付。原文没有无限加头，而是给出不同头数的对比，说明头数需要权衡。",
            anchor: "§3.2.2（表 3）",
          },
        ],
      },
      {
        id: "result",
        kicker: "06 · 结果",
        title: "代价与结果",
        narration:
          "代价是模型不再天然知道词序，所以要显式加位置编码。换来完全并行的训练：八张显卡、三天半，翻译质量超过当时最好成绩。这在当年很了不起。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 90, text: "没有循环，就没有天然的次序", size: 32, weight: 600 },
          {
            kind: "path",
            d: "M60,250 Q110,190 160,250 T260,250 T360,250 T460,250 T560,250 T660,250",
            ink: "accent",
            at: 1200,
          },
          {
            kind: "text",
            x: 60,
            y: 320,
            text: "位置编码：把「第几个词」写进向量",
            size: 22,
            ink: "dim",
            at: 3000,
          },
          { kind: "text", x: 60, y: 410, text: "换来完全并行", size: 30, ink: "accent", at: 5000 },
          {
            kind: "text",
            x: 60,
            y: 478,
            text: "8 张 P100 · 3.5 天 · 28.4 BLEU（英→德）",
            size: 24,
            at: 6500,
          },
        ],
      },
    ],
    diagram: {
      headline: "注意力让任意两个词一步直连，训练从串行变成并行。",
      steps: [
        { label: "词向量 + 位置编码", note: "把词义和顺序一起送进网络" },
        { label: "线性变换出 Q / K / V", note: "每个位置生成查询、键、值" },
        { label: "Q 与所有 K 做点积", note: "除以 √d 后 softmax 成权重" },
        { label: "用权重加权 V", note: "相关的位置贡献更多信息" },
        { label: "多头并行 + 拼接", note: "同时捕捉指代、结构等不同关系" },
        { label: "前馈网络 + 残差", note: "逐层堆叠成 Transformer" },
      ],
      insight: "关键不是「记得更牢」，而是把信息传递的路径从 O(n) 步压到 1 步。",
      conclusions: [
        "任意两个位置的路径长度都是 1，长句不再逐级衰减。",
        "没有循环依赖，训练可以在整条序列上并行。",
        "多头让同一层同时表达多种关系，而不是一种平均注意力。",
      ],
      anchors: [
        { label: "§3.2.1", detail: "缩放点积注意力的公式与 √d 的作用" },
        { label: "§3.2.2", detail: "多头注意力的并行结构与拼接方式" },
        { label: "第 8 节 · 表 2", detail: "8 卡 3.5 天、28.4 BLEU 的训练结果" },
      ],
    },
    quiz: [
      {
        id: "att-1",
        paperId: "1706.03762",
        question: "Transformer 相比循环神经网络，最核心的改变是什么？",
        options: [
          "把模型做得更深、更宽",
          "去掉循环，用自注意力让任意位置直接交互",
          "用卷积替代了全连接层",
          "先把句子压缩成一个固定向量",
        ],
        answer: 1,
        explanation:
          "Transformer 完全依赖注意力，不再按时间步递归。任意两个位置一步可达，训练也能整句并行。",
        anchor: "摘要；§3.1 编码器与解码器结构",
      },
      {
        id: "att-2",
        paperId: "1706.03762",
        question: "缩放点积注意力里，为什么要除以 √d？",
        options: [
          "为了让输出落在 0 到 1 之间",
          "为了减少参数量",
          "维度变大时点积会变大，softmax 容易饱和、梯度变小",
          "为了给位置编码留出空间",
        ],
        answer: 2,
        explanation:
          "假设各分量独立且方差为 1，点积的方差约为 d。除以 √d 把方差拉回 1，softmax 不至于被推到极端。",
        anchor: "§3.2.1 公式 (1) 下方的说明",
      },
      {
        id: "att-3",
        paperId: "1706.03762",
        question: "多头注意力存在的意义是什么？",
        options: [
          "把同一个注意力算八遍取平均，降低噪声",
          "在不同表示子空间并行关注不同关系",
          "替代前馈网络完成非线性变换",
          "让模型显存占用更小",
        ],
        answer: 1,
        explanation:
          "每个头有独立的投影，可以在不同子空间里关注不同关系；拼接后再投影，信息比单一注意力更丰富。",
        anchor: "§3.2.2 多头注意力",
      },
      {
        id: "att-4",
        paperId: "1706.03762",
        question: "Transformer 为什么需要位置编码？",
        options: [
          "因为注意力计算依赖词的位置编号",
          "自注意力对顺序不敏感，需要额外注入位置信息",
          "为了把词向量对齐到同一长度",
          "为了替代残差连接",
        ],
        answer: 1,
        explanation:
          "自注意力按内容匹配，打乱词序结果不变。论文用不同频率的正弦、余弦函数，给每个位置一个独特模式。",
        anchor: "§3.5 位置编码",
      },
      {
        id: "att-5",
        paperId: "1706.03762",
        question: "缩放点积注意力里，Q、K、V 各自负责什么？",
        options: [
          "Q 存位置，K 存词义，V 存答案",
          "Q 与 K 算相似度得到权重，再对 V 加权求和",
          "Q 生成答案，K 过滤噪声，V 计算梯度",
          "三者是同一矩阵的三份拷贝",
        ],
        answer: 1,
        explanation:
          "查询和键的点积给出「看哪里」的权重，softmax 归一化后对值加权求和，得到这一层的输出。",
        anchor: "§3.2.1 缩放点积注意力",
      },
      {
        id: "att-6",
        paperId: "1706.03762",
        question: "Transformer 训练为什么比 RNN 更容易并行？",
        options: [
          "它把句子截断成短片段分别训练",
          "没有时间步依赖，一个序列的所有位置可同时计算",
          "它的参数量比 RNN 少",
          "它用卷积代替了注意力",
        ],
        answer: 1,
        explanation:
          "RNN 必须等前一步算完，Transformer 的注意力在一层内一次算完，训练可按整句并行。解码时仍是逐步生成。",
        anchor: "摘要；§3.1 编码器与解码器结构",
      },
      {
        id: "att-7",
        paperId: "1706.03762",
        question: "论文比较复杂度时，自注意力层的计算量随序列长度 n 怎么增长？",
        options: [
          "线性，O(n)",
          "平方，O(n²·d)，n 很长时不如循环网络",
          "常数，与 n 无关",
          "立方，O(n³)",
        ],
        answer: 1,
        explanation:
          "每层自注意力要比较所有位置对，复杂度 O(n²·d)。n 大于表示维度 d 时，循环网络反而更省。",
        anchor: "§4 表 1",
      },
      {
        id: "att-8",
        paperId: "1706.03762",
        question: "任意两个位置之间信息传递的路径长度，篇幅里的对比结论是？",
        options: [
          "Transformer 为 O(1)，任意两位一步直连",
          "Transformer 为 O(n)，需要逐个传递",
          "Transformer 为 O(log n)",
          "取决于 batch 大小",
        ],
        answer: 0,
        explanation:
          "自注意力在一层内让任意两个位置直接交互；循环网络要顺序走过中间所有时间步。",
        anchor: "§4 表 1",
      },
      {
        id: "att-9",
        paperId: "1706.03762",
        question: "Transformer base 与 big 两个配置的主要差别是？",
        options: [
          "注意力换成了卷积",
          "层数、表示维度与头数都加大，big 用 16 头、1024 维",
          "big 去掉了位置编码",
          "两者只有学习率不同",
        ],
        answer: 1,
        explanation:
          "论文表格里 base 为 512 维 8 头，big 为 1024 维 16 头，训练成本更高，翻译效果也更好。",
        anchor: "§3.1；表 3",
      },
      {
        id: "att-10",
        paperId: "1706.03762",
        question: "论文训练用的优化器与学习率调度是？",
        options: [
          "SGD，固定学习率",
          "Adam，β2=0.98，warmup 后按步数平方根倒数衰减",
          "RMSprop，余弦退火",
          "AdamW，线性衰减到零",
        ],
        answer: 1,
        explanation:
          "学习率先线性升高 4000 步，再按步数的平方根倒数下降；β2 取 0.98 比默认的 0.999 更稳。",
        anchor: "§5.3 优化器",
      },
      {
        id: "att-11",
        paperId: "1706.03762",
        question: "论文采用的正则化组合是？",
        options: [
          "L2 权重衰减加早停",
          "dropout 0.1 加标签平滑 0.1",
          "数据增强加梯度裁剪",
          "只用标签平滑，不用 dropout",
        ],
        answer: 1,
        explanation:
          "残差、注意力权重等位置都加 dropout 0.1；标签平滑取 0.1，让困惑度变差，但 BLEU 更高。",
        anchor: "§5.4 正则化",
      },
      {
        id: "att-12",
        paperId: "1706.03762",
        question: "论文报告的 big 模型训练成本与翻译成绩是？",
        options: [
          "8 块 GPU 训练 3.5 天，EN-DE 28.4 BLEU",
          "64 块 TPU 训练一个月，EN-DE 41.8 BLEU",
          "单卡 12 小时，EN-DE 25.8 BLEU",
          "16 块 GPU 一周，EN-FR 28.4 BLEU",
        ],
        answer: 0,
        explanation:
          "big 模型在 8 块 P100 上训练 3.5 天，WMT14 英德 28.4 BLEU、英法 41.8 BLEU，成本远低于此前最好结果。",
        anchor: "第 6 节 · 表 2",
      },
    ],
    grandma: {
      scenes: [
        {
          title: "传话游戏：一个词接一个词",
          narration:
            "先看老办法，就像排队传话。机器读一句话，要一个词接一个词往后算。第五个词想用上第一个词，中间得接力四步。",
        },
        {
          title: "电脑在排队，不是在算",
          narration:
            "毛病不是机器不够大，是排不上队。像结账只开一个窗口。上一步没算完，下一步干等。上万个计算核心里，大半在闲着。",
        },
        {
          title: "别传话了，直接互相看",
          narration:
            "Transformer 换了个问法。别一级一级传话了。让每个词直接看所有词，像开会时互相看得见。自己决定该关注谁。任意两个位置，只隔一步。",
        },
        {
          title: "找一次书，就三步",
          narration:
            "具体怎么做？像图书馆找书。每个词做三个向量：查询、键、值。查询和所有键比对，算出亲近度。softmax 把它变成权重。最后用权重把值加权求和。",
        },
        {
          title: "请八位老师，各看各的",
          narration:
            "一次不够。多头注意力，像请八位老师分工。有的看指代，有的看结构。每组有自己的查询、键和值。最后把结果拼起来。",
        },
        {
          title: "发座位号，换来并行",
          narration:
            "代价是模型不再天生知道词序。于是给每个词发座位号，叫位置编码。换来并行的训练：八张显卡、三天半。翻译质量超过当时最好成绩。这在当年很了不起。",
        },
      ],
    },
  },

  "2106.09685": {
    paperId: "2106.09685",
    bigIdea: "冻结原模型，只学一条低秩的「增量」，训练省、合并快、切换轻。",
    scenes: [
      {
        id: "cost",
        kicker: "01 · 问题",
        title: "每个任务，都复制一整个模型",
        narration:
          "全量微调的问题很直接：每换一个任务，就要更新全部参数，再存一份完整的模型副本。对千亿级模型来说，显存和存储都吃不消。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 110, text: "全量微调：每个任务一份完整副本", size: 34, weight: 600 },
          { kind: "text", x: 60, y: 250, text: "175B", size: 76, ink: "accent", weight: 600 },
          { kind: "text", x: 60, y: 300, text: "个参数，全部要更新", size: 24, ink: "dim" },
          {
            kind: "text",
            x: 60,
            y: 400,
            text: "任务越多，副本越多；切换一次，就要换一整套权重",
            size: 22,
            at: 4000,
          },
        ],
      },
      {
        id: "lowrank",
        kicker: "02 · 观察",
        title: "改动可能是「薄」的",
        narration:
          "LoRA 的出发点是：预训练模型已经很强，适配新任务所需的改动，也许并不需要填满整个矩阵，而是集中在少数几个方向上。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 90, text: "任务带来的改动，可能低秩", size: 32, weight: 600 },
          { kind: "box", x: 70, y: 170, w: 300, h: 220, dashed: true },
          {
            kind: "path",
            d: "M130,170 V390 M190,170 V390 M250,170 V390 M310,170 V390 M70,230 H370 M70,290 H370 M70,350 H370",
            ink: "dim",
            at: 800,
          },
          { kind: "text", x: 430, y: 205, text: "ΔW 是 d × k 的大矩阵", size: 24 },
          {
            kind: "text",
            x: 430,
            y: 265,
            text: "但真正有用的方向也许只有几个",
            size: 22,
            ink: "accent",
            at: 3000,
          },
          { kind: "formula", x: 430, y: 350, text: "rank(ΔW) = r ≪ min(d, k)", size: 24, at: 5000 },
        ],
        followups: [
          {
            question: "「低秩」到底是什么意思？",
            answer:
              "秩可以理解为矩阵里真正独立的方向有多少。说改动低秩，是说任务带来的变化集中在少数几个方向上，不需要填满一个大矩阵，两个小矩阵相乘就够表达。",
            anchor: "§4",
          },
          {
            question: "凭什么断定改动一定是低秩的？",
            answer:
              "这是论文的观察和假设，不是数学保证。原文实验把秩压到 1 或 2，效果依然很好，说明很多任务确实只需少数方向；个别任务可能仍需更高秩，原文也讨论过。",
            anchor: "§7.2",
          },
        ],
      },
      {
        id: "factorize",
        kicker: "03 · 方法",
        title: "把增量拆成两个瘦矩阵",
        narration:
          "于是把增量拆成两个小矩阵相乘：A 是随机初始化，B 是零。只训练 A 和 B，原来的权重完全冻结。秩 r 通常只有个位数，最多几十。",
        duration: 17000,
        board: [
          { kind: "text", x: 60, y: 90, text: "ΔW = B · A", size: 40, ink: "accent", weight: 600 },
          { kind: "box", x: 80, y: 230, w: 260, h: 130, label: "A", sub: "r × k · 随机初始化" },
          { kind: "box", x: 520, y: 230, w: 260, h: 130, label: "B", sub: "d × r · 初始化为 0" },
          {
            kind: "text",
            x: 80,
            y: 420,
            text: "只更新 A 和 B；W 完全冻结",
            size: 26,
            at: 3500,
          },
          { kind: "text", x: 80, y: 480, text: "r 常见取值：4 ～ 64", size: 20, ink: "dim", at: 6000 },
        ],
      },
      {
        id: "zero",
        kicker: "04 · 细节",
        title: "从「原来的自己」出发",
        narration:
          "为什么 B 要从零开始？因为这样训练第一步时，增量正好是零，模型的输出和原来完全一致。它从原来的自己出发，而不是被随机扰动。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 100, text: "起点：W + B·A = W + 0 = W", size: 30, weight: 600 },
          { kind: "box", x: 60, y: 210, w: 840, h: 110, label: "初始输出与原模型完全一致" },
          {
            kind: "text",
            x: 60,
            y: 400,
            text: "对超大模型，起步错一步，后面很难拉回",
            size: 24,
            ink: "dim",
            at: 4000,
          },
          { kind: "text", x: 60, y: 470, text: "训练稳定，是这个小设计换来的", size: 22, ink: "accent", at: 6500 },
        ],
        followups: [
          {
            question: "B 置零，A 为什么随机初始化？",
            answer:
              "A 决定改动发生在哪些方向上，随机初始化让方向各不相同；B 负责方向上的幅度，置零保证训练一开始输出和原模型一模一样。两者合起来，起步就是原模型。",
            anchor: "§4",
          },
          {
            question: "只训 A、B，原权重动吗？",
            answer:
              "不动。原权重冻结，梯度只流进 A、B 两个小矩阵。训练完把乘积加回原权重，推理时没有任何额外延迟，这是 LoRA 和外挂适配器方案最大的不同。",
            anchor: "§4.1",
          },
        ],
      },
      {
        id: "merge",
        kicker: "05 · 推理",
        title: "合并回去，零额外延迟",
        narration:
          "训练结束后，把 B 乘 A 加回原权重，得到一个普通的权重矩阵。推理时照常计算，没有任何额外步骤，这也是 LoRA 和「外挂适配器」最大的区别。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 100, text: "推理前：W' = W + B·A", size: 30, weight: 600 },
          { kind: "box", x: 60, y: 210, w: 200, h: 90, label: "W" },
          { kind: "text", x: 280, y: 266, text: "+", size: 32, anchor: "middle" },
          { kind: "box", x: 310, y: 210, w: 200, h: 90, label: "B · A" },
          { kind: "text", x: 540, y: 266, text: "=", size: 32, anchor: "middle" },
          { kind: "box", x: 570, y: 210, w: 220, h: 90, label: "W'", ink: "accent" },
          {
            kind: "text",
            x: 60,
            y: 380,
            text: "合并成一个普通矩阵，推理零额外计算",
            size: 24,
            ink: "accent",
            at: 4000,
          },
          {
            kind: "text",
            x: 60,
            y: 450,
            text: "切换任务时，只需换回原来的 W，再合并另一个适配器",
            size: 22,
            ink: "dim",
            at: 6500,
          },
        ],
      },
      {
        id: "result",
        kicker: "06 · 结果",
        title: "省下的不是一点",
        narration:
          "在 GPT-3 这个量级上，LoRA 把可训练参数减少了一万倍，显存只要三分之一，效果接近全量微调。换任务，只需要换一个几兆的适配器。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 170, text: "10,000×", size: 56, ink: "accent", weight: 600 },
          { kind: "text", x: 60, y: 215, text: "更少的可训练参数", size: 22, ink: "dim" },
          { kind: "text", x: 500, y: 170, text: "3×", size: 56, ink: "accent", weight: 600 },
          { kind: "text", x: 500, y: 215, text: "更少的显存", size: 22, ink: "dim" },
          { kind: "text", x: 60, y: 340, text: "0", size: 56, weight: 600 },
          { kind: "text", x: 60, y: 385, text: "额外推理延迟", size: 22, ink: "dim" },
          {
            kind: "text",
            x: 500,
            y: 350,
            text: "换任务，只换几 MB 的适配器",
            size: 24,
            ink: "accent",
            at: 4000,
          },
        ],
        followups: [
          {
            question: "「一万倍」是怎么算出来的？",
            answer:
              "论文在 GPT-3 175B 上对比：全量微调要更新全部参数，LoRA 只训练每层旁路的小矩阵，可训练参数减少约一万倍，显存减少约三倍。这是原文报告的数字。",
            anchor: "第 5 节（GPT-3 175B 实验）",
          },
        ],
      },
    ],
    diagram: {
      headline: "冻结大模型，只学一条低秩增量；训练省钱，推理免费。",
      steps: [
        { label: "冻结 W", note: "预训练权重不动，保住已有能力" },
        { label: "加旁路 A、B", note: "A 随机初始化，B 置零" },
        { label: "只训练 A 与 B", note: "可训练参数从十亿级降到百万级" },
        { label: "增量相加", note: "ΔW = B·A 逼近任务所需的改动" },
        { label: "推理前合并", note: "W' = W + B·A，普通矩阵运算" },
        { label: "按任务换适配器", note: "基座共享，适配器独立存储" },
      ],
      insight: "真正省下的不是训练那几天，而是「一个基座服务很多任务」的部署方式。",
      conclusions: [
        "GPT-3 175B 上，可训练参数减少 1 万倍、显存减少 3 倍。",
        "B 初始为零，保证训练起点与预训练模型一致。",
        "合并后无额外推理延迟，适合多任务共享同一基座。",
      ],
      anchors: [
        { label: "§4", detail: "低秩分解的形式与初始化方式" },
        { label: "§4.1", detail: "合并 W + BA、推理零延迟" },
        { label: "表 4 / 第 5 节", detail: "参数效率与效果对比" },
      ],
    },
    quiz: [
      {
        id: "lora-1",
        paperId: "2106.09685",
        question: "LoRA 为什么能做到推理零额外延迟？",
        options: [
          "因为它只训练了模型的最后几层",
          "因为推理前可以把 B·A 合并进原来的 W",
          "因为它把权重压缩成了 4 比特",
          "因为它用了更快的注意力实现",
        ],
        answer: 1,
        explanation:
          "训练完成后 W' = W + BA 就是一个普通矩阵，推理路径完全不变；外挂式适配器则要在前向时额外计算。",
        anchor: "§4.1 将 LoRA 合并进预训练权重",
      },
      {
        id: "lora-2",
        paperId: "2106.09685",
        question: "矩阵 B 初始化为零，最重要的作用是什么？",
        options: [
          "让梯度更大，训练更快",
          "让训练起点与原模型完全一致，避免初始扰动",
          "减少显存占用",
          "保证 A 和 B 的秩相同",
        ],
        answer: 1,
        explanation:
          "B = 0 时 BA = 0，初始前向结果与预训练模型完全相同，模型从稳定的起点开始学习增量。",
        anchor: "§4 初始化策略",
      },
      {
        id: "lora-3",
        paperId: "2106.09685",
        question: "秩 r 变小，通常会带来什么？",
        options: [
          "可训练参数更少，但表达能力也更受限",
          "推理速度线性变慢",
          "必须同时解冻 W 才能训练",
          "模型参数量反而增加",
        ],
        answer: 0,
        explanation:
          "r 决定增量的秩上限：越小越省参数，但能表达的改动也更少，需要在效果和成本之间权衡。",
        anchor: "§4.2 秩的选择与消融实验",
      },
      {
        id: "lora-4",
        paperId: "2106.09685",
        question: "LoRA 的增量为什么常写成 (α/r)·BA？",
        options: [
          "为了让 B 的初始值不为零",
          "调整 α 等效于调学习率量级，换秩时不必重调超参",
          "为了把参数量再压缩 r 倍",
          "为了让推理时不需要合并",
        ],
        answer: 1,
        explanation:
          "缩放因子 α/r 控制增量幅度。α 固定时改变秩 r，不用重新搜学习率，实验更好复现。",
        anchor: "§4.1 缩放因子",
      },
      {
        id: "lora-5",
        paperId: "2106.09685",
        question: "论文的主体实验里，LoRA 主要加在哪些权重上？",
        options: [
          "词嵌入与输出层",
          "注意力的查询、值投影（Wq、Wv）",
          "位置编码",
          "所有层归一化的参数",
        ],
        answer: 1,
        explanation:
          "主体实验把 LoRA 加在 Wq、Wv；消融显示同时加到其它投影，收益有限而参数更多。",
        anchor: "§6.1 加在哪些权重上",
      },
      {
        id: "lora-6",
        paperId: "2106.09685",
        question: "论文摘要给出的规模数字是？",
        options: [
          "与微调 GPT-3 175B 相比，可训练参数减少 10,000 倍，显存减少 3 倍",
          "参数量减少 100 倍，速度快 3 倍",
          "显存减少 10,000 倍，参数减少 3 倍",
          "训练时间减少 10,000 小时",
        ],
        answer: 0,
        explanation:
          "摘要原文：可训练参数减少一万倍、GPU 显存需求减少三倍，同时保持模型质量。",
        anchor: "摘要",
      },
      {
        id: "lora-7",
        paperId: "2106.09685",
        question: "冻结原权重 W、只训练 A 和 B，带来的好处不包括哪一项？",
        options: [
          "原模型知识不会被训练数据冲掉",
          "同一基座可以挂多个任务的小适配器",
          "不必为 W 保存梯度与优化器状态",
          "推理时必须多算一次 BA，增加延迟",
        ],
        answer: 3,
        explanation:
          "LoRA 恰恰可以把 BA 合并进 W，推理路径不变；前三项都是冻结带来的真实收益。",
        anchor: "§1 引言；§4",
      },
      {
        id: "lora-8",
        paperId: "2106.09685",
        question: "一个基座要服务多个任务，LoRA 的部署方式是？",
        options: [
          "每个任务存一份完整模型副本",
          "每个任务只存一对 BA，按需加载或合并后切换",
          "把所有任务混在一个适配器里训练",
          "每次切换任务都要重训基座",
        ],
        answer: 1,
        explanation:
          "适配器只有原模型参数的一小部分，按任务切换、合并进权重后推理零延迟。",
        anchor: "§4.1 将 LoRA 合并进预训练权重",
      },
      {
        id: "lora-9",
        paperId: "2106.09685",
        question: "论文把 LoRA 与外挂适配器（adapter）相比，关键优势是？",
        options: [
          "adapter 不能训练，LoRA 可以",
          "adapter 插入层间、增加推理延迟；LoRA 可合并、无额外延迟",
          "LoRA 的参数量比 adapter 多",
          "adapter 只能用于视觉任务",
        ],
        answer: 1,
        explanation:
          "Houlsby 式 adapter 在层间插模块，前向要多走串行计算；LoRA 是并行的低秩旁路，能合并进原矩阵。",
        anchor: "§1 引言",
      },
      {
        id: "lora-10",
        paperId: "2106.09685",
        question: "论文关于秩 r 的消融结论是？",
        options: [
          "r 必须等于隐藏维度才能工作",
          "r 取很小（如 1–4）就有效果，更大收益递减",
          "r 越大参数量越少",
          "r 只能取偶数",
        ],
        answer: 1,
        explanation:
          "任务更新的有效秩很低：r=1 在 Wq、Wv 上已有竞争力，增大 r 的提升有限。",
        anchor: "§6.2 秩的选择",
      },
      {
        id: "lora-11",
        paperId: "2106.09685",
        question: "LoRA 训练时的优化目标是什么？",
        options: [
          "额外加一项让 BA 尽量稀疏",
          "与全量微调相同的任务损失，只是优化变量换成 A、B",
          "重建原始权重的回归损失",
          "对抗损失",
        ],
        answer: 1,
        explanation:
          "论文没有引入新目标：冻结 W 后，对 A、B 做常规梯度下降，最小化原本的任务损失即可。",
        anchor: "§4；§5.1",
      },
      {
        id: "lora-12",
        paperId: "2106.09685",
        question: "LoRA 省显存，主要省在哪？",
        options: [
          "前向计算时不用加载基座模型",
          "冻结的 W 不存梯度与优化器状态，只更新 A、B",
          "把激活值全部写到磁盘",
          "用半精度保存输出",
        ],
        answer: 1,
        explanation:
          "显存大头是梯度与优化器状态；W 冻结后这部分为零，只剩小矩阵 A、B 的开销。",
        anchor: "§4；§5 讨论",
      },
    ],
    grandma: {
      scenes: [
        {
          title: "换道菜，就重买一个厨房",
          narration:
            "全量微调的问题很直接。每换一个任务，像为一道新菜重买厨房。要更新全部参数，再存一份完整副本。千亿级模型，显存和存储都吃不消。",
        },
        {
          title: "装修好的房子，只改几面墙",
          narration:
            "LoRA 的出发点是：预训练模型已经很强。像装修好的房子。适配新任务，也许只改几面墙。改动不用填满整个矩阵，集中在少数方向上。",
        },
        {
          title: "改动写成两张便利贴",
          narration:
            "增量拆成两个小矩阵相乘。像在原书旁贴便利贴。A 随机初始化，B 是零。只训练 A、B，原来权重完全冻结。秩 r 通常只有个位数，最多几十。",
        },
        {
          title: "第一天，先照原样做",
          narration:
            "为什么 B 要从零开始？就像新店员上岗，第一天先照原样做。训练第一步时，增量正好是零。输出和原来完全一致，而不是被随机扰动。",
        },
        {
          title: "改动抄回书，不多一步",
          narration:
            "训练结束后，把 B 乘 A 加回原权重。就像便利贴的改动抄回书里，书还是原来那本。推理时照常计算，没有额外步骤。这是 LoRA 和外挂适配器最大的区别。",
        },
        {
          title: "换菜只换一张菜单纸",
          narration:
            "在 GPT-3 这个量级上，LoRA 把可训练参数减少了一万倍。显存只要三分之一。效果接近全量微调。换任务，像换张菜单纸。只换一个几兆的适配器。",
        },
      ],
    },
  },

  "2005.11401": {
    paperId: "2005.11401",
    bigIdea: "把「背知识」改成「查资料」：检索段落，再带着段落作答。",
    scenes: [
      {
        id: "frozen",
        kicker: "01 · 问题",
        title: "知识被冻结在参数里",
        narration:
          "语言模型的知识，在训练结束那一刻就定型了。想让它知道新发生的事，只能继续训练或重新训练，代价高，旧知识还可能被覆盖。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 100, text: "参数记忆：训练完就定型", size: 34, weight: 600 },
          { kind: "box", x: 60, y: 210, w: 840, h: 100, label: "预训练语料  →  参数 W" },
          {
            kind: "text",
            x: 60,
            y: 370,
            text: "更新知识 = 继续训练 / 重新训练",
            size: 24,
            ink: "dim",
            at: 4000,
          },
          { kind: "text", x: 60, y: 450, text: "贵，而且会牵一发动全身", size: 22, ink: "accent", at: 6500 },
        ],
      },
      {
        id: "guess",
        kicker: "02 · 症状",
        title: "答不出来，就开始编",
        narration:
          "问它训练之后发生的事，它要么不知道，要么给出一个看起来很合理、但没有任何依据的答案。知识过期和幻觉，是参数记忆的两个硬伤。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 90, text: "闭卷作答的两个硬伤", size: 32, weight: 600 },
          { kind: "box", x: 60, y: 160, w: 760, h: 84, label: "问：上周发布的新模型，参数多大？" },
          { kind: "box", x: 60, y: 300, w: 760, h: 100, label: "答：像模像样，但没有依据", ink: "accent" },
          {
            kind: "text",
            x: 60,
            y: 460,
            text: "知识过期 · 幻觉难查",
            size: 24,
            ink: "dim",
            at: 5000,
          },
        ],
      },
      {
        id: "openbook",
        kicker: "03 · 思路",
        title: "把闭卷改成开卷",
        narration:
          "RAG 的做法很朴素：先找资料，再作答。问题交给检索器，检索器从文档库里取出相关段落，再和问题一起交给生成器。",
        duration: 16000,
        board: [
          { kind: "text", x: 60, y: 90, text: "开卷：先检索，再生成", size: 34, weight: 600 },
          { kind: "box", x: 60, y: 180, w: 220, h: 86, label: "问题" },
          { kind: "box", x: 350, y: 180, w: 220, h: 86, label: "检索器" },
          { kind: "box", x: 650, y: 180, w: 220, h: 86, label: "文档库" },
          { kind: "arrow", x1: 285, y1: 223, x2: 345, y2: 223, at: 2000 },
          { kind: "arrow", x1: 575, y1: 223, x2: 645, y2: 223, at: 3000 },
          {
            kind: "box",
            x: 60,
            y: 360,
            w: 840,
            h: 100,
            label: "生成器：读问题 + 读检索到的段落 → 写答案",
            at: 4500,
          },
        ],
      },
      {
        id: "dpr",
        kicker: "04 · 检索",
        title: "靠向量找段落",
        narration:
          "检索器用的是稠密向量。它把问题和每一段文字编码到同一个空间，算相似度，取最近的几段。比起关键词匹配，更能找到换了说法但意思相同的段落。",
        duration: 16000,
        board: [
          { kind: "text", x: 60, y: 90, text: "DPR：把问题与段落放进同一空间", size: 30, weight: 600 },
          { kind: "box", x: 60, y: 210, w: 240, h: 90, label: "问题向量 q" },
          { kind: "box", x: 560, y: 150, w: 320, h: 200, label: "段落向量 d₁ … dₖ", dashed: true },
          { kind: "arrow", x1: 305, y1: 255, x2: 555, y2: 255, at: 2000 },
          { kind: "formula", x: 60, y: 360, text: "相似度 = q · d", size: 30, at: 3500 },
          { kind: "text", x: 60, y: 440, text: "取最近的 k 段，交给生成器", size: 22, ink: "dim", at: 5500 },
        ],
        followups: [
          {
            question: "稠密向量比关键词强在哪？",
            answer:
              "关键词匹配要求字面一致；向量把意思编码进空间位置，「怎么缓解感冒」和「感冒了怎么办」向量接近，就能互相检索到。论文用的 DPR 就是这类稠密检索器。",
            anchor: "§2.2",
          },
          {
            question: "向量检索有什么代价？",
            answer:
              "文档库要预先编码成向量，库更新就要重算；检索质量依赖编码器是否和任务匹配。所以论文把检索器和生成器一起训练，用最终答案的好坏反过来要求检索器。",
            anchor: "§2.3",
          },
        ],
      },
      {
        id: "generate",
        kicker: "05 · 生成",
        title: "两种读法",
        narration:
          "生成器把问题和段落放在一起读。RAG-Sequence 答案只用同一段，一条道走到黑。RAG-Token 每写一个词，都可以换段落，中途可以换路。训练时，检索器也会被最终答案质量推动。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 90, text: "生成器：问题 + 段落 → 答案", size: 32, weight: 600 },
          { kind: "box", x: 60, y: 160, w: 540, h: 100, label: "BART" },
          { kind: "arrow", x1: 615, y1: 210, x2: 675, y2: 210, at: 2000 },
          { kind: "box", x: 690, y: 160, w: 210, h: 100, label: "答案", ink: "accent" },
          { kind: "text", x: 60, y: 330, text: "RAG-Sequence：全程用同一段", size: 24, at: 4000 },
          { kind: "text", x: 60, y: 390, text: "RAG-Token：每个词可换段落", size: 24, at: 5500 },
          {
            kind: "text",
            x: 60,
            y: 460,
            text: "端到端训练：检索器也随答案质量更新",
            size: 22,
            ink: "dim",
            at: 7500,
          },
        ],
        followups: [
          {
            question: "两种读法到底差在哪？",
            answer:
              "一个是一条道走到黑，一个是可以中途换路。Sequence 选定一段后，整个答案都只用它；Token 每写一个词，都可以重新看向不同段落，更灵活，代价也更高。",
            anchor: "§2.1",
          },
        ],
      },
      {
        id: "value",
        kicker: "06 · 价值",
        title: "知识可换，答案可查",
        narration:
          "价值在于：知识库随时可以更新；答案能标出依据；模型不必把每个事实都塞进参数。这就是 RAG 成为企业标配的原因。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 100, text: "RAG 换来了什么", size: 34, weight: 600 },
          { kind: "text", x: 60, y: 220, text: "01  知识库随时可换", size: 26, at: 1500 },
          { kind: "text", x: 60, y: 300, text: "02  答案能标出处", size: 26, at: 3000 },
          { kind: "text", x: 60, y: 380, text: "03  参数量不必为知识买单", size: 26, at: 4500 },
          {
            kind: "text",
            x: 60,
            y: 480,
            text: "从「记住」转向「查到并核对」",
            size: 24,
            ink: "accent",
            at: 6500,
          },
        ],
        followups: [
          {
            question: "为什么说知识更新不用重训？",
            answer:
              "因为事实存在外部的文档索引里，参数不负责背具体事实。世界变了，更新索引即可，模型权重可以不动，答案照常查得到。原文把这叫参数记忆和非参数记忆的分工。",
            anchor: "第 1 节",
          },
        ],
      },
    ],
    diagram: {
      headline: "参数记忆负责语言能力，外部索引负责事实；检索把两者接起来。",
      steps: [
        { label: "问题进入检索器", note: "编码为查询向量 q" },
        { label: "段落库预先编码", note: "每段文本对应一个向量 d" },
        { label: "相似度排序", note: "取最近的 k 个段落" },
        { label: "问题 + 段落送入生成器", note: "答案必须以检索内容为条件" },
        { label: "生成答案", note: "可附带来源，便于核对" },
        { label: "更新文档库", note: "知识变化时无需重训模型" },
      ],
      insight: "RAG 不是「更大的模型」，而是把知识从参数里拿出来，放到可编辑、可追溯的外部存储。",
      conclusions: [
        "在多个开放域问答任务上取得当时的最好结果，答案更具体。",
        "检索器与生成器可以端到端联合训练。",
        "知识更新只需替换文档索引，不必重训参数。",
      ],
      anchors: [
        { label: "图 1", detail: "RAG 的检索—生成整体流程" },
        { label: "§2.1", detail: "RAG-Sequence 与 RAG-Token 两种形式" },
        { label: "§3", detail: "开放域问答实验结果" },
      ],
    },
    quiz: [
      {
        id: "rag-1",
        paperId: "2005.11401",
        question: "RAG 结合了哪两种「记忆」？",
        options: [
          "短期记忆与长期记忆",
          "参数记忆与非参数记忆（外部文档索引）",
          "图像记忆与文本记忆",
          "检索记忆与推理记忆",
        ],
        answer: 1,
        explanation:
          "模型参数保存语言能力与一般知识，文档索引保存可更新的事实，两者共同作为生成条件。",
        anchor: "摘要；§2 RAG 模型",
      },
      {
        id: "rag-2",
        paperId: "2005.11401",
        question: "检索器 DPR 的基本做法是什么？",
        options: [
          "按关键词是否出现排序",
          "把问题和段落编码成稠密向量，按相似度检索",
          "让生成器自己生成一段假文档",
          "用图数据库做多跳查询",
        ],
        answer: 1,
        explanation:
          "DPR 用双塔编码器分别编码问题与段落，在同一向量空间里做近邻检索，能匹配换了说法的内容。",
        anchor: "§2.2 检索器与文档索引",
      },
      {
        id: "rag-3",
        paperId: "2005.11401",
        question: "RAG-Sequence 与 RAG-Token 的关键区别是？",
        options: [
          "前者只用于图像，后者只用于文本",
          "前者整个答案基于同一组文档，后者每个词可关注不同文档",
          "前者需要训练，后者不需要训练",
          "前者只能检索一段，后者可以检索全部",
        ],
        answer: 1,
        explanation:
          "RAG-Sequence 对整段输出使用同一份检索结果；RAG-Token 在每个解码步重新对文档分布做边缘化。",
        anchor: "§2.1 两种生成形式",
      },
      {
        id: "rag-4",
        paperId: "2005.11401",
        question: "RAG 端到端训练时，哪些部分在更新？",
        options: [
          "检索器、文档编码器、生成器全部更新",
          "问题编码器与生成器更新，文档编码器与索引固定",
          "只更新检索器",
          "只更新文档索引",
        ],
        answer: 1,
        explanation:
          "文档编码器若跟着更新，索引每步都要重建，成本不可行。论文固定它，只反传问题编码器与生成器。",
        anchor: "§2.2 检索器与文档索引；§3 训练",
      },
      {
        id: "rag-5",
        paperId: "2005.11401",
        question: "论文的文档索引建立自什么？",
        options: [
          "实时网页搜索结果",
          "2018 年 12 月的 Wikipedia，约 2100 万段落",
          "论文自己的训练集",
          "一个 100 万条的问答对库",
        ],
        answer: 1,
        explanation:
          "非参数记忆来自 Wikipedia 段落编码成的向量索引，规模约 2100 万段，可在不重训模型时替换。",
        anchor: "§2.2 文档索引",
      },
      {
        id: "rag-6",
        paperId: "2005.11401",
        question: "问题编码器的训练信号从哪来？",
        options: [
          "人工标注的相关性分数",
          "最终答案的负对数似然，通过生成器反传",
          "BM25 的排序结果",
          "随机采样",
        ],
        answer: 1,
        explanation:
          "不需要人工相关性标签：检索器按「让最终答案概率更大」的方向学习。",
        anchor: "§3 训练",
      },
      {
        id: "rag-7",
        paperId: "2005.11401",
        question: "RAG 把「检索」与「生成」接起来的数学形式是？",
        options: [
          "只取分数最高的文档喂进生成器",
          "对每篇候选文档算生成概率，再按检索分布加权求和",
          "把文档向量直接加到词向量上",
          "先微调生成器，再检索",
        ],
        answer: 1,
        explanation:
          "模型把文档当作隐变量做边缘化：不同文档按检索概率加权，共同贡献最终答案。",
        anchor: "§2.1 模型公式",
      },
      {
        id: "rag-8",
        paperId: "2005.11401",
        question: "RAG-Sequence 的解码特点是？",
        options: [
          "每写一个词换一次文档",
          "用同一组文档跑完整段输出，再按文档概率加权",
          "不需要 beam search",
          "每次只能输出一个词",
        ],
        answer: 1,
        explanation:
          "整段答案共享一套文档；实现上用每篇文档各跑一遍 beam，再按检索分数合并结果。",
        anchor: "§2.1 两种生成形式",
      },
      {
        id: "rag-9",
        paperId: "2005.11401",
        question: "想给 RAG 系统补充新知识，最轻的做法是？",
        options: [
          "重新训练生成器",
          "更新文档索引，模型不动",
          "扩大 beam search 宽度",
          "改提示词里的示例",
        ],
        answer: 1,
        explanation:
          "事实存在索引里，换索引即刻生效；模型只学「怎么用文档」，不必把每个事实写进参数。",
        anchor: "§1 引言；§5 讨论",
      },
      {
        id: "rag-10",
        paperId: "2005.11401",
        question: "与传统「检索 + 抽取式阅读器」相比，RAG 的输出是？",
        options: [
          "从段落里截取的原文片段",
          "生成器写出的自由文本答案",
          "一份排序后的文档列表",
          "固定模板填空",
        ],
        answer: 1,
        explanation:
          "RAG 的答案是 BART 生成的，可以综合多段信息、换说法作答，不局限于原文 span。",
        anchor: "§1 引言；§2 RAG 模型",
      },
      {
        id: "rag-11",
        paperId: "2005.11401",
        question: "论文对 RAG 生成质量的评估结论是？",
        options: [
          "比纯参数模型更具体、更有事实依据",
          "更流畅但事实性更差",
          "与纯参数模型完全相同",
          "只能回答训练集里的问题",
        ],
        answer: 0,
        explanation:
          "人工评估显示 RAG 的答案更具体、更有依据，并能指出答案来自哪段检索文档。",
        anchor: "§4 实验；§5 讨论",
      },
      {
        id: "rag-12",
        paperId: "2005.11401",
        question: "论文训练 RAG 使用的监督数据是？",
        options: [
          "带检索标注的专门数据集",
          "常规的输入-输出对，不需要检索监督",
          "人工构造的假文档",
          "只有无标注网页",
        ],
        answer: 1,
        explanation:
          "检索器不需要额外标注：只要有「问题-答案」对，就能用答案似然训练整个系统。",
        anchor: "§3 训练",
      },
    ],
    grandma: {
      scenes: [
        {
          title: "知识定格在毕业那天",
          narration:
            "语言模型的知识，训练结束那一刻就定型了。就像学生毕业，知识到此为止。想让它知道新事，只能继续训练。代价高，旧知识还可能被覆盖。",
        },
        {
          title: "记不清了，就随口编",
          narration:
            "问它训练后的事，它要么不知道。要么编一个听起来很合理的答案。像记不清的老人随口编故事。知识过期和幻觉，是参数记忆的两个硬伤。",
        },
        {
          title: "开卷考试：先翻书再答",
          narration:
            "RAG 的做法很朴素：像开卷考试，先找资料再作答。问题交给检索器，取出相关段落。再和问题一起交给生成器。",
        },
        {
          title: "在地图上，离得近意思近",
          narration:
            "检索器用的是稠密向量。它把问题和每段文字编到同一空间。就像在地图上，离得近就是意思近。算相似度，取最近的几段。比关键词匹配强，换个说法也能找到。",
        },
        {
          title: "只盯一本，还是边写边换",
          narration:
            "生成器把问题和段落放在一起读。RAG-Sequence 像只盯一本书写，一条道走到黑。RAG-Token 每写一个词，都可以换段落，中途可以换路。训练时，检索器也被最终答案质量推动。",
        },
        {
          title: "电话簿，随时换新页",
          narration:
            "价值在于：知识库随时能更新。像电话簿换新页。答案能标出依据。模型不必把每个事实都塞进参数。所以 RAG 成了企业标配。",
        },
      ],
    },
  },

  "2201.11903": {
    paperId: "2201.11903",
    bigIdea: "不改模型，只在示例里展示推理步骤，就能激发「先想再答」。",
    scenes: [
      {
        id: "direct",
        kicker: "01 · 问题",
        title: "直接问，容易脱口而出",
        narration:
          "先直接问它一道多步算术题。模型会立刻给一个答案，可能是对的，也可能是错的，但你无从检查它是怎么来的。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 90, text: "直接作答：只有结果，没有过程", size: 32, weight: 600 },
          {
            kind: "text",
            x: 60,
            y: 190,
            text: "Q：小明有 5 个苹果，吃了 2 个，又买了 3 个……",
            size: 24,
          },
          { kind: "text", x: 60, y: 290, text: "A：6", size: 44, ink: "accent", weight: 600 },
          {
            kind: "text",
            x: 60,
            y: 400,
            text: "答案可能对，但你看不到推理，也没法定位错误",
            size: 22,
            ink: "dim",
            at: 5000,
          },
        ],
      },
      {
        id: "examples",
        kicker: "02 · 做法",
        title: "示例里带上解题过程",
        narration:
          "思维链提示只改一件事：给模型的示例里，不只写答案，还把中间步骤写出来。不训练，不改参数，只是换一种示范。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 90, text: "Few-shot 示例：把过程写出来", size: 32, weight: 600 },
          { kind: "box", x: 60, y: 150, w: 840, h: 190, dashed: true },
          { kind: "text", x: 90, y: 205, text: "示例：先算剩下的苹果，再算总数。", size: 24, at: 1500 },
          { kind: "text", x: 90, y: 260, text: "5 − 2 = 3，再加上新买的 3 个，", size: 24, at: 3000 },
          { kind: "text", x: 90, y: 315, text: "所以答案是 6。", size: 24, ink: "accent", at: 4500 },
          { kind: "text", x: 60, y: 430, text: "不训练，不更新参数，只换示例写法", size: 22, ink: "dim", at: 6000 },
        ],
        followups: [
          {
            question: "思维链和普通提示差在哪？",
            answer:
              "普通提示只示范「问题到答案」；思维链把中间的推理步骤也写进示例，模型模仿时就会把计算一步步摊开写。全程不训练、不改参数，只是换一种示范方式。",
            anchor: "第 1 节",
          },
          {
            question: "示例里必须写完整步骤吗？",
            answer:
              "原文对比过：只给「问题加答案」的标准示范，收益很小；把推理步骤写出来，准确率才明显上升。步骤是关键，但不需要训练数据级的完整推导，几条例题就够。",
            anchor: "§3（表 2）",
          },
        ],
      },
      {
        id: "imitate",
        kicker: "03 · 效果",
        title: "模型学会先写步骤",
        narration:
          "看到这样的示例，模型开始模仿：先写第一步、第二步，再给最终答案。中间步骤一旦写出来，就成了后续推理的新条件。",
        duration: 17000,
        board: [
          { kind: "text", x: 60, y: 90, text: "模型输出：过程 + 答案", size: 32, weight: 600 },
          { kind: "box", x: 60, y: 160, w: 840, h: 230, dashed: true },
          { kind: "text", x: 90, y: 220, text: "第一步：先算吃掉后剩下多少。", size: 24, at: 1500 },
          { kind: "text", x: 90, y: 280, text: "第二步：再加上后来买的。", size: 24, at: 3000 },
          { kind: "text", x: 90, y: 350, text: "所以答案 = 6。", size: 26, ink: "accent", at: 4500 },
          {
            kind: "text",
            x: 60,
            y: 470,
            text: "每一步，都会成为下一步的上下文",
            size: 22,
            ink: "dim",
            at: 6500,
          },
        ],
      },
      {
        id: "why",
        kicker: "04 · 原理",
        title: "把大问题拆成一串小问题",
        narration:
          "为什么有效？因为模型每次只需要处理一小步，前一步的结论会变成后一步的条件。错误也更容易被定位在哪一步。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 90, text: "为什么写步骤有用", size: 32, weight: 600 },
          { kind: "box", x: 60, y: 230, w: 240, h: 90, label: "当前条件" },
          { kind: "arrow", x1: 305, y1: 275, x2: 355, y2: 275, at: 1200 },
          { kind: "box", x: 360, y: 230, w: 240, h: 90, label: "中间结论" },
          { kind: "arrow", x1: 605, y1: 275, x2: 655, y2: 275, at: 2400 },
          { kind: "box", x: 660, y: 230, w: 240, h: 90, label: "下一步条件", ink: "accent" },
          { kind: "text", x: 60, y: 400, text: "模型每次只解一小步，误差更容易暴露", size: 24, at: 4000 },
          { kind: "text", x: 60, y: 470, text: "过程即草稿纸", size: 22, ink: "dim", at: 6000 },
        ],
        followups: [
          {
            question: "为什么写出步骤就变强了？",
            answer:
              "因为每一步的结论都成为下一步的输入。大问题被拆成小步，模型一次只解一小步，等于给自己增加了中间计算；错在哪一步也一眼可见，方便改。",
            anchor: "§2",
          },
        ],
      },
      {
        id: "scale",
        kicker: "05 · 规模",
        title: "能力是「涌现」的",
        narration:
          "这种能力有个前提：模型要足够大。小模型即使写出步骤，也不会真正利用；到了大约 100B 参数的规模，准确率会明显跃升。",
        duration: 14000,
        board: [
          { kind: "text", x: 60, y: 100, text: "思维链不是小模型的补药", size: 32, weight: 600 },
          {
            kind: "path",
            d: "M70,390 C280,385 420,370 560,280 C680,200 780,150 880,120",
            ink: "accent",
            at: 1500,
          },
          { kind: "text", x: 80, y: 430, text: "模型规模 →", size: 20, ink: "dim", at: 3000 },
          { kind: "text", x: 640, y: 90, text: "准确率", size: 20, ink: "dim", at: 3000 },
          {
            kind: "text",
            x: 60,
            y: 480,
            text: "小模型：写了也不会用；大模型：收益明显",
            size: 22,
            at: 5000,
          },
        ],
        followups: [
          {
            question: "小模型写步骤也没用吗？",
            answer:
              "原文的观察是：收益主要出现在足够大的模型上，大约 100B 参数量级开始明显；小模型上思维链常常无效，甚至可能更差。这也是把思维链叫作「涌现能力」的原因。",
            anchor: "§3（图 2）",
          },
          {
            question: "为什么规模大才起作用？",
            answer:
              "没有公认的完整解释，原文只给出了观察：能力随规模增长而出现，而不是提前设计出来的。可以把大模型理解为有足够容量，把步骤当作条件一路传下去，小模型传不住。",
            anchor: "第 1 节",
          },
        ],
      },
      {
        id: "limits",
        kicker: "06 · 边界",
        title: "它不是万能药",
        narration:
          "思维链也有边界：过程看起来合理，结论仍可能算错；示例的写法会显著影响结果。它更像给模型一张草稿纸，而不是正确性的保证。",
        duration: 15000,
        board: [
          { kind: "text", x: 60, y: 110, text: "思维链的边界", size: 34, weight: 600 },
          { kind: "text", x: 60, y: 220, text: "过程合理，结论仍可能算错", size: 26, at: 1500 },
          { kind: "text", x: 60, y: 290, text: "示例的写法会显著影响结果", size: 26, at: 3000 },
          { kind: "text", x: 60, y: 360, text: "开放任务还需要检索、工具与验证", size: 26, at: 4500 },
          {
            kind: "text",
            x: 60,
            y: 470,
            text: "把它当草稿纸，不是正确答案保证书",
            size: 24,
            ink: "accent",
            at: 6500,
          },
        ],
      },
    ],
    diagram: {
      headline: "在示例里展示步骤，让模型把隐式计算变成显式草稿。",
      steps: [
        { label: "准备带过程的示例", note: "问题 → 中间步骤 → 答案" },
        { label: "模型模仿格式", note: "先输出推理，再输出结论" },
        { label: "步骤成为新条件", note: "前一步的结果进入下一步上下文" },
        { label: "拆分复杂问题", note: "每次只处理一小步" },
        { label: "规模足够时收益显现", note: "小模型上可能无效甚至更差" },
        { label: "人工或工具核验", note: "过程可读，但正确性仍需验证" },
      ],
      insight: "思维链改变的是「生成顺序」，不是模型权重；它把并行直觉的计算，摊开成可检查的步骤。",
      conclusions: [
        "只改示例、不改参数，就能在多步推理任务上显著提升。",
        "收益随模型规模出现跃升，属于「涌现」能力。",
        "过程可读不等于过程正确，仍需核验。",
      ],
      anchors: [
        { label: "§1", detail: "思维链提示的动机与定义" },
        { label: "§2", detail: "在算术、常识、符号推理上的实验" },
        { label: "§3 / 图 2", detail: "收益随模型规模的变化" },
      ],
    },
    quiz: [
      {
        id: "cot-1",
        paperId: "2201.11903",
        question: "思维链提示（CoT）的关键做法是什么？",
        options: [
          "用更多数据重新训练模型",
          "在示例中展示中间推理步骤，让模型模仿",
          "要求模型一次输出十个答案再投票",
          "把问题拆给多个模型分别回答",
        ],
        answer: 1,
        explanation:
          "CoT 只改变提示中的示例形式：给出「问题—步骤—答案」的示范，模型便会生成自己的推理过程。",
        anchor: "§1 引言；§2 思维链提示",
      },
      {
        id: "cot-2",
        paperId: "2201.11903",
        question: "为什么写出中间步骤能提升多步推理？",
        options: [
          "因为输出 token 越多，模型参数更新越多",
          "因为前一步结论会成为后一步的上下文条件",
          "因为示例里的答案被直接复制了",
          "因为 softmax 的温度被调高了",
        ],
        answer: 1,
        explanation:
          "每一步生成的结果都进入后续上下文，相当于把一个大问题拆成若干个小问题逐步求解。",
        anchor: "§2 推理过程的作用",
      },
      {
        id: "cot-3",
        paperId: "2201.11903",
        question: "论文强调的哪项限制最准确？",
        options: [
          "思维链只适用于翻译任务",
          "推理收益在足够大的模型上才明显，且过程不保证正确",
          "使用思维链必须重新训练模型",
          "思维链会让模型完全无法给出答案",
        ],
        answer: 1,
        explanation:
          "论文报告了规模带来的涌现效应；同时，生成的推理过程可能看似合理却得出错误结论。",
        anchor: "§3 实验结果；§5 讨论",
      },
      {
        id: "cot-4",
        paperId: "2201.11903",
        question: "CoT 论文里，每个示例由什么组成？",
        options: [
          "只有问题与答案",
          "问题、推理链、答案三部分",
          "问题与十种候选答案",
          "只有推理链",
        ],
        answer: 1,
        explanation:
          "示例是「问题—思路—答案」的三元组，模型看到推理过程后，会在回答时模仿这种写法。",
        anchor: "§2.1 算术推理；图 1",
      },
      {
        id: "cot-5",
        paperId: "2201.11903",
        question: "使用思维链提示需要更新模型参数吗？",
        options: [
          "需要，先微调再提示",
          "不需要，只改提示里的示例",
          "需要，只更新最后的分类头",
          "需要，要训练一个验证器",
        ],
        answer: 1,
        explanation:
          "CoT 是纯提示方法：权重不变，只在少样本示例里展示推理步骤。",
        anchor: "§2 思维链提示",
      },
      {
        id: "cot-6",
        paperId: "2201.11903",
        question: "在 GSM8K 数学题上，PaLM 540B 用 8 个 CoT 示例后准确率约为？",
        options: [
          "从 17.9% 提升到 56.9%",
          "从 56.9% 提升到 90%",
          "保持在 30% 不变",
          "从 5% 提升到 20%",
        ],
        answer: 0,
        explanation:
          "标准提示只有 17.9%，CoT 提升到 56.9%，超过当时带验证器微调的 GPT-3 175B。",
        anchor: "§3.1 算术推理；图 2",
      },
      {
        id: "cot-7",
        paperId: "2201.11903",
        question: "论文强调的规模效应是？",
        options: [
          "任何大小的模型用 CoT 都提升",
          "小模型用 CoT 甚至变差，收益随规模出现",
          "模型越小效果越好",
          "效果与模型规模无关",
        ],
        answer: 1,
        explanation:
          "曲线显示 CoT 的好处集中在足够大的模型上，小模型写了步骤也用不上，甚至更差。",
        anchor: "§3.1；图 3",
      },
      {
        id: "cot-8",
        paperId: "2201.11903",
        question: "论文覆盖的三类任务不包括？",
        options: [
          "算术应用题",
          "常识推理",
          "符号操作，如末字母拼接",
          "图像分类",
        ],
        answer: 3,
        explanation:
          "论文在算术、常识、符号操作三类语言任务上验证 CoT，没有涉及图像分类。",
        anchor: "§2.1–2.3",
      },
      {
        id: "cot-9",
        paperId: "2201.11903",
        question: "换不同人写的示例、打乱示例顺序，CoT 的表现如何？",
        options: [
          "完全失效",
          "仍稳定，明显好于标准提示",
          "大幅下降，说明示例必须逐字固定",
          "论文未涉及",
        ],
        answer: 1,
        explanation:
          "作者用不同标注者独立写的推理链做实验，性能保持稳定，说明起作用的不是某段特定文字。",
        anchor: "§3.4 稳健性",
      },
      {
        id: "cot-10",
        paperId: "2201.11903",
        question: "如果示例里的推理步骤其实是无效的（比如只写等式不算），结果会怎样？",
        options: [
          "立即失效",
          "准确率仍接近完整 CoT",
          "比标准提示还差",
          "模型会拒绝作答",
        ],
        answer: 1,
        explanation:
          "论文的消融显示，示例推理无效时仍能大幅提分：起作用的是「先写过程再作答」这一结构。",
        anchor: "§3.4 稳健性；§5 讨论",
      },
      {
        id: "cot-11",
        paperId: "2201.11903",
        question: "在「末字母拼接」这类符号任务上，CoT 的特点是？",
        options: [
          "与标准提示完全一样",
          "随模型规模增大出现明显提升，小模型无收益",
          "只有接外部工具才有效",
          "需要人工编写规则",
        ],
        answer: 1,
        explanation:
          "符号任务同样呈现涌现：CoT 让大模型分步完成拼接，小模型即使看到步骤也学不会。",
        anchor: "§2.3；§3.3",
      },
      {
        id: "cot-12",
        paperId: "2201.11903",
        question: "论文承认的局限是？",
        options: [
          "推理过程可能看似合理却算错，不保证反映真实计算",
          "CoT 必须联网才能用",
          "CoT 只能用于英文",
          "CoT 会让模型参数失效",
        ],
        answer: 0,
        explanation:
          "生成的思路只是一份文本草稿，不等于模型内部计算；它还可能把一处错误一路带到结论。",
        anchor: "§5 讨论",
      },
    ],
    grandma: {
      scenes: [
        {
          title: "张口就答，像小孩报数",
          narration:
            "直接问它一道多步算术题。模型立刻给答案，像小孩脱口报数。可能是对的，也可能是错的。但你无从检查它是怎么来的。",
        },
        {
          title: "像教孩子，把过程演一遍",
          narration:
            "思维链提示只改一件事。示例里不只写答案，还写出中间步骤。像教孩子做题，演一遍过程。不训练，不改参数，换一种示范。",
        },
        {
          title: "跟师傅学，一步学一步",
          narration:
            "看到示例，模型开始模仿。像跟师傅做菜，一步学一步。先写第一步、第二步，再给答案。中间步骤写出来，就是下一步的条件。",
        },
        {
          title: "西瓜切小块，一块块吃",
          narration:
            "为什么有效？因为模型每次只处理一小步。像切西瓜，一块块吃。前一步结论，变成后一步条件。错误也更容易定位在哪一步。",
        },
        {
          title: "小厨房做不了大宴席",
          narration:
            "这种能力有前提：模型要足够大。像小厨房做不了大宴席。小模型写出步骤，也利用不了。到大约 100B 参数的规模，准确率明显跃升。",
        },
        {
          title: "草稿再工整，也不保证对",
          narration:
            "思维链也有边界：过程看起来合理，结论仍可能算错。就像草稿打得再工整，也不能保证答案对。示例的写法会显著影响结果。",
        },
      ],
    },
  },
};

export function getCourse(paperId: string): Course | undefined {
  return COURSES[paperId];
}

export const ALL_QUIZ_CARDS = Object.values(COURSES).flatMap((course) => course.quiz);