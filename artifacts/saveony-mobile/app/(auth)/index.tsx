import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      
      {/* Header Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Feather name="feather" size={24} color="#fff" />
        </View>
        <Text style={styles.logoText}>Saveony</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to Saveony!</Text>
        <Text style={styles.subtitle}>
          Your personal finance companion.
        </Text>
      </View>

      {/* Main Illustration Placeholder */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          <Feather name="pie-chart" size={80} color={colors.primary} style={{ opacity: 0.8 }} />
        </View>
      </View>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIconWrap}>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </View>
          <Text style={styles.featureText}>Track your expenses</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIconWrap}>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </View>
          <Text style={styles.featureText}>Set savings goals</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIconWrap}>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </View>
          <Text style={styles.featureText}>Build a better future</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingHorizontal: 24,
    },
    
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 32,
      gap: 12,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "45deg" }]
    },
    logoText: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
  
    textContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  
    illustrationContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    illustrationCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
  
    featuresContainer: {
      width: "100%",
      marginBottom: 40,
      gap: 16,
      paddingHorizontal: 20,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    featureIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    featureText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
  
    buttonsContainer: {
      width: "100%",
      gap: 24,
      marginBottom: 10,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    loginText: {
      color: colors.mutedForeground,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
    },
    loginLink: {
      color: colors.primary,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    }
  });
}
