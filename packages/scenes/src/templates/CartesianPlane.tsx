import { z } from "zod";

import { AnimatedPath, ArrowDraw, Crosshair } from "../atoms/index.ts";
import type { SceneTemplateDefinition } from "../types.ts";
import { DomainSchema, IdSchema, NonEmptyTextSchema, PointSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

const CurveSchema = z
  .object({
    id: IdSchema,
    points: z.array(PointSchema).min(2),
    label: NonEmptyTextSchema.optional(),
  })
  .strict();

const VectorSchema = z
  .object({
    id: IdSchema,
    from: PointSchema,
    to: PointSchema,
    label: NonEmptyTextSchema.optional(),
  })
  .strict();

const AnnotationSchema = z
  .object({
    id: IdSchema,
    text: NonEmptyTextSchema,
    at: PointSchema,
  })
  .strict();

export const CartesianPlanePropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    xDomain: DomainSchema,
    yDomain: DomainSchema,
    curves: z.array(CurveSchema).min(1),
    vectors: z.array(VectorSchema).optional(),
    annotations: z.array(AnnotationSchema).optional(),
  })
  .strict();

const xOf = (x: number, domain: [number, number]) => 280 + ((x - domain[0]) / (domain[1] - domain[0])) * 1320;
const yOf = (y: number, domain: [number, number]) => 820 - ((y - domain[0]) / (domain[1] - domain[0])) * 560;
const pathFor = (points: [number, number][], xDomain: [number, number], yDomain: [number, number]) =>
  points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${xOf(x, xDomain)} ${yOf(y, yDomain)}`).join(" ");

export const CartesianPlane: SceneTemplateDefinition<z.infer<typeof CartesianPlanePropsSchema>> = {
  id: "CartesianPlane",
  propsSchema: CartesianPlanePropsSchema,
  durationHintsMs: { min: 6000, ideal: 11000, max: 16000 },
  render: (props, ctx) =>
    sceneFrame(
      ctx,
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        {Array.from({ length: 9 }, (_, i) => 280 + i * 165).map((x) => (
          <line key={`vx-${x}`} x1={x} y1={250} x2={x} y2={820} stroke={ctx.theme.grid} />
        ))}
        {Array.from({ length: 6 }, (_, i) => 260 + i * 112).map((y) => (
          <line key={`hy-${y}`} x1={280} y1={y} x2={1600} y2={y} stroke={ctx.theme.grid} />
        ))}
        <line x1={280} y1={820} x2={1600} y2={820} stroke={ctx.theme.ink} strokeWidth={4} />
        <line x1={280} y1={250} x2={280} y2={820} stroke={ctx.theme.ink} strokeWidth={4} />
        {props.curves.map((curve, index) => (
          <g key={curve.id}>
            <AnimatedPath d={pathFor(curve.points, props.xDomain, props.yDomain)} stroke={index === 0 ? ctx.theme.accentCyan : ctx.theme.accentOrange} strokeWidth={5} delay={index * 0.2} />
            {curve.label ? (
              <text x={1500} y={285 + index * 42} fill={index === 0 ? ctx.theme.accentCyan : ctx.theme.accentOrange} fontSize={28}>
                {curve.label}
              </text>
            ) : null}
          </g>
        ))}
        {(props.vectors ?? []).map((vector) => (
          <g key={vector.id}>
            <ArrowDraw from={[xOf(vector.from[0], props.xDomain), yOf(vector.from[1], props.yDomain)]} to={[xOf(vector.to[0], props.xDomain), yOf(vector.to[1], props.yDomain)]} color={ctx.theme.accentOrange} />
            {vector.label ? (
              <text x={xOf(vector.to[0], props.xDomain) + 16} y={yOf(vector.to[1], props.yDomain) - 16} fill={ctx.theme.accentOrange} fontSize={26}>
                {vector.label}
              </text>
            ) : null}
          </g>
        ))}
        {(props.annotations ?? []).map((annotation) => (
          <g key={annotation.id}>
            <Crosshair x={xOf(annotation.at[0], props.xDomain)} y={yOf(annotation.at[1], props.yDomain)} color={ctx.theme.accentGreen} />
            <text x={xOf(annotation.at[0], props.xDomain) + 28} y={yOf(annotation.at[1], props.yDomain) - 28} fill={ctx.theme.ink} fontSize={26}>
              {annotation.text}
            </text>
          </g>
        ))}
      </svg>,
      props.title,
    ),
};
