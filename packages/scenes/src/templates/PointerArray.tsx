import { interpolate } from "remotion";
import { z } from "zod";

import type { SceneTemplateDefinition, SceneTemplateRenderContext } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { sceneFrame } from "./shared.tsx";

const PointerColorSchema = z.enum(["cyan", "orange", "pink", "green"]);

const PointerSchema = z
  .object({
    id: IdSchema,
    label: NonEmptyTextSchema,
    color: PointerColorSchema.optional(),
    // 指针依次停留的格子下标（0 起）。随场景时间在这些下标之间平滑移动。
    stops: z.array(z.number().int().min(0)).min(1),
  })
  .strict();

export const PointerArrayPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    cells: z
      .array(z.object({ id: IdSchema, label: NonEmptyTextSchema }).strict())
      .min(2)
      .max(12),
    pointers: z.array(PointerSchema).min(1).max(3),
    caption: NonEmptyTextSchema.optional(),
  })
  .strict();

type PointerArrayProps = z.infer<typeof PointerArrayPropsSchema>;

const COLOR_BY_NAME = (ctx: SceneTemplateRenderContext) =>
  ({
    cyan: ctx.theme.accentCyan,
    orange: ctx.theme.accentOrange,
    pink: ctx.theme.accentPink,
    green: ctx.theme.accentGreen,
  }) as const;

const DEFAULT_ORDER = ["cyan", "orange", "pink"] as const;

// 离散步进：每个 stop 占一个等长时间槽，指针在槽内“停在格子上”，
// 仅在进入新槽的前 ~22% 时间里快速滑动过去——干炼、像翻页而不是一直滑。
const STEP_TRANSITION = 0.22;
const stepIndex = (stops: number[], currentFrame: number, durationInFrames: number) => {
  if (stops.length === 1) {
    return stops[0]!;
  }
  const slot = durationInFrames / stops.length;
  const k = Math.min(stops.length - 1, Math.max(0, Math.floor(currentFrame / slot)));
  if (k === 0) {
    return stops[0]!;
  }
  const localT = (currentFrame - k * slot) / slot; // 0..1 在本槽内的进度
  return interpolate(localT, [0, STEP_TRANSITION], [stops[k - 1]!, stops[k]!], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const PointerArray: SceneTemplateDefinition<PointerArrayProps> = {
  id: "PointerArray",
  propsSchema: PointerArrayPropsSchema,
  durationHintsMs: { min: 5000, ideal: 10000, max: 16000 },
  render: (props, ctx) => {
    const colorMap = COLOR_BY_NAME(ctx);
    const count = props.cells.length;
    const trackLeft = 240;
    const trackRight = 1680;
    const trackWidth = trackRight - trackLeft;
    const cellGap = 18;
    const cellWidth = Math.min(170, (trackWidth - cellGap * (count - 1)) / count);
    const totalWidth = cellWidth * count + cellGap * (count - 1);
    const startX = (1920 - totalWidth) / 2;
    const cellY = 470;
    const cellHeight = 130;
    const cellCenterX = (index: number) => startX + index * (cellWidth + cellGap) + cellWidth / 2;

    const activeIndices = new Set(
      props.pointers.map((pointer) =>
        Math.round(stepIndex(pointer.stops, ctx.currentFrame, ctx.durationInFrames)),
      ),
    );

    return sceneFrame(
      ctx,
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        {props.cells.map((cell, index) => {
          const active = activeIndices.has(index);
          return (
            <g key={cell.id}>
              <rect
                x={startX + index * (cellWidth + cellGap)}
                y={cellY}
                width={cellWidth}
                height={cellHeight}
                rx={14}
                fill={active ? "rgba(110,231,214,0.16)" : "rgba(15,23,42,0.55)"}
                stroke={active ? ctx.theme.accentCyan : ctx.theme.grid}
                strokeWidth={active ? 3 : 1.5}
              />
              <text
                x={cellCenterX(index)}
                y={cellY + cellHeight / 2 + 16}
                fill={ctx.theme.ink}
                fontSize={46}
                fontWeight={600}
                textAnchor="middle"
              >
                {cell.label}
              </text>
              <text
                x={cellCenterX(index)}
                y={cellY + cellHeight + 36}
                fill={ctx.theme.muted}
                fontSize={24}
                textAnchor="middle"
              >
                {index}
              </text>
            </g>
          );
        })}

        {props.pointers.map((pointer, pointerIndex) => {
          const color =
            colorMap[pointer.color ?? DEFAULT_ORDER[pointerIndex % DEFAULT_ORDER.length]!];
          const frac = stepIndex(pointer.stops, ctx.currentFrame, ctx.durationInFrames);
          const x = cellCenterX(frac);
          const below = pointerIndex % 2 === 1;
          const tipY = below ? cellY + cellHeight + 70 : cellY - 70;
          const baseY = below ? tipY + 54 : tipY - 54;
          const labelY = below ? baseY + 34 : baseY - 16;
          const tri = below
            ? `${x - 20},${baseY} ${x + 20},${baseY} ${x},${tipY}`
            : `${x - 20},${baseY} ${x + 20},${baseY} ${x},${tipY}`;
          return (
            <g key={pointer.id}>
              <polygon points={tri} fill={color} />
              <line x1={x} y1={baseY} x2={x} y2={below ? baseY + 18 : baseY - 18} stroke={color} strokeWidth={5} />
              <text x={x} y={labelY} fill={color} fontSize={30} fontWeight={700} textAnchor="middle">
                {pointer.label}
              </text>
            </g>
          );
        })}
      </svg>,
      props.title,
      props.caption,
    );
  },
};
