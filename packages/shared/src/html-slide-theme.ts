// HtmlSlide 的主题系统 — 单一事实来源。
// 被 packages/scenes（视频渲染）、server（交互网页导出）、apps/web（预览）共用，
// 保证「视频 / 预览 / 导出网页」三处画面完全一致。
//
// 关键：LLM 写的 HTML 只引用 CSS 变量（var(--cyan) 等），baseCss 的所有色调也基于这些
// 变量用 color-mix 推导。因此「换主题 = 换一组变量值」，连已生成的旧项目都能直接换肤、
// 无需重新生成内容。

import { z } from "zod";

export type HtmlSlideThemeTokens = {
  background: string;
  ink: string;
  accentCyan: string; // 主 accent（baseCss 的面板/高亮色调都基于它）
  accentOrange: string;
  accentPink: string;
  accentGreen: string;
  muted: string;
  grid: string;
  shadow: string;
  fontSans: string;
  fontMono: string;
};

const FONT_SANS = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
const FONT_MONO = '"JetBrains Mono", "SFMono-Regular", monospace';

// ── 四套精选主题（均为深色底，配字幕条/外框）──────────────────────────────────
export const HTML_SLIDE_THEMES = {
  // 深空科技（默认）：藏蓝底 + 青/橙/粉/绿
  "deep-space": {
    background: "#0e1430",
    ink: "#f1f5fb",
    accentCyan: "#34d8ef",
    accentOrange: "#ffb24d",
    accentPink: "#f472d0",
    accentGreen: "#3ddc97",
    muted: "#9fb0c9",
    grid: "rgba(159, 176, 201, 0.26)",
    shadow: "rgba(5, 9, 26, 0.55)",
    fontSans: FONT_SANS,
    fontMono: FONT_MONO,
  },
  // 极光：近黑墨绿 + теal/薄荷/青柠
  aurora: {
    background: "#081512",
    ink: "#eafff6",
    accentCyan: "#2dd4bf",
    accentOrange: "#a3e635",
    accentPink: "#5eead4",
    accentGreen: "#34d399",
    muted: "#8fb8aa",
    grid: "rgba(140, 200, 178, 0.24)",
    shadow: "rgba(2, 14, 10, 0.58)",
    fontSans: FONT_SANS,
    fontMono: FONT_MONO,
  },
  // 暖阳：暖棕黑底 + 琥珀/珊瑚/金/玫瑰
  sunset: {
    background: "#1a1208",
    ink: "#fff4e8",
    accentCyan: "#ffb24d", // 主色改为琥珀，面板整体偏暖
    accentOrange: "#ff7a59",
    accentPink: "#f9a8d4",
    accentGreen: "#fcd34d",
    muted: "#c9a98f",
    grid: "rgba(201, 169, 143, 0.26)",
    shadow: "rgba(26, 12, 5, 0.6)",
    fontSans: FONT_SANS,
    fontMono: FONT_MONO,
  },
  // 极简：炭灰底 + 单一蓝主色（专业克制）
  mono: {
    background: "#14171c",
    ink: "#f4f6f8",
    accentCyan: "#6ea8fe",
    accentOrange: "#cbd5e1",
    accentPink: "#94a3b8",
    accentGreen: "#5eead4",
    muted: "#9aa3ad",
    grid: "rgba(148, 163, 184, 0.24)",
    shadow: "rgba(5, 8, 12, 0.55)",
    fontSans: FONT_SANS,
    fontMono: FONT_MONO,
  },
} as const satisfies Record<string, HtmlSlideThemeTokens>;

export type HtmlSlideThemeId = keyof typeof HTML_SLIDE_THEMES;

export const HTML_SLIDE_THEME_IDS = Object.keys(HTML_SLIDE_THEMES) as HtmlSlideThemeId[];

export const HtmlSlideThemeIdSchema = z.enum(
  HTML_SLIDE_THEME_IDS as [HtmlSlideThemeId, ...HtmlSlideThemeId[]],
);

export const HTML_SLIDE_THEME_LABELS: Record<HtmlSlideThemeId, string> = {
  "deep-space": "深空科技",
  aurora: "极光",
  sunset: "暖阳",
  mono: "极简",
};

export const DEFAULT_HTML_SLIDE_THEME_ID: HtmlSlideThemeId = "deep-space";

// 向后兼容：旧代码引用的默认主题 tokens。
export const HTML_SLIDE_THEME = HTML_SLIDE_THEMES[DEFAULT_HTML_SLIDE_THEME_ID];

export const getHtmlSlideTheme = (id?: string): HtmlSlideThemeTokens =>
  (id && id in HTML_SLIDE_THEMES
    ? HTML_SLIDE_THEMES[id as HtmlSlideThemeId]
    : HTML_SLIDE_THEMES[DEFAULT_HTML_SLIDE_THEME_ID]);

// LLM 有时会把旁白原句也画进画面 HTML（即便提示词禁止），导致出现「两条字幕」
// （画面里一条 + SubtitleTrack 一条）。这里在渲染/导出前，把与旁白逐字（或仅末尾标点不同）
// 重复的整句从 HTML 文本里剔除。确定性、0 token，且对已生成的旧项目也生效。
const stripPunct = (s: string): string => s.replace(/[。，、！？；：,.!?;:\s]+$/u, "").trim();

