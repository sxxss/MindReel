import { motion } from "framer-motion";

type CrosshairProps = {
  x: number;
  y: number;
  color: string;
  radius?: number;
};

export const Crosshair = ({ x, y, color, radius = 16 }: CrosshairProps) => (
  <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
    <circle cx={x} cy={y} r={radius} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 6" />
    <line x1={x - radius - 8} y1={y} x2={x + radius + 8} y2={y} stroke={color} strokeWidth={2} />
    <line x1={x} y1={y - radius - 8} x2={x} y2={y + radius + 8} stroke={color} strokeWidth={2} />
  </motion.g>
);
