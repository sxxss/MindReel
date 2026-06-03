import type { ArtifactRef, PipelineEvent, ProjectLatestArtifacts } from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { cn } from "../../../lib/cn.ts";
import { buildGenerationStatuses, summarizeGeneration } from "./generation-status.ts";

type StageProgressProps = {
  latestArtifacts: ProjectLatestArtifacts;
  events?: PipelineEvent[];
  qaScore?: number;
  sourceCount?: number;
};

const versionLabel = (artifact?: ArtifactRef) => (artifact ? `v${artifact.version}` : "待生成");

export const StageProgress = ({ latestArtifacts, events = [], qaScore, sourceCount }: StageProgressProps) => {
  const statuses = buildGenerationStatuses(latestArtifacts, sourceCount, events);
  const summary = summarizeGeneration({ latestArtifacts, sourceCount, events });

  return (
    <div className="rounded-md border border-border bg-slate-950/35 px-3 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">阶段看板</p>
          <p className="mt-1 text-xs text-muted-foreground">{summary.headline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            已完成 {summary.completedCount}/{summary.totalCount}
          </Badge>
          {summary.isRunning ? <Badge>运行中</Badge> : null}
          {summary.blocker ? <Badge variant="outline">当前阻塞</Badge> : null}
          <Badge variant="secondary">{qaScore === undefined ? "QA 待评分" : `QA ${qaScore}`}</Badge>
        </div>
      </div>
      {summary.blocker ? (
        <div className="mt-3 rounded-md border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {summary.blocker}
        </div>
      ) : summary.isRunning ? (
        <div className="mt-3 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-sm text-primary">
          {summary.description}
        </div>
      ) : null}
      <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {statuses.map((stage) => (
          <div
            key={stage.key}
            className={cn(
              "flex min-h-20 flex-col justify-between rounded-md border px-3 py-2 transition",
              stage.state === "done"
                ? "border-primary/45 bg-primary/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                : stage.state === "pending"
                  ? "border-primary/60 bg-primary/15 text-foreground"
                : stage.state === "ready"
                  ? "border-accent/50 bg-accent/10 text-foreground"
                  : "border-border bg-background/45 text-muted-foreground",
            )}
          >
            <span className="text-sm font-medium">{stage.label}</span>
            <span className="text-xs">{versionLabel(stage.artifactRef)}</span>
            <span className="text-xs">{stage.stateLabel}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{
              width: `${summary.progressPercent}%`,
            }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{summary.progressPercent}%</span>
      </div>
    </div>
  );
};
