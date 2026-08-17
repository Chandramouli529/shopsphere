import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";
import type { ConditionRating } from "@/utils/rating";

export default function RatingBreakdown({ conditions }: { conditions: ConditionRating[] }) {
  return (
    <View style={styles.wrap}>
      {conditions.map((c) => (
        <View key={c.label} style={styles.chip}>
          <Text style={styles.chipLabel}>{c.label}</Text>
          <Text style={styles.chipRating}>{c.rating.toFixed(1)}</Text>
          <Ionicons name="star" size={12} color={colors.green} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  chipLabel: { fontSize: 12.5, color: colors.ink },
  chipRating: { fontSize: 13, fontWeight: "800", color: colors.ink },
});
