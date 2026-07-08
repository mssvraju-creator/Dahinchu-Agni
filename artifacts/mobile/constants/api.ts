import { Platform } from "react-native";
import Constants from "expo-constants";

let _resolved: string | undefined;

export function resolveApiUrl(): string {
  if (_resolved !== undefined) return _resolved;

  if (Platform.OS === "web") {
    _resolved = "";
    return _resolved;
  }

  // EXPO_PUBLIC_API_URL explicitly set (even to "") means use that value
  if ("EXPO_PUBLIC_API_URL" in process.env) {
    _resolved = process.env.EXPO_PUBLIC_API_URL ?? "";
    return _resolved;
  }

  // Fallback: derive from hostUri (works on LAN)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    _resolved = `http://${host}:8080`;
    return _resolved;
  }

  _resolved = "";
  return _resolved;
}

export const API_URL = resolveApiUrl();
