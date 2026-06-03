import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { theme } from "../theme.ts";

type HighlightTokenProps = {
  children: ReactNode;
  active?: boolean;
  color?: string;
};

export const HighlightToken = ({
  children,
  active = false,
  color = theme.accentOrange,
}: HighlightTokenProps) => (
  <motion.span
    animate={{
      color: active ? theme.background : theme.ink,
      backgroundColor: active ? color : "rgba(0,0,0,0)",
    }}
    transition={{ duration: 0.35 }}
    style={{
      display: "inline-block",
      borderRadius: 8,
      padding: "2px 8px",
      margin: "0 2px",
    }}
  >
    {children}
  </motion.span>
);
