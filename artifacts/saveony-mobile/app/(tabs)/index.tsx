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
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

const fmt = (n?: number) =>
  n !== undefined ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}` : "₹0";

const CHART_COLORS = ["#6C4FF5", "#38BDF8", "#22C55E", "#F59E0B", "#EF4444"];

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function getDayName() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

function getCategoryIcon(category: string): any {
  const lc = category.toLowerCase();
  if (lc.includes("food") || lc.includes("dining")) return "coffee";
  if (lc.includes("shop")) return "shopping-bag";
  if (lc.includes("transport")) return "truck";
  if (lc.includes("bill") || lc.includes("util")) return "file-text";
  if (lc.includes("health")) return "heart";
  if (lc.includes("travel")) return "map-pin";
  return "grid";
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
  const { data: breakdown, isLoading: breakLoading } = useGetExpenseBreakdown();
  const { data: transactions } = useListTransactions();

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const recentTxns = safeTransactions.slice(-5).reverse();

  const [isMoreModalVisible, setMoreModalVisible] = useState(false);

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
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 90 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View>
            <Text style={styles.headerGreeting}>Hello, Drashti 👋</Text>
            <Text style={styles.headerDate}>Here's your financial overview</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/settings");
              }}
            >
              <Feather name="bell" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/settings");
              }}
            >
              <Feather name="user" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Net Worth Hero Card */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => Haptics.selectionAsync()}>
            <LinearGradient
              colors={["#6C4FF5", "#4c1d95"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>Total Balance</Text>
                <Feather name="eye" size={16} color="rgba(255,255,255,0.7)" />
              </View>
              {sumLoading ? (
                <ActivityIndicator color="#ffffff" style={{ marginVertical: 12 }} />
              ) : (
                <>
                  <Text style={styles.heroAmount}>{fmt(summary?.netWorth || 24580)}</Text>
                  
                  <View style={styles.heroBottomRow}>
                    <View style={styles.heroStatBlock}>
                      <Text style={styles.heroStatLabel}>Income</Text>
                      <Text style={styles.heroStatValue}>{fmt(summary?.monthlyIncome || 42000)}</Text>
                    </View>
                    <View style={styles.heroStatBlock}>
                      <Text style={styles.heroStatLabel}>Expenses</Text>
                      <Text style={styles.heroStatValue}>{fmt(summary?.monthlyExpenses || 17420)}</Text>
                    </View>
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Action Buttons Row */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.actionRow}>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.emeraldLight }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/add-transaction", params: { type: "income" } }); }}>
              <Feather name="arrow-down-left" size={22} color={colors.emerald} />
            </TouchableOpacity>
            <Text style={styles.actionText}>Add Income</Text>
          </View>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.roseLight }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: "/add-transaction", params: { type: "expense" } }); }}>
              <Feather name="arrow-up-right" size={22} color={colors.rose} />
            </TouchableOpacity>
            <Text style={styles.actionText}>Add Expense</Text>
          </View>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.skyLight }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Feather name="repeat" size={22} color={colors.accent} />
            </TouchableOpacity>
            <Text style={styles.actionText}>Transfer</Text>
          </View>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setMoreModalVisible(true);
            }}>
              <Feather name="more-horizontal" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.actionText}>More</Text>
          </View>
        </Animated.View>

        {/* Spending Overview */}
        {Array.isArray(breakdown) && breakdown.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spending Overview</Text>
            </View>
            {breakdown.slice(0, 5).map((item, i) => (
              <View key={item.category} style={styles.overviewRow}>
                <View style={[styles.overviewIconWrap, { backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}15` }]}>
                  <Feather name={getCategoryIcon(item.category)} size={20} color={CHART_COLORS[i % CHART_COLORS.length]} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.overviewLabel}>{item.category}</Text>
                  {/* Progress bar */}
                  <View style={{ width: 80, height: 5, backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`, borderRadius: 4, marginTop: 6 }}>
                    <View style={{ width: `${Math.min(100, Math.max(0, item.percent))}%`, height: '100%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 4 }} />
                  </View>
                </View>
                <Text style={styles.overviewPercent}>{Math.round(item.percent)}%</Text>
                <Text style={styles.overviewAmt}>{fmt(item.total)}</Text>
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
                  <Text style={[styles.txnAmount, { color: txn.isIncome ? colors.emerald : colors.rose }]}>
                    {txn.isIncome ? "+" : "-"}{fmt(txn.amount)}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* More Features Modal */}
      <Modal
        visible={isMoreModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1, width: '100%' }} 
            onPress={() => setMoreModalVisible(false)} 
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Explore Features</Text>
              <TouchableOpacity onPress={() => setMoreModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/budgets"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.emeraldLight }]}><Feather name="pie-chart" size={24} color={colors.emerald} /></View>
                <Text style={styles.modalFeatureText}>Budgets</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/reports"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.skyLight }]}><Feather name="trending-up" size={24} color={colors.accent} /></View>
                <Text style={styles.modalFeatureText}>Reports</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/analytics"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.purpleLight }]}><Feather name="bar-chart-2" size={24} color={colors.primary} /></View>
                <Text style={styles.modalFeatureText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/bills"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.roseLight }]}><Feather name="file-text" size={24} color={colors.rose} /></View>
                <Text style={styles.modalFeatureText}>Bills</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/ai-assistant"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.purpleLight }]}><Feather name="cpu" size={24} color={colors.primary} /></View>
                <Text style={styles.modalFeatureText}>AI Assistant</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalFeatureItem} onPress={() => { setMoreModalVisible(false); setTimeout(() => router.push("/settings"), 50); }}>
                <View style={[styles.modalFeatureIconWrap, { backgroundColor: colors.muted }]}><Feather name="settings" size={24} color={colors.mutedForeground} /></View>
                <Text style={styles.modalFeatureText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    heroLabel: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      fontFamily: "Inter_500Medium",
    },
    heroAmount: {
      fontSize: 34,
      fontWeight: "700",
      color: "#ffffff",
      marginTop: 8,
      fontFamily: "Inter_700Bold",
    },
    heroBottomRow: { flexDirection: "row", marginTop: 20, gap: 32 },
    heroStatBlock: { flex: 1 },
    heroStatLabel: { fontSize: 13, color: "rgba(255, 255, 255, 0.7)", fontFamily: "Inter_400Regular", marginBottom: 4 },
    heroStatValue: { fontSize: 16, color: "#ffffff", fontFamily: "Inter_600SemiBold" },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginBottom: 24,
    },
    actionItem: { alignItems: "center", gap: 8, flex: 1 },
    actionBtn: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    actionText: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "500",
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },

    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingRight: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    featureIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    featureText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      height: '100%',
      width: '100%',
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    modalCloseBtn: {
      padding: 8,
      backgroundColor: colors.background,
      borderRadius: 20,
    },
    modalGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'flex-start',
    },
    modalFeatureItem: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalFeatureIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    modalFeatureText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      textAlign: 'center',
    },

    section: {
      marginHorizontal: 16,
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    seeAll: { fontSize: 14, fontFamily: "Inter_500Medium" },
    overviewRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    overviewIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    overviewLabel: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    overviewPercent: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginRight: 16,
    },
    overviewAmt: {
      fontSize: 15,
      color: colors.foreground,
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
