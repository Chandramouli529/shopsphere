import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { clearCart } from "@/store/slices/cartSlice";

function RowLink({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.rowLink} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color="#444" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <Ionicons name={icon} size={22} color={theme.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const onLogout = () => {
    dispatch(logout());
    // A logged-out customer shouldn't still see the previous account's
    // cart — items tied to an account should go with it, not linger for
    // whoever logs in (or doesn't) next on this device.
    dispatch(clearCart());
  };
  const { user, status } = useSelector((state: RootState) => state.auth);
  const { language, addresses, cards } = useSelector((state: RootState) => state.settings);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const theme = useAppTheme();
  const isLoggedIn = !!user;

  const openSetting = (slug: string) => router.push(`/settings/${slug}`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headBand}>
          <Text style={styles.headTitle}>Account</Text>
          {isLoggedIn ? (
            <View style={styles.userBand}>
              <Pressable onPress={() => router.push("/edit-profile")}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarInitial}>{(user?.name?.charAt(0) ?? "?").toUpperCase()}</Text>
                </View>
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={11} color="#fff" />
                </View>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name ?? "Customer"}</Text>
                <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
                <Pressable onPress={() => router.push("/edit-profile")}>
                  <Text style={[styles.editProfileLink, { color: theme.primary }]}>Edit Profile</Text>
                </Pressable>
              </View>
              <Pressable onPress={onLogout}>
                <Text style={[styles.logoutText, { color: theme.primary }]}>Log Out</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.loginBand}>
              <Text style={styles.loginMsg}>Log in to get exclusive offers</Text>
              <Pressable style={[styles.loginBtn, { backgroundColor: theme.primary }]} onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginBtnText}>Log In</Text>
              </Pressable>
            </View>
          )}
        </View>

        {isLoggedIn && (
          <View style={styles.section}>
            <View style={styles.quickGrid}>
              <QuickAction icon="cube" label="Orders" onPress={() => openSetting("orders")} />
              <QuickAction icon="heart-outline" label="Wishlist" onPress={() => openSetting("wishlist")} />
              <QuickAction icon="gift-outline" label="Coupons" onPress={() => openSetting("coupons")} />
              <QuickAction icon="headset-outline" label="Help Center" onPress={() => openSetting("help")} />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finance On UPI</Text>
          <View style={styles.financeRow}>
            <Text style={{ fontSize: 22 }}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.financeTitle}>superCard | Buy Now Pay later in 3</Text>
              <Text style={styles.financeSub}>Enjoy 3% cashback | Activate Fk UPI and pay in 3 months</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {isLoggedIn && (
            <RowLink icon="person-circle" label="Edit Profile" onPress={() => router.push("/edit-profile")} />
          )}
          {isLoggedIn && (
            <RowLink icon="key" label="Change Password" onPress={() => router.push("/(auth)/change-password")} />
          )}
          <RowLink
            icon="language"
            label="Select Language"
            value={language}
            onPress={() => openSetting("language")}
          />
          <RowLink icon="color-palette" label="App Theme" onPress={() => openSetting("theme")} />
          <RowLink
            icon="notifications"
            label="Notification Settings"
            onPress={() => openSetting("notifications")}
          />
          <RowLink icon="headset" label="Help Center" onPress={() => openSetting("help")} />
          {isLoggedIn && (
            <>
              <RowLink icon="receipt" label="Order History" onPress={() => openSetting("orders")} />
              <RowLink
                icon="location"
                label="Address Book"
                value={addresses.length ? `${addresses.length} saved` : undefined}
                onPress={() => openSetting("address")}
              />
              <RowLink
                icon="heart"
                label="Wishlist"
                value={wishlistItems.length ? `${wishlistItems.length} saved` : undefined}
                onPress={() => openSetting("wishlist")}
              />
              <RowLink icon="gift" label="Coupons" onPress={() => openSetting("coupons")} />
              <RowLink
                icon="card"
                label="Saved Cards"
                value={cards.length ? `${cards.length} saved` : undefined}
                onPress={() => openSetting("cards")}
              />
            </>
          )}
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Text style={styles.sectionTitle}>Earn with ShopSphere</Text>
          <RowLink icon="storefront" label="Become a Seller" onPress={() => openSetting("seller")} />
        </View>

        <View style={[styles.section, { borderBottomWidth: 0 }]}>
          <Text style={styles.sectionTitle}>Business Portals</Text>
          <RowLink icon="briefcase" label="Vendor Portal" onPress={() => router.push("/vendor-login")} />
          <RowLink icon="shield-checkmark" label="Admin Portal" onPress={() => router.push("/(admin-auth)/login")} />
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headBand: { padding: spacing.lg, borderBottomWidth: 8, borderBottomColor: colors.bg },
  headTitle: { ...typography.h2, marginBottom: spacing.lg },
  loginBand: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  loginMsg: { fontSize: 14, color: "#333", flex: 1 },
  loginBtn: { backgroundColor: colors.blue, paddingVertical: 9, paddingHorizontal: 20, borderRadius: 5 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  userBand: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontWeight: "800", fontSize: 17 },
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  userName: { fontWeight: "700", fontSize: 15 },
  userEmail: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  editProfileLink: { fontSize: 12, color: colors.blue, fontWeight: "700", marginTop: 4 },
  logoutText: { color: colors.blue, fontWeight: "700", fontSize: 13 },
  section: { padding: spacing.lg, borderBottomWidth: 8, borderBottomColor: colors.bg },
  sectionTitle: { fontSize: 13, color: "#333", fontWeight: "700", marginBottom: spacing.md },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  quickCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  quickLabel: { fontSize: 14, fontWeight: "700", color: colors.ink },
  financeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  financeTitle: { fontWeight: "700", fontSize: 14 },
  financeSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  rowLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { fontSize: 14, color: "#222" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 12.5, color: colors.inkSoft },
});