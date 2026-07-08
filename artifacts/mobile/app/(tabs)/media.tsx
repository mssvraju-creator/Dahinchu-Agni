import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { YouTubePlayer } from "@/components/ui/YouTubePlayer";
import { MINISTRY } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";
import { useAllVideos, useLiveStream, getVideoCategory, YouTubeVideo } from "@/hooks/useYouTubeFeed";

const TABS = ["All", "Sermons", "Teaching", "Worship", "Lives", "Shorts"] as const;
type Tab = (typeof TABS)[number];

const TAB_CATEGORY: Record<Tab, string | null> = {
  All: null,
  Sermons: "sermon",
  Teaching: "teaching",
  Worship: "worship",
  Lives: "live",
  Shorts: "short",
};

function filterByTab(videos: YouTubeVideo[], tab: Tab): YouTubeVideo[] {
  if (tab === "All") return videos;
  const cat = TAB_CATEGORY[tab];
  return videos.filter((v) => getVideoCategory(v) === cat);
}

export default function MediaScreen() {
  const colors = useColors();
  const {
    data: allVideos,
    isLoading,
    isError,
    refetch,
  } = useAllVideos();
  const { data: liveVideo, isLoading: liveLoading } = useLiveStream();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [livePlayerVisible, setLivePlayerVisible] = useState(false);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const filtered = useMemo(() => filterByTab(allVideos ?? [], activeTab), [allVideos, activeTab]);

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader subtitle="Media Center" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F97316"
          />
        }
      >
        {/* Watch Live Banner */}
        {liveLoading ? (
          <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color="#E84C1E" />
            <Text style={[styles.bannerText, { color: colors.mutedForeground }]}>Checking for live stream…</Text>
          </View>
        ) : liveVideo ? (
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.liveBanner}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setLivePlayerVisible(true);
            }}
          >
            <LinearGradient
              colors={["#DC2626", "#991B1B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.liveBannerGrad}
            >
              <View style={styles.liveDotWrap}>
                <View style={styles.liveDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveLabel}>LIVE NOW</Text>
                <Text style={styles.liveTitle} numberOfLines={1}>{liveVideo.title}</Text>
              </View>
              <View style={styles.liveBadge}>
                <Feather name="play" size={12} color="#FFFFFF" />
                <Text style={styles.liveBadgeText}>Watch</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl + "/live");
            }}
          >
            <View style={[styles.offDot, { backgroundColor: colors.mutedForeground }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.foreground }]}>No Live Stream</Text>
              <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
                Tap to check YouTube for upcoming streams
              </Text>
            </View>
            <Feather name="external-link" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={async () => { await Haptics.selectionAsync(); setActiveTab(tab); }}
              style={[
                styles.tab,
                activeTab === tab
                  ? { backgroundColor: "#E84C1E" }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? "#FFFFFF" : colors.mutedForeground }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video Grid */}
        <View style={styles.videoList}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#E84C1E" />
              <Text style={[styles.centerText, { color: colors.mutedForeground }]}>Loading videos…</Text>
            </View>
          ) : isError || filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="film" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {isError ? "Couldn't load videos" : `No ${activeTab} videos yet`}
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {isError
                  ? "Check your connection or visit our channel directly."
                  : "More content coming soon."}
              </Text>
              <TouchableOpacity
                style={[styles.ytBtn, { backgroundColor: "#DC2626" }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl);
                }}
              >
                <Feather name="youtube" size={16} color="#FFFFFF" />
                <Text style={styles.ytBtnText}>Open YouTube Channel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filtered[0] ? <VideoCard video={filtered[0]} featured /> : null}
              {filtered.slice(1).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
              <TouchableOpacity
                style={[styles.channelBtn, { backgroundColor: "#DC2626" }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl);
                }}
              >
                <Feather name="youtube" size={16} color="#FFFFFF" />
                <Text style={styles.channelBtnText}>View all videos on YouTube</Text>
                <Feather name="external-link" size={13} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

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
  banner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bannerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bannerTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  liveBanner: { marginHorizontal: 16, marginTop: 14, borderRadius: 14, overflow: "hidden" },
  liveBannerGrad: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  liveDotWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  liveLabel: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginBottom: 2 },
  liveTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  liveBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  offDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  tabsRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  videoList: { paddingHorizontal: 16 },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  centerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 28, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptySub: { fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 19 },
  ytBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  ytBtnText: { color: "#FFFFFF", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  channelBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 20, marginTop: 8 },
  channelBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
