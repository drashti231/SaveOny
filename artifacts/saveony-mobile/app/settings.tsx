import { useAuth, useUser } from "./context/AuthContext";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
      {title.toUpperCase()}
    </Text>
  );
}

function RowIcon({
  name,
  bg,
  color = "#fff",
}: {
  name: string;
  bg: string;
  color?: string;
}) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: bg }]}>
      <Feather name={name as never} size={15} color={color} />
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.65 : 1}
    >
      {icon}
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        ) : null}
        {right ?? null}
        {onPress && !right ? (
          <Feather
            name="chevron-right"
            size={16}
            color={colors.mutedForeground}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      {icon}
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
}

export default function DetailedSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    "system"
  );
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifGoals, setNotifGoals] = useState(true);
  const [notifBudget, setNotifBudget] = useState(false);

  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const themeOptions: { key: "light" | "dark" | "system"; label: string; icon: string }[] = [
    { key: "light", label: "Light", icon: "sun" },
    { key: "dark", label: "Dark", icon: "moon" },
    { key: "system", label: "System", icon: "monitor" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 18 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── APPEARANCE ── */}
        <SectionHeader title="Appearance" />
        <Card>
          <View style={styles.themeRow}>
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor:
                      appearance === opt.key
                        ? colors.primary
                        : colors.secondary,
                    borderColor:
                      appearance === opt.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setAppearance(opt.key)}
                activeOpacity={0.75}
              >
                <Feather
                  name={opt.icon as never}
                  size={20}
                  color={appearance === opt.key ? "#fff" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color:
                        appearance === opt.key ? "#fff" : colors.foreground,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {appearance === opt.key && (
                  <Feather name="check" size={13} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* ── NOTIFICATIONS ── */}
        <SectionHeader title="Notifications" />
        <Card>
          <ToggleRow
            icon={<RowIcon name="mail" bg="#6C4FF5" />}
            label="Email Alerts"
            value={notifEmail}
            onChange={setNotifEmail}
          />
          <ToggleRow
            icon={<RowIcon name="bell" bg="#F59E0B" />}
            label="Push Notifications"
            value={notifPush}
            onChange={setNotifPush}
          />
          <ToggleRow
            icon={<RowIcon name="bar-chart-2" bg="#38BDF8" />}
            label="Weekly Report"
            value={notifWeekly}
            onChange={setNotifWeekly}
          />
          <ToggleRow
            icon={<RowIcon name="target" bg="#10b981" />}
            label="Goal Alerts"
            value={notifGoals}
            onChange={setNotifGoals}
          />
          <ToggleRow
            icon={<RowIcon name="alert-triangle" bg="#ef4444" />}
            label="Budget Warnings"
            value={notifBudget}
            onChange={setNotifBudget}
          />
        </Card>

        {/* ── SECURITY ── */}
        <SectionHeader title="Security" />
        <Card>
          <ToggleRow
            icon={<RowIcon name="cpu" bg="#8b5cf6" />}
            label="Biometric Lock"
            value={biometric}
            onChange={setBiometric}
          />
          <ToggleRow
            icon={<RowIcon name="shield" bg="#38BDF8" />}
            label="Two-Factor Authentication"
            value={twoFactor}
            onChange={setTwoFactor}
          />
          <Row
            icon={<RowIcon name="smartphone" bg="#64748b" />}
            label="Active Sessions"
            onPress={() =>
              Alert.alert("Active Sessions", "Session management coming soon.")
            }
          />
        </Card>

        {/* ── PRIVACY ── */}
        <SectionHeader title="Privacy & Data" />
        <Card>
          <Row
            icon={<RowIcon name="download" bg="#10b981" />}
            label="Export My Data"
            onPress={() =>
              Alert.alert("Export Data", "Your data export will be emailed to you.")
            }
          />
          <Row
            icon={<RowIcon name="file-text" bg="#6C4FF5" />}
            label="Privacy Policy"
            onPress={() =>
              Alert.alert("Privacy Policy", "Privacy policy coming soon.")
            }
          />
          <Row
            icon={<RowIcon name="trash-2" bg="#ef4444" />}
            label="Delete Account"
            danger
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "This will permanently erase all your data. This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert("Deleted", "Your account has been deleted."),
                  },
                ]
              )
            }
          />
        </Card>

        {/* ── CURRENCY & LANGUAGE ── */}
        <SectionHeader title="Currency & Language" />
        <Card>
          <Row
            icon={<RowIcon name="dollar-sign" bg="#F59E0B" />}
            label="Currency"
            value={currency}
            onPress={() =>
              Alert.alert(
                "Currency",
                "Select currency",
                ["INR ₹", "USD $", "EUR €", "GBP £"].map((c) => ({
                  text: c,
                  onPress: () => setCurrency(c.split(" ")[0]),
                }))
              )
            }
          />
          <Row
            icon={<RowIcon name="globe" bg="#38BDF8" />}
            label="Language"
            value={language}
            onPress={() =>
              Alert.alert(
                "Language",
                "Select language",
                [
                  "English",
                  "Hindi",
                  "Tamil",
                  "Telugu",
                  "Kannada",
                  "Bengali",
                  "Marathi",
                  "Gujarati",
                ].map((l) => ({
                  text: l,
                  onPress: () => setLanguage(l),
                }))
              )
            }
          />
          <Row
            icon={<RowIcon name="hash" bg="#6C4FF5" />}
            label="Number Format"
            value="en-IN (1,00,000)"
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },

  // Appearance theme cards
  themeRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  themeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
