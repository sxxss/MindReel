import type { z } from "zod";

import { SceneFrame } from "../SceneFrame.tsx";
import { HtmlSlide, HtmlSlidePropsSchema } from "../templates/index.ts";

const ARRAY = [2, 7, 11, 15];
const CODE = [
  "while (l < r) {",
  "  int s = a[l] + a[r];",
  "  if (s === target) return [l, r];",
  "  else if (s < target) l++;",
  "  else r--;",
  "}",
];

const arrayHtml = (l: number, r: number) =>
  `<div style="display:flex;gap:16px;justify-content:center;margin-top:40px;">` +
  ARRAY.map((v, i) => {
    const active = i === l || i === r ? " active" : "";
    const tag = i === l ? "L" : i === r ? "R" : "";
    const color = i === l ? "var(--cyan)" : "var(--orange)";
    return (
      `<div style="text-align:center;">` +
      `<div class="hs-cell${active}" style="width:120px;height:120px;font-size:44px;font-weight:600;">${v}</div>` +
      `<div style="color:var(--muted);margin-top:8px;font-size:22px;">${i}</div>` +
      (tag ? `<div style="color:${color};font-weight:700;font-size:26px;margin-top:6px;">${tag}</div>` : `<div style="height:34px;"></div>`) +
      `</div>`
    );
  }).join("") +
  `</div>`;

const codeHtml = (activeLine: number) =>
  `<div class="hs-code hs-panel mono" style="padding:24px 18px;font-size:26px;line-height:1.7;">` +
  CODE.map((line, i) => `<div class="line${i === activeLine ? " active" : ""}">${line}</div>`).join("") +
  `</div>`;

const composite = (l: number, r: number, activeLine: number, compute: string) =>
  `<div style="display:flex;gap:48px;align-items:center;height:100%;">` +
  `<div style="flex:1;">${codeHtml(activeLine)}</div>` +
  `<div style="flex:1.1;">` +
  `<div style="text-align:center;font-size:30px;color:var(--cyan);">target = 9</div>` +
  arrayHtml(l, r) +
  `<div style="text-align:center;margin-top:36px;"><span class="hs-badge" style="font-size:30px;border-color:var(--cyan);">${compute}</span></div>` +
  `</div></div>`;

export const htmlSlideDemoProps: z.infer<typeof HtmlSlidePropsSchema> = {
  title: "两数之和 · 双指针执行追踪",
  steps: [
    { html: composite(0, 3, 1, "2 + 15 = 17 &gt; 9 → R--"), caption: "2 加 15 等于 17，比目标 9 大，右指针左移。" },
    { html: composite(0, 2, 4, "2 + 11 = 13 &gt; 9 → R--"), caption: "2 加 11 等于 13，还是偏大，右指针继续左移。" },
    { html: composite(0, 1, 2, "2 + 7 = 9 ✓ Found"), caption: "2 加 7 正好等于 9，命中，返回下标 [0, 1]。" },
  ],
};

export const HtmlSlideDemo = () => <SceneFrame definition={HtmlSlide} props={htmlSlideDemoProps} />;
