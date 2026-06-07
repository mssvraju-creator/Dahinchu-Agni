import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useEffect, useRef } from "react";
import { Platform, Alert, Linking } from "react-native";
import { router } from "expo-router";

// Only set the notification handler on native (web doesn't support it)
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Web or simulator — skip entirely
  if (Platform.OS === "web" || !Device.isDevice) return undefined;

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("dahinchu-agni", {
      name: "Dahinchu Agni",
      description: "Live streams, new messages, events & updates",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E84C1E",
      showBadge: true,
    });
  }

  // Check / request permission
  type PermResult = { granted: boolean };
  const existing = (await Notifications.getPermissionsAsync()) as unknown as PermResult;
  let finalGranted = existing.granted;

  if (!finalGranted) {
    const requested = (await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    })) as unknown as PermResult;
    finalGranted = requested.granted;
  }

  if (!finalGranted) {
    Alert.alert(
      "Enable Notifications",
      "Turn on notifications to get alerted when Dahinchu Agni goes LIVE, posts new messages, or announces events.",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return undefined;
  }

  // Get Expo push token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId && projectId !== "replace-with-your-eas-project-id"
        ? { projectId }
        : undefined
    );
    return token;
  } catch {
    return undefined;
  }
}

async function registerTokenWithServer(token: string) {
  try {
    await fetch("/api/notifications/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: Platform.OS }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {}
}

function handleNotificationTap(data: Record<string, any>) {
  const type = data?.type as string | undefined;
  if (type === "live" || type === "video") router.push("/(tabs)/media");
  else if (type === "event") router.push("/(tabs)/events");
  else if (type === "resource") router.push("/resources");
}

export function useNotifications() {
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Request permission + register token
    registerForPushNotificationsAsync().then((token) => {
      if (token) registerTokenWithServer(token);
    });

    // Foreground notification received
    notifListener.current = Notifications.addNotificationReceivedListener(
      () => { /* setNotificationHandler already shows the UI */ }
    );

    // User tapped a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = (response.notification.request.content.data ?? {}) as Record<string, any>;
        handleNotificationTap(data);
      }
    );

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}

// Call once on launch to navigate if app was opened from a notification
export async function handleInitialNotification() {
  if (Platform.OS === "web") return;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      const data = (response.notification.request.content.data ?? {}) as Record<string, any>;
      handleNotificationTap(data);
    }
  } catch {}
}
