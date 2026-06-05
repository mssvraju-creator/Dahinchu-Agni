import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { MinistryHeader } from "@/components/ui/MinistryHeader";
import { useColors } from "@/hooks/useColors";
import { usePrayer } from "@/context/PrayerContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const PRAYER_VERSES = [
  { text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", ref: "Jeremiah 33:3" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6" },
  { text: "The prayer of a righteous person is powerful and effective.", ref: "James 5:16" },
  { text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", ref: "Matthew 7:7" },
  { text: "If my people, who are called by my name, will humble themselves and pray... I will hear from heaven.", ref: "2 Chronicles 7:14" },
];

export default function PrayerScreen() {
  const colors = useColors();
  const { submitPrayer } = usePrayer();
  const [verseIdx, setVerseIdx] = useState(0);
  const verseAnim = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

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
      isPublic: false,
    });
    setName("");
    setRequest("");
    setIsAnonymous(false);
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
});
