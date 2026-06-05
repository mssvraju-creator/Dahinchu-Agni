import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { Linking } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MINISTRY } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";
import { useAdmin } from "@/context/AdminContext";

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { adminSettings } = useAdmin();
  const topPadding = Platform.OS === "web" ? 52 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const contactEmail = adminSettings.contactEmail || MINISTRY.email;
  const contactPhone = adminSettings.contactPhone || MINISTRY.phone;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}>

        <LinearGradient
          colors={["#F97316", "#FB923C", "#FED7AA", "#FFF7ED"] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: topPadding + 12 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#7C2D12" />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: "#FFFFFF60" }]}>
            <Feather name="map-pin" size={26} color="#7C2D12" />
          </View>
          <Text style={styles.headerTitle}>Contact & Location</Text>
          <Text style={styles.headerSub}>Dahinchu Agni Ministries International</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: "#059669" }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL(`tel:${contactPhone.replace(/[^\d+]/g, "")}`);
              }}
            >
              <Feather name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.quickBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: "#2563EB" }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(`mailto:${contactEmail}`);
              }}
            >
              <Feather name="mail" size={16} color="#FFFFFF" />
              <Text style={styles.quickBtnText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: "#E84C1E" }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await WebBrowser.openBrowserAsync(MINISTRY.website);
              }}
            >
              <Feather name="globe" size={16} color="#FFFFFF" />
              <Text style={styles.quickBtnText}>Website</Text>
            </TouchableOpacity>
          </View>

          {/* HQ Address */}
          <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.locationHeader, { backgroundColor: "#FFF7ED", borderRadius: 10, padding: 12, marginBottom: 12 }]}>
              <Feather name="home" size={18} color="#F97316" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationName, { color: "#431407" }]}>Headquarters</Text>
                <Text style={[styles.locationSubname, { color: "#9A3412" }]}>Dahinchu Agni Ministries International</Text>
              </View>
            </View>

            {[
              { icon: "map-pin", text: MINISTRY.address.full },
              { icon: "phone", text: contactPhone },
              { icon: "mail", text: contactEmail },
              { icon: "globe", text: MINISTRY.website },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.detailRow}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.icon === "phone") Linking.openURL(`tel:${item.text.replace(/[^\d+]/g, "")}`);
                  else if (item.icon === "mail") Linking.openURL(`mailto:${item.text}`);
                  else if (item.icon === "globe") WebBrowser.openBrowserAsync(item.text);
                }}
              >
                <View style={[styles.detailIcon, { backgroundColor: "#FFF7ED" }]}>
                  <Feather name={item.icon as any} size={13} color="#F97316" />
                </View>
                <Text style={[styles.detailText, { color: item.icon === "map-pin" ? colors.foreground : "#E84C1E" }]} numberOfLines={3}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.serviceTimesBox, { backgroundColor: "#FFF7ED", borderRadius: 10, marginTop: 12 }]}>
              <Text style={styles.serviceTimesTitle}>Service Times</Text>
              {MINISTRY.serviceTimes.map((s, i) => (
                <Text key={i} style={styles.serviceTimesText}>• {s.day}: {s.time} ({s.type})</Text>
              ))}
            </View>
          </View>

          {/* Social */}
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>Follow & Subscribe</Text>
          {[
            { icon: "youtube", label: "YouTube", sub: "Watch live services & messages", url: MINISTRY.youtubeChannelUrl, color: "#DC2626" },
            { icon: "facebook", label: "Facebook", sub: "facebook.com/DahinchuAgni", url: MINISTRY.facebook, color: "#2563EB" },
            { icon: "instagram", label: "Instagram", sub: "instagram.com/dahinchu_agni", url: MINISTRY.instagram, color: "#D97706" },
            { icon: "globe", label: "Official Website", sub: "dahinchuagni.org", url: MINISTRY.website, color: "#E84C1E" },
          ].map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.socialRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await WebBrowser.openBrowserAsync(s.url);
              }}
            >
              <View style={[styles.socialIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.socialLabel, { color: colors.foreground }]}>{s.label}</Text>
                <Text style={[styles.socialSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
              </View>
              <Feather name="external-link" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 24, alignItems: "center", gap: 6 },
  backBtn: { alignSelf: "flex-start", padding: 4, marginBottom: 8 },
  headerIcon: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#431407", fontSize: 24, fontWeight: "700", fontFamily: "DMSerifDisplay_400Regular" },
  headerSub: { color: "#9A3412", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  content: { padding: 16, gap: 14 },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 12 },
  quickBtnText: { color: "#FFFFFF", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  locationCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  locationName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  locationSubname: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 7 },
  detailIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  detailText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  serviceTimesBox: { padding: 12, gap: 4 },
  serviceTimesTitle: { fontSize: 12, fontWeight: "700", color: "#9A3412", fontFamily: "Inter_700Bold", marginBottom: 4 },
  serviceTimesText: { fontSize: 12, color: "#431407", fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 4 },
  socialRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  socialIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  socialLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  socialSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});
