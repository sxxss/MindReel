import { motion } from "framer-motion";
import { z } from "zod";

import { InkLabel, SpringFloatIn } from "../atoms/index.ts";
import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema, NormalizedPositionSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

export const TitleHookPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    subtitle: NonEmptyTextSchema,
    accents: z
      .array(
        z
          .object({
            id: IdSchema,
            label: NonEmptyTextSchema,
            x: NormalizedPositionSchema,
            y: NormalizedPositionSchema,
          })
          .strict(),
      )
      .min(1)
      .max(2),
  })
  .strict();

export const TitleHook: SceneTemplateDefinition<z.infer<typeof TitleHookPropsSchema>> = {
  id: "TitleHook",
  propsSchema: TitleHookPropsSchema,
  durationHintsMs: { min: 4000, ideal: 7000, max: 11000 },
  render: (props, ctx) =>
    sceneFrame(
      ctx,
      <>
        <SpringFloatIn
          style={{
            position: "absolute",
            left: 160,
            right: 160,
            top: 310,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.16 }}>{props.title}</div>
          <div style={{ marginTop: 28, color: ctx.theme.muted, fontSize: 34 }}>{props.subtitle}</div>
        </SpringFloatIn>
        {props.accents.map((accent, index) => (
          <motion.div
            key={accent.id}
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + index * 0.22, type: "spring", stiffness: 170 }}
          >
            <InkLabel x={accent.x} y={accent.y} color={index === 0 ? ctx.theme.accentCyan : ctx.theme.accentOrange} size={30}>
              {accent.label}
            </InkLabel>
          </motion.div>
        ))}
      </>,
    ),
};
