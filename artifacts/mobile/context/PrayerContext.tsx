import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  isAnonymous: boolean;
  isPublic: boolean;
  isPrayed: boolean;
  createdAt: string;
}

interface PrayerContextValue {
  prayers: PrayerRequest[];
  submitPrayer: (req: Omit<PrayerRequest, "id" | "createdAt" | "isPrayed">) => void;
  markPrayed: (id: string) => void;
  deletePrayer: (id: string) => void;
}

const SEED_PRAYERS: PrayerRequest[] = [
  {
    id: "seed-1",
    name: "Sarah M.",
    request: "Please pray for my family's health and salvation. My husband has been sick and we need a miracle.",
    isAnonymous: false,
    isPublic: true,
    isPrayed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    name: "Anonymous",
    request: "Praying for a breakthrough in my finances and for God to open new doors of opportunity.",
    isAnonymous: true,
    isPublic: true,
    isPrayed: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-3",
    name: "Brother James",
    request: "Pray for our church plant in the northern region. We need more workers and resources.",
    isAnonymous: false,
    isPublic: true,
    isPrayed: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const PrayerContext = createContext<PrayerContextValue>({
  prayers: SEED_PRAYERS,
  submitPrayer: () => {},
  markPrayed: () => {},
  deletePrayer: () => {},
});

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(SEED_PRAYERS);

  useEffect(() => {
    AsyncStorage.getItem("@dahinchu_prayers").then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as PrayerRequest[];
          if (saved.length > 0) setPrayers(saved);
        } catch {}
      }
    });
  }, []);

  function save(updated: PrayerRequest[]) {
    setPrayers(updated);
    AsyncStorage.setItem("@dahinchu_prayers", JSON.stringify(updated));
  }

  function submitPrayer(req: Omit<PrayerRequest, "id" | "createdAt" | "isPrayed">) {
    const newPrayer: PrayerRequest = {
      ...req,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      isPrayed: false,
    };
    save([newPrayer, ...prayers]);
  }

  function markPrayed(id: string) {
    save(prayers.map((p) => (p.id === id ? { ...p, isPrayed: true } : p)));
  }

  function deletePrayer(id: string) {
    save(prayers.filter((p) => p.id !== id));
  }

  return (
    <PrayerContext.Provider value={{ prayers, submitPrayer, markPrayed, deletePrayer }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  return useContext(PrayerContext);
}
