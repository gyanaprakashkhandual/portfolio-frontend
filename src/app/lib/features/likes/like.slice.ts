import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = "https://gyanaprakashkhandual.onrender.com/api/music";

interface LikesData {
  count: number;
  userLiked: boolean;
}

interface LikesState {
  byTrackId: Record<string, LikesData>;
  loading: boolean;
  error: string | null;
}

const initialState: LikesState = {
  byTrackId: {},
  loading: false,
  error: null,
};

export const fetchLikes = createAsyncThunk<
  { trackId: string; count: number; userLiked: boolean },
  { trackId: string; userId?: string },
  { rejectValue: string }
>("likes/fetch", async ({ trackId, userId }, { rejectWithValue }) => {
  const params = userId ? `?userId=${userId}` : "";
  const res = await fetch(`${BASE}/${trackId}/likes${params}`);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { trackId, ...json.data };
});

export const toggleLike = createAsyncThunk<
  { trackId: string; count: number; userLiked: boolean },
  { trackId: string; userId: string },
  { rejectValue: string }
>("likes/toggle", async ({ trackId, userId }, { rejectWithValue }) => {
  const res = await fetch(`${BASE}/${trackId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { trackId, ...json.data };
});

const likesSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    optimisticToggleLike(
      state,
      action: { payload: { trackId: string } }
    ) {
      const { trackId } = action.payload;
      const current = state.byTrackId[trackId] ?? { count: 0, userLiked: false };
      state.byTrackId[trackId] = {
        count: current.userLiked ? current.count - 1 : current.count + 1,
        userLiked: !current.userLiked,
      };
    },
    clearLikesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, count, userLiked } = action.payload;
        state.byTrackId[trackId] = { count, userLiked };
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch likes";
      })

      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { trackId, count, userLiked } = action.payload;
        state.byTrackId[trackId] = { count, userLiked };
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to toggle like";
      });
  },
});

export const { clearLikesError, optimisticToggleLike } = likesSlice.actions;
export default likesSlice.reducer;