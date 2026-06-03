import { getHtmlSlideTheme, HTML_SLIDE_THEME } from "@auto/shared";

export type SceneTheme = {
  background: string;
  ink: string;
  accentCyan: string;
  accentOrange: string;
  accentPink: string;
  accentGreen: string;
  muted: string;
  grid: string;
  shadow: string;
  fontSans: string;
  fontMono: string;
  fontMath: string;
};

const FONT_MATH = '"KaTeX_Main", "Times New Roman", serif';

// 由主题 id 构造 SceneTheme（色板来自 @auto/shared，保证视频/预览/导出网页一致）。
export const themeFromId = (id?: string): SceneTheme => ({
  ...getHtmlSlideTheme(id),
  fontMath: FONT_MATH,
});

// 默认主题（demo 预览、未指定主题时回退）。
export const theme: SceneTheme = {
  ...HTML_SLIDE_THEME,
  fontMath: FONT_MATH,
};
