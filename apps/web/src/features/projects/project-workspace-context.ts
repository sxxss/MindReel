import { useOutletContext } from "react-router-dom";

import type { PipelineEvent } from "@auto/shared";

import type { ProjectDetail } from "../../lib/api-client.ts";

export type ProjectWorkspaceContextValue = {
  project: ProjectDetail;
  events: PipelineEvent[];
};

export const useProjectWorkspace = () => useOutletContext<ProjectWorkspaceContextValue>();
