import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCreateBill, getListBillsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddBillScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  
  const createBill = useCreateBill();

  const handleSave = () => {
    if (!title) {
      Alert.alert("Error", "Please enter a bill title.");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      Alert.alert("Error", "Please enter a valid date (YYYY-MM-DD).");
      return;
    }

    createBill.mutate(
      {
        data: {
          name: title,
          amount: Number(amount),
          dueDate: new Date(dueDate).toISOString()
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Bill added successfully.");
          queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
          router.back();
        },
        onError: (err) => {
          Alert.alert("Error", "Failed to add bill.");
          console.error(err);
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Add Bill Reminder",
          headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 18 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        
        {/* Amount Input */}
        <Text style={[styles.label, { color: colors.foreground, marginTop: 0 }]}>Amount Due</Text>
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: colors.foreground }]}>₹</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.foreground }]}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {/* Title */}
        <Text style={[styles.label, { color: colors.foreground }]}>Bill Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="e.g. Electricity, Netflix"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
        />

        {/* Due Date */}
        <Text style={[styles.label, { color: colors.foreground }]}>Due Date (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="2026-10-15"
          placeholderTextColor={colors.mutedForeground}
          value={dueDate}
          onChangeText={setDueDate}
        />

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={createBill.isPending}
        >
          <Text style={styles.saveBtnText}>{createBill.isPending ? "Saving..." : "Save Bill"}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    marginTop: 20
  },
  currencySymbol: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    marginRight: 8,
  },
  amountInput: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    minWidth: 100,
  },

  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    marginTop: 24,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },

  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  }
});
