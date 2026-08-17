import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import { CATEGORIES } from "@/data/categories";
import type { Product } from "@/data/products";
import {
  PRICE_BANDS,
  RATING_OPTIONS,
  DISCOUNT_OPTIONS,
  SORT_OPTIONS,
  EMPTY_FILTERS,
  getAvailableAttributeValues,
  getFilterableAttributeKeys,
  attributeLabel,
  type ActiveFilters,
} from "@/utils/filters";

type FilterType = "Sort" | "Price" | "Rating" | "Brand" | "Category" | "Discount" | "Availability" | string;

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ActiveFilters) => void;
  filters: ActiveFilters;
  resultCount: number;
  availableBrands: string[];
  showCategoryFilter?: boolean;
  /** Product list this filter panel is scoped to — used to compute which
   * Gender/Fabric/Color/Usage/Size values actually exist to filter by
   * (only shown as tabs when at least one product has that data, so a
   * non-fashion category doesn't show empty fashion-only filter types). */
  products?: Product[];
}

export default function FiltersModal({
  visible,
  onClose,
  onApply,
  filters,
  resultCount,
  availableBrands,
  showCategoryFilter,
  products = [],
}: Props) {
  const theme = useAppTheme();
  const [draft, setDraft] = useState<ActiveFilters>(filters);
  const [activeType, setActiveType] = useState<FilterType>("Sort");
  const [brandSearch, setBrandSearch] = useState("");

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const attributeValueMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    getFilterableAttributeKeys(products).forEach((key) => {
      const values = getAvailableAttributeValues(products, key);
      if (values.length > 0) map[key] = values;
    });
    return map;
  }, [products]);

  const attributeKeys = Object.keys(attributeValueMap);

  const filterTypes: FilterType[] = [
    "Sort",
    "Brand",
    ...attributeKeys,
    "Price",
    "Rating",
    ...(showCategoryFilter ? (["Category"] as FilterType[]) : []),
    "Discount",
    "Availability",
  ];

  const toggleInList = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const filteredBrands = useMemo(
    () => availableBrands.filter((b) => b.toLowerCase().includes(brandSearch.trim().toLowerCase())),
    [availableBrands, brandSearch]
  );

  const badgeFor = (type: FilterType): number => {
    switch (type) {
      case "Sort":
        return draft.sortBy ? 1 : 0;
      case "Price":
        return draft.priceBands.length;
      case "Rating":
        return draft.minRating ? 1 : 0;
      case "Brand":
        return draft.brands.length;
      case "Category":
        return draft.categories.length;
      case "Discount":
        return draft.minDiscount ? 1 : 0;
      case "Availability":
        return draft.inStockOnly ? 1 : 0;
      default:
        return draft.attributes[type]?.length ?? 0;
    }
  };

  const labelFor = (type: FilterType): string =>
    attributeKeys.includes(type) ? attributeLabel(type) : type;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: 50 }}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Filters</Text>
          <Pressable onPress={() => setDraft(EMPTY_FILTERS)} hitSlop={10}>
            <Text style={[styles.clearText, { color: theme.primary }]}>Clear Filters</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Left side: filter type list */}
          <ScrollView style={styles.sidebar}>
            {filterTypes.map((type) => {
              const isActive = type === activeType;
              const count = badgeFor(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.sideItem, isActive && [styles.sideItemActive, { borderLeftColor: theme.primary }]]}
                  onPress={() => setActiveType(type)}
                >
                  <Text style={[styles.sideItemText, isActive && { color: theme.primary, fontWeight: "700" }]}>
                    {labelFor(type)}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.countDot, { backgroundColor: theme.primary }]}>
                      <Text style={styles.countDotText}>{count}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Right side: options for the selected filter type */}
          <ScrollView style={styles.optionsPane} contentContainerStyle={{ padding: spacing.lg }}>
            {activeType === "Sort" && (
              <>
                <Text style={styles.optionsHint}>Sort by</Text>
                {SORT_OPTIONS.map((opt) => (
                  <OptionRow
                    key={opt.value}
                    label={opt.label}
                    checked={draft.sortBy === opt.value}
                    accentColor={theme.primary}
                    onPress={() => setDraft((d) => ({ ...d, sortBy: d.sortBy === opt.value ? null : opt.value }))}
                  />
                ))}
              </>
            )}

            {activeType === "Price" && (
              <>
                <Text style={styles.optionsHint}>Select a price range</Text>
                {PRICE_BANDS.map((band) => (
                  <OptionRow
                    key={band.label}
                    label={band.label}
                    checked={draft.priceBands.includes(band.label)}
                    accentColor={theme.primary}
                    onPress={() => setDraft((d) => ({ ...d, priceBands: toggleInList(d.priceBands, band.label) }))}
                  />
                ))}
              </>
            )}

            {activeType === "Rating" && (
              <>
                <Text style={styles.optionsHint}>Minimum customer rating</Text>
                {RATING_OPTIONS.map((opt) => (
                  <OptionRow
                    key={opt.label}
                    label={opt.label}
                    checked={draft.minRating === opt.min}
                    accentColor={theme.primary}
                    onPress={() => setDraft((d) => ({ ...d, minRating: d.minRating === opt.min ? null : opt.min }))}
                  />
                ))}
              </>
            )}

            {activeType === "Brand" && (
              <>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={15} color="#888" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search brands"
                    value={brandSearch}
                    onChangeText={setBrandSearch}
                    autoCapitalize="none"
                  />
                  {brandSearch.length > 0 && (
                    <Pressable onPress={() => setBrandSearch("")} hitSlop={8}>
                      <Ionicons name="close-circle" size={15} color="#aaa" />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.optionsHint}>All Brands</Text>
                {filteredBrands.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {availableBrands.length === 0 ? "No brand data for this category." : "No brands match your search."}
                  </Text>
                ) : (
                  filteredBrands.map((brand) => (
                    <OptionRow
                      key={brand}
                      label={brand}
                      checked={draft.brands.includes(brand)}
                      accentColor={theme.primary}
                      onPress={() => setDraft((d) => ({ ...d, brands: toggleInList(d.brands, brand) }))}
                    />
                  ))
                )}
              </>
            )}

            {attributeKeys.includes(activeType) && (
              <>
                <Text style={styles.optionsHint}>{attributeLabel(activeType)}</Text>
                {(attributeValueMap[activeType] ?? []).map((value) => (
                  <OptionRow
                    key={value}
                    label={value}
                    checked={(draft.attributes[activeType] ?? []).includes(value)}
                    accentColor={theme.primary}
                    onPress={() =>
                      setDraft((d) => ({
                        ...d,
                        attributes: {
                          ...d.attributes,
                          [activeType]: toggleInList(d.attributes[activeType] ?? [], value),
                        },
                      }))
                    }
                  />
                ))}
              </>
            )}

            {activeType === "Category" && (
              <>
                <Text style={styles.optionsHint}>Select one or more categories</Text>
                {CATEGORIES.filter((c) => c.key !== "foryou").map((cat) => (
                  <OptionRow
                    key={cat.key}
                    label={cat.label}
                    checked={draft.categories.includes(cat.key)}
                    accentColor={theme.primary}
                    onPress={() => setDraft((d) => ({ ...d, categories: toggleInList(d.categories, cat.key) }))}
                  />
                ))}
              </>
            )}

            {activeType === "Discount" && (
              <>
                <Text style={styles.optionsHint}>Minimum discount</Text>
                {DISCOUNT_OPTIONS.map((opt) => (
                  <OptionRow
                    key={opt.label}
                    label={opt.label}
                    checked={draft.minDiscount === opt.min}
                    accentColor={theme.primary}
                    onPress={() =>
                      setDraft((d) => ({ ...d, minDiscount: d.minDiscount === opt.min ? null : opt.min }))
                    }
                  />
                ))}
              </>
            )}

            {activeType === "Availability" && (
              <>
                <Text style={styles.optionsHint}>Availability</Text>
                <OptionRow
                  label="In Stock Only"
                  checked={draft.inStockOnly}
                  accentColor={theme.primary}
                  onPress={() => setDraft((d) => ({ ...d, inStockOnly: !d.inStockOnly }))}
                />
              </>
            )}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.resultCount}>{resultCount} products found</Text>
          <Pressable
            style={[styles.applyBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({
  label,
  checked,
  onPress,
  accentColor,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  accentColor: string;
}) {
  return (
    <Pressable style={styles.optionRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && { backgroundColor: accentColor, borderColor: accentColor }]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h3 },
  clearText: { fontSize: 13, fontWeight: "700" },
  body: { flex: 1, flexDirection: "row" },
  sidebar: { width: "25%", backgroundColor: "#f4f4f4" },
  sideItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  sideItemActive: { backgroundColor: colors.white },
  sideItemText: { fontSize: 12, color: "#555", fontWeight: "600" },
  countDot: { minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  countDotText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  optionsPane: { flex: 1 },
  optionsHint: { fontSize: 12, color: colors.inkSoft, marginBottom: spacing.lg, fontWeight: "600" },
  optionRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { fontSize: 14, color: colors.ink, flex: 1 },
  emptyText: { fontSize: 12.5, color: colors.inkSoft },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink, padding: 0 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  resultCount: { fontSize: 13, fontWeight: "700", color: colors.ink },
  applyBtn: { paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radius.sm },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});