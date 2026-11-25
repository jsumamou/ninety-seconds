// 预生成课稿（由 scripts/pregenerate.mjs 生成，勿手改）。
// 每篇都过过服务端 validateCourse + languageIssues，以及脚本本地同口径校验。
// 注：当前有 5 篇为历史 3 题版本（arXiv 接口不可达导致补跑失败），补齐后用 --assemble 覆盖。
import type { Course } from "./types";

export const GENERATED_COURSES: Record<string, Course> = {
  "2005.14165": {
    "paperId": "2005.14165",
    "titleZh": "语言模型就是少样本学习器（few-shot learners）",
    "abstractZh": "以往做法是先用大规模文本预训练，再按任务微调，而微调常需成千上万条标注样本，与人类凭几个示例就能上手相去甚远。本文押注规模：GPT-3 是自回归语言模型，参数 1750 亿，为此前最大非稀疏模型的 10 倍。评测不更新参数，任务与示例只靠文本交代。它在翻译、问答、完形填空及现场推理类任务上表现强劲，部分可与既有微调方案竞争；也有数据集明显吃力，网络语料还带来方法学争议。其生成的新闻文本已让人难以分辨。",
    "bigIdea": "把语言模型放大到 1750 亿参数，不做微调，也能靠几个示例完成新任务。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "人学得快，模型学得慢",
        "narration": "人类只要看几个例子，就能学会一项新任务。语言模型却要先读几千条标注，才勉强上手。这个差距，到底能不能靠规模来抹平？",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "人：看几个例子就行",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "语言模型：先读几千条标注",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 270,
            "text": "差距能靠规模补上吗？",
            "size": 28,
            "at": 4200
          },
          {
            "kind": "box",
            "x": 60,
            "y": 330,
            "w": 440,
            "h": 76,
            "at": 7000
          },
          {
            "kind": "text",
            "x": 90,
            "y": 356,
            "text": "他们选择：把模型做大",
            "size": 24,
            "at": 9500
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "微调很贵，任务一换就重来",
        "narration": "过去的路子是先预训练，再针对每个任务微调。微调要几千到几万条样本，很吃数据。任务一换，数据还得从头再来一遍，代价不小。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "老办法：预训练 + 微调",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "每个任务都要专属数据",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "几千到几万条样本",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "任务一换，数据重来",
            "size": 28,
            "at": 5600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "而人只需几个例子",
            "size": 24,
            "at": 8000
          }
        ]
      },
      {
        "id": "method-1",
        "kicker": "03 · 方法一",
        "title": "先把模型撑到最大",
        "narration": "他们的做法很简单：把模型直接做大。GPT-3 有 1750 亿参数。它比此前最大的非稀疏模型还多 10 倍。架构没怎么改，只是把规模和数据一起放大。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "只做一件事：把模型做大",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "GPT-3：1750 亿参数",
            "size": 28,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "非稀疏模型中的新纪录",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 310,
            "text": "比此前最大者多 10 倍",
            "size": 24,
            "at": 5600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "架构不变，规模加码",
            "size": 24,
            "at": 7800
          }
        ]
      },
      {
        "id": "method-2",
        "kicker": "04 · 方法二",
        "title": "不训练，只把任务写进提示",
        "narration": "用的时候不训练，也不更新任何参数。任务怎么描述、给几个示例，全都写进提示词。模型读完提示就答，一次前向出结果。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "不训练，只给提示",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "参数冻结，零梯度更新",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "任务说明写进提示词",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 310,
            "text": "几个示例当示范",
            "size": 24,
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "一次前向，直接出答案",
            "size": 28,
            "at": 7600
          }
        ]
      },
      {
        "id": "results",
        "kicker": "05 · 结果",
        "title": "强项很多，短板也在",
        "narration": "翻译、问答、完形填空，它都做得不错。拆乱序词、现学新词造句，它也能现场应付。三位数加减，同样不在话下。但它并非全能，有些数据集照样卡住。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "多数任务，它接住了",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "翻译 · 问答 · 完形填空",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "拆乱序词 · 新词造句 · 三位数加减",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "也有数据集明显吃力",
            "size": 24,
            "at": 5800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "新闻稿：人难辨真假",
            "size": 28,
            "at": 8000
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "大，本身就是一种能力",
        "narration": "规模本身，就是一条学习路径。不微调，只给提示词，大模型也能接住新任务。它写的新闻稿，人已经很难分辨真假。这一点，值得我们警惕。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "规模本身就是学习方式",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "不微调，也能接新任务",
            "size": 28,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "提示词就是接口",
            "size": 24,
            "at": 4200
          },
          {
            "kind": "box",
            "x": 60,
            "y": 330,
            "w": 460,
            "h": 80,
            "at": 6500
          },
          {
            "kind": "text",
            "x": 90,
            "y": 356,
            "text": "大，就是能力",
            "size": 28,
            "at": 9000
          }
        ]
      }
    ],
    "diagram": {
      "headline": "GPT-3 的少样本路线：规模换通用",
      "steps": [
        {
          "label": "预训练",
          "note": "在海量文本上做自回归预测，把语言规律压进参数"
        },
        {
          "label": "放大规模",
          "note": "参数堆到 1750 亿，冲上非稀疏模型新高度"
        },
        {
          "label": "写成提示",
          "note": "任务说明和几个示例，全部用文本交代"
        },
        {
          "label": "直接推理",
          "note": "不做梯度更新，一次前向给出答案"
        }
      ],
      "insight": "不换架构、不做微调，规模本身撑起了少样本能力。",
      "conclusions": [
        "规模上去后，少样本表现明显变好，部分任务追平此前的微调方案",
        "翻译、问答、完形填空和现场推理都能打，但也有明显失手的任务",
        "生成的新闻稿已让人难以分辨真假，社会影响需要正视"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "引言：对比微调范式与人类的少样本学习"
        },
        {
          "label": "§2",
          "detail": "方法：模型规模、训练数据与 in-context 设置"
        },
        {
          "label": "§3",
          "detail": "结果：各数据集上的少样本表现与失手案例"
        },
        {
          "label": "§6",
          "detail": "更广影响：新闻稿生成与误用风险"
        }
      ]
    },
    "quiz": [
      {
        "id": "2005.14165-ai-1",
        "paperId": "2005.14165",
        "question": "论文给出的 GPT-3 参数量是多少？",
        "options": [
          "1750 亿",
          "论文未披露参数量",
          "少于此前非稀疏模型",
          "与此前最大模型持平"
        ],
        "answer": 0,
        "explanation": "摘要写明 175 billion parameters，并强调是此前任何非稀疏模型的 10 倍。",
        "anchor": "§2"
      },
      {
        "id": "2005.14165-ai-2",
        "paperId": "2005.14165",
        "question": "评测少样本能力时，GPT-3 是怎么用的？",
        "options": [
          "每个任务都做梯度更新微调",
          "完全不做梯度更新，只靠文本提示",
          "先人工写规则再推理",
          "只在翻译任务上测试"
        ],
        "answer": 1,
        "explanation": "所有任务都不做梯度更新或微调，任务与示例仅通过文本交互给出。",
        "anchor": "§2"
      },
      {
        "id": "2005.14165-ai-3",
        "paperId": "2005.14165",
        "question": "关于 GPT-3 的少样本表现，哪项符合原文？",
        "options": [
          "所有数据集都拿到最好成绩",
          "既有表现强劲的任务，也有明显吃力的数据集",
          "只能完成三位数加减",
          "完全无法生成新闻文本"
        ],
        "answer": 1,
        "explanation": "论文既报告了翻译、问答、完形填空等强项，也点出部分数据集仍然吃力。",
        "anchor": "§3"
      }
    ]
  },
  "2001.08361": {
    "paperId": "2001.08361",
    "titleZh": "神经语言模型（Neural Language Models）的规模律（Scaling Laws）",
    "abstractZh": "作者研究语言模型在交叉熵损失（cross-entropy loss）上的经验规模律（scaling laws）。损失与模型大小（model size）、数据量（dataset size）及训练算力（compute）呈幂律关系，相关趋势跨越七个以上数量级。网络宽度（width）与深度（depth）等结构细节在很大范围内影响甚微。过拟合（overfitting）对模型与数据规模的依赖、训练速度对模型规模的依赖，均可由简洁方程描述。据此可在固定算力预算下确定最优配置：更大的模型具有更高的样本效率，因此最优计算效率的训练策略是，以相对较少的数据训练很大的模型，并在收敛前提前停止。",
    "bigIdea": "语言模型损失服从幂律，规模效应远比结构细节重要。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "烧钱之前先画曲线",
        "narration": "训练大模型非常烧钱。我们能不能先在训练前画几条曲线呢？预测它要花多少算力、喂多少数据，才能真的变强。并看清背后的规律。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "烧钱之前先画曲线",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "训练大模型非常烧钱",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "先在训练前画曲线",
            "size": 24,
            "anchor": "start",
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "预测算力与数据",
            "size": 24,
            "anchor": "start",
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "看清背后的规律",
            "size": 24,
            "anchor": "start",
            "at": 7200
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "损失到底听谁的？",
        "narration": "我们一直猜不准损失下降的规律。模型大小、数据量、训练算力一起。这三项里到底谁才是真正的瓶颈？我们到底又该怎么准确量化它呢？",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "损失到底听谁的？",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "模型大小",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "数据量",
            "size": 24,
            "anchor": "start",
            "at": 3000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "训练算力",
            "size": 24,
            "anchor": "start",
            "at": 4200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "谁才是真瓶颈？",
            "size": 24,
            "anchor": "start",
            "at": 6000
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "幂律揭开规模秘密",
        "narration": "作者发现，语言模型的损失服从幂律。它随模型大小、数据量和训练算力一起下降。这种规律惊人地跨越了超过七个数量级，范围极广。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "幂律揭开规模秘密",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "损失服从幂律",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "随模型大小下降",
            "size": 24,
            "anchor": "start",
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "随数据量下降",
            "size": 24,
            "anchor": "start",
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "随训练算力下降",
            "size": 24,
            "anchor": "start",
            "at": 7200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "跨越七个数量级",
            "size": 24,
            "anchor": "start",
            "at": 9000
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "公式管住过拟合",
        "narration": "网络宽度和深度的影响相对很小。真正重要的是简单公式。过拟合程度、训练速度，都随模型规模变化。我们用公式把它们刻画出来，结构细节不是主角。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "公式管住过拟合",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "宽度、深度影响小",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "过拟合随规模变化",
            "size": 24,
            "anchor": "start",
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "训练速度随规模变化",
            "size": 24,
            "anchor": "start",
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "简单公式刻画",
            "size": 24,
            "anchor": "start",
            "at": 7200
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "越大反而越省样本",
        "narration": "大模型反而更省样本。这意味着，给定同样算力，我们应该造更大的模型。使用更少的数据。并且显著提前停止训练，不要追到收敛。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "越大反而越省样本",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "大模型样本效率更高",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "同样算力下",
            "size": 24,
            "anchor": "start",
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "造更大模型",
            "size": 24,
            "anchor": "start",
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "使用更少数据",
            "size": 24,
            "anchor": "start",
            "at": 7200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 440,
            "text": "提前停止训练",
            "size": 24,
            "anchor": "start",
            "at": 9000
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "预算砸到刀刃上",
        "narration": "所以别再盲目堆数据。规模律告诉我们，先算清规模效应。把固定算力预算砸到刀刃上。这才是真正最优的训练决策，值得先算后做。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "预算砸到刀刃上",
            "size": 34,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "别盲目堆数据",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "先算清规模效应",
            "size": 24,
            "anchor": "start",
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "固定算力预算",
            "size": 24,
            "anchor": "start",
            "at": 5400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "最优训练决策",
            "size": 24,
            "anchor": "start",
            "at": 7200
          }
        ]
      }
    ],
    "diagram": {
      "headline": "规模律：用幂律预测语言模型损失",
      "steps": [
        {
          "label": "测损失",
          "note": "在超过七个数量级的范围内测量交叉熵损失"
        },
        {
          "label": "拟幂律",
          "note": "损失随模型大小、数据量与训练算力呈幂律下降"
        },
        {
          "label": "写公式",
          "note": "用简单方程刻画过拟合与训练速度随规模的变化"
        },
        {
          "label": "定配置",
          "note": "固定算力下训练大模型、用较少数据并提前停止"
        }
      ],
      "insight": "规模效应可被简洁方程预测，结构细节影响甚微。",
      "conclusions": [
        "损失与模型大小、数据量、算力均呈幂律关系",
        "网络宽度与深度在很大范围内影响很小",
        "最优训练应使用大模型和较少数据，并提前停止"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要首句：We study empirical scaling laws for language model performance on the cross-entropy loss."
        },
        {
          "label": "§2",
          "detail": "摘要第二句：The loss scales as a power-law with model size, dataset size, and the amount of compute used for training, with some trends spanning more than seven orders of magnitude."
        }
      ]
    },
    "quiz": [
      {
        "id": "2001.08361-ai-1",
        "paperId": "2001.08361",
        "question": "这篇论文主要研究语言模型在哪项指标上的经验规律？",
        "options": [
          "交叉熵损失（cross-entropy loss）",
          "准确率",
          "推理速度",
          "显存占用"
        ],
        "answer": 0,
        "explanation": "摘要首句指出研究语言模型在交叉熵损失上的经验规模律。",
        "anchor": "摘要首句"
      },
      {
        "id": "2001.08361-ai-2",
        "paperId": "2001.08361",
        "question": "论文发现损失与哪些因素呈幂律关系？",
        "options": [
          "仅模型大小",
          "仅数据量",
          "模型大小、数据量和训练算力",
          "仅训练轮数"
        ],
        "answer": 2,
        "explanation": "摘要明确说损失与模型大小、数据量及训练算力呈幂律关系。",
        "anchor": "摘要第二句"
      },
      {
        "id": "2001.08361-ai-3",
        "paperId": "2001.08361",
        "question": "文中提到的某些趋势跨越了多少个数量级？",
        "options": [
          "三个",
          "五个",
          "七个",
          "十个"
        ],
        "answer": 2,
        "explanation": "摘要提到 some trends spanning more than seven orders of magnitude。",
        "anchor": "摘要第二句"
      },
      {
        "id": "2001.08361-ai-4",
        "paperId": "2001.08361",
        "question": "网络宽度或深度等结构细节对损失的影响如何？",
        "options": [
          "决定性",
          "影响很大",
          "在很大范围内影响很小",
          "完全无关"
        ],
        "answer": 2,
        "explanation": "摘要指出网络宽度或深度在很大范围内影响很小。",
        "anchor": "摘要第三句"
      },
      {
        "id": "2001.08361-ai-5",
        "paperId": "2001.08361",
        "question": "过拟合对模型与数据规模的依赖可以用什么描述？",
        "options": [
          "复杂神经网络",
          "简单方程",
          "经验表格",
          "随机采样"
        ],
        "answer": 1,
        "explanation": "摘要说明简单方程支配过拟合对模型/数据规模的依赖。",
        "anchor": "摘要第四句"
      },
      {
        "id": "2001.08361-ai-6",
        "paperId": "2001.08361",
        "question": "训练速度主要随什么规模变化，并被写入简单方程？",
        "options": [
          "数据量",
          "模型大小",
          "批大小",
          "层数"
        ],
        "answer": 1,
        "explanation": "摘要指出训练速度对模型大小的依赖由简单方程描述。",
        "anchor": "摘要第四句"
      },
      {
        "id": "2001.08361-ai-7",
        "paperId": "2001.08361",
        "question": "在样本效率方面，更大的语言模型表现如何？",
        "options": [
          "更差",
          "差不多",
          "显著更高",
          "无法判断"
        ],
        "answer": 2,
        "explanation": "摘要明确说 Larger models are significantly more sample-efficient。",
        "anchor": "摘要倒数第二句"
      },
      {
        "id": "2001.08361-ai-8",
        "paperId": "2001.08361",
        "question": "固定算力预算下，论文建议的最优训练策略是什么？",
        "options": [
          "小模型 + 大量数据",
          "大模型 + 少量数据 + 提前停止",
          "无限数据直到收敛",
          "只增加网络深度"
        ],
        "answer": 1,
        "explanation": "摘要最后一句说明应以相对较少的数据训练很大的模型，并在收敛前停止。",
        "anchor": "摘要末句"
      },
      {
        "id": "2001.08361-ai-9",
        "paperId": "2001.08361",
        "question": "结构细节影响很小的结论，在什么条件下成立？",
        "options": [
          "任何情况下",
          "仅在七个数量级内",
          "在很宽范围内",
          "仅对小模型"
        ],
        "answer": 2,
        "explanation": "摘要说 within a wide range，结构细节影响很小。",
        "anchor": "摘要第三句"
      },
      {
        "id": "2001.08361-ai-10",
        "paperId": "2001.08361",
        "question": "这些规模关系能帮助我们做什么？",
        "options": [
          "设计新激活函数",
          "确定固定算力预算的最优分配",
          "减少模型参数量",
          "自动标注数据"
        ],
        "answer": 1,
        "explanation": "摘要提到 These relationships allow us to determine the optimal allocation of a fixed compute budget。",
        "anchor": "摘要倒数第二句"
      },
      {
        "id": "2001.08361-ai-11",
        "paperId": "2001.08361",
        "question": "“七个数量级”指的是什么？",
        "options": [
          "模型参数从1到10^7",
          "某些趋势的跨度",
          "训练轮数",
          "批大小范围"
        ],
        "answer": 1,
        "explanation": "摘要用 more than seven orders of magnitude 描述某些趋势的跨度。",
        "anchor": "摘要第二句"
      },
      {
        "id": "2001.08361-ai-12",
        "paperId": "2001.08361",
        "question": "根据论文结论，以下哪项做法不是最优计算效率训练？",
        "options": [
          "训练大模型",
          "使用相对较少的数据",
          "训练到完全收敛",
          "提前停止"
        ],
        "answer": 2,
        "explanation": "摘要建议 stopping significantly before convergence，而非训练到完全收敛。",
        "anchor": "摘要末句"
      }
    ]
  },
  "2305.14314": {
    "paperId": "2305.14314",
    "titleZh": "量化大语言模型的高效低秩适配器微调（QLoRA）",
    "abstractZh": "QLoRA 是一种面向大语言模型的高效微调方法。它在冻结的 4-bit 量化预训练权重上反向传播梯度，并叠加低秩适配器（LoRA）进行学习，从而把 65B 参数模型的微调压缩到单张 48GB GPU，且不损失 16-bit 微调性能。QLoRA 提出 4-bit NormalFloat、双重量化和分页优化器三项内存优化技术，催生出 Guanaco 模型系列。研究者在 8 个指令数据集、多种模型类型（LLaMA、T5）及 33B 与 65B 等规模上微调了超过 1,000 个模型，并指出 GPT-4 评估可作为人类评估的廉价替代，而现有聊天机器人基准尚不足够可信。",
    "bigIdea": "用 4-bit 冻结权重加 LoRA，QLoRA 让大模型微调登上单张消费级显卡。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "一块显卡跑 65B？",
        "narration": "65B 参数模型很大。全参数微调通常需要好几张顶级显卡。QLoRA 却说，单张 48GB GPU 真的能训练。性能还不打折。它到底有什么神奇诀窍？这看起来很不可思议。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "48GB 单卡",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "65B 参数模型",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "QLoRA 说：能微调",
            "size": 24,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "性能还不打折",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "它怎么做到的？",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "显存为什么总不够？",
        "narration": "大模型全参数微调时，很多东西要进显存。权重、优化器状态和激活值都在其中。参数越多，显存占用越高。单张消费级 GPU 装不下。所以普通用户很难参与。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "显存为什么不够？",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "权重 + 优化器 + 激活",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "全参数一起塞进显存",
            "size": 24,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "参数越多，占用越高",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "单卡装不下",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "把权重压到 4-bit",
        "narration": "QLoRA 先冻结预训练权重。再用 4-bit NormalFloat 把它们量化。这种数据类型信息论最优。它适合正态分布的权重。既压缩空间，又保持精度。显存占用随之大降。这就是它的第一招。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "把权重压到 4-bit",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "冻结预训练权重",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "4-bit NormalFloat",
            "size": 28,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "正态分布权重最优",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "省空间，保精度",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "梯度只更新 LoRA",
        "narration": "量化后的主模型不动。QLoRA 在旁边加进低秩适配器 LoRA。反向传播时，梯度只更新这些小矩阵。训练开销因此很低。整体速度也快很多。小矩阵参数量很少。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "梯度只更新 LoRA",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "主模型冻结不动",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "旁边加进 LoRA",
            "size": 28,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "梯度只过 LoRA",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "训练开销骤降",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "results",
        "kicker": "05 · 结果",
        "title": "Guanaco 逼近 ChatGPT",
        "narration": "用 QLoRA 微调 Guanaco 系列。它在 Vicuna 基准上超过此前所有开源模型。性能达到 ChatGPT 99.3% 水平。单张 GPU 只要 24 小时就能完成全部微调训练。效果相当出色。它成为新的开源标杆。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "Guanaco 系列",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "Vicuna 基准最优",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "达到 ChatGPT 99.3%",
            "size": 28,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "单 GPU 24 小时",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "开源模型新标杆",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "大模型微调上单卡",
        "narration": "QLoRA 让大模型微调告别 GPU 集群。高质量小数据很有用。加一块消费级显卡就能训练。能跑出接近 ChatGPT 的模型。代码和模型全部开源。人人都能用上。门槛大大降低。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "告别 GPU 集群",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "高质量小数据",
            "size": 28,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "加一块消费级显卡",
            "size": 24,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "接近 ChatGPT",
            "size": 24,
            "at": 6500,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "代码与模型全开源",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      }
    ],
    "diagram": {
      "headline": "QLoRA 三招省显存",
      "steps": [
        {
          "label": "4-bit NormalFloat 量化",
          "note": "用 NF4 把预训练权重压缩到 4-bit，对正态分布权重信息论最优。"
        },
        {
          "label": "双重量化",
          "note": "对量化常数再量化，进一步降低平均显存占用。"
        },
        {
          "label": "分页优化器",
          "note": "在 CPU 与 GPU 之间换页，避免训练时显存峰值崩溃。"
        },
        {
          "label": "LoRA 适配器",
          "note": "只训练旁路的低秩小矩阵，主模型保持冻结。"
        }
      ],
      "insight": "QLoRA 把训练开销从全参数转移到小适配器，让大模型微调进入单卡时代。",
      "conclusions": [
        "单张 48GB GPU 可完成 65B 参数模型微调",
        "Guanaco 在 Vicuna 基准达到 ChatGPT 99.3% 水平",
        "当前聊天机器人基准尚不足以准确评估模型真实水平"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要第 1–2 句：65B/48GB、16-bit 性能、冻结 4-bit 权重与 LoRA"
        },
        {
          "label": "§2",
          "detail": "摘要第 3 句：NF4、双重量化、分页优化器"
        },
        {
          "label": "§3",
          "detail": "摘要第 4–5 句及倒数第 3 句：Guanaco、Vicuna、99.3%、24 小时、基准可信度"
        }
      ]
    },
    "quiz": [
      {
        "id": "2305.14314-ai-1",
        "paperId": "2305.14314",
        "question": "QLoRA 主要想解决什么问题？",
        "options": [
          "大模型微调时显存占用太大",
          "大模型推理速度太慢",
          "预训练数据质量不足",
          "量化模型无法部署"
        ],
        "answer": 0,
        "explanation": "摘要第 1 句指出 QLoRA 通过降低显存占用，让 65B 模型能在单张 48GB GPU 上微调。",
        "anchor": "摘要第 1 句"
      },
      {
        "id": "2305.14314-ai-2",
        "paperId": "2305.14314",
        "question": "QLoRA 的梯度反向传播经过哪里？",
        "options": [
          "冻结的 4-bit 量化预训练权重",
          "全 16-bit 可训练权重",
          "随机初始化的输出层",
          "只经过嵌入层"
        ],
        "answer": 0,
        "explanation": "摘要第 2 句说明 QLoRA 把梯度反向传播穿过冻结的 4-bit 量化预训练语言模型，再进入 LoRA。",
        "anchor": "摘要第 2 句"
      },
      {
        "id": "2305.14314-ai-3",
        "paperId": "2305.14314",
        "question": "根据摘要，QLoRA 能在单张 48GB GPU 上微调的模型规模是？",
        "options": [
          "65B 参数",
          "33B 参数",
          "只能调小模型",
          "不支持大模型"
        ],
        "answer": 0,
        "explanation": "摘要第 1 句明确说 QLoRA 能在单张 48GB GPU 上微调 65B 参数模型。",
        "anchor": "摘要第 1 句"
      },
      {
        "id": "2305.14314-ai-4",
        "paperId": "2305.14314",
        "question": "与全参数微调相比，QLoRA 冻结了哪部分？",
        "options": [
          "预训练语言模型的权重",
          "LoRA 适配器",
          "最后的分类头",
          "所有偏置项"
        ],
        "answer": 0,
        "explanation": "摘要第 2 句提到预训练语言模型被冻结，只有 LoRA 参与更新。",
        "anchor": "摘要第 2 句"
      },
      {
        "id": "2305.14314-ai-5",
        "paperId": "2305.14314",
        "question": "4-bit NormalFloat 对什么数据信息论最优？",
        "options": [
          "正态分布的权重",
          "均匀分布的激活",
          "稀疏的梯度",
          "整数类型标签"
        ],
        "answer": 0,
        "explanation": "摘要第 3 句（a）指出 NF4 对正态分布权重信息论最优。",
        "anchor": "摘要第 3 句（a）"
      },
      {
        "id": "2305.14314-ai-6",
        "paperId": "2305.14314",
        "question": "Guanaco 在 Vicuna 基准上达到 ChatGPT 的什么水平？",
        "options": [
          "99.3%",
          "与 ChatGPT 持平",
          "超过 ChatGPT",
          "不到 ChatGPT 一半"
        ],
        "answer": 0,
        "explanation": "摘要第 4 句说 Guanaco 达到 ChatGPT 99.3% 的性能水平。",
        "anchor": "摘要第 4 句"
      },
      {
        "id": "2305.14314-ai-7",
        "paperId": "2305.14314",
        "question": "Guanaco 在单 GPU 上完成微调需要多长时间？",
        "options": [
          "24 小时",
          "数天",
          "数周",
          "数月"
        ],
        "answer": 0,
        "explanation": "摘要第 4 句指出 Guanaco 只需 24 小时单 GPU 微调。",
        "anchor": "摘要第 4 句"
      },
      {
        "id": "2305.14314-ai-8",
        "paperId": "2305.14314",
        "question": "双重量化的作用是什么？",
        "options": [
          "对量化常数再量化以省显存",
          "把模型训练两遍",
          "同时训练两套权重",
          "使用两块 GPU 并行"
        ],
        "answer": 0,
        "explanation": "摘要第 3 句（b）说明双重量化通过量化量化常数来降低平均显存占用。",
        "anchor": "摘要第 3 句（b）"
      },
      {
        "id": "2305.14314-ai-9",
        "paperId": "2305.14314",
        "question": "作者认为当前聊天机器人基准测试怎样？",
        "options": [
          "不足以准确评估性能水平",
          "完全可信",
          "比人类评估更可靠",
          "只适用于小模型"
        ],
        "answer": 0,
        "explanation": "摘要倒数第 3 句指出当前聊天机器人基准测试不足以准确评估聊天机器人性能水平。",
        "anchor": "摘要倒数第 3 句"
      },
      {
        "id": "2305.14314-ai-10",
        "paperId": "2305.14314",
        "question": "论文认为 GPT-4 评估可以作为什么的廉价替代？",
        "options": [
          "人类评估",
          "模型困惑度",
          "训练损失",
          "推理速度测试"
        ],
        "answer": 0,
        "explanation": "摘要倒数第 4 句说明 GPT-4 评估是人类评估的廉价且合理的替代。",
        "anchor": "摘要倒数第 4 句"
      },
      {
        "id": "2305.14314-ai-11",
        "paperId": "2305.14314",
        "question": "论文用 QLoRA 微调了多少个模型？",
        "options": [
          "超过 1,000 个",
          "数量很少",
          "恰好 8 个",
          "只有 LLaMA"
        ],
        "answer": 0,
        "explanation": "摘要第 5 句提到使用 QLoRA 微调了超过 1,000 个模型。",
        "anchor": "摘要第 5 句"
      },
      {
        "id": "2305.14314-ai-12",
        "paperId": "2305.14314",
        "question": "QLoRA 保持了全 16-bit 微调的什么？",
        "options": [
          "任务性能",
          "训练时间",
          "模型大小",
          "数据量"
        ],
        "answer": 0,
        "explanation": "摘要第 1 句指出 QLoRA 在降低显存的同时保持完整 16-bit 微调任务性能。",
        "anchor": "摘要第 1 句"
      }
    ]
  },
  "2205.14135": {
    "paperId": "2205.14135",
    "titleZh": "FlashAttention：IO 感知（IO-awareness）的快速省显存精确注意力",
    "abstractZh": "长序列上的 Transformer 又慢又占显存，因为自注意力（self-attention）的时间与空间开销随序列长度平方增长。近似方法用模型质量换更少的计算，却常换不到实际加速。本文认为缺的是 IO 感知（IO-awareness）：设计算法时要算上 GPU 各级显存之间的读写。作者提出 FlashAttention，用分块（tiling）减少高带宽显存（HBM）与片上 SRAM 之间的搬运，并证明其 HBM 访问次数少于标准注意力，在一批 SRAM 容量下达到最优，还可推广为块稀疏注意力。BERT-large 端到端提速 15%，GPT-2 提速 3 倍，长序列任务提速 2.4 倍，Path-X 准确率 61.4%。",
    "bigIdea": "注意力的瓶颈在显存读写，不在乘加；按 IO 分块，精确注意力也能又快又省。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "最长那一档，谁跑得动",
        "narration": "先把镜头推到最长的那一档。序列长到六万四千个词元，普通注意力已经跑不动。FlashAttention 在这档首次拿到六成三的准确率。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "六万四千个词元",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "普通注意力跑不动",
            "size": 24,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 270,
            "text": "Path-256：63.1%",
            "size": 24,
            "at": 3400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "精确注意力也能吃长上下文",
            "size": 28,
            "at": 5600
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "问题不在算得多，在搬得多",
        "narration": "注意力慢，不只因为算得多。序列翻倍，计算和显存都按平方涨。近似方法想省算力，却常换不来真正的墙钟加速。缺口在显存读写。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "开销随长度平方涨",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "近似方法：省算力，丢质量",
            "size": 24,
            "at": 1700
          },
          {
            "kind": "text",
            "x": 60,
            "y": 290,
            "text": "还常拿不到墙钟加速",
            "size": 24,
            "at": 3500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "缺的一环：IO 感知",
            "size": 28,
            "at": 5600
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "把大块切成小块算",
        "narration": "它的核心是分块。把 Q、K、V 切成小块，装进片上的 SRAM。一整块在芯片里算完，才写回一次 HBM。来回搬运少了，这才是 IO 感知的思路。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "分块（tiling）",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "Q、K、V 切成小块",
            "size": 24,
            "at": 1500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "装进片上 SRAM",
            "size": 24,
            "at": 3000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "算完才写回 HBM",
            "size": 24,
            "at": 4600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "搬运少了，速度上来",
            "size": 28,
            "at": 6200
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "算清搬运账，再稀疏化",
        "narration": "他们把 HBM 读写次数算清楚了。分块比标准做法更省读写。在不少 SRAM 容量下，这个次数已经是最优。再往外推，就是块稀疏版本，比已有近似方法都快。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "算清 IO 这笔账",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "HBM 访问少于标准注意力",
            "size": 24,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "一批 SRAM 容量下达到最优",
            "size": 24,
            "at": 3400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "再推广到块稀疏注意力",
            "size": 28,
            "at": 5400
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "快了多少，质量如何",
        "narration": "实测结果很直接。BERT-large 端到端快一成五，GPT-2 快三倍，长序列榜单快二点四倍。长文档分类涨了六点四分，GPT-2 的困惑度还好零点七。质量没退。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 95,
            "text": "实测：训练更快",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 175,
            "text": "BERT-large 15%",
            "size": 24,
            "at": 1400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 235,
            "text": "GPT-2 3×",
            "size": 24,
            "at": 2800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 295,
            "text": "长序列 2.4×",
            "size": 24,
            "at": 4200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 355,
            "text": "长文档 +6.4 分",
            "size": 24,
            "at": 5600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 425,
            "text": "Path-X 61.4%",
            "size": 24,
            "at": 7000
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "先省搬运，再谈近似",
        "narration": "一句话带走。瓶颈其实常在数据搬运，不在乘加。先把显存读写压到最低。精确注意力照样又快又长，质量也一点不用让。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "瓶颈在搬运，不在乘加",
            "size": 28,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "按 IO 把计算分块",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 290,
            "text": "精确、快、省显存",
            "size": 34,
            "at": 3800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "上下文还能更长",
            "size": 24,
            "at": 5600
          }
        ]
      }
    ],
    "diagram": {
      "headline": "FlashAttention：把注意力当成一场搬运优化",
      "steps": [
        {
          "label": "看见问题",
          "note": "序列一长，自注意力的时间和显存按平方涨。"
        },
        {
          "label": "算清 IO",
          "note": "把 HBM 与片上 SRAM 之间的读写计入算法成本。"
        },
        {
          "label": "分块计算",
          "note": "Q、K、V 切成小块塞进 SRAM，算完再写回。"
        },
        {
          "label": "验证与推广",
          "note": "HBM 访问少于标准注意力，又推广成块稀疏版本。"
        },
        {
          "label": "拿到结果",
          "note": "训练更快，上下文更长，模型质量不降。"
        }
      ],
      "insight": "同一套数学，换一种搬运顺序，就能又快又省。",
      "conclusions": [
        "瓶颈在显存读写，不在乘加。",
        "分块让精确注意力拿到实际加速。",
        "IO 感知的思路延伸到块稀疏，仍是更快的那一档。"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要句 1–2：平方复杂度与近似方法的墙钟困境"
        },
        {
          "label": "§2.1",
          "detail": "摘要句 3–5：IO 感知、分块与 IO 复杂度分析"
        },
        {
          "label": "§3",
          "detail": "摘要末段：BERT-large、GPT-2、Path-X 等实验数字"
        }
      ]
    },
    "quiz": [
      {
        "id": "2205.14135-ai-1",
        "paperId": "2205.14135",
        "question": "长序列上 Transformer 慢且吃显存，摘要给出的根本原因是？",
        "options": [
          "自注意力（self-attention）的时间和空间复杂度随序列长度平方增长",
          "模型层数太多",
          "词表规模过大",
          "GPU 主频不足"
        ],
        "answer": 0,
        "explanation": "摘要开篇就点明复杂度是序列长度的平方。",
        "anchor": "§1 摘要句 1"
      },
      {
        "id": "2205.14135-ai-2",
        "paperId": "2205.14135",
        "question": "摘要如何评价此前的近似注意力方法？",
        "options": [
          "质量更好但速度更慢",
          "用模型质量换更低计算量，却常常拿不到实际加速",
          "只能用于图像任务",
          "已经彻底解决长序列问题"
        ],
        "answer": 1,
        "explanation": "它们换掉了质量，却往往换不来墙钟时间上的加速。",
        "anchor": "§1 摘要句 2"
      },
      {
        "id": "2205.14135-ai-3",
        "paperId": "2205.14135",
        "question": "FlashAttention 用什么手段减少显存读写？",
        "options": [
          "把权重压缩成 8 位",
          "剪掉一半注意力头",
          "用分块（tiling）让数据在片上 SRAM 里算完",
          "把注意力换成卷积"
        ],
        "answer": 2,
        "explanation": "分块是关键，数据在芯片内算完再写回 HBM。",
        "anchor": "§2 摘要句 4"
      },
      {
        "id": "2205.14135-ai-4",
        "paperId": "2205.14135",
        "question": "关于摘要里的 IO 复杂度分析，结论是？",
        "options": [
          "FlashAttention 的 HBM 访问次数多于标准注意力",
          "两者的 HBM 访问次数完全相同",
          "访问次数更少，且在一批 SRAM 容量下达到最优",
          "摘要没有做复杂度分析"
        ],
        "answer": 2,
        "explanation": "分析指出它访问 HBM 更少，并对一段 SRAM 容量区间最优。",
        "anchor": "§2.1 摘要句 5"
      },
      {
        "id": "2205.14135-ai-5",
        "paperId": "2205.14135",
        "question": "作者把 FlashAttention 推广成了哪种变体？",
        "options": [
          "线性注意力",
          "块稀疏注意力",
          "低秩注意力",
          "卷积注意力"
        ],
        "answer": 1,
        "explanation": "块稀疏版本属于近似方法，摘要说它快过所有已有近似方法。",
        "anchor": "§2.2 摘要句 6"
      },
      {
        "id": "2205.14135-ai-6",
        "paperId": "2205.14135",
        "question": "BERT-large（序列长度 512）上的端到端加速是多少？",
        "options": [
          "15%",
          "50%",
          "3 倍",
          "2.4 倍"
        ],
        "answer": 0,
        "explanation": "对照对象是 MLPerf 1.1 的训练速度记录，快 15%。",
        "anchor": "§3 摘要句 7"
      },
      {
        "id": "2205.14135-ai-7",
        "paperId": "2205.14135",
        "question": "GPT-2（序列长度 1K）上的加速是多少？",
        "options": [
          "15%",
          "2.4 倍",
          "3 倍",
          "6.4 倍"
        ],
        "answer": 2,
        "explanation": "摘要在 GPT-2 上给出 3 倍加速。",
        "anchor": "§3 摘要句 7"
      },
      {
        "id": "2205.14135-ai-8",
        "paperId": "2205.14135",
        "question": "long-range arena（序列长度 1K–4K）上的加速是多少？",
        "options": [
          "15%",
          "2.4 倍",
          "3 倍",
          "61.4%"
        ],
        "answer": 1,
        "explanation": "这一档的加速是 2.4 倍，61.4% 是 Path-X 的准确率。",
        "anchor": "§3 摘要句 7"
      },
      {
        "id": "2205.14135-ai-9",
        "paperId": "2205.14135",
        "question": "GPT-2 上的困惑度改善是多少？",
        "options": [
          "好 0.7",
          "好 6.4",
          "差 0.7",
          "摘要没提困惑度"
        ],
        "answer": 0,
        "explanation": "摘要说 GPT-2 的困惑度好 0.7，说明质量没退。",
        "anchor": "§3 摘要句 8"
      },
      {
        "id": "2205.14135-ai-10",
        "paperId": "2205.14135",
        "question": "长文档分类任务上的提升是多少？",
        "options": [
          "0.7 分",
          "2.4 分",
          "6.4 分",
          "15 分"
        ],
        "answer": 2,
        "explanation": "长文档分类提升 6.4 分，和困惑度的 0.7 是两回事。",
        "anchor": "§3 摘要句 8"
      },
      {
        "id": "2205.14135-ai-11",
        "paperId": "2205.14135",
        "question": "Path-X 挑战（序列长度 16K）上的结果是什么？",
        "options": [
          "准确率 61.4%，首次超过随机水平",
          "准确率 63.1%，首次超过随机水平",
          "准确率 61.4%，但仍低于随机水平",
          "完全无法完成该任务"
        ],
        "answer": 0,
        "explanation": "63.1% 是 Path-256 的成绩，那一档序列长度是 64K。",
        "anchor": "§3 摘要句 8 末"
      },
      {
        "id": "2205.14135-ai-12",
        "paperId": "2205.14135",
        "question": "关于 FlashAttention 的定位，哪一项符合摘要？",
        "options": [
          "它靠牺牲精确性来换速度",
          "它只对小模型有效",
          "它本身是精确注意力算法，另有块稀疏的近似版本",
          "它只在推理阶段有效"
        ],
        "answer": 2,
        "explanation": "主算法不近似、不丢质量，近似的是块稀疏那个分支。",
        "anchor": "§2 摘要句 3–6"
      }
    ]
  },
  "2006.11239": {
    "paperId": "2006.11239",
    "titleZh": "去噪扩散概率模型（Denoising Diffusion Probabilistic Models）",
    "abstractZh": "本文提出一类受非平衡热力学启发的隐变量模型，即去噪扩散概率模型（diffusion probabilistic model）。它先用固定的马尔可夫链逐步向数据注入高斯噪声，把图像结构一点点抹掉；再训练网络从加噪样本还原去噪方向。训练目标是变分下界的一个加权形式，其权重来自它与去噪分数匹配（denoising score matching）、朗之万动力学（Langevin dynamics）的新联系。该框架还自带渐进式有损解压。在 CIFAR10 无条件生成上，它取得 9.46 的 Inception 分数与 3.17 的 FID；在 256×256 的 LSUN 上，样本质量接近 ProgressiveGAN。",
    "bigIdea": "先学会一步步加噪，再学会一步步去噪，图像就从噪声里长出来。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "把雪花点拼回照片",
        "narration": "一张全是雪花点的图，能不能变回清晰照片？扩散模型说能。它先教网络认噪声，再教它倒着走一步。就像把打碎的杯子，一片片拼回去。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "去噪扩散",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "一张雪花图，能不能还原？",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "arrow",
            "x1": 60,
            "y1": 270,
            "x2": 380,
            "y2": 270,
            "at": 2800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "倒着走一步",
            "size": 28,
            "at": 4000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "碎片一片片拼回",
            "size": 24,
            "at": 5600,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "直接生成太难",
        "narration": "一步到位生成整张图，网络很难学。像素之间的关系太复杂，一步错，整张就散。扩散换个思路。它把大难题拆成小步，每步只改一点点。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "难点：一步生成",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "像素关系太复杂",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "一步错，整张散",
            "size": 24,
            "at": 3200,
            "anchor": "start"
          },
          {
            "kind": "arrow",
            "x1": 60,
            "y1": 350,
            "x2": 400,
            "y2": 350,
            "at": 4400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "拆成很多小步",
            "size": 28,
            "at": 5600,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "把生成拆成一千步",
        "narration": "先定一条固定链条，往上加噪声。每一步只掺一点高斯噪声。走够一千步，图就变成纯噪声。反向再训练网络，逐层把噪声剥掉。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "前向：加噪",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "每步掺一点高斯噪声",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "走满 1000 步",
            "size": 24,
            "at": 3000,
            "anchor": "start"
          },
          {
            "kind": "arrow",
            "x1": 60,
            "y1": 350,
            "x2": 420,
            "y2": 350,
            "at": 4200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "反向：逐层去噪",
            "size": 28,
            "at": 5600,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "让网络只猜噪声",
        "narration": "网络不直接画图，只猜这一步加了多少噪声。把变分下界重新加权，训练目标就简单了。论文还指出，它等价于去噪分数匹配。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "训练目标",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "不画图，只猜噪声",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "重加权变分下界",
            "size": 24,
            "at": 3200,
            "anchor": "start"
          },
          {
            "kind": "arrow",
            "x1": 60,
            "y1": 350,
            "x2": 420,
            "y2": 350,
            "at": 4200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "= 去噪分数匹配",
            "size": 24,
            "at": 5600,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "CIFAR10 上刷新 FID",
        "narration": "在 CIFAR10 上做无条件生成，它拿到 9.46 的 Inception 分数。FID 只有 3.17，是当时最好的成绩。换到 256×256 的 LSUN，画质也追平 ProgressiveGAN。它证明扩散模型能和强基线对话。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "结果",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "CIFAR10 FID 3.17",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "Inception 分数 9.46",
            "size": 24,
            "at": 3000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "256×256 LSUN",
            "size": 24,
            "at": 4400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 440,
            "text": "画质追平 ProgressiveGAN",
            "size": 24,
            "at": 5600,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "噪声也是老师",
        "narration": "记住三点。加噪和去噪，是同一条链的两端。训练时只需学会猜噪声。生成就是一步步拨开迷雾，步子慢，但很稳。这就是扩散模型的全部。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "一句话带走",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "同一条链的两端",
            "size": 24,
            "at": 1600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "学会猜噪声",
            "size": 24,
            "at": 3000,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "步子慢，但很稳",
            "size": 28,
            "at": 4400,
            "anchor": "start"
          }
        ]
      }
    ],
    "diagram": {
      "headline": "DDPM：从加噪到去噪的一条链",
      "steps": [
        {
          "label": "前向加噪",
          "note": "固定马尔可夫链，逐步注入高斯噪声"
        },
        {
          "label": "反向去噪",
          "note": "训练网络，从 x_t 还原上一步 x_{t-1}"
        },
        {
          "label": "重加权目标",
          "note": "只预测噪声，等价于去噪分数匹配"
        },
        {
          "label": "采样生成",
          "note": "从纯噪声出发，走满 1000 步得到图像"
        }
      ],
      "insight": "生成不是一步画完，而是把噪声一步步减回去。",
      "conclusions": [
        "前向加噪是固定的，不需要学习",
        "训练目标可化简为预测噪声",
        "CIFAR10 FID 3.17，LSUN 画质接近 ProgressiveGAN"
      ],
      "anchors": [
        {
          "label": "§3.1",
          "detail": "式(1)-(3)，前向扩散过程的马尔可夫链定义"
        },
        {
          "label": "§3.2",
          "detail": "式(14) 简化训练目标 L_simple，预测噪声 ε"
        },
        {
          "label": "§4",
          "detail": "实验设置与表 1：CIFAR10、LSUN 采样结果"
        }
      ]
    },
    "quiz": [
      {
        "id": "2006.11239-ai-1",
        "paperId": "2006.11239",
        "question": "DDPM 这类扩散概率模型最初受哪个领域的想法启发？",
        "options": [
          "非平衡热力学",
          "强化学习里的策略梯度",
          "图神经网络的 message passing",
          "卷积网络的感受野"
        ],
        "answer": 0,
        "explanation": "摘要开篇就说，它是一类受非平衡热力学启发的隐变量模型。",
        "anchor": "摘要首句 / §1 引言"
      },
      {
        "id": "2006.11239-ai-2",
        "paperId": "2006.11239",
        "question": "前向扩散过程对数据做了什么？",
        "options": [
          "逐步去掉噪声得到清晰图像",
          "把图像分块后重排",
          "逐步加入高斯噪声，直到接近纯噪声",
          "用判别器把样本逼真"
        ],
        "answer": 2,
        "explanation": "前向是一条固定马尔可夫链，每一步只注入少量高斯噪声。",
        "anchor": "§3.1 式(1)-(3)"
      },
      {
        "id": "2006.11239-ai-3",
        "paperId": "2006.11239",
        "question": "反向过程里，网络要学会什么？",
        "options": [
          "给图像打类别标签",
          "把图像压缩到低维码",
          "把两张图拼接起来",
          "从加噪的 x_t 还原上一步 x_{t-1}"
        ],
        "answer": 3,
        "explanation": "反向过程学习的是一步高斯转移，从 x_t 推出 x_{t-1}。",
        "anchor": "§3.2 反向过程 p_θ(x_{t-1}|x_t)"
      },
      {
        "id": "2006.11239-ai-4",
        "paperId": "2006.11239",
        "question": "论文把训练目标化简成让网络预测什么？",
        "options": [
          "图像的类别",
          "这一步加入的噪声 ε",
          "下一帧视频",
          "分割掩码"
        ],
        "answer": 1,
        "explanation": "简化目标 L_simple 让网络回归该步注入的噪声 ε。",
        "anchor": "§3.2 式(14)"
      },
      {
        "id": "2006.11239-ai-5",
        "paperId": "2006.11239",
        "question": "论文指出变分下界与哪类方法存在新的联系？",
        "options": [
          "对比学习与动量编码器",
          "强化学习与贝尔曼方程",
          "去噪分数匹配与朗之万动力学",
          "稀疏编码与字典学习"
        ],
        "answer": 2,
        "explanation": "摘要强调，重加权变分下界对应去噪分数匹配与朗之万动力学。",
        "anchor": "摘要 / §4 讨论"
      },
      {
        "id": "2006.11239-ai-6",
        "paperId": "2006.11239",
        "question": "DDPM 在 CIFAR10 无条件生成上报告的 FID 是多少？",
        "options": [
          "9.46",
          "3.17",
          "1.00",
          "25.0"
        ],
        "answer": 1,
        "explanation": "摘要给出的 FID 为 3.17，9.46 是 Inception 分数。",
        "anchor": "§4 表 1"
      },
      {
        "id": "2006.11239-ai-7",
        "paperId": "2006.11239",
        "question": "同一组 CIFAR10 实验里，Inception 分数是多少？",
        "options": [
          "3.17",
          "5.20",
          "9.46",
          "12.0"
        ],
        "answer": 2,
        "explanation": "摘要写明 Inception 分数为 9.46。",
        "anchor": "§4 表 1"
      },
      {
        "id": "2006.11239-ai-8",
        "paperId": "2006.11239",
        "question": "在 256×256 LSUN 上，论文称样本质量与哪个模型相近？",
        "options": [
          "BigGAN",
          "ProgressiveGAN",
          "VQ-VAE",
          "StyleGAN2"
        ],
        "answer": 1,
        "explanation": "摘要称 LSUN 样本质量与 ProgressiveGAN 相似。",
        "anchor": "摘要末 / §4"
      },
      {
        "id": "2006.11239-ai-9",
        "paperId": "2006.11239",
        "question": "论文所有实验使用的扩散步数 T 是多少？",
        "options": [
          "100",
          "1000",
          "10",
          "10000"
        ],
        "answer": 1,
        "explanation": "实验中统一采用 T 等于 1000 的扩散步数。",
        "anchor": "§4 实验设置"
      },
      {
        "id": "2006.11239-ai-10",
        "paperId": "2006.11239",
        "question": "论文把渐进式有损解压看作什么的一种推广？",
        "options": [
          "对抗训练",
          "变分自编码器的重参数化",
          "对比学习",
          "自回归解码"
        ],
        "answer": 3,
        "explanation": "摘要说渐进式有损解压可解释为自回归解码的推广。",
        "anchor": "摘要"
      },
      {
        "id": "2006.11239-ai-11",
        "paperId": "2006.11239",
        "question": "以下哪项最符合 DDPM 采样方式的代价？",
        "options": [
          "必须依赖标签才能生成",
          "要沿整条链迭代多步，速度较慢",
          "无法生成 256×256 图像",
          "只能输出类别概率"
        ],
        "answer": 1,
        "explanation": "采样要沿整条链走满多步，这是它相对昂贵的代价。",
        "anchor": "§1 / §4 采样步数讨论"
      },
      {
        "id": "2006.11239-ai-12",
        "paperId": "2006.11239",
        "question": "与 GAN 相比，DDPM 的训练主要依靠什么？",
        "options": [
          "用判别器与生成器博弈",
          "用强化学习奖励",
          "优化变分下界（似然），不用对抗判别器",
          "用聚类分配伪标签"
        ],
        "answer": 2,
        "explanation": "DDPM 训练的是变分下界，不需要对抗判别器。",
        "anchor": "§3 训练目标 / §1"
      }
    ]
  },
  "2112.10752": {
    "paperId": "2112.10752",
    "titleZh": "用潜扩散模型（latent diffusion model）做高分辨率图像合成",
    "abstractZh": "扩散模型（diffusion model）把图像生成拆成一串去噪自编码器（denoising autoencoder），在合成质量上领先，还能用引导控制生成，不必重新训练。但它们直接在像素空间运算，训练常要上百个 GPU 天，顺序求值也让推理昂贵。本文把扩散放进预训练自编码器的潜空间（latent space），第一次在降复杂度与保细节之间接近最优，视觉保真度明显提升。模型又加进交叉注意力（cross-attention）层，文本、边界框都能当条件，高分辨率合成可用卷积方式完成。潜扩散模型在图像修补上刷新纪录，在无条件生成、语义场景合成等任务上有竞争力，算力需求显著降低。",
    "bigIdea": "把扩散从像素空间搬进潜空间，质量和算力终于能兼顾。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "画质好，可代价高",
        "narration": "扩散模型靠一步步去噪，画质确实好。可它直接在像素上算，一张图就要跑很多次。训练动辄上百个 GPU 天，小实验室根本扛不住。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 120,
            "text": "扩散模型很贵",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "一步步去噪，画质好",
            "size": 24,
            "at": 2000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "直接在像素上算",
            "size": 24,
            "at": 4000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "训练：上百 GPU 天",
            "size": 28,
            "at": 6000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "小实验室扛不住",
            "size": 24,
            "at": 8000
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "慢在像素空间",
        "narration": "问题出在算的地方。每一步去噪都要碰全部像素，像素越多越慢。训练烧掉上百个 GPU 天。推理又是串行的，次数一多就贵得离谱。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "问题在算的位置",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "每步去噪都碰全部像素",
            "size": 24,
            "at": 2000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 250,
            "text": "训练：上百 GPU 天",
            "size": 24,
            "at": 4000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 310,
            "text": "推理：顺序求值，很贵",
            "size": 24,
            "at": 6000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 370,
            "text": "代价随分辨率上涨",
            "size": 24,
            "at": 8000
          }
        ]
      },
      {
        "id": "method-1",
        "kicker": "03 · 方法一",
        "title": "先压缩，再扩散",
        "narration": "他们的办法是先压缩。借一个预训练自编码器，把图压成更小的潜表示。扩散只在潜空间跑，像素交给解码器还原。降复杂度和保细节，它找到了平衡点。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "先压缩，再扩散",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 80,
            "y": 220,
            "text": "图像",
            "size": 24,
            "at": 1500
          },
          {
            "kind": "arrow",
            "x1": 160,
            "y1": 232,
            "x2": 240,
            "y2": 232,
            "at": 3000
          },
          {
            "kind": "text",
            "x": 260,
            "y": 220,
            "text": "潜表示",
            "size": 24,
            "at": 4500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "扩散只在这里跑",
            "size": 24,
            "at": 6000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "降复杂度，保细节",
            "size": 24,
            "at": 7500
          }
        ]
      },
      {
        "id": "method-2",
        "kicker": "04 · 方法二",
        "title": "加上条件入口",
        "narration": "光压还不够，还得听指挥。模型里加进交叉注意力层，文字、边界框都能当条件。于是扩散变成通用生成器。高分辨率图也能用卷积方式合成。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 110,
            "text": "加上条件入口",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "文字 / 边界框",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "arrow",
            "x1": 60,
            "y1": 250,
            "x2": 220,
            "y2": 250,
            "at": 3200
          },
          {
            "kind": "text",
            "x": 240,
            "y": 238,
            "text": "交叉注意力层",
            "size": 24,
            "at": 4800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "卷积方式做高分辨率",
            "size": 24,
            "at": 6500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "通用生成器",
            "size": 28,
            "at": 8200
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "更省，还更强",
        "narration": "结果很硬。图像修补上，它刷新了最好成绩。无条件生成、语义场景合成、超分辨率。这些任务它也都有竞争力。算力开销还比像素版小了一大截。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "更省，还更强",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "图像修补：刷新纪录",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "无条件生成",
            "size": 24,
            "at": 3400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "语义场景合成",
            "size": 24,
            "at": 5000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "超分辨率",
            "size": 24,
            "at": 6600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 430,
            "text": "算力显著下降",
            "size": 28,
            "at": 8200
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "别在像素上烧钱",
        "narration": "一句话带走：贵的不是扩散本身。真正贵的是在像素上算。把计算搬到压缩后的表示里，画质和成本就能一起谈。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 140,
            "text": "贵的不是扩散",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 220,
            "text": "是算在像素上",
            "size": 24,
            "at": 2000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "搬进压缩后的表示",
            "size": 28,
            "at": 4000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 370,
            "text": "画质与成本兼得",
            "size": 24,
            "at": 6000
          }
        ]
      }
    ],
    "diagram": {
      "headline": "潜扩散模型（latent diffusion model）的一条流水线",
      "steps": [
        {
          "label": "压缩图像",
          "note": "预训练自编码器把像素压成更小的潜表示"
        },
        {
          "label": "潜空间扩散",
          "note": "去噪在潜表示上做，每步比像素空间更省"
        },
        {
          "label": "交叉注意力",
          "note": "文字、边界框成为条件，控制生成方向"
        },
        {
          "label": "解码回像素",
          "note": "自编码器把潜表示还原成高分辨率图像"
        }
      ],
      "insight": "算力搬到压缩表示上，细节与成本不必二选一",
      "conclusions": [
        "在潜空间训练，复杂度降下来，细节也保得住",
        "加交叉注意力后，文本或边界框能直接控制生成",
        "修补刷新纪录，其他任务有竞争力，算力开销显著更小"
      ],
      "anchors": [
        {
          "label": "摘要·成本",
          "detail": "摘要第 2 句：像素空间运算带来上百 GPU 天训练与昂贵的顺序推理"
        },
        {
          "label": "摘要·方法",
          "detail": "摘要第 3 句：把扩散模型用在预训练自编码器的潜空间里训练"
        },
        {
          "label": "摘要·结构改动",
          "detail": "摘要第 5 句：引入交叉注意力层，支持文本、边界框与卷积式高分辨率合成"
        },
        {
          "label": "摘要·结果",
          "detail": "摘要第 6 句：图像修补达到新 SOTA，多任务有竞争力且算力显著下降"
        }
      ]
    },
    "quiz": [
      {
        "id": "2112.10752-ai-1",
        "paperId": "2112.10752",
        "question": "按摘要的说法，扩散模型计算开销大的直接原因是什么？",
        "options": [
          "必须为每个任务重训引导模块",
          "只能生成低分辨率图像",
          "依赖人工标注的边界框",
          "直接在像素空间运算，推理要顺序求值"
        ],
        "answer": 3,
        "explanation": "摘要点明两个来源：像素空间运算，以及顺序求值带来的昂贵推理。",
        "anchor": "摘要·第 2 句"
      },
      {
        "id": "2112.10752-ai-2",
        "paperId": "2112.10752",
        "question": "摘要提到，优化强大的扩散模型常常消耗多少 GPU 时间？",
        "options": [
          "几十个 GPU 天",
          "上百个 GPU 天",
          "上千个 GPU 天",
          "几个小时"
        ],
        "answer": 1,
        "explanation": "原文写的是 hundreds of GPU days，也就是上百个 GPU 天。",
        "anchor": "摘要·第 2 句"
      },
      {
        "id": "2112.10752-ai-3",
        "paperId": "2112.10752",
        "question": "本文把扩散模型放到哪里训练？",
        "options": [
          "原始像素空间",
          "频域",
          "预训练自编码器的潜空间",
          "图像分类器的特征层"
        ],
        "answer": 2,
        "explanation": "摘要说把扩散模型应用到强大预训练自编码器的潜空间，这正是 LDM 的核心。",
        "anchor": "摘要·第 3 句"
      },
      {
        "id": "2112.10752-ai-4",
        "paperId": "2112.10752",
        "question": "引入交叉注意力（cross-attention）层的主要作用是什么？",
        "options": [
          "把潜表示还原成像素",
          "让文本、边界框等条件输入可以控制生成",
          "替代自编码器做压缩",
          "把扩散步数减到一步"
        ],
        "answer": 1,
        "explanation": "摘要说交叉注意力让模型能接收文本或边界框这类一般条件，成为灵活的生成器。",
        "anchor": "摘要·第 5 句"
      },
      {
        "id": "2112.10752-ai-5",
        "paperId": "2112.10752",
        "question": "与以往工作相比，本文在潜表示上训练扩散模型的独特之处是？",
        "options": [
          "首次让复杂度与细节的折中接近最优",
          "首次把扩散用于图像任务",
          "首次使用自编码器",
          "首次去掉引导机制"
        ],
        "answer": 0,
        "explanation": "摘要强调与先前工作不同，这种表示第一次让降复杂度与保细节的折中接近最优。",
        "anchor": "摘要·第 4 句"
      },
      {
        "id": "2112.10752-ai-6",
        "paperId": "2112.10752",
        "question": "在图像修补（inpainting）任务上，LDM 的成绩是？",
        "options": [
          "与像素版持平",
          "论文未提及",
          "明显落后",
          "达到新的最好水平"
        ],
        "answer": 3,
        "explanation": "摘要称 LDM 在图像修补上取得新的 state of the art。",
        "anchor": "摘要·第 6 句"
      },
      {
        "id": "2112.10752-ai-7",
        "paperId": "2112.10752",
        "question": "以下哪项属于摘要列出的、LDM 有竞争力的任务？",
        "options": [
          "机器翻译",
          "语音识别",
          "语义场景合成",
          "蛋白质折叠"
        ],
        "answer": 2,
        "explanation": "摘要列出无条件生成、语义场景合成、超分辨率等图像任务。",
        "anchor": "摘要·第 6 句"
      },
      {
        "id": "2112.10752-ai-8",
        "paperId": "2112.10752",
        "question": "关于推理代价，摘要的准确说法是？",
        "options": [
          "彻底消除顺序求值",
          "只在训练时降低成本",
          "训练与推理都不再需要 GPU",
          "算力显著降低，但顺序求值仍在"
        ],
        "answer": 3,
        "explanation": "摘要只说显著降低计算需求，并未声称取消顺序求值，推理昂贵正源于此。",
        "anchor": "摘要·第 6 句"
      },
      {
        "id": "2112.10752-ai-9",
        "paperId": "2112.10752",
        "question": "摘要说扩散模型的引导机制有什么好处？",
        "options": [
          "可以省掉自编码器",
          "无需重新训练就能控制生成过程",
          "把推理变成并行",
          "自动生成训练数据"
        ],
        "answer": 1,
        "explanation": "摘要开头就说引导机制让生成过程可控，而且不必重新训练。",
        "anchor": "摘要·第 1 句"
      },
      {
        "id": "2112.10752-ai-10",
        "paperId": "2112.10752",
        "question": "借助什么方式，LDM 能做高分辨率合成？",
        "options": [
          "靠加大扩散步数",
          "以卷积方式完成合成",
          "靠堆叠多个自编码器",
          "靠把图像切块逐块生成"
        ],
        "answer": 1,
        "explanation": "摘要说加入交叉注意力后，高分辨率合成可以卷积方式进行。",
        "anchor": "摘要·第 5 句"
      },
      {
        "id": "2112.10752-ai-11",
        "paperId": "2112.10752",
        "question": "本文方法的出发点之一，是在什么条件下也能训练扩散模型？",
        "options": [
          "计算资源有限时",
          "有人工标注边界框时",
          "放弃引导机制时",
          "只做低分辨率时"
        ],
        "answer": 0,
        "explanation": "摘要明确目标是让扩散模型在有限计算资源上也能训练，同时保住质量和灵活性。",
        "anchor": "摘要·第 3 句"
      },
      {
        "id": "2112.10752-ai-12",
        "paperId": "2112.10752",
        "question": "把扩散搬到潜空间后，视觉保真度的变化是？",
        "options": [
          "基本不变",
          "下降但速度更快",
          "明显提升",
          "无法比较"
        ],
        "answer": 2,
        "explanation": "摘要用 greatly boosting visual fidelity 说明保真度被大幅提升。",
        "anchor": "摘要·第 4 句"
      }
    ]
  },
  "1406.2661": {
    "paperId": "1406.2661",
    "titleZh": "生成对抗网络（Generative Adversarial Networks）",
    "abstractZh": "本文提出一种用对抗过程估计生成模型的新框架。训练时同时更新生成器（generator）G 与判别器（discriminator）D：G 学习拟合数据分布，D 估计样本来自训练数据而非 G 的概率。G 的训练目标是让 D 出错的概率最大，因此整个框架可视为双人极小极大博弈。当 G 和 D 可以是任意函数时，该博弈存在唯一解：G 复现训练数据分布，D 在所有位置都输出 1/2。若两者均为多层感知机（multilayer perceptron），整个系统可用反向传播训练；训练和采样都不依赖马尔可夫链（Markov chain）或展开的近似推断网络。实验通过生成样本的定性与定量评估，展示了该框架的潜力。",
    "bigIdea": "让生成器与判别器互相对抗，靠极小极大博弈学出数据分布。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "谁在造假，谁在识假",
        "narration": "想象这个场景：没有裁判的博弈。生成器负责造假，判别器负责识假。造假者想骗过对方，识假者想抓住破绽。它们一起训练，能力互相推高。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "谁在造假，谁在识假",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "生成器：造样本",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "判别器：辨真假",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 340,
            "text": "目标：骗过对手",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 410,
            "text": "训练：一起变强",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "分布难算，怎么办",
        "narration": "生成模型要估计数据分布。分布太复杂，直接算很难。旧办法常靠马尔可夫链采样，或展开近似推断。流程绕得远，训练和采样都受牵制。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "分布难算，怎么办",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "生成模型要估计分布",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "直接计算：很难",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "旧路：马尔可夫链采样",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "旧路：展开近似推断",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 470,
            "text": "流程绕得远",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "G 负责骗，D 负责判",
        "narration": "先看两个网络的分工。生成器 G 接收噪声，输出假样本。判别器 D 拿到样本，判断它来自训练数据，还是出自 G。G 的目标很直接：让 D 判断出错。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "G 负责骗，D 负责判",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "生成器 G：接收噪声",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "输出候选样本",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "判别器 D：看样本",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "判断来源：真数据或 G",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 470,
            "text": "G 的目标：让 D 出错",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "把训练变成博弈",
        "narration": "把它写成博弈。G 想让 D 犯错，D 想少犯错。两边取极小极大。当 G 和 D 可以是任意函数时，解唯一。G 复现数据分布，D 处处给出 1/2。用多层感知机时，整套系统靠反向传播训练。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "把训练变成博弈",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "G：让 D 判断出错",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "D：尽量识别样本",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "形式：极小极大博弈",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "任意函数下：解唯一",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 470,
            "text": "均衡：D 输出 1/2",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "不靠采样链也能练",
        "narration": "实验用定性观察和定量指标，展示这套框架的潜力。训练和采样都不需要马尔可夫链。也不需要展开近似推断。用多层感知机时，整套系统靠反向传播训练。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "不靠采样链也能练",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "评估：定性观察",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "评估：定量指标",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "不需要马尔可夫链",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "不需要展开近似推断",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 470,
            "text": "多层感知机：反向传播",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "对抗就是训练法",
        "narration": "记住这个循环。生成器造样本，判别器做判断。误差反传回去。两边越斗越强。最后生成器复现数据分布，判别器只能给出 1/2。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "对抗就是训练法",
            "size": 34,
            "weight": 600,
            "at": 0,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "生成器造样本",
            "size": 24,
            "at": 1800,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "判别器做判断",
            "size": 24,
            "at": 3600,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "误差反传，两边变强",
            "size": 24,
            "at": 5400,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 400,
            "text": "均衡：G 复现分布",
            "size": 24,
            "at": 7200,
            "anchor": "start"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 470,
            "text": "D 处处输出 1/2",
            "size": 24,
            "at": 9000,
            "anchor": "start"
          }
        ]
      }
    ],
    "diagram": {
      "headline": "一页图解：生成对抗网络怎么跑",
      "steps": [
        {
          "label": "生成器出手",
          "note": "G 把噪声变成候选样本"
        },
        {
          "label": "判别器打分",
          "note": "D 判断样本来自训练数据还是 G"
        },
        {
          "label": "对抗博弈",
          "note": "G 想骗过 D，D 想识破 G"
        },
        {
          "label": "误差回传",
          "note": "用多层感知机时，反向传播更新两边"
        },
        {
          "label": "达到均衡",
          "note": "G 复现数据分布，D 处处输出 1/2"
        }
      ],
      "insight": "两个网络互相施压，把生成分布推向真实分布。",
      "conclusions": [
        "框架把训练写成双人极小极大博弈",
        "理想均衡下 G 复现数据分布，D 输出 1/2",
        "多层感知机可用反向传播，无需马尔可夫链或展开近似推断"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要开头：提出对抗式生成模型估计框架，并同时训练 G 与 D。"
        },
        {
          "label": "§2",
          "detail": "摘要中段：G 最大化 D 犯错概率，框架对应双人极小极大博弈。"
        },
        {
          "label": "§3",
          "detail": "摘要后段：任意函数下唯一解、D 等于 1/2，多层感知机可用反向传播。"
        },
        {
          "label": "§4",
          "detail": "摘要结尾：训练和采样无需马尔可夫链或展开近似推断，实验做定性与定量评估。"
        }
      ]
    },
    "quiz": [
      {
        "id": "1406.2661-ai-1",
        "paperId": "1406.2661",
        "question": "这篇论文提出的核心框架是什么？",
        "options": [
          "用对抗过程估计生成模型",
          "用图卷积做图像分类",
          "用强化学习训练策略网络",
          "用马尔可夫链做精确推断"
        ],
        "answer": 0,
        "explanation": "摘要开头明确说，框架通过对抗过程估计生成模型。",
        "anchor": "§1"
      },
      {
        "id": "1406.2661-ai-2",
        "paperId": "1406.2661",
        "question": "训练时，生成器 G 与判别器 D 的安排是什么？",
        "options": [
          "先固定 G，只训练 D",
          "先固定 D，只训练 G",
          "两个模型同时训练",
          "只在采样后训练 D"
        ],
        "answer": 2,
        "explanation": "摘要说训练时同时训练两个模型。",
        "anchor": "§1"
      },
      {
        "id": "1406.2661-ai-3",
        "paperId": "1406.2661",
        "question": "生成器 G 主要学习什么？",
        "options": [
          "给样本打类别标签",
          "拟合训练数据的分布",
          "计算马尔可夫链转移概率",
          "替代判别器做最终判断"
        ],
        "answer": 1,
        "explanation": "摘要定义 G 捕捉数据分布。",
        "anchor": "§1"
      },
      {
        "id": "1406.2661-ai-4",
        "paperId": "1406.2661",
        "question": "判别器 D 估计的是什么？",
        "options": [
          "样本来自训练数据而非 G 的概率",
          "生成器网络有多少层",
          "训练集的大小",
          "反向传播的步数"
        ],
        "answer": 0,
        "explanation": "摘要原文就是判断样本来自训练数据还是 G 的概率。",
        "anchor": "§1"
      },
      {
        "id": "1406.2661-ai-5",
        "paperId": "1406.2661",
        "question": "生成器 G 的训练目标是什么？",
        "options": [
          "让判别器 D 判断出错的概率最大",
          "让判别器 D 的准确率最高",
          "让训练数据全部被遗忘",
          "让生成样本与噪声完全一致"
        ],
        "answer": 0,
        "explanation": "摘要说 G 最大化 D 犯错的概率。",
        "anchor": "§2"
      },
      {
        "id": "1406.2661-ai-6",
        "paperId": "1406.2661",
        "question": "整个训练框架对应哪种数学形式？",
        "options": [
          "单人监督学习",
          "双人极小极大博弈",
          "线性规划",
          "马尔可夫链蒙特卡洛"
        ],
        "answer": 1,
        "explanation": "摘要把它描述为双人极小极大博弈。",
        "anchor": "§2"
      },
      {
        "id": "1406.2661-ai-7",
        "paperId": "1406.2661",
        "question": "在理想唯一解中，G 与 D 分别处于什么状态？",
        "options": [
          "G 复现训练数据分布，D 处处输出 1/2",
          "G 输出噪声，D 处处输出 1",
          "G 记住标签，D 输出训练集大小",
          "G 停止更新，D 只输出真实样本"
        ],
        "answer": 0,
        "explanation": "摘要把唯一解写成 G 复现数据分布、D 处处等于 1/2。",
        "anchor": "§3"
      },
      {
        "id": "1406.2661-ai-8",
        "paperId": "1406.2661",
        "question": "这个唯一解在什么条件下成立？",
        "options": [
          "G 和 D 只能是线性模型",
          "G 和 D 可以是任意函数",
          "G 和 D 必须都是卷积网络",
          "G 和 D 必须共享参数"
        ],
        "answer": 1,
        "explanation": "摘要说在任意函数 G 和 D 的空间里存在唯一解。",
        "anchor": "§3"
      },
      {
        "id": "1406.2661-ai-9",
        "paperId": "1406.2661",
        "question": "若 G 与 D 都用多层感知机，整个系统如何训练？",
        "options": [
          "用反向传播",
          "用马尔可夫链采样",
          "用人工规则逐层调整",
          "用展开的近似推断网络"
        ],
        "answer": 0,
        "explanation": "摘要说多层感知机情形下，整套系统可用反向传播训练。",
        "anchor": "§3"
      },
      {
        "id": "1406.2661-ai-10",
        "paperId": "1406.2661",
        "question": "论文强调训练和生成样本时不需要什么？",
        "options": [
          "不需要任何参数",
          "不需要判别器",
          "不需要马尔可夫链或展开的近似推断网络",
          "不需要训练数据"
        ],
        "answer": 2,
        "explanation": "摘要明确排除马尔可夫链和展开近似推断网络。",
        "anchor": "§4"
      },
      {
        "id": "1406.2661-ai-11",
        "paperId": "1406.2661",
        "question": "论文用什么方式评估生成样本？",
        "options": [
          "只做定性观察",
          "只做定量指标",
          "定性与定量都做",
          "只比较训练速度"
        ],
        "answer": 2,
        "explanation": "摘要说实验通过定性和定量评估展示潜力。",
        "anchor": "§4"
      },
      {
        "id": "1406.2661-ai-12",
        "paperId": "1406.2661",
        "question": "论文对实验结果的表述是什么？",
        "options": [
          "已证明在所有数据集上最优",
          "展示了该框架的潜力",
          "证明训练一定收敛",
          "证明不需要任何网络结构"
        ],
        "answer": 1,
        "explanation": "摘要只说实验展示框架的潜力，没有声称全面最优。",
        "anchor": "§4"
      }
    ]
  },
  "2004.04906": {
    "paperId": "2004.04906",
    "titleZh": "面向开放域问答的稠密段落检索（Dense Passage Retrieval）",
    "abstractZh": "开放域问答通常先用稀疏检索挑出候选段落，TF-IDF 或 BM25 是常用做法。本文证明，只靠稠密向量也能完成高效检索。作者用一个小规模问题-段落对训练简单的双编码器（dual-encoder），让问题和段落各自学到一个稠密向量表示。在多个开放域问答数据集上，这种稠密检索器在 top-20 段落检索准确率上大幅超过 Lucene-BM25，提升达 9% 到 19%，并助力端到端问答系统刷新多项基准的最优结果。",
    "bigIdea": "稠密向量检索可以替代稀疏检索，成为开放域问答的新默认。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "同义词在偷走答案",
        "narration": "你在搜索引擎里敲一个问题。真正决定答案质量的，不是排序。是它先找到哪段文字。传统方法靠关键词匹配。但同义词会让它漏掉关键段落。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "同义词是陷阱",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "关键词匹配会漏掉关键段落",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "答案藏在语义里",
            "size": 24,
            "anchor": "start",
            "at": 4500
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "关键词匹配会漏检",
        "narration": "开放域问答的第一步是检索。它要从海量文档中快速挑出候选段落。TF-IDF 和 BM25 是常用的稀疏方法。它们靠词频打分，但遇到同义表达就束手无策。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "第一步：检索",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "稀疏方法：TF-IDF / BM25",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "按词频打分",
            "size": 24,
            "anchor": "start",
            "at": 4500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "同义表达会漏检",
            "size": 24,
            "anchor": "start",
            "at": 7500
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "把文本压成向量",
        "narration": "这篇论文换了个思路。它不再数关键词。而是让问题和段落各自变成稠密向量。一个双编码器分别读入问题和段落。把它们映射到同一个向量空间。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "换思路：学向量",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "问题 → 稠密向量",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "段落 → 稠密向量",
            "size": 24,
            "anchor": "start",
            "at": 4500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "一个双编码器分别编码",
            "size": 24,
            "anchor": "start",
            "at": 7500
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "少量数据拉近距离",
        "narration": "训练数据并不多。模型只需要少量问题与对应段落。它就能学会把相关的问题和段落拉得更近。检索时，按向量相似度召回相关段落。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "少量数据就够了",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "问题 + 对应段落",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "拉近相关向量",
            "size": 24,
            "anchor": "start",
            "at": 4500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "按相似度召回",
            "size": 24,
            "anchor": "start",
            "at": 7500
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "准确率提升看得见",
        "narration": "在多个开放域问答数据集上，稠密检索器全面压倒 BM25。它的 top-20 段落检索准确率提升了 9% 到 19%。端到端问答系统也借此刷新了多项基准。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "全面超过 BM25",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "top-20 段落检索准确率",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "提升 9% 到 19%",
            "size": 28,
            "anchor": "start",
            "at": 4500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "端到端系统刷新基准",
            "size": 24,
            "anchor": "start",
            "at": 7500
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "让稠密检索打头阵",
        "narration": "关键词匹配不是唯一选择。稠密向量能把语义相近的文本聚在一起。未来的开放域问答，或许该让稠密检索打头阵。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "关键词不是唯一答案",
            "size": 34,
            "weight": 600,
            "anchor": "start",
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "稠密向量捕获语义",
            "size": 24,
            "anchor": "start",
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "让稠密检索打头阵",
            "size": 24,
            "anchor": "start",
            "at": 4500
          }
        ]
      }
    ],
    "diagram": {
      "headline": "从关键词到稠密向量：DPR 的三步检索",
      "steps": [
        {
          "label": "编码",
          "note": "问题和段落分别进入双编码器，得到稠密向量。"
        },
        {
          "label": "训练",
          "note": "用少量问题-段落对把相关向量拉近。"
        },
        {
          "label": "检索",
          "note": "按向量相似度召回最相关的候选段落。"
        },
        {
          "label": "收益",
          "note": "top-20 段落检索准确率提升 9% 到 19%。"
        }
      ],
      "insight": "语义相近的文本在向量空间里自然靠近，检索不再被同义词绊住。",
      "conclusions": [
        "稠密检索能替代稀疏检索完成高效召回",
        "双编码器只需要少量问题-段落对即可训练",
        "DPR 在多个开放域 QA 基准上刷新最优结果"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "Abstract：传统稀疏向量模型 TF-IDF/BM25 是开放域 QA 检索的事实方法"
        },
        {
          "label": "§2",
          "detail": "Abstract：仅靠稠密表示即可实现检索，由简单双编码器从少量问题-段落对中学习"
        },
        {
          "label": "§3",
          "detail": "Abstract：在多个数据集上，稠密检索器以 9%-19% 的绝对提升超越 Lucene-BM25 的 top-20 准确率"
        }
      ]
    },
    "quiz": [
      {
        "id": "2004.04906-ai-1",
        "paperId": "2004.04906",
        "question": "传统开放域问答通常用什么方法做段落检索？",
        "options": [
          "TF-IDF 或 BM25",
          "单一编码器",
          "神经网络分类器",
          "图神经网络"
        ],
        "answer": 0,
        "explanation": "摘要指出，传统稀疏向量空间模型如 TF-IDF 或 BM25 是开放域问答检索的事实方法。",
        "anchor": "§1"
      },
      {
        "id": "2004.04906-ai-2",
        "paperId": "2004.04906",
        "question": "DPR 用什么结构学习问题和段落的稠密表示？",
        "options": [
          "双编码器 dual-encoder",
          "自注意力 Transformer",
          "序列到序列模型",
          "卷积神经网络"
        ],
        "answer": 0,
        "explanation": "论文使用简单的双编码器框架，从少量问题与段落中学习问题和段落的嵌入。",
        "anchor": "§2"
      },
      {
        "id": "2004.04906-ai-3",
        "paperId": "2004.04906",
        "question": "在 top-20 段落检索准确率上，DPR 比 Lucene-BM25 提升多少？",
        "options": [
          "9% 到 19%",
          "1% 到 5%",
          "50% 以上",
          "没有提升"
        ],
        "answer": 0,
        "explanation": "摘要明确说明，稠密检索器以 9%-19% 的绝对提升大幅超越 Lucene-BM25。",
        "anchor": "§3"
      }
    ]
  },
  "2002.08909": {
    "paperId": "2002.08909",
    "titleZh": "检索增强的语言模型预训练（REALM）",
    "abstractZh": "语言模型预训练能隐式记住大量世界知识，但要把更多事实装进参数，网络就得不断变大。REALM 把知识改放到模型外部：预训练、微调与推理阶段都配一个潜在检索器，从维基百科等大规模语料中取回相关文档再作答。作者首次给出该检索器的无监督预训练方法，以掩码语言建模为学习信号，并把梯度回传穿过覆盖数百万文档的检索步骤。在开放域问答的三个公开榜单上，REALM 相比显式与隐式知识存储的已有方法，绝对准确率提升 4 到 16 个百分点，同时带来可解释与模块化的好处。",
    "bigIdea": "把知识放到模型外面，用一个能训练的检索器去查，再让模型读着文档答题。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "知识到底存在哪",
        "narration": "先问你一句：珠穆朗玛峰有多高？语言模型张口就来。可这条知识到底存在哪？它被压进了网络参数里。看不见，摸不着，也说不清。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "知识存在哪？",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "珠峰有多高 → 模型张口就来",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "arrow",
            "x2": 320,
            "y2": 250,
            "at": 3400,
            "x1": 70,
            "y1": 250
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "参数里：看不见，摸不着",
            "size": 24,
            "at": 4200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "也说不出它从哪来",
            "size": 24,
            "at": 6400
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "网络越大，代价越高",
        "narration": "想让模型记住更多事实，就得把网络做得更大。参数一路膨胀，训练成本跟着涨。更麻烦的是，知识藏在里面。你查不到，改不动，只能整个重训。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "越大 ≠ 越聪明",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "参数膨胀 → 训练成本上升",
            "size": 24,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "知识埋在参数里",
            "size": 24,
            "at": 3800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "查不到 / 改不动 / 只能重训",
            "size": 24,
            "at": 6200
          }
        ]
      },
      {
        "id": "method-1",
        "kicker": "03 · 方法一",
        "title": "先去查，再回答",
        "narration": "REALM 换了个思路，给模型配一个检索器。答题前，它先去维基百科翻文档。挑出最相关的几篇，再读。模型读完再回答。知识放在外面，随时能查，也能换。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "REALM = 模型 + 检索器",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "第一步：从维基翻出文档",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "第二步：读完文档再作答",
            "size": 24,
            "at": 4000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "知识在外面：可查、可换",
            "size": 24,
            "at": 6400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 430,
            "text": "预训练 / 微调 / 推理都带上它",
            "size": 20,
            "at": 9200
          }
        ]
      },
      {
        "id": "method-2",
        "kicker": "04 · 方法二",
        "title": "让检索器自己学",
        "narration": "难点在训练：检索这一步怎么学？他们把掩码语言建模当成学习信号。模型猜对被遮的词，检索器就得分；猜错，就调整。梯度一路传回去，全程端到端。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "检索器怎么训练？",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "学习信号：掩码语言建模",
            "size": 24,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "猜对被遮的词 → 检索器得分",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "猜错 → 梯度回传，调整检索",
            "size": 24,
            "at": 6400
          },
          {
            "kind": "text",
            "x": 60,
            "y": 430,
            "text": "不用人工标注",
            "size": 20,
            "at": 9600
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "三个榜单都赢",
        "narration": "它挑的是开放域问答这个硬任务。对手分两类：显式存储和隐式存储。三个公开榜单上，它成绩都更好看。绝对准确率高出 4 到 16 个百分点。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "开放域问答：三个榜单",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "对比：显式存储 / 隐式存储",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "绝对准确率 +4 到 +16 个百分点",
            "size": 28,
            "at": 3800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "答案还能溯源到文档",
            "size": 24,
            "at": 6400
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "别把知识塞进参数",
        "narration": "一句话带走：别把知识全塞进参数。留一个能查的文档库，让模型自己去找、去读。答案有出处，换知识也不用整个重训。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 100,
            "text": "别把知识塞进参数",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "留一个能查的文档库",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "让模型学会：去找、去读",
            "size": 24,
            "at": 3800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "答案有出处，更新更容易",
            "size": 24,
            "at": 6000
          }
        ]
      }
    ],
    "diagram": {
      "headline": "把知识从参数里搬出来：REALM 的四步",
      "steps": [
        {
          "label": "检索",
          "note": "从大规模语料里取回相关文档"
        },
        {
          "label": "阅读",
          "note": "模型读完文档，再对齐问题"
        },
        {
          "label": "打分",
          "note": "掩码语言建模给检索结果当信号"
        },
        {
          "label": "端到端",
          "note": "梯度穿过检索步骤，回传到检索器"
        }
      ],
      "insight": "知识放外部，检索器可训练，模型只负责读和答。",
      "conclusions": [
        "检索器可以无监督预训练，不需要文档与答案的标注对",
        "三个开放域问答榜单上，绝对准确率提升 4 到 16 个百分点",
        "知识可定位、可替换，模型因此更可解释、更模块化"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要第二句：引入潜在知识检索器，覆盖预训练、微调、推理"
        },
        {
          "label": "§2",
          "detail": "摘要中段：首次用掩码语言建模信号无监督预训练检索器"
        },
        {
          "label": "§3",
          "detail": "摘要末段：三个 Open-QA 榜单对比显式与隐式存储方法"
        },
        {
          "label": "§4",
          "detail": "摘要结尾：可解释性与模块化等定性收益"
        }
      ]
    },
    "quiz": [
      {
        "id": "2002.08909-ai-1",
        "paperId": "2002.08909",
        "question": "REALM 把世界知识主要放在哪里？",
        "options": [
          "网络参数里",
          "模型外部的文档语料",
          "微调用的标注数据",
          "提示词模板"
        ],
        "answer": 1,
        "explanation": "它给模型配了检索器，从维基百科这类大语料里取文档，知识不再只压在参数中。",
        "anchor": "§1"
      },
      {
        "id": "2002.08909-ai-2",
        "paperId": "2002.08909",
        "question": "预训练检索器时，REALM 用什么当学习信号？",
        "options": [
          "人工标注的文档相关性",
          "掩码语言建模",
          "强化学习的奖励",
          "对比学习损失"
        ],
        "answer": 1,
        "explanation": "模型猜被遮住的词，猜得对不对就成了检索器的分数，梯度再回传到检索这一步。",
        "anchor": "§2"
      },
      {
        "id": "2002.08909-ai-3",
        "paperId": "2002.08909",
        "question": "在三个开放域问答榜单上，REALM 的绝对准确率提升是多少？",
        "options": [
          "4 到 16 个百分点",
          "1 到 2 个百分点",
          "20 到 30 个百分点",
          "没有提升"
        ],
        "answer": 0,
        "explanation": "摘要给出的数字是 4-16% absolute accuracy，对显式和隐式存储方法都占优。",
        "anchor": "§3"
      }
    ]
  },
  "2210.03629": {
    "paperId": "2210.03629",
    "titleZh": "ReAct：在语言模型（language model）中协同推理与行动",
    "abstractZh": "大语言模型（LLM）在语言理解与交互决策上表现突出，但它的推理能力与行动能力此前多被分开研究。本文提出 ReAct：让模型交替生成推理轨迹与任务动作。推理轨迹帮助模型形成、跟踪并修正行动计划，也能处理异常；动作则让模型连接知识库或环境，取回新信息。作者在问答、事实核查与交互式决策任务上做了验证，该方法优于当时的强基线，过程也更易读、更可信。",
    "bigIdea": "让模型把推理和行动交替写出来，两者互相喂养，比只做其中一件更准，也更好懂。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "它先想一句，再查一次",
        "narration": "你问它一个问题，它先想一句。接着它动手去查一次。查完再想，想完再查。它边想边查。这不是人，是一个语言模型。它自己决定下一步做什么，不用你催。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "想 + 做",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "先想一句",
            "size": 24,
            "at": 1500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "再查一次",
            "size": 24,
            "at": 3000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "查完再想，想完再查",
            "size": 28,
            "at": 5000
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "想和做，被拆成两半",
        "narration": "过去的研究把两件事分开做。推理归推理，行动归行动。会想的模型不动手。会动手的模型不想。中间那道缝，一直没人去补。它卡住了不少真实任务。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "两件事，分开研究",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "推理：链式思考",
            "size": 24,
            "at": 1800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 270,
            "text": "行动：生成动作计划",
            "size": 24,
            "at": 3600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "会想的不动手，会动手的不想",
            "size": 28,
            "at": 6000
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "把推理和动作交替写",
        "narration": "ReAct 把这两件事交替写出来。模型先写一段推理，说明打算做什么。再发出一个动作，去查资料。或者调用环境。结果回来，就接着写下一段。它这样一轮轮往下走。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "ReAct 的循环",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 200,
            "text": "一、写推理：下一步做什么",
            "size": 24,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 280,
            "text": "二、发动作：查资料或调环境",
            "size": 24,
            "at": 3800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 370,
            "text": "三、把结果写回下一段推理",
            "size": 28,
            "at": 6000
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "让两者互相喂养",
        "narration": "动作拿回来的信息，会被写进下一段推理。推理因此能改计划。也能处理意外。动作也不再是瞎试。它有了方向。这两件事互相喂养，越走越顺。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "两者互相喂养",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "动作 → 带回新事实",
            "size": 24,
            "at": 1500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "事实 → 修正计划",
            "size": 24,
            "at": 3200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 330,
            "text": "计划 → 决定下一个动作",
            "size": 24,
            "at": 4800
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "动作不再是瞎试",
            "size": 28,
            "at": 6500
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "压住幻觉，也赢下任务",
        "narration": "它只用一个维基百科接口。就压住了幻觉。错误也不再一路传下去。换成两个交互式任务，成功率还领先。只给一两个示例就够了。比模仿学习和强化学习高 34% 和 10%。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "结果",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "维基百科接口：压住幻觉",
            "size": 24,
            "at": 1500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 260,
            "text": "错误不再一路传下去",
            "size": 24,
            "at": 3200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 340,
            "text": "ALFWorld：+34%",
            "size": 28,
            "at": 5200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "WebShop：+10%",
            "size": 28,
            "at": 7000
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "想和做，是一个循环",
        "narration": "想和做不是两步，是一个循环。推理给动作指方向。动作给推理补事实。这样它更准。也更好懂。记住这个循环，就抓住了核心。它也更方便人看懂。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "想和做，是一个循环",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 210,
            "text": "推理给方向",
            "size": 28,
            "at": 1600
          },
          {
            "kind": "text",
            "x": 60,
            "y": 290,
            "text": "行动给事实",
            "size": 28,
            "at": 3200
          },
          {
            "kind": "text",
            "x": 60,
            "y": 380,
            "text": "更准，也更好懂",
            "size": 28,
            "at": 5200
          }
        ]
      }
    ],
    "diagram": {
      "headline": "ReAct：推理与行动交替，形成闭环",
      "steps": [
        {
          "label": "写出推理",
          "note": "模型先说清打算做什么，形成计划"
        },
        {
          "label": "发出动作",
          "note": "去查维基百科，或调用交互环境"
        },
        {
          "label": "取回观察",
          "note": "外部返回的信息成为新事实"
        },
        {
          "label": "修正推理",
          "note": "新事实写回推理，改计划、处理意外"
        }
      ],
      "insight": "推理负责定方向，行动负责补事实，两者交替推进，幻觉和错误累积被压住。",
      "conclusions": [
        "推理和行动不该分开研究，交替生成能互相补位",
        "接入外部信息后，链式推理的幻觉和错误传播被压住",
        "在交互式决策任务上，成功率高于模仿学习与强化学习"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要开头：推理与行动此前被当作两个独立课题研究"
        },
        {
          "label": "§2",
          "detail": "摘要中段：以交替方式生成推理轨迹与任务动作，并说明两者如何互相帮助"
        },
        {
          "label": "§3",
          "detail": "摘要末段：HotpotQA 与 Fever 上的幻觉问题，以及 ALFWorld、WebShop 上的成功率提升"
        }
      ]
    },
    "quiz": [
      {
        "id": "2210.03629-ai-1",
        "paperId": "2210.03629",
        "question": "ReAct 的核心做法是什么？",
        "options": [
          "只做链式推理，不接触外部",
          "只生成动作计划，不做推理",
          "交替生成推理轨迹和任务动作",
          "先微调模型参数，再做推理"
        ],
        "answer": 2,
        "explanation": "ReAct 让模型交替写出推理轨迹和动作，两者互相提供信息。",
        "anchor": "§2"
      },
      {
        "id": "2210.03629-ai-2",
        "paperId": "2210.03629",
        "question": "动作带回来的信息，在 ReAct 里起什么作用？",
        "options": [
          "直接当作最终答案输出",
          "写回推理，帮助修正计划和应对意外",
          "只用来给结果打分",
          "替换掉模型的部分参数"
        ],
        "answer": 1,
        "explanation": "外部返回的信息进入下一段推理，计划因此可被更新。",
        "anchor": "§2"
      },
      {
        "id": "2210.03629-ai-3",
        "paperId": "2210.03629",
        "question": "在两个交互式决策任务上，ReAct 相对模仿学习和强化学习，绝对成功率分别高出多少？",
        "options": [
          "10% 和 34%",
          "34% 和 10%",
          "43% 和 1%",
          "3.4% 和 1%"
        ],
        "answer": 1,
        "explanation": "摘要给出的顺序是先 ALFWorld 后 WebShop，对应 34% 和 10%。",
        "anchor": "§3"
      }
    ]
  },
  "2203.11171": {
    "paperId": "2203.11171",
    "titleZh": "自洽性（self-consistency）提升语言模型的链式思维推理",
    "abstractZh": "链式思维提示（chain-of-thought prompting）与大模型结合后，在复杂推理任务上已有不错表现。本文提出一种新的解码策略，自洽性（self-consistency），用来替代链式思维提示中常用的贪婪解码（greedy decoding）。它先对同一问题采样一组多样的推理路径，再把这些路径边缘化，选出最一致的答案。其直觉是：复杂问题往往有多条思路，却只通向一个正确答案。在算术与常识推理的多个基准上，它把链式思维提示的成绩显著抬高，涉及 GSM8K、SVAMP、AQuA、StrategyQA 与 ARC-challenge。",
    "bigIdea": "让它多走几条推理路，再用答案投票，比只走一条贪婪路更可靠。",
    "scenes": [
      {
        "id": "hook",
        "kicker": "01 · 钩子",
        "title": "同一道题，两个答案",
        "narration": "同一道算术题，你问模型两遍，答案可能不一样。因为它每次走的路，都不相同。这种不一致，是毛病，还是藏着机会？我们换个角度看。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "同一道题，两个答案",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 190,
            "text": "每次采样，走的路不同",
            "size": 24,
            "at": 2000
          },
          {
            "kind": "box",
            "x": 60,
            "y": 250,
            "w": 400,
            "h": 70,
            "at": 4200,
            "label": "路径 A → 答案 A"
          },
          {
            "kind": "box",
            "x": 60,
            "y": 350,
            "w": 400,
            "h": 70,
            "at": 6500,
            "label": "路径 B → 答案 B"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "不一致，是毛病还是机会？",
            "size": 24,
            "at": 9000
          }
        ]
      },
      {
        "id": "problem",
        "kicker": "02 · 问题",
        "title": "贪婪解码只走一条路",
        "narration": "现在的主流做法，是贪婪解码。模型每一步，只挑眼前最像的那一步。一步走错，后面就跟着歪。一条路，只能给出一个答案。也没有第二条备选。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "贪婪解码：只走一条路",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "box",
            "x": 60,
            "y": 180,
            "w": 420,
            "h": 70,
            "at": 2500,
            "label": "每一步只挑最像的那一步"
          },
          {
            "kind": "box",
            "x": 60,
            "y": 280,
            "w": 420,
            "h": 70,
            "at": 5000,
            "label": "一直走到结尾，没有分叉"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 390,
            "text": "一步走错，后面全歪",
            "size": 28,
            "at": 7500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 450,
            "text": "一条路径 = 一个答案",
            "size": 24,
            "at": 10000
          }
        ]
      },
      {
        "id": "method1",
        "kicker": "03 · 方法一",
        "title": "先采样多条路径",
        "narration": "他们提出一个新策略，叫自洽性。同一个问题，让模型采样出很多条路径。不只走一条。这些路可以不同，终点却应当相同。路径越多，越能看出规律。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "自洽性（self-consistency）",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 180,
            "text": "同一问题，采样多条路径",
            "size": 28,
            "at": 2500
          },
          {
            "kind": "box",
            "x": 60,
            "y": 250,
            "w": 400,
            "h": 70,
            "at": 4500,
            "label": "路径 1 … 路径 N"
          },
          {
            "kind": "text",
            "x": 60,
            "y": 370,
            "text": "路径可以不同",
            "size": 24,
            "at": 7000
          },
          {
            "kind": "text",
            "x": 420,
            "y": 370,
            "text": "终点应当相同",
            "size": 24,
            "at": 8800
          }
        ]
      },
      {
        "id": "method2",
        "kicker": "04 · 方法二",
        "title": "让答案去投票",
        "narration": "走完这些路，答案怎么定？把每条路的答案拿出来投票。票数最多的那个胜出。这等于把路径边缘化，只留下答案。思路不同，答案一致，才更可信。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 90,
            "text": "答案投票",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "box",
            "x": 60,
            "y": 180,
            "w": 360,
            "h": 60,
            "at": 2000,
            "label": "路径 1 → 答案 A"
          },
          {
            "kind": "box",
            "x": 60,
            "y": 260,
            "w": 360,
            "h": 60,
            "at": 3500,
            "label": "路径 2 → 答案 A"
          },
          {
            "kind": "box",
            "x": 60,
            "y": 340,
            "w": 360,
            "h": 60,
            "at": 5000,
            "label": "路径 3 → 答案 B"
          },
          {
            "kind": "arrow",
            "x1": 450,
            "y1": 290,
            "x2": 560,
            "y2": 290,
            "at": 6500
          },
          {
            "kind": "text",
            "x": 580,
            "y": 275,
            "text": "票多者胜出",
            "size": 28,
            "at": 8000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 440,
            "text": "把路径边缘化，只留答案",
            "size": 24,
            "at": 10500
          }
        ]
      },
      {
        "id": "result",
        "kicker": "05 · 结果",
        "title": "基准上全线上升",
        "narration": "他们在算术和常识推理的常用基准上做了测试。成绩全线上升。GSM8K 提升 17.9，SVAMP 提升 11.0，AQuA 提升 12.2。StrategyQA 涨 6.4，ARC-challenge 涨 3.9。模型没换，换的只是解码。多采样多投票，改动很小，收益明显。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 80,
            "text": "基准上的提升",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 170,
            "text": "GSM8K +17.9%",
            "size": 28,
            "at": 2000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 240,
            "text": "SVAMP +11.0%",
            "size": 24,
            "at": 3500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 300,
            "text": "AQuA +12.2%",
            "size": 24,
            "at": 5000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 360,
            "text": "StrategyQA +6.4%",
            "size": 24,
            "at": 6500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "ARC-challenge +3.9%",
            "size": 24,
            "at": 8000
          }
        ]
      },
      {
        "id": "takeaway",
        "kicker": "06 · 带走",
        "title": "别只信第一条路",
        "narration": "记住这句话：别只信模型走的第一条路。同一个问题，让它多走几条。再把答案拿来投票。答案越一致，你越该信它。这比只走一遍稳得多。",
        "duration": 15000,
        "board": [
          {
            "kind": "text",
            "x": 60,
            "y": 120,
            "text": "多走几条路",
            "size": 34,
            "weight": 600,
            "at": 0
          },
          {
            "kind": "text",
            "x": 60,
            "y": 220,
            "text": "再让答案投票",
            "size": 28,
            "at": 2500
          },
          {
            "kind": "text",
            "x": 60,
            "y": 320,
            "text": "一致 = 可信",
            "size": 28,
            "at": 5000
          },
          {
            "kind": "text",
            "x": 60,
            "y": 420,
            "text": "别只信第一条路",
            "size": 24,
            "at": 7500
          }
        ]
      }
    ],
    "diagram": {
      "headline": "自洽性：采样多条路径，投票选出答案",
      "steps": [
        {
          "label": "采样",
          "note": "同一问题，让模型走出多条不同的推理路径。"
        },
        {
          "label": "收集答案",
          "note": "每条路径只取末尾给出的最终答案。"
        },
        {
          "label": "投票",
          "note": "数票数，把路径边缘化掉，只留答案。"
        },
        {
          "label": "输出",
          "note": "票数最多的答案作为结果返回。"
        }
      ],
      "insight": "路径越分散，投票出来的答案越稳。",
      "conclusions": [
        "自洽性替换贪婪解码，不改模型，只改解码方式。",
        "它在算术与常识推理的多个基准上一致带来提升。",
        "思路可以有很多条，正确答案通常只有一个。"
      ],
      "anchors": [
        {
          "label": "§1",
          "detail": "摘要：提出 self-consistency 替代链式思维提示中的贪婪解码"
        },
        {
          "label": "§2",
          "detail": "方法部分：采样多条推理路径，再边缘化后投票"
        },
        {
          "label": "§3",
          "detail": "实验部分：GSM8K、SVAMP、AQuA、StrategyQA、ARC-challenge 的提升幅度"
        }
      ]
    },
    "quiz": [
      {
        "id": "2203.11171-ai-1",
        "paperId": "2203.11171",
        "question": "自洽性替换的是链式思维提示里的哪种解码方式？",
        "options": [
          "束搜索（beam search）",
          "贪婪解码（greedy decoding）",
          "温度采样（temperature sampling）",
          "对比解码（contrastive decoding）"
        ],
        "answer": 1,
        "explanation": "论文明确说，自洽性用来替代链式思维提示中那种只取一条路径的贪婪解码。",
        "anchor": "§1"
      },
      {
        "id": "2203.11171-ai-2",
        "paperId": "2203.11171",
        "question": "自洽性怎么定出最终答案？",
        "options": [
          "取第一条路径的答案",
          "取最长路径的答案",
          "对采样到的答案投票，选最一致的",
          "让模型自己再判一次"
        ],
        "answer": 2,
        "explanation": "它把多条路径边缘化，选票数最多、也就是最一致的那个答案。",
        "anchor": "§2"
      },
      {
        "id": "2203.11171-ai-3",
        "paperId": "2203.11171",
        "question": "按摘要给出的数字，提升幅度最大的是哪个基准？",
        "options": [
          "GSM8K",
          "SVAMP",
          "AQuA",
          "StrategyQA"
        ],
        "answer": 0,
        "explanation": "摘要里 GSM8K 提升 17.9%，高于 SVAMP 的 11.0%、AQuA 的 12.2% 与 StrategyQA 的 6.4%。",
        "anchor": "§3"
      }
    ]
  },
};
