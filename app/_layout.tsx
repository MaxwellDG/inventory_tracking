import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { Provider, useSelector } from "react-redux";

import { ToastContainer } from "@/components/ui/ToastContainer";
import { ToastProvider } from "@/contexts/ToastContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/redux/auth/apiSlice";
import { get, getSecure, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { setCredentials } from "@/redux/auth/slice";
import rootStore, { RootState } from "@/redux/store";

import "@/i18n";

// Component to handle auth rehydration
function AuthRehydrator({ children }: { children: React.ReactNode }) {
  const [isRehydrating, setIsRehydrating] = useState(true);

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        // Load persisted auth tokens (user data will be fetched from API)
        const [token, refreshToken] = await Promise.all([
          get(STORAGE_KEYS.ACCESS_TOKEN),
          getSecure(STORAGE_KEYS.REFRESH_TOKEN),
        ]);

        // If we have a token, restore auth state and fetch user data
        if (token) {
          // First, set the token so API calls can be authenticated
          rootStore.dispatch(
            setCredentials({
              user: null, // User data will be fetched from API
              token,
              refresh_token: refreshToken || undefined,
            })
          );

          // Fetch user data from the API
          try {
            const result = await rootStore
              .dispatch(authApi.endpoints.getUser.initiate())
              .unwrap();

            // Update Redux with the user data
            rootStore.dispatch(
              setCredentials({
                user: result,
                token,
                refresh_token: refreshToken || undefined,
              })
            );
          } catch (error) {
            // If fetching user data fails, clear the invalid token
            rootStore.dispatch(
              setCredentials({
                user: null,
                token: undefined,
                refresh_token: undefined,
              })
            );
          }
        } else {
          console.log("No persisted auth tokens found");
        }
      } catch (error) {
        console.error("Error rehydrating auth state:", error);
      } finally {
        setIsRehydrating(false);
      }
    };

    rehydrateAuth();
  }, []);

  // Show loading screen while rehydrating
  if (isRehydrating) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

// Navigation component that conditionally renders based on auth state
function Navigation() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const segments = useSegments();

  // Automatically redirect when auth is cleared or user lacks company_id
  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";
    const inCompanyFlow =
      segments[0] === "company" ||
      segments[0] === "create-company" ||
      segments[0] === "join-company";

    if (!isAuthenticated && inTabsGroup) {
      // Not authenticated but in tabs - redirect to login
      router.replace("/(auth)/login");
    } else if (
      isAuthenticated &&
      !user?.company_id &&
      !inCompanyFlow &&
      inTabsGroup
    ) {
      // Authenticated but no company_id and not in company flow - redirect to company screen
      router.replace("/company");
    }
  }, [isAuthenticated, user?.company_id, segments]);

  if (isAuthenticated) {
    // Authenticated user routes
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="company" options={{ headerShown: false }} />
        <Stack.Screen name="join-company" options={{ headerShown: false }} />
        <Stack.Screen name="create-company" options={{ headerShown: false }} />
        {/* Hide auth routes from authenticated users */}
        <Stack.Screen name="(auth)" options={{ href: null }} />
      </Stack>
    );
  } else {
    // Unauthenticated user routes
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Hide authenticated routes from unauthenticated users */}
        <Stack.Screen name="(tabs)" options={{ href: null }} />
        <Stack.Screen name="modal" options={{ href: null }} />
      </Stack>
    );
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={rootStore}>
      <ToastProvider>
        <AuthRehydrator>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Navigation />
            <StatusBar style="auto" />
            <ToastContainer />
          </ThemeProvider>
        </AuthRehydrator>
      </ToastProvider>
    </Provider>
  );
}
