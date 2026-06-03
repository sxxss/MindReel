import { useState } from "react";

import {
  HTML_SLIDE_THEMES,
  HTML_SLIDE_THEME_IDS,
  HTML_SLIDE_THEME_LABELS,
  DEFAULT_HTML_SLIDE_THEME_ID,
  type HtmlSlideThemeId,
  type Project,
} from "@auto/shared";

import { useToast } from "../../../components/toast/toast-provider.tsx";
import { useCreateJobMutation, useUpdateProjectMutation } from "../queries.ts";

// 渲染页主题切换：选主题 → 改 project.theme → 触发重渲（0 LLM token，复用已生成内容）。
export const ThemeSwitcher = ({ project }: { project: Project }) => {
  const updateProject = useUpdateProjectMutation();
  const createJob = useCreateJobMutation();
  const toast = useToast();
  const [pendingId, setPendingId] = useState<HtmlSlideThemeId | null>(null);

  const current = (project.theme ?? DEFAULT_HTML_SLIDE_THEME_ID) as HtmlSlideThemeId;
  const busy = updateProject.isPending || createJob.isPending;

  const applyTheme = async (id: HtmlSlideThemeId) => {
    if (id === current || busy) return;
    setPendingId(id);
    try {
      await updateProject.mutateAsync({ projectId: project.id, input: { theme: id } });
      await createJob.mutateAsync({ projectId: project.id, input: { kind: "render" } });
      toast.push({
        title: "主题已切换并开始重渲",
        description: `已切到「${HTML_SLIDE_THEME_LABELS[id]}」，完成后即可打开新配色的视频/网页（不消耗 LLM）。`,
        tone: "success",
      });
    } catch (error) {
      toast.push({
        title: "切换失败",
        description: error instanceof Error ? error.message : "请稍后重试。",
        tone: "error",
      });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="rounded-md border border-cyan-500/30 bg-slate-950/40 px-3 py-3 text-sm">
      <p className="font-medium">🎨 视觉主题</p>
      <p className="mt-1 text-xs text-muted-foreground">
        换主题即重渲（复用已生成内容，不花 LLM token）。当前：{HTML_SLIDE_THEME_LABELS[current]}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HTML_SLIDE_THEME_IDS.map((id) => {
          const t = HTML_SLIDE_THEMES[id];
          const selected = id === current;
          return (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => applyTheme(id)}
              className={`flex flex-col gap-1.5 rounded-lg border p-2 text-left transition disabled:opacity-50 ${
                selected ? "border-cyan-400/70 ring-2 ring-cyan-400/40" : "border-border/70 hover:border-cyan-400/40"
              }`}
              style={{ background: t.background }}
            >
              <div className="flex gap-1">
                {[t.accentCyan, t.accentOrange, t.accentPink, t.accentGreen].map((c) => (
                  <span key={c} className="size-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: t.ink }}>
                {pendingId === id ? "重渲中…" : HTML_SLIDE_THEME_LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
