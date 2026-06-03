import type { ArtifactKind, PipelineStage } from "@auto/shared";

import { Badge } from "../../components/ui/badge.tsx";
import { apiClient } from "../../lib/api-client.ts";
import { useAppStore } from "../../store/app-store.ts";
import { ArtifactView } from "./components/ArtifactView.tsx";
import { ProductionArtifactWorkbench } from "./components/ProductionArtifactWorkbench.tsx";
import { StageInspector } from "./components/StageInspector.tsx";
import { ThemeSwitcher } from "./components/ThemeSwitcher.tsx";
import { useArtifactQuery, useStageActionMutation } from "./queries.ts";
import { useProjectWorkspace } from "./project-workspace-context.ts";
import type { ProjectStageDefinition } from "./stage-definitions.ts";
import type { ProjectLatestArtifacts } from "@auto/shared";
import type { JsonValue, RenderArtifact } from "@auto/shared";

const latestArtifactKey = (kind: ArtifactKind): keyof ProjectLatestArtifacts =>
  kind === "qa-report" ? "qaReport" : kind;

const stageForKind = (kind?: ArtifactKind): PipelineStage => {
  if (kind === "scene-spec") {
    return "scenes";
  }
  if (kind === "voice-track") {
    return "voice";
  }
  if (kind === "qa-report") {
    return "qa";
  }
  if (kind === "curriculum" || kind === "script" || kind === "timeline" || kind === "render") {
    return kind;
  }
  return "knowledge";
};

const isRenderArtifact = (value: JsonValue | undefined): value is RenderArtifact =>
  (() => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record.relativePath === "string" && typeof record.outputPath === "string";
  })();

const disabledReasonForStage = (
  stage: ProjectStageDefinition,
  latestArtifacts: ProjectLatestArtifacts,
) => {
  if (stage.artifactKind === undefined) {
    return undefined;
  }
  if (stage.artifactKind === "curriculum" && latestArtifacts.knowledge === undefined) {
    return "请先生成 knowledge 产物；新建项目后的自动生成任务会先完成这一步。";
  }
  if (stage.artifactKind === "script" && latestArtifacts.curriculum === undefined) {
    return "请先生成课程大纲，再处理旁白脚本。";
  }
  if (stage.artifactKind === "scene-spec" && latestArtifacts.script === undefined) {
    return "请先生成旁白脚本，再处理镜头设计。";
  }
  if (stage.artifactKind === "voice-track" && latestArtifacts.script === undefined) {
    return "请先生成旁白脚本，再处理配音。";
  }
  if (stage.artifactKind === "timeline") {
    if (latestArtifacts["scene-spec"] === undefined || latestArtifacts["voice-track"] === undefined) {
      return "请先生成镜头设计和配音，再合成时间线。";
    }
  }
  if (stage.artifactKind === "render" && latestArtifacts.timeline === undefined) {
    return "请先生成时间线，再开始最终渲染。";
  }
  return undefined;
};

export const ProjectStagePage = ({ stage }: { stage: ProjectStageDefinition }) => {
  const { project } = useProjectWorkspace();
  const actionMutation = useStageActionMutation();
  const artifact =
    stage.artifactKind === undefined
      ? undefined
      : project.latestArtifacts[latestArtifactKey(stage.artifactKind)];
  const artifactVersionKey =
    stage.artifactKind === undefined ? undefined : `${project.id}:${stage.artifactKind}`;
  const selectedVersion = useAppStore((state) =>
    artifactVersionKey === undefined ? undefined : state.artifactVersions[artifactVersionKey],
  );
  const setArtifactVersion = useAppStore((state) => state.setArtifactVersion);
  const activeVersion = selectedVersion ?? artifact?.version;
  const artifactQuery = useArtifactQuery(project.id, stage.artifactKind, activeVersion);
  const pipelineStage = stageForKind(stage.artifactKind);
  const disabledReason = disabledReasonForStage(stage, project.latestArtifacts);
  const renderArtifact = stage.artifactKind === "render" ? isRenderArtifact(artifactQuery.data) ? artifactQuery.data : undefined : undefined;

  const runAction = (action: "approve-stage" | "rerun-stage") => {
    actionMutation.mutate({
      projectId: project.id,
      input: { action, stage: pipelineStage },
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <ArtifactView
        title={stage.label}
        description={stage.description}
        value={artifactQuery.data}
      >
        {stage.artifactKind === undefined ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
            总览页展示项目基础信息；进入具体阶段后会显示结构化产物。
          </div>
        ) : artifact === undefined ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
            暂无产物
          </div>
        ) : artifactQuery.isError ? (
          <div className="rounded-md border border-border bg-slate-950/40 px-4 py-4 text-sm text-muted-foreground">
            产物 v{activeVersion} 还不可读取，可能仍在生成中。
          </div>
        ) : artifactQuery.data === undefined ? (
          <div className="rounded-md border border-border bg-slate-950/40 px-4 py-4 text-sm text-muted-foreground">
            正在读取结构化产物...
          </div>
        ) : (
          <ProductionArtifactWorkbench kind={stage.artifactKind} value={artifactQuery.data} />
        )}
      </ArtifactView>

      <StageInspector
        description={stage.inspectorHint}
        stage={pipelineStage}
        version={artifact?.version}
        pending={actionMutation.isPending}
        onVersionChange={(version) =>
          artifactVersionKey === undefined ? undefined : setArtifactVersion(artifactVersionKey, version)
        }
        onRerun={() => runAction("rerun-stage")}
        onApprove={() => runAction("approve-stage")}
        disabledReason={disabledReason}
      >
        <div className="space-y-3">
          {renderArtifact ? (
            <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-3 text-sm">
              <p className="font-medium">渲染文件已就绪</p>
              <p className="mt-1 text-muted-foreground">
                {Math.round(renderArtifact.durationMs / 1000)} 秒 · {renderArtifact.width}x{renderArtifact.height}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  href={apiClient.projectMediaUrl(project.id, renderArtifact.relativePath)}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开 MP4
                </a>
                <a
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                  href={apiClient.projectWebDeckUrl(project.id)}
                  target="_blank"
                  rel="noreferrer"
                  title="导出可点击/带音频的交互网页课件（单文件，可离线分享）"
                >
                  ⚡ 导出交互网页
                </a>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                交互网页 = 视频的可点击版：键盘翻页、按句播放音频，单文件可离线分享。
              </p>
            </div>
          ) : null}
          {stage.artifactKind === "render" ? <ThemeSwitcher project={project} /> : null}
          <div className="rounded-md border border-border bg-slate-950/35 px-3 py-3 text-sm">
            <p className="font-medium">项目资料</p>
            <p className="mt-1 text-muted-foreground">
              {project.sources.length} 条来源资料 · 目标时长 {project.durationTargetSeconds} 秒
            </p>
          </div>
          {artifact ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{artifact.kind}</Badge>
              <Badge variant="secondary">v{artifact.version}</Badge>
            </div>
          ) : null}
        </div>
      </StageInspector>
    </div>
  );
};
