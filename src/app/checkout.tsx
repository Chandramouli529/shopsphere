import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { clearCart } from "@/store/slices/cartSlice";
import { placeOrder } from "@/store/slices/ordersSlice";
import { findCoupon, evaluateCoupon } from "@/data/coupons";

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

const UPI_APPS = [
  { key: "gpay", label: "Google Pay", icon: "logo-google" as const },
  { key: "phonepe", label: "PhonePe", icon: "phone-portrait" as const },
  { key: "paytm", label: "Paytm", icon: "wallet" as const },
  { key: "bhim", label: "BHIM UPI", icon: "flash" as const },
];

function RadioRow({
  selected,
  onPress,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      style={[styles.radioRow, selected && { borderColor: theme.primary, backgroundColor: "#f3f8ff" }]}
      onPress={onPress}
    >
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={selected ? theme.primary : "#bbb"}
      />
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const appliedCouponCode = useSelector((state: RootState) => state.cart.appliedCouponCode);
  const addresses = useSelector((state: RootState) => state.settings.addresses);
  const savedCards = useSelector((state: RootState) => state.settings.cards);
  const theme = useAppTheme();

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<string>(""); // e.g. "upi:gpay", "upi:custom", "card:<id>", "cod"
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);

  const itemsTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = itemsTotal >= FREE_DELIVERY_THRESHOLD || itemsTotal === 0 ? 0 : DELIVERY_CHARGE;
  const appliedCoupon = appliedCouponCode ? findCoupon(appliedCouponCode) ?? null : null;
  let couponDiscount = 0;
  if (appliedCoupon) {
    const result = evaluateCoupon(appliedCoupon, itemsTotal);
    if ("discount" in result) couponDiscount = result.discount;
  }
  const grandTotal = itemsTotal + deliveryCharge - couponDiscount;

  const upiCustomValid = /^[\w.-]+@[\w.-]+$/.test(upiId);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const paymentLabel = (): string => {
    if (paymentMethod === "cod") return "Cash on Delivery";
    if (paymentMethod === "upi:custom") return `UPI · ${upiId}`;
    if (paymentMethod.startsWith("upi:")) {
      const app = UPI_APPS.find((a) => a.key === paymentMethod.replace("upi:", ""));
      return `UPI · ${app?.label ?? "UPI App"}`;
    }
    if (paymentMethod.startsWith("card:")) {
      const card = savedCards.find((c) => c.id === paymentMethod.replace("card:", ""));
      return card ? `Card · •••• ${card.last4}` : "Card";
    }
    return "";
  };

  const canPlaceOrder =
    !!selectedAddress &&
    cartItems.length > 0 &&
    (paymentMethod === "cod" ||
      (paymentMethod === "upi:custom" && upiCustomValid) ||
      (paymentMethod.startsWith("upi:") && paymentMethod !== "upi:custom") ||
      paymentMethod.startsWith("card:"));

  const onPlaceOrder = () => {
    if (!canPlaceOrder || !selectedAddress) return;
    setPlacing(true);
    const action = dispatch(
      placeOrder({
        items: cartItems.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          qty: i.qty,
          emoji: i.emoji,
          image: i.image,
        })),
        itemsTotal,
        couponCode: appliedCoupon?.code,
        couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
        deliveryCharge,
        grandTotal,
        address: selectedAddress,
        paymentMethod: paymentLabel(),
      })
    );
    dispatch(clearCart());
    router.replace(`/order-success?orderId=${action.payload.id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}>
        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
        {addresses.length === 0 ? (
          <Pressable
            style={[styles.addAddressPrompt, { borderColor: theme.primary }]}
            onPress={() => router.push("/settings/address")}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.addAddressText, { color: theme.primary }]}>
              Add a delivery address to continue
            </Text>
          </Pressable>
        ) : (
          <>
            {addresses.map((addr) => (
              <RadioRow
                key={addr.id}
                selected={selectedAddressId === addr.id}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <Text style={styles.addrName}>
                  {addr.name} <Text style={styles.addrPhone}>· {addr.phone}</Text>
                </Text>
                <Text style={styles.addrLine}>
                  {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                </Text>
              </RadioRow>
            ))}
            <Pressable style={styles.addAnotherRow} onPress={() => router.push("/settings/address")}>
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addAnotherText, { color: theme.primary }]}>Add New Address</Text>
            </Pressable>
          </>
        )}

        {/* Payment Method */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>PAYMENT METHOD</Text>

        <Text style={styles.groupLabel}>UPI</Text>
        {UPI_APPS.map((app) => (
          <RadioRow
            key={app.key}
            selected={paymentMethod === `upi:${app.key}`}
            onPress={() => setPaymentMethod(`upi:${app.key}`)}
          >
            <View style={styles.appRow}>
              <Ionicons name={app.icon} size={18} color={colors.ink} />
              <Text style={styles.appLabel}>{app.label}</Text>
            </View>
          </RadioRow>
        ))}
        <RadioRow selected={paymentMethod === "upi:custom"} onPress={() => setPaymentMethod("upi:custom")}>
          <Text style={styles.appLabel}>Enter UPI ID</Text>
          {paymentMethod === "upi:custom" && (
            <TextInput
              style={styles.upiInput}
              placeholder="yourname@bank"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          )}
        </RadioRow>

        {savedCards.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Cards</Text>
            {savedCards.map((card) => (
              <RadioRow
                key={card.id}
                selected={paymentMethod === `card:${card.id}`}
                onPress={() => setPaymentMethod(`card:${card.id}`)}
              >
                <Text style={styles.appLabel}>•••• •••• •••• {card.last4}</Text>
                <Text style={styles.addrLine}>
                  {card.holderName} · Expires {card.expiry}
                </Text>
              </RadioRow>
            ))}
          </>
        )}
        <Pressable style={styles.addAnotherRow} onPress={() => router.push("/settings/cards")}>
          <Ionicons name="add" size={16} color={theme.primary} />
          <Text style={[styles.addAnotherText, { color: theme.primary }]}>Add New Card</Text>
        </Pressable>

        <Text style={styles.groupLabel}>Other</Text>
        <RadioRow selected={paymentMethod === "cod"} onPress={() => setPaymentMethod("cod")}>
          <View style={styles.appRow}>
            <Ionicons name="cash-outline" size={18} color={colors.ink} />
            <Text style={styles.appLabel}>Cash on Delivery</Text>
          </View>
        </RadioRow>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
        </View>
        <Pressable
          style={[styles.payBtn, !canPlaceOrder && styles.btnDisabled]}
          disabled={!canPlaceOrder || placing}
          onPress={onPlaceOrder}
        >
          <Text style={styles.payBtnText}>
            {paymentMethod === "cod" ? "Place Order" : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
          </Text>
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
  sectionTitle: { fontSize: 12, fontWeight: "700", color: colors.inkSoft, letterSpacing: 0.5, marginBottom: spacing.md },
  groupLabel: { fontSize: 12, fontWeight: "700", color: colors.ink, marginTop: spacing.md, marginBottom: spacing.xs },
  addAddressPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.blue,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  addAddressText: { color: colors.blue, fontWeight: "600", fontSize: 13, flexShrink: 1 },
  radioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  radioRowActive: { borderColor: colors.blue, backgroundColor: "#f3f8ff" },
  addrName: { fontWeight: "700", fontSize: 14, color: colors.ink },
  addrPhone: { fontWeight: "400", color: colors.inkSoft },
  addrLine: { fontSize: 12.5, color: colors.inkSoft, marginTop: 4, lineHeight: 18 },
  addAnotherRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: spacing.sm },
  addAnotherText: { color: colors.blue, fontWeight: "700", fontSize: 13 },
  appRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  appLabel: { fontSize: 14, fontWeight: "600", color: colors.ink },
  upiInput: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  totalLabel: { fontSize: 11, color: colors.inkSoft },
  totalValue: { fontSize: 18, fontWeight: "800" },
  payBtn: { backgroundColor: colors.green, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.sm },
  btnDisabled: { opacity: 0.5 },
  payBtnText: { color: "#fff", fontWeight: "700" },
});
