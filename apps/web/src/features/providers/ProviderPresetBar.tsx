import type { ProviderPreset } from "./provider-presets.ts";

// 通用「一键预设」横条：LLM 与 TTS 共用。点一下把预设回传给调用方组装 entry。
export const ProviderPresetBar = ({
  presets,
  caption,
  onApply,
}: {
  presets: ProviderPreset[];
  caption: string;
  onApply: (preset: ProviderPreset) => void;
}) => (
  <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-3">
    <p className="text-xs font-medium text-primary">一键预设</p>
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onApply(preset)}
          className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/25"
        >
          <span>{preset.label}</span>
          {preset.hint ? <span className="text-[10px] text-primary/60">{preset.hint}</span> : null}
        </button>
      ))}
    </div>
    <p className="text-xs text-muted-foreground">{caption}</p>
  </div>
);
