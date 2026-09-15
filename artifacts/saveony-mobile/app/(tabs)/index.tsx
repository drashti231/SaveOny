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
import React, { useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

const fmt = (n?: number) =>
  n !== undefined ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}` : "₹0";

const CHART_COLORS = ["#1db970", "#0ea5e9", "#6366f1", "#f59e0b", "#f43f5e"];

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      style={styles.container}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 90 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.headerGreeting}>Good {getDayName()}</Text>
          <Text style={styles.headerDate}>{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="bell" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </Animated.View>

      {/* Net Worth Hero Card */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => Haptics.selectionAsync()}>
          <LinearGradient
            colors={[colors.primary, "#0ea5e9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroLabel}>TOTAL NET WORTH</Text>
            {sumLoading ? (
              <ActivityIndicator color="#ffffff" style={{ marginVertical: 12 }} />
            ) : (
              <>
                <Text style={styles.heroAmount}>{fmt(summary?.netWorth)}</Text>
                <View style={styles.heroRow}>
                  <View style={styles.chip}>
                    <Feather name="trending-up" size={14} color="#ffffff" />
                    <Text style={styles.chipText}>
                      {(summary?.portfolioReturnPercent ?? 0) >= 0 ? "+" : ""}
                      {(summary?.portfolioReturnPercent ?? 0).toFixed(1)}% portfolio
                    </Text>
                  </View>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, { flex: 1 }]}
          activeOpacity={0.7}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.emeraldLight }]}>
            <Feather name="arrow-down-circle" size={16} color={colors.primary} />
          </View>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{fmt(summary?.monthlyIncome)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { flex: 1 }]}
          activeOpacity={0.7}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.roseLight }]}>
            <Feather name="arrow-up-circle" size={16} color="#f43f5e" />
          </View>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: "#f43f5e" }]}>{fmt(summary?.monthlyExpenses)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { flex: 1 }]}
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/savings")}
        >
          <View style={[styles.statIcon, { backgroundColor: colors.skyLight }]}>
            <Feather name="percent" size={16} color="#0ea5e9" />
          </View>
          <Text style={styles.statLabel}>Saved</Text>
          <Text style={[styles.statValue, { color: "#0ea5e9" }]}>
            {(summary?.savingsRate ?? 0).toFixed(0)}%
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Expense Breakdown */}
      {Array.isArray(breakdown) && breakdown.length > 0 && (
        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Month's Spending</Text>
          </View>
          {breakdown.slice(0, 5).map((item, i) => (
            <View key={item.category} style={styles.breakdownRow}>
              <View style={[styles.dot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
              <Text style={styles.breakdownLabel}>{item.category}</Text>
              <View style={styles.breakdownBar}>
                <Animated.View
                  entering={FadeInDown.delay(500 + i * 100)}
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
        </Animated.View>
      )}

      {/* Recent Transactions */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(tabs)/transactions");
            }}
          >
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentTxns.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text style={styles.emptyBtnText}>Add your first</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentTxns.map((txn, idx) => (
            <Animated.View key={txn.id} entering={FadeInDown.delay(600 + idx * 50)}>
              <TouchableOpacity
                style={styles.txnRow}
                activeOpacity={0.6}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
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
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </Animated.View>
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
      backgroundColor: colors.background,
    },
    headerGreeting: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    headerDate: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    bellBtn: {
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
    heroCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 24,
      borderRadius: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    heroLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.8)",
      letterSpacing: 1.2,
      fontFamily: "Inter_600SemiBold",
    },
    heroAmount: {
      fontSize: 42,
      fontWeight: "700",
      color: "#ffffff",
      marginTop: 6,
      fontFamily: "Inter_700Bold",
    },
    heroRow: { flexDirection: "row", marginTop: 12, gap: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    chipText: { fontSize: 13, fontWeight: "600", color: "#ffffff", fontFamily: "Inter_600SemiBold" },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 15,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    seeAll: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    breakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    dot: { width: 10, height: 10, borderRadius: 5 },
    breakdownLabel: {
      fontSize: 14,
      color: colors.foreground,
      width: 90,
      fontFamily: "Inter_500Medium",
    },
    breakdownBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.secondary,
      borderRadius: 4,
      overflow: "hidden",
    },
    breakdownFill: { height: "100%", borderRadius: 4 },
    breakdownAmt: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      minWidth: 65,
      textAlign: "right",
      fontFamily: "Inter_600SemiBold",
    },
    txnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
    txnMerchant: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    txnCategory: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    txnAmount: {
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    emptyState: { alignItems: "center", paddingVertical: 24, gap: 10 },
    emptyText: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    emptyBtn: {
      marginTop: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    emptyBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    }
  });
}
