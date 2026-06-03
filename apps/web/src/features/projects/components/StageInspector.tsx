import type { ReactNode } from "react";

import type { PipelineStage } from "@auto/shared";

import { Button } from "../../../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card.tsx";
import { JobActionButton } from "./JobActionButton.tsx";
import { VersionSelect } from "./VersionSelect.tsx";

type StageInspectorProps = {
  title?: string;
  description: string;
  stage: PipelineStage;
  version?: number | undefined;
  pending?: boolean | undefined;
  disabledReason?: string | undefined;
  onVersionChange?: ((version: number) => void) | undefined;
  onRerun: () => void;
  onApprove: () => void;
  children?: ReactNode;
};

export const StageInspector = ({
  title = "检查器",
  description,
  stage,
  version,
  pending,
  disabledReason,
  onVersionChange,
  onRerun,
  onApprove,
  children,
}: StageInspectorProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <VersionSelect version={version} onChange={onVersionChange} />
        <JobActionButton
          label="重新生成"
          pending={pending}
          disabled={disabledReason !== undefined}
          onClick={onRerun}
        />
        <Button type="button" onClick={onApprove} disabled={pending || disabledReason !== undefined}>
          批准并进入下一步
        </Button>
      </div>
      {disabledReason ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-950/20 px-3 py-3 text-sm text-amber-100">
          {disabledReason}
        </div>
      ) : null}
      <div className="rounded-md border border-border bg-slate-950/35 px-3 py-3 text-sm text-muted-foreground">
        当前阶段：{stage}
      </div>
      {children}
    </CardContent>
  </Card>
);
