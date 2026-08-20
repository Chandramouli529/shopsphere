import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";
import FadeInView from "@/components/FadeInView";

interface Props {
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  label: string;
  value: string;
  accentColor: string;
  trend?: string;
  trendUp?: boolean;
  /** Stagger index — pass the card's position in the grid (0, 1, 2...)
   * so a row of stat cards cascades in rather than popping in together. */
  index?: number;
}

export default function StatCard({ icon, label, value, accentColor, trend, trendUp, index = 0 }: Props) {
  return (
    <FadeInView style={styles.card} delay={index * 60}>
      <View style={[styles.iconBox, { backgroundColor: accentColor + "22" }]}>
        <Ionicons name={icon} size={18} color={accentColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Ionicons name={trendUp ? "arrow-up" : "arrow-down"} size={11} color={trendUp ? colors.green : "#c0392b"} />
          <Text style={[styles.trendText, { color: trendUp ? colors.green : "#c0392b" }]}>{trend}</Text>
        </View>
      )}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: { fontSize: 19, fontWeight: "800", color: colors.ink },
  label: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 6 },
  trendText: { fontSize: 10.5, fontWeight: "700" },
});