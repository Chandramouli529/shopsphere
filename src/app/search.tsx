import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "@/components/ProductCard";
import FiltersModal from "@/components/FiltersModal";
import { searchProducts, getAllProductsFlat } from "@/data/products";
import { TRENDING_SEARCHES } from "@/data/trending";
import { TOP_BRANDS } from "@/data/topBrands";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import { applyFilters, countActiveFilters, EMPTY_FILTERS, type ActiveFilters } from "@/utils/filters";

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; imageUri?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const [query, setQuery] = useState(params.q ?? "");

  const isImageSearch = !!params.imageUri;

  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // For a "visual search" (no real image recognition backend), we surface a
  // curated set of currently-popular items and are upfront that it's a demo.
  const imageSearchResults = useMemo(() => getAllProductsFlat().slice(0, 8), []);
  const textResults = useMemo(() => searchProducts(query), [query]);
  const rawResults = isImageSearch ? imageSearchResults : textResults;
  const results = useMemo(() => applyFilters(rawResults, filters), [rawResults, filters]);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={[styles.searchBox, { borderColor: theme.primary }]}>
          <Ionicons name="search" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products, brands..."
            value={query}
            onChangeText={setQuery}
            autoFocus={!isImageSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#aaa" />
            </Pressable>
          )}
        </View>
        {!isImageSearch && query.trim().length > 0 && (
          <Pressable
            style={[styles.filterIconBtn, activeFilterCount > 0 && { borderColor: theme.primary, backgroundColor: "#f3f8ff" }]}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? theme.primary : colors.ink} />
            {activeFilterCount > 0 && (
              <View style={[styles.filterCountDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.filterCountDotText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      {isImageSearch && params.imageUri && (
        <View style={styles.imageSearchBanner}>
          <Image source={{ uri: params.imageUri }} style={styles.imageThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.imageSearchTitle}>Visual Search (Demo)</Text>
            <Text style={styles.imageSearchSub}>
              Showing popular picks — full image-matching isn't wired up to a real backend yet.
            </Text>
          </View>
        </View>
      )}

      {!isImageSearch && query.trim().length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={styles.sectionTitle}>Trending Searches</Text>
          <View style={styles.chipWrap}>
            {TRENDING_SEARCHES.map((term) => (
              <Pressable
                key={term}
                style={[styles.chip, { borderColor: theme.primary }]}
                onPress={() => setQuery(term)}
              >
                <Ionicons name="trending-up" size={13} color={theme.primary} />
                <Text style={[styles.chipText, { color: theme.primary }]}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm, justifyContent: "space-between" }}
          contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
          ListHeaderComponent={
            !isImageSearch ? (
              <Text style={styles.resultsCount}>
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={40} color="#bbb" />
              <Text style={styles.emptyText}>No products found. Try a different search.</Text>
            </View>
          }
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
        resultCount={applyFilters(rawResults, filters).length}
        availableBrands={TOP_BRANDS.map((b) => b.name)}
        showCategoryFilter
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountDot: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterCountDotText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  imageSearchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  imageThumb: { width: 56, height: 56, borderRadius: radius.sm },
  imageSearchTitle: { fontWeight: "700", fontSize: 13, color: colors.ink },
  imageSearchSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2, lineHeight: 16 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipText: { fontSize: 12.5, fontWeight: "600" },
  resultsCount: { fontSize: 12.5, color: colors.inkSoft, marginBottom: spacing.md },
  cell: { flex: 1, alignItems: "center" },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: spacing.sm },
  emptyText: { fontSize: 13, color: colors.inkSoft, textAlign: "center", paddingHorizontal: spacing.xl },
});
