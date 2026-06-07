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

const TABS = ["All", "Sermons", "Teaching", "Lives", "Shorts"] as const;
type Tab = (typeof TABS)[number];

const TAB_CATEGORY: Record<Tab, string | null> = {
  All: null,
  Sermons: "sermon",
  Teaching: "teaching",
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
    data: pages,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllVideos();
  const { data: liveVideo, isLoading: liveLoading } = useLiveStream();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [livePlayerVisible, setLivePlayerVisible] = useState(false);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const allVideos = useMemo(
    () => pages?.pages.flatMap((p) => p.videos) ?? [],
    [pages]
  );

  const filtered = useMemo(() => filterByTab(allVideos, activeTab), [allVideos, activeTab]);

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
            tintColor={colors.primary}
          />
        }
      >
        {/* Watch Live Banner */}
        {liveLoading ? (
          <View style={[styles.noLiveBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.noLiveTitle, { color: colors.mutedForeground }]}>Checking for live stream…</Text>
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
              colors={["#DC2626", "#B91C1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.liveBannerGradient}
            >
              <View style={styles.liveIndicatorPulse}>
                <View style={styles.liveDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveBannerTitle}>LIVE NOW</Text>
                <Text style={styles.liveBannerSub} numberOfLines={1}>
                  {liveVideo.title}
                </Text>
              </View>
              <View style={styles.livePlayBadge}>
                <Feather name="play" size={12} color="#FFFFFF" />
                <Text style={styles.livePlayText}>Watch In App</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl + "/live");
            }}
          >
            <View style={[styles.noLiveBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.noLiveDot, { backgroundColor: colors.mutedForeground }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noLiveTitle, { color: colors.foreground }]}>
                  No Live Stream Right Now
                </Text>
                <Text style={[styles.noLiveSub, { color: colors.mutedForeground }]}>
                  Tap to check our YouTube channel for upcoming streams
                </Text>
              </View>
              <Feather name="external-link" size={16} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        )}

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={async () => {
                await Haptics.selectionAsync();
                setActiveTab(tab);
              }}
              style={[
                styles.tab,
                activeTab === tab
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Count badge */}
        {!isLoading && filtered.length > 0 ? (
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {filtered.length} video{filtered.length !== 1 ? "s" : ""}
          </Text>
        ) : null}

        {/* Video Grid */}
        <View style={styles.videoList}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                Loading videos…
              </Text>
            </View>
          ) : isError ? (
            <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
              <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                Couldn't load videos
              </Text>
              <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
                Check your connection or visit our YouTube channel directly.
              </Text>
              <TouchableOpacity
                style={[styles.youtubeBtn, { backgroundColor: "#DC2626" }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl);
                }}
              >
                <Feather name="youtube" size={16} color="#FFFFFF" />
                <Text style={styles.youtubeBtnText}>Open YouTube Channel</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="film" size={32} color={colors.mutedForeground} />
              <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                No {activeTab} videos yet
              </Text>
              <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
                {activeTab === "Lives"
                  ? "Live streams will appear here when the channel goes live."
                  : "More content coming soon."}
              </Text>
            </View>
          ) : (
            <>
              {filtered[0] ? <VideoCard video={filtered[0]} featured /> : null}
              {filtered.slice(1).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}

              {hasNextPage ? (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { borderColor: colors.border }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    fetchNextPage();
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                      Load more videos
                    </Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
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
  liveBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 14,
    overflow: "hidden",
  },
  liveBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  liveIndicatorPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  liveBannerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  liveBannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular" },
  livePlayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  livePlayText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  noLiveBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noLiveDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  noLiveTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  noLiveSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  countText: { fontSize: 12, fontFamily: "Inter_400Regular", marginHorizontal: 16, marginBottom: 4 },
  videoList: { paddingHorizontal: 16 },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  errorTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  errorSub: { fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 19 },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  youtubeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  youtubeBtnText: { color: "#FFFFFF", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  loadMoreBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  loadMoreText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
