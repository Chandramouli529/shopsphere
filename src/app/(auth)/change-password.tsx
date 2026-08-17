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
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch } from "@/store/store";
import { changePassword } from "@/store/slices/authSlice";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSave = async () => {
    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    setSubmitting(false);
    if (changePassword.fulfilled.match(result)) {
      setDone(true);
      setTimeout(() => router.back(), 900);
    } else {
      setError((result.payload as string) ?? "Could not change password.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.body}>
          <Text style={styles.note}>
            Note: this account may have been created via quick Email OTP login rather than
            registration, in which case it has no password set yet — changing it here will set one.
          </Text>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
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
          {done ? <Text style={styles.successText}>Password updated ✓</Text> : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.saveBtn,
              { backgroundColor: theme.primary },
              (!currentPassword || !newPassword || submitting) && styles.btnDisabled,
            ]}
            disabled={!currentPassword || !newPassword || submitting}
            onPress={onSave}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: "center" },
  body: { padding: spacing.xl },
  note: { fontSize: 11.5, color: colors.inkSoft, lineHeight: 16, marginBottom: spacing.lg },
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
  saveBtn: { paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});