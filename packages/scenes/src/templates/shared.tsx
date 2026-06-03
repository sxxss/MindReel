import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";

import type { SceneTemplateRenderContext } from "../types.ts";

/**
 * 帧驱动的入场样式（淡入 + 轻微上移）。用它替代 framer-motion，
 * 保证在 Remotion 逐帧渲染（含单帧 still）下确定性可见。
 */
export const enterStyle = (
  ctx: SceneTemplateRenderContext,
  delayFrames = 0,
  fromY = 24,
): CSSProperties => {
  const t = interpolate(ctx.currentFrame, [delayFrames, delayFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity: t, transform: `translateY(${(1 - t) * fromY}px)` };
};

/** 场景播放进度 0..1（帧驱动）。 */
export const sceneProgress = (ctx: SceneTemplateRenderContext) =>
  ctx.durationInFrames <= 1 ? 1 : Math.min(1, Math.max(0, ctx.currentFrame / ctx.durationInFrames));

/**
 * 随场景时间在 count 个元素间推进，返回当前激活下标。
 * 头尾各留一点边距，避免一开场就跳到第二个、或太早走完。
 */
export const activeIndex = (ctx: SceneTemplateRenderContext, count: number, lead = 0.06) => {
  if (count <= 1) {
    return 0;
  }
  const p = sceneProgress(ctx);
  const adjusted = Math.max(0, (p - lead) / (1 - lead));
  return Math.min(count - 1, Math.floor(adjusted * count));
};

export const stageStyle = (ctx: SceneTemplateRenderContext): CSSProperties => ({
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  background: `radial-gradient(circle at top, rgba(110, 231, 214, 0.08), transparent 40%), ${ctx.theme.background}`,
  color: ctx.theme.ink,
  fontFamily: ctx.theme.fontSans,
});

export const chrome = (ctx: SceneTemplateRenderContext, title?: string, caption?: string) => (
  <>
    {title ? (
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 64,
          fontSize: 42,
          fontWeight: 700,
          color: ctx.theme.ink,
        }}
      >
        {title}
      </div>
    ) : null}
    {caption ? (
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 118,
          fontSize: 20,
          color: ctx.theme.muted,
        }}
      >
        {caption}
      </div>
    ) : null}
  </>
);

export const sceneFrame = (ctx: SceneTemplateRenderContext, content: ReactNode, title?: string, caption?: string) => (
  <div style={stageStyle(ctx)}>
    {chrome(ctx, title, caption)}
    <div
      style={{
        position: "absolute",
        inset: 48,
        border: `1px solid ${ctx.theme.grid}`,
        borderRadius: 24,
      }}
    />
    {content}
  </div>
);

export const panelStyle = (ctx: SceneTemplateRenderContext) => ({
  borderRadius: 18,
  border: `1px solid ${ctx.theme.grid}`,
  background: "rgba(15, 23, 42, 0.55)",
  boxShadow: `0 18px 48px ${ctx.theme.shadow}`,
});
