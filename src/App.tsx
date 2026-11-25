import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Library } from "./pages/Library";
import { ClashPage } from "./pages/ClashPage";
import { MapPage } from "./pages/MapPage";
import { PaperPage } from "./pages/PaperPage";
import { ReviewPage } from "./pages/ReviewPage";
import { CardPage } from "./pages/CardPage";
import { FeedPage } from "./pages/FeedPage";
import { SearchPage } from "./pages/SearchPage";
import { LibraryProvider, resetLibraryStorage, useLibrary } from "./lib/store";

type Route =
  | { name: "library" }
  | { name: "paper"; id: string }
  | { name: "review" }
  | { name: "card"; id: string }
  | { name: "map"; id?: string }
  | { name: "clash" }
  | { name: "search"; q: string }
  | { name: "feed" };

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/review") return { name: "review" };
  const search = path.match(/^\/search(?:\?(.*))?$/);
  if (search) {
    const q = new URLSearchParams(search[1] ?? "").get("q") ?? "";
    return { name: "search", q };
  }
  const card = path.match(/^\/card\/(.+)$/);
  if (card) return { name: "card", id: decodeURIComponent(card[1]) };
  const paper = path.match(/^\/paper\/(.+)$/);
  if (paper) return { name: "paper", id: decodeURIComponent(paper[1]) };
  const map = path.match(/^\/map(?:\/([^/]+))?$/);
  if (map) return { name: "map", id: map[1] ? decodeURIComponent(map[1]) : undefined };
  if (path === "/feed") return { name: "feed" };
  if (path === "/clash") return { name: "clash" };
  return { name: "library" };
}

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("ninety-theme", theme);
    } catch {
      /* 隐私模式下写不进去就算了 */
    }
  }, [theme]);

  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? "切换到夜间" : "切换到白天"}
      title={next === "dark" ? "切换到夜间" : "切换到白天"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--site-border)] text-[var(--site-muted)] transition-colors hover:bg-[var(--site-surface)] hover:text-[var(--site-fg)]"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

function Header({ route }: { route: Route }) {
  const { dueCount } = useLibrary();
  const libraryActive = route.name === "library" || route.name === "paper";
  const mapActive = route.name === "map";
  const clashActive = route.name === "clash";
  const reviewActive = route.name === "review";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--site-border)] bg-[var(--site-bg)]/88 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="#/" className="flex items-center gap-2.5" aria-label="九十秒 · 资料库">
          <span className="font-display flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--site-accent)] text-[15px] leading-none font-semibold text-[var(--site-on-accent)]">
            90″
          </span>
          <span className="hidden leading-none sm:block">
            <span className="font-display block text-[17px] font-semibold text-[var(--site-fg)]">
              九十秒
            </span>
            <span className="mt-1 block text-[9px] tracking-[0.24em] text-[var(--site-muted)] uppercase">
              ninety seconds
            </span>
          </span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
        <nav className="flex items-center gap-0.5 text-[13px] whitespace-nowrap sm:gap-1 sm:text-sm">
          <a
            href="#/"
            aria-current={libraryActive ? "page" : undefined}
            className={`rounded-full px-2 py-1.5 transition-colors sm:px-3.5 ${
              libraryActive
                ? "bg-[var(--site-surface)] font-medium text-[var(--site-fg)]"
                : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
            }`}
          >
            资料库
          </a>
          <a
            href="#/map"
            aria-current={mapActive ? "page" : undefined}
            className={`rounded-full px-2 py-1.5 transition-colors sm:px-3.5 ${
              mapActive
                ? "bg-[var(--site-surface)] font-medium text-[var(--site-fg)]"
                : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
            }`}
          >
            文献地图
          </a>
          <a
            href="#/clash"
            aria-current={clashActive ? "page" : undefined}
            className={`rounded-full px-2 py-1.5 transition-colors sm:px-3.5 ${
              clashActive
                ? "bg-[var(--site-surface)] font-medium text-[var(--site-fg)]"
                : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
            }`}
          >
            论文对撞
          </a>
          <a
            href="#/review"
            aria-current={reviewActive ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors sm:px-3.5 ${
              reviewActive
                ? "bg-[var(--site-surface)] font-medium text-[var(--site-fg)]"
                : "text-[var(--site-muted)] hover:text-[var(--site-fg)]"
            }`}
          >
            今日复习
            {dueCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--site-accent)] px-1 text-[10px] font-semibold text-[var(--site-on-accent)]">
                {dueCount}
              </span>
            ) : null}
          </a>
        </nav>
        <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Shell() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash]);

  const route = parseRoute(hash);

  if (route.name === "card") {
    return (
      <div className="min-h-dvh bg-[var(--site-bg)] text-[var(--site-fg)]">
        <CardPage paperId={route.id} />
      </div>
    );
  }

  // 星图页是「一屏仪表盘」：桌面端锁死视口高度、不出页脚，避免整体被往下推
  const fullBleed = route.name === "clash";

  return (
    <div
      className={`flex flex-col bg-[var(--site-bg)] text-[var(--site-fg)] ${
        fullBleed ? "min-h-dvh lg:h-dvh lg:overflow-hidden" : "min-h-dvh"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--site-bg)] focus:px-3 focus:py-2 focus:text-sm"
      >
        跳到正文
      </a>
      <Header route={route} />
      <main id="main" className={fullBleed ? "min-h-0 flex-1" : "flex-1"}>
        {route.name === "library" ? <Library /> : null}
        {route.name === "paper" ? <PaperPage paperId={route.id} /> : null}
        {route.name === "review" ? <ReviewPage /> : null}
        {route.name === "map" ? <MapPage focusId={route.id} /> : null}
        {route.name === "clash" ? <ClashPage /> : null}
        {route.name === "search" ? <SearchPage initialQuery={route.q} /> : null}
        {route.name === "feed" ? <FeedPage /> : null}
      </main>
      {route.name === "feed" ? null : (
        <footer
          className={`border-t border-[var(--site-border)] ${
            fullBleed ? "lg:hidden" : ""
          }`}
        >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-[var(--site-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="min-w-0">
            <p>九十秒 · 把论文拆成可以复述的小块。</p>
            <p className="mt-1 text-[11px] text-[var(--site-muted)]">
              © 2026 九十秒 · 原创参赛作品，转载注明来源，请勿整站镜像或商用。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p>元数据来自 arXiv 开放接口 · 微课为学习改写 · 桌面与手机均可使用</p>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("重置演示数据？会清除已导入的论文和答题记录。")) return;
                resetLibraryStorage();
                window.location.hash = "#/";
                window.location.reload();
              }}
              className="rounded-full border border-[var(--site-border)] px-2.5 py-1 text-[11px] text-[var(--site-muted)] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
            >
              重置演示
            </button>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <Shell />
    </LibraryProvider>
  );
}