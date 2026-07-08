import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
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
  const [loading, setLoading] = useState(true);

  function handleClose() {
    setLoading(true);
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Feather name="chevron-down" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.playerWrap, { height: PLAYER_HEIGHT }]}>
          {loading && (
            <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
              <ActivityIndicator color="#E84C1E" size="large" />
            </View>
          )}
          <WebView
            source={{ uri: `https://www.youtube.com/watch?v=${videoId}` }}
            style={{ width, height: PLAYER_HEIGHT }}
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            scrollEnabled={false}
            bounces={false}
          />
        </View>

        <View style={styles.info}>
          <Text style={[styles.titleText, { color: colors.foreground }]} numberOfLines={2}>{title}</Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDate(published)} · {channelName}
          </Text>
        </View>

        <View style={[styles.tipRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.tip, { color: colors.mutedForeground }]}>
            Tap the video to play
          </Text>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  playerWrap: {
    backgroundColor: "#000",
    position: "relative",
  },
  loadingOverlay: {
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  info: {
    padding: 18,
    gap: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  tipRow: {
    paddingHorizontal: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tip: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
