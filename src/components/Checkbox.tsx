import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface Props {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  accentColor?: string;
}

export default function Checkbox({ checked, onToggle, label, accentColor = colors.blue }: Props) {
  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={6}>
      <View
        style={[
          styles.box,
          { borderColor: checked ? accentColor : "#bbb" },
          checked && { backgroundColor: accentColor },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={13} color="#fff" />}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 13, fontWeight: "500", color: "#333" },
});