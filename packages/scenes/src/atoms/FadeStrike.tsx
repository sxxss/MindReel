import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { theme } from "../theme.ts";

type FadeStrikeProps = {
  children: ReactNode;
  active: boolean;
};

export const FadeStrike = ({ children, active }: FadeStrikeProps) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
    <motion.span animate={{ opacity: active ? 0.45 : 1 }} transition={{ duration: 0.4 }}>
      {children}
    </motion.span>
    <motion.span
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 3,
        background: theme.accentPink,
        transformOrigin: "left center",
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    />
  </div>
);
