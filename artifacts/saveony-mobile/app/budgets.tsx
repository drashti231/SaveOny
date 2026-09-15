import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);

  const budgets = [
    { id: '1', title: 'Food & Dining', spent: 8000, total: 12000, percentage: 65, icon: 'coffee', color: '#EF4444', bg: '#fee2e2' },
    { id: '2', title: 'Shopping', spent: 5000, total: 6250, percentage: 80, icon: 'shopping-bag', color: '#F59E0B', bg: '#fef3c7' },
    { id: '3', title: 'Transport', spent: 3000, total: 5000, percentage: 60, icon: 'truck', color: '#38BDF8', bg: '#e0f2fe' },
    { id: '4', title: 'Bills', spent: 4000, total: 5333, percentage: 75, icon: 'file-text', color: '#6C4FF5', bg: '#ede9fe' },
    { id: '5', title: 'Others', spent: 5000, total: 10000, percentage: 50, icon: 'user', color: '#22C55E', bg: '#dcfce7' },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Main Budget Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>Monthly Budget</Text>
          <Text style={styles.mainCardAmount}>₹ 25,000</Text>
          
          <View style={styles.mainProgressBarBg}>
            <View style={[styles.mainProgressBarActive, { width: '70%' }]} />
          </View>
          
          <View style={styles.mainCardFooter}>
            <Text style={styles.mainCardSpent}><Text style={{fontWeight: '700'}}>₹ 17,420</Text> spent</Text>
            <Text style={styles.mainCardPercentage}>70% used</Text>
          </View>
        </View>

        {/* Categories List */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.list}>
          {budgets.map(item => (
            <View key={item.id} style={styles.budgetItem}>
              <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                <Feather name={item.icon as any} size={20} color={item.color} />
              </View>
              
              <View style={styles.itemBody}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSpent}>₹ {item.spent.toLocaleString()}</Text>
                </View>
                
                <View style={styles.itemProgressBarBg}>
                  <View style={[styles.itemProgressBarActive, { 
                    width: `${item.percentage}%`, 
                    backgroundColor: item.percentage > 75 ? colors.rose : item.color 
                  }]} />
                </View>
                <Text style={styles.itemPercent}>{item.percentage}% of ₹{item.total.toLocaleString()}</Text>
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
    mainCard: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 24,
      marginBottom: 28,
    },
    mainCardTitle: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 8,
    },
    mainCardAmount: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: '#ffffff',
      marginBottom: 20,
    },
    mainProgressBarBg: {
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 4,
      marginBottom: 12,
      overflow: 'hidden',
    },
    mainProgressBarActive: {
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 4,
    },
    mainCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainCardSpent: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: 'rgba(255,255,255,0.85)',
    },
    mainCardPercentage: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: '#ffffff',
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 16,
    },
    list: {
      gap: 20,
    },
    budgetItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    itemBody: {
      flex: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    itemTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    itemSpent: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    itemPercent: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 6,
    },
    itemProgressBarBg: {
      height: 6,
      backgroundColor: colors.muted,
      borderRadius: 3,
      overflow: 'hidden',
    },
    itemProgressBarActive: {
      height: '100%',
      borderRadius: 3,
    },
  });
}
