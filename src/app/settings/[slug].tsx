import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addAddress,
  addCard,
  removeAddress,
  removeCard,
  setLanguage,
  setCurrentAddress,
  setNotificationToggle,
  type Address,
  type SavedCard,
} from "@/store/slices/settingsSlice";
import { addItem } from "@/store/slices/cartSlice";
import { removeWishlistItem, type WishlistItem } from "@/store/slices/wishlistSlice";
import ProductImage from "@/components/ProductImage";
import { setThemeKey } from "@/store/slices/themeSlice";
import { THEMES } from "@/theme/themes";
import { useAppTheme } from "@/theme/useAppTheme";

type Kind = "select" | "toggles" | "faq" | "address" | "cards" | "orders" | "wishlist" | "coupons" | "theme" | "empty" | "info";

interface SettingConfig {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  kind: Kind;
}

const SETTINGS: Record<string, SettingConfig> = {
  language: { title: "Select Language", icon: "language", kind: "select" },
  theme: { title: "App Theme", icon: "color-palette", kind: "theme" },
  notifications: { title: "Notification Settings", icon: "notifications", kind: "toggles" },
  help: { title: "Help Center", icon: "headset", kind: "faq" },
  orders: { title: "Order History", icon: "receipt", kind: "orders" },
  address: { title: "Address Book", icon: "location", kind: "address" },
  wishlist: { title: "Wishlist", icon: "heart", kind: "wishlist" },
  coupons: { title: "Coupons", icon: "gift", kind: "coupons" },
  cards: { title: "Saved Cards", icon: "card", kind: "cards" },
  seller: { title: "Become a Seller", icon: "storefront", kind: "info" },
};

const LANGUAGES = ["English", "हिन्दी (Hindi)", "தமிழ் (Tamil)", "తెలుగు (Telugu)", "বাংলা (Bengali)", "मराठी (Marathi)"];

const NOTIFICATION_TOGGLES = [
  { key: "orders", label: "Order updates", sub: "Shipping, delivery & returns" },
  { key: "offers", label: "Offers & promotions", sub: "Deals, coupons & price drops" },
  { key: "recommendations", label: "Recommendations", sub: "Picks based on your browsing" },
  { key: "app", label: "App updates", sub: "New features & announcements" },
];

const FAQS = [
  "How do I track my order?",
  "How do I return or exchange an item?",
  "How do I cancel an order?",
  "How do refunds work?",
  "How do I update my delivery address?",
];

const EMPTY_STATE_COPY: Record<string, { message: string; cta: string }> = {};

const COUPONS = [
  { code: "WELCOME100", label: "₹100 off on your first order", sub: "Min. order ₹499 · Valid till 31 Dec" },
  { code: "FREESHIP", label: "Free delivery, no minimum", sub: "Applies automatically at checkout" },
  { code: "SAVE10", label: "10% off, up to ₹300", sub: "Valid on Fashion & Electronics" },
];

