import { z } from "zod";

import type { SceneTemplateDefinition } from "../types.ts";
import { IdSchema, NonEmptyTextSchema } from "./schemas.ts";
import { activeIndex, enterStyle, panelStyle, sceneFrame } from "./shared.tsx";

const CalloutSchema = z.object({ id: IdSchema, lineIndex: z.number().int().nonnegative(), text: NonEmptyTextSchema }).strict();

export const CodeFocusPropsSchema = z
  .object({
    title: NonEmptyTextSchema,
    language: NonEmptyTextSchema,
    lines: z.array(NonEmptyTextSchema).min(1),
    highlightedLineIndexes: z.array(z.number().int().nonnegative()).optional(),
    callouts: z.array(CalloutSchema).optional(),
  })
  .strict();

export const CodeFocus: SceneTemplateDefinition<z.infer<typeof CodeFocusPropsSchema>> = {
  id: "CodeFocus",
  propsSchema: CodeFocusPropsSchema,
  durationHintsMs: { min: 6000, ideal: 9000, max: 14000 },
  render: (props, ctx) => {
    // 随场景时间逐个走查需要强调的行（未指定则走查全部行），
    // 焦点行随讲解逐行下移，已讲过的行保留淡底。
    const walk =
      props.highlightedLineIndexes && props.highlightedLineIndexes.length > 0
        ? props.highlightedLineIndexes
        : props.lines.map((_, index) => index);
    const walkPos = activeIndex(ctx, walk.length);
    const activeLine = walk[walkPos]!;
    const visited = new Set(walk.slice(0, walkPos + 1));

    return sceneFrame(
      ctx,
      <>
        <div style={{ position: "absolute", left: 230, top: 245, width: 1040, ...panelStyle(ctx), padding: 28 }}>
          <div style={{ color: ctx.theme.muted, fontSize: 20, marginBottom: 18 }}>{props.language}</div>
          {props.lines.map((line, index) => {
            const isActive = index === activeLine;
            const isVisited = visited.has(index);
            return (
              <div
                key={`${index}-${line}`}
                style={{
                  ...enterStyle(ctx, index * 2, 0),
                  fontFamily: ctx.theme.fontMono,
                  fontSize: 27,
                  lineHeight: 1.65,
                  borderRadius: 8,
                  padding: "0 12px",
                  borderLeft: `4px solid ${isActive ? ctx.theme.accentCyan : "transparent"}`,
                  backgroundColor: isActive
                    ? "rgba(110, 231, 214, 0.18)"
                    : isVisited
                      ? "rgba(110, 231, 214, 0.05)"
                      : "rgba(0,0,0,0)",
                  color: isActive ? ctx.theme.accentCyan : ctx.theme.ink,
                }}
              >
                <span style={{ color: ctx.theme.muted, marginRight: 20 }}>{String(index + 1).padStart(2, "0")}</span>
                {line}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 1320, right: 180, top: 340, display: "grid", gap: 18 }}>
          {(props.callouts ?? []).map((callout) => {
            const isActive = callout.lineIndex === activeLine;
            return (
              <div
                key={callout.id}
                style={{
                  ...panelStyle(ctx),
                  padding: 22,
                  color: ctx.theme.ink,
                  fontSize: 24,
                  lineHeight: 1.4,
                  borderColor: isActive ? ctx.theme.accentCyan : ctx.theme.accentOrange,
                  opacity: isActive ? 1 : 0.4,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                第 {callout.lineIndex + 1} 行：{callout.text}
              </div>
            );
          })}
        </div>
      </>,
      props.title,
    );
  },
};
