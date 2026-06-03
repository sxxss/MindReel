import { describe, expect, test } from "vitest";
import * as sharedModule from "../index.ts";

type SharedModule = Record<string, unknown>;
type SchemaCase = {
  name: string;
  input: unknown;
  ok: boolean;
  verify?: (parsed: unknown) => void;
};

const createdAt = "2026-05-18T10:00:00.000Z";
const updatedAt = "2026-05-18T10:05:00.000Z";

const expectSchema = (mod: SharedModule, exportName: string) => {
  const schema = mod[exportName];
  expect(schema, `${exportName} should be exported from @auto/shared`).toBeDefined();
  expect(typeof (schema as { safeParse?: unknown } | undefined)?.safeParse).toBe("function");
  return schema as { parse: (value: unknown) => unknown };
};

const runSchemaCases = (schemaName: string, cases: SchemaCase[]) => {
  describe(schemaName, () => {
    test(`${schemaName} is exported`, () => {
      expectSchema(sharedModule, schemaName);
    });

    for (const schemaCase of cases) {
      test(schemaCase.name, () => {
        const schema = expectSchema(sharedModule, schemaName);

        if (schemaCase.ok) {
          const parsed = schema.parse(schemaCase.input);
          schemaCase.verify?.(parsed);
          return;
        }

        expect(() => schema.parse(schemaCase.input)).toThrow();
      });
    }
  });
};

const validSourceText = {
  id: "source01",
  kind: "text",
  title: "引子",
  body: "傅里叶级数可以把周期信号拆成不同频率的叠加。",
  digest: "sha256-text-source",
  createdAt,
};

const validSourceUrl = {
  id: "source02",
  kind: "url",
  title: "参考链接",
  body: "这是一段已经提取出来的网页正文。",
  url: "https://example.com/fourier",
  digest: "sha256-url-source",
  createdAt,
};

const validArtifactRef = {
  kind: "script",
  version: 2,
  createdAt,
  createdBy: "agent",
  parentVersion: 1,
};

const validKnowledgeArtifactRef = {
  kind: "knowledge",
  version: 1,
  createdAt,
  createdBy: "agent",
};

const validLatestArtifacts = {
  knowledge: validKnowledgeArtifactRef,
  curriculum: {
    kind: "curriculum",
    version: 1,
    createdAt,
    createdBy: "human",
  },
  script: validArtifactRef,
  "scene-spec": {
    kind: "scene-spec",
    version: 4,
    createdAt,
    createdBy: "agent",
  },
  "voice-track": {
    kind: "voice-track",
    version: 3,
    createdAt,
    createdBy: "agent",
  },
  timeline: {
    kind: "timeline",
    version: 5,
    createdAt,
    createdBy: "agent",
  },
  render: {
    kind: "render",
    version: 6,
    createdAt,
    createdBy: "agent",
  },
  qaReport: {
    kind: "qa-report",
    version: 7,
    createdAt,
    createdBy: "agent",
  },
};

const validProject = {
  id: "project1",
  title: "傅里叶级数为什么能拆波形",
  topic: "傅里叶级数",
  audience: "高中理科生",
  durationTargetSeconds: 120,
  language: "zh-CN",
  sources: [validSourceText, validSourceUrl],
  createdAt,
  updatedAt,
  status: "active",
  latestArtifacts: validLatestArtifacts,
};

const validKnowledge = {
  facts: [
    {
      id: "fact0001",
      claim: "傅里叶级数能展开周期函数。",
      evidence: "教材章节 1",
      sourceIds: ["source01"],
    },
    {
      id: "fact0002",
      claim: "正交性让系数彼此独立。",
      evidence: "LLM-prior",
      sourceIds: [],
    },
    {
      id: "fact0003",
      claim: "不同频率项对应不同谐波。",
      evidence: "教材章节 2",
      sourceIds: ["source01"],
    },
    {
      id: "fact0004",
      claim: "常数项代表平均值偏移。",
      evidence: "讲义附注",
      sourceIds: ["source02"],
    },
    {
      id: "fact0005",
      claim: "系数大小反映频率贡献。",
      evidence: "网页正文节选",
      sourceIds: ["source02"],
    },
    {
      id: "fact0006",
      claim: "部分和会逐步逼近原函数。",
      evidence: "LLM-prior",
      sourceIds: [],
    },
  ],
  terms: [
    {
      id: "term0001",
      term: "正交基",
      definition: "内积为零的一组基函数。",
    },
    {
      id: "term0002",
      term: "频域",
      definition: "从频率成分观察信号的表示方式。",
    },
    {
      id: "term0003",
      term: "谐波",
      definition: "基频整数倍的频率分量。",
    },
    {
      id: "term0004",
      term: "部分和",
      definition: "只取前若干项时得到的近似表达。",
    },
  ],
  misconceptions: [
    "傅里叶级数不是只能处理声音信号。",
    "频谱高峰不是波形被切成几段。",
  ],
};

