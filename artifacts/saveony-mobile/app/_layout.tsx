import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) {
  setBaseUrl(`https://${domain}`);
} else {
  // Hardcoding local IP to avoid Metro cache issues with .env
  setBaseUrl("http://172.17.45.131:8080");
}



SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="budgets" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="reports" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="analytics" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="bills" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="bill-reminders" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="ai-assistant" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="settings" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="add-transaction" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="add-budget" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="add-bill" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

import { AuthProvider } from "./context/AuthContext";
import { PinProvider } from "./context/PinContext";

import { Platform, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const appContent = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PinProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              {Platform.OS === 'web' ? (
                <View style={{ flex: 1, backgroundColor: '#e2e8f0', alignItems: 'center' }}>
                  <View style={{ flex: 1, width: '100%', maxWidth: 450, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width:0,height:10}, shadowOpacity: 0.1, shadowRadius: 20, overflow: 'hidden' }}>
                    {appContent}
                  </View>
                </View>
              ) : (
                appContent
              )}
            </QueryClientProvider>
          </SafeAreaProvider>
        </PinProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
