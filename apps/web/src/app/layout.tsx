import { Clock3, FolderKanban, Settings2, SlidersHorizontal, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Badge } from "../components/ui/badge.tsx";
import { cn } from "../lib/cn.ts";
import { formatDateTime } from "../lib/format.ts";
import { useAppStore } from "../store/app-store.ts";
import { useProjectsQuery } from "../features/projects/queries.ts";

const navItems = [
  { label: "项目", to: "/projects", icon: FolderKanban },
  { label: "模型提供方", to: "/providers", icon: SlidersHorizontal },
  { label: "设置", to: "/settings", icon: Settings2 },
];

export const AppLayout = () => {
  const projectsQuery = useProjectsQuery();
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const projects = projectsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen min-w-0 max-w-[1680px] lg:grid-cols-[300px_1fr]">
        <aside className="studio-shell min-w-0 border-b border-border/80 px-5 py-5 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
          <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">Mindreel</p>
                <p className="text-lg font-semibold leading-6">本地知识视频生产台</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              管理主题、资料、生成阶段和本地视频产物。
            </p>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium transition",
                      isActive
                        ? "border-primary/45 bg-primary/10 text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground",
                    )
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <section className="mt-7 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">最近项目</p>
              <Badge variant="outline">{projects.length}</Badge>
            </div>
            <div className="space-y-2">
              {projects.slice(0, 6).map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={cn(
                    "block rounded-md border px-3 py-3 text-sm transition hover:border-primary/40 hover:bg-secondary/40",
                    selectedProjectId === project.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/80 bg-card/50",
                  )}
                >
                  <div className="line-clamp-2 font-medium leading-5">{project.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    <span>{project.topic} · {formatDateTime(project.updatedAt)}</span>
                  </div>
                </NavLink>
              ))}
              {projectsQuery.isLoading ? (
                <div className="rounded-md border border-dashed border-border px-3 py-5 text-sm text-muted-foreground">
                  正在同步项目...
                </div>
              ) : null}
              {!projectsQuery.isLoading && projects.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-5 text-sm text-muted-foreground">
                  暂无项目，先创建一个视频主题。
                </div>
              ) : null}
            </div>
          </section>

          <div className="mt-7 rounded-lg border border-border/80 bg-card/50 px-4 py-4 text-sm">
            <p className="font-medium">本地运行</p>
            <p className="mt-1 leading-6 text-muted-foreground">
              数据与产物都存在本机；在「模型提供方」配置好 LLM 与 TTS 即可开始生成。
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto min-w-0 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
