import { ProjectStagePage } from "./project-stage-page.tsx";
import { stageLookup } from "./stage-definitions.ts";

export const ProjectScenesPage = () => <ProjectStagePage stage={stageLookup.scenes} />;
