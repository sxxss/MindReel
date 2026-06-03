import { useMemo, useState, type ReactNode } from "react";
import { Clock3, Film, Layers, Plus, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { formatDateTime } from "../../lib/format.ts";
import { ProjectCard } from "./components/ProjectCard.tsx";
import { useProjectsQuery } from "./queries.ts";

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) => (
  <div className="studio-panel rounded-lg px-4 py-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {icon}
    </div>
    <p className="mt-3 truncate text-2xl font-semibold">{value}</p>
  </div>
);

export const ProjectsPage = () => {
  const projectsQuery = useProjectsQuery();
  const projects = projectsQuery.data ?? [];
  const [query, setQuery] = useState("");

  const activeProjects = projects.filter((project) => project.status === "active");
  const draftProjects = projects.filter((project) => project.status === "draft");
  const freshestProject = projects[0];

  // 可用的搜索：按标题 / 主题 / 受众过滤。
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return projects;
    return projects.filter((p) =>
      [p.title, p.topic, p.audience].some((field) => field.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  return (
    <div className="flex flex-col gap-6">
      <section className="cinematic-panel rounded-lg border border-border/80 px-5 py-5 sm:px-6 lg:px-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge>Production</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">项目生产台</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                继续制作最近的知识视频，查看生成状态和本地产物。
              </p>
            </div>
          </div>
          <Link
            to="/projects/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="size-4" />
            新建项目
          </Link>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="项目总数" value={projects.length} icon={<Layers className="size-4 text-primary" />} />
        <StatCard label="制作中" value={activeProjects.length} icon={<Sparkles className="size-4 text-primary" />} />
        <StatCard label="草稿" value={draftProjects.length} icon={<Film className="size-4 text-accent" />} />
        <StatCard
          label="最近更新"
          value={freshestProject ? formatDateTime(freshestProject.updatedAt) : "暂无项目"}
          icon={<Clock3 className="size-4 text-muted-foreground" />}
        />
      </div>

      <Card className="bg-card/80">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle>本地项目索引</CardTitle>
            <CardDescription>从本机项目目录同步，优先展示最近制作内容。</CardDescription>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
            <Input
              aria-label="搜索项目"
              className="pl-9"
              placeholder="搜索标题、主题或受众"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-border/60 bg-slate-950/40" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-12 text-center">
              <Film className="size-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">还没有项目，先创建一个新的教学视频项目。</p>
              <Link
                to="/projects/new"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="size-4" /> 新建项目
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              没有匹配「{query}」的项目。
            </div>
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
