import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft, FileText, Link as LinkIcon, Rocket, SlidersHorizontal, Target } from "lucide-react";

import type { CreateProjectInput } from "@auto/shared";

import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Textarea } from "../../components/ui/textarea.tsx";
import { ProjectCreateStyleSections } from "./ProjectCreateStyleSections.tsx";
import { type TopicPreset } from "./project-create-presets.ts";

type SubmitError = {
  title: string;
  message: string;
};

type ProjectCreateFormProps = {
  form: CreateProjectInput;
  textSource: string;
  urlSource: string;
  submitError: SubmitError | undefined;
  isPending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onFieldChange: <TKey extends keyof CreateProjectInput>(
    key: TKey,
    value: CreateProjectInput[TKey],
  ) => void;
  onTextSourceChange: (value: string) => void;
  onUrlSourceChange: (value: string) => void;
  onMarkdownSourceChange: (value: { title: string; body: string }) => void;
  onPresetSelect?: (preset: TopicPreset) => void;
};

export const ProjectCreateForm = ({
  form,
  textSource,
  urlSource,
  submitError,
  isPending,
  onSubmit,
  onBack,
  onFieldChange,
  onTextSourceChange,
  onUrlSourceChange,
  onMarkdownSourceChange,
  onPresetSelect,
}: ProjectCreateFormProps) => {
  const handleMarkdownChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      onMarkdownSourceChange({ title: file.name, body: await file.text() });
    }
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <Badge>Guided setup</Badge>
        <CardTitle className="text-2xl">新建视频项目</CardTitle>
        <CardDescription>填写主题、受众和资料，创建后会自动提交 autopilot 生产任务。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <ProjectCreateStyleSections
            form={form}
            onFieldChange={onFieldChange}
            {...(onPresetSelect ? { onPresetSelect } : {})}
          />

          <section className="space-y-4 rounded-lg border border-border bg-slate-950/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h2 className="font-medium">基础设定</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm md:col-span-2">
                <span className="text-muted-foreground">项目标题</span>
                <Input
                  aria-label="项目标题"
                  value={form.title}
                  onChange={(event) => onFieldChange("title", event.currentTarget.value)}
                  placeholder="例如：卷积为什么像滑动求和"
                  required
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-muted-foreground">学习主题</span>
                <Input
                  aria-label="学习主题"
                  value={form.topic}
                  onChange={(event) => onFieldChange("topic", event.currentTarget.value)}
                  placeholder="例如：卷积"
                  required
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="text-muted-foreground">目标受众</span>
                <Input
                  aria-label="目标受众"
                  value={form.audience}
                  onChange={(event) => onFieldChange("audience", event.currentTarget.value)}
                  placeholder="例如：大学一年级"
                  required
                />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-border bg-slate-950/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <h2 className="font-medium">生成目标</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span className="text-muted-foreground">目标时长（秒）</span>
                <Input
                  aria-label="目标时长（秒）"
                  type="number"
                  min={60}
                  max={240}
                  value={form.durationTargetSeconds}
                  onChange={(event) =>
                    onFieldChange("durationTargetSeconds", Number(event.currentTarget.value))
                  }
                  required
                />
                <Input
                  aria-label="目标时长滑块"
                  type="range"
                  min={60}
                  max={240}
                  value={form.durationTargetSeconds}
                  onChange={(event) =>
                    onFieldChange("durationTargetSeconds", Number(event.currentTarget.value))
                  }
                />
              </label>
              <div className="grid gap-4">
                <label className="block space-y-2 text-sm">
                  <span className="text-muted-foreground">语言</span>
                  <Input aria-label="语言" value={form.language} readOnly />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-muted-foreground">风格预设</span>
                  <select
                    aria-label="风格预设"
                    className="h-10 w-full rounded-md border border-input bg-slate-950/60 px-3 text-sm"
                    defaultValue="Chalkboard Dynamics"
                  >
                    <option>Chalkboard Dynamics</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border border-border bg-slate-950/25 px-4 py-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="font-medium">资料输入</h2>
            </div>
            <label className="block space-y-2 text-sm">
              <span className="text-muted-foreground">粘贴文本资料</span>
              <Textarea
                aria-label="粘贴文本资料"
                value={textSource}
                onChange={(event) => onTextSourceChange(event.currentTarget.value)}
                placeholder="可粘贴课本摘要、讲义或你的说明"
                className="min-h-28"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span className="text-muted-foreground">拖入 .md</span>
                <Input
                  aria-label="Markdown 文件"
                  type="file"
                  accept=".md,text/markdown"
                  onChange={handleMarkdownChange}
                />
              </label>
              <label className="block space-y-2 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="size-3.5" />
                  输入 URL
                </span>
                <Input
                  aria-label="输入 URL"
                  type="url"
                  value={urlSource}
                  onChange={(event) => onUrlSourceChange(event.currentTarget.value)}
                  placeholder="https://example.com/reference"
                />
              </label>
            </div>
          </section>

          {submitError ? (
            <div role="alert" className="rounded-md border border-red-500/50 bg-red-950/20 px-4 py-3 text-sm">
              <p className="font-medium text-red-100">{submitError.title}</p>
              <p className="mt-1 text-red-100/80">{submitError.message}</p>
            </div>
          ) : null}
          <section className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-medium">
                <Rocket className="size-4 text-primary" />
                启动生产
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                创建项目后自动追加资料并提交 autopilot 任务。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "创建中..." : "创建项目"}
              </Button>
              <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="size-4" />
                返回
              </Button>
            </div>
          </section>
        </form>
      </CardContent>
    </Card>
  );
};