const validCurriculum = {
  title: "傅里叶级数入门",
  objective: "理解为什么复杂波形可以拆成简单振动。",
  prerequisites: ["三角函数", "周期函数"],
  chapters: [
    {
      id: "chap0001",
      title: "为什么要拆波",
      learningGoal: "建立问题感",
      expectedSeconds: 20,
      kind: "hook",
    },
    {
      id: "chap0002",
      title: "正交性如何帮忙",
      learningGoal: "理解系数可分开求",
      expectedSeconds: 35,
      kind: "concept",
    },
    {
      id: "chap0003",
      title: "系数是怎么被算出来的",
      learningGoal: "推导积分如何抓住单个频率",
      expectedSeconds: 28,
      kind: "derivation",
    },
    {
      id: "chap0004",
      title: "方波为什么也能拆",
      learningGoal: "观察例子如何落到具体波形",
      expectedSeconds: 24,
      kind: "example",
    },
    {
      id: "chap0005",
      title: "今天真正记住什么",
      learningGoal: "回顾拆波背后的主线",
      expectedSeconds: 16,
      kind: "recap",
    },
  ],
};

const validScript = {
  segments: [
    {
      chapterId: "chap0001",
      beats: [
        {
          id: "beat0001",
          text: "想象一下，一条复杂的波形像一首合唱。",
          notes: "画面先给整条波形，再逐层拆开。",
          pauseAfterMs: 200,
          emphasisTerms: ["复杂波形", "合唱"],
        },
        {
          id: "beat0002",
          text: "我们要问的是，能不能把它拆成很多简单的单音。",
          notes: "让几条单频波逐条出现。",
          pauseAfterMs: 300,
          emphasisTerms: ["拆", "单音"],
        },
      ],
    },
    {
      chapterId: "chap0002",
      beats: [
        {
          id: "beat0003",
          text: "答案之所以可行，关键在正交性。",
          notes: "聚焦到公式中的内积。",
          pauseAfterMs: 250,
          emphasisTerms: ["正交性"],
        },
      ],
    },
  ],
};

const validSceneSpec = {
  chapterId: "chap0001",
  sceneId: "scene001",
  templateId: "FormulaWalk",
  props: {
    title: "把复杂问题拆开",
    formula: "f(x)=a_0+\\sum a_n\\cos(nx)+b_n\\sin(nx)",
  },
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
          toState: {
            opacity: 1,
          },
        },
      ],
    },
    {
      id: "shot0002",
      beatRefs: ["beat0002"],
      anchorTimeMs: 1600,
      durationMs: 1800,
      camera: "pan",
      animationOps: [
        {
          id: "anim0002",
          kind: "highlight",
          targetRef: "formula.sum",
          ease: "linear",
          durationMs: 500,
          fromState: {
            color: "#e6edf3",
          },
          toState: {
            color: "#6ee7d6",
          },
        },
      ],
    },
  ],
};

const validVoiceTrack = {
  cues: [
    {
      beatId: "beat0001",
      audioPath: "data/projects/project1/audio/beat0001.mp3",
      actualDurationMs: 1400,
      provider: "openai-compatible",
      voice: "alloy",
      mimeType: "audio/mpeg",
    },
    {
      beatId: "beat0002",
      audioPath: "data/projects/project1/audio/beat0002.mp3",
      actualDurationMs: 1800,
      provider: "openai-compatible",
      voice: "alloy",
      mimeType: "audio/mpeg",
    },
  ],
};

