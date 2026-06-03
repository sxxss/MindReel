import { BookOpen, FileAudio, Film, ListChecks, Mic2, Route, Sparkles } from "lucide-react";

const steps = [
  { label: "课程大纲", icon: BookOpen, hint: "组织章节和学习目标" },
  { label: "旁白脚本", icon: ListChecks, hint: "拆分口播节奏" },
  { label: "镜头设计", icon: Film, hint: "生成画面说明" },
  { label: "配音轨道", icon: Mic2, hint: "准备音频资源" },
  { label: "时间线", icon: Route, hint: "拼装音画字幕" },
  { label: "渲染产物", icon: FileAudio, hint: "导出本地视频" },
];

export const ProjectCreateAside = () => (
  <section className="cinematic-panel space-y-5 rounded-lg border border-border/80 px-6 py-6">
    <div className="space-y-2">
      <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-5" />
      </div>
      <h2 className="text-xl font-semibold">创建后自动进入生产线</h2>
      <p className="text-sm leading-6 text-muted-foreground">
        系统会保存项目、追加资料并提交 autopilot 任务；你可以随时进入项目工作台查看事件和产物。
      </p>
    </div>
    <div className="grid gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div
            key={step.label}
            className="flex items-center gap-3 rounded-md border border-border/80 bg-slate-950/35 px-4 py-3 text-sm"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">
                {index + 1}. {step.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{step.hint}</p>
            </div>
          </div>
        );
      })}
    </div>
    <div className="rounded-md border border-accent/35 bg-accent/10 px-4 py-4 text-sm text-muted-foreground">
      第一版会自动启动完整生产链路，后续可在阶段页逐步精修每个产物。
    </div>
  </section>
);
