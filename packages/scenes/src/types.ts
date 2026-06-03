import type { ComponentType, ReactElement, ReactNode } from "react";
import type { z } from "zod";

import type { SceneTemplateId } from "@auto/shared";

import type { SceneTheme } from "./theme.ts";

export type DurationHintsMs = {
  min: number;
  ideal: number;
  max: number;
};

export type SceneTemplateRenderContext = {
  currentFrame: number;
  fps: number;
  /** 本场景的总帧数（来自 timeline 的场景时长），用于做贯穿全场景的动画插值。 */
  durationInFrames: number;
  /** 本场景内每个 beat 的音频起始时间（相对场景起点，毫秒，按顺序）。
   *  用于把分步动画对齐到旁白音频——讲到第几句、画面就停在第几步。 */
  stepStartsMs?: number[];
  theme: SceneTheme;
  emit: (event: { type: string; payload?: Record<string, unknown> }) => void;
};

export type SceneTemplateDefinition<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  id: SceneTemplateId;
  propsSchema: z.ZodType<TProps>;
  durationHintsMs: DurationHintsMs;
  render(props: TProps, ctx: SceneTemplateRenderContext): ReactElement;
};

export type DemoDefinition = {
  id: SceneTemplateId;
  component: ComponentType;
  defaultProps: Record<string, unknown>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
};

export type SceneFrameProps<TProps extends Record<string, unknown>> = {
  definition: SceneTemplateDefinition<TProps>;
  props: TProps;
  /** 可选：本场景总帧数。缺省时回退到合成总时长（用于 demo 预览）。 */
  durationInFrames?: number;
  /** 可选：本场景内各 beat 的音频起始时间（相对场景起点，毫秒）。 */
  stepStartsMs?: number[];
  /** 可选：视觉主题 id（来自 project.theme）。缺省用默认主题。 */
  themeId?: string;
  overlay?: ReactNode;
};
