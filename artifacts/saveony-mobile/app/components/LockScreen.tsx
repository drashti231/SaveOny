import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";
import { PinPad } from "./PinPad";
import { usePin } from "../context/PinContext";
import { useAuth } from "../context/AuthContext";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

export function LockScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { verifyPin } = usePin();
  const { signOut } = useAuth();

  const [pin, setPin] = useState("");
  const shakeValue = useSharedValue(0);

  const shake = () => {
    shakeValue.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeValue.value }],
    };
  });

  const handlePressNumber = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        const isValid = await verifyPin(newPin);
        if (isValid) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          shake();
          setTimeout(() => setPin(""), 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <View style={styles.iconWrap}>
          <Feather name="lock" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Enter PIN</Text>
        <Text style={styles.subtitle}>
          Please enter your PIN to unlock SaveOny.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.dotsContainer, shakeStyle]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i ? styles.dotFilled : null
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.padContainer}>
        <PinPad onPressNumber={handlePressNumber} onPressBackspace={handleBackspace} />
      </View>
      
      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          signOut();
        }}
      >
        <Text style={styles.logoutText}>Sign out instead</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 100,
    },
    header: {
      alignItems: "center",
      paddingHorizontal: 24,
      marginBottom: 50,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.purpleLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    dotsContainer: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 60,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    dotFilled: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    padContainer: {
      width: "100%",
      marginBottom: 40,
    },
    logoutBtn: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    logoutText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    }
  });
}
