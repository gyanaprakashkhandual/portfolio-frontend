import type { RootState } from "../../store";

export const selectAllExperience = (state: RootState) => state.experience.list;
export const selectExperienceTotal = (state: RootState) =>
  state.experience.total;
export const selectSelectedExperience = (state: RootState) =>
  state.experience.selectedExperience;
export const selectExperienceLoading = (state: RootState) =>
  state.experience.loading;
export const selectExperienceError = (state: RootState) =>
  state.experience.error;

export const selectExperienceBySlug =
  (slug: string) => (state: RootState) =>
    state.experience.list.find((e) => e.slug === slug) ?? null;

export const selectExperienceByCompany =
  (company: string) => (state: RootState) =>
    state.experience.list.filter(
      (e) => e.company.toLowerCase() === company.toLowerCase()
    );