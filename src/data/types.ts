export type TopicId =
  | "foundation"
  | "efficient"
  | "generative"
  | "retrieval"
  | "reasoning";

export interface Topic {
  id: TopicId;
  name: string;
  note: string;
}

export type PaperStatus = "ready" | "queued";

export interface Paper {
  id: string;
  title: string;
  titleZh: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
  abstractZh: string;
  topics: TopicId[];
  addedAt: string;
  status: PaperStatus;
  sourceUrl: string;
}

export type Ink = "chalk" | "dim" | "accent" | "mint";

interface BoardBase {
  at?: number;
  ink?: Ink;
}

export interface BoardText extends BoardBase {
  kind: "text";
  x: number;
  y: number;
  text: string;
  size?: number;
  weight?: number;
  anchor?: "start" | "middle" | "end";
}

export interface BoardArrow extends BoardBase {
  kind: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  head?: boolean;
  dashed?: boolean;
}

export interface BoardBox extends BoardBase {
  kind: "box";
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  sub?: string;
  dashed?: boolean;
}

export interface BoardCircle extends BoardBase {
  kind: "circle";
  cx: number;
  cy: number;
  r: number;
  label?: string;
}

export interface BoardFormula extends BoardBase {
  kind: "formula";
  x: number;
  y: number;
  text: string;
  size?: number;
}

export interface BoardPath extends BoardBase {
  kind: "path";
  d: string;
}

export type BoardElement =
  | BoardText
  | BoardArrow
  | BoardBox
  | BoardCircle
  | BoardFormula
  | BoardPath;

export interface FollowUp {
  question: string;
  answer: string;
  anchor?: string;
}

export interface Scene {
  id: string;
  kicker: string;
  title: string;
  narration: string;
  duration: number;
  board: BoardElement[];
  followups?: FollowUp[];
}

export interface DiagramStep {
  label: string;
  note: string;
}

export interface SourceAnchor {
  label: string;
  detail: string;
}

export interface CourseDiagram {
  headline: string;
  steps: DiagramStep[];
  insight: string;
  conclusions: string[];
  anchors: SourceAnchor[];
}

export interface QuizCard {
  id: string;
  paperId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  anchor: string;
}

// —— 太奶模式：手写课稿的生活类比版（标题 + 口播，duration/板书/数字与标准版一致） ——

export interface GrandmaScene {
  title: string;
  narration: string;
}

export interface Course {
  paperId: string;
  bigIdea: string;
  titleZh?: string;
  abstractZh?: string;
  scenes: Scene[];
  diagram: CourseDiagram;
  quiz: QuizCard[];
  grandma?: {
    scenes: GrandmaScene[];
  };
}

// —— 读表卡（带我读懂这张表） ——

export interface TableCell {
  /** 列索引，对应 TableReadingCard.columns 的顺序 */
  col: number;
  /** 展示文本（保留原始单位与写法） */
  text: string;
  /** 是否为缺失值（原表中为 "—" 或未报告） */
  missing?: boolean;
  /** 是否为重点高亮数据（选对后用于解释比较） */
  highlight?: boolean;
}

export interface TableRow {
  /** 行标签（模型名） */
  label: string;
  cells: TableCell[];
  /** 是否为关键对照行（如 Transformer big） */
  emphasis?: boolean;
}

export interface TableColumn {
  /** 表头名 */
  name: string;
  /** 单位说明，如 "BLEU" / "FLOPs" */
  unit?: string;
}

export interface TableReadQuestion {
  /** 问题文本，必须看表才能回答 */
  prompt: string;
  /** 候选：格式为 "行标签｜列名"，供用户点选 */
  options: string[];
  /** 正确选项下标 */
  answer: number;
  /** 选错时的提示（指向"再看哪个表头"） */
  wrongHint: string;
  /** 选对后的两段中文解释 */
  explain: [string, string];
}

export interface TableBoundaryQuestion {
  /** 问题：这张表不能证明什么 */
  prompt: string;
  /** 区分"实验观察"与"作者推断" */
  observation: string;
  inference: string;
}

export interface TableReadingCard {
  paperId: string;
  /** 表号，如 "Table 2" */
  tableId: string;
  /** 表标题（原文译文） */
  title: string;
  /** 表来源版本，如 "arXiv:1706.03762v7" */
  sourceVersion: string;
  /** 原文入口 */
  sourceUrl: string;
  /** 据原表节选说明 */
  excerptNote: string;
  columns: TableColumn[];
  rows: TableRow[];
  /** 第一问：必须看表才能回答 */
  question: TableReadQuestion;
  /** 第二问：这张表不能证明什么 */
  boundary: TableBoundaryQuestion;
  /** 读表要点卡（保存要点图）的内容 */
  takeaway: {
    /** 一句「怎么比」：哪一行 vs 哪一行、看哪个表头 */
    compare: string;
    /** 一句「别看走眼」：这张表的坑 */
    pitfall: string;
  };
  /** 返回时关联的场景下标（对应 Course.scenes 的顺序） */
  relatedSceneIndex: number;
  /** 返回时关联的场景标题，用于按钮文案 */
  relatedSceneTitle: string;
}

export type Grade = "known" | "fuzzy" | "forgot";

export interface AnswerRecord {
  cardId: string;
  paperId: string;
  grade: Grade;
  at: string;
  chosen?: number;
}