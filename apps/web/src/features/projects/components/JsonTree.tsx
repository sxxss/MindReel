import type { JsonValue } from "@auto/shared";

import { cn } from "../../../lib/cn.ts";

type JsonTreeProps = {
  value: JsonValue;
  className?: string;
};

const isRecord = (value: JsonValue): value is Record<string, JsonValue> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const valueLabel = (value: JsonValue): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const Node = ({ name, value, depth }: { name?: string; value: JsonValue; depth: number }) => {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-1">
        {name ? <span className="text-muted-foreground">{name}</span> : null}
        <div className="space-y-1 border-l border-border pl-3">
          {value.map((item, index) => (
            <Node key={index} name={`#${index + 1}`} value={item} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  if (isRecord(value)) {
    return (
      <div className="space-y-1">
        {name ? <span className="text-muted-foreground">{name}</span> : null}
        <div className={cn("space-y-1", depth > 0 && "border-l border-border pl-3")}>
          {Object.entries(value).map(([key, item]) => (
            <Node key={key} name={key} value={item} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(5rem,0.32fr)_1fr] gap-3 rounded-md bg-slate-950/35 px-3 py-2">
      <span className="break-words text-muted-foreground">{name}</span>
      <span className="break-words text-foreground">{valueLabel(value)}</span>
    </div>
  );
};

export const JsonTree = ({ value, className }: JsonTreeProps) => (
  <div className={cn("space-y-2 text-sm", className)}>
    <Node value={value} depth={0} />
  </div>
);
