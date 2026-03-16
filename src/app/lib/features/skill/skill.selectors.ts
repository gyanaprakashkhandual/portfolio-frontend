import type { RootState } from "../../store";

export const selectAllSkills = (state: RootState) => state.skills.all;
export const selectSkillsTotal = (state: RootState) => state.skills.total;
export const selectSelectedSkill = (state: RootState) =>
  state.skills.selectedSkill;
export const selectSkillsLoading = (state: RootState) => state.skills.loading;
export const selectSkillsError = (state: RootState) => state.skills.error;

export const selectSkillsByCategory =
  (category: string) => (state: RootState) =>
    state.skills.byCategory[category] ?? [];

export const selectSkillsBySubcategory =
  (category: string, subcategory: string) => (state: RootState) =>
    state.skills.byCategory[`${category}/${subcategory}`] ?? [];