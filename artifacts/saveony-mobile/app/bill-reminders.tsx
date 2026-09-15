import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useListBills, useUpdateBill } from "@workspace/api-client-react";

export default function BillRemindersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  
  const { data: bills, isLoading, refetch } = useListBills();
  const updateBill = useUpdateBill();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const upcomingBills = (bills ?? []).filter(b => !b.isPaid);
  const pastBills = (bills ?? []).filter(b => b.isPaid);

  const displayBills = tab === "upcoming" ? upcomingBills : pastBills;

  const handlePay = (id: number) => {
    updateBill.mutate({ id, data: { isPaid: true } }, {
      onSuccess: () => {
        Alert.alert("Success", "Bill marked as paid!");
        refetch();
      }
    });
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("electric")) return { icon: "zap", bg: "#fef3c7", color: "#F59E0B" };
    if (lower.includes("internet") || lower.includes("wifi")) return { icon: "wifi", bg: "#dbeafe", color: "#38BDF8" };
    if (lower.includes("mobile") || lower.includes("phone")) return { icon: "smartphone", bg: "#fce7f3", color: "#ec4899" };
    if (lower.includes("rent") || lower.includes("home")) return { icon: "home", bg: "#e0e7ff", color: "#6C4FF5" };
    if (lower.includes("card")) return { icon: "credit-card", bg: "#d1fae5", color: "#10b981" };
    return { icon: "file-text", bg: "#f3f4f6", color: "#6b7280" };
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Bill Reminders",
          headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 18 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/add-bill")}>
              <Feather name="plus" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        
        {/* Top Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.secondary }]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "upcoming" && { backgroundColor: colors.primary }]}
            onPress={() => setTab("upcoming")}
          >
            <Text style={[styles.tabText, tab === "upcoming" ? { color: "#fff" } : { color: colors.foreground }]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "past" && { backgroundColor: colors.primary }]}
            onPress={() => setTab("past")}
          >
            <Text style={[styles.tabText, tab === "past" ? { color: "#fff" } : { color: colors.foreground }]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <View style={styles.list}>
            {displayBills.map((b) => {
              const { icon, bg, color } = getIcon(b.name);
              return (
                <View key={b.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                    <Feather name={icon as any} size={20} color={color} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.foreground }]}>{b.name}</Text>
                    <Text style={[styles.details, { color: colors.mutedForeground }]}>
                      {fmt(b.amount)} • {b.dueDate}
                    </Text>
                  </View>
                  {!b.isPaid && (
                    <TouchableOpacity 
                      style={[styles.payBtn, { backgroundColor: `${colors.primary}15` }]}
                      onPress={() => handlePay(b.id)}
                    >
                      <Text style={[styles.payText, { color: colors.primary }]}>Pay</Text>
                    </TouchableOpacity>
                  )}
                  {b.isPaid && (
                    <View style={styles.paidBadge}>
                      <Feather name="check" size={16} color={colors.primary} />
                      <Text style={[styles.paidText, { color: colors.primary }]}>Paid</Text>
                    </View>
                  )}
                </View>
              );
            })}
            
            {displayBills.length === 0 && (
              <View style={styles.empty}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                  No {tab} bills found.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16 },
  
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  list: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  details: { fontSize: 13, fontFamily: "Inter_500Medium" },
  
  payBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paidText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  
  empty: { padding: 40, alignItems: "center" }
});
