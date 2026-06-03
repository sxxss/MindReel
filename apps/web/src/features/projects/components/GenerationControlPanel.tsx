import { AlertTriangle, ArrowRight, CheckCircle2, CircleDot, LoaderCircle, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import type { PipelineEvent, Project } from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { cn } from "../../../lib/cn.ts";
import { summarizeGeneration } from "./generation-status.ts";

type GenerationControlPanelProps = {
  project: Project;
  events?: PipelineEvent[];
};

export const GenerationControlPanel = ({ project, events = [] }: GenerationControlPanelProps) => {
  const summary = summarizeGeneration({
    latestArtifacts: project.latestArtifacts,
    sourceCount: project.sources.length,
    events,
  });
  const latestEvent = events.at(-1);
  const targetPath = summary.activeStage
    ? `/projects/${project.id}/${summary.activeStage.path}`
    : `/projects/${project.id}/render`;

  return (
    <section className="rounded-lg border border-primary/30 bg-slate-950/45 px-4 py-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="gap-1.5">
            <Sparkles className="size-3.5" />
            生成控制台
          </Badge>
          <h2 className="mt-3 text-xl font-semibold">{summary.headline}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{summary.description}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          {summary.blocker ? (
            <AlertTriangle className="size-5" />
          ) : summary.isRunning ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <CircleDot className="size-5" />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border/80 bg-background/35 px-3 py-3">
          <p className="text-xs text-muted-foreground">阶段完成</p>
          <p className="mt-1 text-lg font-semibold">
            {summary.completedCount}/{summary.totalCount}
          </p>
        </div>
        <div className="rounded-md border border-border/80 bg-background/35 px-3 py-3">
          <p className="text-xs text-muted-foreground">资料输入</p>
          <p className="mt-1 text-lg font-semibold">{project.sources.length} 条</p>
        </div>
        <div className="rounded-md border border-border/80 bg-background/35 px-3 py-3">
          <p className="text-xs text-muted-foreground">事件流</p>
          <p className="mt-1 truncate text-sm font-medium">
            {summary.isRunning ? "运行中" : latestEvent ? latestEvent.type : "等待事件"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2
            className={cn("size-4", summary.completedCount > 0 ? "text-primary" : "text-muted-foreground")}
          />
          <span>进度 {summary.progressPercent}%</span>
          <span className="text-border">/</span>
          <Radio className="size-4 text-accent" />
          <span>{latestEvent ? latestEvent.message : "等待新的生成反馈"}</span>
        </div>
        <Link
          to={targetPath}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          进入当前阶段
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
};
