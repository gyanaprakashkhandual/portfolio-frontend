import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { IEducation } from "../../types";

interface EducationState {
  list: IEducation[];
  selectedEducation: IEducation | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: EducationState = {
  list: [],
  selectedEducation: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllEducation = createAsyncThunk<
  { data: IEducation[]; total: number },
  void,
  { rejectValue: string }
>("education/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(api.education);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchEducationByTitle = createAsyncThunk<
  IEducation,
  string,
  { rejectValue: string }
>("education/fetchByTitle", async (title, { rejectWithValue }) => {
  const res = await fetch(`${api.education}/${title}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

export const fetchEducationByStream = createAsyncThunk<
  { stream: string; data: IEducation[]; total: number },
  string,
  { rejectValue: string }
>("education/fetchByStream", async (stream, { rejectWithValue }) => {
  const res = await fetch(`${api.education}/stream/${stream}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { stream, data: json.data, total: json.total };
});

export const fetchEducationByInstitution = createAsyncThunk<
  { institution: string; data: IEducation[]; total: number },
  string,
  { rejectValue: string }
>("education/fetchByInstitution", async (institution, { rejectWithValue }) => {
  const res = await fetch(`${api.education}/institution/${institution}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { institution, data: json.data, total: json.total };
});

const educationSlice = createSlice({
  name: "education",
  initialState,
  reducers: {
    clearSelectedEducation(state) {
      state.selectedEducation = null;
    },
    clearEducationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEducation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEducation.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch education";
      })

      .addCase(fetchEducationByTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducationByTitle.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEducation = action.payload;
      })
      .addCase(fetchEducationByTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch education";
      })

      .addCase(fetchEducationByStream.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducationByStream.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchEducationByStream.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch education by stream";
      })

      .addCase(fetchEducationByInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducationByInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchEducationByInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch education by institution";
      });
  },
});

export const { clearSelectedEducation, clearEducationError } =
  educationSlice.actions;
export default educationSlice.reducer;