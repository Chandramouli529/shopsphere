import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import { findProductById } from "@/data/products";
import { deriveReviews, type Review } from "@/data/mockReviews";
import { deriveRating, deriveConditionRatings, ratingLabel } from "@/utils/rating";

type SortMode = "Most Helpful" | "Latest" | "Positive" | "Negative";
const SORT_MODES: SortMode[] = ["Most Helpful", "Latest", "Positive", "Negative"];

function sortReviews(reviews: Review[], mode: SortMode): Review[] {
  const copy = [...reviews];
  switch (mode) {
    case "Most Helpful":
      return copy.sort((a, b) => b.helpful - a.helpful);
    case "Latest":
      return copy.sort((a, b) => a.daysAgo - b.daysAgo);
    case "Positive":
      return copy.sort((a, b) => b.rating - a.rating);
    case "Negative":
      return copy.sort((a, b) => a.rating - b.rating);
  }
}

function formatDaysAgo(days: number): string {
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"} ago`;
  return `${Math.round(days / 365)} year${Math.round(days / 365) === 1 ? "" : "s"} ago`;
}

export default function AllReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const [activeAttr, setActiveAttr] = useState("Overall");
  const [sortMode, setSortMode] = useState<SortMode>("Most Helpful");

  const found = findProductById(id ?? "");
  const { rating, reviewCount } = deriveRating(id ?? "");
  const conditions = useMemo(
    () => deriveConditionRatings(id ?? "", found?.categoryKey ?? ""),
    [id, found]
  );
  const reviews = useMemo(() => deriveReviews(id ?? ""), [id]);
  const sortedReviews = useMemo(() => sortReviews(reviews, sortMode), [reviews, sortMode]);

  // Distribution proportions are a fixed realistic shape (mostly 4-5 star),
  // scaled to this product's actual reviewCount so the numbers add up.
  const distribution = useMemo(() => {
    const shape = [0.62, 0.26, 0.06, 0.02, 0.04]; // 5★..1★
    return shape.map((p) => Math.round(reviewCount * p));
  }, [reviewCount]);
  const maxCount = Math.max(...distribution);

  if (!found) return null;

  const attrTabs = ["Overall", ...conditions.map((c) => c.label)];
  const selectedCondition = conditions.find((c) => c.label === activeAttr);
  const displayRating = selectedCondition ? selectedCondition.rating : rating;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>All Reviews</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {attrTabs.map((tab) => {
          const isActive = tab === activeAttr;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, isActive && { borderColor: theme.primary, backgroundColor: "#f3f8ff" }]}
              onPress={() => setActiveAttr(tab)}
            >
              <Text style={[styles.tabText, isActive && { color: theme.primary }]} numberOfLines={1}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={sortedReviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <>
            {activeAttr === "Overall" ? (
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons
                        key={n}
                        name={n <= Math.round(rating) ? "star" : "star-outline"}
                        size={20}
                        color={colors.green}
                      />
                    ))}
                  </View>
                  <Text style={styles.summarySub}>
                    {reviewCount.toLocaleString("en-IN")} ratings and {reviews.length} reviews
                  </Text>
                </View>
                <View style={styles.summaryRight}>
                  {distribution.map((count, idx) => {
                    const star = 5 - idx;
                    return (
                      <View key={star} style={styles.distRow}>
                        <Text style={styles.distLabel}>{star} ★</Text>
                        <View style={styles.distTrack}>
                          <View
                            style={[
                              styles.distFill,
                              { width: `${(count / maxCount) * 100}%`, backgroundColor: colors.green },
                            ]}
                          />
                        </View>
                        <Text style={styles.distCount}>{count.toLocaleString("en-IN")}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              // Attribute selected — the summary resizes to a compact card
              // for just that attribute, since there's no per-attribute
              // review distribution to show a full breakdown for.
              <View style={styles.attrSummaryCard}>
                <Text style={styles.attrSummaryValue}>{displayRating.toFixed(1)}</Text>
                <View style={{ flexDirection: "row", marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= Math.round(displayRating) ? "star" : "star-outline"}
                      size={16}
                      color={colors.green}
                    />
                  ))}
                </View>
                <Text style={styles.attrSummaryLabel}>{activeAttr}</Text>
                <View style={[styles.qualBadge, { marginTop: spacing.sm }]}>
                  <Text style={styles.qualBadgeText}>{ratingLabel(displayRating)}</Text>
                </View>
              </View>
            )}

            <Text style={styles.sortIntro}>User reviews sorted by</Text>
            <View style={styles.sortRow}>
              {SORT_MODES.map((mode) => {
                const isActive = mode === sortMode;
                return (
                  <Pressable
                    key={mode}
                    style={[styles.sortChip, isActive && { borderColor: theme.primary, backgroundColor: "#f3f8ff" }]}
                    onPress={() => setSortMode(mode)}
                  >
                    <Text style={[styles.sortChipText, isActive && { color: theme.primary }]}>{mode}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewTopRow}>
              <View style={[styles.reviewRatingBadge, { backgroundColor: item.rating >= 4 ? colors.green : item.rating >= 3 ? "#E8A33D" : colors.danger }]}>
                <Text style={styles.reviewRatingText}>{item.rating}</Text>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
              <Text style={styles.reviewTitle}>{item.title}</Text>
              <Text style={styles.reviewDate}>{formatDaysAgo(item.daysAgo)}</Text>
            </View>
            <Text style={styles.reviewText}>{item.text}</Text>
            <View style={styles.reviewFooter}>
              <View style={styles.reviewerRow}>
                <Text style={styles.reviewerName}>{item.name}</Text>
                {item.verified && (
                  <View style={styles.verifiedRow}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.inkSoft} />
                    <Text style={styles.verifiedText}>Verified Buyer</Text>
                  </View>
                )}
              </View>
              <View style={styles.helpfulRow}>
                <Ionicons name="thumbs-up-outline" size={14} color="#888" />
                <Text style={styles.helpfulCount}>{item.helpful}</Text>
                <Ionicons name="thumbs-down-outline" size={14} color="#888" style={{ marginLeft: 10 }} />
                <Text style={styles.helpfulCount}>{item.unhelpful}</Text>
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
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
  headerTitle: { ...typography.h3, flex: 1, textAlign: "center" },
  tabScroll: { borderBottomWidth: 1, borderBottomColor: colors.line },
  tabRow: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 2 },
  tab: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.line,
  },
  tabText: { fontSize: 14, fontWeight: "700", color: colors.ink, flexShrink: 0 },
  summaryRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.lg },
  summaryLeft: { alignItems: "center", justifyContent: "center", width: 100 },
  summarySub: { fontSize: 11, color: colors.inkSoft, textAlign: "center", marginTop: spacing.sm },
  summaryRight: { flex: 1, justifyContent: "center", gap: 6 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  distLabel: { width: 24, fontSize: 10.5, color: colors.inkSoft },
  distTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: "hidden" },
  distFill: { height: "100%", borderRadius: 3 },
  distCount: { width: 44, fontSize: 10.5, color: colors.inkSoft, textAlign: "right" },
  attrSummaryCard: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },
  attrSummaryValue: { fontSize: 34, fontWeight: "800", color: colors.ink },
  attrSummaryLabel: { fontSize: 13.5, fontWeight: "700", color: colors.ink, marginTop: spacing.sm },
  qualBadge: { backgroundColor: "#e6f4ea", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  qualBadgeText: { fontSize: 11.5, fontWeight: "700", color: colors.green },
  sortIntro: { fontSize: 13, fontWeight: "700", color: colors.ink, marginBottom: spacing.sm },
  sortRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  sortChipText: { fontSize: 12, fontWeight: "700", color: colors.ink },
  reviewCard: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md },
  reviewTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  reviewRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewRatingText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  reviewTitle: { fontSize: 14, fontWeight: "800", color: colors.ink, flex: 1 },
  reviewDate: { fontSize: 11, color: colors.inkSoft },
  reviewText: { fontSize: 13, color: colors.ink, lineHeight: 19, marginBottom: spacing.md },
  reviewFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewerName: { fontSize: 12, fontWeight: "700", color: colors.ink },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { fontSize: 10.5, color: colors.inkSoft },
  helpfulRow: { flexDirection: "row", alignItems: "center" },
  helpfulCount: { fontSize: 11.5, color: "#888", marginLeft: 4 },
});
