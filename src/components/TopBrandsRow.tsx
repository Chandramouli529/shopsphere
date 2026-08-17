import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { TOP_BRANDS } from "@/data/topBrands";

interface Props {
  onPressBrand: (name: string) => void;
}

export default function TopBrandsRow({ onPressBrand }: Props) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.title}>Top Brands</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TOP_BRANDS.map((brand) => (
          <Pressable key={brand.name} style={styles.tile} onPress={() => onPressBrand(brand.name)}>
            <View style={styles.emojiBox}>
              <Text style={{ fontSize: 26 }}>{brand.emoji}</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {brand.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h3, marginHorizontal: spacing.md, marginBottom: spacing.md },
  row: { paddingHorizontal: spacing.md, gap: spacing.md },
  tile: { width: 72, alignItems: "center" },
  emojiBox: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 11, fontWeight: "600", color: colors.ink, marginTop: 6, textAlign: "center" },
});
