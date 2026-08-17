import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@/theme/colors";

interface Props {
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  title: string;
  features: string[];
}

export default function VendorComingSoon({ icon, title, features }: Props) {
  return (
    <SafeAreaView style={styles.wrap} edges={["top"]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={32} color="#2c3e50" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Coming in the next update</Text>
      <View style={styles.list}>
        {features.map((f) => (
          <View key={f} style={styles.row}>
            <Ionicons name="ellipse" size={6} color="#2c3e50" />
            <Text style={styles.rowText}>{f}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white, alignItems: "center", paddingTop: 60, paddingHorizontal: spacing.xl },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eef1f3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, marginBottom: 4 },
  sub: { fontSize: 12.5, color: colors.inkSoft, marginBottom: spacing.xl },
  list: { alignSelf: "stretch", gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowText: { fontSize: 13, color: colors.ink },
});
