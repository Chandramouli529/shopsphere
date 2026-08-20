import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { vendorLogout } from "@/store/slices/vendorAuthSlice";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";

const VENDOR_COLOR = "#2c3e50";

/** TODO: replace with a real API call (e.g. GET /vendor/:id/stats) once
 * that endpoint exists. No mock data generation happens here anymore —
 * this is a static placeholder shape, not a function pretending to
 * compute real numbers. */
const EMPTY_VENDOR_STATS = {
  revenue: 0,
  orders: 0,
  customers: 0,
  products: 0,
  pendingOrders: 0,
  dailySales: [] as { label: string; value: number }[],
  monthlyRevenue: [] as { label: string; value: number }[],
  topProducts: [] as { label: string; value: number }[],
};

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export default function VendorDashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);

  const stats = vendor ? EMPTY_VENDOR_STATS : null;

  const onLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of the vendor portal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await dispatch(vendorLogout());
          router.replace("/vendor-login");
        },
      },
    ]);
  };

  if (!vendor || !stats) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{vendor.vendorName || vendor.businessName || "Vendor"}</Text>
          <Text style={styles.subGreeting}>{vendor.email || "No email on file"}</Text>
          <Text style={styles.subGreeting}>{vendor.category || "Business type not set"}</Text>
        </View>
        <Pressable onPress={onLogout} hitSlop={10}>
          <Ionicons name="log-out-outline" size={24} color={VENDOR_COLOR} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          <StatCard icon="cash" label="Revenue" value={formatINR(stats.revenue)} accentColor={VENDOR_COLOR} index={0} />
          <StatCard icon="receipt" label="Orders" value={String(stats.orders)} accentColor="#2874f0" index={1} />
          <StatCard icon="people" label="Customers" value={String(stats.customers)} accentColor="#8e44ad" index={2} />
          <StatCard icon="cube" label="Products" value={String(stats.products)} accentColor="#16a085" index={3} />
          <StatCard
            icon="time"
            label="Pending Orders"
            value={String(stats.pendingOrders)}
            accentColor="#e67e22"
            trend={stats.pendingOrders > 10 ? "Needs attention" : undefined}
            trendUp={false}
            index={4}
          />
        </View>

        <Text style={styles.sectionTitle}>Charts</Text>
        <View style={{ gap: spacing.md }}>
          <BarChart title="Daily Sales (This Week)" data={stats.dailySales} color={VENDOR_COLOR} valueFormatter={formatINR} />
          <BarChart title="Monthly Revenue" data={stats.monthlyRevenue} color="#2874f0" valueFormatter={formatINR} />
          <BarChart
            title="Top Products (Units Sold)"
            data={stats.topProducts}
            color="#16a085"
            orientation="horizontal"
          />
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