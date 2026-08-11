import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DesktopSession } from "@/types";

type AuthState = { session: DesktopSession | null };
const initialState: AuthState = { session: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionStarted: (_state, action: PayloadAction<DesktopSession>) => ({ session: action.payload }),
    sessionEnded: () => initialState,
    branchChanged: (state, action: PayloadAction<string>) => {
      if (!state.session) return;
      state.session.currentBranch = state.session.accessibleBranches.find((branch) => branch.id === action.payload) ?? null;
    },
  },
});

export const { sessionStarted, sessionEnded, branchChanged } = authSlice.actions;
export default authSlice.reducer;
