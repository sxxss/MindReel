import { z } from "zod";

import {
  DurationMsSchema,
  JsonObjectSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  addDuplicateIssue,
} from "./primitives.ts";

export const SceneTemplateIdSchema = z.enum([
  "TitleHook",
  "NumberLine",
  "CartesianPlane",
  "GraphNetwork",
  "FormulaWalk",
  "ProcessSteps",
  "CompareTwoCol",
  "CodeFocus",
  "PointerArray",
  "HtmlSlide",
  "Recap",
  "Outro",
]);
export type SceneTemplateId = z.infer<typeof SceneTemplateIdSchema>;

export const CameraModeSchema = z.enum(["focus", "zoom", "pan"]);
export type CameraMode = z.infer<typeof CameraModeSchema>;

export const AnimationOpKindSchema = z.enum([
  "enter",
  "exit",
  "move",
  "morph",
  "highlight",
  "trace",
  "annotate",
]);
export type AnimationOpKind = z.infer<typeof AnimationOpKindSchema>;

export const AnimationOpSchema = z
  .object({
    id: NanoIdSchema,
    kind: AnimationOpKindSchema,
    targetRef: NonEmptyStringSchema,
    fromState: JsonObjectSchema.optional(),
    toState: JsonObjectSchema.optional(),
    ease: NonEmptyStringSchema,
    durationMs: PositiveIntSchema,
  })
  .strict();
export type AnimationOp = z.infer<typeof AnimationOpSchema>;

export const ShotSchema = z
  .object({
    id: NanoIdSchema,
    beatRefs: z.array(NanoIdSchema).min(1),
    anchorTimeMs: DurationMsSchema,
    durationMs: PositiveIntSchema,
    camera: CameraModeSchema,
    animationOps: z.array(AnimationOpSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const animationIds = new Set<string>();

    value.animationOps.forEach((op, index) => {
      if (animationIds.has(op.id)) {
        addDuplicateIssue(
          ctx,
          ["animationOps", index, "id"],
          "animation op ids must be unique within a shot",
        );
      }

      animationIds.add(op.id);
    });
  });
export type Shot = z.infer<typeof ShotSchema>;

export const SceneSpecSchema = z
  .object({
    chapterId: NanoIdSchema,
    sceneId: NanoIdSchema,
    templateId: SceneTemplateIdSchema,
    props: JsonObjectSchema,
    shots: z.array(ShotSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const shotIds = new Set<string>();

    value.shots.forEach((shot, index) => {
      if (shotIds.has(shot.id)) {
        addDuplicateIssue(ctx, ["shots", index, "id"], "shot ids must be unique");
      }

      shotIds.add(shot.id);
    });
  });

export type SceneSpec = z.infer<typeof SceneSpecSchema>;

export const SceneSpecListSchema = z.array(SceneSpecSchema).min(1);
export type SceneSpecList = z.infer<typeof SceneSpecListSchema>;
