// 「论文对撞」星图布局：5 个主题簇，每簇 3 篇论文。
// 原始坐标按 1000×740 手工排布；大屏上横向放宽到约 1280，
// 簇心与星点同步按 X 缩放（半径不变，簇间距只增不减，不会重叠）。
// 只负责位置与连线，不改动 clashPairs 的内容。

export interface ClusterLayout {
  topic: string;
  cx: number;
  cy: number;
  r: number;
}

const X = 1.28;

export const CANVAS = { w: Math.round(1000 * X), h: 740 };

const RAW_CLUSTERS: ClusterLayout[] = [
  { topic: "foundation", cx: 215, cy: 195, r: 145 },
  { topic: "efficient", cx: 555, cy: 165, r: 132 },
  { topic: "generative", cx: 845, cy: 235, r: 143 },
  { topic: "retrieval", cx: 300, cy: 545, r: 145 },
  { topic: "reasoning", cx: 675, cy: 570, r: 148 },
];

export const CLUSTERS: ClusterLayout[] = RAW_CLUSTERS.map((cluster) => ({
  ...cluster,
  cx: cluster.cx * X,
}));

// 论文在星图上的落点（手工微调，保证落在所属簇的圆内、彼此不重叠）
const RAW_STAR_POS: Record<string, { x: number; y: number }> = {
  "1706.03762": { x: 215, y: 218 },
  "2005.14165": { x: 140, y: 148 },
  "2001.08361": { x: 300, y: 140 },

  "2205.14135": { x: 497, y: 110 },
  "2106.09685": { x: 596, y: 132 },
  "2305.14314": { x: 538, y: 228 },

  "1406.2661": { x: 790, y: 158 },
  "2006.11239": { x: 900, y: 172 },
  "2112.10752": { x: 826, y: 296 },

  "2004.04906": { x: 238, y: 484 },
  "2005.11401": { x: 372, y: 512 },
  "2002.08909": { x: 296, y: 616 },

  "2201.11903": { x: 615, y: 512 },
  "2210.03629": { x: 740, y: 542 },
  "2203.11171": { x: 648, y: 646 },
};

export const STAR_POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  Object.entries(RAW_STAR_POS).map(([id, pos]) => [id, { x: pos.x * X, y: pos.y }]),
);

// 稳定散列：同一对节点每次弯曲方向一致，避免重渲染时连线乱跳
function bendOf(a: string, b: string, base: number) {
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 33 + key.charCodeAt(i)) % 9973;
  const sign = h % 2 === 0 ? 1 : -1;
  return sign * (base + (h % (base + 6)));
}

export function curvePath(a: { x: number; y: number }, b: { x: number; y: number }, bend: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export { bendOf };
