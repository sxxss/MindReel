import { SceneFrame } from "../SceneFrame.tsx";
import { ProcessSteps, ProcessStepsPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const processStepsDemoProps: z.infer<typeof ProcessStepsPropsSchema> = {
  title: "从资料到视频的最短闭环",
  steps: [
    { id: "research", title: "研究", detail: "从资料里提炼事实和术语" },
    { id: "script", title: "写稿", detail: "把知识点变成中文口语旁白" },
    { id: "voice", title: "配音", detail: "得到真实音频时长" },
    { id: "timeline", title: "合成", detail: "用停顿与动画吸收时长差异" },
  ],
};

export const ProcessStepsDemo = () => <SceneFrame definition={ProcessSteps} props={processStepsDemoProps} />;
