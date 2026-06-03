import { motion } from "framer-motion";

type TickProps = {
  x: number;
  y: number;
  color: string;
  size?: number;
};

export const Tick = ({ x, y, color, size = 12 }: TickProps) => (
  <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
    <line x1={x} y1={y - size / 2} x2={x} y2={y + size / 2} stroke={color} strokeWidth={2} />
  </motion.g>
);
