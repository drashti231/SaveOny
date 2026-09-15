import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [filter, setFilter] = useState("Monthly");

  const incomeData = [
    { value: 10 }, { value: 12 }, { value: 18 }, { value: 25 }, { value: 20 }, { value: 35 }, { value: 42 }
  ];
  const expenseData = [
    { value: 5 }, { value: 6 }, { value: 8 }, { value: 12 }, { value: 10 }, { value: 14 }, { value: 17 }
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Filters */}
        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {["Monthly", "Last 3 Months", "Custom"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && [styles.filterBtnActive, { backgroundColor: colors.primary }]]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? '#fff' : colors.mutedForeground }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Income Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>Total Income</Text>
              <Text style={styles.cardAmount}>₹ 42,000</Text>
              <Text style={styles.cardGrowthGreen}>↑ 12%</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={incomeData}
              width={width - 80}
              height={80}
              thickness={3}
              color="#10b981"
              hideDataPoints
              hideRules
              hideYAxisText
              hideAxesAndRules
              areaChart
              startFillColor="#10b981"
              endFillColor="#ffffff"
              startOpacity={0.4}
              endOpacity={0.1}
              initialSpacing={0}
              adjustToWidth
            />
          </View>
        </View>

        {/* Total Expenses Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>Total Expenses</Text>
              <Text style={styles.cardAmount}>₹ 17,420</Text>
              <Text style={styles.cardGrowthRed}>↑ 8%</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={expenseData}
              width={width - 80}
              height={80}
              thickness={3}
              color="#EF4444"
              hideDataPoints
              hideRules
              hideYAxisText
              hideAxesAndRules
              areaChart
              startFillColor="#EF4444"
              endFillColor="#ffffff"
              startOpacity={0.4}
              endOpacity={0.1}
              initialSpacing={0}
              adjustToWidth
            />
          </View>
        </View>

        {/* Net Savings Card */}
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Net Savings</Text>
            <Text style={styles.cardAmount}>₹ 24,580</Text>
            <Text style={styles.cardGrowthGreen}>↑ 15%</Text>
          </View>
          <View style={styles.iconCircleGreen}>
            <Feather name="trending-up" size={24} color="#10b981" />
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert("Success", "Report downloaded successfully!")}>
          <Feather name="download" size={20} color="#fff" style={{ marginRight: 12 }} />
          <Text style={styles.downloadBtnText}>Download Report</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  filterRow: { 
    flexDirection: "row", 
    borderRadius: 24, 
    padding: 4,
    marginBottom: 24,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  filterBtnActive: {},
  filterText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  filterTextActive: { color: '#ffffff' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: -20, // To pull chart closer
    zIndex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: '#64748b',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: '#0f172a',
    marginBottom: 8,
  },
  cardGrowthGreen: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: '#10b981',
  },
  cardGrowthRed: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: '#EF4444',
  },
  chartContainer: {
    marginTop: 0,
    marginLeft: -20, // Adjust layout for chart
  },
  iconCircleGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: '#6C4FF5',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: 'center',
    shadowColor: "#6C4FF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  }
});
