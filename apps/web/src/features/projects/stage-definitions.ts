import type { ArtifactKind } from "@auto/shared";

export type ProjectStageKey =
  | "overview"
  | "curriculum"
  | "script"
  | "scenes"
  | "voice"
  | "timeline"
  | "render";

export type ProjectStageDefinition = {
  key: ProjectStageKey;
  label: string;
  path: string;
  artifactKind?: ArtifactKind;
  description: string;
  inspectorHint: string;
};

export const projectStages: ProjectStageDefinition[] = [
  {
    key: "overview",
    label: "总览",
    path: "",
    description: "查看项目基础信息、来源资料和已生成产物。",
    inspectorHint: "这里会汇总当前项目的基础指标与资料数量。",
  },
  {
    key: "curriculum",
    label: "课程大纲",
    path: "curriculum",
    artifactKind: "curriculum",
    description: "检查章节结构、时长分配和学习目标是否贴近目标视频。",
    inspectorHint: "这里用于确认章节比例、目标时长和修订方向。",
  },
  {
    key: "script",
    label: "旁白脚本",
    path: "script",
    artifactKind: "script",
    description: "查看分段口播、节奏控制和章节收尾停顿。",
    inspectorHint: "这里用于检查 beat 节奏、口播密度和章节映射。",
  },
  {
    key: "scenes",
    label: "镜头设计",
    path: "scenes",
    artifactKind: "scene-spec",
    description: "预留镜头说明、画面指令和素材拆分的工作区。",
    inspectorHint: "这里用于确认镜头粒度、素材约束和画面备注。",
  },
  {
    key: "voice",
    label: "配音",
    path: "voice",
    artifactKind: "voice-track",
    description: "查看语音模型、音色版本和音频产物占位信息。",
    inspectorHint: "这里用于核对音色、音频版本和导出状态。",
  },
  {
    key: "timeline",
    label: "时间线",
    path: "timeline",
    artifactKind: "timeline",
    description: "整理镜头、音频和字幕在最终时间线中的拼装状态。",
    inspectorHint: "这里用于对齐段落顺序、衔接和导出前检查。",
  },
  {
    key: "render",
    label: "渲染",
    path: "render",
    artifactKind: "render",
    description: "查看最终渲染产物、版本和导出诊断壳层。",
    inspectorHint: "这里用于追踪导出版本、产物引用和渲染提示。",
  },
];

export const stageLookup = Object.fromEntries(
  projectStages.map((stage) => [stage.key, stage]),
) as Record<ProjectStageKey, ProjectStageDefinition>;
