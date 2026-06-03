import type { SceneTemplateId } from "@auto/shared";

import type { SceneTemplateDefinition } from "./types.ts";
import {
  CartesianPlane,
  CodeFocus,
  CompareTwoCol,
  FormulaWalk,
  GraphNetwork,
  HtmlSlide,
  NumberLine,
  Outro,
  PointerArray,
  ProcessSteps,
  Recap,
  TitleHook,
} from "./templates/index.ts";

export const templateRegistry: Record<SceneTemplateId, SceneTemplateDefinition> = {
  TitleHook,
  NumberLine,
  CartesianPlane,
  GraphNetwork,
  FormulaWalk,
  ProcessSteps,
  CompareTwoCol,
  CodeFocus,
  PointerArray,
  HtmlSlide,
  Recap,
  Outro,
};

export const parseTemplateProps = (templateId: SceneTemplateId, props: Record<string, unknown>) =>
  templateRegistry[templateId].propsSchema.parse(props);
