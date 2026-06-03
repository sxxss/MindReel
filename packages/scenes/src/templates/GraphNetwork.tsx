import { z } from "zod";

import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema, NormalizedPositionSchema } from "./schemas.ts";
import { activeIndex, enterStyle, sceneFrame } from "./shared.tsx";

const NodeSchema = z.object({ id: IdSchema, label: NonEmptyTextSchema, x: NormalizedPositionSchema, y: NormalizedPositionSchema }).strict();
const EdgeSchema = z.object({ id: IdSchema, from: IdSchema, to: IdSchema }).strict();

export const GraphNetworkPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    nodes: z.array(NodeSchema).min(1),
    edges: z.array(EdgeSchema).min(1),
    highlightSequence: z.array(IdSchema).min(1).optional(),
  })
  .strict();

const nodePoint = (node: { x: number; y: number }): [number, number] => [300 + node.x * 1300, 230 + node.y * 580];

export const GraphNetwork: SceneTemplateDefinition<z.infer<typeof GraphNetworkPropsSchema>> = {
  id: "GraphNetwork",
  propsSchema: GraphNetworkPropsSchema,
  durationHintsMs: { min: 6000, ideal: 10000, max: 15000 },
  render: (props, ctx) => {
    const nodesById = new Map(props.nodes.map((node) => [node.id, node]));
    // 按 highlightSequence 顺序随场景时间逐个点亮（遍历/扩散动画）。
    const sequence = props.highlightSequence ?? [];
    const seqPos = sequence.length > 0 ? activeIndex(ctx, sequence.length) : -1;
    const currentId = seqPos >= 0 ? sequence[seqPos] : undefined;
    const highlighted = new Set(seqPos >= 0 ? sequence.slice(0, seqPos + 1) : []);

    return sceneFrame(
      ctx,
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        {props.edges.map((edge, index) => {
          const from = nodesById.get(edge.from);
          const to = nodesById.get(edge.to);
          if (!from || !to) return null;
          const [x1, y1] = nodePoint(from);
          const [x2, y2] = nodePoint(to);
          const isHot = highlighted.has(edge.id);
          return (
            <line
              key={edge.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHot ? ctx.theme.accentCyan : ctx.theme.grid}
              strokeWidth={isHot ? 7 : 4}
              strokeLinecap="round"
              opacity={enterStyle(ctx, index * 2).opacity as number}
            />
          );
        })}
        {props.nodes.map((node, index) => {
          const [x, y] = nodePoint(node);
          const isHot = highlighted.has(node.id);
          const isCurrent = node.id === currentId;
          return (
            <g key={node.id} opacity={enterStyle(ctx, 6 + index * 3).opacity as number}>
              {isCurrent ? (
                <circle cx={x} cy={y} r={62} fill="none" stroke={ctx.theme.accentCyan} strokeWidth={3} opacity={0.7} />
              ) : null}
              <circle
                cx={x}
                cy={y}
                r={isCurrent ? 48 : isHot ? 42 : 36}
                fill={isHot ? ctx.theme.accentOrange : "rgba(15, 23, 42, 0.9)"}
                stroke={isCurrent ? ctx.theme.accentCyan : isHot ? ctx.theme.accentOrange : ctx.theme.ink}
                strokeWidth={isCurrent ? 6 : 4}
              />
              <text x={x} y={y + 10} fill={isHot ? ctx.theme.background : ctx.theme.ink} fontSize={30} fontWeight={800} textAnchor="middle">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>,
      props.title,
    );
  },
};
