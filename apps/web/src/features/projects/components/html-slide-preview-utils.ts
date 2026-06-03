import {
  getHtmlSlideTheme,
  HTML_SLIDE_BASE_CSS,
  htmlSlideStageBackground,
  htmlSlideThemeVars,
  stripNarrationFromHtml,
  type JsonValue,
} from "@auto/shared";

export type HtmlStep = { html: string; caption: string | undefined };
export type HtmlSlideScene = {
  sceneId: string;
  chapterId: string;
  title: string | undefined;
  steps: HtmlStep[];
};

const isRecord = (v: JsonValue): v is Record<string, JsonValue> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const asStr = (v: JsonValue | undefined): string | undefined =>
  typeof v === "string" ? v : undefined;

export function parseHtmlSlideScenes(value: JsonValue): HtmlSlideScene[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    if (asStr(raw.templateId) !== "HtmlSlide") return [];
    const rawProps: JsonValue = raw.props ?? {};
    const props = isRecord(rawProps) ? rawProps : ({} as Record<string, JsonValue>);
    const rawSteps = Array.isArray(props["steps"]) ? (props["steps"] as JsonValue[]) : [];
    const steps: HtmlStep[] = rawSteps.flatMap((s: JsonValue) => {
      if (!isRecord(s)) return [];
      const html = asStr(s["html"]);
      if (!html) return [];
      return [{ html, caption: asStr(s["caption"]) }];
    });
    if (steps.length === 0) return [];
    return [
      {
        sceneId: asStr(raw["sceneId"]) ?? "?",
        chapterId: asStr(raw["chapterId"]) ?? "?",
        title: asStr(props["title"]),
        steps,
      },
    ];
  });
}

// 用共享主题模块构建 iframe 文档，保证预览与最终视频/导出网页画面一致。
export function buildSrcdoc(step: HtmlStep, title: string | undefined, themeId?: string): string {
  const tokens = getHtmlSlideTheme(themeId);
  const rootVars = Object.entries(htmlSlideThemeVars(tokens))
    .map(([k, v]) => `${k}:${v};`)
    .join("");

  const stageHtml = `
    <div id="stage" class="hs-root" style="
      position:fixed;inset:0;width:1920px;height:1080px;transform-origin:top left;
      background:${htmlSlideStageBackground(tokens)};overflow:hidden;padding:64px;
    ">
      ${title ? `<div style="position:absolute;left:80px;top:56px;font-size:40px;font-weight:700;color:var(--ink);">${title}</div>` : ""}
      <div id="slide-area" style="position:absolute;left:64px;right:64px;top:${title ? "130px" : "64px"};bottom:${step.caption ? "150px" : "64px"};display:flex;align-items:center;justify-content:center;">
        <div id="slide-fit" style="width:100%;transform-origin:center center;">
        ${stripNarrationFromHtml(step.html, step.caption)}
        </div>
      </div>
      ${step.caption ? `<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:56px;max-width:1500px;padding:16px 28px;border-radius:14px;background:rgba(5,7,13,0.78);border:1px solid var(--grid);color:var(--ink);font-size:26px;text-align:center;">${step.caption}</div>` : ""}
    </div>
  `;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
:root{${rootVars}}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${tokens.background};overflow:hidden;}
${HTML_SLIDE_BASE_CSS}
</style></head><body>
${stageHtml}
<script>
function scale(){const s=Math.min(window.innerWidth/1920,window.innerHeight/1080);document.getElementById('stage').style.transform='scale('+s+')';}
function fit(){const a=document.getElementById('slide-area'),f=document.getElementById('slide-fit');if(!a||!f)return;f.style.transform='';const s=Math.min(1,a.clientHeight/f.scrollHeight,a.clientWidth/f.scrollWidth);if(s<0.999)f.style.transform='scale('+s+')';}
scale();fit();window.addEventListener('resize',scale);
</script>
</body></html>`;
}
