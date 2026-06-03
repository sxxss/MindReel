import { create } from "zustand";

import type { PipelineEvent } from "@auto/shared";

type AppStore = {
  selectedProjectId?: string | undefined;
  inspectorCollapsed: boolean;
  artifactVersions: Record<string, number | undefined>;
  activityEvents: Record<string, PipelineEvent[]>;
  setSelectedProjectId: (projectId?: string) => void;
  setInspectorCollapsed: (value: boolean) => void;
  setArtifactVersion: (key: string, version?: number) => void;
  setActivityEvents: (projectId: string, events: PipelineEvent[]) => void;
  appendActivityEvent: (projectId: string, event: PipelineEvent) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  selectedProjectId: undefined,
  inspectorCollapsed: false,
  artifactVersions: {},
  activityEvents: {},
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setInspectorCollapsed: (inspectorCollapsed) => set({ inspectorCollapsed }),
  setArtifactVersion: (key, version) =>
    set((state) => ({
      artifactVersions: {
        ...state.artifactVersions,
        [key]: version,
      },
    })),
  setActivityEvents: (projectId, events) =>
    set((state) => ({
      activityEvents: {
        ...state.activityEvents,
        [projectId]: events.slice(-80),
      },
    })),
  appendActivityEvent: (projectId, event) =>
    set((state) => ({
      activityEvents: {
        ...state.activityEvents,
        [projectId]: [...(state.activityEvents[projectId] ?? []), event].slice(-80),
      },
    })),
}));
