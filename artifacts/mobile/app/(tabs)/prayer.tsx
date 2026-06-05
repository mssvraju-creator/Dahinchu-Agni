import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { BIBLE_VERSES } from "@/constants/ministry";
import { useColors } from "@/hooks/useColors";
import { usePrayer, PrayerRequest } from "@/context/PrayerContext";
import { useAdmin } from "@/context/AdminContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const PRAYER_VERSES = [
  { text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", ref: "Jeremiah 33:3" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6" },
  { text: "The prayer of a righteous person is powerful and effective.", ref: "James 5:16" },
  { text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", ref: "Matthew 7:7" },
  { text: "If my people, who are called by my name, will humble themselves and pray... I will hear from heaven.", ref: "2 Chronicles 7:14" },
];

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function PrayerCard({ prayer, onPray, onDelete, isAdmin }: { prayer: PrayerRequest; onPray: () => void; onDelete: () => void; isAdmin: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.prayerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.prayerCardHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="user" size={14} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.prayerName, { color: colors.foreground }]}>{prayer.name}</Text>
          <Text style={[styles.prayerTime, { color: colors.mutedForeground }]}>{timeAgo(prayer.createdAt)}</Text>
        </View>
        {prayer.isPrayed ? (
          <View style={[styles.prayedBadge, { backgroundColor: "#059669" + "22" }]}>
            <Feather name="check" size={10} color="#059669" />
            <Text style={[styles.prayedText, { color: "#059669" }]}>Prayed</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.prayerText, { color: colors.foreground }]}>{prayer.request}</Text>
      <View style={styles.prayerActions}>
        {!prayer.isPrayed ? (
          <TouchableOpacity
            style={[styles.prayBtn, { backgroundColor: "#7C3AED" + "18" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPray();
            }}
          >
            <Feather name="heart" size={13} color="#7C3AED" />
            <Text style={[styles.prayBtnText, { color: "#7C3AED" }]}>I prayed for this</Text>
          </TouchableOpacity>
        ) : null}
        {isAdmin ? (
          <TouchableOpacity
            style={[styles.deletePrayBtn, { borderColor: "#EF4444" + "44" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDelete();
            }}
          >
            <Feather name="trash-2" size={13} color="#EF4444" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function PrayerScreen() {
  const colors = useColors();
  const { prayers, submitPrayer, markPrayed, deletePrayer } = usePrayer();
  const { isAdmin } = useAdmin();
  const [verseIdx, setVerseIdx] = useState(0);
  const verseAnim = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;
  const publicPrayers = prayers.filter((p) => p.isPublic);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(verseAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(verseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setVerseIdx((i) => (i + 1) % PRAYER_VERSES.length);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit() {
    if (request.trim().length < 10) {
      Alert.alert("Prayer Request", "Please write at least 10 characters for your prayer request.");
      return;
    }
    setSending(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submitPrayer({
      name: isAnonymous ? "Anonymous" : name.trim() || "Anonymous",
      request: request.trim(),
      isAnonymous,
      isPublic,
    });
    setName("");
    setRequest("");
    setIsAnonymous(false);
    setIsPublic(true);
    setSending(false);
    setShowForm(false);
    Alert.alert("Prayer Submitted", "Your prayer request has been received. Our team will pray for you.");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MinistryHeader subtitle="Prayer Center" />
      <KeyboardAwareScrollViewCompat
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
      >
        {/* Verse Banner */}
        <LinearGradient
          colors={["#3B0764", "#1E1B4B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.verseBanner}
        >
          <Feather name="heart" size={16} color="#A78BFA" style={{ marginBottom: 8 }} />
          <Animated.Text style={[styles.verseText, { opacity: verseAnim }]}>
            "{PRAYER_VERSES[verseIdx].text}"
          </Animated.Text>
          <Animated.Text style={[styles.verseRef, { opacity: verseAnim }]}>
            {PRAYER_VERSES[verseIdx].ref}
          </Animated.Text>
        </LinearGradient>

        {/* Submit Form Toggle */}
        {!showForm ? (
          <TouchableOpacity
            style={[styles.submitToggle, { backgroundColor: "#7C3AED" }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowForm(true);
            }}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.submitToggleText}>Submit a Prayer Request</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Your Prayer Request</Text>

            {!isAnonymous ? (
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                placeholder="Your name (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            ) : null}

            <TextInput
              style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Share your prayer request here... God hears every word."
              placeholderTextColor={colors.mutedForeground}
              value={request}
              onChangeText={setRequest}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Submit anonymously</Text>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: colors.border, true: "#7C3AED" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.toggleItem}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Show on prayer wall</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: colors.border, true: "#7C3AED" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.formBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: "#7C3AED", opacity: sending ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={sending}
              >
                <Feather name="send" size={14} color="#FFFFFF" />
                <Text style={styles.sendBtnText}>{sending ? "Sending..." : "Submit Prayer"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Prayer Wall */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "DMSerifDisplay_400Regular" }]}>
            Prayer Wall
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Join your brothers and sisters in prayer
          </Text>

          {publicPrayers.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="heart" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Be the first to share a prayer request</Text>
            </View>
          ) : (
            publicPrayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onPray={() => markPrayed(prayer.id)}
                onDelete={() => deletePrayer(prayer.id)}
                isAdmin={isAdmin}
              />
            ))
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  verseBanner: { margin: 16, borderRadius: 16, padding: 20 },
  verseText: { color: "#FFFFFF", fontSize: 14, lineHeight: 22, fontStyle: "italic", fontFamily: "Inter_400Regular", marginBottom: 10 },
  verseRef: { color: "#A78BFA", fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  submitToggle: { marginHorizontal: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  submitToggleText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  formCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  formTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 110, fontFamily: "Inter_400Regular" },
  toggleRow: { gap: 10 },
  toggleItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  formBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  sendBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 12 },
  sendBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  prayerCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  prayerCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  prayerName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  prayerTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  prayedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  prayedText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  prayerText: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  prayerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  prayBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  prayBtnText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  deletePrayBtn: { borderWidth: 1, borderRadius: 8, padding: 6 },
  emptyCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
});
