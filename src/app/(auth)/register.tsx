import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { registerStart } from "@/store/slices/authSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  label,
  value,
  onChangeText,
  theme,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  theme: { primary: string };
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
      <Text style={[styles.inputLbl, { color: theme.primary }]}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} {...rest} />
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Once the user is actively editing again after a failed submit, the old
  // error message is almost always stale — clear it rather than leaving it
  // stuck on screen after they've already fixed the problem it described.
  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, email, mobileNumber, password, confirmPassword]);

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim()) return "Enter your first and last name.";
    if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
    if (!/^\d{10}$/.test(mobileNumber.trim())) return "Enter a valid 10-digit mobile number.";
    if (password.length < 12) return "Password must be at least 12 characters.";
    if (password.trim() !== confirmPassword.trim()) return "Passwords do not match.";
    return null;
  };

  const onRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await dispatch(
      registerStart({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        password: password.trim(),
      })
    );
    setSubmitting(false);
    if (registerStart.fulfilled.match(result)) {
      router.push("/(auth)/register-otp");
    } else {
      setError((result.payload as string) ?? "Could not create account. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <View style={styles.logoRow}>
          <Ionicons name="flash" size={18} color={theme.secondary} />
          <Text style={styles.logoText}>ShopSphere</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Field label="First Name" value={firstName} onChangeText={setFirstName} theme={theme} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" value={lastName} onChangeText={setLastName} theme={theme} />
            </View>
          </View>

          <Field
            label="Email ID"
            value={email}
            onChangeText={setEmail}
            theme={theme}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Mobile Number"
            value={mobileNumber}
            onChangeText={(v) => setMobileNumber(v.replace(/\D/g, "").slice(0, 10))}
            theme={theme}
            keyboardType="number-pad"
            maxLength={10}
          />

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="none"
                importantForAutofill="no"
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={16} color="#888" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[styles.inputLbl, { color: theme.primary }]}>Confirm Password</Text>
              {confirmPassword.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Ionicons
                    name={password.trim() === confirmPassword.trim() ? "checkmark-circle" : "close-circle"}
                    size={13}
                    color={password.trim() === confirmPassword.trim() ? colors.green : "#d32f2f"}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: password.trim() === confirmPassword.trim() ? colors.green : "#d32f2f",
                    }}
                  >
                    {password.trim() === confirmPassword.trim() ? "Matches" : "Doesn't match yet"}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="none"
                importantForAutofill="no"
              />
              <Pressable onPress={() => setShowConfirmPassword((s) => !s)} hitSlop={8}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={16} color="#888" />
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.terms}>
            By creating an account, you agree to ShopSphere's{" "}
            <Text style={[styles.termsLink, { color: theme.primary }]}>Terms of Use</Text> and{" "}
            <Text style={[styles.termsLink, { color: theme.primary }]}>Privacy Policy</Text>. We'll send a
            verification code to your email next.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.continueBtn, { backgroundColor: theme.primary }, submitting && styles.btnDisabled]}
            disabled={submitting}
            onPress={onRegister}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>Register</Text>
            )}
          </Pressable>
          <Pressable style={styles.loginRow} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={{ color: theme.primary, fontWeight: "700" }}>Log In</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg, alignItems: "center", justifyContent: "center" },
  close: { position: "absolute", left: spacing.lg, top: spacing.md },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { color: "#fff", fontWeight: "800", fontStyle: "italic", fontSize: 20 },
  body: { padding: spacing.xl },
  title: { fontSize: 20, fontWeight: "800", marginBottom: spacing.lg },
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
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.sm },
  terms: { fontSize: 11.5, color: "#777", lineHeight: 17, marginTop: spacing.sm },
  termsLink: { color: colors.blue },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  continueBtn: { paddingVertical: 13, borderRadius: 3, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  continueText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  loginRow: { marginTop: spacing.lg, alignItems: "center" },
  loginText: { fontSize: 13, color: "#555" },
});