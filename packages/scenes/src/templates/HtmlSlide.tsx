import type React from "react";
import { z } from "zod";
import { interpolate } from "remotion";
import { HTML_SLIDE_BASE_CSS, htmlSlideStageBackground, stripNarrationFromHtml } from "@auto/shared";

import type { SceneTemplateDefinition, SceneTemplateRenderContext } from "../types.ts";
import { NonEmptyTextSchema } from "./schemas.ts";

const HtmlStepSchema = z
  .object({
    // 本步骤的自包含 HTML（只用内联样式或下面注入的主题 CSS 变量/工具类）。
    html: NonEmptyTextSchema,
    caption: NonEmptyTextSchema.optional(),
  })
  .strict();

export const HtmlSlidePropsSchema = z
  .object({
    title: NonEmptyTextSchema.optional(),
    steps: z.array(HtmlStepSchema).min(1).max(12),
  })
  .strict();

type HtmlSlideProps = z.infer<typeof HtmlSlidePropsSchema>;

// 注入给 LLM 写的 HTML 使用的主题变量 + 一小套工具类（统一质感、降低 AI 味）。
const themeVars = (ctx: SceneTemplateRenderContext): Record<string, string> => ({
  "--ink": ctx.theme.ink,
  "--muted": ctx.theme.muted,
  "--bg": ctx.theme.background,
  "--cyan": ctx.theme.accentCyan,
  "--orange": ctx.theme.accentOrange,
  "--pink": ctx.theme.accentPink,
  "--green": ctx.theme.accentGreen,
  "--grid": ctx.theme.grid,
  "--shadow": ctx.theme.shadow,
  "--font-sans": ctx.theme.fontSans,
  "--font-mono": ctx.theme.fontMono,
});

// baseCss 已抽到 @auto/shared（视频/预览/导出网页共用同一份），这里直接引用。
const baseCss = HTML_SLIDE_BASE_CSS;

export const HtmlSlide: SceneTemplateDefinition<HtmlSlideProps> = {
  id: "HtmlSlide",
  propsSchema: HtmlSlidePropsSchema,
  durationHintsMs: { min: 5000, ideal: 10000, max: 18000 },
  render: (props, ctx) => {
    const count = props.steps.length;
    const fps = ctx.fps || 30;
    const sceneDurMs = (ctx.durationInFrames / fps) * 1000;
    const tMs = (ctx.currentFrame / fps) * 1000;

    // 关键：把每一步对齐到旁白音频的 beat 时间（讲到第几句、就停在第几步），
    // 而不是按场景时长均分——这样画面和讲解严格同步。无 stepStartsMs 时回退均分。
    const beatStarts = ctx.stepStartsMs;
    const stepStartMsOf = (s: number): number => {
      if (beatStarts && beatStarts.length > 0) {
        const beatIdx = Math.min(beatStarts.length - 1, Math.floor((s * beatStarts.length) / count));
        return beatStarts[beatIdx]!;
      }
      return (s * sceneDurMs) / count;
    };
    let stepIndex = 0;
    while (stepIndex + 1 < count && stepStartMsOf(stepIndex + 1) <= tMs) {
      stepIndex += 1;
    }
    const stepStartMs = stepStartMsOf(stepIndex);
    const stepEndMs = stepIndex + 1 < count ? stepStartMsOf(stepIndex + 1) : sceneDurMs;
    const localT = Math.min(1, Math.max(0, (tMs - stepStartMs) / Math.max(1, stepEndMs - stepStartMs)));
    const TRANSITION = 0.16; // 进入新步的前 16% 做交叉淡入淡出
    const enterT = localT < TRANSITION ? localT / TRANSITION : 1;
    const step = props.steps[stepIndex]!;
    const prev = stepIndex > 0 ? props.steps[stepIndex - 1] : undefined;

    // 每步的局部入场进度：从 step 开始 0→1，在 localT=0.4 时达到 1。
    // 注入为 CSS 变量 --hs-t，供 .hs-enter/.hs-pop/.hs-slide-left/.hs-glow 类使用。
    // 值故意不与 TRANSITION 耦合：过渡做整步淡入，--hs-t 做各元素错位入场。
    const hsT = interpolate(localT, [0, 0.4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const stepLayer = (html: string, opacity: number, translateY: number, scale: number, ht?: number) => (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          ...(ht !== undefined ? ({ "--hs-t": String(ht) } as React.CSSProperties) : {}),
        }}
      >
        {/* 注入 HTML 的宿主：给一个「明确满尺寸 + 定位上下文 + 居中」的盒子，
            这样 LLM 写的 height:100% / position:absolute 都能正常工作（避免高度塌成 0
            导致 overflow:hidden 把整屏裁空），短内容则居中显示。 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );

    return (
      <div
        className="hs-root"
        style={{
          ...themeVars(ctx),
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: htmlSlideStageBackground(ctx.theme),
          overflow: "hidden",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: baseCss }} />
        {props.title ? (
          <div style={{ position: "absolute", left: 80, top: 56, fontSize: 40, fontWeight: 700 }}>
            {props.title}
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: props.title ? 130 : 64,
            // 底部留出 ~170px 给 SubtitleTrack 旁白字幕条（视频里字幕由 SubtitleTrack 统一渲染，
            // 这里不再画 step.caption，避免出现「两条字幕」）。
            bottom: 170,
          }}
        >
          {prev !== undefined && enterT < 1
            ? stepLayer(stripNarrationFromHtml(prev.html, prev.caption), 1 - enterT, 0, 1, 1)
            : null}
          {stepLayer(
            stripNarrationFromHtml(step.html, step.caption),
            enterT,
            (1 - enterT) * 18,
            0.985 + enterT * 0.015,
            hsT,
          )}
        </div>
      </div>
    );
  },
};
