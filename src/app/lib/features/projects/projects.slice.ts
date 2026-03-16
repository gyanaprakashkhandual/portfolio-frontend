import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { IProject } from "../../types";

interface ProjectsState {
  list: IProject[];
  selectedProject: IProject | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  list: [],
  selectedProject: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllProjects = createAsyncThunk<
  { data: IProject[]; total: number },
  void,
  { rejectValue: string }
>("projects/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(api.projects);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchProjectBySlug = createAsyncThunk<
  IProject,
  string,
  { rejectValue: string }
>("projects/fetchBySlug", async (slug, { rejectWithValue }) => {
  const res = await fetch(`${api.projects}/${slug}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearSelectedProject(state) {
      state.selectedProject = null;
    },
    clearProjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch projects";
      })

      .addCase(fetchProjectBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch project";
      });
  },
});

export const { clearSelectedProject, clearProjectsError } =
  projectsSlice.actions;
export default projectsSlice.reducer;