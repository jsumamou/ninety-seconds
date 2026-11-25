# 九十秒

把 arXiv 论文读成 90 秒微课：粘一个编号，自动归入主题；精选论文提供口播 + 板书微课、一页机制图解、三道自测卡。每条结论标出原文位置，方便回到论文核对。

线上站点：https://ninety-seconds.app.workbuddy.host/?sharecode=SBW6HOROFI （公开演示）

> 本项目为参赛原创作品：可浏览、可 fork 学习，但不得复制后另投比赛或 1:1 复刻，详见 [LICENSE](LICENSE)。

## 演示路径

1. 进「论文对撞」（`#/clash`）——十五颗星球、五个主题簇；灰线是引用延伸，红线是六对最容易搞混的论文。点任意一颗星球看右侧详情。
2. 进入《Attention Is All You Need》的 90 秒微课，点播放——六幕板书逐笔出现，可开朗读、点「本段重放」。
3. 切到「自测卡」答完三题，再打开「今日复习」——答错的卡片已进入队列，按错题优先复习。
4. 打开单篇的「原文图表」——55 张图 + 45 张表直接取自 arXiv HTML 版，可跳回原文核对。

检索页（`#/search`）一次取 30 篇：浏览器直连 OpenAlex 的 arXiv 收录，中文关键词按 `src/lib/query.ts` 的术语表自动转英文，被限流时退避重试。

**已知限制**：检索进来的新论文点「生成 90 秒微课」需要后端 `/functions/v1/app`，纯静态部署下会提示「生成服务未接入」；15 篇预置论文的课稿不受影响。

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