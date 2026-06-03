import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn.ts";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-primary/16 text-primary",
  secondary: "bg-accent/18 text-accent",
  outline: "border border-border bg-transparent text-muted-foreground",
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
      variants[variant],
      className,
    )}
    {...props}
  />
);
