import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn.ts";

export const Separator = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("h-px w-full bg-border", className)} {...props} />
);
