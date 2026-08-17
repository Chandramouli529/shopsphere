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
import { adminLogin } from "@/store/slices/adminAuthSlice";

const ADMIN_COLOR = "#6c2eb5";

export default function AdminLoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.adminAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loading = status === "loading";

  const onLogin = async () => {
    const result = await dispatch(adminLogin({ email: email.trim(), password }));
    if (adminLogin.fulfilled.match(result)) {
      router.replace("/admin/dashboard");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.header}>
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <Ionicons name="shield-checkmark" size={22} color="#fff" />
        <Text style={styles.headerTitle}>Admin Portal</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.body}>
          <Text style={styles.title}>Admin Login</Text>

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

          <View style={styles.inputWrap}>
            <Text style={styles.inputLbl}>Password</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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
            style={[styles.loginBtn, (!email || !password || loading) && styles.btnDisabled]}
            disabled={!email || !password || loading}
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
    backgroundColor: ADMIN_COLOR,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  close: { position: "absolute", left: spacing.lg, top: spacing.md },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginTop: 4 },
  body: { padding: spacing.xl },
  title: { fontSize: 20, fontWeight: "800", marginBottom: spacing.lg, color: colors.ink },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: ADMIN_COLOR,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: spacing.md,
  },
  inputLbl: { fontSize: 10.5, color: ADMIN_COLOR, marginBottom: 2 },
  input: { fontSize: 15, paddingVertical: 2, color: colors.ink },
  errorText: { color: "#d32f2f", fontSize: 12, marginBottom: spacing.md },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  loginBtn: { backgroundColor: ADMIN_COLOR, paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  loginText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
