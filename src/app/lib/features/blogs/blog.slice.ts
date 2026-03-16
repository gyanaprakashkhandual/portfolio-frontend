import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { IBlog, IBlogMeta } from "../../types";

interface BlogsState {
  list: IBlogMeta[];
  selectedBlog: IBlog | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  list: [],
  selectedBlog: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllBlogs = createAsyncThunk<
  { data: IBlogMeta[]; total: number },
  void,
  { rejectValue: string }
>("blogs/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(api.blogs);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchBlogBySlug = createAsyncThunk<
  IBlog,
  string,
  { rejectValue: string }
>("blogs/fetchBySlug", async (slug, { rejectWithValue }) => {
  const res = await fetch(`${api.blogs}/${slug}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    clearSelectedBlog(state) {
      state.selectedBlog = null;
    },
    clearBlogsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch blogs";
      })

      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch blog";
      });
  },
});

export const { clearSelectedBlog, clearBlogsError } = blogsSlice.actions;
export default blogsSlice.reducer;