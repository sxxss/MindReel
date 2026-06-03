import type { ArtifactKind, JsonValue } from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { cn } from "../../../lib/cn.ts";
import { HtmlSlidePreview } from "./HtmlSlidePreview.tsx";
import { JsonTree } from "./JsonTree.tsx";
import {
  type SceneSpecValue,
  type ScriptValue,
  type TimelineValue,
  toSceneSpecs,
  toScript,
  toTimeline,
} from "./production-artifact-model.ts";

type ProductionArtifactWorkbenchProps = {
  kind: ArtifactKind;
  value: JsonValue;
};

const formatMs = (value: number) => `${Math.round(value / 100) / 10}s`;

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-md border border-border/80 bg-slate-950/35 px-3 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-semibold">{value}</p>
  </div>
);

const ScriptWorkbench = ({ script }: { script: ScriptValue }) => {
  const beats = script.segments.flatMap((segment) => segment.beats);
  return (
    <div className="space-y-4">
      <header>
        <Badge>Review</Badge>
        <h3 className="mt-2 text-xl font-semibold">脚本审片台</h3>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="段落" value={script.segments.length} />
        <Stat label="Beat" value={beats.length} />
        <Stat label="停顿合计" value={formatMs(beats.reduce((total, beat) => total + beat.pauseAfterMs, 0))} />
      </div>
      <div className="space-y-3">
        {script.segments.map((segment) =>
          segment.beats.map((beat) => (
            <article key={beat.id} className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{beat.id}</Badge>
                <span className="text-sm text-muted-foreground">{segment.chapterId}</span>
              </div>
              <p className="mt-3 text-base leading-7">{beat.text}</p>
              <p className="mt-2 text-sm text-muted-foreground">{beat.notes}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">停顿 {beat.pauseAfterMs}ms</Badge>
                {beat.emphasisTerms.map((term) => <Badge key={term} variant="outline">{term}</Badge>)}
              </div>
            </article>
          )),
        )}
      </div>
    </div>
  );
};

const SceneWorkbench = ({ scenes }: { scenes: SceneSpecValue }) => (
  <div className="space-y-4">
    <header>
      <Badge>Review</Badge>
      <h3 className="mt-2 text-xl font-semibold">镜头审片台</h3>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="场景" value={scenes.length} />
      <Stat label="镜头" value={scenes.reduce((total, scene) => total + scene.shots.length, 0)} />
      <Stat label="动画" value={scenes.reduce((total, scene) => total + scene.shots.reduce((sum, shot) => sum + shot.animationOps.length, 0), 0)} />
    </div>
    {scenes.map((scene) => (
      <section key={scene.sceneId} className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{scene.templateId}</Badge>
          <Badge variant="outline">{scene.sceneId}</Badge>
          <span className="text-sm text-muted-foreground">{scene.chapterId}</span>
        </div>
        <div className="mt-4 grid gap-3">
          {scene.shots.map((shot) => (
            <div key={shot.id} className="rounded-md border border-border/80 bg-background/35 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{shot.id}</p>
                <span className="text-sm text-muted-foreground">{formatMs(shot.durationMs)} · {shot.camera}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Beat: {shot.beatRefs.join(", ")}</p>
              <p className="mt-2 text-sm">动画：{shot.animationOps.map((op) => `${op.kind}:${op.targetRef}`).join(" / ")}</p>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const TimelineWorkbench = ({ timeline }: { timeline: TimelineValue }) => (
  <div className="space-y-4">
    <header>
      <Badge>Review</Badge>
      <h3 className="mt-2 text-xl font-semibold">时间线审片台</h3>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat label="总时长" value={formatMs(timeline.durationMs)} />
      <Stat label="场景" value={timeline.scenes.length} />
      <Stat label="警告" value={timeline.warnings.length} />
    </div>
    {timeline.warnings.map((warning) => (
      <div key={`${warning.code}-${warning.message}`} className="rounded-md border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        {warning.message}
      </div>
    ))}
    {timeline.scenes.map((scene) => (
      <section key={scene.sceneId} className="rounded-lg border border-border/80 bg-slate-950/35 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{scene.sceneId}</p>
          <span className="text-sm text-muted-foreground">{formatMs(scene.startMs)} - {formatMs(scene.endMs)}</span>
        </div>
        <div className="mt-4 space-y-3">
          {scene.shots.map((shot) => (
            <div key={shot.shotId} className="rounded-md border border-border/80 bg-background/35 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline">{shot.shotId}</Badge>
                <span className="text-sm text-muted-foreground">{formatMs(shot.startMs)} - {formatMs(shot.endMs)}</span>
              </div>
              {shot.subtitleCues.map((cue) => (
                <p key={`${shot.shotId}-${cue.beatId}`} className="mt-3 text-sm leading-6">{cue.text}</p>
              ))}
              <p className="mt-2 text-xs text-muted-foreground">
                动画：{shot.animations.map((animation) => `${animation.kind}:${animation.targetRef}`).join(" / ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export const ProductionArtifactWorkbench = ({ kind, value }: ProductionArtifactWorkbenchProps) => {
  const script = kind === "script" ? toScript(value) : undefined;
  const scenes = kind === "scene-spec" ? toSceneSpecs(value) : undefined;
  const timeline = kind === "timeline" ? toTimeline(value) : undefined;

  return (
    <div className={cn("space-y-4", kind === "script" && script && "text-foreground")}>
      {script ? <ScriptWorkbench script={script} /> : null}
      {scenes ? <SceneWorkbench scenes={scenes} /> : null}
      {scenes ? <HtmlSlidePreview value={value} /> : null}
      {timeline ? <TimelineWorkbench timeline={timeline} /> : null}
      {!script && !scenes && !timeline ? <JsonTree value={value} /> : null}
    </div>
  );
};
