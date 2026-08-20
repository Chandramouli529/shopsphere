import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { verifyRegistrationOtp, cancelRegistration } from "@/store/slices/authSlice";
import { authApi } from "@/services/authApi";
import AnimatedPressable from "@/components/AnimatedPressable";
import FadeInView from "@/components/FadeInView";

const OTP_LENGTH = 6;
const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RegisterOtpScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();
  const pendingEmail = useSelector((state: RootState) => state.auth.pendingRegistration?.email);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  // The OTP was sent when registerStart succeeded, right before this screen
  // opened — so the 5-minute window starts counting from mount, and resets
  // whenever the user taps Resend (a fresh code means a fresh window).
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + OTP_VALIDITY_MS);
  const [remainingMs, setRemainingMs] = useState(OTP_VALIDITY_MS);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const expired = remainingMs <= 0;

  const setDigit = (idx: number, value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    const next = [...digits];
    next[idx] = clean.slice(-1);
    setDigits(next);
    if (clean && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus();
  };

  const onKeyPress = (idx: number, key: string) => {
    if (key === "Backspace" && !digits[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const complete = digits.every((d) => d !== "");

  const onVerify = async () => {
    if (expired) {
      setError("This code has expired. Tap Resend OTP to get a new one.");
      return;
    }
    setError(null);
    setVerifying(true);
    const emailOtp = digits.join("");
    const result = await dispatch(verifyRegistrationOtp(emailOtp));
    setVerifying(false);
    if (verifyRegistrationOtp.fulfilled.match(result)) {
      router.replace("/(auth)/login");
    } else {
      setError((result.payload as string) ?? "Invalid OTP");
    }
  };

  const onResend = async () => {
    if (!pendingEmail || resending) return;
    setError(null);
    setResending(true);
    try {
      await authApi.requestOtp(pendingEmail);
      setExpiresAt(Date.now() + OTP_VALIDITY_MS);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } catch {
      setError("Could not resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const onCancel = () => {
    dispatch(cancelRegistration());
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <AnimatedPressable scaleTo={0.85} style={styles.close} onPress={onCancel}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </AnimatedPressable>
        <FadeInView slideDistance={0} style={styles.logoRow}>
          <Ionicons name="flash" size={18} color={theme.secondary} />
          <Text style={styles.logoText}>ShopSphere</Text>
        </FadeInView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.body}>
          <FadeInView delay={0}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.fieldLabel}>
              Enter the 6-digit code sent to {pendingEmail ?? "your email"}
            </Text>
          </FadeInView>

          <FadeInView delay={80}>
            <View style={styles.otpRow}>
              {digits.map((d, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    inputs.current[idx] = ref;
                  }}
                  style={[styles.otpBox, { borderColor: expired ? "#d32f2f" : theme.primary }]}
                  value={d}
                  onChangeText={(v) => setDigit(idx, v)}
                  onKeyPress={({ nativeEvent }) => onKeyPress(idx, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={idx === 0}
                  editable={!expired}
                />
              ))}
            </View>
          </FadeInView>

          <FadeInView delay={140}>
            {!expired ? (
              <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={14} color={remainingMs < 30000 ? "#d32f2f" : "#777"} />
                <Text style={[styles.timerText, remainingMs < 30000 && { color: "#d32f2f" }]}>
                  Code expires in {formatCountdown(remainingMs)}
                </Text>
              </View>
            ) : (
              <View style={styles.expiredRow}>
                <Ionicons name="alert-circle" size={14} color="#d32f2f" />
                <Text style={styles.expiredText}>This code has expired.</Text>
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.resend}>
              {expired ? "Get a new code:" : "Didn't receive the code?"}{" "}
              <Text style={[styles.resendLink, { color: theme.primary }]} onPress={onResend}>
                {resending ? "Sending…" : "Resend OTP"}
              </Text>
            </Text>
          </FadeInView>
        </View>

        <View style={styles.footer}>
          <AnimatedPressable
            style={[
              styles.verifyBtn,
              { backgroundColor: theme.primary },
              (!complete || verifying || expired) && styles.btnDisabled,
            ]}
            disabled={!complete || verifying || expired}
            onPress={onVerify}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyText}>Verify &amp; Create Account</Text>
            )}
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg + 4, alignItems: "center", justifyContent: "center" },
  close: { position: "absolute", left: spacing.lg, top: spacing.md },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { color: "#fff", fontWeight: "800", fontStyle: "italic", fontSize: 20 },
  body: { padding: spacing.xl },
  title: { fontSize: 22, fontWeight: "800", marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: spacing.lg },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  otpBox: {
    width: 42,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    borderWidth: 1.5,
    borderRadius: radius.sm,
  },
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.md },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: spacing.md },
  timerText: { fontSize: 12, color: "#777", fontWeight: "600" },
  expiredRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: spacing.md },
  expiredText: { fontSize: 12, color: "#d32f2f", fontWeight: "700" },
  resend: { fontSize: 13, color: "#777" },
  resendLink: { fontWeight: "700" },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  verifyBtn: { paddingVertical: 14, borderRadius: 3, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  verifyText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});