import { ProjectStagePage } from "./project-stage-page.tsx";
import { stageLookup } from "./stage-definitions.ts";

export const ProjectCurriculumPage = () => <ProjectStagePage stage={stageLookup.curriculum} />;
