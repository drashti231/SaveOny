import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getListInvestmentsQueryKey,
  useCreateInvestment,
  useDeleteInvestment,
  useListInvestments,
  useUpdateInvestment,
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

interface InvForm {
  ticker: string;
  name: string;
  value: string;
  allocationPercent: string;
  dayChangePercent: string;
}

const emptyForm = (): InvForm => ({ ticker: "", name: "", value: "", allocationPercent: "", dayChangePercent: "0" });

export default function InvestmentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<InvForm>(emptyForm());
  const [formError, setFormError] = useState("");

  const { data: investments, isLoading, refetch } = useListInvestments();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListInvestmentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const createMutation = useCreateInvestment({
    mutation: {
      onSuccess: () => { invalidate(); setShowModal(false); setForm(emptyForm()); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
      onError: () => setFormError("Failed to add holding."),
    },
  });

  const updateMutation = useUpdateInvestment({
    mutation: {
      onSuccess: () => { invalidate(); setShowModal(false); setEditId(null); setForm(emptyForm()); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
      onError: () => setFormError("Failed to update holding."),
    },
  });

  const deleteMutation = useDeleteInvestment({
    mutation: { onSuccess: () => { invalidate(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
  });

  const safeInvestments = Array.isArray(investments) ? investments : [];
  const totalValue = safeInvestments.reduce((s, i) => s + i.value, 0);

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setFormError(""); setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const openEdit = (inv: typeof investments extends (infer T)[] | undefined ? T : never) => {
    if (!inv) return;
    setEditId((inv as any).id);
    setForm({
      ticker: (inv as any).ticker,
      name: (inv as any).name,
      value: String((inv as any).value),
      allocationPercent: String((inv as any).allocationPercent),
      dayChangePercent: String((inv as any).dayChangePercent),
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.ticker.trim()) return setFormError("Ticker is required.");
    if (!form.name.trim()) return setFormError("Name is required.");
    const value = parseFloat(form.value);
    if (isNaN(value) || value < 0) return setFormError("Enter a valid value.");
    const alloc = parseFloat(form.allocationPercent);
    if (isNaN(alloc)) return setFormError("Enter a valid allocation %.");
    const change = parseFloat(form.dayChangePercent);
    if (isNaN(change)) return setFormError("Enter a valid day change %.");
    setFormError("");
    const body = {
      ticker: form.ticker.trim().toUpperCase(),
      name: form.name.trim(),
      value,
      allocationPercent: alloc,
      dayChangePercent: change,
    };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: body });
    } else {
      createMutation.mutate({ data: body });
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Remove Holding", "Delete this investment?", [
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
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>{fmt(totalValue)} total</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={safeInvestments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: isWeb ? 34 : insets.bottom + 90,
          }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
          scrollEnabled={!!safeInvestments.length}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="trending-up" size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No holdings yet</Text>
              <Text style={styles.emptyText}>Add your first investment</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPositive = item.dayChangePercent >= 0;
            const changeAmt = item.value * (item.dayChangePercent / 100);
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.tickerBadge}>
                    <Text style={styles.tickerText}>{item.ticker.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.tickerName}>{item.ticker}</Text>
                    <Text style={styles.fullName} numberOfLines={1}>{item.name}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardValue}>{fmt(item.value)}</Text>
                  <View style={[styles.changeChip, { backgroundColor: isPositive ? colors.emeraldLight : colors.roseLight }]}>
                    <Feather
                      name={isPositive ? "trending-up" : "trending-down"}
                      size={11}
                      color={isPositive ? colors.primary : "#EF4444"}
                    />
                    <Text style={[styles.changeText, { color: isPositive ? colors.primary : "#EF4444" }]}>
                      {isPositive ? "+" : ""}{item.dayChangePercent.toFixed(2)}%
                    </Text>
                  </View>
                  <Text style={styles.allocText}>{item.allocationPercent.toFixed(1)}% alloc</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <Feather name="edit-2" size={15} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Feather name="trash-2" size={15} color={colors.mutedForeground} />
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
              <Text style={styles.modalTitle}>{editId ? "Edit Holding" : "Add Holding"}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setEditId(null); setForm(emptyForm()); setFormError(""); }}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: "Ticker (e.g. RELIANCE)", key: "ticker", placeholder: "RELIANCE", autoCapitalize: "characters" },
                { label: "Full Name", key: "name", placeholder: "Reliance Industries Ltd" },
                { label: "Current Value (₹)", key: "value", placeholder: "100000", keyboardType: "numeric" },
                { label: "Allocation %", key: "allocationPercent", placeholder: "25.0", keyboardType: "decimal-pad" },
                { label: "24h Change %", key: "dayChangePercent", placeholder: "1.5", keyboardType: "decimal-pad" },
              ].map((field) => (
                <View key={field.key} style={styles.formGroup}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={(form as any)[field.key]}
                    onChangeText={(t) => setForm({ ...form, [field.key]: t })}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={(field as any).keyboardType ?? "default"}
                    autoCapitalize={(field as any).autoCapitalize ?? "none"}
                  />
                </View>
              ))}
              {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
              <TouchableOpacity
                style={[styles.submitBtn, isPending && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{editId ? "Update" : "Add Holding"}</Text>
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
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    cardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    tickerBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    tickerText: { fontSize: 13, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    tickerName: { fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    fullName: { fontSize: 11, color: colors.mutedForeground, marginTop: 1, fontFamily: "Inter_400Regular", maxWidth: 100 },
    cardRight: { alignItems: "flex-end", gap: 3 },
    cardValue: { fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    changeChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 3,
    },
    changeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    allocText: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    cardActions: { gap: 6 },
    actionBtn: { padding: 4 },
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
