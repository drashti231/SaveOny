import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [filter, setFilter] = useState("Weekly");

  const barData = [
    { value: 3000, label: 'Mon', frontColor: '#a78bfa' },
    { value: 4000, label: 'Tue', frontColor: '#c084fc' },
    { value: 4500, label: 'Wed', frontColor: '#34d399' },
    { value: 3000, label: 'Thu', frontColor: '#f472b6' },
    { value: 5500, label: 'Fri', frontColor: '#2dd4bf' },
    { value: 3000, label: 'Sat', frontColor: '#fb7185' },
    { value: 5000, label: 'Sun', frontColor: '#818cf8' },
  ];

  const pieData = [
    { value: 32, color: '#8b5cf6', text: '32%' }, // Food
    { value: 18, color: '#EF4444', text: '18%' }, // Shopping
    { value: 12, color: '#fb923c', text: '12%' }, // Transport
    { value: 10, color: '#38BDF8', text: '10%' }, // Bills
    { value: 28, color: '#94a3b8', text: '28%' }, // Others
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
          <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Filters */}
        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {["Weekly", "Monthly", "Yearly"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && [styles.filterBtnActive, { backgroundColor: colors.primary }]]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: filter === f ? '#fff' : colors.mutedForeground }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending Overview Bar Chart */}
        <Text style={styles.sectionTitle}>Spending Overview</Text>
        <View style={styles.barChartContainer}>
          <BarChart
            data={barData}
            width={width - 80}
            height={180}
            barWidth={18}
            spacing={16}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#94a3b8', fontSize: 12 }}
            noOfSections={3}
            maxValue={6000}
            labelWidth={30}
            xAxisLabelTextStyle={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}
          />
        </View>

        {/* Donut Chart & Legend */}
        <View style={styles.donutSection}>
          <View style={styles.donutContainer}>
            <PieChart
              donut
              data={pieData}
              innerRadius={45}
              radius={70}
              centerLabelComponent={() => {
                return (
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 16, color: '#0f172a', fontWeight: 'bold'}}>₹ 17,420</Text>
                  </View>
                );
              }}
            />
          </View>
          
          <View style={styles.legendContainer}>
            <LegendItem color="#8b5cf6" label="Food & Dining" percent="32%" />
            <LegendItem color="#EF4444" label="Shopping" percent="18%" />
            <LegendItem color="#fb923c" label="Transport" percent="12%" />
            <LegendItem color="#38BDF8" label="Bills" percent="10%" />
            <LegendItem color="#94a3b8" label="Others" percent="28%" />
          </View>
        </View>

        {/* Insight Banner */}
        <View style={[styles.insightBanner, { backgroundColor: colors.emeraldLight }]}>
          <View style={[styles.insightIcon, { backgroundColor: colors.emeraldLight }]}>
            <Feather name="trending-down" size={20} color={colors.emerald} />
          </View>
          <Text style={[styles.insightText, { color: colors.emerald }]}>You spent 20% less than last week! 🎉</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label, percent }: { color: string, label: string, percent: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendLabel}>{label}</Text>
      </View>
      <Text style={styles.legendPercent}>{percent}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: '#0f172a',
    marginBottom: 20,
  },
  barChartContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  donutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: '#475569',
  },
  legendPercent: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: '#64748b',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 16,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: '#065f46',
  }
});
