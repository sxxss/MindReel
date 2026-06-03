import { z } from "zod";

import {
  DurationMsSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
  addDuplicateIssue,
} from "./primitives.ts";

export const ScriptBeatSchema = z
  .object({
    id: NanoIdSchema,
    text: NonEmptyStringSchema,
    notes: NonEmptyStringSchema,
    pauseAfterMs: DurationMsSchema,
    emphasisTerms: z.array(NonEmptyStringSchema),
  })
  .strict();
export type ScriptBeat = z.infer<typeof ScriptBeatSchema>;
export type ScriptBeatId = ScriptBeat["id"];

export const ScriptSegmentSchema = z
  .object({
    chapterId: NanoIdSchema,
    beats: z.array(ScriptBeatSchema).min(1),
  })
  .strict();
export type ScriptSegment = z.infer<typeof ScriptSegmentSchema>;

export const ScriptSchema = z
  .object({
    segments: z.array(ScriptSegmentSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const beatIds = new Set<string>();

    value.segments.forEach((segment, segmentIndex) => {
      segment.beats.forEach((beat, beatIndex) => {
        if (beatIds.has(beat.id)) {
          addDuplicateIssue(
            ctx,
            ["segments", segmentIndex, "beats", beatIndex, "id"],
            "beat ids must be unique across the entire script",
          );
        }

        beatIds.add(beat.id);
      });
    });
  });

export type Script = z.infer<typeof ScriptSchema>;
