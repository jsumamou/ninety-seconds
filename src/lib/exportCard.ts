export function wrapText(text: string, perLine: number, maxLines: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const lines: string[] = [];
  let rest = clean;
  while (rest && lines.length < maxLines) {
    lines.push(rest.slice(0, perLine));
    rest = rest.slice(perLine);
  }
  if (rest && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = `${last.slice(0, Math.max(1, perLine - 1))}…`;
  }
  return lines;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export type ExportOutcome = "ok" | "svg-fallback" | "failed";

/** 1080×1440 学习卡导出链路：SVG 序列化 → canvas 栅格化 → PNG 下载；失败时回退为新标签打开 SVG */
export async function exportSvgAsPng(
  svg: SVGSVGElement,
  width: number,
  height: number,
  filename: string,
): Promise<ExportOutcome> {
  const source = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  const rendered = await new Promise<HTMLCanvasElement | null>((resolve) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
  URL.revokeObjectURL(url);
  if (!rendered) {
    window.open(URL.createObjectURL(svgBlob), "_blank", "noopener");
    return "svg-fallback";
  }
  const png = await new Promise<Blob | null>((resolve) => rendered.toBlob(resolve, "image/png"));
  if (!png) {
    window.open(URL.createObjectURL(svgBlob), "_blank", "noopener");
    return "svg-fallback";
  }
  downloadBlob(png, filename);
  return "ok";
}
