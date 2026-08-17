import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";
import type { Highlight } from "@/utils/productDetails";

export default function ProductHighlights({ highlights }: { highlights: Highlight[] }) {
  return (
    <View>
      {highlights.map((h, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name={h.icon} size={20} color={colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            {h.sub && <Text style={styles.sub}>{h.sub}</Text>}
            <Text style={styles.label}>{h.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  sub: { fontSize: 11.5, color: colors.inkSoft, marginBottom: 2 },
  label: { fontSize: 14, color: colors.ink, fontWeight: "600" },
});
