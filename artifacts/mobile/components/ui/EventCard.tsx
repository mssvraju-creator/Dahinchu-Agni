import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MinistryEvent } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<MinistryEvent["category"], string> = {
  service: "#2563EB",
  prayer: "#7C3AED",
  conference: "#E84C1E",
  training: "#059669",
  youth: "#F59E0B",
  special: "#DC2626",
};

const CATEGORY_ICONS: Record<MinistryEvent["category"], string> = {
  service: "sun",
  prayer: "heart",
  conference: "users",
  training: "book-open",
  youth: "zap",
  special: "star",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function getDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate().toString();
}

interface Props {
  event: MinistryEvent;
  onPress?: () => void;
  compact?: boolean;
}

export function EventCard({ event, onPress, compact }: Props) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[event.category];
  const catIcon = CATEGORY_ICONS[event.category] as any;

  async function handlePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.dateBadge, { backgroundColor: catColor + "18" }]}>
        <Text style={[styles.dateMonth, { color: catColor }]}>{getMonth(event.date)}</Text>
        <Text style={[styles.dateDay, { color: catColor }]}>{getDay(event.date)}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={compact ? 1 : 2}>
            {event.title}
          </Text>
          {event.isRecurring ? (
            <Feather name="repeat" size={12} color={colors.mutedForeground} />
          ) : null}
        </View>

        <View style={styles.meta}>
          <Feather name="clock" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {event.time}{event.endTime ? ` – ${event.endTime}` : ""}{event.recurringPattern ? ` · ${event.recurringPattern}` : ""}
          </Text>
        </View>

        <View style={styles.meta}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {!compact && event.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        {!compact && event.registrationUrl ? (
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: catColor }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await WebBrowser.openBrowserAsync(event.registrationUrl!);
            }}
          >
            <Text style={styles.registerBtnText}>Register</Text>
            <Feather name="external-link" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.categoryDot, { backgroundColor: catColor }]}>
        <Feather name={catIcon} size={12} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  dateBadge: {
    width: 48,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  dateDay: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  categoryDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "flex-start",
  },
});
