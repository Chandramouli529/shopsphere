import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { store } from "@/store/store";
import { restoreSession } from "@/store/slices/authSlice";

// Keep the native static splash (assets/splash-icon.png on a black background,
// configured via the expo-splash-screen plugin in app.json) on screen until
// our animated JS splash in app/index.tsx explicitly hides it. Without this,
// Expo would hide the native splash as soon as the JS bundle is ready, which
// can happen before our animation has anything to show, causing a flash of
// blank screen between the native splash and the animated one.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Safe to ignore — happens if this gets called more than once (e.g. fast
  // refresh during development).
});

export default function RootLayout() {
  useEffect(() => {
    // Attempt to restore a previously-stored session (refresh token handling
    // in a real app would validate/refresh this token against the backend).
    store.dispatch(restoreSession());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings/[slug]" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="category/[key]" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="reviews/[id]" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="search" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="order-success" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(auth)/login" options={{ presentation: "modal" }} />
          <Stack.Screen name="(auth)/register" options={{ presentation: "modal" }} />
          <Stack.Screen name="(auth)/register-otp" options={{ presentation: "modal" }} />
          <Stack.Screen name="(auth)/forgot-password" options={{ presentation: "modal" }} />
          <Stack.Screen name="(auth)/reset-password" options={{ presentation: "modal" }} />
          <Stack.Screen name="(auth)/change-password" />
          <Stack.Screen name="vendor-login" options={{ presentation: "modal" }} />
          <Stack.Screen name="vendor-otp" options={{ presentation: "modal" }} />
          <Stack.Screen name="vendor-password" options={{ presentation: "modal" }} />
          <Stack.Screen name="vendor" />
          <Stack.Screen name="(admin-auth)/login" options={{ presentation: "modal" }} />
          <Stack.Screen name="admin" />
        </Stack>
      </SafeAreaProvider>
    </Provider>
  );
}
