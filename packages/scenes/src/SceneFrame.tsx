import { useCurrentFrame, useVideoConfig } from "remotion";

import { theme as defaultTheme, themeFromId } from "./theme.ts";
import type { SceneFrameProps, SceneTemplateRenderContext } from "./types.ts";

const noopEmit = (_event: { type: string; payload?: Record<string, unknown> }) => undefined;

export const SceneFrame = <TProps extends Record<string, unknown>>({
  definition,
  props,
  durationInFrames,
  stepStartsMs,
  themeId,
}: SceneFrameProps<TProps>) => {
  const currentFrame = useCurrentFrame();
  const config = useVideoConfig();

  const ctx: SceneTemplateRenderContext = {
    currentFrame,
    fps: config.fps,
    durationInFrames: durationInFrames ?? config.durationInFrames,
    ...(stepStartsMs ? { stepStartsMs } : {}),
    theme: themeId ? themeFromId(themeId) : defaultTheme,
    emit: noopEmit,
  };

  return definition.render(props, ctx);
};
