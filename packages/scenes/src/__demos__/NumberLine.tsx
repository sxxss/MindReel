import { SceneFrame } from "../SceneFrame.tsx";
import { NumberLine, NumberLinePropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const numberLineDemoProps: z.infer<typeof NumberLinePropsSchema> = {
  title: "把温度变化放到数轴上",
  domain: [-5, 5],
  ticks: [-5, -2, 0, 3, 5],
  points: [
    { id: "yesterday", value: -2, label: "昨天" },
    { id: "today", value: 3, label: "今天" },
  ],
  cursorValue: 3,
  highlightRange: [-2, 3],
};

export const NumberLineDemo = () => <SceneFrame definition={NumberLine} props={numberLineDemoProps} />;
