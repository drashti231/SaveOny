import { useAuth } from "../context/AuthContext";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

export default function SignUpPage() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!agreed) {
      setGlobalError("You must agree to the Terms of Service.");
      return;
    }
    if (password.length < 6) {
      setGlobalError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setGlobalError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password);
      
      if (fullName) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }

      // Send native Firebase email verification
      await sendEmailVerification(userCredential.user);

      // Navigate to verification screen (we'll create this next)
      router.replace("/(auth)/verify-email" as Href);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Feather name="feather" size={24} color={colors.primary} />
              <Text style={styles.logoText}>Saveony</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Let's get started! Set up your account to manage your finances.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedForeground}
                onChangeText={(v) => { setFullName(v); setGlobalError(""); }}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                onChangeText={(v) => { setEmailAddress(v); setGlobalError(""); }}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                placeholder="Create a strong password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                onChangeText={(v) => { setPassword(v); setGlobalError(""); }}
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxText}>
                By creating an account, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {!!globalError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{globalError}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!emailAddress || !password || isLoading) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignUp}
              disabled={!emailAddress || !password || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>

            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Already have an account? </Text>
              <Link href={"/(auth)/sign-in" as Href}>
                <Text style={styles.link}>Login</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    backButton: {
      marginBottom: 20,
    },
    header: { marginBottom: 32 },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
    },
    logoText: { 
      fontSize: 20, 
      fontFamily: "Inter_700Bold", 
      color: colors.foreground 
    },
    title: { 
      fontSize: 28, 
      fontFamily: "Inter_700Bold", 
      color: colors.foreground, 
      marginBottom: 8 
    },
    subtitle: { 
      fontSize: 15, 
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground, 
      lineHeight: 22 
    },
    form: { gap: 4 },
    label: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 8,
      marginTop: 16,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    eyeIcon: {
      padding: 4,
    },
    checkboxContainer: {
      flexDirection: "row",
      marginTop: 24,
      marginBottom: 8,
      alignItems: "flex-start",
      paddingRight: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 12,
      marginTop: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    linkText: {
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    errorBox: {
      backgroundColor: colors.roseLight,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    errorText: { 
      fontSize: 14, 
      fontFamily: "Inter_500Medium",
      color: colors.destructive, 
      textAlign: "center" 
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
    buttonPressed: { opacity: 0.85 },
    primaryButtonText: { 
      color: "#fff", 
      fontSize: 16, 
      fontFamily: "Inter_600SemiBold" 
    },
    linkRow: { 
      flexDirection: "row", 
      justifyContent: "center", 
      marginTop: 32 
    },
    linkLabel: { 
      fontSize: 15, 
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground 
    },
    link: { 
      fontSize: 15, 
      color: colors.primary, 
      fontFamily: "Inter_600SemiBold" 
    },
  });
}
