import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { IComment } from "../../types";

const BASE = "https://gyanaprakashkhandual.onrender.com/api/music";

interface CommentsState {
  byTrackId: Record<
    string,
    {
      data: IComment[];
      total: number;
      page: number;
      pages: number;
    }
  >;
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  byTrackId: {},
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk<
  {
    trackId: string;
    data: IComment[];
    total: number;
    page: number;
    pages: number;
  },
  { trackId: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  "comments/fetch",
  async ({ trackId, page = 1, limit = 20 }, { rejectWithValue }) => {
    const res = await fetch(
      `${BASE}/${trackId}/comments?page=${page}&limit=${limit}`,
    );
    const json = await res.json();
    if (!json.success) return rejectWithValue(json.message);
    return {
      trackId,
      data: json.data,
      total: json.total,
      page: json.page,
      pages: json.pages,
    };
  },
);

export const addComment = createAsyncThunk<
  { trackId: string; comment: IComment },
  { trackId: string; userId: string; text: string },
  { rejectValue: string }
>("comments/add", async ({ trackId, userId, text }, { rejectWithValue }) => {
  const res = await fetch(`${BASE}/${trackId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { trackId, comment: json.data };
});

export const updateComment = createAsyncThunk<
  { trackId: string; comment: IComment },
  { trackId: string; commentId: string; userId: string; text: string },
  { rejectValue: string }
>(
  "comments/update",
  async ({ trackId, commentId, userId, text }, { rejectWithValue }) => {
    const res = await fetch(`${BASE}/${trackId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text }),
    });
    const json = await res.json();
    if (!json.success) return rejectWithValue(json.message);
    return { trackId, comment: json.data };
  },
);

export const deleteComment = createAsyncThunk<
  { trackId: string; commentId: string },
  { trackId: string; commentId: string; userId: string },
  { rejectValue: string }
>(
  "comments/delete",
  async ({ trackId, commentId, userId }, { rejectWithValue }) => {
    const res = await fetch(
      `${BASE}/${trackId}/comments/${commentId}?userId=${userId}`,
      { method: "DELETE" },
    );
    const json = await res.json();
    if (!json.success) return rejectWithValue(json.message);
    return { trackId, commentId };
  },
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentsError(state) {
      state.error = null;
    },
    clearTrackComments(state, action) {
      delete state.byTrackId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, data, total, page, pages } = action.payload;
        state.byTrackId[trackId] = { data, total, page, pages };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch comments";
      })

      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, comment } = action.payload;
        const entry = state.byTrackId[trackId];
        if (entry) {
          entry.data.unshift(comment);
          entry.total += 1;
        } else {
          state.byTrackId[trackId] = {
            data: [comment],
            total: 1,
            page: 1,
            pages: 1,
          };
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to add comment";
      })

      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, comment } = action.payload;
        const entry = state.byTrackId[trackId];
        if (entry) {
          const idx = entry.data.findIndex((c) => c._id === comment._id);
          if (idx !== -1) entry.data[idx] = comment;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update comment";
      })

      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, commentId } = action.payload;
        const entry = state.byTrackId[trackId];
        if (entry) {
          entry.data = entry.data.filter((c) => c._id !== commentId);
          entry.total -= 1;
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete comment";
      });
  },
});

export const { clearCommentsError, clearTrackComments } = commentsSlice.actions;
export default commentsSlice.reducer;
