import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { PinPad } from "./PinPad";
import { usePin } from "../context/PinContext";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function SetPinScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const { setPin } = usePin();

  const [pin, setPinState] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"create" | "confirm">("create");

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

  const handlePressNumber = (num: string) => {
    if (step === "create") {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPinState(newPin);
        if (newPin.length === 4) {
          setTimeout(() => setStep("confirm"), 300);
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + num;
        setConfirmPin(newConfirm);
        if (newConfirm.length === 4) {
          if (newConfirm === pin) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => setPin(pin), 300);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            shake();
            setConfirmPin("");
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === "create") {
      setPinState(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const currentPin = step === "create" ? pin : confirmPin;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <Text style={styles.title}>
          {step === "create" ? "Set an App PIN" : "Confirm your PIN"}
        </Text>
        <Text style={styles.subtitle}>
          {step === "create"
            ? "Create a 4-digit PIN to secure your financial data."
            : "Re-enter your 4-digit PIN to confirm."}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.dotsContainer, shakeStyle]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentPin.length > i ? styles.dotFilled : null
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.padContainer}>
        <PinPad onPressNumber={handlePressNumber} onPressBackspace={handleBackspace} />
      </View>
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
      marginBottom: 60,
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
      marginBottom: 80,
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
    },
  });
}
