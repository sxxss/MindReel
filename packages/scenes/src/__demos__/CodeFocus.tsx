import { SceneFrame } from "../SceneFrame.tsx";
import { CodeFocus, CodeFocusPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const codeFocusDemoProps: z.infer<typeof CodeFocusPropsSchema> = {
  title: "二分查找的循环不变量",
  language: "TypeScript",
  lines: [
    "let left = 0;",
    "let right = arr.length - 1;",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "}",
  ],
  highlightedLineIndexes: [2, 3],
  callouts: [{ id: "loop", lineIndex: 2, text: "只要区间还没空，答案仍可能藏在里面。" }],
};

export const CodeFocusDemo = () => <SceneFrame definition={CodeFocus} props={codeFocusDemoProps} />;
