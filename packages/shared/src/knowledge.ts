import { z } from "zod";

import {
  NanoIdSchema,
  NonEmptyStringSchema,
} from "./primitives.ts";

export const KnowledgeFactSchema = z
  .object({
    id: NanoIdSchema,
    claim: NonEmptyStringSchema.max(50),
    evidence: NonEmptyStringSchema,
    sourceIds: z.array(NanoIdSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.evidence !== "LLM-prior" && value.sourceIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sourced facts must reference at least one source",
        path: ["sourceIds"],
      });
    }
  });
export type KnowledgeFact = z.infer<typeof KnowledgeFactSchema>;

export const KnowledgeTermSchema = z
  .object({
    id: NanoIdSchema,
    term: NonEmptyStringSchema,
    definition: NonEmptyStringSchema,
  })
  .strict();
export type KnowledgeTerm = z.infer<typeof KnowledgeTermSchema>;

export const KnowledgeSchema = z
  .object({
    facts: z.array(KnowledgeFactSchema).min(6),
    terms: z.array(KnowledgeTermSchema).min(4),
    misconceptions: z.array(NonEmptyStringSchema).min(2),
  })
  .strict();

export type Knowledge = z.infer<typeof KnowledgeSchema>;
