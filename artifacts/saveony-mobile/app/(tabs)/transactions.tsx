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

  const handleDelete = (id: string) => {
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
  
  // Filtering
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Income" | "Expense">("All");

  const filtered = safeTransactions.filter(t => {
    if (filter === "Income" && !t.isIncome) return false;
    if (filter === "Expense" && t.isIncome) return false;
    if (search && !t.merchant.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Grouping by Date
  const grouped: { title: string, data: typeof sorted }[] = [];
  sorted.forEach(t => {
    let title = formatDate(t.date);
    if (t.date === today()) title = "Today, " + title;
    
    const existing = grouped.find(g => g.title === title);
    if (existing) existing.data.push(t);
    else grouped.push({ title, data: [t] });
  });

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
          <Feather name="bell" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search & Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterRow}>
          {["All", "Income", "Expense"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f as any); }}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: isWeb ? 34 : insets.bottom + 90,
          }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No transactions</Text>
            </View>
          }
          renderItem={({ item: group }) => (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.dateHeader}>{group.title}</Text>
              {group.data.map(item => (
                <View key={item.id} style={styles.txnCard}>
                  <View style={[styles.avatar, { backgroundColor: item.isIncome ? colors.emeraldLight : colors.roseLight }]}>
                    <Feather name={item.isIncome ? "arrow-down-left" : "shopping-bag"} size={20} color={item.isIncome ? colors.emerald : colors.rose} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.merchant} numberOfLines={1}>{item.merchant}</Text>
                    <Text style={styles.meta}>{item.category} · {item.isIncome ? "Bank Transfer" : "UPI"}</Text>
                  </View>
                  <Text style={[styles.amount, { color: item.isIncome ? colors.emerald : colors.rose }]}>
                    {item.isIncome ? "+" : "-"}{fmt(item.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        />
      )}
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
      backgroundColor: colors.background,
    },
    title: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
    filterSection: { paddingHorizontal: 20, marginBottom: 16 },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 16,
      height: 48,
      marginBottom: 16,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" },
    filterRow: { 
      flexDirection: "row", 
      backgroundColor: colors.muted, 
      borderRadius: 24, 
      padding: 4,
    },
    filterBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: "center",
    },
    filterBtnActive: { backgroundColor: colors.primary },
    filterText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
    filterTextActive: { color: '#ffffff' },
    dateHeader: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    txnCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: 'transparent', // In mockup, they don't have borders, just spacing
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    merchant: { fontSize: 16, color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    meta: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, fontFamily: "Inter_500Medium" },
    amount: { fontSize: 15, fontFamily: "Inter_700Bold" },
    emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
  });
}
