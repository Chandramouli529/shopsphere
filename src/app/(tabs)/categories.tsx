import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/data/categories";
import { getSpotlightTiles } from "@/data/spotlightTiles";
import { PRODUCTS_BY_CATEGORY, type Product } from "@/data/products";
import type { RootState } from "@/store/store";
import type { VendorProduct } from "@/store/slices/vendorProductsSlice";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import { useImageSearch } from "@/hooks/useImageSearch";

const POPULAR_STORE = [
  { key: "live", label: "Live now", emoji: "🎉", bg: "#fff4cc" },
  { key: "value365", label: "Value 365", emoji: "💥", bg: "#ffe1e1" },
  { key: "rakhi", label: "Celebrate Rakhi", emoji: "🪁", bg: "#fff3cf" },
  { key: "paylater", label: "Pay Later", emoji: "💰", bg: "#fff6d9" },
  { key: "minutes", label: "Minutes", emoji: "🛵", bg: "#ffe4ec" },
  { key: "buses", label: "Buses", emoji: "🚌", bg: "#e7ddff" },
];

const LAUNCHES = [
  { key: "poco", label: "POCO M8", emoji: "📱", bg: "#ffe6d6", badge: "SALE IS LIVE", badgeColor: colors.green },
  { key: "f70", label: "Galaxy F70", emoji: "📱", bg: "#d9f2ea", badge: "NOTIFY ME", badgeColor: "#0f7a86" },
  { key: "virat", label: "Lava Virat V1", emoji: "📱", bg: "#f5f0ea", badge: "NOTIFY ME", badgeColor: "#0f7a86" },
  { key: "hyperboost", label: "HYPERBOOST", emoji: "👟", bg: "#f0f0f0", badge: "NEW SERIES", badgeColor: "#7048b0" },
  { key: "techlife", label: "TechLife", emoji: "🔋", bg: "#e6e6e6", badge: "BUY NOW", badgeColor: "#7048b0" },
  { key: "asuspad", label: "ASUS Pad", emoji: "📟", bg: "#f5f5f5", badge: "BUY NOW", badgeColor: "#7048b0" },
];

/** Only real, admin-approved, available vendor products should ever be
 * visible to customers — never a product still pending approval, and
 * never one a vendor has toggled off from Inventory. */
function toCustomerProduct(vp: VendorProduct): Product {
  return {
    id: vp.id,
    title: vp.title,
    price: `₹${vp.price.toLocaleString("en-IN")}`,
    emoji: "📦",
    image: vp.images[0] ?? "",
    images: vp.images,
  };
}

