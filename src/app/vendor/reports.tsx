import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { RootState } from "@/store/store";
import BarChart from "@/components/BarChart";

const VENDOR_COLOR = "#2c3e50";
type ReportTab = "Sales" | "Revenue" | "Product";

/** TODO: replace with a real API call once a vendor reports/analytics
 * endpoint exists. Static zero placeholder, not a mock-data generator. */
const EMPTY_VENDOR_STATS = {
  revenue: 0,
  orders: 0,
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

export default function VendorReportsScreen() {
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);
  const allProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const myProducts = useMemo(
    () => allProducts.filter((p) => p.vendorId === vendor?.id),
    [allProducts, vendor?.id]
  );
  const [tab, setTab] = useState<ReportTab>("Sales");
  const stats = vendor ? EMPTY_VENDOR_STATS : null;

  if (!vendor || !stats) return null;

  const totalUnits = stats.dailySales.reduce((s, d) => s + Math.round(d.value / 500), 0);
  const avgOrderValue = Math.round(stats.revenue / Math.max(1, stats.orders));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <View style={styles.tabRow}>
        {(["Sales", "Revenue", "Product"] as ReportTab[]).map((t) => {
          const isActive = t === tab;
          return (
            <Pressable
              key={t}
              style={[styles.tab, isActive && { borderColor: VENDOR_COLOR, backgroundColor: "#eef1f3" }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, isActive && { color: VENDOR_COLOR, fontWeight: "800" }]}>{t} Report</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        {tab === "Sales" && (
          <>
            <View style={styles.summaryRow}>
              <SummaryBox label="Units Sold (est.)" value={String(totalUnits)} />
              <SummaryBox label="Total Orders" value={String(stats.orders)} />
              <SummaryBox label="Pending Orders" value={String(stats.pendingOrders)} />
            </View>
            <BarChart title="Daily Sales (This Week)" data={stats.dailySales} color={VENDOR_COLOR} valueFormatter={formatINR} />
          </>
        )}

        {tab === "Revenue" && (
          <>
            <View style={styles.summaryRow}>
              <SummaryBox label="Total Revenue" value={formatINR(stats.revenue)} />
              <SummaryBox label="Avg Order Value" value={formatINR(avgOrderValue)} />
            </View>
            <BarChart title="Monthly Revenue" data={stats.monthlyRevenue} color="#16a085" valueFormatter={formatINR} />
          </>
        )}

        {tab === "Product" && (
          <>
            <View style={styles.summaryRow}>
              <SummaryBox label="Total Products" value={String(myProducts.length)} />
              <SummaryBox label="Active" value={String(myProducts.filter((p) => p.available).length)} />
              <SummaryBox label="Out of Stock" value={String(myProducts.filter((p) => p.stock === 0).length)} />
            </View>
            <BarChart title="Top Products (Units Sold)" data={stats.topProducts} color="#8e44ad" orientation="horizontal" />

            <Text style={styles.listTitle}>All Products</Text>
            <View style={styles.productListCard}>
              {myProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productTitle} numberOfLines={1}>{p.title}</Text>
                    <Text style={styles.productMeta}>
                      Stock: {p.stock} · {p.available ? "Active" : "Inactive"}
                    </Text>
                  </View>
                  <Text style={styles.productPrice}>₹{p.price.toLocaleString("en-IN")}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h2, fontSize: 18 },
  tabRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line },
  tabText: { fontSize: 11.5, color: colors.ink },
  summaryRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  summaryBox: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md, alignItems: "center" },
  summaryValue: { fontSize: 16, fontWeight: "800", color: colors.ink },
  summaryLabel: { fontSize: 10, color: colors.inkSoft, marginTop: 2, textAlign: "center" },
  listTitle: { ...typography.h3, fontSize: 13, marginTop: spacing.lg, marginBottom: spacing.sm },
  productListCard: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  productRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  productTitle: { fontSize: 12.5, fontWeight: "600", color: colors.ink },
  productMeta: { fontSize: 10.5, color: colors.inkSoft, marginTop: 2 },
  productPrice: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
});