import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { approveProduct, rejectProduct, type VendorProduct } from "@/store/slices/vendorProductsSlice";
import ProductImage from "@/components/ProductImage";

const ADMIN_COLOR = "#6c2eb5";
type FilterTab = "pending" | "approved" | "rejected" | "All";

const STATUS_META: Record<VendorProduct["approvalStatus"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#e67e22" },
  approved: { label: "Approved", color: colors.green },
  rejected: { label: "Rejected", color: "#c0392b" },
};

export default function AdminProductsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.vendorProducts.products);
  const vendors = useSelector((state: RootState) => state.vendors.vendors);
  const [tab, setTab] = useState<FilterTab>("pending");

  const vendorName = (vendorId: string) => vendors.find((v) => v.id === vendorId)?.businessName ?? "Unknown Vendor";

  const filtered = useMemo(
    () => (tab === "All" ? products : products.filter((p) => p.approvalStatus === tab)),
    [products, tab]
  );

  const onReject = (p: VendorProduct) => {
    Alert.alert("Reject Product", `Reject "${p.title}"? The vendor will need to resubmit.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", style: "destructive", onPress: () => dispatch(rejectProduct(p.id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Approval</Text>
        <Text style={styles.headerSub}>
          {products.filter((p) => p.approvalStatus === "pending").length} pending
        </Text>
      </View>

      <View style={styles.tabRow}>
        {(["pending", "approved", "rejected", "All"] as FilterTab[]).map((t) => {
          const isActive = t === tab;
          const label = t === "All" ? "All" : STATUS_META[t].label;
          return (
            <Pressable key={t} style={[styles.tab, isActive && { borderColor: ADMIN_COLOR, backgroundColor: "#f3ecfa" }]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, isActive && { color: ADMIN_COLOR, fontWeight: "800" }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="cube-outline" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No products in this status.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = STATUS_META[item.approvalStatus];
          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <ProductImage uri={item.images[0]} emoji="📦" size={52} emojiSize={24} borderRadius={radius.sm} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.vendor}>by {vendorName(item.vendorId)}</Text>
                  <Text style={styles.price}>₹{item.price.toLocaleString("en-IN")}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: meta.color + "22" }]}>
                  <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              {item.approvalStatus === "pending" && (
                <View style={styles.actionsRow}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: ADMIN_COLOR }]} onPress={() => dispatch(approveProduct(item.id))}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(item)}>
                    <Ionicons name="close" size={14} color="#c0392b" />
                    <Text style={[styles.actionBtnText, { color: "#c0392b" }]}>Reject</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h2, fontSize: 18 },
  headerSub: { fontSize: 11.5, color: "#e67e22", marginTop: 2, fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: spacing.xs, padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: "center", paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line },
  tabText: { fontSize: 11, color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  topRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  title: { fontSize: 13.5, fontWeight: "700", color: colors.ink },
  vendor: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
  price: { fontSize: 12.5, fontWeight: "800", color: colors.ink, marginTop: 4 },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText: { fontSize: 9.5, fontWeight: "800" },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  rejectBtn: { backgroundColor: "#fdecea", borderWidth: 1, borderColor: "#c0392b" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  emptyWrap: { alignItems: "center", justifyContent: "center", gap: spacing.md, paddingTop: 60 },
  emptyText: { fontSize: 13, color: colors.inkSoft },
});
