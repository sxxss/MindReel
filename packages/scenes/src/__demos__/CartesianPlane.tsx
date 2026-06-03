import { SceneFrame } from "../SceneFrame.tsx";
import { CartesianPlane, CartesianPlanePropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const cartesianPlaneDemoProps: z.infer<typeof CartesianPlanePropsSchema> = {
  title: "抛物线的轨迹",
  xDomain: [-3, 3],
  yDomain: [-1, 9],
  curves: [
    {
      id: "parabola",
      label: "y = x²",
      points: [
        [-2.5, 6.25],
        [-1.5, 2.25],
        [0, 0],
        [1.5, 2.25],
        [2.5, 6.25],
      ],
    },
  ],
  vectors: [{ id: "vector", from: [0, 0], to: [1.5, 2.25], label: "变化方向" }],
  annotations: [{ id: "vertex", text: "顶点", at: [0, 0] }],
};

export const CartesianPlaneDemo = () => <SceneFrame definition={CartesianPlane} props={cartesianPlaneDemoProps} />;
