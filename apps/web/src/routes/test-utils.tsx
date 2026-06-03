import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { vi } from "vitest";

import { AppRouter } from "../app/router.tsx";
import { artifactFixtures } from "./artifact-fixtures.ts";

export const projectId = "project_abcd1234";
export const createdProjectId = "project_new5678";
export const createdAt = "2026-05-18T10:00:00.000Z";
export const updatedAt = "2026-05-18T10:05:00.000Z";

type ProjectListItem = {
  id: string;
  title: string;
  topic: string;
  audience: string;
  durationTargetSeconds: number;
  language: "zh-CN";
  createdAt: string;
  updatedAt: string;
  status: "draft" | "active" | "archived";
  sourceCount: number;
  latestArtifacts: Record<string, never>;
};

type SourceMock = {
  id: string;
  kind: "text" | "markdown" | "url";
  title: string;
  body: string;
  digest: string;
  createdAt: string;
};

type ArtifactRefMock = {
  kind: string;
  version: number;
  createdAt: string;
  createdBy: "agent" | "human";
};

type ProjectDetailMock = Omit<ProjectListItem, "sourceCount" | "latestArtifacts"> & {
  sources: SourceMock[];
  latestArtifacts: Record<string, ArtifactRefMock>;
};

type FetchState = {
  projects: ProjectListItem[];
  projectDetails: Record<string, ProjectDetailMock>;
  providers: {
    llm: Record<string, string>;
    tts: Record<string, string>;
    image: Record<string, string>;
    video: Record<string, string>;
    factCheck: Record<string, string>;
  };
};

export class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readonly url: string;
  readyState = 1;
  constructor(url: string | URL) {
    this.url = String(url);
    MockEventSource.instances.push(this);
  }
  close() {
    this.readyState = 2;
  }
  emit(payload: unknown) {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(payload) }));
  }
  static reset() {
    MockEventSource.instances = [];
  }
}

const initialProject = {
  id: projectId,
  title: "傅里叶级数为什么能拆波形",
  topic: "傅里叶级数",
  audience: "高中理科生",
  durationTargetSeconds: 120,
  language: "zh-CN" as const,
  createdAt,
  updatedAt,
  status: "active" as const,
  sourceCount: 2,
  latestArtifacts: {},
};

const { sourceCount: _sourceCount, ...initialProjectBase } = initialProject;

const initialProjectDetail = {
  ...initialProjectBase,
  sources: [
    {
      id: "source_123456",
      kind: "text" as const,
      title: "课本摘要",
      body: "傅里叶级数可以把周期信号拆成不同频率的叠加。",
      digest: "digest-1",
      createdAt,
    },
  ],
  latestArtifacts: {
    knowledge: { kind: "knowledge", version: 1, createdAt, createdBy: "agent" as const },
    script: { kind: "script", version: 1, createdAt, createdBy: "agent" as const },
    "scene-spec": { kind: "scene-spec", version: 1, createdAt, createdBy: "agent" as const },
    "voice-track": { kind: "voice-track", version: 1, createdAt, createdBy: "agent" as const },
    timeline: { kind: "timeline", version: 1, createdAt, createdBy: "agent" as const },
  },
};

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

const createProject = (state: FetchState, init?: RequestInit) => {
  const payload = JSON.parse(String(init?.body ?? "{}")) as ProjectListItem;
  const project = {
    id: createdProjectId,
    title: payload.title,
    topic: payload.topic,
    audience: payload.audience,
    durationTargetSeconds: payload.durationTargetSeconds,
    language: "zh-CN" as const,
    sources: [],
    createdAt,
    updatedAt,
    status: "draft" as const,
    latestArtifacts: {},
  };
  state.projects = [{ ...project, sourceCount: 0 }, ...state.projects];
  state.projectDetails[createdProjectId] = project;
  return jsonResponse(project, 201);
};

const appendSource = (state: FetchState) => {
  const project = state.projectDetails[createdProjectId]!;
  const source = {
    id: "source_new1",
    kind: "text" as const,
    title: "粘贴资料",
    body: "这是一段资料",
    digest: "digest-new",
    createdAt,
  };
  state.projectDetails[createdProjectId] = {
    ...project,
    sources: [...project.sources, source],
  };
  return jsonResponse(source, 201);
};

export const buildFetchMock = (options: { failAutopilot?: boolean } = {}) => {
  const state: FetchState = {
    projects: [initialProject],
    projectDetails: { [projectId]: initialProjectDetail },
    providers: {
      llm: { provider: "openai-compatible" },
      tts: { provider: "openai-compatible" },
      image: { provider: "disabled" },
      video: { provider: "disabled" },
      factCheck: { provider: "disabled" },
    },
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
    const method = init?.method ?? "GET";

    if (url.endsWith("/api/projects") && method === "GET") return jsonResponse(state.projects);
    if (url.endsWith("/api/projects") && method === "POST") return createProject(state, init);
    if (url.endsWith(`/api/projects/${projectId}`) && method === "GET") {
      return jsonResponse(state.projectDetails[projectId]);
    }
    for (const [kind, artifact] of Object.entries(artifactFixtures)) {
      if (url.endsWith(`/api/projects/${projectId}/artifacts/${kind}`) && method === "GET") {
        return jsonResponse(artifact);
      }
      if (url.endsWith(`/api/projects/${projectId}/artifacts/${kind}/versions/1`) && method === "GET") {
        return jsonResponse(artifact);
      }
    }
    if (url.endsWith(`/api/projects/${createdProjectId}`) && method === "GET") {
      return jsonResponse(state.projectDetails[createdProjectId]);
    }
    if (url.endsWith(`/api/projects/${createdProjectId}/sources`) && method === "POST") {
      return appendSource(state);
    }
    if (url.endsWith(`/api/projects/${createdProjectId}/jobs`) && method === "POST") {
      if (options.failAutopilot) {
        return jsonResponse(
          {
            statusCode: 503,
            error: "Service Unavailable",
            message: "本地任务队列暂不可用",
          },
          503,
        );
      }
      return jsonResponse({
        id: "job_new123",
        projectId: createdProjectId,
        kind: "autopilot",
        status: "pending",
        createdAt,
        updatedAt,
      }, 202);
    }
    if (url.endsWith("/api/providers") && method === "GET") {
      return jsonResponse(state.providers);
    }
    if (url.endsWith("/api/providers") && method === "PUT") {
      state.providers = JSON.parse(String(init?.body ?? "{}"));
      return jsonResponse(state.providers);
    }
    if (url.endsWith("/api/providers/test") && method === "POST") {
      const { kind } = JSON.parse(String(init?.body ?? "{}")) as { kind: "llm" | "tts" };
      const entry = state.providers[kind];
      if (entry.provider === "mock") {
        return jsonResponse({ ok: true, message: "Mock provider 可用", latencyMs: 1 });
      }
      if (!entry.apiKey) {
        return jsonResponse({ ok: false, message: "缺少 API Key", latencyMs: 1 });
      }
      return jsonResponse({ ok: true, message: "Provider 配置字段完整。", latencyMs: 1 });
    }
    return jsonResponse({ statusCode: 404, error: "Not Found", message: url }, 404);
  });

  return { fetchMock, state };
};

export const renderRoute = (initialEntry: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppRouter initialEntry={initialEntry} />
    </QueryClientProvider>,
  );
};
