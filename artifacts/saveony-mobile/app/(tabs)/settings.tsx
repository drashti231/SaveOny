import { useAuth, useUser } from "../context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const isIOS = Platform.OS === "ios";

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

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();

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

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const displayName =
    user?.displayName ??
    user?.email?.split("@")[0] ??
    "User";
  const email = user?.email ?? "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  const themeOptions: { key: "light" | "dark" | "system"; label: string; icon: string }[] = [
    { key: "light", label: "Light", icon: "sun" },
    { key: "dark", label: "Dark", icon: "moon" },
    { key: "system", label: "System", icon: "monitor" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Settings
        </Text>

        {/* ── PROFILE ── */}
        <SectionHeader title="Profile" />
        <Card>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {displayName}
              </Text>
              <Text
                style={[styles.profileEmail, { color: colors.mutedForeground }]}
              >
                {email}
              </Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.emeraldLight },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  Premium
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row
            icon={<RowIcon name="edit-2" bg="#6366f1" />}
            label="Edit Profile"
            onPress={() =>
              Alert.alert("Edit Profile", "Profile editing coming soon.")
            }
          />
          <Row
            icon={<RowIcon name="lock" bg="#0ea5e9" />}
            label="Change Password"
            onPress={() =>
              Alert.alert("Change Password", "Password change coming soon.")
            }
          />
        </Card>

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
            icon={<RowIcon name="mail" bg="#6366f1" />}
            label="Email Alerts"
            value={notifEmail}
            onChange={setNotifEmail}
          />
          <ToggleRow
            icon={<RowIcon name="bell" bg="#f59e0b" />}
            label="Push Notifications"
            value={notifPush}
            onChange={setNotifPush}
          />
          <ToggleRow
            icon={<RowIcon name="bar-chart-2" bg="#0ea5e9" />}
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
            icon={<RowIcon name="shield" bg="#0ea5e9" />}
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
            icon={<RowIcon name="file-text" bg="#6366f1" />}
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
            icon={<RowIcon name="dollar-sign" bg="#f59e0b" />}
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
            icon={<RowIcon name="globe" bg="#0ea5e9" />}
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
            icon={<RowIcon name="hash" bg="#6366f1" />}
            label="Number Format"
            value="en-IN (1,00,000)"
          />
        </Card>

        {/* ── ABOUT ── */}
        <SectionHeader title="About App" />
        <Card>
          <Row
            icon={<RowIcon name="info" bg="#64748b" />}
            label="Version"
            right={
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                  1.0.0
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.emeraldLight },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    Latest
                  </Text>
                </View>
              </View>
            }
          />
          <Row
            icon={<RowIcon name="file-text" bg="#0ea5e9" />}
            label="Terms of Service"
            onPress={() =>
              Alert.alert("Terms", "Terms of service coming soon.")
            }
          />
          <Row
            icon={<RowIcon name="help-circle" bg="#f59e0b" />}
            label="Help & Support"
            onPress={() =>
              Alert.alert("Support", "Contact support@saveony.app for help.")
            }
          />
        </Card>

        {/* ── LOGOUT ── */}
        <SectionHeader title="Account" />
        <Card>
          <Row
            icon={<RowIcon name="log-out" bg="#ef4444" />}
            label="Sign Out"
            danger
            onPress={() => setShowLogoutModal(true)}
          />
        </Card>
      </ScrollView>

      {/* Logout modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.modalIconWrap,
                { backgroundColor: "#fef2f2" },
              ]}
            >
              <Feather name="log-out" size={28} color="#ef4444" />
            </View>
            <Text
              style={[styles.modalTitle, { color: colors.foreground }]}
            >
              Sign out?
            </Text>
            <Text
              style={[styles.modalBody, { color: colors.mutedForeground }]}
            >
              You'll need to sign back in with your email OTP to access your
              finances.
            </Text>
            <TouchableOpacity
              style={styles.modalLogoutBtn}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.modalLogoutText}>Yes, Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { borderColor: colors.border, backgroundColor: colors.secondary },
              ]}
              onPress={() => setShowLogoutModal(false)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.modalCancelText, { color: colors.foreground }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: "Inter_700Bold",
  },
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
  divider: { height: 1, marginHorizontal: 16 },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

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

  // Logout modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  modalBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  modalLogoutBtn: {
    width: "100%",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  modalLogoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  modalCancelBtn: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
});
