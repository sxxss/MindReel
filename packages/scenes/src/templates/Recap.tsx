import { motion } from "framer-motion";
import { z } from "zod";

import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { panelStyle, sceneFrame } from "./shared.tsx";

const BulletSchema = z.object({ id: IdSchema, icon: NonEmptyTextSchema, text: NonEmptyTextSchema }).strict();

export const RecapPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    bullets: z.array(BulletSchema).min(1).max(3),
  })
  .strict();

const iconFor = (icon: string) => (icon === "check" ? "✓" : icon === "spark" ? "✦" : "•");

export const Recap: SceneTemplateDefinition<z.infer<typeof RecapPropsSchema>> = {
  id: "Recap",
  propsSchema: RecapPropsSchema,
  durationHintsMs: { min: 5000, ideal: 8000, max: 12000 },
  render: (props, ctx) =>
    sceneFrame(
      ctx,
      <div style={{ position: "absolute", left: 390, right: 390, top: 300, display: "grid", gap: 28 }}>
        {props.bullets.map((bullet, index) => (
          <motion.div key={bullet.id} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.22 }} style={{ ...panelStyle(ctx), display: "grid", gridTemplateColumns: "82px 1fr", alignItems: "center", padding: 30 }}>
            <div style={{ width: 54, height: 54, borderRadius: 999, background: index === 1 ? ctx.theme.accentOrange : ctx.theme.accentCyan, color: ctx.theme.background, display: "grid", placeItems: "center", fontSize: 34, fontWeight: 900 }}>{iconFor(bullet.icon)}</div>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{bullet.text}</div>
          </motion.div>
        ))}
      </div>,
      props.title,
    ),
};
