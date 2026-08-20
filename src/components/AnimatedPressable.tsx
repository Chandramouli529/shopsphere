import React, { useRef } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

interface Props extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks on press — 0.96 (subtle, default) works well for
   * cards; use something smaller like 0.9 for small icon buttons where a
   * bigger shrink reads better. */
  scaleTo?: number;
  children: React.ReactNode;
}

/** Drop-in replacement for Pressable that adds a real spring-based
 * press-scale animation — the whole app's Pressables were instant
 * on/off with no tactile feedback, which is what made screens feel
 * static rather than like a native app. Use this anywhere a card,
 * button, or row should feel "pressable". */
export default function AnimatedPressable({ style, scaleTo = 0.96, onPressIn, onPressOut, children, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn: PressableProps["onPressIn"] = (e) => {
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    onPressIn?.(e);
  };
  const handlePressOut: PressableProps["onPressOut"] = (e) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}