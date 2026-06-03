import { z } from "zod";

import {
  DurationMsSchema,
  IsoDateTimeStringSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
} from "./primitives.ts";

const QaScoreSchema = z.number().min(0).max(5);

export const QAMediaInfoSchema = z
  .object({
    durationMs: DurationMsSchema,
    hasAudio: z.boolean(),
    audioCodec: NonEmptyStringSchema.optional(),
    averageBitrate: z.number().nonnegative().optional(),
  })
  .strict();
export type QAMediaInfo = z.infer<typeof QAMediaInfoSchema>;

export const QADurationCheckSchema = z
  .object({
    expectedMs: DurationMsSchema,
    actualMs: DurationMsSchema,
    toleranceMs: DurationMsSchema,
    ok: z.boolean(),
  })
  .strict();
export type QADurationCheck = z.infer<typeof QADurationCheckSchema>;

export const QAAudioCheckSchema = z
  .object({
    ok: z.boolean(),
    message: NonEmptyStringSchema,
  })
  .strict();
export type QAAudioCheck = z.infer<typeof QAAudioCheckSchema>;

export const QAFrameStatSchema = z
  .object({
    sceneId: NanoIdSchema,
    framePath: NonEmptyStringSchema,
    sampledAtMs: DurationMsSchema,
    brightnessMean: z.number().min(0).max(255),
    brightnessVariance: z.number().nonnegative(),
    nonEmpty: z.boolean(),
  })
  .strict();
export type QAFrameStat = z.infer<typeof QAFrameStatSchema>;

export const QAChapterScoreSchema = z
  .object({
    sceneId: NanoIdSchema,
    title: NonEmptyStringSchema,
    rhythm: QaScoreSchema,
    visualDensity: QaScoreSchema,
    narrationFit: QaScoreSchema,
    suggestions: z.array(NonEmptyStringSchema),
  })
  .strict();
export type QAChapterScore = z.infer<typeof QAChapterScoreSchema>;

export const QAReportSchema = z
  .object({
    projectId: NanoIdSchema,
    renderPath: NonEmptyStringSchema,
    checkedAt: IsoDateTimeStringSchema,
    media: QAMediaInfoSchema,
    duration: QADurationCheckSchema,
    audio: QAAudioCheckSchema,
    frames: z.array(QAFrameStatSchema).min(1),
    chapterScores: z.array(QAChapterScoreSchema).min(1),
    overallScore: QaScoreSchema,
    suggestions: z.array(NonEmptyStringSchema),
    warnings: z.array(NonEmptyStringSchema),
  })
  .strict();
export type QAReport = z.infer<typeof QAReportSchema>;
