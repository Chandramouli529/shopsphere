import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Category icon in the pinned category bar. The active one animates
 * distinctly from the rest — it grows slightly and its ring color fades
 * in, rather than just snapping a border on.
 *
 * Two animated values are kept deliberately separate rather than
 * combined: `borderProgress` drives borderColor, which React Native's
 * native driver can't animate, so it must run on the JS thread
 * (useNativeDriver: false). `scale` (the active grow + press shrink)
 * only ever touches `transform`, which the native driver fully
 * supports, so it stays useNativeDriver: true throughout. Mixing a
 * native-driven value into the same Animated.multiply/interpolate chain
 * as a JS-driven one is what caused the "moved to native earlier"
 * crash — keeping them on fully separate values and separate style
 * props avoids that entirely. */
export default function CategoryPill({ icon, label, active, onPress }: Props) {
  const theme = useAppTheme();
  const borderProgress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const activeScale = useRef(new Animated.Value(active ? 1.08 : 1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(borderProgress, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    Animated.spring(activeScale, {
      toValue: active ? 1.08 : 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 9,
    }).start();
  }, [active]);

  const borderColor = borderProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", theme.primary],
  });

  return (
    <Pressable
      style={styles.wrap}
      onPress={onPress}
      onPressIn={() => Animated.spring(pressScale, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
      onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()}
    >
      <Animated.View style={[styles.iconBox, { borderWidth: 2, borderColor }]}>
        <Animated.View style={{ transform: [{ scale: Animated.multiply(activeScale, pressScale) }] }}>
          <Ionicons name={icon} size={20} color={active ? theme.primary : colors.ink} />
        </Animated.View>
      </Animated.View>
      <Text style={[styles.label, active && { color: theme.primary, fontWeight: "800" }]}>{label}</Text>
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