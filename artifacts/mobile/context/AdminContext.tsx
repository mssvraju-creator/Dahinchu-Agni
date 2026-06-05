import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ADMIN_PASSCODE, DEFAULT_EVENTS, DEFAULT_RESOURCES, MinistryEvent, MinistryResource } from "@/constants/ministry";

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

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<MinistryEvent[]>(DEFAULT_EVENTS);
  const [resources, setResources] = useState<MinistryResource[]>(DEFAULT_RESOURCES);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("@da_events"),
      AsyncStorage.getItem("@da_resources"),
      AsyncStorage.getItem("@da_admin_settings"),
    ]).then(([evRaw, resRaw, setRaw]) => {
      if (evRaw) { try { setEvents(JSON.parse(evRaw)); } catch {} }
      if (resRaw) { try { setResources(JSON.parse(resRaw)); } catch {} }
      if (setRaw) { try { setAdminSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(setRaw) }); } catch {} }
    });
  }, []);

  function saveEvents(updated: MinistryEvent[]) {
    setEvents(updated);
    AsyncStorage.setItem("@da_events", JSON.stringify(updated));
  }

  function saveResources(updated: MinistryResource[]) {
    setResources(updated);
    AsyncStorage.setItem("@da_resources", JSON.stringify(updated));
  }

  function updateAdminSettings(settings: Partial<AdminSettings>) {
    const updated = { ...adminSettings, ...settings };
    setAdminSettings(updated);
    AsyncStorage.setItem("@da_admin_settings", JSON.stringify(updated));
  }

  function login(code: string) {
    if (code.trim() === ADMIN_PASSCODE) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }

  function logout() { setIsAdmin(false); }
  function addEvent(e: MinistryEvent) { saveEvents([...events, e]); }
  function updateEvent(e: MinistryEvent) { saveEvents(events.map((ev) => (ev.id === e.id ? e : ev))); }
  function deleteEvent(id: string) { saveEvents(events.filter((e) => e.id !== id)); }
  function addResource(r: MinistryResource) { saveResources([...resources, r]); }
  function updateResource(r: MinistryResource) { saveResources(resources.map((res) => (res.id === r.id ? r : res))); }
  function deleteResource(id: string) { saveResources(resources.filter((r) => r.id !== id)); }

  return (
    <AdminContext.Provider
      value={{
        isAdmin, login, logout, adminSettings, updateAdminSettings,
        events, addEvent, updateEvent, deleteEvent,
        resources, addResource, updateResource, deleteResource,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
