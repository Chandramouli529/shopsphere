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
import type { AppDispatch, RootState } from "@/store/store";
import { vendorLoginWithPassword } from "@/store/slices/vendorAuthSlice";

export default function VendorPasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { pendingEmail, status, error } = useSelector((state: RootState) => state.vendorAuth);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loading = status === "loading";

  const onLogin = async () => {
    const result = await dispatch(vendorLoginWithPassword(password));
    if (vendorLoginWithPassword.fulfilled.match(result)) {
      router.replace("/vendor/dashboard");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.header}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Enter Password</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.body}>
          <Text style={styles.title}>Log in as vendor</Text>
          <Text style={styles.sub}>Enter your password for {pendingEmail ?? "your account"}.</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLbl}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#888" />
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.loginBtn, (!password || loading) && styles.btnDisabled]}
            disabled={!password || loading}
            onPress={onLogin}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Log In</Text>}
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
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  loginBtn: { backgroundColor: "#2c3e50", paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});