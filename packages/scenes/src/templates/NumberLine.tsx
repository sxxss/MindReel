import { motion } from "framer-motion";
import { z } from "zod";

import { Tick } from "../atoms/index.ts";
import type { SceneTemplateDefinition } from "../types.ts";
import { DomainSchema, IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

const NumberLinePointSchema = z
  .object({
    id: IdSchema,
    value: z.number(),
    label: NonEmptyTextSchema,
  })
  .strict();

export const NumberLinePropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    domain: DomainSchema,
    ticks: z.array(z.number()).min(2),
    points: z.array(NumberLinePointSchema).min(1),
    cursorValue: z.number(),
    highlightRange: DomainSchema.optional(),
  })
  .strict();

const toX = (value: number, domain: [number, number]) => 260 + ((value - domain[0]) / (domain[1] - domain[0])) * 1400;

export const NumberLine: SceneTemplateDefinition<z.infer<typeof NumberLinePropsSchema>> = {
  id: "NumberLine",
  propsSchema: NumberLinePropsSchema,
  durationHintsMs: { min: 5000, ideal: 9000, max: 14000 },
  render: (props, ctx) => {
    const y = 560;
    const cursorX = toX(props.cursorValue, props.domain);

    return sceneFrame(
      ctx,
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        <line x1={240} y1={y} x2={1680} y2={y} stroke={ctx.theme.ink} strokeWidth={5} strokeLinecap="round" />
        {props.highlightRange ? (
          <motion.line
            x1={toX(props.highlightRange[0], props.domain)}
            y1={y}
            x2={toX(props.highlightRange[1], props.domain)}
            y2={y}
            stroke={ctx.theme.accentCyan}
            strokeWidth={14}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.85, pathLength: 1 }}
          />
        ) : null}
        {props.ticks.map((tick) => (
          <g key={tick}>
            <Tick x={toX(tick, props.domain)} y={y} color={ctx.theme.muted} />
            <text x={toX(tick, props.domain)} y={y + 54} fill={ctx.theme.muted} fontSize={24} textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}
        {props.points.map((point, index) => (
          <motion.g key={point.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.18 }}>
            <circle cx={toX(point.value, props.domain)} cy={y} r={13} fill={ctx.theme.accentOrange} />
            <text x={toX(point.value, props.domain)} y={y - 38} fill={ctx.theme.ink} fontSize={28} textAnchor="middle">
              {point.label}
            </text>
          </motion.g>
        ))}
        <motion.g initial={{ x: toX(props.domain[0], props.domain) }} animate={{ x: cursorX }} transition={{ duration: 1.1, ease: "easeInOut" }}>
          <path d={`M 0 ${y - 92} L -22 ${y - 38} L 22 ${y - 38} Z`} fill={ctx.theme.accentCyan} />
          <line x1={0} y1={y - 32} x2={0} y2={y + 32} stroke={ctx.theme.accentCyan} strokeWidth={4} />
        </motion.g>
      </svg>,
      props.title,
    );
  },
};
