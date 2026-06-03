import { ArrowRight, BrainCircuit, FolderKanban, HeartPulse, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { formatDateTime } from "../../lib/format.ts";
import type { ProjectSummary } from "../../lib/api-client.ts";
import { useProjectsQuery, useHealthQuery } from "../projects/queries.ts";

const StatCard = ({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof HeartPulse;
}) => (
  <Card className="surface-grid overflow-hidden">
    <CardHeader className="flex-row items-start justify-between gap-4">
      <div className="space-y-1">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </div>
      <div className="rounded-md bg-secondary/80 p-2 text-primary">
        <Icon className="size-5" />
      </div>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">{hint}</CardContent>
  </Card>
);

export const DashboardPage = () => {
  const healthQuery = useHealthQuery();
  const projectsQuery = useProjectsQuery();
  const projects: ProjectSummary[] = projectsQuery.data ?? [];
  const activeProjects = projects.filter((project: ProjectSummary) => project.status === "active");
  const draftProjects = projects.filter((project: ProjectSummary) => project.status === "draft");
  const freshestProject = projects[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge>Phase 2</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Studio Dashboard</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Keep the local tutorial pipeline in view while projects, providers, and phase 3 job
            hooks take shape.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground">
          Data root: <span className="text-foreground">`data/projects`</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="API Health"
          value={healthQuery.data?.ok ? "Healthy" : healthQuery.isLoading ? "Checking" : "Offline"}
          hint="API service is responding."
          icon={HeartPulse}
        />
        <StatCard
          title="Active Projects"
          value={String(activeProjects.length)}
          hint="Projects already moved beyond draft."
          icon={FolderKanban}
        />
        <StatCard
          title="Draft Projects"
          value={String(draftProjects.length)}
          hint="Ready for source ingestion and pipeline kickoff."
          icon={Sparkles}
        />
        <StatCard
          title="Research Hooks"
          value="SSE Ready"
          hint="Project event stream endpoint is wired for phase 3."
          icon={BrainCircuit}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Local projects indexed from `project.json` snapshots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                No projects yet. Create the first lesson draft from the Projects route.
              </div>
            ) : (
              projects.slice(0, 4).map((project: ProjectSummary) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-slate-950/40 px-4 py-4 transition hover:border-primary/50 hover:bg-secondary/40"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{project.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.topic} · {project.sourceCount} sources · updated{" "}
                      {formatDateTime(project.updatedAt)}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Focus</CardTitle>
            <CardDescription>Quick context for the most recently touched lesson.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {freshestProject === undefined ? (
              <p className="text-sm text-muted-foreground">
                Once a project exists, the freshest project summary will appear here.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xl font-semibold">{freshestProject.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{freshestProject.audience}</p>
                </div>
                <div className="rounded-lg border border-border bg-slate-950/50 p-4 text-sm text-muted-foreground">
                  Duration target:{" "}
                  <span className="font-medium text-foreground">
                    {freshestProject.durationTargetSeconds}s
                  </span>
                </div>
                <Link
                  to={`/projects/${freshestProject.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  Open project detail
                  <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
