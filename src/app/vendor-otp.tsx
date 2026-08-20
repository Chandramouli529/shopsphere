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
import type { AppDispatch, RootState } from "@/store/store";
import { vendorVerifyOtp } from "@/store/slices/vendorAuthSlice";

const OTP_LENGTH = 6;
const OTP_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VendorOtpScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { pendingEmail, status, error } = useSelector((state: RootState) => state.vendorAuth);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [expiresAt] = useState(() => Date.now() + OTP_VALIDITY_MS);
  const [remainingMs, setRemainingMs] = useState(OTP_VALIDITY_MS);
  const inputs = useRef<Array<TextInput | null>>([]);
  const verifying = status === "loading";

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
    const result = await dispatch(vendorVerifyOtp(digits.join("")));
    if (vendorVerifyOtp.fulfilled.match(result)) {
      router.push("/vendor-password");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.header}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Verify OTP</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.body}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.sub}>Sent to {pendingEmail ?? "your email"}</Text>

          <View style={styles.otpRow}>
            {digits.map((d, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputs.current[idx] = ref;
                }}
                style={[styles.otpBox, { borderColor: expired ? "#d32f2f" : "#2c3e50" }]}
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
              <Text style={styles.expiredText}>This code has expired. Contact your admin for a new one.</Text>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.verifyBtn,
              (!complete || verifying || expired) && styles.btnDisabled,
            ]}
            disabled={!complete || verifying || expired}
            onPress={onVerify}
          >
            {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Verify</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  close: { position: "absolute", left: spacing.lg, top: spacing.md },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  body: { padding: spacing.xl },
  title: { fontSize: 20, fontWeight: "800", marginBottom: spacing.xs, color: colors.ink },
  sub: { fontSize: 12.5, color: colors.inkSoft, marginBottom: spacing.lg },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  otpBox: {
    width: 42,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    borderWidth: 1.5,
    borderRadius: radius.sm,
  },
  timerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: spacing.md },
  timerText: { fontSize: 12, color: "#777", fontWeight: "600" },
  expiredRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: spacing.md },
  expiredText: { fontSize: 12, color: "#d32f2f", fontWeight: "700", flex: 1 },
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.md },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  verifyBtn: { backgroundColor: "#2c3e50", paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  verifyText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});