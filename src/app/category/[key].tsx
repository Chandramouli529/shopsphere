import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import FiltersModal from "@/components/FiltersModal";
import { CATEGORIES } from "@/data/categories";
import { PRODUCTS_BY_CATEGORY, type Product } from "@/data/products";
import { TOP_BRANDS } from "@/data/topBrands";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { RootState } from "@/store/store";
import type { VendorProduct } from "@/store/slices/vendorProductsSlice";
import { applyFilters, sortProducts, countActiveFilters, EMPTY_FILTERS, type ActiveFilters } from "@/utils/filters";

/** Only real, admin-approved, available vendor products should ever be
 * visible to customers. */
function toCustomerProduct(vp: VendorProduct): Product {
  return {
    id: vp.id,
    title: vp.title,
    price: `₹${vp.price.toLocaleString("en-IN")}`,
    emoji: "📦",
    image: vp.images[0] ?? "",
    images: vp.images,
    attributes: vp.attributes,
  };
}

export default function CategoryProductsScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const theme = useAppTheme();

  const category = CATEGORIES.find((c) => c.key === key);
  const staticProducts = PRODUCTS_BY_CATEGORY[key ?? ""] ?? [];
  const vendorProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const vendorProductsForCategory = useMemo(
    () =>
      vendorProducts
        .filter((p) => p.category === key && p.approvalStatus === "approved" && p.available)
        .map(toCustomerProduct),
    [vendorProducts, key]
  );
  const allProducts = useMemo(
    () => [...staticProducts, ...vendorProductsForCategory],
    [staticProducts, vendorProductsForCategory]
  );

  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const availableBrands = useMemo(() => {
    const fromAttributes = allProducts
      .map((p) => p.attributes?.brandName)
      .filter((b): b is string => !!b);
    const fromTitleMatch = TOP_BRANDS.map((b) => b.name).filter((name) =>
      allProducts.some((p) => p.title.toLowerCase().includes(name.toLowerCase()))
    );
    return Array.from(new Set([...fromAttributes, ...fromTitleMatch])).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const filtered = applyFilters(allProducts, filters);
    return sortProducts(filtered, filters.sortBy);
  }, [allProducts, filters]);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{category?.label ?? "Products"}</Text>
        <Pressable onPress={() => router.push("/(tabs)/cart")} hitSlop={10}>
          <Ionicons name="cart-outline" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterChip, activeFilterCount > 0 && { borderColor: theme.primary, backgroundColor: "#f3f8ff" }]}
          onPress={() => setFiltersVisible(true)}
        >
          <Ionicons name="options-outline" size={15} color={activeFilterCount > 0 ? theme.primary : colors.ink} />
          <Text style={[styles.filterChipText, activeFilterCount > 0 && { color: theme.primary }]}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </Pressable>

        {activeFilterCount > 0 && (
          <Pressable style={styles.clearChip} onPress={() => setFilters(EMPTY_FILTERS)}>
            <Ionicons name="close" size={13} color="#c0392b" />
            <Text style={styles.clearChipText}>Clear all</Text>
          </Pressable>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {filters.priceBands.map((label) => (
            <View key={label} style={styles.activeChip}>
              <Text style={styles.activeChipText}>{label}</Text>
            </View>
          ))}
          {filters.minRating && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{filters.minRating}★ &amp; above</Text>
            </View>
          )}
          {filters.minDiscount && (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>{filters.minDiscount}% off+</Text>
            </View>
          )}
          {filters.brands.map((b) => (
            <View key={b} style={styles.activeChip}>
              <Text style={styles.activeChipText}>{b}</Text>
            </View>
          ))}
          {Object.values(filters.attributes).flat().map((v) => (
            <View key={v} style={styles.activeChip}>
              <Text style={styles.activeChipText}>{v}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cube-outline" size={40} color="#bbb" />
          <Text style={styles.emptyText}>
            {allProducts.length === 0 ? "No products in this category yet." : "No products match these filters."}
          </Text>
          {activeFilterCount > 0 && (
            <Pressable style={[styles.resetBtn, { backgroundColor: theme.primary }]} onPress={() => setFilters(EMPTY_FILTERS)}>
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm, justifyContent: "space-between" }}
          contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          renderItem={({ item }) => (
            <View style={styles.cell}>
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
        />
      )}

      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={setFilters}
        filters={filters}
        resultCount={applyFilters(allProducts, filters).length}
        availableBrands={availableBrands}
        products={allProducts}
      />
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
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  filterChipText: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  clearChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  clearChipText: { fontSize: 12, fontWeight: "700", color: "#c0392b" },
  activeChip: {
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginRight: spacing.sm,
  },
  activeChipText: { fontSize: 11.5, fontWeight: "600", color: colors.ink },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyText: { fontSize: 13, color: colors.inkSoft, textAlign: "center", paddingHorizontal: spacing.xl },
  resetBtn: { paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.sm },
  resetBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cell: { flex: 1, alignItems: "center" },
});