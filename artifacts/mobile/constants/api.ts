import { Platform } from "react-native";
import Constants from "expo-constants";

let _resolved: string | null = null;

function resolveApiUrl(): string {
  if (_resolved) return _resolved;

  if (Platform.OS === "web") {
    _resolved = "";
    return _resolved;
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    _resolved = envUrl.replace(/\/$/, "");
    return _resolved;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    const apiPort = process.env.EXPO_PUBLIC_API_PORT || "8080";
    _resolved = `http://${host}:${apiPort}`;
    return _resolved;
  }

  if (__DEV__) {
    console.warn(
      "[API] EXPO_PUBLIC_API_URL not set. API calls will use relative URLs. " +
        "Set EXPO_PUBLIC_API_URL in your EAS build secrets or .env for production."
    );
  }

  _resolved = "";
  return _resolved;
}

export const API_URL = resolveApiUrl();
