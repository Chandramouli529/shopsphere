import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { resetPasswordWithOtp } from "@/store/slices/authSlice";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();
  const resetEmail = useSelector((state: RootState) => state.auth.passwordResetEmail);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onReset = async () => {
    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await dispatch(resetPasswordWithOtp({ otp, newPassword }));
    setSubmitting(false);
    if (resetPasswordWithOtp.fulfilled.match(result)) {
      setDone(true);
      setTimeout(() => router.replace("/(auth)/login"), 900);
    } else {
      setError((result.payload as string) ?? "Could not reset password.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.logoRow}>
          <Ionicons name="flash" size={18} color={theme.secondary} />
          <Text style={styles.logoText}>ShopSphere</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.body}>
          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.fieldLabel}>
            Enter the code sent to {resetEmail ?? "your email"} and choose a new password.
          </Text>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>6-digit Code</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>New Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={16} color="#888" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {done ? <Text style={styles.successText}>Password reset! Redirecting to login…</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueBtn,
              { backgroundColor: theme.primary },
              (otp.length !== 6 || !newPassword || submitting) && styles.btnDisabled,
            ]}
            disabled={otp.length !== 6 || !newPassword || submitting}
            onPress={onReset}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>Reset Password</Text>
            )}
          </Pressable>
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
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: spacing.lg, lineHeight: 19 },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: spacing.sm,
  },
  inputLbl: { fontSize: 10, marginBottom: 2 },
  input: { fontSize: 14, paddingVertical: 2, color: colors.ink },
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.md },
  successText: { color: colors.green, fontSize: 13, fontWeight: "600" },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  continueBtn: { paddingVertical: 14, borderRadius: 3, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  continueText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});