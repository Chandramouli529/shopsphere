import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { PLAY_SHOWS, type PlayShow } from "@/data/playShows";
import { findProductById } from "@/data/products";
import { parsePrice } from "@/utils/price";
import type { AppDispatch, RootState } from "@/store/store";
import { addItem, setPendingItem } from "@/store/slices/cartSlice";
import { addWishlistItem, removeWishlistItem, setPendingWishlistItem } from "@/store/slices/wishlistSlice";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function Toast({ message }: { message: string | null }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [message, opacity]);
  if (!message) return null;
  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Ionicons name="checkmark-circle" size={15} color="#fff" />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

function ShowSlide({
  show,
  slideHeight,
  onToast,
}: {
  show: PlayShow;
  slideHeight: number;
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const found = findProductById(show.productId);
  const isLoggedIn = useSelector((s: RootState) => !!s.auth.user);
  const isWishlisted = useSelector((s: RootState) => s.wishlist.items.some((i) => i.id === show.productId));

  if (!found) return null;
  const { product } = found;
  const priceNum = parsePrice(product.price);

  const cartPayload = { id: product.id, title: product.title, price: priceNum, qty: 1, emoji: product.emoji, image: product.image };
  const wishPayload = { id: product.id, title: product.title, price: priceNum, emoji: product.emoji, image: product.image };

  const onAddToCart = () => {
    if (isLoggedIn) {
      dispatch(addItem(cartPayload));
      onToast("Added to cart");
    } else {
      dispatch(setPendingItem(cartPayload));
      router.push("/(auth)/login");
    }
  };

  const onToggleWishlist = () => {
    if (!isLoggedIn) {
      dispatch(setPendingWishlistItem(wishPayload));
      router.push("/(auth)/login");
      return;
    }
    if (isWishlisted) {
      dispatch(removeWishlistItem(product.id));
    } else {
      dispatch(addWishlistItem(wishPayload));
      onToast("Added to wishlist");
    }
  };

  const badgeColor =
    show.badge === "LIVE" ? "#E74C3C" : show.badge === "NEW" ? "#1C8A3C" : "#D6293E";

  return (
    <LinearGradient colors={show.colors} style={[styles.slide, { height: slideHeight }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            {show.badge === "LIVE" && <View style={styles.liveDot} />}
            <Text style={styles.badgeText}>{show.badge}</Text>
          </View>
          <View style={styles.viewsRow}>
            <Ionicons name="eye" size={13} color="#fff" />
            <Text style={styles.viewsText}>{show.views}</Text>
          </View>
        </View>

        {/* "Video" placeholder — a big centered play icon over the product
            emoji, since there's no real video backend behind this feed. */}
        <Pressable style={styles.videoArea} onPress={() => router.push(`/product/${product.id}`)}>
          <Text style={styles.bigEmoji}>{product.emoji}</Text>
          <View style={styles.playBadge}>
            <Ionicons name="play" size={26} color="#fff" />
          </View>
        </Pressable>

        {/* Right-side action rail, Reels-style */}
        <View style={styles.actionRail}>
          <Pressable style={styles.actionBtn} onPress={onToggleWishlist}>
            <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={26} color={isWishlisted ? "#ff4d6d" : "#fff"} />
            <Text style={styles.actionLabel}>Wishlist</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={onAddToCart}>
            <Ionicons name="cart" size={24} color="#fff" />
            <Text style={styles.actionLabel}>Add</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => router.push(`/product/${product.id}`)}>
            <Ionicons name="information-circle-outline" size={26} color="#fff" />
            <Text style={styles.actionLabel}>Details</Text>
          </Pressable>
        </View>

        {/* Bottom product/caption overlay */}
        <View style={styles.bottomOverlay}>
          <Text style={styles.caption} numberOfLines={2}>
            {show.caption}
          </Text>
          <View style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {product.title}
              </Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
            <Pressable style={styles.shopBtn} onPress={() => router.push(`/product/${product.id}`)}>
              <Text style={styles.shopBtnText}>Shop Now</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function PlayScreen() {
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const onLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(null);
    // Re-set on next tick so repeated identical messages still re-trigger
    // the fade animation instead of being ignored as an unchanged value.
    requestAnimationFrame(() => setToastMsg(msg));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }} onLayout={onLayout}>
      <FlatList
        data={PLAY_SHOWS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShowSlide show={item} slideHeight={containerHeight} onToast={showToast} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={containerHeight}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: containerHeight,
          offset: containerHeight * index,
          index,
        })}
      />
      <Toast message={toastMsg} />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width: "100%", justifyContent: "space-between" },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 10.5, letterSpacing: 0.5 },
  viewsRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.3)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  viewsText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  videoArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  bigEmoji: { fontSize: 130, opacity: 0.9 },
  playBadge: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRail: {
    position: "absolute",
    right: 12,
    bottom: 150,
    alignItems: "center",
    gap: 22,
  },
  actionBtn: { alignItems: "center", gap: 3 },
  actionLabel: { color: "#fff", fontSize: 10, fontWeight: "700" },
  bottomOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  caption: { color: "#fff", fontSize: 14, fontWeight: "600", marginBottom: 12, lineHeight: 19 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  productTitle: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  productPrice: { color: "#fff", fontWeight: "800", fontSize: 15, marginTop: 2 },
  shopBtn: { backgroundColor: "#fff", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  shopBtnText: { fontWeight: "800", fontSize: 13, color: "#111" },
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,20,20,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  toastText: { color: "#fff", fontSize: 12.5, fontWeight: "600" },
});
