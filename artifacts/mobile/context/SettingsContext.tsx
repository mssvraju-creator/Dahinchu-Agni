import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextValue {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notifications: boolean;
  setNotifications: (val: boolean) => void;
  dailyVerse: boolean;
  setDailyVerse: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  darkMode: false,
  setDarkMode: () => {},
  notifications: true,
  setNotifications: () => {},
  dailyVerse: true,
  setDailyVerse: () => {},
});

const STORAGE_KEY = "@dahinchu_settings";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [notifications, setNotificationsState] = useState(true);
  const [dailyVerse, setDailyVerseState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.darkMode === "boolean") setDarkModeState(saved.darkMode);
        if (typeof saved.notifications === "boolean") setNotificationsState(saved.notifications);
        if (typeof saved.dailyVerse === "boolean") setDailyVerseState(saved.dailyVerse);
      }
    });
  }, []);

  function save(updates: Partial<{ darkMode: boolean; notifications: boolean; dailyVerse: boolean }>) {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const current = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
    });
  }

  function setDarkMode(val: boolean) {
    setDarkModeState(val);
    save({ darkMode: val });
  }

  function setNotifications(val: boolean) {
    setNotificationsState(val);
    save({ notifications: val });
  }

  function setDailyVerse(val: boolean) {
    setDailyVerseState(val);
    save({ dailyVerse: val });
  }

  return (
    <SettingsContext.Provider value={{ darkMode, setDarkMode, notifications, setNotifications, dailyVerse, setDailyVerse }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
