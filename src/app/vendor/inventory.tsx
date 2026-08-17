import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { setStock, toggleAvailability, type VendorProduct } from "@/store/slices/vendorProductsSlice";
import ProductImage from "@/components/ProductImage";
import StatCard from "@/components/StatCard";

const VENDOR_COLOR = "#2c3e50";

function stockStatus(p: VendorProduct): { label: string; color: string; bg: string } {
  if (p.stock === 0) return { label: "Out of Stock", color: "#c0392b", bg: "#fdecea" };
  if (p.stock <= p.lowStockThreshold) return { label: "Low Stock", color: "#b8860b", bg: "#fff3cd" };
  return { label: "In Stock", color: colors.green, bg: "#e6f4ea" };
}

export default function VendorInventoryScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);
  const allProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const products = useMemo(
    () => allProducts.filter((p) => p.vendorId === vendor?.id),
    [allProducts, vendor?.id]
  );

  const summary = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalStock, lowStock, outOfStock };
  }, [products]);

  const adjustStock = (product: VendorProduct, delta: number) => {
    dispatch(setStock({ id: product.id, stock: product.stock + delta }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
      </View>

      <View style={styles.summaryRow}>
        <StatCard icon="layers" label="Total Stock" value={String(summary.totalStock)} accentColor={VENDOR_COLOR} />
        <StatCard icon="alert-circle" label="Low Stock" value={String(summary.lowStock)} accentColor="#b8860b" />
        <StatCard icon="close-circle" label="Out of Stock" value={String(summary.outOfStock)} accentColor="#c0392b" />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => {
          const status = stockStatus(item);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <ProductImage uri={item.images[0]} emoji="🛍️" size={48} emojiSize={22} borderRadius={radius.sm} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Stock quantity</Text>
                <View style={styles.stepper}>
                  <Pressable style={styles.stepBtn} onPress={() => adjustStock(item, -1)}>
                    <Ionicons name="remove" size={14} color={VENDOR_COLOR} />
                  </Pressable>
                  <Text style={styles.stockValue}>{item.stock}</Text>
                  <Pressable style={styles.stepBtn} onPress={() => adjustStock(item, 1)}>
                    <Ionicons name="add" size={14} color={VENDOR_COLOR} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.availRow}>
                <Text style={styles.availLabel}>Product Availability</Text>
                <Switch
                  value={item.available}
                  onValueChange={() => {
                    dispatch(toggleAvailability(item.id));
                  }}
                  trackColor={{ true: VENDOR_COLOR, false: "#ccc" }}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="layers-outline" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No products to manage yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  headerTitle: { ...typography.h3 },
  summaryRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md },
  cardTop: { flexDirection: "row", gap: spacing.md, alignItems: "center", marginBottom: spacing.md },
  title: { fontSize: 14, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stockLabel: { fontSize: 12.5, color: colors.ink },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: VENDOR_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  stockValue: { fontSize: 14, fontWeight: "700", color: colors.ink, minWidth: 24, textAlign: "center" },
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  availLabel: { fontSize: 12.5, color: colors.ink },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: spacing.md },
  emptyText: { fontSize: 13, color: colors.inkSoft },
});