export default function CategoriesScreen() {
  // Home's "See More" links push here with ?cat=<key> so the right
  // category is preselected in the sidebar on arrival.
  const { cat } = useLocalSearchParams<{ cat?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const onCameraSearch = useImageSearch();
  const [active, setActive] = useState("foryou");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (cat && CATEGORIES.some((c) => c.key === cat)) {
      setActive(cat);
    }
  }, [cat]);

  const vendorProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const activeVendorProducts = vendorProducts
    .filter((p) => p.category === active && p.approvalStatus === "approved" && p.available)
    .map(toCustomerProduct);
  const activeProducts = [...(PRODUCTS_BY_CATEGORY[active] ?? []), ...activeVendorProducts];
  const activeCategory = CATEGORIES.find((c) => c.key === active);
  const activeLabel = activeCategory?.label ?? "For You";
  const spotlightTiles = active === "foryou" ? [] : getSpotlightTiles(active);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => router.push("/search")} hitSlop={8}>
            <Ionicons name="search" size={20} color="#333" />
          </Pressable>
          <Pressable onPress={onCameraSearch} hitSlop={8}>
            <Ionicons name="camera" size={20} color="#333" />
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/cart")} hitSlop={8} style={styles.cartIconWrap}>
            <Ionicons name="cart" size={20} color="#333" />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {/* One side: categories */}
        <FlatList
          style={styles.sidebar}
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = active === item.key;
            return (
              <Pressable
                style={[styles.sideItem, isActive && { backgroundColor: colors.white, borderLeftColor: theme.primary }]}
                onPress={() => setActive(item.key)}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: item.avatarBg },
                    isActive && { borderWidth: 2, borderColor: theme.primary },
                  ]}
                >
                  <Ionicons name={item.icon} size={22} color={isActive ? theme.primary : "#555"} />
                </View>
                <Text style={[styles.sideLabel, isActive && { color: theme.primary, fontWeight: "700" as const }]} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Other side: products for the selected category */}
        {active === "foryou" ? (
          <FlatList
            style={styles.main}
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <>
                <Text style={styles.sectionTitle}>Popular Store</Text>
                <View style={styles.grid}>
                  {POPULAR_STORE.map((item) => (
                    <View key={item.key} style={styles.gridCell}>
                      <View style={[styles.gridBox, { backgroundColor: item.bg }]}>
                        <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                      </View>
                      <Text style={styles.gridLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>New &amp; Upcoming Launches</Text>
                <View style={styles.grid}>
                  {LAUNCHES.map((item) => (
                    <View key={item.key} style={styles.gridCell}>
                      <View style={[styles.gridBox, { backgroundColor: item.bg }]}>
                        <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                      <Text style={styles.gridLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            }
            contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }}
          />
        ) : (
          // FlatList grid of every product in the selected category, with a
          // "In the Spotlight" promo grid + View All above it.
          <FlatList
            ref={listRef}
            style={styles.main}
            data={activeProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            key={active} // force re-layout when switching column data per category
            columnWrapperStyle={{ gap: spacing.md, justifyContent: "space-between" }}
            contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl }}
            ListHeaderComponent={
              <>
                <Text style={styles.sectionTitle}>In the Spotlight</Text>
                <View style={styles.grid}>
                  {spotlightTiles.map((tile, idx) => (
                    <View key={`${tile.label}-${idx}`} style={styles.gridCell}>
                      <View style={[styles.gridBox, { backgroundColor: tile.bg }]}>
                        <Text style={{ fontSize: 26 }}>{tile.emoji}</Text>
                      </View>
                      {tile.badge && (
                        <View style={[styles.badge, { backgroundColor: colors.green }]}>
                          <Text style={styles.badgeText}>{tile.badge}</Text>
                        </View>
                      )}
                      <Text style={styles.gridLabel}>{tile.label}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={styles.viewAllWrap}
                  onPress={() => listRef.current?.scrollToOffset({ offset: 9999, animated: true })}
                >
                  <View style={styles.viewAllCircle}>
                    <Ionicons name="chevron-down" size={26} color={theme.primary} />
                  </View>
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                </Pressable>

                <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>{activeLabel}</Text>
              </>
            }
            renderItem={({ item }) => (
              <View style={styles.productGridCell}>
                <ProductCard
                  id={item.id}
                  emoji={item.emoji}
                  image={item.image}
                  title={item.title}
                  subtitle={item.price}
                  size="lg"
                  onPress={() => router.push(`/product/${item.id}`)}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.xl }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h2, flex: 1 },
  headerIcons: { flexDirection: "row", gap: 16 },
  cartIconWrap: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  body: { flex: 1, flexDirection: "row" },
  sidebar: { width: "25%", backgroundColor: "#f4f4f4" },
  sideItem: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  sideItemActive: { backgroundColor: colors.white, borderLeftColor: colors.blue },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActive: { borderWidth: 2, borderColor: colors.blue },
  sideLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#555",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 13,
  },
  sideLabelActive: { color: colors.blue, fontWeight: "700" },
  main: { width: "75%", paddingHorizontal: spacing.md },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: spacing.xl },
  gridCell: { width: "29%", alignItems: "center" },
  gridBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  gridLabel: { fontSize: 11, fontWeight: "600", color: "#333", marginTop: 6, textAlign: "center" },
  badge: { marginTop: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  badgeText: { fontSize: 8.5, fontWeight: "800", color: "#fff" },
  viewAllWrap: { alignItems: "center", marginBottom: spacing.lg },
  viewAllCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF4CC",
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllText: { fontSize: 13, fontWeight: "700", marginTop: 8 },
  productGridCell: { flex: 1, alignItems: "center" },
});