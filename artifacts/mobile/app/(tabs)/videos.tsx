import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent, VideoItem } from "@/contexts/ContentContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function VideosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { videos } = useContent();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleSelect = (video: VideoItem) => {
    setSelectedVideo(video);
    setPlaying(true);
    setLoading(true);
  };

  const renderVideo = ({ item }: { item: VideoItem }) => {
    const isSelected = selectedVideo?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.videoCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.accent : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.85}
      >
        <View style={styles.thumbContainer}>
          <Image
            source={{
              uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
            }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <View
              style={[
                styles.playBtn,
                { backgroundColor: isSelected ? colors.accent : "rgba(0,0,0,0.55)" },
              ]}
            >
              <Feather name="play" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>
        <View style={styles.videoMeta}>
          <Text
            style={[styles.videoTitle, { color: colors.cardForeground }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              style={[styles.videoDesc, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
          <Text style={[styles.videoDate, { color: colors.mutedForeground }]}>
            {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSub}>
          {videos.length} sermon{videos.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Player */}
      {selectedVideo && (
        <View
          style={[
            styles.playerContainer,
            { backgroundColor: "#000" },
          ]}
        >
          {loading && (
            <View style={styles.playerLoading}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          )}
          <YoutubePlayer
            height={Math.round((width * 9) / 16)}
            videoId={selectedVideo.videoId}
            play={playing}
            onReady={() => setLoading(false)}
            onChangeState={(state) => {
              if (state === "ended") setPlaying(false);
            }}
          />
          <View style={styles.nowPlaying}>
            <Feather name="music" size={13} color={colors.accent} />
            <Text
              style={[styles.nowPlayingText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {selectedVideo.title}
            </Text>
            <TouchableOpacity onPress={() => { setSelectedVideo(null); setPlaying(false); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideo}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="video-off" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No videos yet
            </Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
              Admin can add videos in Settings
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  playerContainer: {
    width: "100%",
  },
  playerLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Math.round((width * 9) / 16),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#111",
  },
  nowPlayingText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  videoCard: {
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    gap: 12,
    padding: 10,
  },
  thumbContainer: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  videoMeta: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 19,
  },
  videoDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  videoDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
