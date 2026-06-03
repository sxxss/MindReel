import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProjectCreatePage } from "../features/projects/project-create-page.tsx";
import { ProjectCurriculumPage } from "../features/projects/project-curriculum-page.tsx";
import { ProjectOverviewPage } from "../features/projects/project-overview-page.tsx";
import { ProjectRenderPage } from "../features/projects/project-render-page.tsx";
import { ProjectScenesPage } from "../features/projects/project-scenes-page.tsx";
import { ProjectScriptPage } from "../features/projects/project-script-page.tsx";
import { ProjectTimelinePage } from "../features/projects/project-timeline-page.tsx";
import { ProjectVoicePage } from "../features/projects/project-voice-page.tsx";
import { ProjectsPage } from "../features/projects/projects-page.tsx";
import { ProjectWorkspaceLayout } from "../features/projects/project-workspace-layout.tsx";
import { ProvidersPage } from "../features/providers/providers-page.tsx";
import { SettingsPage } from "../features/settings/settings-page.tsx";
import { AppLayout } from "./layout.tsx";

type RouterProps = {
  initialEntry?: string;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/new" element={<ProjectCreatePage />} />
      <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
        <Route index element={<ProjectOverviewPage />} />
        <Route path="curriculum" element={<ProjectCurriculumPage />} />
        <Route path="script" element={<ProjectScriptPage />} />
        <Route path="scenes" element={<ProjectScenesPage />} />
        <Route path="voice" element={<ProjectVoicePage />} />
        <Route path="timeline" element={<ProjectTimelinePage />} />
        <Route path="render" element={<ProjectRenderPage />} />
      </Route>
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Routes>
);

export const AppRouter = ({ initialEntry }: RouterProps) =>
  initialEntry === undefined ? (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AppRoutes />
    </BrowserRouter>
  ) : (
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[initialEntry]}
    >
      <AppRoutes />
    </MemoryRouter>
  );
