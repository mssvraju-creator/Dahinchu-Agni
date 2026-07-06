import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Base API URL for native (non-web) environments.
 *
 * Priority:
 * 1. EXPO_PUBLIC_API_URL env var — set this in production/EAS builds (e.g. https://your-api.com)
 * 2. EXPO_PUBLIC_API_PORT env var — port override for the API server (default: 8080)
 * 3. Derived from Expo's debugger host (works in local dev via Expo Go / dev build)
 * 4. Empty string — relative URLs (works when served alongside API or via proxy)
 */
function resolveApiUrl(): string {
  if (Platform.OS === "web") return "";

  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.5:8081"
  if (hostUri) {
    const host = hostUri.split(":")[0];
    const apiPort = process.env.EXPO_PUBLIC_API_PORT || "8080";
    return `http://${host}:${apiPort}`;
  }

  return "";
}

export const API_URL = resolveApiUrl();
