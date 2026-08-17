import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { SearchableProduct } from "@/data/products";
import { parsePrice } from "@/utils/price";
import { deriveDiscount } from "@/utils/discount";
import ProductImage from "@/components/ProductImage";

function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  product: SearchableProduct;
  onPress: () => void;
}

export default function DealOfTheDay({ product, onPress }: Props) {
  const theme = useAppTheme();
  const [remaining, setRemaining] = useState(getMsUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getMsUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const priceNum = parsePrice(product.price);
  const { discountPercent, originalPrice } = deriveDiscount(product.id, priceNum);

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="gift" size={18} color="#fff" />
          <Text style={styles.title}>Deal of the Day</Text>
        </View>
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text style={styles.timerText}>{formatCountdown(remaining)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <ProductImage uri={product.image} emoji={product.emoji} size={84} emojiSize={38} borderRadius={radius.md} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>{originalPrice}</Text>
            <Text style={[styles.price, { color: theme.primary }]}>{product.price}</Text>
          </View>
          <View style={[styles.discountBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "#1c1c2e",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { ...typography.h3, color: "#fff", fontSize: 15 },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  body: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  productTitle: { color: "#fff", fontSize: 13.5, fontWeight: "700", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  originalPrice: { color: "rgba(255,255,255,0.5)", fontSize: 12, textDecorationLine: "line-through" },
  price: { fontSize: 17, fontWeight: "800" },
  discountBadge: { alignSelf: "flex-start", marginTop: 6, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  discountBadgeText: { color: "#fff", fontWeight: "800", fontSize: 10.5 },
});
