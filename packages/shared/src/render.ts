import { z } from "zod";

import {
  DurationMsSchema,
  IsoDateTimeStringSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from "./primitives.ts";
import { ProjectSchema } from "./project.ts";
import { SceneSpecListSchema } from "./scene.ts";
import { TimelineSchema } from "./timeline.ts";
import { VoiceTrackSchema } from "./voice.ts";

export const RENDER_FPS = 30;
export const RENDER_WIDTH = 1920;
export const RENDER_HEIGHT = 1080;

export const RenderCompositionInputSchema = z
  .object({
    project: ProjectSchema,
    sceneSpecs: SceneSpecListSchema,
    voiceTrack: VoiceTrackSchema,
    timeline: TimelineSchema,
  })
  .strict();
export type RenderCompositionInput = z.infer<typeof RenderCompositionInputSchema>;

export const RenderArtifactSchema = z
  .object({
    projectId: NanoIdSchema,
    outputPath: NonEmptyStringSchema,
    relativePath: NonEmptyStringSchema,
    durationMs: DurationMsSchema,
    fps: z.literal(RENDER_FPS),
    width: z.literal(RENDER_WIDTH),
    height: z.literal(RENDER_HEIGHT),
    renderedAt: IsoDateTimeStringSchema,
  })
  .strict();
export type RenderArtifact = z.infer<typeof RenderArtifactSchema>;

export const RenderRequestSchema = z
  .object({
    projectId: NanoIdSchema,
    outputPath: NonEmptyStringSchema.optional(),
    parentTimelineVersion: PositiveIntSchema.optional(),
  })
  .strict();
export type RenderRequest = z.infer<typeof RenderRequestSchema>;