const validTimeline = {
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
        {
          shotId: "shot0002",
          startMs: 1800,
          endMs: 4200,
          animations: [
            {
              id: "anim0002",
              kind: "highlight",
              targetRef: "formula.sum",
              startMs: 2000,
              endMs: 2600,
              squeezeFactor: 0.8,
            },
          ],
          subtitleCues: [
            {
              beatId: "beat0002",
              text: "我们要问的是，能不能把它拆成很多简单的单音。",
              startMs: 1800,
              endMs: 3600,
            },
          ],
        },
      ],
    },
  ],
  warnings: [
    {
      code: "project-duration-drift",
      message: "总时长偏离目标 20% 以上。",
    },
  ],
};

const validRenderArtifact = {
  projectId: "project1",
  outputPath: "data/projects/project1/renders/knowledge-video.mp4",
  relativePath: "projects/project1/renders/knowledge-video.mp4",
  durationMs: 4200,
  fps: 30,
  width: 1920,
  height: 1080,
  renderedAt: createdAt,
};

const validRenderCompositionInput = {
  project: validProject,
  sceneSpecs: [validSceneSpec],
  voiceTrack: validVoiceTrack,
  timeline: validTimeline,
};

const validQAReport = {
  projectId: "project1",
  renderPath: "data/projects/project1/renders/knowledge-video.mp4",
  checkedAt: createdAt,
  media: {
    durationMs: 4210,
    hasAudio: true,
    audioCodec: "aac",
    averageBitrate: 1800000,
  },
  duration: {
    expectedMs: 4200,
    actualMs: 4210,
    toleranceMs: 200,
    ok: true,
  },
  audio: {
    ok: true,
    message: "检测到音频流。",
  },
  frames: [
    {
      sceneId: "scene001",
      framePath: "data/projects/project1/qa/2026-05-18T10-00-00-000Z/scene001.png",
      sampledAtMs: 2100,
      brightnessMean: 42.5,
      brightnessVariance: 18.2,
      nonEmpty: true,
    },
  ],
  chapterScores: [
    {
      sceneId: "scene001",
      title: "把复杂问题拆开",
      rhythm: 4,
      visualDensity: 4,
      narrationFit: 5,
      suggestions: ["保持当前节奏。"],
    },
  ],
  overallScore: 4.3,
  suggestions: ["整体节奏可用。"],
  warnings: [],
};

const validPipelineJob = {
  id: "job00001",
  projectId: "project1",
  kind: "scene-spec",
  status: "running",
  createdAt,
  updatedAt,
  options: {
    chapterId: "chap0001",
  },
};

const validPipelineEvent = {
  id: "event001",
  jobId: "job00001",
  type: "pipeline.stage",
  level: "info",
  message: "Scene generation started.",
  createdAt,
  data: {
    stage: "scene-spec",
    progressPercent: 40,
  },
  artifactRef: {
    kind: "scene-spec",
    version: 2,
    createdAt,
    createdBy: "agent",
  },
};

runSchemaCases("ProjectSchema", [
  {
    name: "accepts a minimal project and defaults language to zh-CN",
    ok: true,
    input: {
      id: "project2",
      title: "最小项目",
      topic: "极限",
      audience: "高一学生",
      durationTargetSeconds: 60,
      sources: [],
      createdAt,
      updatedAt,
      status: "draft",
      latestArtifacts: {},
    },
    verify: (parsed) => {
      const project = parsed as { language: string };
      expect(project.language).toBe("zh-CN");
    },
  },
  {
    name: "accepts a fully populated project",
    ok: true,
    input: validProject,
  },
  {
    name: "accepts durationTargetSeconds up to 240",
    ok: true,
    input: {
      ...validProject,
      durationTargetSeconds: 240,
    },
  },
  {
    name: "rejects durationTargetSeconds outside 60 to 240",
    ok: false,
    input: {
      ...validProject,
      durationTargetSeconds: 241,
    },
  },
  {
    name: "rejects project status that leaks pipeline job state",
    ok: false,
    input: {
      ...validProject,
      status: "running",
    },
  },
  {
    name: "rejects mismatched artifact kind in latestArtifacts snapshot",
    ok: false,
    input: {
      ...validProject,
      latestArtifacts: {
        ...validLatestArtifacts,
        "voice-track": {
          ...validLatestArtifacts["voice-track"],
          kind: "voice",
        },
      },
    },
  },
]);

