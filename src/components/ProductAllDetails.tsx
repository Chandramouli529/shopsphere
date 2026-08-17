import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/colors";
import { useAppTheme } from "@/theme/useAppTheme";
import type { Highlight, SpecGroup } from "@/utils/productDetails";

type Tab = "Showcase" | "Specifications" | "Warranty" | "Manufacturer";
const TABS: Tab[] = ["Showcase", "Specifications", "Warranty", "Manufacturer"];

interface Props {
  highlights: Highlight[];
  specGroups: SpecGroup[];
  warrantyText: string;
  manufacturerInfo: { label: string; value: string }[];
}

export default function ProductAllDetails({
  highlights,
  specGroups,
  warrantyText,
  manufacturerInfo,
}: Props) {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<Tab>("Specifications");

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                key={tab}
                style={[styles.tab, isActive && { backgroundColor: theme.primary }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {activeTab === "Showcase" && (
        <View>
          {highlights.map((h, i) => (
            <View key={i} style={styles.showcaseRow}>
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              <Text style={styles.showcaseText}>
                {h.label}
                {h.sub ? ` — ${h.sub}` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === "Specifications" &&
        specGroups.map((group) => (
          <View key={group.title} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.specGrid}>
              {group.rows.map((row) => (
                <View key={row.label} style={styles.specCell}>
                  <Text style={styles.specLabel}>{row.label}</Text>
                  <Text style={styles.specValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

      {activeTab === "Warranty" && <Text style={styles.bodyText}>{warrantyText}</Text>}

      {activeTab === "Manufacturer" && (
        <View>
          {manufacturerInfo.map((row) => (
            <View key={row.label} style={styles.manuRow}>
              <Text style={styles.specLabel}>{row.label}</Text>
              <Text style={styles.manuValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
  },
  tabText: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  tabTextActive: { color: "#fff" },
  showcaseRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  showcaseText: { flex: 1, fontSize: 13.5, color: colors.ink, lineHeight: 19 },
  groupTitle: { ...typography.h3, fontSize: 14, marginBottom: spacing.md },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  specCell: { width: "45%" },
  specLabel: { fontSize: 12, color: colors.inkSoft, marginBottom: 2 },
  specValue: { fontSize: 14, color: colors.ink, fontWeight: "600" },
  bodyText: { fontSize: 13.5, color: colors.ink, lineHeight: 20 },
  manuRow: { marginBottom: spacing.md },
  manuValue: { fontSize: 13.5, color: colors.ink, fontWeight: "600", lineHeight: 19 },
});
