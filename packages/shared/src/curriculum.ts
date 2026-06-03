import { z } from "zod";

import {
  NanoIdSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  addDuplicateIssue,
} from "./primitives.ts";

export const ChapterKindSchema = z.enum([
  "hook",
  "concept",
  "derivation",
  "example",
  "recap",
]);
export type ChapterKind = z.infer<typeof ChapterKindSchema>;

export const ChapterSchema = z
  .object({
    id: NanoIdSchema,
    title: NonEmptyStringSchema,
    learningGoal: NonEmptyStringSchema,
    expectedSeconds: PositiveIntSchema,
    kind: ChapterKindSchema,
  })
  .strict();
export type Chapter = z.infer<typeof ChapterSchema>;

export const CurriculumSchema = z
  .object({
    title: NonEmptyStringSchema,
    objective: NonEmptyStringSchema,
    prerequisites: z.array(NonEmptyStringSchema),
    chapters: z.array(ChapterSchema).min(5),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    const kinds = new Set<ChapterKind>();

    value.chapters.forEach((chapter, index) => {
      if (ids.has(chapter.id)) {
        addDuplicateIssue(ctx, ["chapters", index, "id"], "chapter ids must be unique");
      }

      ids.add(chapter.id);
      kinds.add(chapter.kind);
    });

    ChapterKindSchema.options.forEach((kind) => {
      if (!kinds.has(kind)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `curriculum must include a ${kind} chapter`,
          path: ["chapters"],
        });
      }
    });
  });

export type Curriculum = z.infer<typeof CurriculumSchema>;
