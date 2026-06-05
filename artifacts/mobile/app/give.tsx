import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MINISTRY } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";

const GIVING_OPTIONS = [
  { title: "Tithe & Offering", desc: "Support the local church and ministry operations", icon: "gift", color: "#C8860A" },
  { title: "Mission Support", desc: "Help spread the Gospel to the nations", icon: "globe", color: "#2563EB" },
  { title: "Church Plant Fund", desc: "Support new churches being established", icon: "home", color: "#059669" },
  { title: "Youth Ministry", desc: "Invest in the next generation", icon: "users", color: "#F59E0B" },
  { title: "Prayer & Compassion", desc: "Support prayer centers and humanitarian work", icon: "heart", color: "#7C3AED" },
];

export default function GiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
      >
        <LinearGradient
          colors={["#78350F", "#92400E", "#C8860A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: topPadding + 12 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Feather name="gift" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Give & Support</Text>
          <Text style={styles.headerSub}>
            "Give, and it will be given to you..." — Luke 6:38
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              Your giving partners with us to ignite nations with the Gospel of Jesus Christ. Every seed sown makes an eternal difference.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>
            Giving Categories
          </Text>

          {GIVING_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.title}
              activeOpacity={0.85}
              style={[styles.givingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await WebBrowser.openBrowserAsync(MINISTRY.website + "/give");
              }}
            >
              <View style={[styles.givingIcon, { backgroundColor: opt.color + "18" }]}>
                <Feather name={opt.icon as any} size={20} color={opt.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.givingTitle, { color: colors.foreground }]}>{opt.title}</Text>
                <Text style={[styles.givingDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.mainGiveBtn, { backgroundColor: "#C8860A" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await WebBrowser.openBrowserAsync(MINISTRY.website + "/give");
            }}
          >
            <Feather name="credit-card" size={18} color="#FFFFFF" />
            <Text style={styles.mainGiveBtnText}>Give Online</Text>
          </TouchableOpacity>

          <View style={[styles.otherWays, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.otherWaysTitle, { color: colors.foreground }]}>Other Ways to Give</Text>
            <Text style={[styles.otherWaysText, { color: colors.mutedForeground }]}>
              You can also give in person at any Dahinchu Agni church, or contact us for wire transfer / bank details.
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await WebBrowser.openBrowserAsync(`mailto:${MINISTRY.email}?subject=Giving Inquiry`);
              }}
            >
              <Text style={[styles.contactLink, { color: colors.primary }]}>{MINISTRY.email}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "center", gap: 8 },
  backBtn: { alignSelf: "flex-start", padding: 4, marginBottom: 8 },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "700", fontFamily: "DMSerifDisplay_400Regular" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center", fontStyle: "italic", fontFamily: "Inter_400Regular" },
  content: { padding: 20, gap: 14 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  givingCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  givingIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  givingTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  givingDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  mainGiveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  mainGiveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  otherWays: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  otherWaysTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  otherWaysText: { fontSize: 13, lineHeight: 20, fontFamily: "Inter_400Regular" },
  contactLink: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium", textDecorationLine: "underline" },
});
