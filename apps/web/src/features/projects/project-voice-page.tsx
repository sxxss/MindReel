import { ProjectStagePage } from "./project-stage-page.tsx";
import { stageLookup } from "./stage-definitions.ts";

export const ProjectVoicePage = () => <ProjectStagePage stage={stageLookup.voice} />;
