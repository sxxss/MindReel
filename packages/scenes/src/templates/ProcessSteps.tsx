import { z } from "zod";

import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { activeIndex, enterStyle, panelStyle, sceneFrame } from "./shared.tsx";

const StepSchema = z.object({ id: IdSchema, title: NonEmptyTextSchema, detail: NonEmptyTextSchema }).strict();

export const ProcessStepsPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    steps: z.array(StepSchema).min(1).max(6),
  })
  .strict();

export const ProcessSteps: SceneTemplateDefinition<z.infer<typeof ProcessStepsPropsSchema>> = {
  id: "ProcessSteps",
  propsSchema: ProcessStepsPropsSchema,
  durationHintsMs: { min: 6000, ideal: 10000, max: 15000 },
  render: (props, ctx) => {
    // 当前步骤随场景时间逐个推进：已过的标记完成、当前的高亮、未到的淡出。
    const current = activeIndex(ctx, props.steps.length);

    return sceneFrame(
      ctx,
      <div style={{ position: "absolute", left: 180, right: 180, top: 380, display: "grid", gridTemplateColumns: `repeat(${props.steps.length}, 1fr)`, gap: 28 }}>
        {props.steps.map((step, index) => {
          const isCurrent = index === current;
          const isDone = index < current;
          const entrance = enterStyle(ctx, index * 4, 30);
          const stateOpacity = isCurrent ? 1 : isDone ? 0.72 : 0.4;
          return (
            <div
              key={step.id}
              style={{
                ...panelStyle(ctx),
                minHeight: 210,
                padding: 28,
                position: "relative",
                transform: entrance.transform,
                opacity: (entrance.opacity as number) * stateOpacity,
                borderColor: isCurrent ? ctx.theme.accentCyan : ctx.theme.grid,
                boxShadow: isCurrent ? `0 0 0 2px ${ctx.theme.accentCyan}` : "none",
              }}
            >
              <div style={{ color: isDone ? ctx.theme.accentGreen : ctx.theme.accentCyan, fontSize: 24 }}>
                {isDone ? "✓" : `0${index + 1}`}
              </div>
              <div style={{ marginTop: 18, fontSize: 34, fontWeight: 800 }}>{step.title}</div>
              <div style={{ marginTop: 16, color: ctx.theme.muted, fontSize: 22, lineHeight: 1.45 }}>{step.detail}</div>
              {index < props.steps.length - 1 ? (
                <div style={{ position: "absolute", right: -28, top: 96, color: index < current ? ctx.theme.accentGreen : ctx.theme.accentOrange, fontSize: 42 }}>→</div>
              ) : null}
            </div>
          );
        })}
      </div>,
      props.title,
    );
  },
};
