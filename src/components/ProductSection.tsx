import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";

interface Props {
  title: string;
  data: Product[];
  backgroundColor: string;
  onSeeMore?: () => void;
  onPressProduct?: (product: Product) => void;
}

export default function ProductSection({
  title,
  data,
  backgroundColor,
  onSeeMore,
  onPressProduct,
}: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {onSeeMore && (
          <Pressable style={styles.seeMore} onPress={onSeeMore} hitSlop={8}>
            <Text style={[styles.seeMoreText, { color: theme.primary }]}>See More</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
          </Pressable>
        )}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            emoji={item.emoji}
            image={item.image}
            title={item.title}
            subtitle={item.price}
            onPress={() => onPressProduct?.(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, flexShrink: 1 },
  seeMore: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeMoreText: { fontSize: 12, fontWeight: "700", color: colors.blue },
});
