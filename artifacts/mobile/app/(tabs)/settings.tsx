import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  accent?: boolean;
  chevron?: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  color,
  accent = false,
  chevron = true,
}: SettingRowProps) {
  const colors = useColors();
  const rowColor = color ?? (accent ? colors.accent : colors.foreground);

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: accent ? colors.secondary : colors.muted }]}>
        <Feather name={icon as any} size={18} color={rowColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: rowColor }]}>{label}</Text>
        {value ? (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress && chevron && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom:
          insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, backgroundColor: colors.primary },
        ]}
      >
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Admin Panel - PROMINENT */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/admin")}
        >
          <LinearGradient
            colors={["#E05A1F", "#FF8C42"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adminCard}
          >
            <View style={styles.adminIcon}>
              <Feather name="shield" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.adminText}>
              <Text style={styles.adminTitle}>Admin Panel</Text>
              <Text style={styles.adminSub}>
                Manage videos, live streams & announcements
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Ministry Info */}
      <View style={styles.section}>
        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
          Ministry
        </Text>
        <View
          style={[
            styles.group,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="home"
            label="Dahinchu Agni Ministries"
            value="Rajahmundry, AP"
            onPress={undefined}
            chevron={false}
          />
          <SettingRow
            icon="globe"
            label="Website"
            value="www.dahinchuagni.in"
            onPress={() => Linking.openURL("http://www.dahinchuagni.in")}
          />
          <SettingRow
            icon="youtube"
            label="YouTube Channel"
            value="Dahinchu Agni"
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/c/DahinchuAgniMinistries"
              )
            }
          />
          <SettingRow
            icon="facebook"
            label="Facebook"
            value="@DahinchuAgni"
            onPress={() =>
              Linking.openURL("https://www.facebook.com/DahinchuAgni/")
            }
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
          App
        </Text>
        <View
          style={[
            styles.group,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SettingRow
            icon="info"
            label="Version"
            value="1.0.0"
            onPress={undefined}
            chevron={false}
          />
          <SettingRow
            icon="heart"
            label="About Dahinchu Agni"
            value="Founded 1994 by Dr. Thomas"
            onPress={undefined}
            chevron={false}
          />
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  adminCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  adminIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminText: {
    flex: 1,
    gap: 4,
  },
  adminTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  adminSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  group: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
