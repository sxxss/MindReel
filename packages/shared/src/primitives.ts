import { z } from "zod";

export type JsonPrimitive = boolean | number | string;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export const NonEmptyStringSchema = z.string().trim().min(1);

export const IsoDateTimeStringSchema = z.string().refine(
  (value) => value.includes("T") && !Number.isNaN(Date.parse(value)),
  "Expected an ISO 8601 datetime string",
);

export const NanoIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{6,64}$/, "Expected a nanoid-like identifier");

export const PositiveIntSchema = z.number().int().positive();

export const DurationMsSchema = z.number().int().nonnegative();

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.array(JsonValueSchema),
    JsonObjectSchema,
  ]),
);

export const JsonObjectSchema: z.ZodType<JsonObject> = z.lazy(() =>
  z.record(JsonValueSchema),
);

export const addDuplicateIssue = (
  ctx: z.RefinementCtx,
  path: (string | number)[],
  message: string,
) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message,
    path,
  });
};
