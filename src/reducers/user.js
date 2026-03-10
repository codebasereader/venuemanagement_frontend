import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentUser } from "../api/auth";

const initialValue = {
  id: "",
  name: "",
  role: "",
  email_id: "",
  access_token: "",
  refresh_token: "",
  venueId: null,
  is_change_password: false,
  is_logged_in: false,
  venue: null,
  venueProfile: null,
};

// Async thunk to fetch current user data
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const userData = await getCurrentUser(token);
      return userData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user data",
      );
    }
  },
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: initialValue,
    loading: false,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.value = initialValue;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.value = { ...state.value, ...action.payload };
    },
    passwordChanged: (state) => {
      state.value.is_change_password = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const userData = action.payload;
        state.value = {
          ...state.value,
          id: userData._id,
          name: userData.name,
          email_id: userData.email,
          role: userData.role,
          venueId: userData.venueId,
          venue: userData.venue,
          venueProfile: userData.venueProfile,
          is_logged_in: true,
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  login,
  logout,
  updateUser,
  passwordChanged,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