export const stripNarrationFromHtml = (html: string, ...narrations: Array<string | undefined>): string => {
  let out = html;
  for (const raw of narrations) {
    const n = raw?.trim();
    if (!n || n.length < 8) continue;
    out = out.split(n).join("");
    const np = stripPunct(n);
    if (np.length >= 8 && np !== n) {
      out = out.split(np).join("");
    }
  }
  return out;
};

// 注入给 HTML 使用的主题 CSS 变量声明（用于 :root 或容器 style）。
export const htmlSlideThemeVars = (t: HtmlSlideThemeTokens = HTML_SLIDE_THEME): Record<string, string> => ({
  "--ink": t.ink,
  "--muted": t.muted,
  "--bg": t.background,
  "--cyan": t.accentCyan,
  "--orange": t.accentOrange,
  "--pink": t.accentPink,
  "--green": t.accentGreen,
  "--grid": t.grid,
  "--shadow": t.shadow,
  "--font-sans": t.fontSans,
  "--font-mono": t.fontMono,
});

// 舞台背景渐变（深色，配 accent 光晕，跟随主题色）。
export const htmlSlideStageBackground = (t: HtmlSlideThemeTokens = HTML_SLIDE_THEME): string =>
  `radial-gradient(1200px 700px at 18% 8%, color-mix(in srgb, ${t.accentCyan} 12%, transparent), transparent 55%), ` +
  `radial-gradient(1000px 600px at 92% 96%, color-mix(in srgb, ${t.accentPink} 9%, transparent), transparent 55%), ` +
  `linear-gradient(165deg, color-mix(in srgb, ${t.background} 82%, white) 0%, ${t.background} 55%, color-mix(in srgb, ${t.background} 72%, black) 100%)`;

// 基础 CSS：工具类 + 入场动画类。所有色调用 color-mix 基于 var(--cyan/orange/...) 推导，
// 因此完全跟随主题。入场动画由 --hs-t (0→1) 驱动（视频里按帧、网页里按 transition），无 @keyframes。
export const HTML_SLIDE_BASE_CSS = `
.hs-root,.hs-root *{box-sizing:border-box;margin:0;padding:0;}
.hs-root{font-size:30px;font-family:var(--font-sans);color:var(--ink);width:100%;height:100%;}
.hs-root code,.hs-root pre,.hs-root .mono{font-family:var(--font-mono);}
.hs-panel{border:1px solid var(--grid);border-radius:20px;background:linear-gradient(160deg,color-mix(in srgb,var(--cyan) 8%,transparent),color-mix(in srgb,var(--bg) 80%,#05070d));box-shadow:0 22px 60px var(--shadow);padding:26px;}
.hs-cell{display:inline-flex;align-items:center;justify-content:center;min-width:108px;min-height:108px;font-size:46px;font-weight:700;border:2px solid var(--grid);border-radius:18px;background:linear-gradient(160deg,color-mix(in srgb,#ffffff 5%,transparent),color-mix(in srgb,var(--bg) 72%,#05070d));}
.hs-cell.active{border-color:var(--cyan);background:linear-gradient(160deg,color-mix(in srgb,var(--cyan) 28%,transparent),color-mix(in srgb,var(--cyan) 8%,transparent));box-shadow:0 0 0 4px color-mix(in srgb,var(--cyan) 18%,transparent);}
.hs-code{font-size:28px;line-height:1.75;}
.hs-code .line{padding:2px 14px;border-left:4px solid transparent;border-radius:8px;white-space:pre;}
.hs-code .line.active{border-left-color:var(--cyan);background:color-mix(in srgb,var(--cyan) 16%,transparent);color:var(--cyan);}
.hs-badge{display:inline-block;padding:10px 24px;border-radius:999px;border:1px solid var(--cyan);background:color-mix(in srgb,var(--cyan) 14%,transparent);color:var(--cyan);font-size:30px;font-weight:600;}
.hs-badge.warn{border-color:var(--orange);background:color-mix(in srgb,var(--orange) 16%,transparent);color:var(--orange);}
.hs-badge.ok{border-color:var(--green);background:color-mix(in srgb,var(--green) 16%,transparent);color:var(--green);}
.hs-chip{display:inline-flex;align-items:center;gap:10px;padding:10px 20px;border-radius:14px;border:1px solid var(--grid);background:color-mix(in srgb,var(--bg) 60%,transparent);font-size:28px;}

/* ── 入场动画工具类（--hs-t 0→1 驱动，可加 --hs-delay 做错位）─────────────── */
.hs-enter {
  opacity: clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1);
  transform: translateY(calc((1 - clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1)) * 28px));
}
.hs-pop {
  opacity: clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1);
  transform: scale(calc(0.88 + clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1) * 0.12));
}
.hs-slide-left {
  opacity: clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1);
  transform: translateX(calc((1 - clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1)) * -36px));
}
.hs-glow {
  opacity: clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1);
  filter: drop-shadow(0 0 calc(clamp(0, calc((var(--hs-t, 1) - var(--hs-delay, 0)) * 2.5), 1) * 18px) var(--cyan));
}
`;
