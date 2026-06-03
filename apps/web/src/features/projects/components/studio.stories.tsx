import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProvidersPage } from "../../providers/providers-page.tsx";
import { ActivityLog } from "./ActivityLog.tsx";
import { ArtifactView } from "./ArtifactView.tsx";
import { ScenePreview } from "./ScenePreview.tsx";
import { StageProgress } from "./StageProgress.tsx";
import { VoiceCueRow } from "./VoiceCueRow.tsx";

const createdAt = "2026-05-18T10:00:00.000Z";
const storyClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export const Progress = () => (
  <StageProgress
    qaScore={4.4}
    latestArtifacts={{
      curriculum: { kind: "curriculum", version: 1, createdAt, createdBy: "agent" },
      script: { kind: "script", version: 2, createdAt, createdBy: "agent" },
      "scene-spec": { kind: "scene-spec", version: 1, createdAt, createdBy: "agent" },
      "voice-track": { kind: "voice-track", version: 1, createdAt, createdBy: "agent" },
      timeline: { kind: "timeline", version: 1, createdAt, createdBy: "agent" },
      render: { kind: "render", version: 1, createdAt, createdBy: "agent" },
    }}
  />
);

export const Log = () => (
  <ActivityLog
    events={[
      {
        id: "event_story1",
        jobId: "job_story1",
        type: "job.progress",
        level: "info",
        message: "脚本 critic 已完成，正在局部重写第二个 beat。",
        createdAt,
      },
    ]}
  />
);

export const Artifact = () => (
  <ArtifactView
    title="课程大纲"
    value={{
      title: "傅里叶级数为什么能拆波形",
      chapters: [{ id: "chapter_01", title: "从复杂波形开始", durationMs: 28000 }],
    }}
  />
);

export const Scene = () => <ScenePreview title="滑动窗口如何叠加" templateId="graph" />;

export const VoiceCue = () => (
  <VoiceCueRow text="把这条曲线看成很多简单波的叠加。" actualMs={4300} estimatedMs={3900} />
);

export const ProviderTabs = () => (
  <QueryClientProvider client={storyClient}>
    <ProvidersPage />
  </QueryClientProvider>
);
