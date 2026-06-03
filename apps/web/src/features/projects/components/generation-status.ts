import type { ArtifactRef, PipelineEvent, ProjectLatestArtifacts } from "@auto/shared";

export type GenerationStageState = "done" | "ready" | "blocked" | "pending";

export type GenerationStageStatus = {
  key: string;
  label: string;
  path: string;
  artifact: keyof ProjectLatestArtifacts;
  artifactRef?: ArtifactRef;
  state: GenerationStageState;
  stateLabel: string;
  blocker?: string;
};

export type GenerationSummary = {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  activeStage: GenerationStageStatus | undefined;
  blocker: string | undefined;
  isRunning: boolean;
  runningEvent: PipelineEvent | undefined;
  headline: string;
  description: string;
};

const stages: Array<Omit<GenerationStageStatus, "state" | "stateLabel" | "artifactRef" | "blocker"> & {
  requires: Array<keyof ProjectLatestArtifacts>;
}> = [
  {
    key: "curriculum",
    label: "课程",
    path: "curriculum",
    artifact: "curriculum",
    requires: ["knowledge"],
  },
  {
    key: "script",
    label: "脚本",
    path: "script",
    artifact: "script",
    requires: ["curriculum"],
  },
  {
    key: "scenes",
    label: "镜头",
    path: "scenes",
    artifact: "scene-spec",
    requires: ["script"],
  },
  {
    key: "voice",
    label: "配音",
    path: "voice",
    artifact: "voice-track",
    requires: ["script"],
  },
  {
    key: "timeline",
    label: "时间线",
    path: "timeline",
    artifact: "timeline",
    requires: ["scene-spec", "voice-track"],
  },
  {
    key: "render",
    label: "渲染",
    path: "render",
    artifact: "render",
    requires: ["timeline"],
  },
];

const firstMissingRequirementLabel = (
  latestArtifacts: ProjectLatestArtifacts,
  requires: Array<keyof ProjectLatestArtifacts>,
) => {
  const missing = requires.find((key) => latestArtifacts[key] === undefined);
  if (missing === "knowledge") return "知识梳理";
  if (missing === "curriculum") return "课程大纲";
  if (missing === "script") return "旁白脚本";
  if (missing === "scene-spec") return "镜头设计";
  if (missing === "voice-track") return "配音";
  if (missing === "timeline") return "时间线";
  return undefined;
};

const terminalJobEvents = new Set(["job.completed", "job.failed", "job.canceled", "job.cancelled"]);

const runningJobEvents = new Set(["job.queued", "job.started"]);

export const getActiveGenerationEvent = (events: PipelineEvent[] = []) => {
  const terminalJobIds = new Set<string>();

  for (const event of [...events].reverse()) {
    if (terminalJobEvents.has(event.type)) {
      terminalJobIds.add(event.jobId);
      continue;
    }

    if (terminalJobIds.has(event.jobId)) {
      continue;
    }

    if (
      runningJobEvents.has(event.type) ||
      event.type.startsWith("agent.") ||
      event.type.startsWith("voice.")
    ) {
      return event;
    }
  }

  return undefined;
};

export const buildGenerationStatuses = (
  latestArtifacts: ProjectLatestArtifacts,
  sourceCount?: number,
  events: PipelineEvent[] = [],
): GenerationStageStatus[] => {
  const isRunning = getActiveGenerationEvent(events) !== undefined;
  let runningStageClaimed = false;

  return stages.map((stage) => {
    const artifactRef = latestArtifacts[stage.artifact];
    const missingRequirement = firstMissingRequirementLabel(latestArtifacts, stage.requires);
    const hasNoSources = sourceCount === 0;

    if (artifactRef !== undefined) {
      return {
        ...stage,
        artifactRef,
        state: "done",
        stateLabel: "已完成",
      };
    }

    if (isRunning && !runningStageClaimed) {
      runningStageClaimed = true;
      return {
        ...stage,
        state: "pending",
        stateLabel: "运行中",
      };
    }

    if (hasNoSources || missingRequirement !== undefined) {
      return {
        ...stage,
        state: "blocked",
        stateLabel: "等待前置",
        blocker: hasNoSources ? "缺少来源资料" : `等待${missingRequirement}`,
      };
    }

    return {
      ...stage,
      state: "ready",
      stateLabel: "可生成",
    };
  });
};

export const summarizeGeneration = (args: {
  latestArtifacts: ProjectLatestArtifacts;
  sourceCount: number | undefined;
  events?: PipelineEvent[];
}): GenerationSummary => {
  const events = args.events ?? [];
  const statuses = buildGenerationStatuses(args.latestArtifacts, args.sourceCount, events);
  const completedCount = statuses.filter((stage) => stage.state === "done").length;
  const latestError = [...events].reverse().find((event) => event.level === "error");
  const runningEvent = getActiveGenerationEvent(events);
  const activeStage = statuses.find((stage) => stage.state !== "done");
  const sourceBlocker = args.sourceCount === 0 ? "缺少来源资料" : undefined;
  const blocker = latestError?.message ?? sourceBlocker ?? activeStage?.blocker;
  const isComplete = completedCount === statuses.length;
  const isRunning = runningEvent !== undefined && latestError === undefined;

  return {
    completedCount,
    totalCount: statuses.length,
    progressPercent: Math.round((completedCount / statuses.length) * 100),
    activeStage,
    blocker,
    isRunning,
    runningEvent,
    headline: isRunning
      ? "正在生成"
      : isComplete
        ? "生产链路已完成"
        : `当前阶段：${activeStage?.label ?? "待确认"}`,
    description: isRunning
      ? "大模型正在生成内容"
      : blocker
        ? `当前阻塞：${blocker}`
        : isComplete
          ? "可以进入渲染页检查导出结果。"
          : "前置条件已满足，可以继续推进下一步。",
  };
};

export const generationStages = stages;
