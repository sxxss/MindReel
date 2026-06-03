import { useEffect } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { Activity, Clock3, Film, Languages, Radio } from "lucide-react";

import type { PipelineEvent } from "@auto/shared";

import { Badge } from "../../components/ui/badge.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { formatDateTime, formatStatusLabel } from "../../lib/format.ts";
import { cn } from "../../lib/cn.ts";
import { useAppStore } from "../../store/app-store.ts";
import { ActivityLog } from "./components/ActivityLog.tsx";
import { GenerationControlPanel } from "./components/GenerationControlPanel.tsx";
import { StageProgress } from "./components/StageProgress.tsx";
import {
  usePipelineEventsQuery,
  useProjectDetailQuery,
  useProjectEventStream,
} from "./queries.ts";
import { projectStages } from "./stage-definitions.ts";

const emptyEvents: PipelineEvent[] = [];

export const ProjectWorkspaceLayout = () => {
  const { projectId = "" } = useParams();
  const projectQuery = useProjectDetailQuery(projectId);
  const setSelectedProjectId = useAppStore((state) => state.setSelectedProjectId);
  const setActivityEvents = useAppStore((state) => state.setActivityEvents);
  const activityEvents = useAppStore((state) => state.activityEvents[projectId] ?? emptyEvents);
  const eventsQuery = usePipelineEventsQuery(projectId);

  useProjectEventStream(projectId);

  useEffect(() => {
    if (projectId !== "") {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  useEffect(() => {
    if (projectId !== "" && eventsQuery.data !== undefined) {
      setActivityEvents(projectId, eventsQuery.data);
    }
  }, [eventsQuery.data, projectId, setActivityEvents]);

  if (projectQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>正在加载项目...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (projectQuery.isError || projectQuery.data === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>项目暂时不可用</CardTitle>
          <CardDescription>请确认本地 API 已启动，并且该项目仍然存在于数据目录中。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const project = projectQuery.data;
  const latestEvent = activityEvents.at(-1);
  const latestError = [...activityEvents].reverse().find((event) => event.level === "error");

  return (
    <div className="flex flex-col gap-6">
      <section className="cinematic-panel flex flex-col gap-5 rounded-lg border border-border/80 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch xl:justify-between">
          <div className="space-y-3 xl:max-w-3xl">
            <Badge variant="secondary">{formatStatusLabel(project.status)}</Badge>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {project.topic} · {project.audience} · 最近更新 {formatDateTime(project.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Clock3 className="size-3.5" />
                {project.durationTargetSeconds} 秒目标
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Languages className="size-3.5" />
                {project.language}
              </Badge>
              {latestEvent ? (
                <Badge className="gap-1.5">
                  <Radio className="size-3.5" />
                  最近事件：{latestEvent.type}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="min-h-36 rounded-lg border border-white/10 bg-slate-950/45 p-4 xl:w-72">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Preview</p>
                <p className="mt-1 font-medium">本地视频生产中</p>
              </div>
              <Film className="size-5 text-primary" />
            </div>
            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {Array.from({ length: 15 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-6 rounded-sm",
                    index % 4 === 0 ? "bg-primary/70" : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="size-3.5" />
              {latestEvent ? latestEvent.message : "等待新的生成事件"}
            </div>
          </div>
        </div>

        <GenerationControlPanel project={project} events={activityEvents} />

        <nav className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
          {projectStages.map((stage) => {
            const to =
              stage.path === "" ? `/projects/${project.id}` : `/projects/${project.id}/${stage.path}`;

            return (
              <NavLink
                key={stage.key}
                to={to}
                end={stage.path === ""}
                className={({ isActive }) =>
                  cn(
                    "rounded-md border px-3 py-3 text-sm transition",
                    isActive
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border/80 bg-slate-950/35 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                  )
                }
              >
                <div className="font-medium">{stage.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stage.description}</div>
              </NavLink>
            );
          })}
        </nav>
        {latestError ? (
          <div className="rounded-md border border-red-500/50 bg-red-950/20 px-4 py-3 text-sm text-red-100">
            最近错误：{latestError.message}
          </div>
        ) : null}
        <StageProgress
          latestArtifacts={project.latestArtifacts}
          events={activityEvents}
          sourceCount={project.sources.length}
        />
      </section>

      <Outlet context={{ project, events: activityEvents }} />
      <ActivityLog
        events={activityEvents}
        className="fixed bottom-4 right-4 z-40 hidden w-[26rem] shadow-panel xl:block"
      />
    </div>
  );
};
