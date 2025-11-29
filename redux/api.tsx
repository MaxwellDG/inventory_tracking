import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { RootState } from "./store";

export const baseQuery = (auth: boolean = false, path: string = "") => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV;
  let apiUrl = process.env.EXPO_PUBLIC_API_URL || "";

  if (appEnv === "local") {
    // different emulator OS accesses localhost in different ways
    if (Platform.OS === "ios") {
      apiUrl = "http://127.0.0.1:8000";
    } else if (Platform.OS === "android") {
      process.env.EXPO_PUBLIC_IS_ANDROID_USB_CONNECTION
        ? (apiUrl = "http://127.0.0.1:8000")
        : (apiUrl = "http://10.0.2.2:8000"); // w emulator
    } else {
      apiUrl = "http://localhost:8000";
    }
  }

  const fullUrl = apiUrl + "/api" + path;
  console.log("fullUrl", fullUrl);

  return fetchBaseQuery({
    baseUrl: fullUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      if (state.auth.token) {
        headers.set("Authorization", "Bearer " + state.auth.token);
      }
      headers.set(
        "Content-Type",
        auth ? "multipart/form-data" : "application/json"
      );
      headers.set("X-Mobile-App", Platform.OS);
      return headers;
    },
  });
};
