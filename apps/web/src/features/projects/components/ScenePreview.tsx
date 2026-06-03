import { Player } from "@remotion/player";
import { interpolate, useCurrentFrame } from "remotion";

type ScenePreviewProps = {
  title: string;
  templateId: string;
  durationInFrames?: number;
};

const PreviewComposition = ({ title, templateId }: ScenePreviewProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 60, 180], [0.12, 0.78, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        background: "#071016",
        color: "#f8fafc",
        fontFamily: "Noto Sans SC, Inter, sans-serif",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <rect x="96" y="92" width="1728" height="896" fill="none" stroke="#38bdf8" strokeWidth="3" />
        <circle cx={520 + progress * 520} cy="500" r="128" fill="none" stroke="#facc15" strokeWidth="9" />
        <path
          d={`M360 740 C ${620 + progress * 180} ${280 + progress * 200}, 1040 820, 1500 360`}
          fill="none"
          stroke="#a7f3d0"
          strokeLinecap="round"
          strokeWidth="10"
        />
        <line x1="420" y1="780" x2={420 + progress * 980} y2="780" stroke="#f8fafc" strokeWidth="6" />
      </svg>
      <div style={{ left: 132, position: "absolute", top: 118 }}>
        <div style={{ color: "#38bdf8", fontSize: 34 }}>{templateId}</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 16 }}>{title}</div>
      </div>
    </div>
  );
};

export const ScenePreview = ({ title, templateId, durationInFrames = 210 }: ScenePreviewProps) => (
  <div className="overflow-hidden rounded-md border border-border bg-slate-950">
    <Player
      component={PreviewComposition}
      compositionWidth={1920}
      compositionHeight={1080}
      durationInFrames={durationInFrames}
      fps={30}
      inputProps={{ title, templateId, durationInFrames }}
      controls
      style={{ aspectRatio: "16 / 9", width: "100%" }}
    />
  </div>
);