runSchemaCases("SourceDocumentSchema", [
  {
    name: "accepts a text source document",
    ok: true,
    input: validSourceText,
  },
  {
    name: "accepts a url source document when url and body are present",
    ok: true,
    input: validSourceUrl,
  },
  {
    name: "rejects a url source without a url field",
    ok: false,
    input: {
      ...validSourceUrl,
      url: undefined,
    },
  },
  {
    name: "rejects an unsupported source kind",
    ok: false,
    input: {
      ...validSourceText,
      kind: "pdf",
    },
  },
  {
    name: "rejects an empty normalized body",
    ok: false,
    input: {
      ...validSourceText,
      body: "",
    },
  },
]);

runSchemaCases("KnowledgeSchema", [
  {
    name: "accepts research output with sourced facts and prior knowledge facts",
    ok: true,
    input: validKnowledge,
  },
  {
    name: "accepts knowledge with multiple misconceptions and terms",
    ok: true,
    input: {
      ...validKnowledge,
      misconceptions: [
        "傅里叶级数不是只能处理声音信号。",
        "频域图像不是对时间轴做简单缩放。",
      ],
    },
  },
  {
    name: "rejects sourced facts that omit sourceIds",
    ok: false,
    input: {
      ...validKnowledge,
      facts: [
        {
          ...validKnowledge.facts[0],
          sourceIds: [],
        },
      ],
    },
  },
  {
    name: "rejects fact claims longer than 50 characters",
    ok: false,
    input: {
      ...validKnowledge,
      facts: [
        {
          ...validKnowledge.facts[0],
          claim:
            "傅里叶级数把一个复杂周期函数拆成许多不同频率的正弦余弦分量的无限求和形式而且每个分量的系数都可以通过积分单独求出来",
        },
        ...validKnowledge.facts.slice(1),
      ],
    },
  },
  {
    name: "rejects terms with blank definitions",
    ok: false,
    input: {
      ...validKnowledge,
      terms: [
        {
          ...validKnowledge.terms[0],
          definition: "",
        },
      ],
    },
  },
  {
    name: "rejects fewer than six facts",
    ok: false,
    input: {
      ...validKnowledge,
      facts: validKnowledge.facts.slice(0, 5),
    },
  },
  {
    name: "rejects misconceptions that are empty strings",
    ok: false,
    input: {
      ...validKnowledge,
      misconceptions: [""],
    },
  },
]);

runSchemaCases("CurriculumSchema", [
  {
    name: "accepts a curriculum with multiple chapters",
    ok: true,
    input: validCurriculum,
  },
  {
    name: "accepts a curriculum with extra example chapters",
    ok: true,
    input: {
      ...validCurriculum,
      chapters: [
        ...validCurriculum.chapters,
        {
          id: "chap0006",
          title: "锯齿波还能怎么拆",
          learningGoal: "比较另一个例子如何映射到系数变化",
          expectedSeconds: 18,
          kind: "example",
        },
      ],
    },
  },
  {
    name: "accepts a curriculum whose prerequisites are empty",
    ok: true,
    input: {
      ...validCurriculum,
      prerequisites: [],
    },
  },
  {
    name: "rejects curricula with fewer than five chapters",
    ok: false,
    input: {
      ...validCurriculum,
      chapters: validCurriculum.chapters.slice(0, 4),
    },
  },
  {
    name: "rejects curricula that miss one required chapter kind",
    ok: false,
    input: {
      ...validCurriculum,
      chapters: validCurriculum.chapters.filter((chapter) => chapter.kind !== "recap"),
    },
  },
  {
    name: "rejects duplicate chapter ids",
    ok: false,
    input: {
      ...validCurriculum,
      chapters: [
        validCurriculum.chapters[0],
        {
          ...validCurriculum.chapters[1],
          id: validCurriculum.chapters[0]!.id,
        },
      ],
    },
  },
  {
    name: "rejects invalid chapter kind",
    ok: false,
    input: {
      ...validCurriculum,
      chapters: [
        {
          ...validCurriculum.chapters[0],
          kind: "summary",
        },
      ],
    },
  },
  {
    name: "rejects non-positive expectedSeconds",
    ok: false,
    input: {
      ...validCurriculum,
      chapters: [
        {
          ...validCurriculum.chapters[0],
          expectedSeconds: 0,
        },
      ],
    },
  },
]);

