import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View, ViewToken } from "react-native";
import { useSelector } from "react-redux";
import { type HeroSlide } from "@/data/hero";
import { colors, radius, spacing } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { ThemePreset } from "@/theme/themes";
import type { RootState } from "@/store/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const AUTO_ADVANCE_MS = 3500;

function Slide({ item, theme }: { item: HeroSlide; theme: ThemePreset }) {
  return (
    <View style={[styles.slide, { backgroundColor: item.colors[0], width: SLIDE_WIDTH }]}>
      <Text style={[styles.brand, { color: theme.primary }]}>{item.brand}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={[styles.price, { color: theme.primary }]}>{item.price}</Text>
      <View style={styles.adTag}>
        <Text style={styles.adTagText}>AD</Text>
      </View>
    </View>
  );
}

export default function HeroSlider() {
  const listRef = useRef<FlatList<HeroSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const theme = useAppTheme();
  const slides = useSelector((state: RootState) => state.platformContent.banners);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % slides.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) {
      activeIndexRef.current = first.index;
      setActiveIndex(first.index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const renderItem = useCallback(
    ({ item }: { item: HeroSlide }) => <Slide item={item} theme={theme} />,
    [theme]
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        snapToInterval={SLIDE_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH + spacing.md,
          offset: (SLIDE_WIDTH + spacing.md) * index,
          index,
        })}
      />
      <View style={styles.dots}>
        {slides.map((slide, idx) => (
          <View
            key={slide.id}
            style={[styles.dot, idx === activeIndex && { width: 14, backgroundColor: theme.primary }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 150,
    justifyContent: "center",
  },
  brand: { fontSize: 16, fontWeight: "700", color: colors.blue },
  title: { fontSize: 22, fontWeight: "800", color: "#111", marginTop: 8 },
  subtitle: { fontSize: 12, color: "#555", marginTop: 4 },
  price: { fontSize: 13, fontWeight: "700", color: colors.blue, marginTop: 6 },
  adTag: {
    position: "absolute",
    bottom: 8,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  adTagText: { color: "#fff", fontSize: 9 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, paddingVertical: spacing.md },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#d5d5d5" },
  dotActive: { width: 14, backgroundColor: "#333" },
});
