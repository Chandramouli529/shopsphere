import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { updateProfile } from "@/store/slices/authSlice";

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const theme = useAppTheme();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.mobile ?? "");
  const [saved, setSaved] = useState(false);

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    dispatch(updateProfile({ name: name.trim(), mobile: phone.trim() || undefined }));
    setSaved(true);
    setTimeout(() => router.back(), 600);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.emptyWrap} edges={["top"]}>
        <Ionicons name="person-circle-outline" size={44} color="#bbb" />
        <Text style={styles.emptyText}>Log in to edit your profile</Text>
        <Pressable style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.saveBtnText}>Log In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.body}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarInitial}>{(name || user.email).charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />
          </View>

          <View style={[styles.inputWrap, { borderColor: theme.primary }]}>
            <Text style={[styles.inputLbl, { color: theme.primary }]}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Add a phone number"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={[styles.inputWrap, styles.readOnlyWrap]}>
            <Text style={styles.inputLbl}>Email ID</Text>
            <Text style={styles.readOnlyValue}>{user.email}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.green} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.emailNote}>
            Email is your login ID and can't be changed here. Use Log Out and log in with a different
            email to switch accounts.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveBtn, { backgroundColor: theme.primary }, !canSave && styles.btnDisabled]}
            disabled={!canSave}
            onPress={onSave}
          >
            <Text style={styles.saveBtnText}>{saved ? "Saved ✓" : "Save Changes"}</Text>
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
  avatarWrap: { alignItems: "center", marginBottom: spacing.xl },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontWeight: "800", fontSize: 28 },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: colors.blue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: spacing.md,
  },
  inputLbl: { fontSize: 11, color: colors.blue, marginBottom: 4 },
  input: { fontSize: 16, paddingVertical: 4, color: colors.ink },
  readOnlyWrap: { borderColor: colors.line, flexDirection: "row", alignItems: "center" },
  readOnlyValue: { flex: 1, fontSize: 15, color: colors.inkSoft, paddingVertical: 4 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { fontSize: 10.5, color: colors.green, fontWeight: "700" },
  emailNote: { fontSize: 11.5, color: colors.inkSoft, lineHeight: 16, marginTop: 2 },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.line },
  saveBtn: {
    backgroundColor: colors.blue,
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.white },
  emptyText: { fontSize: 14, color: colors.inkSoft },
});
