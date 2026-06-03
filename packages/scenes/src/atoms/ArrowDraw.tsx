import { AnimatedPath } from "./AnimatedPath.tsx";

type ArrowDrawProps = {
  from: [number, number];
  to: [number, number];
  color: string;
};

export const ArrowDraw = ({ from, to, color }: ArrowDrawProps) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 12;

  const h1: [number, number] = [
    x2 - head * Math.cos(angle - Math.PI / 6),
    y2 - head * Math.sin(angle - Math.PI / 6),
  ];
  const h2: [number, number] = [
    x2 - head * Math.cos(angle + Math.PI / 6),
    y2 - head * Math.sin(angle + Math.PI / 6),
  ];

  return (
    <>
      <AnimatedPath d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={color} strokeWidth={3} />
      <AnimatedPath d={`M ${h1[0]} ${h1[1]} L ${x2} ${y2} L ${h2[0]} ${h2[1]}`} stroke={color} strokeWidth={3} />
    </>
  );
};
