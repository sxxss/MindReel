import { motion } from "framer-motion";
import { z } from "zod";

import type { SceneTemplateDefinition } from "../types.ts";
import { NonEmptyTextSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

export const OutroPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    kicker: NonEmptyTextSchema,
    credit: NonEmptyTextSchema,
  })
  .strict();

export const Outro: SceneTemplateDefinition<z.infer<typeof OutroPropsSchema>> = {
  id: "Outro",
  propsSchema: OutroPropsSchema,
  durationHintsMs: { min: 4000, ideal: 7000, max: 10000 },
  render: (props, ctx) =>
    sceneFrame(
      ctx,
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          <div style={{ color: ctx.theme.accentCyan, fontSize: 28, marginBottom: 22 }}>{props.credit}</div>
          <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.12 }}>{props.title}</div>
          <div style={{ marginTop: 28, color: ctx.theme.muted, fontSize: 34 }}>{props.kicker}</div>
        </motion.div>
      </div>,
    ),
};
