import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { radius } from "@/theme/colors";

interface Props {
  uri?: string;
  emoji: string;
  size: number;
  emojiSize?: number;
  borderRadius?: number;
}

/** Shows a real photo (uri) when available, falling back to the emoji glyph
 * if there's no uri or the image fails to load (offline, dead link, etc).
 * Used everywhere a product thumbnail appears so the fallback behavior is
 * defined in exactly one place. */
export default function ProductImage({ uri, emoji, size, emojiSize, borderRadius: br }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!uri && !failed;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: br ?? radius.md }]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: br ?? radius.md }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontSize: emojiSize ?? size * 0.45 }}>{emoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
