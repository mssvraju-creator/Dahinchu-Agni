import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { VideoCard } from "@/components/ui/VideoCard";
import { EventCard } from "@/components/ui/EventCard";
import { YouTubePlayer } from "@/components/ui/YouTubePlayer";
import { MINISTRY, BIBLE_VERSES, MinistryEvent } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";
import { useYouTubeFeed, useLiveStream } from "@/hooks/useYouTubeFeed";
import { useAdmin } from "@/context/AdminContext";

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

function StatCard({ number, label, idx }: { number: string; label: string; idx: number }) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay: idx * 80, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      <Text style={[styles.statNumber, { color: "#E84C1E", fontFamily: "DMSerifDisplay_400Regular" }]}>{number}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { data: videos, isLoading: videosLoading, refetch } = useYouTubeFeed();
  const { data: liveVideo } = useLiveStream();
  const { events, adminSettings } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [livePlayerVisible, setLivePlayerVisible] = useState(false);
  const [verseIdx] = useState(() => new Date().getDate() % BIBLE_VERSES.length);
  const verse = BIBLE_VERSES[verseIdx];

  // Pulsing animation for "LIVE NOW" banner
  const livePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!liveVideo) { livePulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1.015, duration: 800, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [liveVideo]);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .map((e) => ({ ...e, date: getNextOccurrenceDate(e) }))
    .filter((e) => new Date(e.date + "T00:00:00") >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const latestVideos = videos?.slice(0, 5) ?? [];

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  async function openLivePlayer() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLivePlayerVisible(true);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader
        isLive={!!liveVideo}
        onLiveBellPress={liveVideo ? openLivePlayer : undefined}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" />}
      >
        {/* Notice Banner */}
        {adminSettings.noticeText ? (
          <View style={[styles.noticeBanner, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
            <Feather name="bell" size={14} color="#F97316" />
            <Text style={[styles.noticeText, { color: "#431407" }]}>{adminSettings.noticeText}</Text>
          </View>
        ) : null}

        {/* LIVE NOW Banner — appears only when stream is active */}
        {liveVideo ? (
          <TouchableOpacity activeOpacity={0.9} onPress={openLivePlayer}>
            <Animated.View style={[styles.liveBannerWrap, { transform: [{ scale: livePulse }] }]}>
              <LinearGradient
                colors={["#DC2626", "#991B1B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.liveBannerGrad}
              >
                {/* Pulsing dot */}
                <View style={styles.liveIndicator}>
                  <View style={styles.liveRing} />
                  <View style={styles.liveDotCenter} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.liveBannerLabel}>🔴 LIVE NOW</Text>
                  <Text style={styles.liveBannerTitle} numberOfLines={1}>{liveVideo.title}</Text>
                  <Text style={styles.liveBannerSub}>Tap to watch in-app • Dahinchu Agni</Text>
                </View>

                <View style={styles.liveWatchBtn}>
                  <Feather name="play" size={14} color="#DC2626" />
                  <Text style={styles.liveWatchText}>Watch</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ) : null}

        {/* Bible Verse */}
        <LinearGradient
          colors={["#FFF7ED", "#FFECD2", "#FFF7ED"] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.verseCard, { borderColor: "#FED7AA" }]}
        >
          <Feather name="book-open" size={15} color="#F97316" style={{ marginBottom: 8 }} />
          <Text style={[styles.verseText, { color: "#431407" }]}>"{verse.text}"</Text>
          <Text style={[styles.verseRef, { color: "#E84C1E" }]}>{verse.ref}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {MINISTRY.stats.map((s, i) => (
            <StatCard key={s.label} number={s.number} label={s.label} idx={i} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {/* Watch Live button — animated red when actually live, static red otherwise */}
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: "#DC2626" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (liveVideo) {
                openLivePlayer();
              } else {
                await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl + "/live");
              }
            }}
          >
            <View style={[styles.liveDot, liveVideo ? styles.liveDotActive : null]} />
            <Text style={styles.quickBtnText}>{liveVideo ? "Watch Live" : "Watch Live"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: "#C8860A" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/give");
            }}
          >
            <Feather name="gift" size={14} color="#FFFFFF" />
            <Text style={styles.quickBtnText}>Give</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: "#7C3AED" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/prayer");
            }}
          >
            <Feather name="heart" size={14} color="#FFFFFF" />
            <Text style={styles.quickBtnText}>Prayer</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Messages from YouTube */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>
              Latest Messages
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/media")}>
              <Text style={[styles.seeAll, { color: "#E84C1E" }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {videosLoading ? (
            <View style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
                Loading latest messages...
              </Text>
            </View>
          ) : latestVideos.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="youtube" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No videos loaded</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Open on your phone to watch live & recorded messages
              </Text>
              <TouchableOpacity
                onPress={async () => { await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl); }}
                style={[styles.visitBtn, { backgroundColor: "#DC2626" }]}
              >
                <Feather name="external-link" size={13} color="#FFFFFF" />
                <Text style={styles.visitBtnText}>Open YouTube Channel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <VideoCard video={latestVideos[0]} featured />
              {latestVideos.slice(1, 4).map((v) => <VideoCard key={v.id} video={v} />)}
            </>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>
              Upcoming Events
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
              <Text style={[styles.seeAll, { color: "#E84C1E" }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="calendar" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No upcoming events</Text>
            </View>
          ) : (
            upcomingEvents.map((e) => <EventCard key={e.id} event={e} compact />)
          )}
        </View>

        {/* Calvary TV Banner */}
        <TouchableOpacity
          style={{ marginHorizontal: 16, marginBottom: 20 }}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl);
          }}
        >
          <LinearGradient
            colors={["#1C1C1C", "#2D1515"] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.calvaryBanner}
          >
            <View style={[styles.calvaryIcon, { backgroundColor: "#E84C1E22" }]}>
              <Feather name="tv" size={20} color="#E84C1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calvaryTitle}>Calvary TV Ministry</Text>
              <Text style={styles.calvarySub}>
                Watch Sunday services, Pastor's meetings & live programs
              </Text>
            </View>
            <Feather name="external-link" size={16} color="#E84C1E" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* In-App Live Stream Player */}
      {liveVideo ? (
        <YouTubePlayer
          visible={livePlayerVisible}
          videoId={liveVideo.id}
          title={liveVideo.title}
          published={liveVideo.published}
          channelName={liveVideo.channelName}
          onClose={() => setLivePlayerVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  noticeBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  liveBannerWrap: { marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: "hidden" },
  liveBannerGrad: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  liveIndicator: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  liveRing: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  liveDotCenter: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFFFFF" },
  liveBannerLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  liveBannerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    lineHeight: 19,
  },
  liveBannerSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  liveWatchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveWatchText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },

  verseCard: { margin: 16, marginTop: 14, borderRadius: 16, padding: 18, borderWidth: 1 },
  verseText: { fontSize: 15, lineHeight: 23, fontStyle: "italic", marginBottom: 10, fontFamily: "Inter_400Regular" },
  verseRef: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 3 },
  statNumber: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" },

  quickActions: { flexDirection: "row", marginHorizontal: 16, gap: 10, marginBottom: 20 },
  quickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  quickBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "rgba(255,255,255,0.6)" },
  liveDotActive: { backgroundColor: "#FFFFFF" },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 22, fontWeight: "600" },
  seeAll: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  skeletonCard: { borderRadius: 12, padding: 20, alignItems: "center" },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  visitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  visitBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  calvaryBanner: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  calvaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  calvaryTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  calvarySub: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
