import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

import {
  HTML_SLIDE_THEMES,
  HTML_SLIDE_THEME_LABELS,
  DEFAULT_HTML_SLIDE_THEME_ID,
  type HtmlSlideThemeId,
  type ProjectListItem,
} from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { formatDateTime, formatStatusLabel } from "../../../lib/format.ts";

// 生产链路 7 个阶段，用于在卡片上显示完成进度。
const STAGES: Array<keyof ProjectListItem["latestArtifacts"]> = [
  "knowledge",
  "curriculum",
  "script",
  "scene-spec",
  "voice-track",
  "timeline",
  "render",
];

export const ProjectCard = ({ project }: { project: ProjectListItem }) => {
  const theme = HTML_SLIDE_THEMES[(project.theme as HtmlSlideThemeId) ?? DEFAULT_HTML_SLIDE_THEME_ID];
  const done = STAGES.filter((key) => project.latestArtifacts[key] !== undefined).length;
  const percent = Math.round((done / STAGES.length) * 100);
  const hasRender = project.latestArtifacts.render !== undefined;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border/80 bg-slate-950/35 px-4 py-4 transition hover:border-primary/45 hover:bg-secondary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* 主题色块：一眼看出该项目用的视觉主题 */}
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10"
            style={{ background: theme.background }}
            title={`主题：${HTML_SLIDE_THEME_LABELS[(project.theme as HtmlSlideThemeId) ?? DEFAULT_HTML_SLIDE_THEME_ID]}`}
          >
            <span className="flex gap-0.5">
              {[theme.accentCyan, theme.accentOrange, theme.accentPink].map((c) => (
                <span key={c} className="size-1.5 rounded-full" style={{ background: c }} />
              ))}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{project.title}</p>
            <p className="truncate text-xs text-muted-foreground">{project.topic}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasRender ? (
            <Badge className="gap-1 border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
              <PlayCircle className="size-3" /> 可播放
            </Badge>
          ) : null}
          <Badge variant="outline">{formatStatusLabel(project.status)}</Badge>
        </div>
      </div>

      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {done === STAGES.length ? <CheckCircle2 className="size-3.5 text-emerald-400" /> : null}
          {done}/{STAGES.length}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>{project.audience}</span>
          <span>{project.sourceCount} 条资料</span>
          <span>{project.durationTargetSeconds} 秒</span>
        </div>
        <span className="flex items-center gap-1 whitespace-nowrap">
          {formatDateTime(project.updatedAt)}
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </span>
      </div>
    </Link>
  );
};
