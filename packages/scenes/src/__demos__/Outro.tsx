import { SceneFrame } from "../SceneFrame.tsx";
import { Outro, OutroPropsSchema } from "../templates/index.ts";
import type { z } from "zod";

export const outroDemoProps: z.infer<typeof OutroPropsSchema> = {
  title: "我们下一节继续",
  kicker: "把卷积看成一段滑动的对齐过程。",
  credit: "Mindreel",
};

export const OutroDemo = () => <SceneFrame definition={Outro} props={outroDemoProps} />;
