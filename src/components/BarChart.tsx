import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";

export interface ChartDatum {
  label: string;
  value: number;
}

interface Props {
  title: string;
  data: ChartDatum[];
  color: string;
  orientation?: "vertical" | "horizontal";
  valueFormatter?: (v: number) => string;
}

export default function BarChart({ title, data, color, orientation = "vertical", valueFormatter }: Props) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const format = valueFormatter ?? ((v: number) => String(v));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {orientation === "vertical" ? (
        <View style={styles.columnsRow}>
          {data.map((d) => (
            <View key={d.label} style={styles.column}>
              <Text style={styles.columnValue}>{format(d.value)}</Text>
              <View style={styles.columnTrack}>
                <View
                  style={[
                    styles.columnFill,
                    { height: `${Math.max(4, (d.value / maxValue) * 100)}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.columnLabel} numberOfLines={1}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View>
          {data.map((d) => (
            <View key={d.label} style={styles.row}>
              <Text style={styles.rowLabel} numberOfLines={1}>
                {d.label}
              </Text>
              <View style={styles.rowTrack}>
                <View
                  style={[
                    styles.rowFill,
                    { width: `${Math.max(4, (d.value / maxValue) * 100)}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.rowValue}>{format(d.value)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.ink, marginBottom: spacing.md },
  columnsRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 140 },
  column: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  columnValue: { fontSize: 9, color: colors.inkSoft, marginBottom: 3 },
  columnTrack: { width: 16, flex: 1, backgroundColor: colors.bg, borderRadius: 4, justifyContent: "flex-end", overflow: "hidden" },
  columnFill: { width: "100%", borderRadius: 4 },
  columnLabel: { fontSize: 9.5, color: colors.inkSoft, marginTop: 6, maxWidth: 40, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  rowLabel: { width: 90, fontSize: 11.5, color: colors.ink },
  rowTrack: { flex: 1, height: 8, backgroundColor: colors.bg, borderRadius: 4, marginHorizontal: spacing.sm, overflow: "hidden" },
  rowFill: { height: "100%", borderRadius: 4 },
  rowValue: { width: 46, fontSize: 11, fontWeight: "700", color: colors.ink, textAlign: "right" },
});