export default function SettingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const key = slug ?? "";
  const config = SETTINGS[key] ?? { title: "Settings", icon: "settings", kind: "empty" as Kind };

  const { language, addresses, cards, notifications, currentAddressId } = useSelector(
    (state: RootState) => state.settings
  );
  const orders = useSelector((state: RootState) => state.orders.list);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const themeKey = useSelector((state: RootState) => state.theme.themeKey);
  const activeTheme = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{config.title}</Text>
        <View style={{ width: 22 }} />
      </View>

      {config.kind === "select" && (
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.optionRow}
              onPress={() => {
                dispatch(setLanguage(item));
                router.back();
              }}
            >
              <Text style={styles.optionLabel}>{item}</Text>
              <Ionicons
                name={language === item ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={language === item ? activeTheme.primary : "#bbb"}
              />
            </Pressable>
          )}
        />
      )}

      {config.kind === "toggles" && (
        <FlatList
          data={NOTIFICATION_TOGGLES}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          renderItem={({ item }) => (
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Switch
                value={notifications[item.key]}
                onValueChange={(v) => {
                  dispatch(setNotificationToggle({ key: item.key, value: v }));
                }}
                trackColor={{ false: "#ddd", true: activeTheme.primary }}
                thumbColor="#fff"
              />
            </View>
          )}
        />
      )}

      {config.kind === "faq" && (
        <FlatList
          data={FAQS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          ListFooterComponent={
            <Pressable style={styles.contactRow}>
              <Ionicons name="chatbubble-ellipses" size={18} color={activeTheme.primary} />
              <Text style={[styles.contactText, { color: activeTheme.primary }]}>Chat with us</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.optionRow}>
              <Text style={styles.optionLabel}>{item}</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </Pressable>
          )}
        />
      )}

      {config.kind === "address" && (
        <AddressBook addresses={addresses} currentAddressId={currentAddressId} dispatch={dispatch} />
      )}

      {config.kind === "cards" && <SavedCards cards={cards} dispatch={dispatch} />}

      {config.kind === "orders" &&
        (orders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="receipt" size={36} color="#bbb" />
            </View>
            <Text style={styles.emptyMsg}>You haven't placed any orders yet.</Text>
            <Pressable style={[styles.emptyCta, { backgroundColor: activeTheme.primary }]} onPress={() => router.push("/(tabs)/home")}>
              <Text style={styles.emptyCtaText}>Start Shopping</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.lg }}
            renderItem={({ item }) => (
              <Pressable style={styles.orderCard} onPress={() => router.push(`/order/${item.id}`)}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderIdText}>{item.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(item.placedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <View style={styles.orderItemsRow}>
                  {item.items.map((it) => (
                    <View key={it.id} style={{ marginRight: 6 }}>
                      <ProductImage uri={it.image} emoji={it.emoji} size={32} emojiSize={18} borderRadius={6} />
                    </View>
                  ))}
                </View>
                <Text style={styles.orderItemsSummary} numberOfLines={1}>
                  {item.items.map((it) => `${it.title} x${it.qty}`).join(", ")}
                </Text>
                <View style={styles.orderFooterRow}>
                  <Text style={styles.orderTotal}>₹{item.grandTotal.toLocaleString("en-IN")}</Text>
                  <Text style={styles.orderPayment}>{item.paymentMethod}</Text>
                </View>
                <View style={styles.orderDetailsLinkRow}>
                  <Text style={[styles.orderDetailsLink, { color: activeTheme.primary }]}>View Details &amp; Invoice</Text>
                  <Ionicons name="chevron-forward" size={14} color={activeTheme.primary} />
                </View>
              </Pressable>
            )}
          />
        ))}

      {config.kind === "wishlist" &&
        (wishlistItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="heart" size={36} color="#bbb" />
            </View>
            <Text style={styles.emptyMsg}>Your wishlist is empty.</Text>
            <Pressable style={[styles.emptyCta, { backgroundColor: activeTheme.primary }]} onPress={() => router.push("/(tabs)/home")}>
              <Text style={styles.emptyCtaText}>Explore Products</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={wishlistItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.lg }}
            renderItem={({ item }: { item: WishlistItem }) => (
              <View style={styles.wishlistCard}>
                <Pressable
                  style={styles.wishlistThumb}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <ProductImage uri={item.image} emoji={item.emoji} size={56} emojiSize={30} borderRadius={radius.sm} />
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => router.push(`/product/${item.id}`)}>
                  <Text style={styles.addressName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.wishlistPrice, { color: activeTheme.primary }]}>
                    ₹{item.price.toLocaleString("en-IN")}
                  </Text>
                </Pressable>
                <View style={{ gap: spacing.sm, alignItems: "flex-end" }}>
                  <Pressable onPress={() => dispatch(removeWishlistItem(item.id))} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color="#c0392b" />
                  </Pressable>
                  <Pressable
                    style={[styles.moveToCartBtn, { backgroundColor: activeTheme.primary }]}
                    onPress={() => {
                      dispatch(
                        addItem({
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          qty: 1,
                          emoji: item.emoji,
                          image: item.image,
                        })
                      );
                      dispatch(removeWishlistItem(item.id));
                    }}
                  >
                    <Text style={styles.moveToCartText}>Move to Cart</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        ))}

      {config.kind === "coupons" && (
        <FlatList
          data={COUPONS}
          keyExtractor={(item) => item.code}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <View style={styles.couponCard}>
              <View style={styles.couponLeft}>
                <Ionicons name="gift" size={22} color={activeTheme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.couponCode}>{item.code}</Text>
                <Text style={styles.couponLabel}>{item.label}</Text>
                <Text style={styles.couponSub}>{item.sub}</Text>
              </View>
            </View>
          )}
        />
      )}

      {config.kind === "theme" && (
        <FlatList
          data={Object.values(THEMES)}
          keyExtractor={(item) => item.key}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          contentContainerStyle={{ padding: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={
            <Text style={styles.themeIntro}>
              Pick an accent color. It updates buttons, active states, and highlights across
              the app.
            </Text>
          }
          renderItem={({ item }) => {
            const isActive = themeKey === item.key;
            return (
              <Pressable
                style={[styles.themeCard, isActive && { borderColor: item.primary }]}
                onPress={() => dispatch(setThemeKey(item.key))}
              >
                <View style={styles.themeSwatchRow}>
                  <View style={[styles.themeSwatch, { backgroundColor: item.primary }]} />
                  <View style={[styles.themeSwatch, { backgroundColor: item.secondary }]} />
                </View>
                <Text style={styles.themeName}>{item.name}</Text>
                {isActive && (
                  <View style={[styles.themeCheck, { backgroundColor: item.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      {config.kind === "empty" && (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name={config.icon} size={36} color="#bbb" />
          </View>
          <Text style={styles.emptyMsg}>{EMPTY_STATE_COPY[key]?.message}</Text>
          <Pressable style={[styles.emptyCta, { backgroundColor: activeTheme.primary }]} onPress={() => router.push("/(tabs)/home")}>
            <Text style={styles.emptyCtaText}>{EMPTY_STATE_COPY[key]?.cta}</Text>
          </Pressable>
        </View>
      )}

      {config.kind === "info" && (
        <View style={{ padding: spacing.xl }}>
          <View style={styles.sellerIconWrap}>
            <Ionicons name="storefront" size={32} color={activeTheme.primary} />
          </View>
          <Text style={styles.sellerTitle}>Sell on ShopSphere</Text>
          <Text style={styles.sellerSub}>
            Reach millions of customers, manage orders in one place, and get paid securely.
          </Text>
          {[
            "Zero listing fees for your first 90 days",
            "Dedicated seller dashboard & analytics",
            "Nationwide logistics support",
          ].map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
          <Pressable style={[styles.emptyCta, { backgroundColor: activeTheme.primary }]} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.emptyCtaText}>Get Started</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Address Book: list of saved addresses + an inline "add new" form
// ---------------------------------------------------------------------------

function AddressBook({
  addresses,
  currentAddressId,
  dispatch,
}: {
  addresses: Address[];
  currentAddressId: string | null;
  dispatch: AppDispatch;
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const activeTheme = useAppTheme();

  const canSave = form.name.trim() && form.phone.trim() && form.line1.trim() && form.pincode.trim();

  const onSave = () => {
    if (!canSave) return;
    dispatch(addAddress(form));
    setForm({ name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
    setShowForm(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => {
          const isCurrent = item.id === currentAddressId;
          return (
            <View style={[styles.addressCard, isCurrent && { borderColor: activeTheme.primary }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>
                  {item.name} <Text style={styles.addressPhone}>· {item.phone}</Text>
                </Text>
                <Text style={styles.addressLine}>
                  {item.line1}, {item.city}, {item.state} - {item.pincode}
                </Text>
                {isCurrent ? (
                  <View style={[styles.deliverBadge, { backgroundColor: activeTheme.primary }]}>
                    <Ionicons name="checkmark" size={11} color="#fff" />
                    <Text style={styles.deliverBadgeText}>Delivering here</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => dispatch(setCurrentAddress(item.id))} hitSlop={6}>
                    <Text style={[styles.setCurrentText, { color: activeTheme.primary }]}>
                      Deliver to this address
                    </Text>
                  </Pressable>
                )}
              </View>
              <Pressable onPress={() => dispatch(removeAddress(item.id))} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#c0392b" />
              </Pressable>
            </View>
          );
        }}
        ListFooterComponent={
          showForm ? (
            <View style={styles.formCard}>
              <TextInput
                style={styles.formInput}
                placeholder="Full Name"
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Address (House no, street, area)"
                value={form.line1}
                onChangeText={(v) => setForm((f) => ({ ...f, line1: v }))}
              />
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="City"
                  value={form.city}
                  onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                />
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder="State"
                  value={form.state}
                  onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
                />
              </View>
              <TextInput
                style={styles.formInput}
                placeholder="Pincode"
                keyboardType="number-pad"
                maxLength={6}
                value={form.pincode}
                onChangeText={(v) => setForm((f) => ({ ...f, pincode: v }))}
              />
              <Pressable
                style={[styles.emptyCta, { backgroundColor: activeTheme.primary }, !canSave && styles.btnDisabled, { alignSelf: "stretch", alignItems: "center" }]}
                disabled={!canSave}
                onPress={onSave}
              >
                <Text style={styles.emptyCtaText}>Save Address</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.addNewRow, { borderColor: activeTheme.primary }]}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={activeTheme.primary} />
              <Text style={[styles.addNewText, { color: activeTheme.primary }]}>Add New Address</Text>
            </Pressable>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Saved Cards: list of saved cards (masked) + an inline "add a card" form
// ---------------------------------------------------------------------------

function SavedCards({ cards, dispatch }: { cards: SavedCard[]; dispatch: AppDispatch }) {
  const [showForm, setShowForm] = useState(cards.length === 0);
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const activeTheme = useAppTheme();

  const digitsOnly = cardNumber.replace(/\D/g, "");
  const canSave = holderName.trim() && digitsOnly.length === 16 && /^\d{2}\/\d{2}$/.test(expiry);

  const onSave = () => {
    if (!canSave) return;
    dispatch(addCard({ holderName, last4: digitsOnly.slice(-4), expiry }));
    setHolderName("");
    setCardNumber("");
    setExpiry("");
    setShowForm(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>
            <Ionicons name="card" size={22} color={activeTheme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.addressName}>•••• •••• •••• {item.last4}</Text>
              <Text style={styles.addressLine}>
                {item.holderName} · Expires {item.expiry}
              </Text>
            </View>
            <Pressable onPress={() => dispatch(removeCard(item.id))} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color="#c0392b" />
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          showForm ? (
            <View style={styles.formCard}>
              <TextInput
                style={styles.formInput}
                placeholder="Name on Card"
                value={holderName}
                onChangeText={setHolderName}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Card Number"
                keyboardType="number-pad"
                maxLength={19}
                value={cardNumber}
                onChangeText={(v) => {
                  const clean = v.replace(/\D/g, "").slice(0, 16);
                  setCardNumber(clean.replace(/(.{4})/g, "$1 ").trim());
                }}
              />
              <TextInput
                style={styles.formInput}
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                onChangeText={(v) => {
                  const clean = v.replace(/[^0-9/]/g, "");
                  setExpiry(clean);
                }}
              />
              <Text style={styles.formNote}>
                This is a demo form — no real card data is transmitted or stored anywhere.
              </Text>
              <Pressable
                style={[styles.emptyCta, { backgroundColor: activeTheme.primary }, !canSave && styles.btnDisabled, { alignSelf: "stretch", alignItems: "center" }]}
                disabled={!canSave}
                onPress={onSave}
              >
                <Text style={styles.emptyCtaText}>Save Card</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[styles.addNewRow, { borderColor: activeTheme.primary }]}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={activeTheme.primary} />
              <Text style={[styles.addNewText, { color: activeTheme.primary }]}>Add a Card</Text>
            </Pressable>
          )
        }
      />
    </KeyboardAvoidingView>
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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  optionLabel: { fontSize: 14, color: colors.ink },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  toggleSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  contactText: { fontWeight: "700", fontSize: 14 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyMsg: { fontSize: 14, color: colors.inkSoft, marginBottom: spacing.xl, textAlign: "center" },
  emptyCta: {
    backgroundColor: colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: radius.sm,
  },
  btnDisabled: { opacity: 0.5 },
  emptyCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sellerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  sellerTitle: { ...typography.h1, marginBottom: spacing.sm },
  sellerSub: { fontSize: 13, color: colors.inkSoft, lineHeight: 19, marginBottom: spacing.lg },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.md },
  bulletText: { fontSize: 13, color: colors.ink, flexShrink: 1 },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addressName: { fontWeight: "700", fontSize: 14, color: colors.ink },
  addressPhone: { fontWeight: "400", color: colors.inkSoft },
  addressLine: { fontSize: 12.5, color: colors.inkSoft, marginTop: 4, lineHeight: 18 },
  deliverBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  deliverBadgeText: { fontSize: 10.5, fontWeight: "700", color: "#fff" },
  setCurrentText: { fontSize: 12, fontWeight: "700", marginTop: spacing.sm },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addNewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.blue,
    borderStyle: "dashed",
    borderRadius: radius.md,
  },
  addNewText: { fontWeight: "700", fontSize: 14 },
  formCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  formNote: { fontSize: 11, color: colors.inkSoft, fontStyle: "italic" },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderIdText: { fontWeight: "700", fontSize: 13, color: colors.ink },
  statusBadge: { backgroundColor: "#e6f4ea", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 9.5, fontWeight: "800", color: colors.green },
  orderDate: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  orderItemsRow: { flexDirection: "row", marginTop: spacing.sm },
  orderItemsSummary: { fontSize: 12, color: colors.inkSoft, marginTop: 4 },
  orderFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  orderTotal: { fontWeight: "800", fontSize: 14, color: colors.ink },
  orderPayment: { fontSize: 11.5, color: colors.inkSoft },
  orderDetailsLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  orderDetailsLink: { fontSize: 12, fontWeight: "700" },
  wishlistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  wishlistThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistPrice: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  moveToCartBtn: {
    backgroundColor: colors.blue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  moveToCartText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  couponCard: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  couponLeft: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  couponCode: { fontWeight: "800", fontSize: 14, color: colors.ink, letterSpacing: 0.5 },
  couponLabel: { fontSize: 12.5, color: colors.ink, marginTop: 3 },
  couponSub: { fontSize: 11, color: colors.inkSoft, marginTop: 2 },
  themeIntro: { fontSize: 12.5, color: colors.inkSoft, marginBottom: spacing.lg, lineHeight: 18 },
  themeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  themeSwatchRow: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
  themeSwatch: { width: 28, height: 28, borderRadius: 14 },
  themeName: { fontSize: 13, fontWeight: "700", color: colors.ink },
  themeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
