import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { IMusic, ApiResponse } from "../../types";

const BASE = "https://gyanaprakashkhandual.onrender.com/api/music";

interface MusicState {
  tracks: IMusic[];
  selectedTrack: IMusic | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: MusicState = {
  tracks: [],
  selectedTrack: null,
  total: 0,
  loading: false,
  error: null,
};

export const fetchAllMusic = createAsyncThunk<
  { data: IMusic[]; total: number },
  void,
  { rejectValue: string }
>("music/fetchAll", async (_, { rejectWithValue }) => {
  const res = await fetch(BASE);
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return { data: json.data, total: json.total };
});

export const fetchMusicById = createAsyncThunk<
  IMusic,
  string,
  { rejectValue: string }
>("music/fetchById", async (id, { rejectWithValue }) => {
  const res = await fetch(`${BASE}/${id}`);
  const json: ApiResponse<IMusic> = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

export const createMusic = createAsyncThunk<
  IMusic,
  Partial<IMusic>,
  { rejectValue: string }
>("music/create", async (body, { rejectWithValue }) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<IMusic> = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

export const updateMusic = createAsyncThunk<
  IMusic,
  { id: string; body: Partial<IMusic> },
  { rejectValue: string }
>("music/update", async ({ id, body }, { rejectWithValue }) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<IMusic> = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return json.data;
});

export const deleteMusic = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("music/delete", async (id, { rejectWithValue }) => {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
  return id;
});

const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    clearSelectedTrack(state) {
      state.selectedTrack = null;
    },
    clearMusicError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchAllMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch music";
      })

      .addCase(fetchMusicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMusicById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTrack = action.payload;
      })
      .addCase(fetchMusicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch track";
      })

      .addCase(createMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create track";
      })

      .addCase(updateMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMusic.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.tracks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tracks[idx] = action.payload;
        if (state.selectedTrack?._id === action.payload._id) {
          state.selectedTrack = action.payload;
        }
      })
      .addCase(updateMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update track";
      })

      .addCase(deleteMusic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMusic.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = state.tracks.filter((t) => t._id !== action.payload);
        state.total -= 1;
        if (state.selectedTrack?._id === action.payload) {
          state.selectedTrack = null;
        }
      })
      .addCase(deleteMusic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete track";
      });
  },
});

export const { clearSelectedTrack, clearMusicError } = musicSlice.actions;
export default musicSlice.reducer;
