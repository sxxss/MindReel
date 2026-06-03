import { useEffect, useState } from "react";

import type { ProviderConfig, ProviderTestKind } from "@auto/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";
import { Input } from "../../components/ui/input.tsx";
import { apiClient } from "../../lib/api-client.ts";
import { useProvidersQuery } from "../projects/queries.ts";
import { ProviderPresets } from "./ProviderPresets.tsx";
import { VOICE_PRESETS } from "./provider-presets.ts";

const fallbackConfig: ProviderConfig = {
  llm: { provider: "openai-compatible" },
  tts: { provider: "openai-compatible" },
  image: { provider: "disabled" },
  video: { provider: "disabled" },
  factCheck: { provider: "disabled" },
};

const providerLabels: Record<ProviderTestKind, string> = {
  llm: "LLM",
  tts: "TTS",
};


export const ProvidersPage = () => {
  const queryClient = useQueryClient();
  const providersQuery = useProvidersQuery();
  const [tab, setTab] = useState<ProviderTestKind>("llm");
  const [config, setConfig] = useState<ProviderConfig>(fallbackConfig);
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (providersQuery.data) {
      setConfig(providersQuery.data);
    }
  }, [providersQuery.data]);

  const saveMutation = useMutation({
    mutationFn: apiClient.saveProviders,
    onSuccess: async (saved) => {
      setConfig(saved);
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      setTestMessage("配置已保存");
    },
  });

  const testMutation = useMutation({
    mutationFn: apiClient.testProvider,
    onSuccess: (result) => setTestMessage(result.message),
    onError: (error) =>
      setTestMessage(error instanceof Error ? error.message : "测试连接失败"),
  });

  const entry = config[tab];
  const updateEntry = (key: string, value: string) =>
    setConfig((current) => ({
      ...current,
      [tab]: {
        ...current[tab],
        [key]: value,
      },
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">模型提供方</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          配置 LLM 与 TTS 的 OpenAI 兼容接口；缺 key 或 baseUrl 时测试会返回结构化失败。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider 配置</CardTitle>
          <CardDescription>保存不会触发 pipeline，测试连接只验证当前选中的 tab。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-2">
            {(Object.keys(providerLabels) as ProviderTestKind[]).map((key) => (
              <Button
                key={key}
                type="button"
                variant={tab === key ? "default" : "outline"}
                onClick={() => setTab(key)}
              >
                {providerLabels[key]}
              </Button>
            ))}
          </div>

          <ProviderPresets tab={tab} setConfig={setConfig} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Base URL</span>
              <Input
                aria-label={`${tab}-base-url`}
                value={entry.baseUrl ?? ""}
                onChange={(event) => updateEntry("baseUrl", event.currentTarget.value)}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">API Key</span>
              <Input
                aria-label={`${tab}-api-key`}
                type="password"
                value={entry.apiKey ?? ""}
                onChange={(event) => updateEntry("apiKey", event.currentTarget.value)}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Model</span>
              <Input
                aria-label={`${tab}-model`}
                value={entry.model ?? ""}
                onChange={(event) => updateEntry("model", event.currentTarget.value)}
              />
            </label>
            {tab === "tts" ? (
              <>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Voice 音色</span>
                  <select
                    aria-label={`${tab}-voice-preset`}
                    value={
                      VOICE_PRESETS.some((p) => p.value === entry.voice) ? (entry.voice ?? "") : "__custom__"
                    }
                    onChange={(event) => {
                      if (event.currentTarget.value !== "__custom__") {
                        updateEntry("voice", event.currentTarget.value);
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {VOICE_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                    <option value="__custom__">自定义（在下方输入）</option>
                  </select>
                  <Input
                    aria-label={`${tab}-voice`}
                    value={entry.voice ?? ""}
                    onChange={(event) => updateEntry("voice", event.currentTarget.value)}
                    placeholder="zh-CN-XiaoxiaoNeural"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Language Code</span>
                  <Input
                    aria-label={`${tab}-lang-code`}
                    value={entry.langCode ?? ""}
                    onChange={(event) => updateEntry("langCode", event.currentTarget.value)}
                    placeholder="z"
                  />
                </label>
              </>
            ) : null}
          </div>

          <div className="rounded-md border border-border bg-slate-950/35 px-3 py-3 text-sm text-muted-foreground">
            配置保存后即用于真实生成；可先点「测试连接」确认接口可达。
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => saveMutation.mutate(config)} disabled={saveMutation.isPending}>
              保存配置
            </Button>
            <Button
              variant="outline"
              onClick={() => testMutation.mutate({ kind: tab })}
              disabled={testMutation.isPending}
            >
              测试连接
            </Button>
            {testMessage ? <span className="text-sm text-muted-foreground">{testMessage}</span> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
