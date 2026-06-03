// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";

import { GenerationControlPanel } from "./GenerationControlPanel.tsx";
import { StageProgress } from "./StageProgress.tsx";

const createdAt = "2026-05-18T10:00:00.000Z";

const runningEvents = [
  {
    id: "event_123456",
    jobId: "job_123456",
    type: "job.started",
    level: "info" as const,
    message: "Started autopilot job job_123456",
    createdAt,
  },
];

const knowledgeArtifact = {
  knowledge: { kind: "knowledge" as const, version: 1, createdAt, createdBy: "agent" as const },
};

afterEach(() => {
  cleanup();
});

describe("generation running status", () => {
  test("StageProgress shows a running job from pipeline events", () => {
    render(
      <StageProgress
        latestArtifacts={knowledgeArtifact}
        sourceCount={1}
        events={runningEvents}
      />,
    );

    expect(screen.getByText("正在生成")).toBeInTheDocument();
    expect(screen.getByText("大模型正在生成内容")).toBeInTheDocument();
    expect(screen.getAllByText("运行中").length).toBeGreaterThan(0);
  });

  test("GenerationControlPanel highlights a running job", () => {
    render(
      <MemoryRouter>
        <GenerationControlPanel
          project={{
            id: "project_123456",
            title: "卷积滑动求和",
            topic: "卷积",
            audience: "大学一年级",
            durationTargetSeconds: 90,
            language: "zh-CN",
            theme: "deep-space",
            sources: [
              {
                id: "source_123456",
                kind: "text",
                title: "资料",
                body: "卷积资料",
                digest: "digest-1",
                createdAt,
              },
            ],
            latestArtifacts: knowledgeArtifact,
            createdAt,
            updatedAt: createdAt,
            status: "active",
          }}
          events={runningEvents}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("大模型正在生成内容")).toBeInTheDocument();
    expect(screen.getByText("运行中")).toBeInTheDocument();
  });
});
