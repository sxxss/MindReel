import { SceneFrame } from "../SceneFrame.tsx";
import { TitleHook, TitleHookPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const titleHookDemoProps: z.infer<typeof TitleHookPropsSchema> = {
  title: "为什么负负得正？",
  subtitle: "从方向和对称性开始，拆掉一个反直觉规则",
  accents: [
    { id: "question", label: "反直觉", x: 0.22, y: 0.28 },
    { id: "direction", label: "方向感", x: 0.78, y: 0.68 },
  ],
};

export const TitleHookDemo = () => <SceneFrame definition={TitleHook} props={titleHookDemoProps} />;
