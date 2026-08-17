import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { RootState } from "@/store/store";
import type { Order, OrderStatus } from "@/store/slices/ordersSlice";
import ProductImage from "@/components/ProductImage";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap }[] = [
  { key: "placed", label: "Order Placed", icon: "checkmark-circle" },
  { key: "shipped", label: "Shipped", icon: "cube" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

function buildInvoiceText(order: Order): string {
  const lines: string[] = [];
  lines.push("SHOPSPHERE — TAX INVOICE");
  lines.push("========================");
  lines.push(`Order ID: ${order.id}`);
  lines.push(
    `Date: ${new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
  );
  lines.push(`Status: ${order.status.toUpperCase()}`);
  lines.push(`Payment Method: ${order.paymentMethod}`);
  lines.push("");
  lines.push("Ship To:");
  lines.push(`${order.address.name} (${order.address.phone})`);
  lines.push(`${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`);
  lines.push("");
  lines.push("Items:");
  lines.push("------------------------");
  order.items.forEach((item) => {
    lines.push(`${item.title}`);
    lines.push(`  Qty: ${item.qty}  x  ₹${item.price.toLocaleString("en-IN")}  =  ₹${(item.price * item.qty).toLocaleString("en-IN")}`);
  });
  lines.push("------------------------");
  lines.push(`Subtotal: ₹${order.itemsTotal.toLocaleString("en-IN")}`);
  if (order.couponDiscount) {
    lines.push(`Coupon (${order.couponCode}): − ₹${order.couponDiscount.toLocaleString("en-IN")}`);
  }
  lines.push(order.deliveryCharge === 0 ? "Delivery: FREE" : `Delivery: ₹${order.deliveryCharge}`);
  lines.push(`Total Paid: ₹${order.grandTotal.toLocaleString("en-IN")}`);
  lines.push("");
  lines.push("Thank you for shopping with ShopSphere!");
  return lines.join("\n");
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const order = useSelector((state: RootState) => state.orders.list.find((o) => o.id === id));

  const invoiceText = useMemo(() => (order ? buildInvoiceText(order) : ""), [order]);
  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;

  const onDownloadInvoice = async () => {
    try {
      await Share.share({
        title: `Invoice ${order?.id}`,
        message: invoiceText,
      });
    } catch {
      Alert.alert("Couldn't share invoice", "Please try again.");
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.notFoundWrap} edges={["top"]}>
        <Ionicons name="receipt-outline" size={40} color="#bbb" />
        <Text style={styles.notFoundText}>Order not found.</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        <View style={styles.orderIdRow}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        </View>

        {/* Status timeline */}
        <View style={styles.timelineCard}>
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStepIndex;
            return (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineIconCol}>
                  <View style={[styles.timelineDot, done && { backgroundColor: theme.primary }]}>
                    <Ionicons name={step.icon} size={14} color={done ? "#fff" : "#bbb"} />
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, done && idx < currentStepIndex && { backgroundColor: theme.primary }]} />
                  )}
                </View>
                <Text style={[styles.timelineLabel, done && { color: colors.ink, fontWeight: "700" }]}>{step.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Items */}
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        <View style={styles.itemsCard}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <ProductImage uri={item.image} emoji={item.emoji} size={48} emojiSize={22} borderRadius={radius.sm} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.itemQty}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{(item.price * item.qty).toLocaleString("en-IN")}</Text>
            </View>
          ))}
        </View>

        {/* Delivery address */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.infoCard}>
          <Text style={styles.addrName}>
            {order.address.name} <Text style={styles.addrPhone}>· {order.address.phone}</Text>
          </Text>
          <Text style={styles.addrLine}>
            {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
          </Text>
        </View>

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.infoCard}>
          <Text style={styles.paymentText}>{order.paymentMethod}</Text>
        </View>

        {/* Price details */}
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{order.itemsTotal.toLocaleString("en-IN")}</Text>
          </View>
          {!!order.couponDiscount && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Coupon ({order.couponCode})</Text>
              <Text style={styles.priceDiscount}>− ₹{order.couponDiscount.toLocaleString("en-IN")}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery</Text>
            {order.deliveryCharge === 0 ? (
              <Text style={styles.priceFree}>FREE</Text>
            ) : (
              <Text style={styles.priceValue}>₹{order.deliveryCharge}</Text>
            )}
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total Paid</Text>
            <Text style={styles.priceTotalValue}>₹{order.grandTotal.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.invoiceBtn, { borderColor: theme.primary }]} onPress={onDownloadInvoice}>
          <Ionicons name="download-outline" size={17} color={theme.primary} />
          <Text style={[styles.invoiceBtnText, { color: theme.primary }]}>Download Invoice</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: "center" },
  orderIdRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  orderId: { fontSize: 16, fontWeight: "800", color: colors.ink },
  orderDate: { fontSize: 12, color: colors.inkSoft },
  timelineCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  timelineStep: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  timelineIconCol: { alignItems: "center" },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: { width: 2, height: 28, backgroundColor: "#ddd" },
  timelineLabel: { fontSize: 13, color: colors.inkSoft, marginTop: 5, marginBottom: 5 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.inkSoft, marginBottom: spacing.sm, marginTop: spacing.sm },
  itemsCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  itemTitle: { fontSize: 13, fontWeight: "600", color: colors.ink },
  itemQty: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: colors.ink },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  addrName: { fontSize: 13.5, fontWeight: "700", color: colors.ink },
  addrPhone: { fontWeight: "400", color: colors.inkSoft },
  addrLine: { fontSize: 12.5, color: colors.inkSoft, marginTop: 4, lineHeight: 18 },
  paymentText: { fontSize: 13.5, color: colors.ink, fontWeight: "600" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  priceLabel: { fontSize: 13, color: colors.ink },
  priceValue: { fontSize: 13, color: colors.ink, fontWeight: "600" },
  priceDiscount: { fontSize: 13, color: colors.green, fontWeight: "700" },
  priceFree: { fontSize: 13, color: colors.green, fontWeight: "700" },
  priceDivider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.sm },
  priceTotalLabel: { fontSize: 14, fontWeight: "800", color: colors.ink },
  priceTotalValue: { fontSize: 14, fontWeight: "800", color: colors.ink },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingVertical: 13,
  },
  invoiceBtnText: { fontWeight: "700", fontSize: 14 },
  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.white },
  notFoundText: { fontSize: 14, color: colors.inkSoft },
  backBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: radius.sm },
  backBtnText: { color: "#fff", fontWeight: "700" },
});
