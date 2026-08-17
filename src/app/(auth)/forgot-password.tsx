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
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch } from "@/store/store";
import { forgotPasswordStart } from "@/store/slices/authSlice";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSend = async () => {
    setError(null);
    setSubmitting(true);
    const result = await dispatch(forgotPasswordStart(email.trim()));
    setSubmitting(false);
    if (forgotPasswordStart.fulfilled.match(result)) {
      router.push("/(auth)/reset-password");
    } else {
      setError((result.payload as string) ?? "Could not send reset code.");
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
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.fieldLabel}>
            Enter the email address on your account and we'll send a code to reset your password.
          </Text>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Email ID</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueBtn,
              { backgroundColor: theme.primary },
              (!email || submitting) && styles.btnDisabled,
            ]}
            disabled={!email || submitting}
            onPress={onSend}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>Send Reset Code</Text>
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
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  continueBtn: { paddingVertical: 14, borderRadius: 3, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  continueText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
