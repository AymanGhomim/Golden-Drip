import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DesktopDevelopmentSnapshot } from "@/types";

const initialState: DesktopDevelopmentSnapshot = {
  branches: [],
  products: [],
  categories: [],
  menus: [],
  rawMenuItems: [],
  offers: [],
  orders: [],
  menuItems: [],
  tables: [],
  inventory: [],
  employees: [],
  roles: [],
  operations: {
    inventory: [], stockMovements: [], stockCounts: [], waste: [], recipes: [], suppliers: [], purchases: [], expenses: [], customers: [], loyalty: [], coupons: [], deliveryZones: [], payments: [], refunds: [], cashRegister: [], shifts: [], notifications: [], waiterRequests: [], modifierGroups: [], loyaltySettings: [], auditLog: [],
  },
};

const developmentSlice = createSlice({
  name: "development",
  initialState,
  reducers: {
    developmentSnapshotLoaded: (_state, action: PayloadAction<DesktopDevelopmentSnapshot>) => action.payload,
    developmentSnapshotCleared: () => initialState,
  },
});

export const { developmentSnapshotLoaded, developmentSnapshotCleared } = developmentSlice.actions;
export default developmentSlice.reducer;
