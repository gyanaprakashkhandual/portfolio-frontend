import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/configs/env.config";
import type { IContactPayload } from "../../types";

interface ContactState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ContactState = {
  loading: false,
  success: false,
  error: null,
};

export const sendContactMessage = createAsyncThunk<
  void,
  IContactPayload,
  { rejectValue: string }
>("contact/send", async (payload, { rejectWithValue }) => {
  const res = await fetch(api.contact, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) return rejectWithValue(json.message);
});

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendContactMessage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendContactMessage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to send message";
      });
  },
});

export const { clearContactState } = contactSlice.actions;
export default contactSlice.reducer;