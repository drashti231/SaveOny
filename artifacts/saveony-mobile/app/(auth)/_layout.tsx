import { useAuth, useUser } from "../context/AuthContext";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();

  if (isSignedIn) {
    if (user && !user.emailVerified) {
      if (segments[segments.length - 1] !== "verify-email") {
        return <Redirect href="/(auth)/verify-email" />;
      }
    } else {
      return <Redirect href="/(tabs)" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
