import React, { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stagger delay in ms — pass index * 40 or similar when rendering a
   * list, so items cascade in rather than all popping in at once. */
  delay?: number;
  /** Small upward slide alongside the fade, in px. 12 (default) reads as
   * a natural "settle into place"; 0 disables the slide entirely. */
  slideDistance?: number;
}

/** Fades (and gently slides up) content on mount. Used for screen
 * content and list items so things settle into place instead of
 * snapping in instantly — this alone is a big part of what makes an
 * app feel considered rather than static. */
export default function FadeInView({ children, style, delay = 0, slideDistance = 12 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, delay, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}