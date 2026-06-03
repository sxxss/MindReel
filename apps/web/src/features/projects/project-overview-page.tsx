import { ArrowRight, FileStack, Film, Layers3, Timer, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { formatDateTime } from "../../lib/format.ts";
import {
  AssetReadinessPanel,
  LiveStatusPanel,
  RecentArtifactsPanel,
  StageOperationsPanel,
} from "./ProjectOverviewPanels.tsx";
import { useProjectWorkspace } from "./project-workspace-context.ts";

export const ProjectOverviewPage = () => {
  const { project, events } = useProjectWorkspace();

  const latestArtifacts = Object.entries(project.latestArtifacts).flatMap(([kind, artifact]) =>
    artifact === undefined ? [] : [{ kind, artifact }],
  );
  const latestArtifact = latestArtifacts
    .map(({ artifact }) => artifact)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const nextStep =
    latestArtifacts.length === 0
      ? {
          title: "等待 autopilot 生成第一批产物",
          description: "如果任务已经提交，事件流会在生成过程中刷新；也可以进入阶段页检查进展。",
          to: "curriculum",
          label: "查看课程大纲",
        }
      : project.latestArtifacts.render
        ? {
            title: "检查渲染产物",
            description: "项目已经有渲染记录，可以进入渲染页查看版本和导出信息。",
            to: "render",
            label: "打开渲染页",
          }
        : {
            title: "继续推进下一阶段",
            description: "已有部分结构化产物，继续检查脚本、镜头、配音和时间线。",
            to: "script",
            label: "继续检查",
          };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="xl:col-span-2">
        <CardHeader>
          <Badge>Overview</Badge>
          <CardTitle>生产总览</CardTitle>
          <CardDescription>确认项目状态、来源资料、最新产物和下一步动作。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">目标时长</p>
                <Timer className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{project.durationTargetSeconds} 秒</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">来源资料</p>
                <FileStack className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{project.sources.length} 条</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">生成产物</p>
                <Layers3 className="size-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{latestArtifacts.length} 个</p>
            </div>
            <div className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">最新产物</p>
                <Film className="size-4 text-accent" />
              </div>
              <p className="mt-2 truncate text-sm font-medium">
                {latestArtifact ? formatDateTime(latestArtifact.createdAt) : "待生成"}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-muted-foreground">
            项目事件流会持续订阅{" "}
            <code className="break-all">/api/projects/{project.id}/events</code>
            ，阶段页会自动刷新查询。
          </div>
        </CardContent>
      </Card>

      <StageOperationsPanel project={project} events={events} />
      <AssetReadinessPanel project={project} />
      <RecentArtifactsPanel project={project} />

      <Card className="border-accent/30 bg-accent/10">
        <CardHeader>
          <CardTitle>下一步动作</CardTitle>
          <CardDescription>{nextStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-accent/30 bg-slate-950/30 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Wand2 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{nextStep.title}</p>
                <Link
                  to={`/projects/${project.id}/${nextStep.to}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent"
                >
                  {nextStep.label}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LiveStatusPanel project={project} events={events} />

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>来源资料</CardTitle>
          <CardDescription>这些资料会被后续阶段消费，用于生成课程、脚本和镜头。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.sources.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
              这个项目还没有来源资料。
            </div>
          ) : (
            project.sources.map((source) => (
              <div key={source.id} className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{source.title}</p>
                  <Badge variant="outline">{source.kind}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{source.body}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
