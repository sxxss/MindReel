import { z } from "zod";

import {
  IsoDateTimeStringSchema,
  NanoIdSchema,
  NonEmptyStringSchema,
} from "./primitives.ts";

export const SourceDocumentKindSchema = z.enum(["text", "markdown", "url"]);
export type SourceDocumentKind = z.infer<typeof SourceDocumentKindSchema>;

export const SourceDocumentSchema = z
  .object({
    id: NanoIdSchema,
    kind: SourceDocumentKindSchema,
    title: NonEmptyStringSchema,
    body: NonEmptyStringSchema,
    url: z.string().url().optional(),
    digest: NonEmptyStringSchema,
    createdAt: IsoDateTimeStringSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.kind === "url" && value.url === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "url sources must provide a url",
        path: ["url"],
      });
    }
  });

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
