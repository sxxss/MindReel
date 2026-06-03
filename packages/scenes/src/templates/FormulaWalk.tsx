import { motion } from "framer-motion";
import { z } from "zod";

import { ArrowDraw, HighlightToken } from "../atoms/index.ts";
import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

const TokenSchema = z.object({ id: IdSchema, text: NonEmptyTextSchema }).strict();
const TransformSchema = z.object({ id: IdSchema, fromTokenId: IdSchema, toTokenId: IdSchema, label: NonEmptyTextSchema.optional() }).strict();
const NoteSchema = z.object({ id: IdSchema, text: NonEmptyTextSchema }).strict();

export const FormulaWalkPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    tokens: z.array(TokenSchema).min(1),
    highlights: z.array(IdSchema).optional(),
    transforms: z.array(TransformSchema).optional(),
    notes: z.array(NoteSchema).optional(),
  })
  .strict();

export const FormulaWalk: SceneTemplateDefinition<z.infer<typeof FormulaWalkPropsSchema>> = {
  id: "FormulaWalk",
  propsSchema: FormulaWalkPropsSchema,
  durationHintsMs: { min: 7000, ideal: 12000, max: 18000 },
  render: (props, ctx) => {
    const hot = new Set(props.highlights ?? []);
    const tokenX = (index: number) => 420 + index * 330;

    return sceneFrame(
      ctx,
      <>
        <div
          style={{
            position: "absolute",
            left: 260,
            right: 260,
            top: 420,
            fontFamily: ctx.theme.fontMath,
            fontSize: 64,
            textAlign: "center",
          }}
        >
          {props.tokens.map((token, index) => (
            <motion.span key={token.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.18 }}>
              <HighlightToken active={hot.has(token.id)}>{token.text}</HighlightToken>
            </motion.span>
          ))}
        </div>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          {(props.transforms ?? []).map((transform, index) => {
            const fromIndex = props.tokens.findIndex((token) => token.id === transform.fromTokenId);
            const toIndex = props.tokens.findIndex((token) => token.id === transform.toTokenId);
            if (fromIndex < 0 || toIndex < 0) return null;
            return (
              <g key={transform.id}>
                <ArrowDraw from={[tokenX(fromIndex), 555]} to={[tokenX(toIndex), 555]} color={ctx.theme.accentCyan} />
                {transform.label ? (
                  <text x={(tokenX(fromIndex) + tokenX(toIndex)) / 2} y={610 + index * 42} fill={ctx.theme.accentCyan} fontSize={24} textAnchor="middle">
                    {transform.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: 330, right: 330, top: 680, color: ctx.theme.muted, fontSize: 28, textAlign: "center" }}>
          {(props.notes ?? []).map((note) => (
            <div key={note.id}>{note.text}</div>
          ))}
        </div>
      </>,
      props.title,
    );
  },
};
