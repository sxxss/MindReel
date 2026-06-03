import { SceneFrame } from "../SceneFrame.tsx";
import { CompareTwoCol, CompareTwoColPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const compareTwoColDemoProps: z.infer<typeof CompareTwoColPropsSchema> = {
  title: "导数：概念 vs 误解",
  leftTitle: "正确理解",
  rightTitle: "常见误解",
  rows: [
    { id: "local", left: "导数描述局部变化率", right: "导数只是套公式", emphasis: true },
    { id: "limit", left: "极限在描述逼近过程", right: "极限必须真的取到", emphasis: true },
    { id: "graph", left: "图像斜率帮助建立直觉", right: "图像只是装饰", emphasis: false },
  ],
};

export const CompareTwoColDemo = () => <SceneFrame definition={CompareTwoCol} props={compareTwoColDemoProps} />;
