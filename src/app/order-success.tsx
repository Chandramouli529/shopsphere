import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { RootState } from "@/store/store";

function formatEta(placedAt: number) {
  const eta = new Date(placedAt + 4 * 24 * 60 * 60 * 1000);
  return eta.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const order = useSelector((state: RootState) => state.orders.list.find((o) => o.id === orderId));

  const eta = useMemo(() => (order ? formatEta(order.placedAt) : ""), [order]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color={colors.green} />
      </View>
      <Text style={styles.title}>Order Placed Successfully!</Text>
      <Text style={styles.sub}>Thank you for shopping with ShopSphere</Text>

      {order && (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order ID</Text>
            <Text style={styles.cardValue}>{order.id}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Amount Paid</Text>
            <Text style={styles.cardValue}>₹{order.grandTotal.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Payment Method</Text>
            <Text style={styles.cardValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Arriving By</Text>
            <Text style={styles.cardValue}>{eta}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.deliverTo}>Deliver to</Text>
          <Text style={styles.addressText}>
            {order.address.name}, {order.address.line1}, {order.address.city}, {order.address.state} -{" "}
            {order.address.pincode}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.primaryBtnText}>Continue Shopping</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: theme.primary }]}
          onPress={() => router.replace("/settings/orders")}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>View Order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: "center", padding: spacing.xl },
  iconWrap: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  title: { ...typography.h1, textAlign: "center" },
  sub: { fontSize: 13, color: colors.inkSoft, marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  cardLabel: { fontSize: 12.5, color: colors.inkSoft },
  cardValue: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
  deliverTo: { fontSize: 12, fontWeight: "700", color: colors.inkSoft, marginBottom: 4 },
  addressText: { fontSize: 12.5, color: colors.ink, lineHeight: 18 },
  actions: { width: "100%", marginTop: "auto", gap: spacing.md },
  primaryBtn: { backgroundColor: colors.blue, paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: colors.blue,
    paddingVertical: 13,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  secondaryBtnText: { color: colors.blue, fontWeight: "700", fontSize: 15 },
});
