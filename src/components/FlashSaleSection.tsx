import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ProductCard from "@/components/ProductCard";
import { FLASH_SALE_END_TIME, FLASH_SALE_ITEMS } from "@/data/flashSale";
import { radius, spacing, typography } from "@/theme/colors";

function getRemaining(endTime: number) {
  const diff = Math.max(0, endTime - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, ended: diff <= 0 };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface Props {
  onPressProduct?: (productId: string) => void;
}

export default function FlashSaleSection({ onPressProduct }: Props) {
  const [remaining, setRemaining] = useState(() => getRemaining(FLASH_SALE_END_TIME));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining(FLASH_SALE_END_TIME));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (remaining.ended || FLASH_SALE_ITEMS.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="flash" size={18} color="#fff" />
          <Text style={styles.title}>Flash Sale</Text>
        </View>
        <View style={styles.timerRow}>
          <Ionicons name="time-outline" size={13} color="#fff" />
          <Text style={styles.timerText}>
            {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
          </Text>
        </View>
      </View>

      <FlatList
        data={FLASH_SALE_ITEMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            emoji={item.emoji}
            image={item.image}
            title={item.title}
            subtitle={item.price}
            originalPrice={item.originalPrice}
            discountLabel={`${item.discountPercent}% OFF`}
            onPress={() => onPressProduct?.(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "#D6293E",
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { ...typography.h3, color: "#fff" },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: { color: "#fff", fontWeight: "800", fontSize: 12.5, letterSpacing: 0.5 },
});
