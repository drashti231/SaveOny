import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

type PinPadProps = {
  onPressNumber: (num: string) => void;
  onPressBackspace: () => void;
};

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

export function PinPad({ onPressNumber, onPressBackspace }: PinPadProps) {
  const colors = useColors();
  const styles = makeStyles(colors);

  const handlePress = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item === "backspace") {
      onPressBackspace();
    } else if (item !== "") {
      onPressNumber(item);
    }
  };

  return (
    <View style={styles.container}>
      {NUMBERS.map((item, index) => {
        if (item === "") {
          return <View key={`empty-${index}`} style={styles.buttonWrapper} />;
        }

        return (
          <View key={item} style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.button, item === "backspace" && styles.backspaceBtn]}
              onPress={() => handlePress(item)}
            >
              {item === "backspace" ? (
                <Feather name="delete" size={24} color={colors.foreground} />
              ) : (
                <Text style={styles.numberText}>{item}</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      width: "100%",
      maxWidth: 320,
      marginHorizontal: "auto",
    },
    buttonWrapper: {
      width: "33.33%",
      aspectRatio: 1.2,
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    backspaceBtn: {
      backgroundColor: "transparent",
      borderWidth: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    numberText: {
      fontSize: 28,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
  });
}
