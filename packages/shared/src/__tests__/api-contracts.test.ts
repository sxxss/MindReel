import { describe, expect, test } from "vitest";
import * as sharedModule from "../index.ts";

type SharedModule = Record<string, unknown>;

const createdAt = "2026-05-18T10:00:00.000Z";
const updatedAt = "2026-05-18T10:05:00.000Z";

const expectSchema = (mod: SharedModule, exportName: string) => {
  const schema = mod[exportName];
  expect(schema, `${exportName} should be exported from @auto/shared`).toBeDefined();
  expect(typeof (schema as { safeParse?: unknown } | undefined)?.safeParse).toBe("function");
  return schema as { parse: (value: unknown) => unknown };
};

describe("API contracts", () => {
  test("exports and accepts HealthResponseSchema", () => {
    const schema = expectSchema(sharedModule, "HealthResponseSchema");
    expect(schema.parse({ ok: true })).toEqual({ ok: true });
    expect(() => schema.parse({ ok: false })).toThrow();
  });

  test("exports and accepts ApiErrorSchema with zod issues", () => {
    const schema = expectSchema(sharedModule, "ApiErrorSchema");
    const parsed = schema.parse({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid payload",
      issues: [
        {
          code: "too_small",
          message: "title is required",
          path: ["title"],
        },
      ],
    });

    expect(parsed).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid payload",
      issues: [
        {
          code: "too_small",
          message: "title is required",
          path: ["title"],
        },
      ],
    });
  });

  test("exports and defaults CreateProjectInputSchema language to zh-CN", () => {
    const schema = expectSchema(sharedModule, "CreateProjectInputSchema");
    const parsed = schema.parse({
      title: "傅里叶级数为什么能拆波形",
      topic: "傅里叶级数",
      audience: "高中理科生",
      durationTargetSeconds: 120,
    });

    expect(parsed).toMatchObject({
      title: "傅里叶级数为什么能拆波形",
      topic: "傅里叶级数",
      audience: "高中理科生",
      durationTargetSeconds: 120,
      language: "zh-CN",
    });
  });

  test("CreateProjectInputSchema rejects durationTargetSeconds outside 60 to 180", () => {
    const schema = expectSchema(sharedModule, "CreateProjectInputSchema");
    expect(() =>
      schema.parse({
        title: "太短",
        topic: "极限",
        audience: "高一",
        durationTargetSeconds: 30,
      }),
    ).toThrow();
  });

  test("exports and accepts UpdateProjectInputSchema for editable metadata only", () => {
    const schema = expectSchema(sharedModule, "UpdateProjectInputSchema");
    expect(
      schema.parse({
        title: "新标题",
        topic: "新主题",
        audience: "新受众",
        durationTargetSeconds: 90,
        status: "archived",
      }),
    ).toEqual({
      title: "新标题",
      topic: "新主题",
      audience: "新受众",
      durationTargetSeconds: 90,
      status: "archived",
    });
    expect(() => schema.parse({ language: "en-US" })).toThrow();
  });

  test("exports and accepts ProjectListItemSchema without nested sources", () => {
    const schema = expectSchema(sharedModule, "ProjectListItemSchema");
    const parsed = schema.parse({
      id: "project1",
      title: "傅里叶级数为什么能拆波形",
      topic: "傅里叶级数",
      audience: "高中理科生",
      durationTargetSeconds: 120,
      language: "zh-CN",
      createdAt,
      updatedAt,
      status: "active",
      sourceCount: 2,
      latestArtifacts: {
        script: {
          kind: "script",
          version: 2,
          createdAt,
          createdBy: "agent",
          parentVersion: 1,
        },
      },
    });

    expect(parsed).not.toHaveProperty("sources");
    expect(parsed).toMatchObject({
      id: "project1",
      sourceCount: 2,
    });
  });

  test("ProjectListItemSchema rejects embedded sources arrays", () => {
    const schema = expectSchema(sharedModule, "ProjectListItemSchema");
    expect(() =>
      schema.parse({
        id: "project1",
        title: "傅里叶级数为什么能拆波形",
        topic: "傅里叶级数",
        audience: "高中理科生",
        durationTargetSeconds: 120,
        language: "zh-CN",
        createdAt,
        updatedAt,
        status: "active",
        sourceCount: 1,
        latestArtifacts: {},
        sources: [],
      }),
    ).toThrow();
  });

  test("exports and accepts AppendSourceInputSchema", () => {
    const schema = expectSchema(sharedModule, "AppendSourceInputSchema");
    expect(
      schema.parse({
        kind: "url",
        title: "参考资料",
        body: "这是已经抽取好的正文。",
        url: "https://example.com/article",
      }),
    ).toEqual({
      kind: "url",
      title: "参考资料",
      body: "这是已经抽取好的正文。",
      url: "https://example.com/article",
    });
  });

  test("AppendSourceInputSchema rejects url sources without url", () => {
    const schema = expectSchema(sharedModule, "AppendSourceInputSchema");
    expect(() =>
      schema.parse({
        kind: "url",
        title: "参考资料",
        body: "这是已经抽取好的正文。",
      }),
    ).toThrow();
  });

  test("exports and validates route params/query schemas", () => {
    const projectIdSchema = expectSchema(sharedModule, "ProjectIdParamsSchema");
    const jobIdSchema = expectSchema(sharedModule, "JobIdParamsSchema");
    const artifactQuerySchema = expectSchema(sharedModule, "ArtifactQuerySchema");

    expect(projectIdSchema.parse({ id: "project_123" })).toEqual({ id: "project_123" });
    expect(jobIdSchema.parse({ jobId: "job_123" })).toEqual({ jobId: "job_123" });
    expect(artifactQuerySchema.parse({ version: 3 })).toEqual({ version: 3 });
    expect(() => artifactQuerySchema.parse({ version: 0 })).toThrow();
  });

  test("exports and accepts CreatePipelineJobInputSchema for render-chain job kinds", () => {
    const schema = expectSchema(sharedModule, "CreatePipelineJobInputSchema");

    expect(
      schema.parse({
        kind: "autopilot",
        parentArtifactVersion: 2,
        options: {
          focus: "beats",
        },
      }),
    ).toEqual({
      kind: "autopilot",
      parentArtifactVersion: 2,
      options: {
        focus: "beats",
      },
    });

    expect(schema.parse({ kind: "render" })).toEqual({ kind: "render" });
    expect(schema.parse({ kind: "qa" })).toEqual({ kind: "qa" });
    expect(() => schema.parse({ kind: "export" })).toThrow();
  });

  test("exports PipelineEventEnvelopeSchema with typed event metadata", () => {
    const schema = expectSchema(sharedModule, "PipelineEventEnvelopeSchema");

    expect(
      schema.parse({
        id: "event_123",
        jobId: "job_123",
        type: "agent.critic",
        level: "warn",
        message: "Critic requested a revision.",
        createdAt,
        data: {
          round: 1,
          verdict: "revise",
        },
      }),
    ).toEqual({
      id: "event_123",
      jobId: "job_123",
      type: "agent.critic",
      level: "warn",
      message: "Critic requested a revision.",
      createdAt,
      data: {
        round: 1,
        verdict: "revise",
      },
    });
  });

  test("exports and accepts ProviderConfigSchema", () => {
    const schema = expectSchema(sharedModule, "ProviderConfigSchema");
    const parsed = schema.parse({
      llm: {
        provider: "openai-compatible",
        baseUrl: "http://127.0.0.1:8005/v1",
        apiKey: "1234",
        model: "Qwen3.6-35B-A3B-4bit",
      },
      tts: {
        provider: "openai-compatible",
        baseUrl: "http://127.0.0.1:8005/v1",
        apiKey: "1234",
        model: "Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit",
        voice: "vivian",
        piperBin: "piper",
        piperVoiceModel: "",
      },
      image: {
        provider: "mock",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
        model: "gpt-image-1",
        comfyWorkflowPath: "",
      },
      video: {
        provider: "disabled",
        note: "Video provider interface is reserved for future AI video clips.",
      },
      factCheck: {
        provider: "openai-compatible",
        baseUrl: "http://127.0.0.1:8005/v1",
        apiKey: "1234",
        model: "Qwen3.6-35B-A3B-4bit",
      },
    }) as {
      tts: { voice?: string };
      video: { provider: string };
    };

    expect(parsed.tts.voice).toBe("vivian");
    expect(parsed.video.provider).toBe("disabled");
  });

  test("exports PipelineActionInputSchema for project stage actions", () => {
    const schema = expectSchema(sharedModule, "PipelineActionInputSchema");

    expect(
      schema.parse({
        action: "rewrite-beat",
        stage: "script",
        beatId: "beat0001",
        instruction: "把这句讲得更口语。",
      }),
    ).toEqual({
      action: "rewrite-beat",
      stage: "script",
      beatId: "beat0001",
      instruction: "把这句讲得更口语。",
    });

    expect(
      schema.parse({
        action: "change-scene-template",
        stage: "scenes",
        sceneId: "scene001",
        templateId: "FormulaWalk",
      }),
    ).toMatchObject({ action: "change-scene-template", templateId: "FormulaWalk" });
    expect(() => schema.parse({ action: "rewrite-beat", stage: "script" })).toThrow();
  });

  test("exports StageApprovalSchema", () => {
    const schema = expectSchema(sharedModule, "StageApprovalSchema");

    expect(schema.parse({ stage: "voice", approved: true })).toEqual({
      stage: "voice",
      approved: true,
    });
    expect(() => schema.parse({ stage: "lesson", approved: "yes" })).toThrow();
  });

  test("exports provider test schemas", () => {
    const inputSchema = expectSchema(sharedModule, "ProviderTestInputSchema");
    const resultSchema = expectSchema(sharedModule, "ProviderTestResultSchema");

    expect(inputSchema.parse({ kind: "llm" })).toEqual({ kind: "llm" });
    expect(resultSchema.parse({ ok: false, message: "缺少 API Key" })).toEqual({
      ok: false,
      message: "缺少 API Key",
    });
    expect(() => inputSchema.parse({ kind: "image" })).toThrow();
  });

  test("exports project media schemas", () => {
    const querySchema = expectSchema(sharedModule, "ProjectMediaQuerySchema");
    const responseSchema = expectSchema(sharedModule, "ProjectMediaResponseSchema");

    expect(querySchema.parse({ path: "projects/project1/renders/out.mp4" })).toEqual({
      path: "projects/project1/renders/out.mp4",
    });
    expect(responseSchema.parse({ url: "/api/projects/project1/media?path=projects/project1/renders/out.mp4" }))
      .toEqual({ url: "/api/projects/project1/media?path=projects/project1/renders/out.mp4" });
    expect(() => querySchema.parse({ path: "../secrets" })).toThrow();
  });
});
