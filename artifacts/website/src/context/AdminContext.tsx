import React, { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_PASSCODE, DEFAULT_EVENTS, DEFAULT_RESOURCES, type MinistryEvent, type MinistryResource } from "@/constants/ministry";

export interface AdminSettings {
  welcomeMessage: string;
  contactEmail: string;
  contactPhone: string;
  liveStreamEnabled: boolean;
  prayerWallEnabled: boolean;
  noticeText: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  welcomeMessage: "Welcome to Dahinchu Agni Ministries — Consuming Fire, Igniting Nations.",
  contactEmail: "dahinchuagni@gmail.com",
  contactPhone: "+91 88334 44009",
  liveStreamEnabled: true,
  prayerWallEnabled: true,
  noticeText: "",
};

interface AdminContextValue {
  isAdmin: boolean;
  login: (code: string) => boolean;
  logout: () => void;
  adminSettings: AdminSettings;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  events: MinistryEvent[];
  addEvent: (event: MinistryEvent) => void;
  updateEvent: (event: MinistryEvent) => void;
  deleteEvent: (id: string) => void;
  resources: MinistryResource[];
  addResource: (resource: MinistryResource) => void;
  updateResource: (resource: MinistryResource) => void;
  deleteResource: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
  adminSettings: DEFAULT_SETTINGS,
  updateAdminSettings: () => {},
  events: DEFAULT_EVENTS,
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  resources: DEFAULT_RESOURCES,
  addResource: () => {},
  updateResource: () => {},
  deleteResource: () => {},
});

function ls<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<MinistryEvent[]>(() => ls("@da_events", DEFAULT_EVENTS));
  const [resources, setResources] = useState<MinistryResource[]>(() => ls("@da_resources", DEFAULT_RESOURCES));
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...ls("@da_admin_settings", {}),
  }));

  useEffect(() => {
    lsSet("@da_events", events);
  }, [events]);

  useEffect(() => {
    lsSet("@da_resources", resources);
  }, [resources]);

  useEffect(() => {
    lsSet("@da_admin_settings", adminSettings);
  }, [adminSettings]);

  function login(code: string) {
    if (code.trim() === ADMIN_PASSCODE) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function logout() {
    setIsAdmin(false);
  }

  function updateAdminSettings(settings: Partial<AdminSettings>) {
    setAdminSettings((prev) => ({ ...prev, ...settings }));
  }

  function addEvent(e: MinistryEvent) {
    setEvents((prev) => [...prev, e]);
  }

  function updateEvent(e: MinistryEvent) {
    setEvents((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)));
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function addResource(r: MinistryResource) {
    setResources((prev) => [...prev, r]);
  }

  function updateResource(r: MinistryResource) {
    setResources((prev) => prev.map((res) => (res.id === r.id ? r : res)));
  }

  function deleteResource(id: string) {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        adminSettings,
        updateAdminSettings,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        resources,
        addResource,
        updateResource,
        deleteResource,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
