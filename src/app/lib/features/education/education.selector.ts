import type { RootState } from "../../store";

export const selectAllEducation = (state: RootState) => state.education.list;
export const selectEducationTotal = (state: RootState) =>
  state.education.total;
export const selectSelectedEducation = (state: RootState) =>
  state.education.selectedEducation;
export const selectEducationLoading = (state: RootState) =>
  state.education.loading;
export const selectEducationError = (state: RootState) =>
  state.education.error;

export const selectEducationByTitle =
  (title: string) => (state: RootState) =>
    state.education.list.find(
      (e) => e.title.toLowerCase() === title.toLowerCase()
    ) ?? null;

export const selectEducationByStream =
  (stream: string) => (state: RootState) =>
    state.education.list.filter(
      (e) => e.stream.toLowerCase() === stream.toLowerCase()
    );