import { useState, useCallback, useEffect, useRef } from "react";

import type { JsonValue } from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { buildSrcdoc, parseHtmlSlideScenes } from "./html-slide-preview-utils.ts";

// ---- component ----
type Props = { value: JsonValue; themeId?: string };

export const HtmlSlidePreview = ({ value, themeId }: Props) => {
  const scenes = parseHtmlSlideScenes(value);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const changeScene = useCallback((idx: number) => {
    setSceneIdx(idx);
    setStepIdx(0);
  }, []);

  // 键盘导航：← → 翻步骤，[ ] 切场景
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // 只在预览组件 focused 时响应（或全局响应，更方便）
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setStepIdx((s) => {
          const scene = scenes[sceneIdx];
          if (!scene) return s;
          return Math.min(scene.steps.length - 1, s + 1);
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setStepIdx((s) => Math.max(0, s - 1));
      } else if (e.key === "]") {
        setSceneIdx((i) => Math.min(scenes.length - 1, i + 1));
        setStepIdx(0);
      } else if (e.key === "[") {
        setSceneIdx((i) => Math.max(0, i - 1));
        setStepIdx(0);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scenes, sceneIdx]);

  if (scenes.length === 0) return null;

  const scene = scenes[Math.min(sceneIdx, scenes.length - 1)]!;
  const step = scene.steps[Math.min(stepIdx, scene.steps.length - 1)]!;
  const totalSteps = scene.steps.length;
  const srcdoc = buildSrcdoc(step, scene.title, themeId);

  return (
    <div ref={containerRef} className="space-y-4 rounded-xl border border-cyan-500/20 bg-slate-950/60 p-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">▶ 幻灯片预览</Badge>
          <span className="text-xs text-muted-foreground">LLM 生成的动画将在视频中 1:1 呈现</span>
        </div>
        <span className="text-xs text-muted-foreground/60">← → 翻步骤 · [ ] 切场景</span>
      </div>

      {/* scene tabs */}
      {scenes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {scenes.map((s, i) => (
            <button
              key={s.sceneId}
              onClick={() => changeScene(i)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                i === sceneIdx
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                  : "border-border/60 bg-slate-900/50 text-muted-foreground hover:border-cyan-500/30"
              }`}
            >
              {s.title ?? s.sceneId}
            </button>
          ))}
        </div>
      )}

      {/* 16:9 iframe viewport */}
      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-700/50"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          key={`${sceneIdx}-${stepIdx}`}
          srcDoc={srcdoc}
          sandbox="allow-scripts"
          className="absolute inset-0 h-full w-full border-0"
          title={`${scene.sceneId} step ${stepIdx + 1}`}
        />
      </div>

      {/* step dots + nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={stepIdx === 0}
          onClick={() => setStepIdx((s) => s - 1)}
          className="h-8 px-3"
        >
          ←
        </Button>
        <div className="flex items-center gap-2">
          {scene.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`rounded-full transition-all ${
                i === stepIdx
                  ? "h-3 w-3 bg-cyan-400"
                  : "h-2 w-2 bg-slate-600 hover:bg-slate-400"
              }`}
              title={`步骤 ${i + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          disabled={stepIdx === totalSteps - 1}
          onClick={() => setStepIdx((s) => s + 1)}
          className="h-8 px-3"
        >
          →
        </Button>
      </div>

      {/* step counter + caption */}
      <div className="flex flex-col gap-1.5">
        <p className="text-center text-xs text-muted-foreground">
          第 {stepIdx + 1} 步 / 共 {totalSteps} 步 · {scene.chapterId}
        </p>
        {step.caption && (
          <p className="rounded-md border border-border/50 bg-slate-900/50 px-3 py-2 text-sm text-muted-foreground">
            🎙 {step.caption}
          </p>
        )}
      </div>
    </div>
  );
};
