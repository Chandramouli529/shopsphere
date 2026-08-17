import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import type { Order } from "@/store/slices/ordersSlice";
import { setVendorOrderStatus, type VendorOrderStatus } from "@/store/slices/vendorOrderStatusSlice";
import ProductImage from "@/components/ProductImage";

const VENDOR_COLOR = "#2c3e50";

const STATUS_META: Record<VendorOrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#e67e22" },
  accepted: { label: "Accepted", color: "#2874f0" },
  rejected: { label: "Rejected", color: "#c0392b" },
  packed: { label: "Packed", color: "#8e44ad" },
  shipped: { label: "Shipped", color: "#16a085" },
  delivered: { label: "Delivered", color: colors.green },
};

function OrderRow({ order }: { order: Order }) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(
    (state: RootState) => state.vendorOrderStatus.statusByOrderId[order.id] ?? "pending"
  );
  const meta = STATUS_META[status];

  const setStatus = (s: VendorOrderStatus) => dispatch(setVendorOrderStatus({ orderId: order.id, status: s }));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: meta.color + "22" }]}>
          <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.itemsRow}>
        {order.items.slice(0, 4).map((it) => (
          <View key={it.id} style={{ marginRight: 6 }}>
            <ProductImage uri={it.image} emoji={it.emoji} size={36} emojiSize={18} borderRadius={6} />
          </View>
        ))}
      </View>
      <Text style={styles.itemsSummary} numberOfLines={1}>
        {order.items.map((it) => `${it.title} x${it.qty}`).join(", ")}
      </Text>
      <Text style={styles.orderTotal}>₹{order.grandTotal.toLocaleString("en-IN")}</Text>

      <View style={styles.actionsRow}>
        {status === "pending" && (
          <>
            <Pressable style={[styles.actionBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => setStatus("accepted")}>
              <Ionicons name="checkmark" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={() => setStatus("rejected")}>
              <Ionicons name="close" size={14} color="#c0392b" />
              <Text style={[styles.actionBtnText, { color: "#c0392b" }]}>Reject</Text>
            </Pressable>
          </>
        )}
        {status === "accepted" && (
          <Pressable style={[styles.actionBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => setStatus("packed")}>
            <Ionicons name="cube" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>Mark Packed</Text>
          </Pressable>
        )}
        {status === "packed" && (
          <Pressable style={[styles.actionBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => setStatus("shipped")}>
            <Ionicons name="airplane" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>Mark Shipped</Text>
          </Pressable>
        )}
        {status === "shipped" && (
          <Pressable style={[styles.actionBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => setStatus("delivered")}>
            <Ionicons name="home" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>Mark Delivered</Text>
          </Pressable>
        )}
        {(status === "delivered" || status === "rejected") && (
          <Text style={styles.doneText}>
            {status === "delivered" ? "Order fulfilled \u2713" : "Order rejected"}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function VendorOrdersScreen() {
  const orders = useSelector((state: RootState) => state.orders.list);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSub}>{orders.length} total</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="receipt-outline" size={40} color="#bbb" />
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => <OrderRow order={item} />}
          ListHeaderComponent={
            <View style={styles.demoNote}>
              <Ionicons name="information-circle-outline" size={14} color={colors.inkSoft} />
              <Text style={styles.demoNoteText}>
                Demo: showing all platform orders — real vendor-item linkage isn't modeled in this catalogue yet.
              </Text>
            </View>
          }
        />
      )}
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
  headerSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  demoNote: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#fff8e1",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  demoNoteText: { flex: 1, fontSize: 10.5, color: colors.inkSoft, lineHeight: 14 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  orderId: { fontSize: 13, fontWeight: "800", color: colors.ink },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText: { fontSize: 10.5, fontWeight: "800" },
  itemsRow: { flexDirection: "row", marginBottom: spacing.sm },
  itemsSummary: { fontSize: 11.5, color: colors.inkSoft, marginBottom: 4 },
  orderTotal: { fontSize: 14, fontWeight: "800", color: colors.ink, marginBottom: spacing.sm },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  rejectBtn: { backgroundColor: "#fdecea", borderWidth: 1, borderColor: "#c0392b" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  doneText: { fontSize: 12, color: colors.inkSoft, fontWeight: "600" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyText: { fontSize: 13, color: colors.inkSoft },
});
