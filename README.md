# 九十秒

把 arXiv 论文读成 90 秒微课：粘一个编号，自动归入主题；精选论文提供口播 + 板书微课、一页机制图解、三道自测卡。每条结论标出原文位置，方便回到论文核对。

线上站点：https://ninety-seconds-3ki7ns7ndm3.qoder.zone （当前为私有访问）

## 演示路径

1. 打开首页，在输入框粘贴 `1706.03762`，点「加入资料库」——新增论文自动归类，并可直接生成微课。
2. 进入《Attention Is All You Need》的 90 秒微课，点播放——六幕板书逐笔出现，可开朗读、点「本段重放」。
3. 切到「自测卡」答完三题，再打开「今日复习」——答错的卡片已进入队列，按错题优先复习。

想看「现场生成」：打开资料库里没有预置课稿的 `2006.11239`，点「生成 90 秒微课」；生成结果存在本机，刷新后仍在。

## 本地开发

Node 需满足 `package.json` 的版本要求（`^22.13.0 || >=24.0.0`）：

```sh
npm ci
npm run dev
```

构建静态产物：

```sh
NODE_OPTIONS=--max-old-space-size=4096 npm run build
npm run preview
```

前端只发同源请求到 `/functions/v1/app`，密钥不会进入浏览器代码。

## 目录

- `src/data/courses.ts`：4 份手写课稿（产品基准，六幕总时长严格 90000ms）
- `src/pages/`：资料库、论文页、复习页、学习卡页
- `src/components/`：播放器、板书、图解、自测卡
- `src/lib/generated.ts`：生成课稿的本地缓存（`jsm:generated:v1`，最多 20 篇）
- `functions/handler.ts`：arXiv 元数据接口 + 课稿生成接口
- `functions/ai-course.ts`：提示词、模型通道与 Course 校验

## 生成接口

`GET ?action=course&id=1706.03762` → `{ ok, course, cached, model }`；失败返回 400/404/502/503 与 `{ ok:false, error, message }`。生成结果同时包含中文标题与摘要（`titleZh` / `abstractZh`），前端优先使用中文版本。课稿进内存缓存，key 为 `${model}:${id}:v1`，TTL 1 小时。

模型通道按顺序选择：`LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`（OpenAI 兼容）→ Qoder 托管（站点后端注入的 `QODER_PAT`）→ 都不可用时返回 `llm_not_configured`，不伪造课稿。

站点处于私有访问时，部署环境的 Function 会被网关以 401 拦截，线上生成链路尚未实测；本地仅验证了失败态与重试提示。

当前实际通道：优先 OpenAI 兼容端点，未配置时走 Qoder 托管（QODER_PAT），线上生成待站点开放后实测。