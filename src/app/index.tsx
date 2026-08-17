import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";

const NAVIGATE_DELAY_MS = 2600;
const WORD = "ShopSphere";

// Angles (degrees) around the badge where sparkle accents sit.
const SPARKLE_ANGLES = [-55, 40, 195, 250];

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export default function AnimatedSplashScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  // Entrance animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagTranslate = useRef(new Animated.Value(10)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // One animated value per letter, for a staggered reveal instead of the
  // whole wordmark fading in as a single block.
  const letterValues = useMemo(() => WORD.split("").map(() => new Animated.Value(0)), []);
  const sparkleValues = useMemo(() => SPARKLE_ANGLES.map(() => new Animated.Value(0)), []);

  const onLayoutReady = useCallback(() => {
    // The native static splash (assets/splash-icon.png, configured via
    // expo-splash-screen in app.json) stays up until this fires, so the
    // hand-off from static → animated splash happens with nothing blank
    // in between.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // 1) Badge pops in with an elastic spring + soft glow bloom.
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4.5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 1,
        duration: 350,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // 2) Letters of "ShopSphere" reveal one at a time, each with a tiny
    //    bounce, right after the badge lands.
    Animated.stagger(
      38,
      letterValues.map((v) =>
        Animated.spring(v, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        })
      )
    ).start();

    // 3) Tagline fades/slides up once the wordmark has mostly finished.
    Animated.parallel([
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 320,
        delay: 380 + letterValues.length * 38,
        useNativeDriver: true,
      }),
      Animated.timing(tagTranslate, {
        toValue: 0,
        duration: 320,
        delay: 380 + letterValues.length * 38,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 4) Sparkle accents twinkle around the badge on a staggered loop.
    const sparkleLoops = sparkleValues.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 260),
          Animated.timing(v, {
            toValue: 1,
            duration: 550,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 550,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(650),
        ])
      )
    );
    sparkleLoops.forEach((loop) => loop.start());

    // 5) Orbit ring rotates continuously for the whole splash duration —
    //    the "sphere" motif stays alive rather than being a one-shot flash.
    const ringRotateLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    ringRotateLoop.start();

    // 6) Gentle breathing glow + badge scale pulse, looping together.
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // 7) Progress bar filling across the full splash duration.
    Animated.timing(progress, {
      toValue: 1,
      duration: NAVIGATE_DELAY_MS - 250,
      delay: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // width isn't supported by the native driver
    }).start();

    const timer = setTimeout(() => {
      // Always land on Home directly after splash, regardless of auth
      // state — login only happens later when the user opens Account.
      router.replace("/(tabs)/home");
    }, NAVIGATE_DELAY_MS);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
      glowLoop.stop();
      ringRotateLoop.stop();
      sparkleLoops.forEach((loop) => loop.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const badgePulseScale = badgePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacityValue = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.12] });
  const ringSpin = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <LinearGradient
      colors={[theme.primary, theme.primaryDark, "#000000"]}
      style={styles.container}
      onLayout={onLayoutReady}
    >
      <View style={styles.logoWrap}>
        <View style={styles.markStack}>
          {/* Soft breathing glow behind everything */}
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: theme.secondary,
                opacity: glowOpacityValue,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Continuously rotating orbit ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringOpacity,
                borderColor: theme.secondary,
                transform: [{ rotate: ringSpin }],
              },
            ]}
          />

          {/* Sparkle accents twinkling around the badge */}
          {SPARKLE_ANGLES.map((angle, i) => {
            const { x, y } = polar(angle, 62);
            const sparkleOpacity = sparkleValues[i];
            const sparkleScale = sparkleValues[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            });
            return (
              <Animated.View
                key={angle}
                style={[
                  styles.sparkle,
                  {
                    backgroundColor: theme.secondary,
                    opacity: sparkleOpacity,
                    transform: [{ translateX: x }, { translateY: y }, { scale: sparkleScale }],
                  },
                ]}
              />
            );
          })}

          {/* Badge with the "S" mark */}
          <Animated.View
            style={[
              styles.badge,
              {
                opacity: logoOpacity,
                backgroundColor: theme.secondary,
                shadowColor: theme.secondary,
                transform: [{ scale: Animated.multiply(logoScale, badgePulseScale) }],
              },
            ]}
          >
            <Text style={[styles.badgeLetter, { color: theme.primary }]}>S</Text>
          </Animated.View>
        </View>

        {/* Letter-by-letter wordmark reveal */}
        <View style={styles.wordRow}>
          {WORD.split("").map((char, i) => {
            const v = letterValues[i];
            const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
            return (
              <Animated.Text
                key={`${char}-${i}`}
                style={[styles.word, { opacity: v, transform: [{ translateY }] }]}
              >
                {char}
              </Animated.Text>
            );
          })}
        </View>

        <Animated.Text
          style={[styles.tag, { opacity: tagOpacity, transform: [{ translateY: tagTranslate }] }]}
        >
          EXPLORE PLUS
        </Animated.Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: theme.secondary }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoWrap: { alignItems: "center", gap: 14 },
  markStack: { alignItems: "center", justifyContent: "center", width: 140, height: 140 },
  glow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  ring: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    borderColor: colors.yellow,
    borderStyle: "dashed",
  },
  sparkle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.yellow,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  badgeLetter: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.blue,
  },
  wordRow: { flexDirection: "row" },
  word: { color: "#fff", fontSize: 30, fontWeight: "800", fontStyle: "italic" },
  tag: { color: "#FFE58A", fontSize: 12, letterSpacing: 3, marginTop: -2 },
  progressTrack: {
    position: "absolute",
    bottom: 70,
    width: 140,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.yellow,
    borderRadius: 2,
  },
});
