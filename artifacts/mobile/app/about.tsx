import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MINISTRY } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";

const DA_LOGO = require("@/assets/images/da-logo.png");

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 52 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}>

        {/* Hero Header */}
        <LinearGradient
          colors={["#F97316", "#FB923C", "#FED7AA", "#FFF7ED"] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.hero, { paddingTop: topPadding + 10 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#7C2D12" />
          </TouchableOpacity>

          <View style={styles.heroLogoWrap}>
            <Image source={DA_LOGO} style={styles.heroLogo} resizeMode="contain" />
          </View>

          <Text style={styles.heroName}>{MINISTRY.name}</Text>
          <Text style={styles.heroMeaning}>{MINISTRY.meaning}</Text>
          <Text style={styles.heroFounder}>Founded 1994 · Dr. Thomas · Rajahmundry, India</Text>

          <View style={styles.heroStats}>
            {[
              { n: "530+", l: "Churches" },
              { n: "1,800+", l: "Pastors" },
              { n: "17", l: "Ministries" },
              { n: "1994", l: "Founded" },
            ].map((s) => (
              <View key={s.l} style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{s.n}</Text>
                <Text style={styles.heroStatLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* About */}
          <Section title="Our Story" icon="book-open" colors={colors}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{MINISTRY.about}</Text>
          </Section>

          {/* Founder */}
          <Section title="About the Founder" icon="user" colors={colors}>
            <View style={[styles.founderCard, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
              <View style={styles.founderAvatarRow}>
                <View style={[styles.founderAvatar, { backgroundColor: "#F97316" }]}>
                  <Feather name="user" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.founderName, { color: "#431407" }]}>{MINISTRY.founder}</Text>
                  <Text style={[styles.founderBirth, { color: "#9A3412" }]}>Born {MINISTRY.founderBirthday} · {MINISTRY.founderBirthplace}</Text>
                </View>
              </View>
              <Text style={[styles.bodyText, { color: "#431407" }]}>
                Dr. Thomas received his divine calling in 1992 and, in obedience to God's audible call, moved to Khammam District in Andhra Pradesh as a missionary — not even knowing the Telugu language. Through perseverance and faith, he learned the language and began planting the seeds that would grow into Dahinchu Agni Ministries.
              </Text>
            </View>
          </Section>

          {/* Vision & Mission */}
          <Section title="Vision" icon="target" colors={colors}>
            <View style={[styles.quoteBox, { backgroundColor: "#FFF7ED", borderLeftColor: "#F97316" }]}>
              <Text style={[styles.quoteText, { color: "#431407" }]}>{MINISTRY.vision}</Text>
            </View>
          </Section>

          <Section title="Mission" icon="compass" colors={colors}>
            <View style={[styles.quoteBox, { backgroundColor: "#FFF7ED", borderLeftColor: "#E84C1E" }]}>
              <Text style={[styles.quoteText, { color: "#431407" }]}>{MINISTRY.mission}</Text>
            </View>
          </Section>

          {/* Ministries */}
          <Section title="17 Ministries" icon="layers" colors={colors}>
            <View style={styles.ministriesGrid}>
              {MINISTRY.ministriesInfo.map((m, i) => (
                <View key={i} style={[styles.ministryPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.ministryDot, { backgroundColor: "#E84C1E" }]} />
                  <Text style={[styles.ministryPillText, { color: colors.foreground }]}>{m}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* Service Times */}
          <Section title="Service Times" icon="clock" colors={colors}>
            {MINISTRY.serviceTimes.map((s, i) => (
              <View key={i} style={[styles.serviceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.serviceIcon, { backgroundColor: "#FFF7ED" }]}>
                  <Feather name="clock" size={14} color="#F97316" />
                </View>
                <View>
                  <Text style={[styles.serviceDay, { color: colors.foreground }]}>{s.day} — {s.type}</Text>
                  <Text style={[styles.serviceTime, { color: colors.mutedForeground }]}>{s.time}</Text>
                </View>
              </View>
            ))}
          </Section>

          {/* Connect */}
          <Section title="Connect With Us" icon="share-2" colors={colors}>
            <View style={styles.socialRow}>
              {[
                { icon: "youtube", label: "YouTube", url: MINISTRY.youtubeChannelUrl, color: "#DC2626" },
                { icon: "facebook", label: "Facebook", url: MINISTRY.facebook, color: "#2563EB" },
                { icon: "instagram", label: "Instagram", url: MINISTRY.instagram, color: "#D97706" },
                { icon: "globe", label: "Website", url: MINISTRY.website, color: "#E84C1E" },
              ].map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.socialBtn, { backgroundColor: s.color + "14", borderColor: s.color + "30" }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    await WebBrowser.openBrowserAsync(s.url);
                  }}
                >
                  <Feather name={s.icon as any} size={20} color={s.color} />
                  <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, icon, children, colors }: { title: string; icon: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconBox, { backgroundColor: "#FFF7ED" }]}>
          <Feather name={icon as any} size={14} color="#F97316" />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "center", gap: 6 },
  backBtn: { alignSelf: "flex-start", padding: 4, marginBottom: 12 },
  heroLogoWrap: { width: 96, height: 96, borderRadius: 48, overflow: "hidden", backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6 },
  heroLogo: { width: 96, height: 96 },
  heroName: { color: "#431407", fontSize: 28, fontWeight: "700", fontFamily: "DMSerifDisplay_400Regular", textAlign: "center", marginTop: 4 },
  heroMeaning: { color: "#9A3412", fontSize: 12, textAlign: "center", fontFamily: "Inter_400Regular", fontStyle: "italic" },
  heroFounder: { color: "#C2410C", fontSize: 11, textAlign: "center", fontFamily: "Inter_500Medium", letterSpacing: 0.3 },
  heroStats: { flexDirection: "row", gap: 20, marginTop: 10 },
  heroStat: { alignItems: "center", gap: 1 },
  heroStatNum: { color: "#E84C1E", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroStatLabel: { color: "#9A3412", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Inter_400Regular" },
  content: { padding: 20, gap: 4 },
  section: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "600" },
  bodyText: { fontSize: 15, lineHeight: 24, fontFamily: "Inter_400Regular" },
  quoteBox: { borderLeftWidth: 3, paddingLeft: 16, paddingVertical: 12, borderRadius: 4 },
  quoteText: { fontSize: 15, lineHeight: 24, fontStyle: "italic", fontFamily: "Inter_400Regular" },
  founderCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  founderAvatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  founderAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  founderName: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  founderBirth: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  ministriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ministryPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  ministryDot: { width: 6, height: 6, borderRadius: 3 },
  ministryPillText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  serviceRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  serviceIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  serviceDay: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  serviceTime: { fontSize: 13, fontFamily: "Inter_400Regular" },
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  socialBtn: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  socialLabel: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
});
