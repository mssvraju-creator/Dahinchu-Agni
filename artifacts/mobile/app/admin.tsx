import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent } from "@/contexts/ContentContext";
import { useColors } from "@/hooks/useColors";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { adminPasscode } = useContent();
  const [entered, setEntered] = useState<string>("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (error) setError(false);
    if (digit === "del") {
      setEntered((prev) => prev.slice(0, -1));
      return;
    }
    if (entered.length >= 8) return;
    const next = entered + digit;
    setEntered(next);

    if (next.length === adminPasscode.length) {
      setTimeout(() => {
        if (next === adminPasscode) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.push("/admin-panel");
          setEntered("");
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(true);
          setTimeout(() => { setEntered(""); setError(false); }, 900);
        }
      }, 80);
    }
  };

  const dots = Array.from({ length: Math.max(adminPasscode.length, 4) });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0B2A7A", "#1A4DBF", "#0B2A7A"]}
        style={[styles.topSection, { paddingTop: insets.top + 40 }]}
      >
        <View style={styles.iconWrap}>
          <Feather name="shield" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter your passcode to continue</Text>
      </LinearGradient>

      <View style={styles.padSection}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {dots.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    error
                      ? "#EF4444"
                      : i < entered.length
                      ? colors.primary
                      : colors.border,
                  transform: [{ scale: error ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>

        {error && (
          <Text style={styles.errorText}>Wrong passcode. Try again.</Text>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          {DIGITS.map((digit, idx) => {
            if (digit === "") return <View key={idx} style={styles.keyEmpty} />;
            const isDel = digit === "del";
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.key,
                  {
                    backgroundColor: isDel ? colors.muted : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleDigit(digit)}
                activeOpacity={0.7}
              >
                {isDel ? (
                  <Feather name="delete" size={20} color={colors.mutedForeground} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.foreground }]}>
                    {digit}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  padSection: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    gap: 12,
    marginTop: 16,
  },
  key: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  keyEmpty: {
    width: 82,
    height: 82,
  },
  keyText: {
    fontSize: 26,
    fontWeight: "400",
    fontFamily: "Inter_400Regular",
  },
  backBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
});
