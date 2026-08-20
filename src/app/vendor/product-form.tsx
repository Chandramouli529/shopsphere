import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { createProductRemote, updateProductRemote } from "@/store/slices/vendorProductsSlice";
import { CATEGORIES } from "@/data/categories";
import { SUBCATEGORIES_BY_CATEGORY } from "@/data/subcategories";
import { getCategoryAttributes, type AttributeField } from "@/data/vendorProductAttributes";

const VENDOR_COLOR = "#2c3e50";
const MAX_IMAGES = 5;
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function VendorProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const vendor = useSelector((state: RootState) => state.vendorAuth.vendor);
  const existing = useSelector((state: RootState) =>
    id ? state.vendorProducts.products.find((p) => p.id === id) : undefined
  );
  const isEdit = !!existing;

  // Category is locked to the vendor's own business type — a vendor only
  // ever creates products in the category they registered under, so
  // there's no category picker here at all.
  const vendorCategoryDef = CATEGORIES.find(
    (c) => c.label === vendor?.category || c.key === vendor?.category
  );
  const category = existing?.category ?? vendorCategoryDef?.key ?? "";
  const categoryLabel = vendorCategoryDef?.label ?? vendor?.category ?? "Uncategorized";

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [stock, setStock] = useState(existing ? String(existing.stock) : "0");
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [attributes, setAttributes] = useState<Record<string, string>>(existing?.attributes ?? {});
  const [error, setError] = useState<string | null>(null);

  const createStatus = useSelector((state: RootState) => state.vendorProducts.createStatus);
  const updateBusy = useSelector((state: RootState) =>
    existing ? state.vendorProducts.actionStatus[existing.id] === "loading" : false
  );
  const saving = createStatus === "loading" || updateBusy;

  const categoryAttributes = getCategoryAttributes(category);
  const setAttribute = (key: string, value: string) => setAttributes((a) => ({ ...a, [key]: value }));

  const selectedSizes = (attributes.sizes ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setAttribute("sizes", next.join(", "));
  };

  const onPickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Limit reached", `You can upload up to ${MAX_IMAGES} images.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access in Settings to upload product images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled && result.assets?.[0]) {
      setImages((imgs) => [...imgs, result.assets[0].uri]);
    }
  };

  const onRemoveImage = (uri: string) => setImages((imgs) => imgs.filter((i) => i !== uri));

  const onSave = async () => {
    if (!vendor) return;
    if (!category) {
      setError("Your vendor account has no business type set — contact admin.");
      return;
    }
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (!title.trim()) return setError("Product title is required.");
    if (!priceNum || priceNum <= 0) return setError("Enter a valid price.");
    if (isNaN(stockNum) || stockNum < 0) return setError("Enter a valid stock quantity.");
    setError(null);

    if (isEdit && existing) {
      const result = await dispatch(
        updateProductRemote({
          ...existing,
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          category,
          stock: stockNum,
          images,
          attributes,
        })
      );
      if (updateProductRemote.fulfilled.match(result)) {
        router.back();
      } else {
        setError((result.payload as string) ?? "Could not save changes. Please try again.");
      }
    } else {
      const result = await dispatch(
        createProductRemote({
          vendorId: vendor.id,
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          category,
          stock: stockNum,
          lowStockThreshold: 10,
          images,
          variants: [],
          available: true,
          attributes,
        })
      );
      if (createProductRemote.fulfilled.match(result)) {
        router.back();
      } else {
        setError((result.payload as string) ?? "Could not create product. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEdit ? "Update Product" : "Create Product"}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }} keyboardShouldPersistTaps="handled">
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag" size={13} color={VENDOR_COLOR} />
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>

          <Text style={styles.sectionLabel}>Product Images</Text>
          <View style={styles.imagesRow}>
            {images.map((uri) => (
              <View key={uri} style={styles.imageThumbWrap}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <Pressable style={styles.removeImageBtn} onPress={() => onRemoveImage(uri)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <Pressable style={styles.addImageBtn} onPress={onPickImage}>
                <Ionicons name="camera" size={20} color={VENDOR_COLOR} />
                <Text style={styles.addImageText}>Upload</Text>
              </Pressable>
            )}
          </View>

          <Field label="Product Title" value={title} onChangeText={setTitle} />
          <Field label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Field label="Selling Price (₹)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Stock Quantity" value={stock} onChangeText={setStock} keyboardType="number-pad" />
            </View>
          </View>

          {categoryAttributes.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>{categoryLabel} Details</Text>
              {categoryAttributes.map((field) => {
                if (field.key === "subCategory" && (SUBCATEGORIES_BY_CATEGORY[category]?.length ?? 0) > 0) {
                  return (
                    <View key={field.key} style={{ marginBottom: spacing.md }}>
                      <Text style={styles.inputLbl}>{field.label}</Text>
                      <View style={styles.selectRow}>
                        {SUBCATEGORIES_BY_CATEGORY[category].map((sub) => {
                          const isActive = attributes.subCategory === sub.label;
                          return (
                            <Pressable
                              key={sub.label}
                              style={[styles.selectChip, isActive && { backgroundColor: VENDOR_COLOR }]}
                              onPress={() => setAttribute("subCategory", sub.label)}
                            >
                              <Text style={[styles.selectChipText, isActive && { color: "#fff" }]}>
                                {sub.emoji} {sub.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                }
                if (field.key === "sizes") {
                  return (
                    <View key={field.key} style={{ marginBottom: spacing.md }}>
                      <Text style={styles.inputLbl}>{field.label}</Text>
                      <View style={styles.selectRow}>
                        {SIZE_OPTIONS.map((size) => {
                          const isActive = selectedSizes.includes(size);
                          return (
                            <Pressable
                              key={size}
                              style={[styles.selectChip, isActive && { backgroundColor: VENDOR_COLOR }]}
                              onPress={() => toggleSize(size)}
                            >
                              <Text style={[styles.selectChipText, isActive && { color: "#fff" }]}>{size}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                }
                return (
                  <AttributeInput
                    key={field.key}
                    field={field}
                    value={attributes[field.key] ?? ""}
                    onChange={(v) => setAttribute(field.key, v)}
                  />
                );
              })}
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveBtn, { backgroundColor: VENDOR_COLOR }, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{isEdit ? "Save Changes" : "Create Product"}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AttributeInput({
  field,
  value,
  onChange,
}: {
  field: AttributeField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "select") {
    return (
      <View style={{ marginBottom: spacing.md }}>
        <Text style={styles.inputLbl}>{field.label}</Text>
        <View style={styles.selectRow}>
          {(field.options ?? []).map((opt) => {
            const isActive = value === opt;
            return (
              <Pressable
                key={opt}
                style={[styles.selectChip, isActive && { backgroundColor: VENDOR_COLOR }]}
                onPress={() => onChange(opt)}
              >
                <Text style={[styles.selectChipText, isActive && { color: "#fff" }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
  return (
    <Field
      label={field.label}
      value={value}
      onChangeText={onChange}
      placeholder={field.placeholder}
      keyboardType={field.type === "number" ? "decimal-pad" : "default"}
    />
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLbl}>{label}</Text>
      <TextInput style={styles.input} {...rest} />
    </View>
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
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#eef1f5",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  categoryBadgeText: { fontSize: 12.5, fontWeight: "700", color: VENDOR_COLOR },
  sectionLabel: { fontSize: 12.5, fontWeight: "700", color: colors.inkSoft, marginBottom: spacing.sm },
  imagesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  imageThumbWrap: { position: "relative" },
  imageThumb: { width: 64, height: 64, borderRadius: radius.sm },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#c0392b",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: VENDOR_COLOR,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: { fontSize: 9, color: VENDOR_COLOR, fontWeight: "700", marginTop: 2 },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: VENDOR_COLOR,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 10,
    marginBottom: spacing.md,
  },
  inputLbl: { fontSize: 10.5, color: VENDOR_COLOR, marginBottom: 2 },
  input: { fontSize: 14, paddingVertical: 2, color: colors.ink },
  selectRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  selectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selectChipText: { fontSize: 11.5, fontWeight: "600", color: colors.ink },
  errorText: { color: "#d32f2f", fontSize: 12, marginTop: spacing.sm },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line },
  saveBtn: { paddingVertical: 14, borderRadius: radius.sm, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});