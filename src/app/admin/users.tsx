import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/theme/colors";
import type { AppDispatch, RootState } from "@/store/store";
import { blockUser, unblockUser, deleteUser, type RegisteredUser } from "@/store/slices/usersSlice";

const ADMIN_COLOR = "#6c2eb5";

export default function AdminUsersScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users.users);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobileNumber.includes(q)
    );
  }, [users, query]);

  const onToggleBlock = (u: RegisteredUser) => {
    if (u.blocked) {
      dispatch(unblockUser(u.id));
    } else {
      Alert.alert("Block User", `Block ${u.firstName} ${u.lastName}? They won't be able to log in.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Block", style: "destructive", onPress: () => dispatch(blockUser(u.id)) },
      ]);
    }
  };

  const onDelete = (u: RegisteredUser) => {
    Alert.alert("Delete User", `Permanently delete ${u.firstName} ${u.lastName}'s account?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteUser(u.id)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{users.length} registered</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or mobile"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color="#aaa" />
          </Pressable>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="people-outline" size={40} color="#bbb" />
          <Text style={styles.emptyText}>{users.length === 0 ? "No users registered yet." : "No users match your search."}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                  {item.blocked && (
                    <View style={styles.blockedBadge}>
                      <Text style={styles.blockedBadgeText}>BLOCKED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.meta}>{item.email}</Text>
                <Text style={styles.meta}>{item.mobileNumber}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => onToggleBlock(item)} hitSlop={8}>
                  <Ionicons
                    name={item.blocked ? "lock-open-outline" : "lock-closed-outline"}
                    size={19}
                    color={item.blocked ? colors.green : "#e67e22"}
                  />
                </Pressable>
                <Pressable onPress={() => onDelete(item)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={19} color="#c0392b" />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
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
  headerSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    margin: spacing.md,
    marginBottom: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink, padding: 0 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  emptyText: { fontSize: 13, color: colors.inkSoft },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ADMIN_COLOR + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: ADMIN_COLOR, fontWeight: "800", fontSize: 15 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 13.5, fontWeight: "700", color: colors.ink },
  blockedBadge: { backgroundColor: "#fdecea", borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  blockedBadgeText: { fontSize: 8.5, fontWeight: "800", color: "#c0392b" },
  meta: { fontSize: 11, color: colors.inkSoft, marginTop: 1 },
  actions: { flexDirection: "row", gap: spacing.md },
});
