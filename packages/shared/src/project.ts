import { z } from "zod";

import { HtmlSlideThemeIdSchema, DEFAULT_HTML_SLIDE_THEME_ID } from "./html-slide-theme.ts";
import { ArtifactRefSchema } from "./job.ts";
import {
  IsoDateTimeStringSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
} from "./primitives.ts";
import { SourceDocumentSchema } from "./source.ts";

const artifactSnapshotSchema = <
  TKind extends
    | "knowledge"
    | "curriculum"
    | "script"
    | "scene-spec"
    | "voice-track"
    | "timeline"
    | "render"
    | "qa-report",
>(
  kind: TKind,
) =>
  ArtifactRefSchema.superRefine((value, ctx) => {
    if (value.kind !== kind) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `artifact snapshot kind must be ${kind}`,
        path: ["kind"],
      });
    }
  });

export const ProjectStatusSchema = z.enum(["draft", "active", "archived"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectLatestArtifactsSchema = z
  .object({
    knowledge: artifactSnapshotSchema("knowledge").optional(),
    curriculum: artifactSnapshotSchema("curriculum").optional(),
    script: artifactSnapshotSchema("script").optional(),
    "scene-spec": artifactSnapshotSchema("scene-spec").optional(),
    "voice-track": artifactSnapshotSchema("voice-track").optional(),
    timeline: artifactSnapshotSchema("timeline").optional(),
    render: artifactSnapshotSchema("render").optional(),
    qaReport: artifactSnapshotSchema("qa-report").optional(),
  })
  .strict();
export type ProjectLatestArtifacts = z.infer<typeof ProjectLatestArtifactsSchema>;

export const ProjectSchema = z
  .object({
    id: NanoIdSchema,
    title: NonEmptyStringSchema,
    topic: NonEmptyStringSchema,
    audience: NonEmptyStringSchema,
    durationTargetSeconds: z.number().int().min(60).max(240),
    language: z.literal("zh-CN").default("zh-CN"),
    theme: HtmlSlideThemeIdSchema.default(DEFAULT_HTML_SLIDE_THEME_ID),
    sources: z.array(SourceDocumentSchema),
    createdAt: IsoDateTimeStringSchema,
    updatedAt: IsoDateTimeStringSchema,
    status: ProjectStatusSchema,
    latestArtifacts: ProjectLatestArtifactsSchema,
  })
  .strict();

export type Project = z.infer<typeof ProjectSchema>;
