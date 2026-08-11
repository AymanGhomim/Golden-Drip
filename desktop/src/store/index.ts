import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer from "@/store/auth-slice";
import ordersReducer from "@/store/orders-slice";
import developmentReducer from "@/store/development-slice";
import { backendApi } from "@/store/api";

export const store = configureStore({
  reducer: { auth: authReducer, orders: ordersReducer, development: developmentReducer, [backendApi.reducerPath]: backendApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
