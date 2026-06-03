export const artifactFixtures: Record<string, unknown> = {
  script: {
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
  },
  "scene-spec": [
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
  ],
  timeline: {
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
  },
};
