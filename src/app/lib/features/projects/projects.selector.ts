import type { RootState } from "../../store";

export const selectAllProjects = (state: RootState) => state.projects.list;
export const selectProjectsTotal = (state: RootState) => state.projects.total;
export const selectSelectedProject = (state: RootState) =>
  state.projects.selectedProject;
export const selectProjectsLoading = (state: RootState) =>
  state.projects.loading;
export const selectProjectsError = (state: RootState) => state.projects.error;

export const selectProjectBySlug = (slug: string) => (state: RootState) =>
  state.projects.list.find((p) => p.projectSlug === slug) ?? null;