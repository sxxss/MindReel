// Provider 一键预设——点一下填好 baseUrl/model（/voice），免去查文档。
export type ProviderPreset = {
  label: string;
  hint: string;
  baseUrl?: string;
  model?: string;
  apiKey?: string;
  voice?: string;
};

// LLM：Ollama 本地免费无需 key（填任意非空值即可，Ollama 会忽略）。
export const LLM_PRESETS: ProviderPreset[] = [
  { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat", hint: "便宜，推荐" },
  { label: "通义千问", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus", hint: "阿里云" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", hint: "" },
  { label: "Ollama 本地免费", baseUrl: "http://localhost:11434/v1", model: "qwen2.5", apiKey: "ollama", hint: "零成本、无需 key" },
];

// TTS：由用户自行配置任何 OpenAI 兼容的 /v1/audio/speech 接口。
export const TTS_PRESETS: ProviderPreset[] = [
  { label: "OpenAI TTS（官方）", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini-tts", voice: "alloy", hint: "付费·稳定·官方推荐" },
  { label: "本地 / 自建", baseUrl: "http://localhost:5050/v1", model: "tts-1", voice: "zh-CN-XiaoxiaoNeural", hint: "指向你自己部署的兼容服务" },
];

// 常用中文音色名（按主流 TTS 的命名约定）——免去手敲长名字。
export const VOICE_PRESETS: Array<{ value: string; label: string }> = [
  { value: "zh-CN-XiaoxiaoNeural", label: "晓晓 · 女声 · 温柔自然（默认推荐）" },
  { value: "zh-CN-XiaoyiNeural", label: "晓伊 · 女声 · 活泼" },
  { value: "zh-CN-YunxiNeural", label: "云希 · 男声 · 沉稳" },
  { value: "zh-CN-YunjianNeural", label: "云健 · 男声 · 浑厚" },
  { value: "zh-CN-YunyangNeural", label: "云扬 · 男声 · 专业播音" },
  { value: "zh-CN-XiaomengNeural", label: "晓梦 · 女声 · 知性" },
  { value: "zh-CN-liaoning-XiaobeiNeural", label: "晓北 · 女声 · 东北口音" },
  { value: "zh-CN-shaanxi-XiaoniNeural", label: "晓妮 · 女声 · 陕西口音" },
];
