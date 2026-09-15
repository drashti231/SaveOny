import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useCreateTransaction } from "@workspace/api-client-react";

export default function AddTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isIncome, setIsIncome] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [categoryModal, setCategoryModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  
  const createTx = useCreateTransaction();

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    createTx.mutate(
      {
        data: {
          merchant: category,
          category,
          amount: Number(amount),
          date: new Date(date).toISOString(),
          isIncome,
          notes: `${paymentMethod} - ${notes}`,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Transaction added successfully.");
          router.back();
        },
        onError: (err) => {
          Alert.alert("Error", "Failed to add transaction.");
          console.error(err);
        },
      }
    );
  };

  const expenseCategories = ["Food & Dining", "Shopping", "Transport", "Bills", "Others"];
  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Others"];
  const currentCategories = isIncome ? incomeCategories : expenseCategories;
  const paymentMethods = ["UPI", "Bank Transfer", "Card", "Cash"];


  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Add Transaction",
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
        
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, !isIncome && styles.typeBtnActiveExpense]}
            onPress={() => setIsIncome(false)}
          >
            <Text style={[styles.typeText, !isIncome ? { color: colors.rose } : { color: colors.mutedForeground }]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, isIncome && styles.typeBtnActiveIncome]}
            onPress={() => setIsIncome(true)}
          >
            <Text style={[styles.typeText, isIncome ? { color: colors.emerald } : { color: colors.mutedForeground }]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setCategoryModal(true)}>
          <View style={styles.dropdownLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.purpleLight }]}>
              <Feather name="coffee" size={16} color={colors.primary} />
            </View>
            <Text style={styles.dropdownText}>{category}</Text>
          </View>
          <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Amount Input */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Date */}
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <View style={styles.inputContainer}>
          <Feather name="calendar" size={20} color={colors.mutedForeground} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.amountInput}
            placeholder="2025-09-14"
            placeholderTextColor={colors.mutedForeground}
            value={date}
            onChangeText={setDate}
          />
        </View>

        {/* Payment Method */}
        <Text style={styles.label}>Payment Method</Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setPaymentModal(true)}>
          <View style={styles.dropdownLeft}>
            <Feather name="play" size={20} color={colors.emerald} style={{ marginRight: 12, marginLeft: 4 }} />
            <Text style={styles.dropdownText}>{paymentMethod}</Text>
          </View>
          <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Notes */}
        <Text style={styles.label}>Note <Text style={{ color: colors.mutedForeground, fontWeight: '400' }}>(Optional)</Text></Text>
        <TextInput
          style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 16 }]}
          placeholder="Add a note..."
          placeholderTextColor={colors.mutedForeground}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={createTx.isPending}
        >
          <Text style={styles.saveBtnText}>{createTx.isPending ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Category Modal */}
      {categoryModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setCategoryModal(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {currentCategories.map((cat) => (
              <TouchableOpacity key={cat} style={styles.modalItem} onPress={() => { setCategory(cat); setCategoryModal(false); }}>
                <Text style={styles.modalItemText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Payment Method Modal */}
      {paymentModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setPaymentModal(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            {paymentMethods.map((pm) => (
              <TouchableOpacity key={pm} style={styles.modalItem} onPress={() => { setPaymentMethod(pm); setPaymentModal(false); }}>
                <Text style={styles.modalItemText}>{pm}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20 },
    
    typeSelector: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      padding: 4,
      borderRadius: 24,
      marginBottom: 24,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: "center",
    },
    typeBtnActiveExpense: {
      backgroundColor: colors.roseLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    typeBtnActiveIncome: {
      backgroundColor: colors.emeraldLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    typeText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },

    label: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 10,
      marginTop: 16,
    },
    
    dropdownBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dropdownLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    dropdownText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 52,
    },
    currencySymbol: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },

    saveBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      marginTop: 40,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },

    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    modalBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 16,
    },
    modalItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemText: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    }
  });
}
