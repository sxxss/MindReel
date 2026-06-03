import { z } from "zod";

export const NonEmptyTextSchema = z.string().trim().min(1);
export const NormalizedPositionSchema = z.number().min(0).max(1);
export const DomainSchema = z.tuple([z.number(), z.number()]).refine(([min, max]) => min < max, {
  message: "domain min must be smaller than max",
});
export const PointSchema = z.tuple([z.number(), z.number()]);

export const IdSchema = z.string().trim().min(1);
