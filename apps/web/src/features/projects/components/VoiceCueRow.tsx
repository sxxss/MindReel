import { Play } from "lucide-react";

import { Button } from "../../../components/ui/button.tsx";
import { cn } from "../../../lib/cn.ts";

type VoiceCueRowProps = {
  text: string;
  audioSrc?: string;
  actualMs?: number;
  estimatedMs?: number;
};

const formatSeconds = (ms?: number) => (ms === undefined ? "未知" : `${(ms / 1000).toFixed(1)}s`);

export const VoiceCueRow = ({ text, audioSrc, actualMs, estimatedMs }: VoiceCueRowProps) => {
  const diffMs = actualMs !== undefined && estimatedMs !== undefined ? actualMs - estimatedMs : 0;
  const diffRatio = estimatedMs ? Math.min(1, Math.abs(diffMs) / estimatedMs) : 0;

  return (
    <div className="grid gap-3 rounded-md border border-border bg-slate-950/35 px-4 py-3 md:grid-cols-[1fr_11rem]">
      <div className="space-y-2">
        <p className="text-sm leading-6">{text}</p>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={cn("h-full rounded-full", Math.abs(diffMs) > 400 ? "bg-accent" : "bg-primary")}
            style={{ width: `${Math.max(12, diffRatio * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>{formatSeconds(actualMs)}</span>
        <span>/</span>
        <span>{formatSeconds(estimatedMs)}</span>
        {audioSrc ? (
          <audio src={audioSrc} aria-label="配音播放" controls className="hidden" />
        ) : null}
        <Button type="button" variant="outline" className="h-9 w-9 px-0" aria-label="播放配音">
          <Play className="size-4" />
        </Button>
      </div>
    </div>
  );
};
