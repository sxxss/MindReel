import type { JsonValue } from "@auto/shared";

export type ScriptBeat = {
  id: string;
  text: string;
  notes: string;
  pauseAfterMs: number;
  emphasisTerms: string[];
};

export type ScriptValue = {
  segments: Array<{
    chapterId: string;
    beats: ScriptBeat[];
  }>;
};

export type SceneSpecValue = Array<{
  chapterId: string;
  sceneId: string;
  templateId: string;
  shots: Array<{
    id: string;
    beatRefs: string[];
    anchorTimeMs: number;
    durationMs: number;
    camera: string;
    animationOps: Array<{ id: string; kind: string; targetRef: string; durationMs: number }>;
  }>;
}>;

export type TimelineValue = {
  durationMs: number;
  scenes: Array<{
    sceneId: string;
    startMs: number;
    endMs: number;
    shots: Array<{
      shotId: string;
      startMs: number;
      endMs: number;
      animations: Array<{ id: string; kind: string; targetRef: string; startMs: number; endMs: number }>;
      subtitleCues: Array<{ beatId: string; text: string; startMs: number; endMs: number }>;
    }>;
  }>;
  warnings: Array<{ code: string; message: string }>;
};

const isRecord = (value: JsonValue): value is Record<string, JsonValue> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asArray = (value: JsonValue | undefined) => (Array.isArray(value) ? value : []);
const asString = (value: JsonValue | undefined) => (typeof value === "string" ? value : "");
const asNumber = (value: JsonValue | undefined) => (typeof value === "number" ? value : 0);

export const toScript = (value: JsonValue): ScriptValue | undefined => {
  if (!isRecord(value)) return undefined;
  const segments = asArray(value.segments).flatMap((segment) => {
    if (!isRecord(segment)) return [];
    const beats = asArray(segment.beats).flatMap((beat) => {
      if (!isRecord(beat)) return [];
      return [{
        id: asString(beat.id),
        text: asString(beat.text),
        notes: asString(beat.notes),
        pauseAfterMs: asNumber(beat.pauseAfterMs),
        emphasisTerms: asArray(beat.emphasisTerms).map(asString).filter(Boolean),
      }];
    });
    return [{ chapterId: asString(segment.chapterId), beats }];
  });
  return segments.length > 0 ? { segments } : undefined;
};

export const toSceneSpecs = (value: JsonValue): SceneSpecValue | undefined => {
  if (!Array.isArray(value)) return undefined;
  const scenes = value.flatMap((scene) => {
    if (!isRecord(scene)) return [];
    const shots = asArray(scene.shots).flatMap((shot) => {
      if (!isRecord(shot)) return [];
      const animationOps = asArray(shot.animationOps).flatMap((op) =>
        isRecord(op)
          ? [{ id: asString(op.id), kind: asString(op.kind), targetRef: asString(op.targetRef), durationMs: asNumber(op.durationMs) }]
          : [],
      );
      return [{
        id: asString(shot.id),
        beatRefs: asArray(shot.beatRefs).map(asString).filter(Boolean),
        anchorTimeMs: asNumber(shot.anchorTimeMs),
        durationMs: asNumber(shot.durationMs),
        camera: asString(shot.camera),
        animationOps,
      }];
    });
    return [{ chapterId: asString(scene.chapterId), sceneId: asString(scene.sceneId), templateId: asString(scene.templateId), shots }];
  });
  return scenes.length > 0 ? scenes : undefined;
};

export const toTimeline = (value: JsonValue): TimelineValue | undefined => {
  if (!isRecord(value)) return undefined;
  const scenes = asArray(value.scenes).flatMap((scene) => {
    if (!isRecord(scene)) return [];
    const shots = asArray(scene.shots).flatMap((shot) => {
      if (!isRecord(shot)) return [];
      return [{
        shotId: asString(shot.shotId),
        startMs: asNumber(shot.startMs),
        endMs: asNumber(shot.endMs),
        animations: asArray(shot.animations).flatMap((animation) =>
          isRecord(animation)
            ? [{
                id: asString(animation.id),
                kind: asString(animation.kind),
                targetRef: asString(animation.targetRef),
                startMs: asNumber(animation.startMs),
                endMs: asNumber(animation.endMs),
              }]
            : [],
        ),
        subtitleCues: asArray(shot.subtitleCues).flatMap((cue) =>
          isRecord(cue)
            ? [{ beatId: asString(cue.beatId), text: asString(cue.text), startMs: asNumber(cue.startMs), endMs: asNumber(cue.endMs) }]
            : [],
        ),
      }];
    });
    return [{ sceneId: asString(scene.sceneId), startMs: asNumber(scene.startMs), endMs: asNumber(scene.endMs), shots }];
  });
  const warnings = asArray(value.warnings).flatMap((warning) =>
    isRecord(warning) ? [{ code: asString(warning.code), message: asString(warning.message) }] : [],
  );
  return scenes.length > 0 ? { durationMs: asNumber(value.durationMs), scenes, warnings } : undefined;
};
