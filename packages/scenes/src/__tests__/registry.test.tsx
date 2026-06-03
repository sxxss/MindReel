import React from "react";
import { describe, expect, test } from "vitest";

import { SceneTemplateIdSchema } from "@auto/shared";

import { demoDefinitions } from "../__demos__/index.ts";
import { RemotionRoot } from "../root.tsx";
import { templateRegistry } from "../registry.ts";

describe("templateRegistry", () => {
  test("covers the shared scene template whitelist", () => {
    expect(Object.keys(templateRegistry).sort()).toEqual(
      [...SceneTemplateIdSchema.options].sort(),
    );
  });

  test("accepts one valid payload and rejects one invalid payload per template", () => {
    const cases = {
      TitleHook: {
        valid: {
          title: "为什么负负得正？",
          subtitle: "从对称和方向感开始理解",
          accents: [
            { id: "spark", label: "反直觉", x: 0.2, y: 0.3 },
            { id: "arrow", label: "方向", x: 0.8, y: 0.65 },
          ],
        },
        invalid: { title: "", subtitle: "x", accents: [] },
      },
      NumberLine: {
        valid: {
          title: "把温度变化放到数轴上",
          domain: [-5, 5],
          ticks: [-5, -2, 0, 3, 5],
          points: [{ id: "p1", value: -2, label: "昨天" }],
          cursorValue: 3,
          highlightRange: [-2, 3],
        },
        invalid: { title: "bad", domain: [2], ticks: [], points: [] },
      },
      CartesianPlane: {
        valid: {
          title: "抛物线的轨迹",
          xDomain: [-3, 3],
          yDomain: [-1, 9],
          curves: [{ id: "curve", points: [[-2, 4], [0, 0], [2, 4]], label: "y=x^2" }],
          vectors: [{ id: "vec", from: [0, 0], to: [2, 3], label: "速度" }],
          annotations: [{ id: "ann", text: "顶点", at: [0, 0] }],
        },
        invalid: { title: "bad", xDomain: [0, 1], yDomain: [0], curves: [] },
      },
      GraphNetwork: {
        valid: {
          title: "BFS 扩散顺序",
          nodes: [
            { id: "a", label: "A", x: 0.2, y: 0.2 },
            { id: "b", label: "B", x: 0.5, y: 0.4 },
            { id: "c", label: "C", x: 0.8, y: 0.2 },
          ],
          edges: [
            { id: "ab", from: "a", to: "b" },
            { id: "bc", from: "b", to: "c" },
          ],
          highlightSequence: ["a", "ab", "b", "bc", "c"],
        },
        invalid: { title: "bad", nodes: [], edges: [] },
      },
      FormulaWalk: {
        valid: {
          title: "拆开完全平方",
          tokens: [
            { id: "t1", text: "(a+b)^2" },
            { id: "t2", text: "=" },
            { id: "t3", text: "a^2+2ab+b^2" },
          ],
          highlights: ["t1", "t3"],
          transforms: [{ id: "move1", fromTokenId: "t1", toTokenId: "t3", label: "展开" }],
          notes: [{ id: "n1", text: "中间项来自两次 ab" }],
        },
        invalid: { title: "", tokens: [], highlights: [] },
      },
      ProcessSteps: {
        valid: {
          title: "从资料到视频",
          steps: [
            { id: "s1", title: "研究", detail: "提炼事实" },
            { id: "s2", title: "写稿", detail: "组织口语讲解" },
            { id: "s3", title: "配音", detail: "得到真实时长" },
          ],
        },
        invalid: { title: "bad", steps: [] },
      },
      CompareTwoCol: {
        valid: {
          title: "概念 vs 误解",
          leftTitle: "正确理解",
          rightTitle: "常见误解",
          rows: [
            { id: "r1", left: "导数是局部变化率", right: "导数只是求公式技巧", emphasis: true },
            { id: "r2", left: "极限描述逼近", right: "极限一定能取到", emphasis: false },
          ],
        },
        invalid: { title: "bad", leftTitle: "A", rightTitle: "B", rows: [] },
      },
      CodeFocus: {
        valid: {
          title: "二分查找骨架",
          language: "ts",
          lines: [
            "let left = 0;",
            "let right = arr.length - 1;",
            "while (left <= right) {",
          ],
          highlightedLineIndexes: [2],
          callouts: [{ id: "c1", lineIndex: 2, text: "循环不变量在这里维护" }],
        },
        invalid: { title: "bad", language: "ts", lines: [], highlightedLineIndexes: [] },
      },
      Recap: {
        valid: {
          title: "今天带走这三件事",
          bullets: [
            { id: "b1", icon: "dot", text: "定义先于公式" },
            { id: "b2", icon: "spark", text: "图像解释变化" },
            { id: "b3", icon: "check", text: "例题验证直觉" },
          ],
        },
        invalid: { title: "bad", bullets: [] },
      },
      PointerArray: {
        valid: {
          title: "双指针向中间收缩",
          caption: "left 与 right 逐步靠拢",
          cells: [
            { id: "c0", label: "7" },
            { id: "c1", label: "2" },
            { id: "c2", label: "8" },
            { id: "c3", label: "4" },
          ],
          pointers: [
            { id: "left", label: "left", color: "cyan", stops: [0, 1] },
            { id: "right", label: "right", color: "orange", stops: [3, 2] },
          ],
        },
        invalid: { title: "双指针", cells: [], pointers: [] },
      },
      HtmlSlide: {
        valid: {
          title: "双指针执行追踪",
          steps: [
            { html: "<div class='hs-cell active'>2</div>", caption: "第一步" },
            { html: "<div class='hs-cell'>7</div>" },
          ],
        },
        invalid: { title: "空步骤", steps: [] },
      },
      Outro: {
        valid: {
          title: "下一节继续",
          kicker: "我们接着看为什么卷积像滑动对齐",
          credit: "Mindreel",
        },
        invalid: { title: "", kicker: "x", credit: "y" },
      },
    } satisfies Record<
      keyof typeof templateRegistry,
      { valid: Record<string, unknown>; invalid: Record<string, unknown> }
    >;

    for (const [templateId, definition] of Object.entries(templateRegistry)) {
      const fixture = cases[templateId as keyof typeof cases];
      expect(definition.propsSchema.safeParse(fixture.valid).success).toBe(true);
      expect(definition.propsSchema.safeParse(fixture.invalid).success).toBe(false);
    }
  });
});

describe("demo root", () => {
  test("registers one demo per template", () => {
    expect(demoDefinitions).toHaveLength(SceneTemplateIdSchema.options.length);
    expect(demoDefinitions.map((demo) => demo.id).sort()).toEqual(
      [...SceneTemplateIdSchema.options].sort(),
    );
  });

  test("renders all demo compositions", () => {
    const tree = RemotionRoot();
    expect(React.Children.count(tree.props.children)).toBe(SceneTemplateIdSchema.options.length);
  });
});
