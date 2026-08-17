import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, View, ViewToken } from "react-native";
import { colors } from "@/theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_HEIGHT = 280;

interface Props {
  images: string[];
  emoji: string;
}

function Slide({ uri, emoji }: { uri?: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  return (
    <View style={styles.slide}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
    </View>
  );
}

export default function ProductGallery({ images, emoji }: Props) {
  const slides = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setActiveIndex(first.index);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  if (slides.length === 0) {
    return (
      <View style={styles.slide}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <Slide uri={item} emoji={emoji} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
      {slides.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{slides.length}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 110 },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.25)" },
  dotActive: { width: 16, backgroundColor: "#fff" },
  counter: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: { color: "#fff", fontSize: 10.5, fontWeight: "700" },
});
