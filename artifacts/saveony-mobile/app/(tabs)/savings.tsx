import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getListSavingsGoalsQueryKey,
  useCreateSavingsGoal,
  useDeleteSavingsGoal,
  useListSavingsGoals,
  useUpdateSavingsGoal,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const fmt = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

const GOAL_COLORS = ["#6C4FF5", "#38BDF8", "#22C55E", "#F59E0B", "#EF4444"];

interface GoalForm {
  name: string;
  targetAmount: string;
  currentAmount: string;
}

const emptyForm = (): GoalForm => ({ name: "", targetAmount: "", currentAmount: "0" });

export default function SavingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>(emptyForm());
  const [formError, setFormError] = useState("");

  const { data: goals, isLoading, refetch } = useListSavingsGoals();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListSavingsGoalsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const createMutation = useCreateSavingsGoal({
    mutation: {
      onSuccess: () => { invalidate(); setShowModal(false); setForm(emptyForm()); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
      onError: () => setFormError("Failed to create goal."),
    },
  });

  const updateMutation = useUpdateSavingsGoal({
    mutation: {
      onSuccess: () => { invalidate(); setShowModal(false); setEditId(null); setForm(emptyForm()); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
      onError: () => setFormError("Failed to update goal."),
    },
  });

  const deleteMutation = useDeleteSavingsGoal({
    mutation: { onSuccess: () => { invalidate(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
  });

  const safeGoals = Array.isArray(goals) ? goals : [];
  const totalSaved = safeGoals.reduce((s, g) => s + g.currentAmount, 0);

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setFormError(""); setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const openEdit = (goal: NonNullable<typeof goals>[0]) => {
    setEditId(goal.id);
    setForm({ name: goal.name, targetAmount: String(goal.targetAmount), currentAmount: String(goal.currentAmount) });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return setFormError("Goal name is required.");
    const target = parseFloat(form.targetAmount);
    if (isNaN(target) || target <= 0) return setFormError("Enter a valid target amount.");
    const current = parseFloat(form.currentAmount);
    if (isNaN(current) || current < 0) return setFormError("Enter a valid current amount.");
    setFormError("");
    const body = { name: form.name.trim(), targetAmount: target, currentAmount: current };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: body });
    } else {
      createMutation.mutate({ data: body });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Goal", "Remove this savings goal?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
    ]);
  };

  const topPad = isWeb ? 67 : insets.top;
  const styles = makeStyles(colors);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.title}>Savings</Text>
          <Text style={styles.subtitle}>{fmt(totalSaved)} saved total</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={safeGoals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: isWeb ? 34 : insets.bottom + 90,
          }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          scrollEnabled={!!safeGoals.length}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="target" size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptyText}>Set your first savings goal</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const pct = item.targetAmount > 0
              ? Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100))
              : 0;
            const accentColor = GOAL_COLORS[index % GOAL_COLORS.length];
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: `${accentColor}20` }]}>
                    <Feather name={item.name.toLowerCase().includes("trip") ? "map" : item.name.toLowerCase().includes("car") ? "truck" : "target"} size={20} color={accentColor} />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.targetAmt}>Target: {fmt(item.targetAmount)}</Text>
                  </View>
                  <View style={[styles.pctPill, { backgroundColor: `${accentColor}15` }]}>
                    <Text style={[styles.pctText, { color: accentColor }]}>{pct}%</Text>
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.currentLabel}>Current</Text>
                  <Text style={[styles.currentAmt, { color: accentColor }]}>{fmt(item.currentAmount)}</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: accentColor }]} />
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[styles.modal, { paddingTop: Platform.OS === "ios" ? 20 : insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? "Edit Goal" : "New Goal"}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setEditId(null); setForm(emptyForm()); setFormError(""); }}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Goal Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                  placeholder="e.g. Emergency Fund"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={form.targetAmount}
                  onChangeText={(t) => setForm({ ...form, targetAmount: t })}
                  placeholder="500000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Current Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={form.currentAmount}
                  onChangeText={(t) => setForm({ ...form, currentAmount: t })}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
              <TouchableOpacity
                style={[styles.submitBtn, isPending && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{editId ? "Update Goal" : "Create Goal"}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    goalInfo: { flex: 1 },
    goalName: { fontSize: 16, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
    targetAmt: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    pctPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pctText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    currentLabel: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    currentAmt: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
    progressTrack: { height: 8, backgroundColor: colors.secondary, borderRadius: 4, overflow: "hidden", marginBottom: 16 },
    progressFill: { height: "100%", borderRadius: 4 },
    cardActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
    actionBtn: { padding: 8, borderRadius: 8, backgroundColor: colors.secondary },
    actionBtnText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" },
    emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    modal: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: 6, fontFamily: "Inter_600SemiBold" },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    errorText: { color: colors.destructive, fontSize: 13, marginBottom: 12, fontFamily: "Inter_400Regular" },
    submitBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8, marginBottom: 32 },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });
}
