import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { adminLogout } from "@/store/slices/adminAuthSlice";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";

const ADMIN_COLOR = "#6c2eb5";

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const totalUsers = useSelector((state: RootState) => state.users.users.length);
  const totalOrders = useSelector((state: RootState) => state.orders.list.length);
  const totalOrdersRevenue = useSelector((state: RootState) =>
    state.orders.list.reduce((sum, o) => sum + o.grandTotal, 0)
  );
  // Real vendor count — reflects vendors actually created through the
  // real POST /vendor/create flow, not local mock data.
  const totalVendors = useSelector((state: RootState) => state.vendors.vendors.length);
  // TODO: replace with a real API call (e.g. GET /admin/products/count)
  // once that endpoint exists. Static placeholder, not mock data.
  const totalProducts = 0;
  // TODO: replace with a real API call (e.g. GET /admin/analytics) once
  // that endpoint exists. Static empty placeholder, not mock data.
  const trends = {
    salesAnalytics: [] as { label: string; value: number }[],
    revenueAnalytics: [] as { label: string; value: number }[],
    customerGrowth: [] as { label: string; value: number }[],
    vendorGrowth: [] as { label: string; value: number }[],
  };

  const onLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of the admin portal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await dispatch(adminLogout());
          router.replace("/(admin-auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subGreeting}>ShopSphere Platform Overview</Text>
        </View>
        <Pressable onPress={onLogout} hitSlop={10}>
          <Ionicons name="log-out-outline" size={24} color={ADMIN_COLOR} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          <StatCard icon="people" label="Total Users" value={String(totalUsers)} accentColor={ADMIN_COLOR} />
          <StatCard icon="storefront" label="Total Vendors" value={String(totalVendors)} accentColor="#2874f0" />
          <StatCard icon="cash" label="Total Revenue" value={formatINR(totalOrdersRevenue)} accentColor="#16a085" />
          <StatCard icon="receipt" label="Total Orders" value={String(totalOrders)} accentColor="#e67e22" />
          <StatCard icon="cube" label="Total Products" value={String(totalProducts)} accentColor="#c0392b" />
        </View>

        <Text style={styles.sectionTitle}>Charts</Text>
        <View style={{ gap: spacing.md }}>
          <BarChart title="Sales Analytics" data={trends.salesAnalytics} color={ADMIN_COLOR} valueFormatter={formatINR} />
          <BarChart title="Revenue Analytics" data={trends.revenueAnalytics} color="#16a085" valueFormatter={formatINR} />
          <BarChart title="Customer Growth" data={trends.customerGrowth} color="#2874f0" />
          <BarChart title="Vendor Growth" data={trends.vendorGrowth} color="#e67e22" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  greeting: { fontSize: 16, fontWeight: "800", color: colors.ink },
  subGreeting: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  sectionTitle: { ...typography.h3, fontSize: 14, marginBottom: spacing.md, marginTop: spacing.sm },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
});
