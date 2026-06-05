import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/context/SettingsContext";
import { useAdmin } from "@/context/AdminContext";
import { MINISTRY } from "@/constants/ministry";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, setNotifications, dailyVerse, setDailyVerse } = useSettings();
  const { isAdmin, logout } = useAdmin();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 40 }}
      >
        <View style={styles.content}>

          {/* Admin Panel Section */}
          <Section title="Ministry Admin">
            {isAdmin ? (
              <>
                <SettingRow
                  icon="shield"
                  label="Admin Panel"
                  sublabel="Manage events, resources & app settings"
                  iconColor="#059669"
                  colors={colors}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/admin");
                  }}
                  showArrow
                />
                <SettingRow
                  icon="log-out"
                  label="Admin Sign Out"
                  sublabel="Exit admin mode"
                  iconColor="#EF4444"
                  colors={colors}
                  onPress={async () => {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    logout();
                  }}
                />
              </>
            ) : (
              <SettingRow
                icon="lock"
                label="Admin Panel"
                sublabel="Enter passcode to access ministry management"
                iconColor="#E84C1E"
                colors={colors}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/admin");
                }}
                showArrow
              />
            )}
          </Section>

          <Section title="Notifications">
            <SettingRow
              icon="bell"
              label="Push Notifications"
              sublabel="Receive alerts for new content & events"
              colors={colors}
              right={
                <Switch
                  value={notifications}
                  onValueChange={(v) => { setNotifications(v); Haptics.selectionAsync(); }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingRow
              icon="book-open"
              label="Daily Scripture"
              sublabel="Morning verse notification"
              colors={colors}
              right={
                <Switch
                  value={dailyVerse}
                  onValueChange={(v) => { setDailyVerse(v); Haptics.selectionAsync(); }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </Section>

          <Section title="Privacy">
            <SettingRow icon="shield" label="Privacy Policy" colors={colors} onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} showArrow />
            <SettingRow icon="file-text" label="Terms of Service" colors={colors} onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} showArrow />
          </Section>

          <Section title="App Information">
            <SettingRow icon="info" label="App Version" sublabel="1.0.0" colors={colors} />
            <SettingRow icon="zap" label="Ministry" sublabel={MINISTRY.name} colors={colors} />
            <SettingRow icon="globe" label="Website" sublabel={MINISTRY.website} colors={colors} onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} showArrow />
          </Section>

        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({ icon, label, sublabel, right, onPress, showArrow, colors, iconColor }: {
  icon: string; label: string; sublabel?: string; right?: React.ReactNode;
  onPress?: () => void; showArrow?: boolean; iconColor?: string;
  colors: ReturnType<typeof useColors>;
}) {
  const resolvedColor = iconColor ?? colors.primary;
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: resolvedColor + "14" }]}>
        <Feather name={icon as any} size={16} color={resolvedColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {sublabel ? <Text style={[styles.settingSublabel, { color: colors.mutedForeground }]}>{sublabel}</Text> : null}
      </View>
      {right ?? (showArrow ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 8, fontFamily: "Inter_600SemiBold", paddingHorizontal: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  settingSublabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
});
