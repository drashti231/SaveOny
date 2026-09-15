import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function BillRemindersScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const [filter, setFilter] = useState("Upcoming");

  const bills = [
    { id: '1', title: 'Electricity Bill', amount: 800, date: '16 Sep 2025', daysLeft: 1, icon: 'zap', color: '#F59E0B', bg: '#fef3c7', urgent: true },
    { id: '2', title: 'Internet', amount: 999, date: '20 Sep 2025', daysLeft: 5, icon: 'wifi', color: '#38BDF8', bg: '#e0f2fe', urgent: false },
    { id: '3', title: 'Mobile Recharge', amount: 299, date: '25 Sep 2025', daysLeft: 10, icon: 'smartphone', color: '#22C55E', bg: '#dcfce7', urgent: false },
    { id: '4', title: 'Rent', amount: 12000, date: '01 Oct 2025', daysLeft: 16, icon: 'home', color: '#6C4FF5', bg: '#ede9fe', urgent: false },
    { id: '5', title: 'Credit Card', amount: 5500, date: '05 Oct 2025', daysLeft: 20, icon: 'credit-card', color: '#EF4444', bg: '#fee2e2', urgent: false },
  ];

  const totalUpcoming = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Bill Reminders</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Upcoming Bills Total</Text>
          <Text style={styles.summaryAmount}>₹ {totalUpcoming.toLocaleString()}</Text>
          <Text style={styles.summaryMeta}>{bills.length} bills due this month</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {["Upcoming", "Past"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bills List */}
        <View style={styles.list}>
          {bills.map(item => (
            <View key={item.id} style={[styles.billItem, item.urgent && styles.billItemUrgent]}>
              <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                <Feather name={item.icon as any} size={20} color={item.color} />
              </View>
              
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>Due {item.date} · {item.daysLeft} days left</Text>
              </View>

              <View style={styles.itemRight}>
                <Text style={styles.itemAmount}>₹ {item.amount.toLocaleString()}</Text>
                <TouchableOpacity 
                  style={styles.payBtn}
                  onPress={() => Alert.alert("Pay Bill", `Pay ₹${item.amount} for ${item.title}?`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Pay Now", onPress: () => Alert.alert("Success", "Payment initiated!") }
                  ])}
                >
                  <Text style={styles.payBtnText}>Pay</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    summaryLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: 'rgba(255,255,255,0.75)',
      marginBottom: 6,
    },
    summaryAmount: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: '#ffffff',
      marginBottom: 4,
    },
    summaryMeta: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: 'rgba(255,255,255,0.7)',
    },
    filterRow: { 
      flexDirection: "row", 
      backgroundColor: colors.muted, 
      borderRadius: 24, 
      padding: 4,
      marginBottom: 20,
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
    list: {
      gap: 14,
    },
    billItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billItemUrgent: {
      borderColor: '#EF4444',
      borderWidth: 1.5,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    itemBody: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 3,
    },
    itemSubtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    itemRight: {
      alignItems: 'flex-end',
      gap: 8,
    },
    itemAmount: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    payBtn: {
      backgroundColor: colors.purpleLight,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
    },
    payBtnText: {
      color: colors.primary,
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
  });
}
