import { SceneFrame } from "../SceneFrame.tsx";
import { GraphNetwork, GraphNetworkPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const graphNetworkDemoProps: z.infer<typeof GraphNetworkPropsSchema> = {
  title: "BFS 像水波一样向外扩散",
  nodes: [
    { id: "a", label: "A", x: 0.15, y: 0.25 },
    { id: "b", label: "B", x: 0.38, y: 0.45 },
    { id: "c", label: "C", x: 0.62, y: 0.25 },
    { id: "d", label: "D", x: 0.82, y: 0.58 },
  ],
  edges: [
    { id: "ab", from: "a", to: "b" },
    { id: "bc", from: "b", to: "c" },
    { id: "cd", from: "c", to: "d" },
  ],
  highlightSequence: ["a", "ab", "b", "bc", "c"],
};

export const GraphNetworkDemo = () => <SceneFrame definition={GraphNetwork} props={graphNetworkDemoProps} />;
