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
import { useRouter } from "expo-router";

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
            icon={<RowIcon name="edit-2" bg="#6C4FF5" />}
            label="Edit Profile"
            onPress={() =>
              Alert.alert("Edit Profile", "Profile editing coming soon.")
            }
          />
          <Row
            icon={<RowIcon name="lock" bg="#38BDF8" />}
            label="Change Password"
            onPress={() =>
              Alert.alert("Change Password", "Password change coming soon.")
            }
          />
        </Card>

        {/* ── PROFILE OPTIONS ── */}
        <Card>
          <Row
            icon={<RowIcon name="user" bg="#6C4FF5" />}
            label="My Profile"
            onPress={() => Alert.alert("Profile", "Coming soon.")}
          />
          <Row
            icon={<RowIcon name="settings" bg="#64748b" />}
            label="Settings"
            onPress={() => router.push("/settings")}
          />
          <Row
            icon={<RowIcon name="link" bg="#38BDF8" />}
            label="Linked Accounts"
            onPress={() => Alert.alert("Linked Accounts", "Coming soon.")}
          />
          <Row
            icon={<RowIcon name="bell" bg="#F59E0B" />}
            label="Notifications"
            onPress={() => Alert.alert("Notifications", "Coming soon.")}
          />
          <Row
            icon={<RowIcon name="help-circle" bg="#10b981" />}
            label="Help & Support"
            onPress={() => Alert.alert("Help & Support", "Coming soon.")}
          />
          <Row
            icon={<RowIcon name="info" bg="#8b5cf6" />}
            label="About Saveony"
            onPress={() => Alert.alert("About", "Coming soon.")}
          />
        </Card>

        <TouchableOpacity style={[styles.premiumCard, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
          <View style={styles.premiumIconWrap}>
            <Text style={{ fontSize: 24 }}>👑</Text>
          </View>
          <View style={styles.premiumInfo}>
            <Text style={[styles.premiumTitle, { color: colors.primary }]}>Upgrade to Premium</Text>
            <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>
              Get more features, better insights and achieve your goals faster.
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.goPremiumBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.goPremiumText}>Go Premium</Text>
        </TouchableOpacity>

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
  
  // Premium
  premiumCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    alignItems: "center",
    gap: 16
  },
  premiumIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumInfo: { flex: 1 },
  premiumTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  premiumDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  goPremiumBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8
  },
  goPremiumText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },

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
