import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { API_URL } from "@/constants/api";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { useAdmin, AdminSettings } from "@/context/AdminContext";
import { usePrayer } from "@/context/PrayerContext";
import { MinistryEvent, MinistryResource } from "@/constants/ministry";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type AdminTab = "events" | "resources" | "prayers" | "notifications" | "settings";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin, login, logout, adminSettings, updateAdminSettings, events, addEvent, deleteEvent, resources, addResource, deleteResource } = useAdmin();
  const { prayers, deletePrayer, markPrayed } = usePrayer();

  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [tab, setTab] = useState<AdminTab>("events");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  // Local settings state
  const [localSettings, setLocalSettings] = useState<AdminSettings>(adminSettings);

  // Add Event Form
  const [evTitle, setEvTitle] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evTime, setEvTime] = useState("");
  const [evLocation, setEvLocation] = useState("");
  const [evDesc, setEvDesc] = useState("");

  // Add Resource Form
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resUrl, setResUrl] = useState("");

  // Notifications
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifType, setNotifType] = useState("announcement");
  const [notifSending, setNotifSending] = useState(false);
  const [notifStats, setNotifStats] = useState<{ subscribers: number } | null>(null);

  React.useEffect(() => {
    if (isAdmin) {
      fetch(`${API_URL}/api/notifications/stats`)
        .then((r) => r.json())
        .then((d) => setNotifStats(d))
        .catch(() => {});
    }
  }, [isAdmin]);

  const topPadding = Platform.OS === "web" ? 52 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleLogin() {
    if (!code.trim()) return;
    setLoginLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = login(code.trim());
    setLoginLoading(false);
    if (success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCode("");
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
      setCode("");
    }
  }

  function addEventSubmit() {
    if (!evTitle.trim() || !evDate.trim()) {
      Alert.alert("Required Fields", "Title and date are required.");
      return;
    }
    const newEvent: MinistryEvent = {
      id: Date.now().toString(),
      title: evTitle.trim(),
      date: evDate.trim(),
      time: evTime.trim() || "TBD",
      location: evLocation.trim() || "Rajahmundry",
      description: evDesc.trim(),
      category: "special",
    };
    addEvent(newEvent);
    setEvTitle(""); setEvDate(""); setEvTime(""); setEvLocation(""); setEvDesc("");
    setShowAddEvent(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function addResourceSubmit() {
    if (!resTitle.trim()) {
      Alert.alert("Required", "Title is required.");
      return;
    }
    const newResource: MinistryResource = {
      id: Date.now().toString(),
      title: resTitle.trim(),
      description: resDesc.trim(),
      url: resUrl.trim() || undefined,
      category: "bible-study",
      type: "pdf",
      isFree: true,
      author: "Dahinchu Agni Ministries",
    };
    addResource(newResource);
    setResTitle(""); setResDesc(""); setResUrl("");
    setShowAddResource(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function saveSettings() {
    updateAdminSettings(localSettings);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Settings updated successfully.");
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Admin Access</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.loginCenter}>
          <LinearGradient
            colors={["#F97316", "#E84C1E"]}
            style={styles.lockIcon}
          >
            <Feather name="shield" size={28} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.loginTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>
            Admin Panel
          </Text>
          <Text style={[styles.loginSub, { color: colors.mutedForeground }]}>
            Enter your admin passcode to access{"\n"}ministry management tools
          </Text>

          <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={[styles.codeInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginLeft: 14 }} />
              <TextInput
                style={[styles.codeInput, { color: colors.foreground }]}
                value={code}
                onChangeText={setCode}
                placeholder="Enter passcode"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showCode}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowCode((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showCode ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: "#E84C1E", opacity: loginLoading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loginLoading || !code.trim()}
          >
            <Feather name="log-in" size={16} color="#FFFFFF" />
            <Text style={styles.loginBtnText}>{loginLoading ? "Verifying..." : "Access Admin"}</Text>
          </TouchableOpacity>

          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Authorized ministry staff only
          </Text>
        </View>
      </View>
    );
  }

  const TABS: { key: AdminTab; label: string; icon: string }[] = [
    { key: "events", label: "Events", icon: "calendar" },
    { key: "resources", label: "Resources", icon: "book-open" },
    { key: "prayers", label: "Prayers", icon: "heart" },
    { key: "notifications", label: "Notifs", icon: "bell" },
    { key: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="chevron-down" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={["#F97316", "#E84C1E"]} style={styles.headerBadge}>
            <Feather name="shield" size={12} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Admin Panel</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Sign Out", "Sign out of admin mode?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: () => { logout(); router.back(); } },
            ]);
          }}
          style={styles.headerBtn}
        >
          <Text style={{ color: "#EF4444", fontSize: 13, fontFamily: "Inter_500Medium" }}>Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && { borderBottomColor: "#E84C1E", borderBottomWidth: 2 }]}
            onPress={() => setTab(t.key)}
          >
            <Feather name={t.icon as any} size={14} color={tab === t.key ? "#E84C1E" : colors.mutedForeground} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? "#E84C1E" : colors.mutedForeground }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAwareScrollViewCompat contentContainerStyle={{ paddingBottom: bottomPadding + 60, padding: 16 }}>

        {/* ===== EVENTS TAB ===== */}
        {tab === "events" && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#E84C1E" }]} onPress={() => setShowAddEvent(true)}>
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add New Event</Text>
            </TouchableOpacity>
            <Text style={[styles.listCount, { color: colors.mutedForeground }]}>{events.length} events</Text>
            {events.map((ev) => (
              <View key={ev.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.listItemDot, { backgroundColor: "#E84C1E" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, { color: colors.foreground }]}>{ev.title}</Text>
                  <Text style={[styles.listItemSub, { color: colors.mutedForeground }]}>{ev.date} · {ev.time} · {ev.location}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Delete Event", `Delete "${ev.title}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => { deleteEvent(ev.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
                    ]);
                  }}
                  style={styles.deleteBtn}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ===== RESOURCES TAB ===== */}
        {tab === "resources" && (
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#2563EB" }]} onPress={() => setShowAddResource(true)}>
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add New Resource</Text>
            </TouchableOpacity>
            <Text style={[styles.listCount, { color: colors.mutedForeground }]}>{resources.length} resources</Text>
            {resources.map((res) => (
              <View key={res.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.listItemDot, { backgroundColor: "#2563EB" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, { color: colors.foreground }]}>{res.title}</Text>
                  <Text style={[styles.listItemSub, { color: colors.mutedForeground }]} numberOfLines={1}>{res.description}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Delete Resource", `Delete "${res.title}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => { deleteResource(res.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
                    ]);
                  }}
                  style={styles.deleteBtn}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ===== PRAYERS TAB ===== */}
        {tab === "prayers" && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.listCount, { color: colors.mutedForeground }]}>{prayers.length} prayer requests</Text>
            {prayers.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="heart" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prayer requests yet</Text>
              </View>
            ) : (
              prayers.map((p) => (
                <View key={p.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.listItemDot, { backgroundColor: p.isPrayed ? "#059669" : "#7C3AED" }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listItemTitle, { color: colors.foreground }]}>
                      {p.name} {p.isPrayed ? "✓" : ""}
                    </Text>
                    <Text style={[styles.listItemSub, { color: colors.mutedForeground }]} numberOfLines={2}>{p.request}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {!p.isPrayed ? (
                      <TouchableOpacity onPress={() => { markPrayed(p.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                        <Feather name="check-circle" size={18} color="#059669" />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => {
                      Alert.alert("Delete", "Remove this prayer request?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deletePrayer(p.id) },
                      ]);
                    }}>
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ===== NOTIFICATIONS TAB ===== */}
        {tab === "notifications" && (
          <View style={{ gap: 14 }}>
            {/* Subscriber count */}
            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Push Subscribers</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#E84C1E22", alignItems: "center", justifyContent: "center" }}>
                  <Feather name="bell" size={18} color="#E84C1E" />
                </View>
                <Text style={{ fontSize: 28, fontWeight: "700", color: "#E84C1E", fontFamily: "Inter_700Bold" }}>
                  {notifStats?.subscribers ?? "—"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  devices subscribed
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                The server auto-notifies all subscribers when a live stream starts or a new video is posted. Use the form below to send custom announcements.
              </Text>
            </View>

            {/* Quick Live Alert */}
            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Quick Live Alert</Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 4 }}>
                Instantly notify all subscribers that you're going live.
              </Text>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: "#DC2626" }]}
                onPress={async () => {
                  Alert.alert("Send Live Alert?", "This will notify all subscribers that Dahinchu Agni is LIVE NOW.", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Send",
                      onPress: async () => {
                        try {
                          const r = await fetch(`${API_URL}/api/notifications/send-live`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ passcode: "DAFIRE94" }),
                          });
                          const d = await r.json() as { sent?: number };
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert("Sent!", `Live alert delivered to ${d.sent ?? 0} subscribers.`);
                        } catch {
                          Alert.alert("Error", "Could not send notification.");
                        }
                      },
                    },
                  ]);
                }}
              >
                <Feather name="radio" size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>🔴 Send LIVE NOW Alert</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Notification */}
            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Send Custom Notification</Text>
              <TextInput
                style={[styles.settingInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Notification title"
                placeholderTextColor={colors.mutedForeground}
                value={notifTitle}
                onChangeText={setNotifTitle}
              />
              <TextInput
                style={[styles.settingTextarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, marginTop: 8 }]}
                placeholder="Notification message..."
                placeholderTextColor={colors.mutedForeground}
                value={notifBody}
                onChangeText={setNotifBody}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {/* Type picker */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {(["announcement", "video", "event", "resource"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNotifType(t)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: notifType === t ? "#E84C1E" : colors.border,
                      backgroundColor: notifType === t ? "#E84C1E15" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: notifType === t ? "#E84C1E" : colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: "#7C3AED", marginTop: 10, opacity: notifSending ? 0.6 : 1 }]}
                disabled={notifSending || !notifTitle.trim() || !notifBody.trim()}
                onPress={async () => {
                  if (!notifTitle.trim() || !notifBody.trim()) {
                    Alert.alert("Required", "Please enter a title and message.");
                    return;
                  }
                  setNotifSending(true);
                  try {
                    const r = await fetch(`${API_URL}/api/notifications/send`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ passcode: "DAFIRE94", title: notifTitle.trim(), body: notifBody.trim(), type: notifType }),
                    });
                    const d = await r.json() as { sent?: number; error?: string };
                    if (d.error) throw new Error(d.error);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Sent!", `Notification delivered to ${d.sent ?? 0} subscribers.`);
                    setNotifTitle("");
                    setNotifBody("");
                  } catch {
                    Alert.alert("Error", "Could not send notification.");
                  }
                  setNotifSending(false);
                }}
              >
                <Feather name="send" size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>{notifSending ? "Sending..." : "Send to All Subscribers"}</Text>
              </TouchableOpacity>
            </View>

            {/* Auto-notification info */}
            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Automatic Notifications</Text>
              {[
                { icon: "radio", color: "#DC2626", label: "🔴 LIVE NOW", desc: "Sent automatically when your channel goes live" },
                { icon: "video", color: "#2563EB", label: "🎬 New Message", desc: "Sent when a new video is posted to YouTube" },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: item.color + "22", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <Feather name={item.icon as any} size={13} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{item.desc}</Text>
                  </View>
                  <Feather name="check-circle" size={14} color="#059669" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {tab === "settings" && (
          <View style={{ gap: 14 }}>
            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Welcome Message</Text>
              <TextInput
                style={[styles.settingTextarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                value={localSettings.welcomeMessage}
                onChangeText={(v) => setLocalSettings((s) => ({ ...s, welcomeMessage: v }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Welcome message shown on home screen"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Notice / Announcement</Text>
              <TextInput
                style={[styles.settingTextarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                value={localSettings.noticeText}
                onChangeText={(v) => setLocalSettings((s) => ({ ...s, noticeText: v }))}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                placeholder="Important announcement (leave blank to hide)"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Contact Information</Text>
              <View style={styles.settingField}>
                <Text style={[styles.settingLabel, { color: colors.mutedForeground }]}>Email</Text>
                <TextInput
                  style={[styles.settingInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  value={localSettings.contactEmail}
                  onChangeText={(v) => setLocalSettings((s) => ({ ...s, contactEmail: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="contact@dahinchuagni.org"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={styles.settingField}>
                <Text style={[styles.settingLabel, { color: colors.mutedForeground }]}>Phone</Text>
                <TextInput
                  style={[styles.settingInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  value={localSettings.contactPhone}
                  onChangeText={(v) => setLocalSettings((s) => ({ ...s, contactPhone: v }))}
                  keyboardType="phone-pad"
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.settingGroupTitle, { color: colors.foreground }]}>Feature Toggles</Text>
              {[
                { key: "liveStreamEnabled" as const, label: "Live Stream Section", icon: "video" },
                { key: "prayerWallEnabled" as const, label: "Public Prayer Wall", icon: "heart" },
              ].map((f) => (
                <View key={f.key} style={styles.settingToggleRow}>
                  <Feather name={f.icon as any} size={15} color={colors.mutedForeground} />
                  <Text style={[styles.settingToggleLabel, { color: colors.foreground }]}>{f.label}</Text>
                  <Switch
                    value={localSettings[f.key]}
                    onValueChange={(v) => setLocalSettings((s) => ({ ...s, [f.key]: v }))}
                    trackColor={{ false: colors.border, true: "#E84C1E" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#E84C1E" }]} onPress={saveSettings}>
              <Feather name="save" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollViewCompat>

      {/* Add Event Modal */}
      <Modal visible={showAddEvent} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Event</Text>
            <TouchableOpacity onPress={() => setShowAddEvent(false)}><Feather name="x" size={22} color={colors.foreground} /></TouchableOpacity>
          </View>
          <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, gap: 12 }}>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Event title *" placeholderTextColor={colors.mutedForeground} value={evTitle} onChangeText={setEvTitle} />
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Date (YYYY-MM-DD) e.g. 2025-07-01 *" placeholderTextColor={colors.mutedForeground} value={evDate} onChangeText={setEvDate} />
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Time (e.g. 10:00 AM)" placeholderTextColor={colors.mutedForeground} value={evTime} onChangeText={setEvTime} />
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Location (e.g. Rajahmundry HQ)" placeholderTextColor={colors.mutedForeground} value={evLocation} onChangeText={setEvLocation} />
            <TextInput style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Description" placeholderTextColor={colors.mutedForeground} value={evDesc} onChangeText={setEvDesc} multiline numberOfLines={4} textAlignVertical="top" />
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#E84C1E" }]} onPress={addEventSubmit}>
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Save Event</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {/* Add Resource Modal */}
      <Modal visible={showAddResource} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Resource</Text>
            <TouchableOpacity onPress={() => setShowAddResource(false)}><Feather name="x" size={22} color={colors.foreground} /></TouchableOpacity>
          </View>
          <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, gap: 12 }}>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Resource title *" placeholderTextColor={colors.mutedForeground} value={resTitle} onChangeText={setResTitle} />
            <TextInput style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="Description" placeholderTextColor={colors.mutedForeground} value={resDesc} onChangeText={setResDesc} multiline numberOfLines={3} textAlignVertical="top" />
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]} placeholder="URL (optional, e.g. https://...)" placeholderTextColor={colors.mutedForeground} value={resUrl} onChangeText={setResUrl} autoCapitalize="none" keyboardType="url" />
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#2563EB" }]} onPress={addResourceSubmit}>
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Save Resource</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  headerBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  loginCenter: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 16 },
  lockIcon: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  loginTitle: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  loginSub: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 21 },
  inputWrapper: { width: "100%", maxWidth: 320 },
  codeInputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, height: 54, overflow: "hidden" },
  codeInput: { flex: 1, paddingHorizontal: 12, fontSize: 16, fontFamily: "Inter_500Medium", letterSpacing: 2 },
  eyeBtn: { padding: 14 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, width: "100%", maxWidth: 320, justifyContent: "center" },
  loginBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  hintText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 10 },
  tabLabel: { fontSize: 10, fontWeight: "500", fontFamily: "Inter_500Medium" },
  listCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  listItemDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  listItemTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  listItemSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  deleteBtn: { padding: 6 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 12 },
  addBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyState: { borderRadius: 12, borderWidth: 1, borderStyle: "dashed", padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  settingGroup: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  settingGroupTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 4 },
  settingField: { gap: 5 },
  settingLabel: { fontSize: 11, fontWeight: "500", fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  settingInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  settingTextarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80 },
  settingToggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingToggleLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  saveBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 90, fontFamily: "Inter_400Regular" },
});
