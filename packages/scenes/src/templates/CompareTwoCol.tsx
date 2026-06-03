import { motion } from "framer-motion";
import { z } from "zod";

import { FadeStrike } from "../atoms/index.ts";
import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { panelStyle, sceneFrame } from "./shared.tsx";

const RowSchema = z.object({ id: IdSchema, left: NonEmptyTextSchema, right: NonEmptyTextSchema, emphasis: z.boolean().optional() }).strict();

export const CompareTwoColPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    leftTitle: NonEmptyTextSchema,
    rightTitle: NonEmptyTextSchema,
    rows: z.array(RowSchema).min(1).max(5),
  })
  .strict();

export const CompareTwoCol: SceneTemplateDefinition<z.infer<typeof CompareTwoColPropsSchema>> = {
  id: "CompareTwoCol",
  propsSchema: CompareTwoColPropsSchema,
  durationHintsMs: { min: 6000, ideal: 10000, max: 15000 },
  render: (props, ctx) =>
    sceneFrame(
      ctx,
      <div style={{ position: "absolute", left: 220, right: 220, top: 275, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
        {[props.leftTitle, props.rightTitle].map((title, columnIndex) => (
          <div key={title} style={{ ...panelStyle(ctx), padding: 28 }}>
            <div style={{ color: columnIndex === 0 ? ctx.theme.accentCyan : ctx.theme.accentOrange, fontSize: 30, fontWeight: 800 }}>{title}</div>
            <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
              {props.rows.map((row, rowIndex) => (
                <motion.div key={`${row.id}-${columnIndex}`} initial={{ opacity: 0, x: columnIndex === 0 ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: rowIndex * 0.18 + columnIndex * 0.14 }} style={{ borderTop: `1px solid ${ctx.theme.grid}`, paddingTop: 16, fontSize: 25, lineHeight: 1.42 }}>
                  {columnIndex === 0 ? row.left : <FadeStrike active={row.emphasis === true}>{row.right}</FadeStrike>}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>,
      props.title,
    ),
};
