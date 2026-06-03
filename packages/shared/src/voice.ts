import { z } from "zod";

import {
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  addDuplicateIssue,
} from "./primitives.ts";

export const VoiceCueSchema = z
  .object({
    beatId: NanoIdSchema,
    audioPath: NonEmptyStringSchema,
    actualDurationMs: PositiveIntSchema,
    provider: NonEmptyStringSchema,
    voice: NonEmptyStringSchema,
    mimeType: z.string().regex(/^audio\/[A-Za-z0-9.+-]+$/, "Expected an audio mime type"),
  })
  .strict();
export type VoiceCue = z.infer<typeof VoiceCueSchema>;

export const VoiceTrackSchema = z
  .object({
    cues: z.array(VoiceCueSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const beatIds = new Set<string>();

    value.cues.forEach((cue, index) => {
      if (beatIds.has(cue.beatId)) {
        addDuplicateIssue(ctx, ["cues", index, "beatId"], "voice cue beat ids must be unique");
      }

      beatIds.add(cue.beatId);
    });
  });

export type VoiceTrack = z.infer<typeof VoiceTrackSchema>;
