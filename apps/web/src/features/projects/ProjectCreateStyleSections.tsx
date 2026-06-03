import { Palette, Zap } from "lucide-react";

import {
  HTML_SLIDE_THEMES,
  HTML_SLIDE_THEME_IDS,
  HTML_SLIDE_THEME_LABELS,
  DEFAULT_HTML_SLIDE_THEME_ID,
  type CreateProjectInput,
} from "@auto/shared";

import { TOPIC_PRESETS, type TopicPreset } from "./project-create-presets.ts";

type Props = {
  form: CreateProjectInput;
  onFieldChange: <TKey extends keyof CreateProjectInput>(key: TKey, value: CreateProjectInput[TKey]) => void;
  onPresetSelect?: (preset: TopicPreset) => void;
};

// 创建页的「快速开始示例主题」+「视觉主题选择」两个区块（从表单抽出，保持表单文件精简）。
export const ProjectCreateStyleSections = ({ form, onFieldChange, onPresetSelect }: Props) => (
  <>
    <section className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-primary" />
        <h2 className="text-sm font-medium">快速开始 — 示例主题</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPIC_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect?.(preset)}
            className="group flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/25 hover:border-primary/50"
          >
            <span className="text-[10px] text-primary/60">{preset.domain}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">8 个领域任意选 · 点击自动填充 · 直接提交即可体验完整流程</p>
    </section>

    <section className="space-y-3 rounded-lg border border-border bg-slate-950/25 px-4 py-4">
      <div className="flex items-center gap-2">
        <Palette className="size-4 text-primary" />
        <h2 className="font-medium">视觉主题</h2>
        <span className="text-xs text-muted-foreground">决定整支视频的配色与质感</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HTML_SLIDE_THEME_IDS.map((id) => {
          const t = HTML_SLIDE_THEMES[id];
          const selected = (form.theme ?? DEFAULT_HTML_SLIDE_THEME_ID) === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFieldChange("theme", id)}
              className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition ${
                selected ? "border-primary/70 ring-2 ring-primary/40" : "border-border/70 hover:border-primary/40"
              }`}
              style={{ background: t.background }}
            >
              <div className="flex gap-1.5">
                {[t.accentCyan, t.accentOrange, t.accentPink, t.accentGreen].map((c) => (
                  <span key={c} className="size-4 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: t.ink }}>
                {HTML_SLIDE_THEME_LABELS[id]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  </>
);
