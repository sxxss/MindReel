import { CheckCircle2, CircleAlert, Radio } from "lucide-react";
import { Link } from "react-router-dom";

import type { PipelineEvent, Project } from "@auto/shared";

import { Badge } from "../../components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { cn } from "../../lib/cn.ts";
import { formatDateTime } from "../../lib/format.ts";
import { buildGenerationStatuses, summarizeGeneration } from "./components/generation-status.ts";

export const StageOperationsPanel = ({ project, events }: { project: Project; events: PipelineEvent[] }) => {
  const stageStatuses = buildGenerationStatuses(project.latestArtifacts, project.sources.length);
  const generationSummary = summarizeGeneration({
    latestArtifacts: project.latestArtifacts,
    sourceCount: project.sources.length,
    events,
  });

  return (
    <Card>
      <CardHeader>
        <Badge>Control</Badge>
        <CardTitle>阶段操作</CardTitle>
        <CardDescription>按依赖关系查看每一步能否继续推进。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {generationSummary.blocker ? <CircleAlert className="size-5" /> : <CheckCircle2 className="size-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium">{generationSummary.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">{generationSummary.description}</p>
            </div>
          </div>
        </div>
        {stageStatuses.map((stage) => (
          <Link
            key={stage.key}
            to={`/projects/${project.id}/${stage.path}`}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition",
              stage.state === "done"
                ? "border-primary/35 bg-primary/10"
                : stage.state === "ready"
                  ? "border-accent/40 bg-accent/10"
                  : "border-border/80 bg-slate-950/35 hover:border-primary/30",
            )}
          >
            <span className="font-medium">{stage.label}</span>
            <span className="text-muted-foreground">{stage.stateLabel}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export const AssetReadinessPanel = ({ project }: { project: Project }) => {
  const assets = [
    { label: "来源资料", value: `${project.sources.length} 条`, ready: project.sources.length > 0 },
    {
      label: "知识梳理",
      value: project.latestArtifacts.knowledge ? `v${project.latestArtifacts.knowledge.version}` : "待生成",
      ready: project.latestArtifacts.knowledge !== undefined,
    },
    {
      label: "旁白脚本",
      value: project.latestArtifacts.script ? `v${project.latestArtifacts.script.version}` : "待生成",
      ready: project.latestArtifacts.script !== undefined,
    },
    {
      label: "镜头设计",
      value: project.latestArtifacts["scene-spec"] ? `v${project.latestArtifacts["scene-spec"].version}` : "待生成",
      ready: project.latestArtifacts["scene-spec"] !== undefined,
    },
    {
      label: "配音轨道",
      value: project.latestArtifacts["voice-track"] ? `v${project.latestArtifacts["voice-track"].version}` : "待生成",
      ready: project.latestArtifacts["voice-track"] !== undefined,
    },
    {
      label: "时间线",
      value: project.latestArtifacts.timeline ? `v${project.latestArtifacts.timeline.version}` : "待生成",
      ready: project.latestArtifacts.timeline !== undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>素材资产</CardTitle>
        <CardDescription>把资料和结构化产物放在一个清单里，快速判断能不能继续制作。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-slate-950/35 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-2.5 shrink-0 rounded-full",
                  item.ready ? "bg-primary" : "bg-muted-foreground/35",
                )}
              />
              <span className="font-medium">{item.label}</span>
            </div>
            <span className="text-sm text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const RecentArtifactsPanel = ({ project }: { project: Project }) => {
  const latestArtifacts = Object.entries(project.latestArtifacts).flatMap(([kind, artifact]) =>
    artifact === undefined ? [] : [{ kind, artifact }],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近产物</CardTitle>
        <CardDescription>当前项目登记到 latestArtifacts 的结构化输出。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestArtifacts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            暂时还没有生成产物
          </div>
        ) : (
          latestArtifacts.map(({ kind, artifact }) => (
            <div key={kind} className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{kind}</p>
                <Badge variant="outline">v{artifact.version}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDateTime(artifact.createdAt)} · {artifact.createdBy}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export const LiveStatusPanel = ({ project, events }: { project: Project; events: PipelineEvent[] }) => {
  const latestEvent = events.at(-1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>现场状态</CardTitle>
        <CardDescription>事件流和后台刷新状态会在这里聚合。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Radio className="size-4 text-accent" />
            <span>{latestEvent ? latestEvent.type : "等待事件"}</span>
          </div>
          <p className="mt-2 text-sm leading-6">
            {latestEvent ? latestEvent.message : "创建任务后，这里会显示最新生成反馈。"}
          </p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-muted-foreground">
          项目事件流会持续订阅 <code className="break-all">/api/projects/{project.id}/events</code>
          ，阶段页会自动刷新查询。
        </div>
      </CardContent>
    </Card>
  );
};
