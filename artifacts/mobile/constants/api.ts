import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Base API URL for native (non-web) environments.
 *
 * Priority:
 * 1. EXPO_PUBLIC_API_URL env var — set this in production/EAS builds
 * 2. Derived from Expo's debugger host (works in local dev via Expo Go / dev build)
 * 3. Empty string — relative URLs, works when running as Expo Web
 */
function resolveApiUrl(): string {
  // On web (browser), relative URLs already work — no base needed
  if (Platform.OS === "web") return "";

  // Explicit override (e.g. production deployment)
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // In Expo Go / dev client, the JS bundle is served from a local Metro bundler.
  // The Replit dev proxy routes /* through port 80, so we can use the same host
  // with port 80 to hit the API server.
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.5:8081"
  if (hostUri) {
    const host = hostUri.split(":")[0];
    // Use port 80 which goes through the Replit reverse proxy → /api → API server
    return `http://${host}:80`;
  }

  return "";
}

export const API_URL = resolveApiUrl();
