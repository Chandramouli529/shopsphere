import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export default function CategoryPill({ icon, label, active, onPress }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={[styles.iconBox, active && { borderWidth: 2, borderColor: theme.primary }]}>
        <Ionicons name={icon} size={20} color={active ? theme.primary : colors.ink} />
      </View>
      <Text style={[styles.label, active && { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginRight: 22 },
  iconBox: {
    width: 44,
    height: 44,
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
  label: { fontSize: 11, fontWeight: "600", color: colors.ink, marginTop: 6 },
});
