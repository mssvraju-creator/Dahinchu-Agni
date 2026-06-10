import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { MINISTRY } from "@/constants/ministry";
import { useColorScheme } from "react-native";

const LOGO_LIGHT = require("@/assets/images/da-logo.png");
const LOGO_DARK = require("@/assets/images/da-logo-dark.png");

interface Props {
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  isLive?: boolean;
  onLiveBellPress?: () => void;
}

export function MinistryHeader({ subtitle, showBack, onBack, isLive, onLiveBellPress }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const livePulse = useRef(new Animated.Value(1)).current;
  const topPadding = Platform.OS === "web" ? 52 : insets.top;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isLive) { livePulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1.25, duration: 700, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLive]);

  return (
    <LinearGradient
      colors={["#F97316", "#FB923C", "#FED7AA", "#FFF7ED", colors.background] as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      locations={[0, 0.18, 0.5, 0.75, 1]}
      style={[styles.container, { paddingTop: topPadding + 8 }]}
    >
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color="#7C2D12" />
          </TouchableOpacity>
        ) : null}

        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={colorScheme === "dark" ? LOGO_DARK : LOGO_LIGHT}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.textArea}>
          <Text style={styles.ministryName} numberOfLines={1}>
            {MINISTRY.name}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.tagline} numberOfLines={1}>
            {subtitle ?? MINISTRY.tagline}
          </Text>
        </View>

        {/* Live notification bell */}
        {isLive !== undefined ? (
          <TouchableOpacity
            onPress={onLiveBellPress}
            style={styles.bellBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name="bell"
              size={20}
              color={isLive ? "#DC2626" : "#9A3412"}
            />
            {isLive ? (
              <Animated.View
                style={[styles.liveBadge, { transform: [{ scale: livePulse }] }]}
              >
                <View style={styles.liveBadgeDot} />
              </Animated.View>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    
    paddingBottom: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#E84C1E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 52,
    height: 52,
  },
  textArea: {
    flex: 1,
    gap: 3,
  },
  ministryName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#431407",
    letterSpacing: 0.2,
    fontFamily: "DMSerifDisplay_400Regular",
  },
  divider: {
    width: 30,
    height: 1.5,
    backgroundColor: "#F97316",
    borderRadius: 1,
  },
  tagline: {
    fontSize: 10,
    color: "#9A3412",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Inter_600SemiBold",
  },
  bellBtn: {
    padding: 6,
    position: "relative",
  },
  liveBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DC2626",
    borderWidth: 1.5,
    borderColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
});
