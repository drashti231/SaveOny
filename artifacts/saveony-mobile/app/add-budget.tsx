import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCreateBudget, getListBudgetsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AddBudgetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  
  const createBudget = useCreateBudget();

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    createBudget.mutate(
      {
        data: {
          category,
          monthlyLimit: Number(amount),
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Budget added successfully.");
          queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
          router.back();
        },
        onError: (err) => {
          Alert.alert("Error", "Failed to add budget.");
          console.error(err);
        },
      }
    );
  };

  const categories = ["Food & Dining", "Shopping", "Transport", "Bills", "Health", "Entertainment", "Others"];

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Add Budget",
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
        <Text style={[styles.label, { color: colors.foreground, marginTop: 0 }]}>Monthly Limit</Text>
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

        {/* Category */}
        <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catBadge,
                category === cat ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, { color: category === cat ? "#fff" : colors.foreground }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={createBudget.isPending}
        >
          <Text style={styles.saveBtnText}>{createBudget.isPending ? "Saving..." : "Save Budget"}</Text>
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
  catScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  catText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
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
