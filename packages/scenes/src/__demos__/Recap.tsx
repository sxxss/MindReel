import { SceneFrame } from "../SceneFrame.tsx";
import { Recap, RecapPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const recapDemoProps: z.infer<typeof RecapPropsSchema> = {
  title: "今天带走三件事",
  bullets: [
    { id: "definition", icon: "dot", text: "先找定义，再看公式" },
    { id: "picture", icon: "spark", text: "图像负责建立直觉" },
    { id: "verify", icon: "check", text: "例子负责检验直觉" },
  ],
};

export const RecapDemo = () => <SceneFrame definition={Recap} props={recapDemoProps} />;
