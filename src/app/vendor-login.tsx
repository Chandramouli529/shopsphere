import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { vendorEnterEmail } from "@/store/slices/vendorAuthSlice";
import { resetEmailVerification } from "@/services/vendorVerifiedEmails";

export default function VendorLoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.vendorAuth);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    setLoading(true);
    const result = await dispatch(vendorEnterEmail(email.trim()));
    setLoading(false);
    if (vendorEnterEmail.fulfilled.match(result)) {
      router.push(result.payload.alreadyVerified ? "/vendor-password" : "/vendor-otp");
    }
  };

  const onResetVerification = () => {
    if (!email.trim()) return;
    Alert.alert(
      "Reset OTP Verification",
      `Forget that ${email.trim()} was already OTP-verified? Next login for this email will ask for the OTP again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            await resetEmailVerification(email.trim());
            Alert.alert("Done", "Next login with this email will require OTP verification again.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.header}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <Ionicons name="storefront" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Vendor Portal</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.body}>
          <Text style={styles.title}>Vendor Login</Text>
          <Text style={styles.sub}>
            Enter the email your admin registered you with. First-time logins verify a one-time code from
            that same email before you set your password.
          </Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLbl}>Email ID</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
          </View>

          {email.trim().length > 0 && (
            <Pressable onPress={onResetVerification} hitSlop={8} style={{ marginBottom: spacing.md }}>
              <Text style={styles.resetLink}>Testing: reset OTP verification for this email</Text>
            </Pressable>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.continueBtn, (!email || loading) && styles.btnDisabled]}
            disabled={!email || loading}
            onPress={onContinue}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueText}>Continue</Text>}
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
    gap: 4,
  },
  close: { position: "absolute", left: spacing.lg, top: spacing.md },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginTop: 4 },
  body: { padding: spacing.xl },
  title: { fontSize: 20, fontWeight: "800", marginBottom: spacing.xs, color: colors.ink },
  sub: { fontSize: 12.5, color: colors.inkSoft, marginBottom: spacing.lg, lineHeight: 18 },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: "#2c3e50",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: spacing.md,
  },
  inputLbl: { fontSize: 10.5, color: "#2c3e50", marginBottom: 2 },
  input: { fontSize: 15, paddingVertical: 2, color: colors.ink },
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.md },
  resetLink: { fontSize: 11, color: "#888", textDecorationLine: "underline" },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  continueBtn: { backgroundColor: "#2c3e50", paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  continueText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});