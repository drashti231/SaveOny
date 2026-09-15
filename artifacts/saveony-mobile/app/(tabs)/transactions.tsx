import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetExpenseBreakdownQueryKey,
  getListTransactionsQueryKey,
  useCreateTransaction,
  useDeleteTransaction,
  useListTransactions,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Food", "Transport", "Housing", "Entertainment", "Health", "Shopping", "Utilities", "Income", "Other"];

const fmt = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface AddTxnForm {
  merchant: string;
  category: string;
  amount: string;
  date: string;
  isIncome: boolean;
  notes: string;
}

const today = () => new Date().toISOString().split("T")[0];

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddTxnForm>({
    merchant: "",
    category: "Food",
    amount: "",
    date: today(),
    isIncome: false,
    notes: "",
  });
  const [error, setError] = useState("");

  const { data: transactions, isLoading, refetch } = useListTransactions();

  const createMutation = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExpenseBreakdownQueryKey() });
        setShowModal(false);
        resetForm();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => setError("Failed to add transaction. Please try again."),
    },
  });

  const deleteMutation = useDeleteTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExpenseBreakdownQueryKey() });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      },
    },
  });

  const resetForm = () =>
    setForm({ merchant: "", category: "Food", amount: "", date: today(), isIncome: false, notes: "" });

  const handleSubmit = () => {
    if (!form.merchant.trim()) return setError("Merchant name is required.");
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) return setError("Enter a valid amount.");
    if (!form.date) return setError("Date is required.");
    setError("");
    createMutation.mutate({
      data: {
        merchant: form.merchant.trim(),
        category: form.category,
        amount,
        date: form.date,
        isIncome: form.isIncome,
        notes: form.notes.trim() || undefined,
      },
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ id }),
      },
    ]);
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const sorted = [...safeTransactions].reverse();
  const topPad = isWeb ? 67 : insets.top;

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: isWeb ? 34 : insets.bottom + 90,
          }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          scrollEnabled={sorted.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No transactions</Text>
              <Text style={styles.emptyText}>Tap + to add your first transaction</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.txnCard}>
              <View style={[styles.avatar, { backgroundColor: item.isIncome ? colors.emeraldLight : colors.secondary }]}>
                <Text style={[styles.avatarText, { color: item.isIncome ? colors.primary : colors.mutedForeground }]}>
                  {getInitials(item.merchant)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchant} numberOfLines={1}>{item.merchant}</Text>
                <Text style={styles.meta}>{item.category} · {formatDate(item.date)}</Text>
              </View>
              <Text style={[styles.amount, { color: item.isIncome ? colors.primary : colors.foreground }]}>
                {item.isIncome ? "+" : "-"}{fmt(item.amount)}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Feather name="trash-2" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Add Transaction Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[styles.modalContainer, { paddingTop: Platform.OS === "ios" ? 20 : insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); setError(""); }}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Merchant</Text>
                <TextInput
                  style={styles.input}
                  value={form.merchant}
                  onChangeText={(t) => setForm({ ...form, merchant: t })}
                  placeholder="e.g. Swiggy"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={form.amount}
                  onChangeText={(t) => setForm({ ...form, amount: t })}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={form.date}
                  onChangeText={(t) => setForm({ ...form, date: t })}
                  placeholder="2026-05-01"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.catChip, form.category === cat && styles.catChipActive]}
                        onPress={() => setForm({ ...form, category: cat })}
                      >
                        <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={[styles.formGroup, styles.row]}>
                <Text style={styles.label}>This is income</Text>
                <Switch
                  value={form.isIncome}
                  onValueChange={(v) => setForm({ ...form, isIncome: v })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, { height: 72, textAlignVertical: "top" }]}
                  value={form.notes}
                  onChangeText={(t) => setForm({ ...form, notes: t })}
                  placeholder="Optional note"
                  multiline
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.submitBtn, createMutation.isPending && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Add Transaction</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    txnCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
    merchant: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    meta: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    amount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
    deleteBtn: { padding: 6 },
    emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    formGroup: { marginBottom: 16 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 6,
      fontFamily: "Inter_600SemiBold",
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    catChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catChipText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_400Regular" },
    catChipTextActive: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    errorText: { color: colors.destructive, fontSize: 13, marginBottom: 12, fontFamily: "Inter_400Regular" },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 32,
    },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });
}
