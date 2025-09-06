import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import authReducer from "./authentication";
import { apiSlice } from "./apiSlice";
import { attendanceApiSlice } from "./attendanceApiSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        [attendanceApiSlice.reducerPath]: attendanceApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(apiSlice.middleware, attendanceApiSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;