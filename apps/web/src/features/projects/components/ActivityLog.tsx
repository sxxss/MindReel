import { Maximize2, Minimize2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import type { PipelineEvent } from "@auto/shared";

import { Badge } from "../../../components/ui/badge.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { cn } from "../../../lib/cn.ts";
import { formatDateTime } from "../../../lib/format.ts";

type ActivityLogProps = {
  events: PipelineEvent[];
  className?: string;
};

const levelClass: Record<PipelineEvent["level"], string> = {
  debug: "border-border text-muted-foreground",
  info: "border-primary/50 text-primary",
  warn: "border-accent/50 text-accent",
  error: "border-red-400/60 text-red-300",
};

export const ActivityLog = ({ events, className }: ActivityLogProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新事件到来时自动滚到底部
  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isMinimized]);

  const isRunning = events.some(
    (e) => e.type === "job.started" || e.type.startsWith("agent.") || e.type.startsWith("voice."),
  ) && !events.some((e) => e.type === "job.completed" || e.type === "job.failed");

  if (isClosed) {
    return null;
  }

  return (
    <Card className={cn("max-h-80 overflow-hidden border-border/80 bg-card/95", className)}>
      <CardHeader className="flex-row items-center justify-between gap-3 py-3">
        <div className="min-w-0 flex items-center gap-2">
          {isRunning && (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
          <CardTitle className="text-base">生成事件</CardTitle>
          {isMinimized ? (
            <p className="mt-1 text-xs text-muted-foreground">{events.length} 条事件</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isMinimized ? "展开生成事件" : "缩小生成事件"}
            title={isMinimized ? "展开生成事件" : "缩小生成事件"}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            onClick={() => setIsMinimized((current) => !current)}
          >
            {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="关闭生成事件"
            title="关闭生成事件"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            onClick={() => setIsClosed(true)}
          >
            <X className="size-4" />
          </button>
        </div>
      </CardHeader>
      {isMinimized ? null : (
        <CardContent className="p-0">
        <div ref={scrollRef} className="max-h-60 space-y-2 overflow-y-auto px-6 pb-4 pt-0">
          {events.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
              等待 pipeline 事件
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-border bg-slate-950/50 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className={levelClass[event.level]}>
                    {event.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm">{event.message}</p>
              </div>
            ))
          )}
        </div>
        </CardContent>
      )}
    </Card>
  );
};
