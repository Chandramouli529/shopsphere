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

import {
  loginWithPassword,
} from "@/store/slices/authSlice";

import {
  addItem,
  clearPendingItem,
} from "@/store/slices/cartSlice";

import {
  addWishlistItem,
  clearPendingWishlistItem,
} from "@/store/slices/wishlistSlice";

import Checkbox from "@/components/Checkbox";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useAppTheme();

  const { status, error } = useSelector(
    (state: RootState) => state.auth
  );

  const pendingItem = useSelector(
    (state: RootState) => state.cart.pendingItem
  );

  const pendingWishlistItem = useSelector(
    (state: RootState) => state.wishlist.pendingItem
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [localError, setLocalError] = useState<string | null>(null);

  const submitting = status === "verifying";

  const onLogin = async () => {
    setLocalError(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!EMAIL_RE.test(cleanEmail)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    const result = await dispatch(
      loginWithPassword({
        email: cleanEmail,
        password,
        rememberMe,
      })
    );

    if (loginWithPassword.fulfilled.match(result)) {
      console.log("USER LOGGED IN:", result.payload.user);

      /*
       * User is now stored in Redux:
       *
       * state.auth.user
       *
       * AccountScreen will automatically display:
       * - Name
       * - Email
       * - Avatar
       * - Edit Profile
       * - Logout
       */

      if (pendingItem) {
        dispatch(addItem(pendingItem));
        dispatch(clearPendingItem());

        router.replace("/(tabs)/cart");
        return;
      }

      if (pendingWishlistItem) {
        dispatch(addWishlistItem(pendingWishlistItem));
        dispatch(clearPendingWishlistItem());

        router.replace("/settings/wishlist");
        return;
      }

      // Normal customer login
      router.replace("/(tabs)/account");
    }
  };

  const onClose = () => {
    dispatch(clearPendingItem());
    dispatch(clearPendingWishlistItem());

    router.back();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.primary,
          },
        ]}
      >
        <Pressable
          style={styles.close}
          onPress={onClose}
        >
          <Ionicons
            name="close"
            size={22}
            color="#fff"
          />
        </Pressable>

        <View style={styles.logoRow}>
          <Ionicons
            name="flash"
            size={18}
            color={theme.secondary}
          />

          <Text style={styles.logoText}>
            ShopSphere
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View style={styles.body}>

          <Text style={styles.title}>
            Log in to your account
          </Text>

          {/* EMAIL */}
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.inputLbl,
                {
                  color: theme.primary,
                },
              ]}
            >
              Email ID
            </Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setLocalError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!submitting}
              autoFocus
              placeholder="Enter your email"
              placeholderTextColor="#999"
            />
          </View>

          {/* PASSWORD */}
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.inputLbl,
                {
                  color: theme.primary,
                },
              ]}
            >
              Password
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                  },
                ]}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setLocalError(null);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                editable={!submitting}
                placeholder="Enter your password"
                placeholderTextColor="#999"
              />

              <Pressable
                onPress={() =>
                  setShowPassword((value) => !value)
                }
                hitSlop={8}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={18}
                  color="#888"
                />
              </Pressable>
            </View>
          </View>

          {/* ERROR */}
          {localError || error ? (
            <Text style={styles.errorText}>
              {localError || error}
            </Text>
          ) : null}

          {/* REMEMBER / FORGOT */}
          <View style={styles.rowBetween}>
            <Checkbox
              checked={rememberMe}
              onToggle={() =>
                setRememberMe((value) => !value)
              }
              label="Remember me"
              accentColor={theme.primary}
            />

            <Pressable
              style={styles.forgotBtn}
              onPress={() =>
                router.push(
                  "/(auth)/forgot-password"
                )
              }
              hitSlop={6}
            >
              <Text
                style={[
                  styles.linkRight,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Forgot Password?
              </Text>
            </Pressable>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueBtn,
              {
                backgroundColor:
                  theme.primary,
              },
              submitting &&
                styles.btnDisabled,
            ]}
            disabled={submitting}
            onPress={onLogin}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>
                Log In
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.registerRow}
            onPress={() =>
              router.push(
                "/(auth)/register"
              )
            }
          >
            <Text style={styles.registerText}>
              New to ShopSphere?{" "}
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: "700",
                }}
              >
                Create Account
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  close: {
    position: "absolute",
    left: spacing.lg,
    top: spacing.md,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  logoText: {
    color: "#fff",
    fontWeight: "800",
    fontStyle: "italic",
    fontSize: 20,
  },

  body: {
    padding: spacing.xl,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.lg,
  },

  inputWrap: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: spacing.sm,
  },

  inputLbl: {
    fontSize: 10,
    marginBottom: 2,
  },

  input: {
    fontSize: 14,
    paddingVertical: 3,
    color: colors.ink,
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginBottom: spacing.sm,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  forgotBtn: {
    marginLeft: "auto",
    paddingLeft: spacing.md,
  },

  linkRight: {
    fontWeight: "700",
    fontSize: 12.5,
  },

  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  continueBtn: {
    paddingVertical: 13,
    borderRadius: 3,
    alignItems: "center",
  },

  btnDisabled: {
    opacity: 0.5,
  },

  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  registerRow: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  registerText: {
    fontSize: 13,
    color: "#555",
  },
});