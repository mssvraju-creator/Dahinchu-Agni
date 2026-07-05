import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { T, type Lang, type TKey } from "@/i18n";

interface LanguageContextValue {
  lang: Lang;
  t: (key: TKey) => string;
  toggleLanguage: () => void;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  t: (k) => T.en[k],
  toggleLanguage: () => {},
  setLang: () => {},
});

function getSavedLang(): Lang {
  try {
    const v = localStorage.getItem("da-lang");
    return v === "te" ? "te" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getSavedLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("da-lang", l); } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(lang === "en" ? "te" : "en");
  }, [lang, setLang]);

  const t = useCallback((key: TKey) => T[lang][key] ?? T.en[key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
