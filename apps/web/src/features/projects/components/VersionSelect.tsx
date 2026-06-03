import { Badge } from "../../../components/ui/badge.tsx";

type VersionSelectProps = {
  version?: number | undefined;
  onChange?: ((version: number) => void) | undefined;
};

export const VersionSelect = ({ version, onChange }: VersionSelectProps) => (
  <label className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">版本</span>
    {version === undefined ? (
      <Badge variant="outline">无版本</Badge>
    ) : (
      <select
        aria-label="版本下拉"
        className="h-9 rounded-md border border-border bg-slate-950/60 px-3 text-sm"
        value={version}
        onChange={(event) => onChange?.(Number(event.currentTarget.value))}
      >
        {Array.from({ length: version }, (_, index) => index + 1).map((item) => (
          <option key={item} value={item}>
            v{item}
          </option>
        ))}
      </select>
    )}
  </label>
);
