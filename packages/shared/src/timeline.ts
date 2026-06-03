import { z } from "zod";

import { AnimationOpKindSchema } from "./scene.ts";
import {
  DurationMsSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from "./primitives.ts";

export const SubtitleCueSchema = z
  .object({
    beatId: NanoIdSchema,
    text: NonEmptyStringSchema,
    startMs: DurationMsSchema,
    endMs: PositiveIntSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.endMs <= value.startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "subtitle cue endMs must be greater than startMs",
        path: ["endMs"],
      });
    }
  });
export type SubtitleCue = z.infer<typeof SubtitleCueSchema>;

export const TimelineAnimationSchema = z
  .object({
    id: NanoIdSchema,
    kind: AnimationOpKindSchema,
    targetRef: NonEmptyStringSchema,
    startMs: DurationMsSchema,
    endMs: PositiveIntSchema,
    squeezeFactor: z.number().positive().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.endMs <= value.startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "animation endMs must be greater than startMs",
        path: ["endMs"],
      });
    }
  });
export type TimelineAnimation = z.infer<typeof TimelineAnimationSchema>;

export const TimelineShotSchema = z
  .object({
    shotId: NanoIdSchema,
    startMs: DurationMsSchema,
    endMs: PositiveIntSchema,
    animations: z.array(TimelineAnimationSchema).min(1),
    subtitleCues: z.array(SubtitleCueSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.endMs <= value.startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "timeline shot endMs must be greater than startMs",
        path: ["endMs"],
      });
    }
  });
export type TimelineShot = z.infer<typeof TimelineShotSchema>;

export const TimelineSceneSchema = z
  .object({
    sceneId: NanoIdSchema,
    startMs: DurationMsSchema,
    endMs: PositiveIntSchema,
    shots: z.array(TimelineShotSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.endMs <= value.startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "timeline scene endMs must be greater than startMs",
        path: ["endMs"],
      });
    }
  });
export type TimelineScene = z.infer<typeof TimelineSceneSchema>;

export const TimelineWarningCodeSchema = z.enum([
  "scene-duration-drift",
  "animation-overflow",
  "project-duration-drift",
]);
export type TimelineWarningCode = z.infer<typeof TimelineWarningCodeSchema>;

export const TimelineWarningSchema = z
  .object({
    code: TimelineWarningCodeSchema,
    message: NonEmptyStringSchema,
    sceneId: NanoIdSchema.optional(),
    shotId: NanoIdSchema.optional(),
  })
  .strict();
export type TimelineWarning = z.infer<typeof TimelineWarningSchema>;

export const TimelineSchema = z
  .object({
    durationMs: PositiveIntSchema,
    scenes: z.array(TimelineSceneSchema).min(1),
    warnings: z.array(TimelineWarningSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    const lastSceneEndMs = value.scenes.reduce(
      (maxEndMs, scene) => Math.max(maxEndMs, scene.endMs),
      0,
    );

    if (value.durationMs < lastSceneEndMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "timeline durationMs must cover the last scene endMs",
        path: ["durationMs"],
      });
    }
  });

export type Timeline = z.infer<typeof TimelineSchema>;
