import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryPill from "@/components/CategoryPill";
import HeroSlider from "@/components/HeroSlider";
import FlashSaleSection from "@/components/FlashSaleSection";
import DealOfTheDay from "@/components/DealOfTheDay";
import TopBrandsRow from "@/components/TopBrandsRow";
import ProductSection from "@/components/ProductSection";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, PRODUCT_CATEGORIES, type CategoryDef } from "@/data/categories";
import { PRODUCTS_BY_CATEGORY, getAllProductsFlat, type SearchableProduct } from "@/data/products";
import { SUBCATEGORIES_BY_CATEGORY } from "@/data/subcategories";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import { useImageSearch } from "@/hooks/useImageSearch";
import { deriveRating } from "@/utils/rating";
import { deriveDiscount } from "@/utils/discount";
import { parsePrice } from "@/utils/price";
import type { RootState } from "@/store/store";
import type { VendorProduct } from "@/store/slices/vendorProductsSlice";

// Alternate two background tints across category sections so they're easy
// to tell apart.
const SECTION_BACKGROUNDS = ["#FFF8E1", "#e9f9ec"];

function toSearchableProduct(vp: VendorProduct): SearchableProduct {
  return {
    id: vp.id,
    title: vp.title,
    price: `₹${vp.price.toLocaleString("en-IN")}`,
    emoji: "📦",
    image: vp.images[0] ?? "",
    images: vp.images,
    attributes: vp.attributes,
    categoryKey: vp.category,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const onCameraSearch = useImageSearch();

  const vendorProducts = useSelector((state: RootState) => state.vendorProducts.products);
  const vendorSearchableProducts = useMemo(
    () =>
      vendorProducts
        .filter((p) => p.approvalStatus === "approved" && p.available)
        .map(toSearchableProduct),
    [vendorProducts]
  );

  // Full catalogue (static + real vendor products), used to drive the
  // "Suggested For You" grid. This is what FlatList virtualizes — only
  // rows near the viewport actually render, so scrolling stays smooth
  // regardless of catalogue size.
  const SUGGESTED_PRODUCTS = useMemo(
    () => [...getAllProductsFlat(), ...vendorSearchableProducts],
    [vendorSearchableProducts]
  );

  // "Trending Now" — highest-rated products across the catalogue.
  const TRENDING_NOW = useMemo(
    () =>
      [...SUGGESTED_PRODUCTS]
        .sort((a, b) => deriveRating(b.id).rating - deriveRating(a.id).rating)
        .slice(0, 10),
    [SUGGESTED_PRODUCTS]
  );

  // "Featured Products" — biggest discounts across the catalogue.
  const FEATURED_PRODUCTS = useMemo(
    () =>
      [...SUGGESTED_PRODUCTS]
        .sort((a, b) => {
          const discA = deriveDiscount(a.id, parsePrice(a.price)).discountPercent;
          const discB = deriveDiscount(b.id, parsePrice(b.price)).discountPercent;
          return discB - discA;
        })
        .slice(0, 10),
    [SUGGESTED_PRODUCTS]
  );

  // "Recently Added" — real vendor products first (newest createdAt),
  // then the static catalogue's tail as filler.
  const RECENTLY_ADDED = useMemo(() => {
    const newestVendorFirst = [...vendorSearchableProducts].reverse();
    const staticTail = getAllProductsFlat().slice(-10).reverse();
    return [...newestVendorFirst, ...staticTail].slice(0, 10);
  }, [vendorSearchableProducts]);

  // "Deal of the Day" — rotates once per calendar day (deterministic by
  // day of year, so it's stable within a day but changes daily). null
  // when the catalogue is empty rather than crashing on x % 0.
  const DEAL_OF_THE_DAY = useMemo(() => {
    if (SUGGESTED_PRODUCTS.length === 0) return null;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return SUGGESTED_PRODUCTS[dayOfYear % SUGGESTED_PRODUCTS.length];
  }, [SUGGESTED_PRODUCTS]);


  // "foryou" shows the full default Home; any other key shows that
  // category's subcategory tiles + products instead, without navigating
  // away — matches the reference app's in-place category tabs.
  const [activeCategory, setActiveCategory] = useState("foryou");

  const { addresses, currentAddressId } = useSelector((state: RootState) => state.settings);
  const currentAddress = addresses.find((a) => a.id === currentAddressId);

  const goToCategory = useCallback(
    (categoryKey: string) => {
      router.push(`/category/${categoryKey}`);
    },
    [router]
  );

  const goToProduct = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
    },
    [router]
  );

  const goToSubcategorySearch = useCallback(
    (searchTerm: string) => {
      router.push({ pathname: "/search", params: { q: searchTerm } });
    },
    [router]
  );

  const activeCategoryLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label ?? "";
  const activeSubcategories = SUBCATEGORIES_BY_CATEGORY[activeCategory] ?? [];
  const activeCategoryProducts = useMemo(
    () => [...(PRODUCTS_BY_CATEGORY[activeCategory] ?? []), ...vendorSearchableProducts.filter((p) => p.categoryKey === activeCategory)],
    [activeCategory, vendorSearchableProducts]
  );

  const ListHeader = (
    <>
      {/* App icon / brand row — scrolls away with the rest of the content,
          unlike the search bar + category tabs below which stay pinned. */}
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: theme.secondary }]}>
          <Ionicons name="flash" size={14} color={theme.primary} />
          <Text style={[styles.pillTextFk, { color: theme.primary }]}>ShopSphere</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="time" size={14} color={colors.ink} />
          <Text style={styles.pillText}>Minutes</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="airplane" size={14} color={colors.ink} />
          <Text style={styles.pillText}>Travel</Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="pricetag" size={14} color={colors.ink} />
          <Text style={styles.pillText}>Value 365</Text>
        </View>
      </View>

      {/* Location bar — also scrolls away, reflects the user's saved
          delivery address */}
      <Pressable style={styles.locRow} onPress={() => router.push("/settings/address")}>
        <Ionicons name="location" size={14} color={colors.ink} />
        {currentAddress ? (
          <Text style={styles.locText} numberOfLines={1}>
            Deliver to {currentAddress.name} · {currentAddress.line1}, {currentAddress.city}
          </Text>
        ) : (
          <Text style={styles.locText} numberOfLines={1}>
            Add a delivery address
          </Text>
        )}
        <Ionicons name="chevron-down" size={14} color={colors.ink} />
      </Pressable>

      {/* 30-minute delivery banner */}
      <Pressable style={[styles.deliveryBanner, { backgroundColor: theme.primary }]}>
        <Ionicons name="flash" size={15} color={theme.secondary} />
        <Text style={styles.deliveryBannerText}>Get it delivered in 30 minutes</Text>
        <Ionicons name="chevron-forward" size={14} color="#fff" style={{ marginLeft: "auto" }} />
      </Pressable>

      {activeCategory === "foryou" ? (
        <>
          <View style={{ paddingTop: spacing.sm }}>
            <HeroSlider />
          </View>

          {DEAL_OF_THE_DAY && (
            <View style={{ paddingTop: spacing.lg }}>
              <DealOfTheDay product={DEAL_OF_THE_DAY} onPress={() => goToProduct(DEAL_OF_THE_DAY.id)} />
            </View>
          )}

          <View style={{ paddingTop: spacing.sm }}>
            <FlashSaleSection onPressProduct={goToProduct} />
          </View>

          <View style={{ paddingTop: spacing.lg }}>
            <TopBrandsRow onPressBrand={(name) => goToSubcategorySearch(name)} />
          </View>

          <ProductSection
            title="Trending Now"
            data={TRENDING_NOW}
            backgroundColor="#FFF3E0"
            onSeeMore={() => router.push({ pathname: "/search", params: { q: "" } })}
            onPressProduct={(product) => goToProduct(product.id)}
          />

          <ProductSection
            title="Featured Products"
            data={FEATURED_PRODUCTS}
            backgroundColor="#E8F5E9"
            onSeeMore={() => router.push({ pathname: "/search", params: { q: "" } })}
            onPressProduct={(product) => goToProduct(product.id)}
          />

          <ProductSection
            title="Recently Added"
            data={RECENTLY_ADDED}
            backgroundColor="#EDE7F6"
            onSeeMore={() => router.push({ pathname: "/search", params: { q: "" } })}
            onPressProduct={(product) => goToProduct(product.id)}
          />

          {/* Category rows — only 11 of them, so rendering them directly
              here (rather than as the outer FlatList's data) is cheap. */}
          {PRODUCT_CATEGORIES.map((item: CategoryDef, index: number) => (
            <View key={item.key} style={{ paddingTop: index === 0 ? spacing.lg : 0 }}>
              <ProductSection
                title={item.label}
                data={PRODUCTS_BY_CATEGORY[item.key] ?? []}
                backgroundColor={SECTION_BACKGROUNDS[index % SECTION_BACKGROUNDS.length]}
                onSeeMore={() => goToCategory(item.key)}
                onPressProduct={(product) => goToProduct(product.id)}
              />
            </View>
          ))}

          <Text style={styles.suggestedTitle}>Suggested For You</Text>
        </>
      ) : (
        <>
          {/* A category tab (other than For You) is selected — show its
              subcategories to browse, then its products, instead of the
              default Home feed. */}
          {activeSubcategories.length > 0 && (
            <View style={{ paddingTop: spacing.lg, paddingHorizontal: spacing.md }}>
              <Text style={styles.sectionTitle}>Shop {activeCategoryLabel} by Category</Text>
              <View style={styles.subGrid}>
                {activeSubcategories.map((sub) => (
                  <Pressable
                    key={sub.label}
                    style={styles.subTile}
                    onPress={() => goToSubcategorySearch(sub.searchTerm)}
                  >
                    <View style={styles.subEmojiBox}>
                      <Text style={{ fontSize: 26 }}>{sub.emoji}</Text>
                    </View>
                    <Text style={styles.subLabel} numberOfLines={1}>
                      {sub.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ paddingTop: spacing.lg }}>
            <ProductSection
              title={activeCategoryLabel}
              data={activeCategoryProducts}
              backgroundColor={colors.card}
              onSeeMore={() => goToCategory(activeCategory)}
              onPressProduct={(product) => goToProduct(product.id)}
            />
          </View>

          <Text style={styles.suggestedTitle}>More You Might Like</Text>
        </>
      )}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {/* Pinned section — ONLY the search bar + category tabs stay fixed
          while everything else (app icon row, location, banners, hero,
          product rows) scrolls underneath. This lives outside the FlatList
          entirely rather than as part of its ListHeaderComponent, so it
          can never scroll away. */}
      <LinearGradient colors={[colors.orange1, colors.orange2, colors.orange2]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.searchWrap}>
            <View style={styles.searchRow}>
              <Pressable style={styles.searchTapArea} onPress={() => router.push("/search")}>
                <Ionicons name="search" size={16} color="#888" />
                <Text style={styles.searchPlaceholder}>Search for products, brands...</Text>
              </Pressable>
              <Pressable onPress={onCameraSearch} hitSlop={8}>
                <Ionicons name="camera" size={16} color="#888" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catBar}
          >
            {CATEGORIES.map((c: CategoryDef) => (
              <CategoryPill
                key={c.key}
                icon={c.icon}
                label={c.label}
                active={activeCategory === c.key}
                onPress={() => setActiveCategory(c.key)}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* This FlatList is the one doing real virtualized scrolling through
          the full catalogue, laid out 3-per-row, with everything else
          (delivery banner, hero, flash sale/category rows or subcategory
          tiles) living in ListHeaderComponent so it scrolls up and out of
          the way first. */}
      <FlatList
        data={SUGGESTED_PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.suggestedRow}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => {
          const priceNum = parsePrice(item.price);
          const { rating } = deriveRating(item.id);
          const { originalPrice } = deriveDiscount(item.id, priceNum);
          return (
            <View style={styles.suggestedCell}>
              <ProductCard
                id={item.id}
                emoji={item.emoji}
                image={item.image}
                title={item.title}
                subtitle={item.price}
                originalPrice={originalPrice}
                rating={rating}
                size="grid3"
                hideAddToCart
                onPress={() => goToProduct(item.id)}
              />
            </View>
          );
        }}
        ListFooterComponent={<View style={{ height: spacing.xl }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Keep only a modest window of off-screen rows mounted — this is
        // what makes scrolling through the full catalogue stay smooth
        // instead of rendering everything up front.
        windowSize={7}
        initialNumToRender={12}
        maxToRenderPerBatch={9}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  deliveryBannerText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
  pillRow: { flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md },
  pill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 9,
    alignItems: "center",
    gap: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pillText: { fontSize: 11, fontWeight: "700", color: colors.ink },
  pillTextFk: { fontSize: 11, fontWeight: "700" },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fdece0",
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  locText: { flex: 1, fontSize: 12, color: "#333" },
  searchWrap: { marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchTapArea: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: "#999" },
  catBar: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, paddingTop: 2 },
  suggestedTitle: { ...typography.h3, marginHorizontal: spacing.md, marginTop: spacing.xl, marginBottom: spacing.md },
  suggestedRow: { paddingHorizontal: spacing.md, gap: spacing.sm, justifyContent: "flex-start" },
  suggestedCell: { flex: 1, alignItems: "center", marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  subGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md },
  subTile: { width: "22%", alignItems: "center" },
  subEmojiBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  subLabel: { fontSize: 10.5, fontWeight: "600", color: colors.ink, marginTop: 6, textAlign: "center" },
});