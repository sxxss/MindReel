import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Separator } from "../../components/ui/separator.tsx";
import { formatDateTime, formatStatusLabel } from "../../lib/format.ts";
import { useAppStore } from "../../store/app-store.ts";
import { useProjectDetailQuery } from "./queries.ts";

const sections = ["overview", "sources", "timeline"] as const;

export const ProjectDetailPage = () => {
  const { projectId = "" } = useParams();
  const projectQuery = useProjectDetailQuery(projectId);
  const setSelectedProjectId = useAppStore((state) => state.setSelectedProjectId);
  const [section, setSection] = useState<(typeof sections)[number]>("overview");

  useEffect(() => {
    if (projectId !== "") {
      setSelectedProjectId(projectId);
    }
  }, [projectId, setSelectedProjectId]);

  const project = projectQuery.data;

  if (projectQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project unavailable</CardTitle>
          <CardDescription>
            The local API could not load this project snapshot yet. Check that the project exists on
            disk and the API server is running.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (project === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading project...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const latestArtifacts = Object.entries(project.latestArtifacts).flatMap(([kind, artifact]) =>
    artifact === undefined ? [] : [{ kind, artifact }],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">{formatStatusLabel(project.status)}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
          <p className="text-sm text-muted-foreground">
            {project.topic} · {project.audience} · updated {formatDateTime(project.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((value) => (
            <Button
              key={value}
              variant={section === value ? "default" : "ghost"}
              onClick={() => setSection(value)}
            >
              {value[0]!.toUpperCase() + value.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Core lesson framing and readiness signal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Duration
                </div>
                <div className="mt-2 text-lg font-semibold">{project.durationTargetSeconds}s</div>
              </div>
              <div className="rounded-lg border border-border bg-slate-950/40 p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Language
                </div>
                <div className="mt-2 text-lg font-semibold">{project.language}</div>
              </div>
            </div>
            <Separator />
            <div className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
              SSE endpoint is ready at `/api/projects/{project.id}/events` for later pipeline status
              streaming.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Artifacts</CardTitle>
            <CardDescription>Snapshots will appear here once phase 3 jobs land.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestArtifacts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
                No generated artifacts yet
              </div>
            ) : (
              latestArtifacts.map(({ kind, artifact }) => (
                <div
                  key={kind}
                  className="rounded-lg border border-border bg-slate-950/40 px-4 py-4 text-sm"
                >
                  {kind} · v{artifact.version}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Source Library</CardTitle>
            <CardDescription>Phase 2 detail shell for uploaded lesson references.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.sources.map((source) => (
              <div
                key={source.id}
                className="rounded-lg border border-border bg-slate-950/40 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{source.title}</div>
                  <Badge variant="outline">{source.kind}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{source.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline Shell</CardTitle>
            <CardDescription>Reserved layout for HTML timeline and render diagnostics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-slate-950/40 p-4 text-sm text-muted-foreground">
              Current panel: {section}
            </div>
            <div className="surface-grid h-64 rounded-lg border border-dashed border-border bg-slate-950/40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
