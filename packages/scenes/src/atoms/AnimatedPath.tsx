import { motion } from "framer-motion";

type AnimatedPathProps = {
  d: string;
  stroke: string;
  strokeWidth?: number;
  delay?: number;
  fill?: string;
  opacity?: number;
};

export const AnimatedPath = ({
  d,
  stroke,
  strokeWidth = 4,
  delay = 0,
  fill = "none",
  opacity = 1,
}: AnimatedPathProps) => (
  <motion.path
    d={d}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity }}
    transition={{ duration: 1.1, ease: "easeInOut", delay }}
  />
);
