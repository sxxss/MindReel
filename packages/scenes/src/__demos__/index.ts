import type { DemoDefinition } from "../types.ts";
import { CartesianPlaneDemo, cartesianPlaneDemoProps } from "./CartesianPlane.tsx";
import { CodeFocusDemo, codeFocusDemoProps } from "./CodeFocus.tsx";
import { CompareTwoColDemo, compareTwoColDemoProps } from "./CompareTwoCol.tsx";
import { FormulaWalkDemo, formulaWalkDemoProps } from "./FormulaWalk.tsx";
import { GraphNetworkDemo, graphNetworkDemoProps } from "./GraphNetwork.tsx";
import { HtmlSlideDemo, htmlSlideDemoProps } from "./HtmlSlide.tsx";
import { NumberLineDemo, numberLineDemoProps } from "./NumberLine.tsx";
import { OutroDemo, outroDemoProps } from "./Outro.tsx";
import { PointerArrayDemo, pointerArrayDemoProps } from "./PointerArray.tsx";
import { ProcessStepsDemo, processStepsDemoProps } from "./ProcessSteps.tsx";
import { RecapDemo, recapDemoProps } from "./Recap.tsx";
import { TitleHookDemo, titleHookDemoProps } from "./TitleHook.tsx";

const demoBase = {
  durationInFrames: 30,
  fps: 30,
  width: 1920,
  height: 1080,
};

export const demoDefinitions: DemoDefinition[] = [
  { id: "TitleHook", component: TitleHookDemo, defaultProps: titleHookDemoProps, ...demoBase },
  { id: "NumberLine", component: NumberLineDemo, defaultProps: numberLineDemoProps, ...demoBase },
  { id: "CartesianPlane", component: CartesianPlaneDemo, defaultProps: cartesianPlaneDemoProps, ...demoBase },
  { id: "GraphNetwork", component: GraphNetworkDemo, defaultProps: graphNetworkDemoProps, ...demoBase },
  { id: "FormulaWalk", component: FormulaWalkDemo, defaultProps: formulaWalkDemoProps, ...demoBase },
  { id: "ProcessSteps", component: ProcessStepsDemo, defaultProps: processStepsDemoProps, ...demoBase },
  { id: "CompareTwoCol", component: CompareTwoColDemo, defaultProps: compareTwoColDemoProps, ...demoBase },
  { id: "CodeFocus", component: CodeFocusDemo, defaultProps: codeFocusDemoProps, ...demoBase },
  { id: "PointerArray", component: PointerArrayDemo, defaultProps: pointerArrayDemoProps, ...demoBase },
  { id: "HtmlSlide", component: HtmlSlideDemo, defaultProps: htmlSlideDemoProps, ...demoBase },
  { id: "Recap", component: RecapDemo, defaultProps: recapDemoProps, ...demoBase },
  { id: "Outro", component: OutroDemo, defaultProps: outroDemoProps, ...demoBase },
];
