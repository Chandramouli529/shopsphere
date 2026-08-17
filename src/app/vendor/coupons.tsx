import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addVendorCoupon,
  deleteVendorCoupon,
  toggleVendorCouponActive,
  type VendorCoupon,
  type VendorCouponType,
} from "@/store/slices/vendorCouponsSlice";

const VENDOR_COLOR = "#2c3e50";

const TYPE_META: Record<VendorCouponType, { label: string; icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap }> = {
  percentage: { label: "Percentage Discount", icon: "pricetag" },
  flat: { label: "Flat Discount", icon: "cash" },
  festival: { label: "Festival Offer", icon: "sparkles" },
  bogo: { label: "Buy One Get One", icon: "gift" },
};

function couponSummary(c: VendorCoupon): string {
  switch (c.type) {
    case "percentage":
      return `${c.value}% off, min order ₹${c.minOrder}`;
    case "flat":
      return `₹${c.value} off, min order ₹${c.minOrder}`;
    case "festival":
      return `${c.festivalName ?? "Festival"} — ${c.value}% off, min order ₹${c.minOrder}`;
    case "bogo":
      return `Buy 1 Get 1 Free, min order ₹${c.minOrder}`;
  }
}

function CreateCouponModal({
  visible,
  onClose,
  vendorId,
}: {
  visible: boolean;
  onClose: () => void;
  vendorId: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [code, setCode] = useState("");
  const [type, setType] = useState<VendorCouponType>("percentage");
  const [value, setValue] = useState("");
  const [festivalName, setFestivalName] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCode("");
    setType("percentage");
    setValue("");
    setFestivalName("");
    setMinOrder("");
    setError(null);
  };

  const onSave = () => {
    if (!code.trim()) {
      setError("Enter a coupon code");
      return;
    }
    if ((type === "percentage" || type === "flat" || type === "festival") && (!value || Number(value) <= 0)) {
      setError("Enter a valid discount value");
      return;
    }
    if (type === "festival" && !festivalName.trim()) {
      setError("Enter a festival/offer name");
      return;
    }
    dispatch(
      addVendorCoupon({
        vendorId,
        code: code.trim().toUpperCase(),
        type,
        value: type === "bogo" ? 0 : Number(value),
        festivalName: type === "festival" ? festivalName.trim() : undefined,
        minOrder: Number(minOrder) || 0,
        active: true,
      })
    );
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.modalTitle}>Create Coupon</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={{ padding: spacing.lg }}>
          <Text style={styles.fieldLabel}>Coupon Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholder="e.g. SUMMER20"
          />

          <Text style={styles.fieldLabel}>Coupon Type</Text>
          <View style={styles.typeGrid}>
            {(Object.keys(TYPE_META) as VendorCouponType[]).map((t) => {
              const isActive = t === type;
              return (
                <Pressable
                  key={t}
                  style={[styles.typeChip, isActive && { borderColor: VENDOR_COLOR, backgroundColor: "#eef1f3" }]}
                  onPress={() => setType(t)}
                >
                  <Ionicons name={TYPE_META[t].icon} size={14} color={isActive ? VENDOR_COLOR : "#888"} />
                  <Text style={[styles.typeChipText, isActive && { color: VENDOR_COLOR, fontWeight: "700" }]}>
                    {TYPE_META[t].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {type === "festival" && (
            <>
              <Text style={styles.fieldLabel}>Festival / Offer Name</Text>
              <TextInput
                style={styles.input}
                value={festivalName}
                onChangeText={setFestivalName}
                placeholder="e.g. Diwali Sale"
              />
            </>
          )}

          {type !== "bogo" && (
            <>
              <Text style={styles.fieldLabel}>{type === "flat" ? "Flat Amount (₹)" : "Discount (%)"}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={(v) => setValue(v.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                placeholder={type === "flat" ? "e.g. 100" : "e.g. 15"}
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Minimum Order Value (₹)</Text>
          <TextInput
            style={styles.input}
            value={minOrder}
            onChangeText={(v) => setMinOrder(v.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            placeholder="e.g. 500"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable style={[styles.saveBtn, { backgroundColor: VENDOR_COLOR }]} onPress={onSave}>
            <Text style={styles.saveBtnText}>Create Coupon</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function VendorCouponsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);
  const allCoupons = useSelector((state: RootState) => state.vendorCoupons.coupons);
  const [modalVisible, setModalVisible] = useState(false);

  const myCoupons = allCoupons.filter((c) => c.vendorId === vendor?.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coupons</Text>
        <Pressable style={[styles.createBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.createBtnText}>Create</Text>
        </Pressable>
      </View>

      {myCoupons.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="pricetag-outline" size={40} color="#bbb" />
          <Text style={styles.emptyText}>No coupons yet. Create one to attract buyers.</Text>
        </View>
      ) : (
        <FlatList
          data={myCoupons}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.codeRow}>
                  <Ionicons name={TYPE_META[item.type].icon} size={16} color={VENDOR_COLOR} />
                  <Text style={styles.code}>{item.code}</Text>
                </View>
                <Pressable onPress={() => dispatch(deleteVendorCoupon(item.id))} hitSlop={8}>
                  <Ionicons name="trash-outline" size={17} color="#c0392b" />
                </Pressable>
              </View>
              <Text style={styles.typeLabel}>{TYPE_META[item.type].label}</Text>
              <Text style={styles.summary}>{couponSummary(item)}</Text>
              <Pressable style={styles.activeRow} onPress={() => dispatch(toggleVendorCouponActive(item.id))}>
                <Ionicons name={item.active ? "toggle" : "toggle-outline"} size={22} color={item.active ? VENDOR_COLOR : "#bbb"} />
                <Text style={styles.activeText}>{item.active ? "Active" : "Inactive"}</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {vendor && <CreateCouponModal visible={modalVisible} onClose={() => setModalVisible(false)} vendorId={vendor.id} />}
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
  createBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyText: { fontSize: 13, color: colors.inkSoft, textAlign: "center" },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  code: { fontSize: 15, fontWeight: "800", color: colors.ink },
  typeLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 4, fontWeight: "700" },
  summary: { fontSize: 12.5, color: colors.ink, marginTop: 4 },
  activeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  activeText: { fontSize: 12, fontWeight: "600", color: colors.inkSoft },
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
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  typeChipText: { fontSize: 11.5, color: colors.ink },
  errorText: { color: "#d32f2f", fontSize: 12, marginTop: spacing.md },
  saveBtn: { paddingVertical: 13, borderRadius: radius.sm, alignItems: "center", marginTop: spacing.xl },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
