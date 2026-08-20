import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchAllVendorProducts, deleteProductRemote, type VendorProduct } from "@/store/slices/vendorProductsSlice";
import ProductImage from "@/components/ProductImage";

const VENDOR_COLOR = "#2c3e50";

function ApprovalBadge({ status }: { status: VendorProduct["approvalStatus"] }) {
  const map = {
    approved: { bg: "#e6f4ea", fg: colors.green, label: "Approved" },
    pending: { bg: "#fff3cd", fg: "#b8860b", label: "Pending Approval" },
    rejected: { bg: "#fdecea", fg: "#c0392b", label: "Rejected" },
  } as const;
  const s = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

export default function VendorProductsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);
  const allProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const fetchStatus = useSelector((state: RootState) => state.vendorProducts.fetchStatus);
  const products = useMemo(
    () => allProducts.filter((p) => p.vendorId === vendor?.id),
    [allProducts, vendor?.id]
  );

  useEffect(() => {
    if (vendor?.id) dispatch(fetchAllVendorProducts(vendor.id));
  }, [dispatch, vendor?.id]);

  const onDelete = (product: VendorProduct) => {
    Alert.alert("Delete Product", `Remove "${product.title}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await dispatch(deleteProductRemote({ id: product.id, category: product.category }));
          if (deleteProductRemote.rejected.match(result)) {
            Alert.alert("Failed", (result.payload as string) ?? "Could not delete this product.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products ({products.length})</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: VENDOR_COLOR }]} onPress={() => router.push("/vendor/product-form")}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Product</Text>
        </Pressable>
      </View>

      {fetchStatus === "loading" && products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={VENDOR_COLOR} />
          <Text style={styles.emptyText}>Loading your products…</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cube-outline" size={40} color="#bbb" />
          <Text style={styles.emptyText}>No products yet. Add your first one.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <ProductImage uri={item.images[0]} emoji="🛍️" size={56} emojiSize={24} borderRadius={radius.sm} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.price}>₹{item.price.toLocaleString("en-IN")}</Text>
                  <Text style={styles.stock}>
                    Stock: {item.stock} {item.variants.length > 0 ? `· ${item.variants.length} variant(s)` : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <ApprovalBadge status={item.approvalStatus} />
                {!item.available && (
                  <View style={[styles.badge, { backgroundColor: "#eee" }]}>
                    <Text style={[styles.badgeText, { color: "#777" }]}>Unavailable</Text>
                  </View>
                )}
                <View style={{ flex: 1 }} />
                <Pressable onPress={() => router.push({ pathname: "/vendor/product-form", params: { id: item.id } })} hitSlop={8}>
                  <Ionicons name="create-outline" size={19} color={VENDOR_COLOR} />
                </Pressable>
                <Pressable onPress={() => onDelete(item)} hitSlop={8} style={{ marginLeft: spacing.md }}>
                  <Ionicons name="trash-outline" size={19} color="#c0392b" />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
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
  headerTitle: { ...typography.h3 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyText: { fontSize: 13, color: colors.inkSoft },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md },
  cardTop: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  title: { fontSize: 14, fontWeight: "700", color: colors.ink },
  price: { fontSize: 13, fontWeight: "700", color: VENDOR_COLOR, marginTop: 2 },
  stock: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "700" },
});