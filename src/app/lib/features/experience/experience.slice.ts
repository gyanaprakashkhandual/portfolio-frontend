import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { IExperience } from "../../types";

interface ExperienceState {
  list: IExperience[];
  selectedExperience: IExperience | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ExperienceState = {
  list: [],
  selectedExperience: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllExperience = createAsyncThunk<
  { data: IExperience[]; total: number },
  void,
  { rejectValue: string }
>("experience/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(api.experience);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchExperienceBySlug = createAsyncThunk<
  IExperience,
  string,
  { rejectValue: string }
>("experience/fetchBySlug", async (slug, { rejectWithValue }) => {
  const res = await fetch(`${api.experience}/${slug}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

export const fetchExperienceByCompany = createAsyncThunk<
  { company: string; data: IExperience[]; total: number },
  string,
  { rejectValue: string }
>("experience/fetchByCompany", async (company, { rejectWithValue }) => {
  const res = await fetch(`${api.experience}/company/${company}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { company, data: json.data, total: json.total };
});

export const fetchExperienceByRole = createAsyncThunk<
  { role: string; data: IExperience[]; total: number },
  string,
  { rejectValue: string }
>("experience/fetchByRole", async (role, { rejectWithValue }) => {
  const res = await fetch(`${api.experience}/role/${role}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { role, data: json.data, total: json.total };
});

const experienceSlice = createSlice({
  name: "experience",
  initialState,
  reducers: {
    clearSelectedExperience(state) {
      state.selectedExperience = null;
    },
    clearExperienceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExperience.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllExperience.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch experience";
      })

      .addCase(fetchExperienceBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperienceBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedExperience = action.payload;
      })
      .addCase(fetchExperienceBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch experience";
      })

      .addCase(fetchExperienceByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperienceByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchExperienceByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch experience by company";
      })

      .addCase(fetchExperienceByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperienceByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchExperienceByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch experience by role";
      });
  },
});

export const { clearSelectedExperience, clearExperienceError } =
  experienceSlice.actions;
export default experienceSlice.reducer;