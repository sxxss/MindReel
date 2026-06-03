import type { z } from "zod";

import { SceneFrame } from "../SceneFrame.tsx";
import { PointerArray, PointerArrayPropsSchema } from "../templates/index.ts";

export const pointerArrayDemoProps: z.infer<typeof PointerArrayPropsSchema> = {
  title: "双指针：从两端向中间收缩",
  caption: "left 从左、right 从右，逐步向中间移动",
  cells: [
    { id: "c0", label: "7" },
    { id: "c1", label: "2" },
    { id: "c2", label: "8" },
    { id: "c3", label: "4" },
    { id: "c4", label: "9" },
    { id: "c5", label: "1" },
  ],
  pointers: [
    { id: "left", label: "left", color: "cyan", stops: [0, 1, 2] },
    { id: "right", label: "right", color: "orange", stops: [5, 4, 3] },
  ],
};

export const PointerArrayDemo = () => (
  <SceneFrame definition={PointerArray} props={pointerArrayDemoProps} />
);
