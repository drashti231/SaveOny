import { useAuth } from "../context/AuthContext";
import { type Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

export default function VerifyEmailPage() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { reloadUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const user = auth.currentUser;

  const checkVerification = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await reloadUser();
      if (auth.currentUser?.emailVerified) {
        // They verified! Route them to the main app, which will trigger PIN setup
        router.replace("/(tabs)" as Href);
      } else {
        Alert.alert(
          "Not Verified",
          "It looks like you haven't clicked the verification link yet. Please check your inbox and spam folder."
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setResendLoading(true);
    try {
      await sendEmailVerification(user);
      Alert.alert("Sent", "A new verification link has been sent to your email.");
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        Alert.alert("Wait a moment", "We just sent one! Please wait a minute before requesting another.");
      } else {
        Alert.alert("Error", err.message);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Feather name="mail" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={styles.actionContainer}>
          <Text style={styles.instructionText}>
            Please click the link in the email to verify your account, then return here.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={checkVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>I have verified my email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive the email? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.resendLink}>Resend</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
      alignItems: "center",
      justifyContent: "space-between",
    },
    header: { 
      alignItems: "center", 
      marginTop: 40 
    },
    iconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    title: { 
      fontSize: 28, 
      fontFamily: "Inter_700Bold", 
      color: colors.foreground, 
      marginBottom: 12 
    },
    subtitle: { 
      fontSize: 16, 
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground, 
      textAlign: "center",
    },
    emailText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginTop: 4,
    },
    actionContainer: {
      width: "100%",
      paddingBottom: 20,
    },
    instructionText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: { opacity: 0.7 },
    primaryButtonText: { 
      color: "#fff", 
      fontSize: 16, 
      fontFamily: "Inter_600SemiBold" 
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 32,
    },
    resendText: {
      color: colors.mutedForeground,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
    },
    resendLink: {
      color: colors.primary,
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });
}
