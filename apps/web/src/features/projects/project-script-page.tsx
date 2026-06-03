import { ProjectStagePage } from "./project-stage-page.tsx";
import { stageLookup } from "./stage-definitions.ts";

export const ProjectScriptPage = () => <ProjectStagePage stage={stageLookup.script} />;
