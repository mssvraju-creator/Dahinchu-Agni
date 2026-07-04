import React, { createContext, useContext, useState } from "react";

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

const PrayerContext = createContext<PrayerContextValue>({
  prayers: [],
  submitPrayer: () => {},
  markPrayed: () => {},
  deletePrayer: () => {},
});

function lsLoad(): PrayerRequest[] {
  try {
    const raw = localStorage.getItem("@dahinchu_prayers");
    if (raw) {
      const saved = JSON.parse(raw) as PrayerRequest[];
      // Filter out old seed prayers by their known IDs
      return saved.filter((p) => !p.id.startsWith("seed-"));
    }
  } catch {}
  return [];
}

function lsSave(prayers: PrayerRequest[]) {
  try {
    localStorage.setItem("@dahinchu_prayers", JSON.stringify(prayers));
  } catch {}
}

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(lsLoad);

  function save(updated: PrayerRequest[]) {
    setPrayers(updated);
    lsSave(updated);
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
