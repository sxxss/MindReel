import { Composition } from "remotion";

import { demoDefinitions } from "./__demos__/index.ts";

export const RemotionRoot = () => (
  <>
    {demoDefinitions.map((demo) => (
      <Composition
        key={demo.id}
        id={demo.id}
        component={demo.component}
        durationInFrames={demo.durationInFrames}
        fps={demo.fps}
        width={demo.width}
        height={demo.height}
        defaultProps={demo.defaultProps}
      />
    ))}
  </>
);
