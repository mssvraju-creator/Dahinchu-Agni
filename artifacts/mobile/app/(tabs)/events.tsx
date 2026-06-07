import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { EventCard } from "@/components/ui/EventCard";
import { useColors } from "@/hooks/useColors";
import { useAdmin } from "@/context/AdminContext";
import { MinistryEvent } from "@/constants/ministry";

const CATEGORIES = ["All", "Services", "Prayer", "Training", "Youth", "Conference", "Special"] as const;
type Category = (typeof CATEGORIES)[number];

const CAT_MAP: Record<Category, MinistryEvent["category"] | null> = {
  All: null,
  Services: "service",
  Prayer: "prayer",
  Training: "training",
  Youth: "youth",
  Conference: "conference",
  Special: "special",
};

const DAY_TO_NUM: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function getNextOccurrenceDate(event: MinistryEvent): string {
  if (!event.isRecurring) return event.date;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(event.date + "T00:00:00");
  if (eventDate >= today) return event.date;

  const pattern = (event.recurringPattern || "").toLowerCase();

  for (const [dayName, dayNum] of Object.entries(DAY_TO_NUM)) {
    if (pattern.includes(dayName)) {
      const diff = (dayNum - today.getDay() + 7) % 7 || 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      return next.toISOString().split("T")[0];
    }
  }

  let d = new Date(eventDate);
  while (d < today) d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function EventsScreen() {
  const colors = useColors();
  const { events, isAdmin, deleteEvent } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedEvent, setSelectedEvent] = useState<MinistryEvent | null>(null);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .map((e) => ({ ...e, date: getNextOccurrenceDate(e) }))
    .filter((e) => new Date(e.date + "T00:00:00") >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filtered =
    activeCategory === "All"
      ? upcoming
      : upcoming.filter((e) => e.category === CAT_MAP[activeCategory]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader subtitle="Upcoming Events" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={async () => {
                await Haptics.selectionAsync();
                setActiveCategory(cat);
              }}
              style={[
                styles.catBtn,
                activeCategory === cat
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.catBtnText,
                  { color: activeCategory === cat ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isAdmin ? (
          <TouchableOpacity
            style={[styles.adminBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/admin");
            }}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.adminBtnText, { color: colors.primary }]}>Add Event (Admin)</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.eventsList}>
          {filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="calendar" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events found</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Check back soon for upcoming{activeCategory !== "All" ? ` ${activeCategory.toLowerCase()}` : ""} events.
              </Text>
            </View>
          ) : (
            filtered.map((event) => (
              <View key={event.id}>
                <EventCard
                  event={event}
                  onPress={() => setSelectedEvent(event)}
                />
                {isAdmin ? (
                  <TouchableOpacity
                    style={[styles.deleteBtn, { borderColor: "#EF4444" }]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      deleteEvent(event.id);
                    }}
                  >
                    <Feather name="trash-2" size={12} color="#EF4444" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={selectedEvent !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedEvent(null)}
      >
        {selectedEvent ? (
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]} numberOfLines={2}>
                {selectedEvent.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.closeBtn}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={[styles.infoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.infoRow}>
                  <Feather name="calendar" size={15} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Date</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {formatDate(getNextOccurrenceDate(selectedEvent))}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="clock" size={15} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Time</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]}>
                    {selectedEvent.time}{selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ""}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={15} color={colors.primary} />
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Location</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={2}>
                    {selectedEvent.location}
                  </Text>
                </View>
                {selectedEvent.recurringPattern ? (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}>
                      <Feather name="repeat" size={15} color={colors.primary} />
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Recurring</Text>
                      <Text style={[styles.infoValue, { color: colors.foreground }]}>{selectedEvent.recurringPattern}</Text>
                    </View>
                  </>
                ) : null}
              </View>

              <Text style={[styles.modalDesc, { color: colors.foreground }]}>
                {selectedEvent.description}
              </Text>

              {selectedEvent.registrationUrl ? (
                <TouchableOpacity
                  style={[styles.registerBtn, { backgroundColor: colors.primary }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Feather name="external-link" size={15} color="#FFFFFF" />
                  <Text style={styles.registerBtnText}>Register / Learn More</Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  catBtnText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  adminBtn: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderStyle: "dashed" },
  adminBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  eventsList: { paddingHorizontal: 16 },
  emptyCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 36, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 19 },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12, marginTop: -8 },
  deleteBtnText: { color: "#EF4444", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 12 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 24 },
  closeBtn: { padding: 4 },
  modalContent: { padding: 20, gap: 16 },
  infoBlock: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  infoLabel: { fontSize: 13, fontFamily: "Inter_500Medium", width: 70 },
  infoValue: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  divider: { height: 1 },
  modalDesc: { fontSize: 15, lineHeight: 23, fontFamily: "Inter_400Regular" },
  registerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  registerBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
