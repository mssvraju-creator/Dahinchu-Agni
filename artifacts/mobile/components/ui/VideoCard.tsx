import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { YouTubeVideo } from "@/hooks/useYouTubeFeed";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  video: YouTubeVideo;
  featured?: boolean;
  compact?: boolean;
}

export function VideoCard({ video, featured, compact }: Props) {
  const colors = useColors();

  async function handlePress() {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    await WebBrowser.openBrowserAsync(video.videoUrl);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={
        featured
          ? [styles.featured, { backgroundColor: colors.card, borderColor: colors.border }]
          : [styles.card, { backgroundColor: colors.card, borderColor: colors.border }]
      }
    >
      {featured ? (
        <>
          <View style={styles.featuredThumb}>
            <Image source={{ uri: video.thumbnailUrl }} style={styles.featuredImage} resizeMode="cover" />
            <View style={styles.playOverlay}>
              <View style={[styles.playBtn, { backgroundColor: "#E84C1E" }]}>
                <Feather name="play" size={22} color="#FFFFFF" />
              </View>
            </View>
            {video.isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.featuredInfo}>
            <Text style={[styles.featuredTitle, { color: colors.foreground }]} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(video.published)}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.thumbContainer}>
            <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.playSmall}>
              <Feather name="play" size={11} color="#FFFFFF" />
            </View>
            {video.isLive ? (
              <View style={styles.liveBadgeSmall}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTextSmall}>LIVE</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(video.published)}</Text>
            <Text style={[styles.channel, { color: colors.mutedForeground }]}>{video.channelName}</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
  },
  featuredThumb: {
    height: 200,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  playBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#DC2626",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  featuredInfo: {
    padding: 14,
    gap: 4,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 10,
    gap: 12,
  },
  thumbContainer: {
    width: 110,
    height: 72,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  playSmall: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(232,76,30,0.85)",
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadgeSmall: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#DC2626",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  liveTextSmall: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 3,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  channel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
