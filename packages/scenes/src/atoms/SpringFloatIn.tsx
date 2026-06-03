import type { ReactNode } from "react";

import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";

type SpringFloatInProps = {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  style?: MotionStyle;
};

export const SpringFloatIn = ({
  children,
  delay = 0,
  x = 0,
  y = 24,
  scale = 0.94,
  style,
}: SpringFloatInProps) => (
  <motion.div
    initial={{ opacity: 0, x, y, scale }}
    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
    transition={{
      type: "spring",
      stiffness: 180,
      damping: 18,
      delay,
    }}
    {...(style ? { style } : {})}
  >
    {children}
  </motion.div>
);
