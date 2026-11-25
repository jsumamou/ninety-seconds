// 判断「生成服务」在不在。
//
// 线上是纯静态部署（WorkBuddy 静态托管），`/functions/v1/app` 并不存在，
// 请求会命中 404 页面（text/html）。之前直接 response.json() 解析 HTML，
// 于是报出「服务返回的内容读不懂」这种看不出原因的错误。
// 这里用一次极轻量的探测把「有没有后端」这件事先确定下来。

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

export function hasGenerationBackend(): Promise<boolean> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch("/functions/v1/app?action=ping", {
        signal: AbortSignal.timeout(4000),
      });
      const type = response.headers.get("content-type") ?? "";
      // 只要对方用 JSON 回话，就说明函数在跑（哪怕这个 action 返回 400）
      cached = type.toLowerCase().includes("application/json");
    } catch {
      cached = false;
    } finally {
      inflight = null;
    }
    return cached ?? false;
  })();

  return inflight;
}

export const NO_BACKEND_MESSAGE =
  "当前线上是纯静态版本，没有接生成服务，所以这篇还生成不了（资料库里 15 篇内置论文的课稿都是提前生成好的，可以直接看）。";
