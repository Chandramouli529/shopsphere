import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors, radius, spacing } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { addItem, setPendingItem } from "@/store/slices/cartSlice";
import { parsePrice } from "@/utils/price";
import ProductImage from "@/components/ProductImage";
import AnimatedPressable from "@/components/AnimatedPressable";

type Size = "sm" | "lg" | "grid3";

const SIZE_CONFIG: Record<Size, { card: number; thumb: number; emoji: number; title: number; subtitle: number; addBtn: number; addIcon: number }> = {
  sm: { card: 92, thumb: 92, emoji: 30, title: 11, subtitle: 10, addBtn: 24, addIcon: 14 },
  lg: { card: 136, thumb: 136, emoji: 44, title: 13.5, subtitle: 13, addBtn: 29, addIcon: 16.5 },
  grid3: { card: 110, thumb: 110, emoji: 34, title: 11.5, subtitle: 12, addBtn: 24, addIcon: 14 },
};

interface Props {
  /** Product id. Required for the Add to Cart button to work correctly
   * (used as the cart line-item id so repeat taps increment quantity
   * instead of creating duplicate rows). If omitted, the button is hidden. */
  id?: string;
  emoji: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  /** Hide the Add to Cart button, e.g. when the card is already inside the
   * cart itself. Defaults to showing it whenever `id` is provided. */
  hideAddToCart?: boolean;
  /** 'sm' (default) is used in horizontal scrolling rows on Home.
   * 'lg' is used in the 2-column Categories product grid, where there's
   * room for a bigger, easier-to-tap card. */
  size?: Size;
  /** Pre-discount price, shown struck through above `subtitle`. Used for
   * Flash Sale cards; omit for regular listings. */
  originalPrice?: string;
  /** Discount badge text, e.g. "20% OFF", shown on the thumbnail corner. */
  discountLabel?: string;
  /** Real product photo URL. Falls back to the emoji if omitted or if the
   * image fails to load. */
  image?: string;
  /** Star rating (e.g. 4.3), shown as a small green pill like "4.3★".
   * Omit to hide the rating badge entirely. */
  rating?: number;
}

export default function ProductCard({
  id,
  emoji,
  title,
  subtitle,
  onPress,
  hideAddToCart,
  size = "sm",
  originalPrice,
  discountLabel,
  image,
  rating,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const theme = useAppTheme();
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.user);
  const cfg = SIZE_CONFIG[size];

  const showAddToCart = !!id && !hideAddToCart;

  const handleAddToCart = () => {
    if (!id) return;
    const cartItem = { id, title, price: parsePrice(subtitle), qty: 1, emoji, image };
    if (isLoggedIn) {
      dispatch(addItem(cartItem));
    } else {
      // Stash the item and send the user to log in first. The OTP screen
      // picks this up on success, adds it, and lands the user in the Cart
      // tab so they immediately see what they tried to add.
      dispatch(setPendingItem(cartItem));
      router.push("/(auth)/login");
    }
  };

  return (
    <AnimatedPressable style={[styles.card, { width: cfg.card }]} onPress={onPress}>
      <View style={[styles.thumb, { width: cfg.thumb, height: cfg.thumb }]}>
        <ProductImage uri={image} emoji={emoji} size={cfg.thumb} emojiSize={cfg.emoji} borderRadius={radius.md} />
        {discountLabel && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountLabel}</Text>
          </View>
        )}
        {showAddToCart && (
          <AnimatedPressable
            scaleTo={0.85}
            style={[
              styles.addBtn,
              { width: cfg.addBtn, height: cfg.addBtn, borderRadius: cfg.addBtn / 2, backgroundColor: theme.primary },
            ]}
            onPress={handleAddToCart}
            hitSlop={6}
          >
            <Ionicons name="add" size={cfg.addIcon} color="#fff" />
          </AnimatedPressable>
        )}
      </View>
      <Text style={[styles.title, { fontSize: cfg.title }]} numberOfLines={1}>
        {title}
      </Text>
      {rating != null && (
        <View style={styles.ratingPill}>
          <Text style={styles.ratingPillText}>{rating.toFixed(1)}</Text>
          <Ionicons name="star" size={9} color="#fff" />
        </View>
      )}
      {originalPrice && (
        <Text style={[styles.originalPrice, { fontSize: cfg.subtitle - 1 }]} numberOfLines={1}>
          {originalPrice}
        </Text>
      )}
      <Text style={[styles.subtitle, { fontSize: cfg.subtitle, color: theme.primary }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { marginRight: spacing.md },
  thumb: {
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  addBtn: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  title: { fontWeight: "600", color: colors.ink, marginTop: 6 },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    backgroundColor: colors.green,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginTop: 3,
  },
  ratingPillText: { color: "#fff", fontSize: 9.5, fontWeight: "700" },
  originalPrice: {
    color: colors.inkSoft,
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  subtitle: { fontWeight: "700", color: colors.blue, marginTop: 2 },
  discountBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    backgroundColor: colors.danger,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});