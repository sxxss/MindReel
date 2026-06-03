import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn.ts";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-md bg-secondary/80", className)} {...props} />
);
