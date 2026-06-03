// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  buildFetchMock,
  createdAt,
  createdProjectId,
  MockEventSource,
  projectId,
  renderRoute,
} from "./test-utils.tsx";

beforeEach(() => {
  MockEventSource.reset();
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("web smoke routes", () => {
  test("root route redirects to 项目生产台", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/");

    expect(await screen.findByRole("heading", { name: "项目生产台" })).toBeInTheDocument();
    expect(
      await screen.findByText("继续制作最近的知识视频，查看生成状态和本地产物。"),
    ).toBeInTheDocument();
    expect(await screen.findByText("项目总数")).toBeInTheDocument();
    expect((await screen.findAllByText("傅里叶级数为什么能拆波形")).length).toBeGreaterThan(0);
  });

  test("新建项目页提交后追加资料并自动入队 autopilot", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/projects/new");

    fireEvent.change(await screen.findByLabelText("项目标题"), {
      target: { value: "卷积为什么像滑动求和" },
    });
    fireEvent.change(screen.getByLabelText("学习主题"), { target: { value: "卷积" } });
    fireEvent.change(screen.getByLabelText("目标受众"), { target: { value: "大学一年级" } });
    fireEvent.change(screen.getByLabelText("目标时长（秒）"), { target: { value: "90" } });
    fireEvent.change(screen.getByLabelText("粘贴文本资料"), { target: { value: "这是一段资料" } });
    fireEvent.click(screen.getByRole("button", { name: "创建项目" }));

    expect(await screen.findByRole("heading", { name: "卷积为什么像滑动求和" })).toBeInTheDocument();
    expect(await screen.findByText("生产总览")).toBeInTheDocument();
    expect((await screen.findAllByText("生成控制台")).length).toBeGreaterThan(0);
    expect(await screen.findByText("阶段看板")).toBeInTheDocument();
    expect(await screen.findByText("素材资产")).toBeInTheDocument();
    expect(await screen.findByText("下一步动作")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/projects/${createdProjectId}/sources`),
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/projects/${createdProjectId}/jobs`),
      expect.objectContaining({ method: "POST", body: expect.stringContaining("autopilot") }),
    );
  });

  test("新建项目页在自动生成入队失败时显示明确错误", async () => {
    const { fetchMock } = buildFetchMock({ failAutopilot: true });
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/projects/new");

    fireEvent.change(await screen.findByLabelText("项目标题"), {
      target: { value: "卷积为什么像滑动求和" },
    });
    fireEvent.change(screen.getByLabelText("学习主题"), { target: { value: "卷积" } });
    fireEvent.change(screen.getByLabelText("目标受众"), { target: { value: "大学一年级" } });
    fireEvent.change(screen.getByLabelText("粘贴文本资料"), { target: { value: "这是一段资料" } });
    fireEvent.click(screen.getByRole("button", { name: "创建项目" }));

    expect(await screen.findByText("自动生成任务提交失败")).toBeInTheDocument();
    expect(await screen.findByText("本地任务队列暂不可用")).toBeInTheDocument();
  });

  test("课程大纲阶段页会订阅 SSE 并在事件后刷新项目查询", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute(`/projects/${projectId}/curriculum`);

    expect(await screen.findByRole("heading", { name: "课程大纲" })).toBeInTheDocument();
    expect((await screen.findAllByText("生成控制台")).length).toBeGreaterThan(0);
    expect(await screen.findByText("产物详情")).toBeInTheDocument();
    expect(await screen.findByText("检查器")).toBeInTheDocument();
    expect(MockEventSource.instances[0]?.url).toContain(`/api/projects/${projectId}/events`);

    const detailCallsBefore = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes(`/api/projects/${projectId}`),
    ).length;

    act(() => {
      MockEventSource.instances[0]?.emit({
        id: "event_123456",
        jobId: "job_123456",
        type: "job.progress",
        level: "info",
        message: "curriculum updated",
        createdAt,
      });
    });

    await waitFor(() => {
      const detailCallsAfter = fetchMock.mock.calls.filter((call) =>
        String(call[0]).includes(`/api/projects/${projectId}`),
      ).length;
      expect(detailCallsAfter).toBeGreaterThan(detailCallsBefore);
    });
  });

  test("脚本、镜头和时间线阶段页显示审片工作区", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute(`/projects/${projectId}/script`);
    expect(await screen.findByText("脚本审片台")).toBeInTheDocument();

    renderRoute(`/projects/${projectId}/scenes`);
    expect(await screen.findByText("镜头审片台")).toBeInTheDocument();

    renderRoute(`/projects/${projectId}/timeline`);
    expect(await screen.findByText("时间线审片台")).toBeInTheDocument();
  });

  test("设置页显示本地工作区配置壳层", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/settings");

    expect(await screen.findByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(await screen.findByText("工作区与数据目录")).toBeInTheDocument();
  });

  test("providers route renders LLM and TTS tabs", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/providers");

    expect(await screen.findByRole("heading", { name: "模型提供方" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "LLM" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "TTS" })).toBeInTheDocument();
  });

  test("providers route validates missing API key on test", async () => {
    const { fetchMock } = buildFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/providers");

    // 默认是待配置的 OpenAI 兼容接口（没有 mock 选项）；没填 key 时测试应提示缺少 API Key。
    expect((await screen.findAllByLabelText("llm-base-url")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "测试连接" })[0]!);
    expect(await screen.findByText("缺少 API Key")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "保存配置" })[0]!);
    expect(await screen.findByText("配置已保存")).toBeInTheDocument();
  });
});
