import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { MINISTRY } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";
import { useAdmin } from "@/context/AdminContext";

const DA_LOGO = require("@/assets/images/da-logo.png");

interface MenuItem {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
  badge?: string;
}

function MenuRow({ item }: { item: MenuItem }) {
  const colors = useColors();
  const iconColor = item.color ?? "#E84C1E";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        item.onPress();
      }}
      style={[styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconColor + "16" }]}>
        <Feather name={item.icon as any} size={17} color={iconColor} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
        {item.sublabel ? <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sublabel}</Text> : null}
      </View>
      {item.badge ? (
        <View style={[styles.badge, { backgroundColor: "#E84C1E" }]}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : null}
      <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border }]}>
        {items.map((item, i) => <MenuRow key={i} item={item} />)}
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const { isAdmin, logout, adminSettings } = useAdmin();
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const ministryItems: MenuItem[] = [
    { icon: "info", label: "About Dr. Thomas & Ministry", sublabel: "Our story, vision & all 17 ministries", onPress: () => router.push("/about") },
    { icon: "book-open", label: "Resources & Downloads", sublabel: "Bible studies, devotionals & training guides", onPress: () => router.push("/resources") },
    { icon: "gift", label: "Give / Donate", sublabel: "Support Dahinchu Agni Ministries", onPress: () => router.push("/give"), color: "#C8860A" },
    { icon: "map-pin", label: "Location & Contact", sublabel: "Rajahmundry, Andhra Pradesh, India", onPress: () => router.push("/contact") },
  ];

  const mediaItems: MenuItem[] = [
    { icon: "youtube", label: "YouTube Channel", sublabel: "Dahinchu Agni · Live & recorded services", onPress: () => WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl), color: "#DC2626" },
    { icon: "tv", label: "Calvary TV Ministry", sublabel: "Weekly Telugu broadcasts & programs", onPress: () => WebBrowser.openBrowserAsync(MINISTRY.youtubeChannelUrl), color: "#DC2626" },
    { icon: "facebook", label: "Facebook", sublabel: "facebook.com/DahinchuAgni", onPress: () => WebBrowser.openBrowserAsync(MINISTRY.facebook), color: "#2563EB" },
    { icon: "instagram", label: "Instagram", sublabel: "instagram.com/dahinchu_agni", onPress: () => WebBrowser.openBrowserAsync(MINISTRY.instagram), color: "#D97706" },
    { icon: "globe", label: "Official Website", sublabel: "dahinchuagni.org", onPress: () => WebBrowser.openBrowserAsync(MINISTRY.website), color: "#059669" },
  ];

  const appItems: MenuItem[] = [
    { icon: "settings", label: "App Settings", sublabel: "Notifications & preferences", onPress: () => router.push("/settings") },
    ...(isAdmin
      ? [
          { icon: "shield", label: "Admin Panel", sublabel: "Manage events, resources & prayers", onPress: () => router.push("/admin"), color: "#059669", badge: "ADMIN" } as MenuItem,
          { icon: "log-out", label: "Admin Sign Out", onPress: () => { logout(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }, color: "#EF4444" } as MenuItem,
        ]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader subtitle="Explore" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}>

        {/* Ministry Hero Banner */}
        <TouchableOpacity activeOpacity={0.92} onPress={() => router.push("/about")}>
          <LinearGradient
            colors={["#FFF7ED", "#FED7AA", "#FBBF7A"] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroBannerLeft}>
              <View style={styles.heroBannerLogo}>
                <Image source={DA_LOGO} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroBannerName}>{MINISTRY.name}</Text>
                <Text style={styles.heroBannerFounder}>Founded 1994 · Dr. Thomas · Rajahmundry, India</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9A3412" />
            </View>
            <View style={styles.heroBannerStats}>
              {[
                { n: "530+", l: "Churches" },
                { n: "1,800+", l: "Pastors" },
                { n: "17", l: "Ministries" },
              ].map((s) => (
                <View key={s.l} style={styles.heroBannerStat}>
                  <Text style={styles.heroBannerStatNum}>{s.n}</Text>
                  <Text style={styles.heroBannerStatLabel}>{s.l}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Notice */}
        {adminSettings.noticeText ? (
          <View style={[styles.noticeBanner, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
            <Feather name="bell" size={13} color="#F97316" />
            <Text style={[styles.noticeText, { color: "#431407" }]}>{adminSettings.noticeText}</Text>
          </View>
        ) : null}

        <MenuSection title="Ministry" items={ministryItems} />
        <MenuSection title="Media & Online" items={mediaItems} />
        <MenuSection title="App" items={appItems} />

        {/* Admin Access — hidden long press */}
        {!isAdmin ? (
          <TouchableOpacity
            onLongPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push("/admin");
            }}
            delayLongPress={3000}
            style={styles.versionBtn}
          >
            <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
              Dahinchu Agni App · v1.0.0{"\n"}
              {MINISTRY.fullName}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.versionBtn}>
            <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
              Dahinchu Agni App · v1.0.0 · Admin Mode Active
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBanner: { margin: 16, borderRadius: 18, padding: 16, gap: 14, shadowColor: "#F97316", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  heroBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroBannerLogo: { width: 48, height: 48, borderRadius: 24, overflow: "hidden", backgroundColor: "#FFF", shadowColor: "#F97316", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  heroBannerName: { color: "#431407", fontSize: 17, fontWeight: "700", fontFamily: "DMSerifDisplay_400Regular" },
  heroBannerFounder: { color: "#9A3412", fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  heroBannerStats: { flexDirection: "row", gap: 20 },
  heroBannerStat: { alignItems: "center", gap: 1 },
  heroBannerStatNum: { color: "#E84C1E", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroBannerStatLabel: { color: "#9A3412", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Inter_400Regular" },
  noticeBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 16, marginBottom: 4, padding: 12, borderRadius: 10, borderWidth: 1 },
  noticeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  section: { paddingHorizontal: 16, marginBottom: 18 },
  sectionTitle: { fontSize: 10, fontWeight: "600", letterSpacing: 1, marginBottom: 8, fontFamily: "Inter_600SemiBold", paddingHorizontal: 2 },
  sectionCard: {},
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(0,0,0,0.06)" },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  menuSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 4 },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  versionBtn: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  versionText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});