runSchemaCases("ScriptSchema", [
  {
    name: "accepts script segments grouped by chapter",
    ok: true,
    input: validScript,
  },
  {
    name: "accepts a script beat without emphasis terms",
    ok: true,
    input: {
      segments: [
        {
          chapterId: "chap0003",
          beats: [
            {
              id: "beat0004",
              text: "这时候我们先抓住直觉。",
              notes: "只保留一条字幕。",
              pauseAfterMs: 0,
              emphasisTerms: [],
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects duplicate beat ids across segments",
    ok: false,
    input: {
      segments: [
        validScript.segments[0],
        {
          ...validScript.segments[1],
          beats: [
            {
              ...validScript.segments[1]!.beats[0]!,
              id: validScript.segments[0]!.beats[0]!.id,
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects negative pauseAfterMs",
    ok: false,
    input: {
      segments: [
        {
          chapterId: "chap0001",
          beats: [
            {
              ...validScript.segments[0]!.beats[0]!,
              pauseAfterMs: -1,
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects empty beat text",
    ok: false,
    input: {
      segments: [
        {
          chapterId: "chap0001",
          beats: [
            {
              ...validScript.segments[0]!.beats[0]!,
              text: "",
            },
          ],
        },
      ],
    },
  },
]);

runSchemaCases("SceneSpecSchema", [
  {
    name: "accepts a scene spec that uses a white-listed template",
    ok: true,
    input: validSceneSpec,
  },
  {
    name: "accepts a scene spec with optional fromState omitted",
    ok: true,
    input: {
      ...validSceneSpec,
      shots: [
        {
          ...validSceneSpec.shots[0],
          animationOps: [
            {
              ...validSceneSpec.shots[0]!.animationOps[0]!,
              fromState: undefined,
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects templates outside the white list",
    ok: false,
    input: {
      ...validSceneSpec,
      templateId: "HeroScene",
    },
  },
  {
    name: "rejects legacy template field name",
    ok: false,
    input: {
      ...validSceneSpec,
      templateId: undefined,
      template: "FormulaWalk",
    },
  },
  {
    name: "rejects unsupported camera modes",
    ok: false,
    input: {
      ...validSceneSpec,
      shots: [
        {
          ...validSceneSpec.shots[0],
          camera: "orbit",
        },
      ],
    },
  },
  {
    name: "rejects empty beatRefs on a shot",
    ok: false,
    input: {
      ...validSceneSpec,
      shots: [
        {
          ...validSceneSpec.shots[0],
          beatRefs: [],
        },
      ],
    },
  },
]);

runSchemaCases("RenderArtifactSchema", [
  {
    name: "accepts a render artifact with fixed 1080p geometry",
    ok: true,
    input: validRenderArtifact,
  },
  {
    name: "rejects non-landscape geometry",
    ok: false,
    input: {
      ...validRenderArtifact,
      width: 1080,
      height: 1920,
    },
  },
]);

runSchemaCases("RenderCompositionInputSchema", [
  {
    name: "accepts project, scene specs, voice track, and timeline together",
    ok: true,
    input: validRenderCompositionInput,
  },
]);

runSchemaCases("QAReportSchema", [
  {
    name: "accepts a complete QA report",
    ok: true,
    input: validQAReport,
  },
  {
    name: "rejects chapter scores outside the 0 to 5 range",
    ok: false,
    input: {
      ...validQAReport,
      chapterScores: [
        {
          ...validQAReport.chapterScores[0],
          rhythm: 6,
        },
      ],
    },
  },
]);

runSchemaCases("VoiceTrackSchema", [
  {
    name: "accepts a voice track with multiple cues",
    ok: true,
    input: validVoiceTrack,
  },
  {
    name: "accepts a cue with wav mime type",
    ok: true,
    input: {
      cues: [
        {
          ...validVoiceTrack.cues[0],
          mimeType: "audio/wav",
        },
      ],
    },
  },
  {
    name: "rejects duplicate beat ids",
    ok: false,
    input: {
      cues: [
        validVoiceTrack.cues[0],
        {
          ...validVoiceTrack.cues[1],
          beatId: validVoiceTrack.cues[0]!.beatId,
        },
      ],
    },
  },
  {
    name: "rejects non-positive cue duration",
    ok: false,
    input: {
      cues: [
        {
          ...validVoiceTrack.cues[0],
          actualDurationMs: 0,
        },
      ],
    },
  },
  {
    name: "rejects mime types outside audio/*",
    ok: false,
    input: {
      cues: [
        {
          ...validVoiceTrack.cues[0],
          mimeType: "text/plain",
        },
      ],
    },
  },
]);

runSchemaCases("TimelineSchema", [
  {
    name: "accepts a timeline with structured warnings",
    ok: true,
    input: validTimeline,
  },
  {
    name: "accepts a timeline without warnings",
    ok: true,
    input: {
      ...validTimeline,
      warnings: [],
    },
  },
  {
    name: "rejects squeezeFactor less than or equal to zero",
    ok: false,
    input: {
      ...validTimeline,
      scenes: [
        {
          ...validTimeline.scenes[0],
          shots: [
            {
              ...validTimeline.scenes[0]!.shots[0]!,
              animations: [
                {
                  ...validTimeline.scenes[0]!.shots[0]!.animations[0]!,
                  squeezeFactor: 0,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects subtitle cues whose end precedes start",
    ok: false,
    input: {
      ...validTimeline,
      scenes: [
        {
          ...validTimeline.scenes[0],
          shots: [
            {
              ...validTimeline.scenes[0]!.shots[0]!,
              subtitleCues: [
                {
                  ...validTimeline.scenes[0]!.shots[0]!.subtitleCues[0]!,
                  startMs: 1000,
                  endMs: 500,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: "rejects total duration shorter than the last scene end",
    ok: false,
    input: {
      ...validTimeline,
      durationMs: 1000,
    },
  },
]);

runSchemaCases("PipelineJobSchema", [
  {
    name: "accepts a running pipeline job",
    ok: true,
    input: validPipelineJob,
  },
  {
    name: "accepts a failed job when errorMessage is present",
    ok: true,
    input: {
      ...validPipelineJob,
      status: "failed",
      errorMessage: "Provider timeout",
    },
  },
  {
    name: "rejects a failed job without errorMessage",
    ok: false,
    input: {
      ...validPipelineJob,
      status: "failed",
      errorMessage: undefined,
    },
  },
  {
    name: "rejects unknown pipeline job kinds",
    ok: false,
    input: {
      ...validPipelineJob,
      kind: "scenes",
    },
  },
  {
    name: "rejects negative parentArtifactVersion",
    ok: false,
    input: {
      ...validPipelineJob,
      parentArtifactVersion: -1,
    },
  },
]);

runSchemaCases("PipelineEventSchema", [
  {
    name: "accepts an event with an attached artifact ref",
    ok: true,
    input: validPipelineEvent,
  },
  {
    name: "accepts an event without artifactRef and data",
    ok: true,
    input: {
      ...validPipelineEvent,
      data: undefined,
      artifactRef: undefined,
    },
  },
  {
    name: "rejects empty event types",
    ok: false,
    input: {
      ...validPipelineEvent,
      type: "",
    },
  },
  {
    name: "rejects unknown event levels",
    ok: false,
    input: {
      ...validPipelineEvent,
      level: "trace",
    },
  },
  {
    name: "rejects artifact refs that use camelCase kinds",
    ok: false,
    input: {
      ...validPipelineEvent,
      artifactRef: {
        ...validPipelineEvent.artifactRef,
        kind: "voiceTrack",
      },
    },
  },
  {
    name: "rejects empty event messages",
    ok: false,
    input: {
      ...validPipelineEvent,
      message: "",
    },
  },
]);
