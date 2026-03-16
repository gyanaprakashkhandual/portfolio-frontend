import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { ISkill } from "../../types";

interface SkillsState {
  all: ISkill[];
  byCategory: Record<string, ISkill[]>;
  selectedSkill: ISkill | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: SkillsState = {
  all: [],
  byCategory: {},
  selectedSkill: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllSkills = createAsyncThunk<
  { data: ISkill[]; total: number },
  void,
  { rejectValue: string }
>("skills/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(api.skills);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchSkillsByCategory = createAsyncThunk<
  { category: string; data: ISkill[]; total: number },
  string,
  { rejectValue: string }
>("skills/fetchByCategory", async (category, { rejectWithValue }) => {
  const res = await fetch(`${api.skills}/category/${category}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { category, data: json.data, total: json.total };
});

export const fetchSkillsBySubcategory = createAsyncThunk<
  { category: string; subcategory: string; data: ISkill[]; total: number },
  { category: string; subcategory: string },
  { rejectValue: string }
>(
  "skills/fetchBySubcategory",
  async ({ category, subcategory }, { rejectWithValue }) => {
    const res = await fetch(
      `${api.skills}/category/${category}/${subcategory}`
    );
    const json = await res.json();
    if (!json.success) return rejectWithValue(json.message);
    return { category, subcategory, data: json.data, total: json.total };
  }
);

export const fetchSkillByName = createAsyncThunk<
  ISkill,
  string,
  { rejectValue: string }
>("skills/fetchByName", async (skillName, { rejectWithValue }) => {
  const res = await fetch(`${api.skills}/${skillName}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

const skillsSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    clearSelectedSkill(state) {
      state.selectedSkill = null;
    },
    clearSkillsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch skills";
      })

      .addCase(fetchSkillsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.byCategory[action.payload.category] = action.payload.data;
      })
      .addCase(fetchSkillsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch skills by category";
      })

      .addCase(fetchSkillsBySubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillsBySubcategory.fulfilled, (state, action) => {
        state.loading = false;
        const key = `${action.payload.category}/${action.payload.subcategory}`;
        state.byCategory[key] = action.payload.data;
      })
      .addCase(fetchSkillsBySubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Failed to fetch skills by subcategory";
      })

      .addCase(fetchSkillByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillByName.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSkill = action.payload;
      })
      .addCase(fetchSkillByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch skill";
      });
  },
});

export const { clearSelectedSkill, clearSkillsError } = skillsSlice.actions;
export default skillsSlice.reducer;