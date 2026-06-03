import type { ReactNode } from "react";

import type { JsonValue } from "@auto/shared";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card.tsx";
import { JsonTree } from "./JsonTree.tsx";

type ArtifactViewProps = {
  title: string;
  description?: string;
  value?: JsonValue | undefined;
  children?: ReactNode;
};

export const ArtifactView = ({ title, description, value, children }: ArtifactViewProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent className="space-y-3">
      <h3 className="text-sm font-medium">产物详情</h3>
      {children ?? (
        value === undefined ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
            暂无产物
          </div>
        ) : (
          <JsonTree value={value} />
        )
      )}
    </CardContent>
  </Card>
);
