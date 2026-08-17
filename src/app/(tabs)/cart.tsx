import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { decrementQty, incrementQty, removeItem, applyCoupon, removeCoupon, type CartItem } from "@/store/slices/cartSlice";
import ProductImage from "@/components/ProductImage";
import { findCoupon, evaluateCoupon } from "@/data/coupons";

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

export default function CartScreen() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const theme = useAppTheme();
  const appliedCouponCode = useSelector((state: RootState) => state.cart.appliedCouponCode);
  const appliedCoupon = appliedCouponCode ? findCoupon(appliedCouponCode) ?? null : null;

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = itemsTotal >= FREE_DELIVERY_THRESHOLD || itemsTotal === 0 ? 0 : DELIVERY_CHARGE;

  let couponDiscount = 0;
  if (appliedCoupon) {
    const result = evaluateCoupon(appliedCoupon, itemsTotal);
    if ("discount" in result) couponDiscount = result.discount;
  }
  const grandTotal = itemsTotal + deliveryCharge - couponDiscount;

  const onApplyCoupon = () => {
    setCouponError(null);
    const coupon = findCoupon(couponInput);
    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }
    const result = evaluateCoupon(coupon, itemsTotal);
    if ("error" in result) {
      setCouponError(result.error);
      return;
    }
    dispatch(applyCoupon(coupon.code));
    setCouponInput("");
  };

  const onRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyWrap} edges={["top"]}>
        <Ionicons name="cart-outline" size={48} color="#bbb" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Pressable style={[styles.shopBtn, { backgroundColor: theme.primary }]} onPress={() => router.push("/(tabs)/home")}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.row}>
      <View style={styles.thumbWrap}>
        <ProductImage uri={item.image} emoji={item.emoji} size={64} emojiSize={26} borderRadius={radius.md} />
        {/* Quantity badge — makes it obvious this is ONE product line whose
            count went up, not several rows for the same item. */}
        {item.qty > 1 && (
          <View style={[styles.qtyBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.qtyBadgeText}>×{item.qty}</Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceLine}>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>
            ₹{item.price.toLocaleString("en-IN")}
          </Text>
          {item.qty > 1 && (
            <Text style={styles.itemSubtotal}>
              {" "}
              · ₹{(item.price * item.qty).toLocaleString("en-IN")} total
            </Text>
          )}
        </View>

        <View style={styles.qtyRow}>
          <Pressable
            style={[styles.qtyBtn, { borderColor: theme.primary }]}
            onPress={() => dispatch(decrementQty(item.id))}
          >
            <Ionicons name="remove" size={14} color={theme.primary} />
          </Pressable>
          <Text style={styles.qtyText}>{item.qty}</Text>
          <Pressable
            style={[styles.qtyBtn, { borderColor: theme.primary }]}
            onPress={() => dispatch(incrementQty(item.id))}
          >
            <Ionicons name="add" size={14} color={theme.primary} />
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => dispatch(removeItem(item.id))} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color="#c0392b" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <Text style={styles.header}>My Cart ({items.length})</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
        ListFooterComponent={
          <>
            <View style={styles.couponCard}>
              <View style={styles.couponHeaderRow}>
                <Ionicons name="pricetag-outline" size={16} color={theme.primary} />
                <Text style={styles.couponHeaderText}>Apply Coupon</Text>
              </View>
              {appliedCoupon ? (
                <View style={styles.appliedCouponRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.appliedCouponCode, { color: theme.primary }]}>{appliedCoupon.code}</Text>
                    <Text style={styles.appliedCouponDesc}>{appliedCoupon.description}</Text>
                  </View>
                  <Pressable onPress={onRemoveCoupon} hitSlop={8}>
                    <Text style={styles.removeCouponText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.couponInputRow}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChangeText={(v) => {
                        setCouponInput(v);
                        setCouponError(null);
                      }}
                      autoCapitalize="characters"
                    />
                    <Pressable
                      style={[styles.applyBtn, { backgroundColor: theme.primary }, !couponInput && styles.applyBtnDisabled]}
                      disabled={!couponInput}
                      onPress={onApplyCoupon}
                    >
                      <Text style={styles.applyBtnText}>Apply</Text>
                    </Pressable>
                  </View>
                  {couponError && <Text style={styles.couponErrorText}>{couponError}</Text>}
                </>
              )}
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.priceCardTitle}>PRICE DETAILS</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price ({items.length} item{items.length > 1 ? "s" : ""})</Text>
                <Text style={styles.priceValue}>₹{itemsTotal.toLocaleString("en-IN")}</Text>
              </View>
              {couponDiscount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Coupon Discount</Text>
                  <Text style={styles.priceDiscount}>− ₹{couponDiscount.toLocaleString("en-IN")}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Charges</Text>
                {deliveryCharge === 0 ? (
                  <Text style={styles.priceFree}>FREE</Text>
                ) : (
                  <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
                )}
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceTotalLabel}>Total Amount</Text>
                <Text style={styles.priceTotalValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
              </View>
              {deliveryCharge > 0 && (
                <Text style={styles.freeDeliveryHint}>
                  Add items worth ₹{(FREE_DELIVERY_THRESHOLD - itemsTotal).toLocaleString("en-IN")} more for FREE delivery
                </Text>
              )}
              {couponDiscount > 0 && (
                <Text style={styles.savingsHint}>
                  You saved ₹{couponDiscount.toLocaleString("en-IN")} with {appliedCoupon?.code}
                </Text>
              )}
            </View>
          </>
        }
      />

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{grandTotal.toLocaleString("en-IN")}</Text>
        </View>
        <Pressable style={styles.checkoutBtn} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutText}>Place Order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { ...typography.h2, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  thumbWrap: { position: "relative" },
  qtyBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  qtyBadgeText: { color: "#fff", fontSize: 10.5, fontWeight: "800" },
  itemTitle: { fontWeight: "700", fontSize: 14 },
  priceLine: { flexDirection: "row", alignItems: "baseline", marginTop: 2, flexWrap: "wrap" },
  itemPrice: { fontWeight: "700", fontSize: 13 },
  itemSubtotal: { fontSize: 11.5, color: colors.inkSoft },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontWeight: "700", fontSize: 13, minWidth: 16, textAlign: "center" },
  priceCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  couponCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  couponHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.md },
  couponHeaderText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  couponInputRow: { flexDirection: "row", gap: spacing.sm },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.ink,
  },
  applyBtn: { paddingHorizontal: spacing.lg, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  applyBtnDisabled: { opacity: 0.4 },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  couponErrorText: { color: "#d32f2f", fontSize: 11.5, marginTop: spacing.sm },
  appliedCouponRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f4ea",
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  appliedCouponCode: { fontWeight: "800", fontSize: 13 },
  appliedCouponDesc: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  removeCouponText: { fontSize: 12, fontWeight: "700", color: "#c0392b" },
  priceDiscount: { fontSize: 13, color: colors.green, fontWeight: "700" },
  savingsHint: { fontSize: 11.5, color: colors.green, marginTop: spacing.sm, fontWeight: "600" },
  priceCardTitle: { fontSize: 12, fontWeight: "700", color: colors.inkSoft, letterSpacing: 0.5, marginBottom: spacing.md },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  priceLabel: { fontSize: 13, color: colors.ink },
  priceValue: { fontSize: 13, color: colors.ink, fontWeight: "600" },
  priceFree: { fontSize: 13, color: colors.green, fontWeight: "700" },
  priceDivider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.sm },
  priceTotalLabel: { fontSize: 14, fontWeight: "800", color: colors.ink },
  priceTotalValue: { fontSize: 14, fontWeight: "800", color: colors.ink },
  freeDeliveryHint: { fontSize: 11.5, color: colors.green, marginTop: spacing.sm },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: { fontSize: 11, color: colors.inkSoft },
  totalValue: { fontSize: 18, fontWeight: "800" },
  checkoutBtn: { backgroundColor: colors.green, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.sm },
  checkoutText: { color: "#fff", fontWeight: "700" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.white },
  emptyTitle: { ...typography.h3, color: "#888" },
  shopBtn: {
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radius.sm,
  },
  shopBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
