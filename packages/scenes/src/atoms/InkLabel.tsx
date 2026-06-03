import type { CSSProperties, ReactNode } from "react";

import { motion } from "framer-motion";

import { theme } from "../theme.ts";

type InkLabelProps = {
  children: ReactNode;
  x: number;
  y: number;
  color?: string;
  align?: CSSProperties["textAlign"];
  size?: number;
};

export const InkLabel = ({ children, x, y, color = theme.ink, align = "left", size = 28 }: InkLabelProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      transform: "translate(-50%, -50%)",
      color,
      fontFamily: theme.fontSans,
      fontSize: size,
      lineHeight: 1.35,
      letterSpacing: 0,
      textAlign: align,
      textShadow: `0 4px 18px ${theme.shadow}`,
      whiteSpace: "pre-wrap",
    }}
  >
    {children}
  </motion.div>
);
