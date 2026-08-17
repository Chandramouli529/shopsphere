import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { CATEGORIES } from "@/data/categories";
import { findProductById } from "@/data/products";
import { FLASH_SALE_ITEMS } from "@/data/flashSale";
import { parsePrice } from "@/utils/price";
import { deriveRating, deriveConditionRatings, ratingLabel } from "@/utils/rating";
import { deriveHighlights, deriveSpecifications, deriveWarrantyText, deriveManufacturerInfo } from "@/utils/productDetails";
import { addItem, setPendingItem } from "@/store/slices/cartSlice";
import ProductGallery from "@/components/ProductGallery";
import RatingBreakdown from "@/components/RatingBreakdown";
import ProductHighlights from "@/components/ProductHighlights";
import ProductAllDetails from "@/components/ProductAllDetails";
import {
  addWishlistItem,
  removeWishlistItem,
  setPendingWishlistItem,
} from "@/store/slices/wishlistSlice";

function Toast({ message }: { message: string | null }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [message, opacity]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Ionicons name="checkmark-circle" size={16} color="#fff" />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();

  const found = useMemo(() => findProductById(id ?? ""), [id]);
  const flashSaleInfo = useMemo(() => FLASH_SALE_ITEMS.find((f) => f.id === id), [id]);
  const conditionRatings = useMemo(
    () => deriveConditionRatings(id ?? "", found?.categoryKey ?? ""),
    [id, found]
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const cartQty = useSelector((state: RootState) =>
    id ? state.cart.items.find((i) => i.id === id)?.qty ?? 0 : 0
  );
  const isWishlisted = useSelector((state: RootState) =>
    id ? state.wishlist.items.some((i) => i.id === id) : false
  );
  const addresses = useSelector((state: RootState) => state.settings.addresses);
  const defaultAddress = addresses[0];

  if (!found) {
    return (
      <SafeAreaView style={styles.notFoundWrap} edges={["top"]}>
        <Ionicons name="alert-circle-outline" size={44} color="#bbb" />
        <Text style={styles.notFoundText}>Product not found</Text>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const { product, categoryKey } = found;
  const categoryLabel = CATEGORIES.find((c) => c.key === categoryKey)?.label ?? "";
  const { rating, reviewCount } = deriveRating(product.id);
  const priceNum = parsePrice(product.price);
  const description = `${product.title} is one of our best-rated picks in ${categoryLabel}. Crafted for everyday reliability with quality materials, it's backed by ShopSphere's easy 7-day return policy and fast delivery.`;
  const highlights = deriveHighlights(categoryKey, product.id);
  const specGroups = deriveSpecifications(categoryKey, product.id);
  const warrantyText = deriveWarrantyText(categoryKey);
  const manufacturerInfo = deriveManufacturerInfo();

  const cartItemPayload = {
    id: product.id,
    title: product.title,
    price: priceNum,
    qty: 1,
    emoji: product.emoji,
    image: product.image,
  };
  const wishlistItemPayload = {
    id: product.id,
    title: product.title,
    price: priceNum,
    emoji: product.emoji,
    image: product.image,
  };

  const onAddToCart = () => {
    if (isLoggedIn) {
      dispatch(addItem(cartItemPayload));
      setToastMsg("Added to cart");
    } else {
      dispatch(setPendingItem(cartItemPayload));
      router.push("/(auth)/login");
    }
  };

  const onToggleWishlist = () => {
    if (!isLoggedIn) {
      dispatch(setPendingWishlistItem(wishlistItemPayload));
      router.push("/(auth)/login");
      return;
    }
    if (isWishlisted) {
      dispatch(removeWishlistItem(product.id));
      setToastMsg("Removed from wishlist");
    } else {
      dispatch(addWishlistItem(wishlistItemPayload));
      setToastMsg("Added to wishlist");
    }
  };

  const fullStars = Math.round(rating);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryLabel}
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/cart")} hitSlop={10}>
          <Ionicons name="cart-outline" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.imageWrap}>
          <ProductGallery images={product.images} emoji={product.emoji} />
          <Pressable style={styles.wishBtn} onPress={onToggleWishlist} hitSlop={8}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? colors.danger : colors.ink}
            />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingPillText}>{rating.toFixed(1)}</Text>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
            <View style={{ flexDirection: "row" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons
                  key={n}
                  name={n <= fullStars ? "star" : "star-outline"}
                  size={14}
                  color="#f5a623"
                  style={{ marginRight: 1 }}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>{reviewCount} ratings</Text>
            {flashSaleInfo && (
              <View style={styles.saleBadge}>
                <Ionicons name="flash" size={11} color="#fff" />
                <Text style={styles.saleBadgeText}>{flashSaleInfo.discountPercent}% OFF</Text>
              </View>
            )}
          </View>

          {flashSaleInfo && (
            <Text style={styles.originalPriceLarge}>{flashSaleInfo.originalPrice}</Text>
          )}
          <Text style={styles.price}>{product.price}</Text>
          {flashSaleInfo && (
            <View style={styles.saleRow}>
              <Ionicons name="time-outline" size={13} color={colors.danger} />
              <Text style={styles.saleRowText}>Flash Sale price — grab it before the timer runs out</Text>
            </View>
          )}
          {cartQty > 0 && <Text style={styles.inCartHint}>{cartQty} in your cart</Text>}

          {/* Delivery address — reflects whatever the user has saved under
              Account > Address Book. */}
          <View style={styles.addressCard}>
            <Ionicons name="location" size={16} color={colors.ink} />
            <View style={{ flex: 1 }}>
              {defaultAddress ? (
                <>
                  <Text style={styles.addressLabel}>
                    Deliver to {defaultAddress.name} · {defaultAddress.pincode}
                  </Text>
                  <Text style={styles.addressLine} numberOfLines={1}>
                    {defaultAddress.line1}, {defaultAddress.city}, {defaultAddress.state}
                  </Text>
                </>
              ) : (
                <Text style={styles.addressLabel}>No delivery address added yet</Text>
              )}
            </View>
            <Pressable onPress={() => router.push("/settings/address")} hitSlop={8}>
              <Text style={[styles.addressChange, { color: theme.primary }]}>{defaultAddress ? "Change" : "Add"}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Highlights</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={{ height: spacing.md }} />
          <ProductHighlights highlights={highlights} />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>All Details</Text>
          <ProductAllDetails
            highlights={highlights}
            specGroups={specGroups}
            warrantyText={warrantyText}
            manufacturerInfo={manufacturerInfo}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ratings &amp; Reviews</Text>
          <View style={styles.reviewSummaryRow}>
            <Text style={styles.reviewBigNumber}>{rating.toFixed(1)}</Text>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flexDirection: "row" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= fullStars ? "star" : "star-outline"}
                      size={16}
                      color="#f5a623"
                      style={{ marginRight: 1 }}
                    />
                  ))}
                </View>
                <View style={styles.qualBadge}>
                  <Text style={styles.qualBadgeText}>{ratingLabel(rating)}</Text>
                </View>
              </View>
              <Text style={styles.reviewCount}>based on {reviewCount} verified ratings</Text>
            </View>
          </View>

          <Text style={styles.breakdownTitle}>Rated by customers for</Text>
          <RatingBreakdown conditions={conditionRatings} />
          <View style={[styles.divider, { marginVertical: spacing.lg }]} />

          {[
            { name: "Anita R.", text: "Exactly as described, fast delivery. Would buy again.", stars: 5 },
            { name: "Rahul K.", text: "Good quality for the price. Packaging could be better.", stars: 4 },
          ].map((r) => (
            <View key={r.name} style={styles.reviewItem}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.reviewerName}>{r.name}</Text>
                <View style={{ flexDirection: "row" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= r.stars ? "star" : "star-outline"}
                      size={11}
                      color="#f5a623"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}

          <Pressable
            style={[styles.showAllBtn, { borderColor: theme.primary }]}
            onPress={() => router.push(`/reviews/${product.id}`)}
          >
            <Text style={[styles.showAllBtnText, { color: theme.primary }]}>Show all reviews</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <Toast message={toastMsg} />

      <View style={styles.footer}>
        <Pressable style={styles.wishFooterBtn} onPress={onToggleWishlist}>
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={20}
            color={isWishlisted ? colors.danger : colors.ink}
          />
          <Text style={styles.wishFooterText}>{isWishlisted ? "Wishlisted" : "Wishlist"}</Text>
        </Pressable>
        <Pressable style={[styles.cartFooterBtn, { backgroundColor: theme.primary }]} onPress={onAddToCart}>
          <Ionicons name="cart" size={18} color="#fff" />
          <Text style={styles.cartFooterText}>Add to Cart</Text>
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
  headerTitle: { ...typography.h3, flex: 1, textAlign: "center", marginHorizontal: spacing.sm },
  imageWrap: {},
  bigEmoji: { fontSize: 110 },
  wishBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.h1, marginTop: spacing.lg },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.green,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingPillText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  reviewCount: { fontSize: 12, color: colors.inkSoft },
  saleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: "auto",
  },
  saleBadgeText: { color: "#fff", fontWeight: "800", fontSize: 10.5 },
  originalPriceLarge: {
    fontSize: 15,
    color: colors.inkSoft,
    textDecorationLine: "line-through",
    marginTop: spacing.md,
  },
  saleRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  saleRowText: { fontSize: 11.5, color: colors.danger, fontWeight: "600" },
  price: { fontSize: 24, fontWeight: "800", color: colors.ink, marginTop: spacing.md },
  inCartHint: { fontSize: 12, color: colors.green, fontWeight: "700", marginTop: 4 },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  addressLabel: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  addressLine: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  addressChange: { fontSize: 12.5, fontWeight: "700" },
  divider: { height: 8, backgroundColor: colors.bg, marginVertical: spacing.lg, marginHorizontal: -spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  description: { fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  reviewSummaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  breakdownTitle: { fontSize: 12.5, fontWeight: "700", color: colors.inkSoft, marginBottom: spacing.md, textTransform: "uppercase", letterSpacing: 0.3 },
  qualBadge: { backgroundColor: "#e6f4ea", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  qualBadgeText: { fontSize: 11.5, fontWeight: "700", color: colors.green },
  showAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  showAllBtnText: { fontWeight: "700", fontSize: 13.5 },
  reviewBigNumber: { fontSize: 34, fontWeight: "800", color: colors.ink },
  reviewItem: { marginBottom: spacing.md },
  reviewerName: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  reviewText: { fontSize: 12.5, color: colors.inkSoft, marginTop: 3, lineHeight: 18 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  wishFooterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  wishFooterText: { fontWeight: "700", fontSize: 14, color: colors.ink },
  cartFooterBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.blue,
    paddingVertical: 14,
  },
  cartFooterText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.white },
  notFoundText: { fontSize: 14, color: colors.inkSoft },
  backBtn: { backgroundColor: colors.blue, paddingVertical: 10, paddingHorizontal: 24, borderRadius: radius.sm },
  backBtnText: { color: "#fff", fontWeight: "700" },
  toast: {
    position: "absolute",
    bottom: 78,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,20,20,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  toastText: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
});
