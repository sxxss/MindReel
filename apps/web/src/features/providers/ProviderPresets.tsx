import type { Dispatch, SetStateAction } from "react";

import type { ProviderConfig, ProviderTestKind } from "@auto/shared";

import { ProviderPresetBar } from "./ProviderPresetBar.tsx";
import { LLM_PRESETS, TTS_PRESETS, type ProviderPreset } from "./provider-presets.ts";

// 按当前 tab 渲染对应的「一键预设」横条，并把选择组装成 provider entry 写回 config。
export const ProviderPresets = ({
  tab,
  setConfig,
}: {
  tab: ProviderTestKind;
  setConfig: Dispatch<SetStateAction<ProviderConfig>>;
}) => {
  if (tab === "llm") {
    return (
      <ProviderPresetBar
        presets={LLM_PRESETS}
        caption="点击自动填好 Base URL 与模型，再填 API Key 即可（Ollama 无需 key）。"
        onApply={(p: ProviderPreset) =>
          setConfig((current) => ({
            ...current,
            llm: {
              provider: "openai-compatible",
              baseUrl: p.baseUrl ?? "",
              model: p.model ?? "",
              ...(p.apiKey ? { apiKey: p.apiKey } : {}),
            },
          }))
        }
      />
    );
  }

  return (
    <ProviderPresetBar
      presets={TTS_PRESETS}
      caption="请自行配置 TTS：推荐 OpenAI TTS（官方）；或指向你自己部署的 OpenAI 兼容服务。"
      onApply={(p: ProviderPreset) =>
        setConfig((current) => ({
          ...current,
          tts: {
            provider: "openai-compatible",
            baseUrl: p.baseUrl ?? "",
            model: p.model ?? "",
            ...(p.apiKey ? { apiKey: p.apiKey } : {}),
            ...(p.voice ? { voice: p.voice } : {}),
          },
        }))
      }
    />
  );
};
