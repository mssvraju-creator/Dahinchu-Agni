import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as StatusBar from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer, { PLAYER_STATES } from "react-native-youtube-iframe";
import { useColors } from "@/hooks/useColors";

interface Props {
  videoId: string;
  title: string;
  published: string;
  channelName: string;
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = Math.round((width * 9) / 16);

export function YouTubePlayer({ videoId, title, published, channelName, visible, onClose }: Props) {
  const colors = useColors();
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState("");

  const onStateChange = useCallback((state: string) => {
    if (state === PLAYER_STATES.ENDED) {
      setPlaying(false);
    }
  }, []);

  function handleClose() {
    setPlaying(false);
    setReady(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: "#0F0F0F" }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="chevron-down" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={[styles.channelBadge, { backgroundColor: "#E84C1E" }]}>
              <Feather name="youtube" size={10} color="#FFFFFF" />
            </View>
            <Text style={styles.headerChannel} numberOfLines={1}>{channelName}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Player */}
        <View style={[styles.playerWrapper, { height: PLAYER_HEIGHT }]}>
          {!ready ? (
            <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
              <ActivityIndicator color="#E84C1E" size="large" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          ) : null}
          <YoutubePlayer
            ref={playerRef}
            height={PLAYER_HEIGHT}
            width={width}
            play={playing}
            videoId={videoId}
            onChangeState={onStateChange}
            onReady={() => {
              setReady(true);
              setPlaying(true);
            }}
            onError={(e) => {
              setReady(true);
            }}
            webViewProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
              allowsFullscreenVideo: true,
            }}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              rel: false,
              showClosedCaptions: false,
            }}
            volume={100}
            mute={false}
          />
        </View>

        {/* Video Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={3}>{title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{formatDate(published)}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.channel}>{channelName}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: playing ? "#E84C1E22" : "#FFFFFF22" }]}
            onPress={() => {
              setPlaying((p) => !p);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather name={playing ? "pause" : "play"} size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  channelBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerChannel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  playerWrapper: {
    backgroundColor: "#000000",
    position: "relative",
  },
  loadingOverlay: {
    backgroundColor: "#0F0F0F",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  info: {
    padding: 18,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  metaSep: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
  },
  channel: {
    color: "#E84C1E",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 20,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
