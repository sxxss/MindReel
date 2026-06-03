import { z } from "zod";

import {
  IsoDateTimeStringSchema,
  JsonObjectSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
} from "./primitives.ts";

export const ArtifactKindSchema = z.enum([
  "knowledge",
  "curriculum",
  "script",
  "scene-spec",
  "voice-track",
  "timeline",
  "render",
  "qa-report",
]);
export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;

export const ArtifactCreatedBySchema = z.enum(["agent", "human"]);
export type ArtifactCreatedBy = z.infer<typeof ArtifactCreatedBySchema>;

export const ArtifactRefSchema = z
  .object({
    kind: ArtifactKindSchema,
    version: PositiveIntSchema,
    createdAt: IsoDateTimeStringSchema,
    createdBy: ArtifactCreatedBySchema,
    parentVersion: PositiveIntSchema.optional(),
  })
  .strict();
export type ArtifactRef = z.infer<typeof ArtifactRefSchema>;

export const PipelineJobKindSchema = z.enum([
  "research",
  "curriculum",
  "script",
  "scene-spec",
  "voice",
  "timeline",
  "render",
  "qa",
  "autopilot",
]);
export type PipelineJobKind = z.infer<typeof PipelineJobKindSchema>;

export const PipelineJobStatusSchema = z.enum([
  "pending",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);
export type PipelineJobStatus = z.infer<typeof PipelineJobStatusSchema>;

export const PipelineJobSchema = z
  .object({
    id: NanoIdSchema,
    projectId: NanoIdSchema,
    kind: PipelineJobKindSchema,
    status: PipelineJobStatusSchema,
    createdAt: IsoDateTimeStringSchema,
    updatedAt: IsoDateTimeStringSchema,
    parentArtifactVersion: PositiveIntSchema.optional(),
    artifactRef: ArtifactRefSchema.optional(),
    options: JsonObjectSchema.optional(),
    errorMessage: NonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "failed" && value.errorMessage === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "failed jobs must include an error message",
        path: ["errorMessage"],
      });
    }
  });
export type PipelineJob = z.infer<typeof PipelineJobSchema>;

export const PipelineEventLevelSchema = z.enum(["debug", "info", "warn", "error"]);
export type PipelineEventLevel = z.infer<typeof PipelineEventLevelSchema>;

export const PipelineEventSchema = z
  .object({
    id: NanoIdSchema,
    jobId: NanoIdSchema,
    type: NonEmptyStringSchema,
    level: PipelineEventLevelSchema,
    message: NonEmptyStringSchema,
    createdAt: IsoDateTimeStringSchema,
    data: JsonObjectSchema.optional(),
    artifactRef: ArtifactRefSchema.optional(),
  })
  .strict();
export type PipelineEvent = z.infer<typeof PipelineEventSchema>;
