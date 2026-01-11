import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./auth/apiSlice";
import authReducer from "./auth/slice";
import { exportApi } from "./export/apiSlice";
import { feesApi } from "./fees/apiSlice";
import { labelsApi } from "./labels/apiSlice";
import { ordersApi } from "./orders/apiSlice";
import { productsApi } from "./products/apiSlice";
import { companiesApi } from "./company/apiSlice";

const rootStore = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [exportApi.reducerPath]: exportApi.reducer,
    [companiesApi.reducerPath]: companiesApi.reducer,
    [feesApi.reducerPath]: feesApi.reducer,
    [labelsApi.reducerPath]: labelsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
      },
      immutableCheck: { warnAfter: 128 },
    })
      .concat(authApi.middleware)
      .concat(productsApi.middleware)
      .concat(ordersApi.middleware)
      .concat(exportApi.middleware)
      .concat(companiesApi.middleware)
      .concat(feesApi.middleware)
      .concat(labelsApi.middleware);
  },
});

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;

export default rootStore;
