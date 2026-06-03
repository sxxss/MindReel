import { SceneFrame } from "../SceneFrame.tsx";
import { FormulaWalk, FormulaWalkPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const formulaWalkDemoProps: z.infer<typeof FormulaWalkPropsSchema> = {
  title: "完全平方公式不是背出来的",
  tokens: [
    { id: "compact", text: "(a+b)²" },
    { id: "equals", text: "=" },
    { id: "expanded", text: "a²+2ab+b²" },
  ],
  highlights: ["compact", "expanded"],
  transforms: [{ id: "expand", fromTokenId: "compact", toTokenId: "expanded", label: "面积拆开" }],
  notes: [{ id: "middle", text: "中间项 2ab 来自两个相同的长方形。" }],
};

export const FormulaWalkDemo = () => <SceneFrame definition={FormulaWalk} props={formulaWalkDemoProps} />;
