import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent } from "@/contexts/ContentContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const LOGO_URL = "http://www.dahinchuagni.in/images/logo.png";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { videos, liveStreams, announcements } = useContent();
  const [logoError, setLogoError] = useState(false);

  const activeLive = liveStreams.filter((l) => l.isActive);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <LinearGradient
        colors={["#0B2A7A", "#1A4DBF", "#0B2A7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.banner, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.bannerContent}>
          {!logoError ? (
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: "#E05A1F" }]}>
              <Text style={styles.logoFallbackText}>DA</Text>
            </View>
          )}
          <Text style={styles.ministryName}>Dahinchu Agni</Text>
          <Text style={styles.ministryTagline}>Consuming Fire Ministries</Text>
          <Text style={styles.ministryLocation}>Rajahmundry, Andhra Pradesh</Text>
        </View>
      </LinearGradient>

      {/* Announcements */}
      {announcements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Announcements
            </Text>
          </View>
          {announcements.map((a) => (
            <View
              key={a.id}
              style={[
                styles.announcementCard,
                {
                  backgroundColor: colors.secondary,
                  borderLeftColor: colors.accent,
                },
              ]}
            >
              <Text style={[styles.announcementText, { color: colors.secondaryForeground }]}>
                {a.text}
              </Text>
              <Text style={[styles.announcementDate, { color: colors.mutedForeground }]}>
                {a.date}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Live Now */}
      {activeLive.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveDot} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Live Now
            </Text>
          </View>
          {activeLive.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[styles.liveCard, { backgroundColor: "#0B2A7A" }]}
              onPress={() => router.push("/(tabs)/live")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#0B2A7A", "#1A4DBF"]}
                style={styles.liveCardGradient}
              >
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
                <Text style={styles.liveCardTitle}>{l.title}</Text>
                <Text style={styles.liveCardSub}>Tap to watch</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Videos */}
      {videos.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
            <View style={styles.sectionHeader}>
              <Feather name="play-circle" size={16} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Recent Messages
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/videos")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={videos.slice(0, 5)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.videosRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)/videos")}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` }}
                  style={styles.videoThumb}
                  resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                  <Feather name="play-circle" size={28} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.videoInfo}>
                  <Text
                    style={[styles.videoTitle, { color: colors.cardForeground }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.videoDate, { color: colors.mutedForeground }]}>
                    {item.date}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Ministry Info */}
      <View style={styles.section}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>
            About Dahinchu Agni
          </Text>
          <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>
            Founded in 1994 by Dr. Thomas, Dahinchu Agni (Consuming Fire)
            Ministries is based in Rajahmundry, Andhra Pradesh. With 17 kinds of
            ministries, Dr. Thomas spreads the Gospel across India through
            television, prayer meetings, and pastoral fellowships.
          </Text>
          <TouchableOpacity
            style={[styles.websiteBtn, { borderColor: colors.primary }]}
            onPress={() => {}}
          >
            <Feather name="globe" size={14} color={colors.primary} />
            <Text style={[styles.websiteBtnText, { color: colors.primary }]}>
              www.dahinchuagni.in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  bannerContent: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  logoFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoFallbackText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  ministryName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  ministryTagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  ministryLocation: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  announcementCard: {
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  announcementText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  announcementDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveCard: {
    borderRadius: 14,
    overflow: "hidden",
  },
  liveCardGradient: {
    padding: 20,
    gap: 6,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  liveBadgeText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  liveCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  liveCardSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  videosRow: {
    paddingLeft: 2,
    paddingRight: 20,
    gap: 14,
  },
  videoCard: {
    width: width * 0.6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  videoThumb: {
    width: "100%",
    height: 110,
    backgroundColor: "#E5E7EB",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    height: 110,
  },
  videoInfo: { padding: 10, gap: 4 },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  videoDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  infoCard: {
    borderRadius: 14,
    padding: 18,
    gap: 10,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  infoBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  websiteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  websiteBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
