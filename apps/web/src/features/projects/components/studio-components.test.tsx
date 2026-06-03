// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { ActivityLog } from "./ActivityLog.tsx";
import { ArtifactView } from "./ArtifactView.tsx";
import { ProductionArtifactWorkbench } from "./ProductionArtifactWorkbench.tsx";
import { StageProgress } from "./StageProgress.tsx";

const createdAt = "2026-05-18T10:00:00.000Z";

afterEach(() => {
  cleanup();
});

describe("Studio components", () => {
  test("StageProgress displays artifact versions and QA score", () => {
    render(
      <StageProgress
        latestArtifacts={{
          curriculum: { kind: "curriculum", version: 1, createdAt, createdBy: "agent" },
          script: { kind: "script", version: 2, createdAt, createdBy: "agent" },
          render: { kind: "render", version: 1, createdAt, createdBy: "agent" },
          qaReport: { kind: "qa-report", version: 1, createdAt, createdBy: "agent" },
        }}
        qaScore={4.2}
      />,
    );

    expect(screen.getByText("阶段看板")).toBeInTheDocument();
    expect(screen.getByText("已完成 3/6")).toBeInTheDocument();
    expect(screen.getByText("课程")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("QA 4.2")).toBeInTheDocument();
  });

  test("StageProgress shows the active stage and blockers", () => {
    render(<StageProgress latestArtifacts={{}} sourceCount={0} />);

    expect(screen.getByText("当前阻塞")).toBeInTheDocument();
    expect(screen.getByText("缺少来源资料")).toBeInTheDocument();
    expect(screen.getAllByText("等待前置").length).toBeGreaterThan(0);
  });

  test("ActivityLog renders incoming events", () => {
    render(
      <ActivityLog
        events={[
          {
            id: "event_123456",
            jobId: "job_123456",
            type: "job.started",
            level: "info",
            message: "开始生成脚本",
            createdAt,
          },
        ]}
      />,
    );

    expect(screen.getByText("生成事件")).toBeInTheDocument();
    expect(screen.getByText("开始生成脚本")).toBeInTheDocument();
  });

  test("ActivityLog can be minimized, restored, and closed", () => {
    render(
      <ActivityLog
        events={[
          {
            id: "event_123456",
            jobId: "job_123456",
            type: "job.started",
            level: "info",
            message: "开始生成脚本",
            createdAt,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "缩小生成事件" }));

    expect(screen.queryByText("开始生成脚本")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "展开生成事件" }));

    expect(screen.getByText("开始生成脚本")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "关闭生成事件" }));

    expect(screen.queryByText("生成事件")).not.toBeInTheDocument();
  });

  test("ArtifactView renders empty and structured states", () => {
    const { rerender } = render(<ArtifactView title="课程大纲" value={undefined} />);
    expect(screen.getByText("暂无产物")).toBeInTheDocument();

    rerender(<ArtifactView title="课程大纲" value={{ title: "傅里叶", chapters: [{ id: "chap001" }] }} />);
    expect(screen.getByText("傅里叶")).toBeInTheDocument();
    expect(screen.getByText("chap001")).toBeInTheDocument();
  });

  test("ProductionArtifactWorkbench renders script beats for review", () => {
    render(
      <ProductionArtifactWorkbench
        kind="script"
        value={{
          segments: [
            {
              chapterId: "chap0001",
              beats: [
                {
                  id: "beat0001",
                  text: "想象一下，一条复杂的波形像一首合唱。",
                  notes: "画面先给整条波形。",
                  pauseAfterMs: 200,
                  emphasisTerms: ["复杂波形"],
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("脚本审片台")).toBeInTheDocument();
    expect(screen.getByText("beat0001")).toBeInTheDocument();
    expect(screen.getByText("画面先给整条波形。")).toBeInTheDocument();
  });

  test("ProductionArtifactWorkbench renders scene shots for review", () => {
    render(
      <ProductionArtifactWorkbench
        kind="scene-spec"
        value={[
          {
            chapterId: "chap0001",
            sceneId: "scene001",
            templateId: "FormulaWalk",
            props: { title: "把复杂问题拆开" },
            shots: [
              {
                id: "shot0001",
                beatRefs: ["beat0001"],
                anchorTimeMs: 0,
                durationMs: 1600,
                camera: "focus",
                animationOps: [
                  {
                    id: "anim0001",
                    kind: "enter",
                    targetRef: "formula.title",
                    ease: "easeOutCubic",
                    durationMs: 400,
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("镜头审片台")).toBeInTheDocument();
    expect(screen.getByText("FormulaWalk")).toBeInTheDocument();
    expect(screen.getByText("shot0001")).toBeInTheDocument();
  });

  test("ProductionArtifactWorkbench renders timeline warnings and cues", () => {
    render(
      <ProductionArtifactWorkbench
        kind="timeline"
        value={{
          durationMs: 4200,
          scenes: [
            {
              sceneId: "scene001",
              startMs: 0,
              endMs: 4200,
              shots: [
                {
                  shotId: "shot0001",
                  startMs: 0,
                  endMs: 1800,
                  animations: [
                    {
                      id: "anim0001",
                      kind: "enter",
                      targetRef: "formula.title",
                      startMs: 0,
                      endMs: 400,
                    },
                  ],
                  subtitleCues: [
                    {
                      beatId: "beat0001",
                      text: "想象一下，一条复杂的波形像一首合唱。",
                      startMs: 0,
                      endMs: 1400,
                    },
                  ],
                },
              ],
            },
          ],
          warnings: [{ code: "project-duration-drift", message: "总时长偏离目标 20% 以上。" }],
        }}
      />,
    );

    expect(screen.getByText("时间线审片台")).toBeInTheDocument();
    expect(screen.getByText("总时长偏离目标 20% 以上。")).toBeInTheDocument();
    expect(screen.getAllByText("想象一下，一条复杂的波形像一首合唱。").length).toBeGreaterThan(0);
  });
});
