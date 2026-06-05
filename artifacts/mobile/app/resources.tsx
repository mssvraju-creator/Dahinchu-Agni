import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { useColors } from "@/hooks/useColors";
import { useAdmin } from "@/context/AdminContext";
import { MinistryResource } from "@/constants/ministry";

const CATEGORY_LABELS: Record<MinistryResource["category"], string> = {
  "bible-study": "Bible Study",
  devotional: "Devotional",
  training: "Training",
  prayer: "Prayer",
  pdf: "PDF",
  discipleship: "Discipleship",
};

const CATEGORY_COLORS: Record<MinistryResource["category"], string> = {
  "bible-study": "#2563EB",
  devotional: "#7C3AED",
  training: "#059669",
  prayer: "#D97706",
  pdf: "#DC2626",
  discipleship: "#E84C1E",
};

const FILTERS = ["All", "Bible Study", "Devotional", "Training", "Prayer", "Discipleship"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_MAP: Record<Filter, MinistryResource["category"] | null> = {
  All: null,
  "Bible Study": "bible-study",
  Devotional: "devotional",
  Training: "training",
  Prayer: "prayer",
  Discipleship: "discipleship",
};

function ResourceCard({ resource }: { resource: MinistryResource }) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[resource.category] ?? colors.primary;
  const catLabel = CATEGORY_LABELS[resource.category];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={async () => {
        if (!resource.url) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await WebBrowser.openBrowserAsync(resource.url);
      }}
    >
      <View style={[styles.cardIcon, { backgroundColor: catColor + "18" }]}>
        <Feather name={resource.type === "pdf" ? "file-text" : resource.type === "video" ? "play-circle" : "book-open"} size={20} color={catColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{resource.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: catColor + "18" }]}>
            <Text style={[styles.typeBadgeText, { color: catColor }]}>{catLabel}</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{resource.description}</Text>
        <View style={styles.cardMeta}>
          {resource.isFree ? (
            <View style={[styles.freeBadge, { backgroundColor: "#05966918" }]}>
              <Text style={[styles.freeBadgeText, { color: "#059669" }]}>Free</Text>
            </View>
          ) : null}
          {resource.author ? <Text style={[styles.author, { color: colors.mutedForeground }]}>{resource.author}</Text> : null}
          {resource.url ? (
            <View style={styles.downloadIcon}>
              <Feather name="external-link" size={12} color={catColor} />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ResourcesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resources } = useAdmin();
  const [filter, setFilter] = useState<Filter>("All");

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const filtered = filter === "All"
    ? resources
    : resources.filter((r) => r.category === FILTER_MAP[filter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader subtitle="Resource Library" showBack onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
      >
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={async () => {
                await Haptics.selectionAsync();
                setFilter(f);
              }}
              style={[
                styles.filterBtn,
                filter === f
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.filterBtnText, { color: filter === f ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="book-open" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No resources found</Text>
            </View>
          ) : (
            filtered.map((r) => <ResourceCard key={r.id} resource={r} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterBtnText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, flexShrink: 0 },
  typeBadgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  freeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  freeBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  author: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  downloadIcon: { marginLeft: "auto" },
  emptyCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 36, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
