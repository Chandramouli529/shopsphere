import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchVendors,
  updateVendorStatus,
  deleteVendorRemote,
  createVendorRemote,
  clearCreateVendorError,
} from "@/store/slices/vendorsSlice";
import type { VendorAccount } from "@/data/vendors";
import { CATEGORIES } from "@/data/categories";
import AnimatedPressable from "@/components/AnimatedPressable";
import { TOP_BRANDS } from "@/data/topBrands";

const ADMIN_COLOR = "#6c2eb5";

const STATUS_META: Record<VendorAccount["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#e67e22" },
  approved: { label: "Approved", color: colors.green },
  rejected: { label: "Rejected", color: "#c0392b" },
  suspended: { label: "Suspended", color: "#7c7c7c" },
};

type FilterTab = "All" | VendorAccount["status"];

function VendorCard({ vendor }: { vendor: VendorAccount }) {
  const dispatch = useDispatch<AppDispatch>();
  const meta = STATUS_META[vendor.status] ?? STATUS_META.pending;
  const isBusy = useSelector((state: RootState) => state.vendors.actionStatus[vendor.id] === "loading");

  const onApprove = async () => {
    const result = await dispatch(updateVendorStatus({ id: vendor.id, status: "approved" }));
    if (updateVendorStatus.rejected.match(result)) {
      Alert.alert(
        "Approval Failed",
        `${(result.payload as string) ?? "Could not approve this vendor."}\n\nVendor id sent: ${vendor.id}`
      );
    }
  };

  const onReject = () => {
    Alert.alert("Reject Vendor", `Reject ${vendor.businessName}'s application?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(updateVendorStatus({ id: vendor.id, status: "rejected" }));
          if (updateVendorStatus.rejected.match(result)) {
            Alert.alert("Failed", (result.payload as string) ?? "Could not reject this vendor.");
          }
        },
      },
    ]);
  };

  const onSuspend = () => {
    Alert.alert("Suspend Vendor", `Suspend ${vendor.businessName}? They won't be able to log in until reactivated.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Suspend",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(updateVendorStatus({ id: vendor.id, status: "suspended" }));
          if (updateVendorStatus.rejected.match(result)) {
            Alert.alert("Failed", (result.payload as string) ?? "Could not suspend this vendor.");
          }
        },
      },
    ]);
  };

  const onReactivate = async () => {
    const result = await dispatch(updateVendorStatus({ id: vendor.id, status: "approved" }));
    if (updateVendorStatus.rejected.match(result)) {
      Alert.alert("Failed", (result.payload as string) ?? "Could not reactivate this vendor.");
    }
  };

  const onDelete = () => {
    Alert.alert("Delete Vendor", `Permanently delete ${vendor.businessName}? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(deleteVendorRemote(vendor.id));
          if (deleteVendorRemote.rejected.match(result)) {
            Alert.alert("Failed", (result.payload as string) ?? "Could not delete this vendor.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.businessName}>{vendor.businessName}</Text>
          <Text style={styles.owner}>{vendor.ownerName} · {vendor.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.color + "22" }]}>
          <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8} style={{ marginLeft: spacing.sm }} disabled={isBusy}>
          <Ionicons name="trash-outline" size={17} color="#c0392b" />
        </Pressable>
      </View>
      <Text style={styles.email}>{vendor.email}</Text>
      <Text style={styles.joined}>
        Joined {new Date(vendor.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </Text>

      <View style={styles.actionsRow}>
        {isBusy ? (
          <ActivityIndicator size="small" color={ADMIN_COLOR} />
        ) : (
          <>
            {vendor.status === "pending" && (
              <>
                <AnimatedPressable style={[styles.actionBtn, { backgroundColor: ADMIN_COLOR }]} onPress={onApprove}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </AnimatedPressable>
                <AnimatedPressable style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
                  <Ionicons name="close" size={14} color="#c0392b" />
                  <Text style={[styles.actionBtnText, { color: "#c0392b" }]}>Reject</Text>
                </AnimatedPressable>
              </>
            )}
            {vendor.status === "approved" && (
              <AnimatedPressable style={[styles.actionBtn, styles.suspendBtn]} onPress={onSuspend}>
                <Ionicons name="pause-circle-outline" size={14} color="#7c7c7c" />
                <Text style={[styles.actionBtnText, { color: "#7c7c7c" }]}>Suspend</Text>
              </AnimatedPressable>
            )}
            {vendor.status === "suspended" && (
              <AnimatedPressable style={[styles.actionBtn, { backgroundColor: ADMIN_COLOR }]} onPress={onReactivate}>
                <Ionicons name="play-circle-outline" size={14} color="#fff" />
                <Text style={styles.actionBtnText}>Reactivate</Text>
              </AnimatedPressable>
            )}
            {vendor.status === "rejected" && <Text style={styles.doneText}>Application rejected</Text>}
          </>
        )}
      </View>
    </View>
  );
}

function CreateVendorModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const createStatus = useSelector((state: RootState) => state.vendors.createStatus);
  const createError = useSelector((state: RootState) => state.vendors.createError);

  const [vendorName, setVendorName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [shopName, setShopName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const loading = createStatus === "loading";

  const reset = () => {
    setVendorName("");
    setEmail("");
    setMobileNumber("");
    setBusinessType("");
    setShopName("");
    setValidationError(null);
    dispatch(clearCreateVendorError());
  };

  const onSave = async () => {
    if (!vendorName.trim() || !email.trim() || !mobileNumber.trim() || !businessType.trim() || !shopName.trim()) {
      setValidationError("All fields are required.");
      return;
    }
    setValidationError(null);
    const result = await dispatch(
      createVendorRemote({
        vendorName: vendorName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        businessType: businessType.trim(),
        shopName: shopName.trim(),
      })
    );
    if (createVendorRemote.fulfilled.match(result)) {
      Alert.alert("Vendor Created", "The vendor account has been created. Login credentials will be sent by the backend.");
      reset();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => { reset(); onClose(); }} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.modalTitle}>Create Vendor</Text>
          <View style={{ width: 22 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Vendor Name</Text>
            <TextInput style={styles.input} value={vendorName} onChangeText={setVendorName} placeholder="Legal / registered name" />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={(v) => setMobileNumber(v.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.fieldLabel}>Business Type</Text>
            <View style={styles.typeChipWrap}>
              {CATEGORIES.filter((c) => c.key !== "foryou").map((c) => {
                const isActive = businessType === c.label;
                return (
                  <Pressable
                    key={c.key}
                    style={[styles.typeChip, isActive && { backgroundColor: ADMIN_COLOR, borderColor: ADMIN_COLOR }]}
                    onPress={() => setBusinessType(c.label)}
                  >
                    <Text style={[styles.typeChipText, isActive && { color: "#fff" }]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Shop Name</Text>
            <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="Storefront display name" />

            {(validationError || createError) && (
              <Text style={styles.errorText}>{validationError ?? createError}</Text>
            )}

            <Pressable
              style={[styles.saveBtn, { backgroundColor: ADMIN_COLOR }, loading && { opacity: 0.6 }]}
              disabled={loading}
              onPress={onSave}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create Vendor</Text>}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function AdminVendorsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useSelector((state: RootState) => state.vendors.vendors);
  const fetchStatus = useSelector((state: RootState) => state.vendors.fetchStatus);
  const fetchError = useSelector((state: RootState) => state.vendors.fetchError);
  const [tab, setTab] = useState<FilterTab>("All");
  const [showTaxonomy, setShowTaxonomy] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filtered = tab === "All" ? vendors : vendors.filter((v) => v.status === tab);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendor Management</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <Pressable style={[styles.createBtn, { backgroundColor: ADMIN_COLOR }]} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.createBtnText}>Create Vendor</Text>
          </Pressable>
          <Pressable onPress={() => setShowTaxonomy((s) => !s)} hitSlop={8}>
            <Ionicons name={showTaxonomy ? "chevron-up" : "pricetags-outline"} size={20} color={ADMIN_COLOR} />
          </Pressable>
        </View>
      </View>

      {showTaxonomy && (
        <View style={styles.taxonomyCard}>
          <Text style={styles.taxonomyTitle}>Categories (platform structure — reference only)</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.filter((c) => c.key !== "foryou").map((c) => (
              <View key={c.key} style={styles.chip}>
                <Text style={styles.chipText}>{c.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.taxonomyTitle, { marginTop: spacing.md }]}>Recognized Brands</Text>
          <View style={styles.chipWrap}>
            {TOP_BRANDS.map((b) => (
              <View key={b.name} style={styles.chip}>
                <Text style={styles.chipText}>{b.emoji} {b.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.tabRow}>
        {(["All", "pending", "approved", "suspended", "rejected"] as FilterTab[]).map((t) => {
          const isActive = t === tab;
          const label = t === "All" ? "All" : STATUS_META[t].label;
          return (
            <Pressable key={t} style={[styles.tab, isActive && { borderColor: ADMIN_COLOR, backgroundColor: "#f3ecfa" }]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, isActive && { color: ADMIN_COLOR, fontWeight: "800" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {fetchStatus === "loading" && vendors.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={ADMIN_COLOR} />
          <Text style={styles.emptyText}>Loading vendors…</Text>
        </View>
      ) : fetchStatus === "failed" && vendors.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="alert-circle-outline" size={40} color="#c0392b" />
          <Text style={styles.emptyText}>{fetchError ?? "Could not load vendors."}</Text>
          <Pressable style={[styles.createBtn, { backgroundColor: ADMIN_COLOR }]} onPress={() => dispatch(fetchVendors())}>
            <Text style={styles.createBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => <VendorCard vendor={item} />}
          onRefresh={() => dispatch(fetchVendors())}
          refreshing={fetchStatus === "loading"}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="storefront-outline" size={40} color="#bbb" />
              <Text style={styles.emptyText}>No vendors in this status.</Text>
            </View>
          }
        />
      )}

      <CreateVendorModal visible={createModalVisible} onClose={() => setCreateModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h2, fontSize: 18 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalTitle: { ...typography.h3 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.inkSoft, marginTop: spacing.md, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  errorText: { color: "#d32f2f", fontSize: 12, marginTop: spacing.md },
  typeChipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeChip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeChipText: { fontSize: 11.5, color: colors.ink, fontWeight: "600" },
  saveBtn: { paddingVertical: 13, borderRadius: radius.sm, alignItems: "center", marginTop: spacing.xl },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  taxonomyCard: { backgroundColor: colors.white, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  taxonomyTitle: { fontSize: 11, fontWeight: "800", color: colors.inkSoft, marginBottom: spacing.sm },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: colors.bg, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, color: colors.ink, fontWeight: "600" },
  tabRow: { flexDirection: "row", gap: spacing.xs, padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: "center", paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line },
  tabText: { fontSize: 10.5, color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  topRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.xs },
  businessName: { fontSize: 14, fontWeight: "800", color: colors.ink },
  owner: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "800" },
  email: { fontSize: 11.5, color: colors.ink, marginTop: 4 },
  joined: { fontSize: 10.5, color: colors.inkSoft, marginTop: 2, marginBottom: spacing.sm },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  rejectBtn: { backgroundColor: "#fdecea", borderWidth: 1, borderColor: "#c0392b" },
  suspendBtn: { backgroundColor: "#f2f2f2", borderWidth: 1, borderColor: "#7c7c7c" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  doneText: { fontSize: 12, color: colors.inkSoft, fontWeight: "600" },
  emptyWrap: { alignItems: "center", justifyContent: "center", gap: spacing.md, paddingTop: 60 },
  emptyText: { fontSize: 13, color: colors.inkSoft },
});