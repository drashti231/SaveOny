import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetExpenseBreakdownQueryKey,
  getListTransactionsQueryKey,
  useGetDashboardSummary,
  useGetExpenseBreakdown,
  useListTransactions,
} from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const fmt = (n?: number) =>
  n !== undefined ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}` : "₹0";

const CHART_COLORS = ["#1db970", "#0ea5e9", "#6366f1", "#f59e0b", "#f43f5e"];

const CATEGORY_ICONS: Record<string, string> = {
  Food: "coffee",
  Transport: "navigation",
  Housing: "home",
  Entertainment: "film",
  Health: "heart",
  Shopping: "shopping-bag",
  Utilities: "zap",
  Income: "arrow-down-circle",
  Other: "more-horizontal",
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getDayName() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isWeb = Platform.OS === "web";

  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary();
  const { data: breakdown } = useGetExpenseBreakdown();
  const { data: transactions } = useListTransactions();

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const recentTxns = safeTransactions.slice(-5).reverse();

  const onRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetExpenseBreakdownQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() }),
    ]);
  };

  const topPad = isWeb ? 67 : insets.top;

  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 90 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.headerGreeting}>Good {getDayName()}</Text>
          <Text style={styles.headerDate}>{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Feather name="bell" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Net Worth Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>TOTAL NET WORTH</Text>
        {sumLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <>
            <Text style={styles.heroAmount}>{fmt(summary?.netWorth)}</Text>
            <View style={styles.heroRow}>
              <View style={[styles.chip, { backgroundColor: colors.emeraldLight }]}>
                <Feather name="trending-up" size={12} color={colors.primary} />
                <Text style={[styles.chipText, { color: colors.primary }]}>
                  {(summary?.portfolioReturnPercent ?? 0) >= 0 ? "+" : ""}
                  {(summary?.portfolioReturnPercent ?? 0).toFixed(1)}% portfolio
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.emeraldLight }]}>
            <Feather name="arrow-down-circle" size={14} color={colors.primary} />
          </View>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{fmt(summary?.monthlyIncome)}</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.roseLight }]}>
            <Feather name="arrow-up-circle" size={14} color="#f43f5e" />
          </View>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: "#f43f5e" }]}>{fmt(summary?.monthlyExpenses)}</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.skyLight }]}>
            <Feather name="percent" size={14} color="#0ea5e9" />
          </View>
          <Text style={styles.statLabel}>Saved</Text>
          <Text style={[styles.statValue, { color: "#0ea5e9" }]}>
            {(summary?.savingsRate ?? 0).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Expense Breakdown */}
      {Array.isArray(breakdown) && breakdown.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Month</Text>
          </View>
          {breakdown.slice(0, 5).map((item, i) => (
            <View key={item.category} style={styles.breakdownRow}>
              <View style={[styles.dot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
              <Text style={styles.breakdownLabel}>{item.category}</Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    {
                      width: `${item.percent}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    },
                  ]}
                />
              </View>
              <Text style={styles.breakdownAmt}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentTxns.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          recentTxns.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <View style={[styles.avatar, { backgroundColor: txn.isIncome ? colors.emeraldLight : colors.secondary }]}>
                <Text style={[styles.avatarText, { color: txn.isIncome ? colors.primary : colors.mutedForeground }]}>
                  {getInitials(txn.merchant)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txnMerchant} numberOfLines={1}>{txn.merchant}</Text>
                <Text style={styles.txnCategory}>{txn.category}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: txn.isIncome ? colors.primary : colors.foreground }]}>
                {txn.isIncome ? "+" : "-"}{fmt(txn.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    headerGreeting: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    headerDate: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    bellBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    heroCard: {
      margin: 16,
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.mutedForeground,
      letterSpacing: 1.2,
      fontFamily: "Inter_600SemiBold",
    },
    heroAmount: {
      fontSize: 38,
      fontWeight: "700",
      color: colors.foreground,
      marginTop: 4,
      fontFamily: "Inter_700Bold",
    },
    heroRow: { flexDirection: "row", marginTop: 8, gap: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
    },
    chipText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    statIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 2,
    },
    statValue: {
      fontSize: 14,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    breakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    breakdownLabel: {
      fontSize: 13,
      color: colors.foreground,
      width: 80,
      fontFamily: "Inter_400Regular",
    },
    breakdownBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.secondary,
      borderRadius: 3,
      overflow: "hidden",
    },
    breakdownFill: { height: "100%", borderRadius: 3 },
    breakdownAmt: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.foreground,
      minWidth: 60,
      textAlign: "right",
      fontFamily: "Inter_600SemiBold",
    },
    txnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
    txnMerchant: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    txnCategory: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 1,
      fontFamily: "Inter_400Regular",
    },
    txnAmount: {
      fontSize: 14,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    emptyState: { alignItems: "center", paddingVertical: 20, gap: 8 },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });
}
