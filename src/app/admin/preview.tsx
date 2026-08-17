import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { addBanner, removeBanner } from "@/store/slices/platformContentSlice";
import { COUPONS } from "@/data/coupons";
import { getAllProductsFlat } from "@/data/products";
import StatCard from "@/components/StatCard";

const ADMIN_COLOR = "#6c2eb5";
const COLOR_PRESETS: [string, string][] = [
  ["#f5f5f5", "#e8e8e8"],
  ["#fff3cf", "#ffe1a8"],
  ["#ffe4ec", "#ffd0dd"],
  ["#e7ddff", "#d6c7ff"],
  ["#e9f9ec", "#cdf0d6"],
];

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function AddBannerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setBrand("");
    setTitle("");
    setSubtitle("");
    setPrice("");
    setColorIdx(0);
    setError(null);
  };

  const onSave = () => {
    if (!title.trim()) {
      setError("Enter a banner title");
      return;
    }
    dispatch(
      addBanner({
        brand: brand.trim() || "✦ Promo",
        title: title.trim(),
        subtitle: subtitle.trim(),
        price: price.trim(),
        colors: COLOR_PRESETS[colorIdx],
      })
    );
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.modalTitle}>Add Banner</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={{ padding: spacing.lg }}>
          <Text style={styles.fieldLabel}>Brand / Tag</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. ⚡ Freedom Sale" />
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Up to 80% Off" />
          <Text style={styles.fieldLabel}>Subtitle</Text>
          <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle} placeholder="e.g. Fashion & Electronics" />
          <Text style={styles.fieldLabel}>Price / Note</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. Live now · Limited time" />

          <Text style={styles.fieldLabel}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_PRESETS.map((c, idx) => (
              <Pressable
                key={idx}
                style={[styles.colorSwatch, { backgroundColor: c[0] }, colorIdx === idx && { borderColor: ADMIN_COLOR, borderWidth: 3 }]}
                onPress={() => setColorIdx(idx)}
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable style={[styles.saveBtn, { backgroundColor: ADMIN_COLOR }]} onPress={onSave}>
            <Text style={styles.saveBtnText}>Add Banner</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function AdminPreviewScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const banners = useSelector((state: RootState) => state.platformContent.banners);
  const allVendorCoupons = useSelector((state: RootState) => state.vendorCoupons.coupons);
  const vendorCoupons = useMemo(() => allVendorCoupons.filter((c) => c.active), [allVendorCoupons]);
  const totalOrders = useSelector((state: RootState) => state.orders.list.length);
  const totalOrdersRevenue = useSelector((state: RootState) => state.orders.list.reduce((s, o) => s + o.grandTotal, 0));
  const totalVendors = useSelector((state: RootState) => state.vendors.vendors.length);
  const totalProducts = useMemo(() => getAllProductsFlat().length, []);
  const [modalVisible, setModalVisible] = useState(false);

  const onRemoveBanner = (id: string, title: string) => {
    Alert.alert("Remove Banner", `Remove "${title}" from the Home page?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeBanner(id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preview Manage</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Home Page Banners</Text>
          <Pressable style={[styles.addBtn, { backgroundColor: ADMIN_COLOR }]} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={15} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionNote}>Live on the customer Home page hero carousel.</Text>
        {banners.map((b) => (
          <View key={b.id} style={[styles.bannerCard, { backgroundColor: b.colors[0] }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerBrand}>{b.brand}</Text>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerSub}>{b.subtitle}</Text>
            </View>
            <Pressable onPress={() => onRemoveBanner(b.id, b.title)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color="#c0392b" />
            </Pressable>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Live Offers</Text>
        <Text style={styles.sectionNote}>Platform coupons + active vendor coupons.</Text>
        <View style={styles.offersCard}>
          {COUPONS.map((c) => (
            <View key={c.code} style={styles.offerRow}>
              <Ionicons name="pricetag" size={14} color={ADMIN_COLOR} />
              <Text style={styles.offerText}>
                <Text style={{ fontWeight: "800" }}>{c.code}</Text> — {c.description}
              </Text>
            </View>
          ))}
          {vendorCoupons.map((c) => (
            <View key={c.id} style={styles.offerRow}>
              <Ionicons name="storefront" size={14} color={ADMIN_COLOR} />
              <Text style={styles.offerText}>
                <Text style={{ fontWeight: "800" }}>{c.code}</Text> — vendor offer, min order ₹{c.minOrder}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Platform Quick Glance</Text>
        <View style={styles.cardsGrid}>
          <StatCard icon="cash" label="Revenue" value={formatINR(totalOrdersRevenue)} accentColor={ADMIN_COLOR} />
          <StatCard icon="receipt" label="Orders" value={String(totalOrders)} accentColor="#2874f0" />
          <StatCard icon="cube" label="Products" value={String(totalProducts)} accentColor="#16a085" />
          <StatCard icon="storefront" label="Vendors" value={String(totalVendors)} accentColor="#e67e22" />
        </View>
        <Text style={styles.sectionNote}>Full breakdowns are on the Dashboard tab.</Text>
      </ScrollView>

      <AddBannerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { ...typography.h2, fontSize: 18 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { ...typography.h3, fontSize: 14 },
  sectionNote: { fontSize: 11, color: colors.inkSoft, marginBottom: spacing.md },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 11.5 },
  bannerCard: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  bannerBrand: { fontSize: 12, fontWeight: "700", color: colors.blue },
  bannerTitle: { fontSize: 15, fontWeight: "800", color: colors.ink, marginTop: 2 },
  bannerSub: { fontSize: 11, color: "#555", marginTop: 2 },
  offersCard: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  offerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm },
  offerText: { flex: 1, fontSize: 11.5, color: colors.ink },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalTitle: { ...typography.h3 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.inkSoft, marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, color: colors.ink },
  colorRow: { flexDirection: "row", gap: spacing.sm },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line },
  errorText: { color: "#d32f2f", fontSize: 12, marginTop: spacing.md },
  saveBtn: { paddingVertical: 13, borderRadius: radius.sm, alignItems: "center", marginTop: spacing.xl },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});