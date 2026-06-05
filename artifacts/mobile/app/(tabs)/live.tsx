import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent, LiveStream } from "@/contexts/ContentContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = Math.round((width * 9) / 16);

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { liveStreams } = useContent();
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [webLoading, setWebLoading] = useState(false);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleSelect = (stream: LiveStream) => {
    setSelectedStream(stream);
    setWebLoading(true);
  };

  const renderStream = ({ item }: { item: LiveStream }) => {
    const isSelected = selectedStream?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.streamCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.accent : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={item.isActive ? ["#0B2A7A", "#1A4DBF"] : ["#4B5563", "#6B7280"]}
          style={styles.streamIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="radio" size={22} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.streamMeta}>
          <Text
            style={[styles.streamTitle, { color: colors.cardForeground }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={styles.statusRow}>
            {item.isActive ? (
              <>
                <View style={styles.liveDot} />
                <Text style={[styles.statusText, { color: "#EF4444" }]}>
                  Live Stream Available
                </Text>
              </>
            ) : (
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                Offline
              </Text>
            )}
          </View>
        </View>
        <View style={styles.watchBtn}>
          <Feather
            name={isSelected ? "tv" : "play-circle"}
            size={22}
            color={isSelected ? colors.accent : colors.mutedForeground}
          />
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
          { paddingTop: topPad + 16, backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Live</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          Watch services and programs live
        </Text>
      </View>

      {/* WebView Player */}
      {selectedStream && (
        <View style={[styles.playerWrapper, { backgroundColor: "#000" }]}>
          {webLoading && (
            <View style={[styles.playerLoading, { height: PLAYER_HEIGHT }]}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.loadingText}>Loading stream...</Text>
            </View>
          )}
          {Platform.OS === "web" ? (
            <iframe
              src={selectedStream.embedUrl}
              width="100%"
              height={PLAYER_HEIGHT}
              style={{ border: "none" }}
              allow="autoplay; fullscreen"
              title={selectedStream.title}
            />
          ) : (
            <WebView
              source={{ uri: selectedStream.embedUrl }}
              style={{ width, height: PLAYER_HEIGHT }}
              onLoad={() => setWebLoading(false)}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
            />
          )}
          <TouchableOpacity
            style={[styles.closePlayer, { backgroundColor: colors.card }]}
            onPress={() => setSelectedStream(null)}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
            <Text style={[styles.closePlayerText, { color: colors.mutedForeground }]}>
              Close Player
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stream List */}
      <FlatList
        data={liveStreams}
        keyExtractor={(item) => item.id}
        renderItem={renderStream}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !selectedStream ? (
            <View
              style={[
                styles.youtubeHint,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Feather name="youtube" size={16} color="#FF0000" />
              <Text style={[styles.youtubeHintText, { color: colors.mutedForeground }]}>
                Tap a stream below to watch live on YouTube
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="radio" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No live streams configured
            </Text>
            <Text style={[styles.emptySubText, { color: colors.mutedForeground }]}>
              Admin can add streams in Settings
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveBadgeText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  headerSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  playerWrapper: {
    width: "100%",
  },
  playerLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  closePlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  closePlayerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  youtubeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  youtubeHintText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  streamCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  streamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  streamMeta: {
    flex: 1,
    gap: 4,
  },
  streamTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  watchBtn: {
    padding: 6,
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
