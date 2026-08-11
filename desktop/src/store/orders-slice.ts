import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DesktopOrder, DesktopOrderStatus } from "@/types";

const ordersSlice = createSlice({
  name: "orders",
  initialState: { items: [] as DesktopOrder[] },
  reducers: {
    orderCreated: (state, action: PayloadAction<DesktopOrder>) => { state.items.unshift(action.payload); },
    ordersReplaced: (state, action: PayloadAction<DesktopOrder[]>) => { state.items = action.payload; },
    orderStatusChanged: (state, action: PayloadAction<{ id: string; status: DesktopOrderStatus }>) => {
      const order = state.items.find((item) => item.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
  },
});
export const { orderCreated, ordersReplaced, orderStatusChanged } = ordersSlice.actions;
export default ordersSlice.reducer;
