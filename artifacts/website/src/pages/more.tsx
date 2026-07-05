import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { MINISTRY } from "@/constants/ministry";
import {
  Info, BookOpen, Gift, MapPin, Youtube, Tv,
  Facebook, Instagram, Globe, Shield, LogOut, ChevronRight, Languages,
} from "lucide-react";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  href?: string;
  externalHref?: string;
  color?: string;
  badge?: string;
  onPress?: () => void;
  highlight?: boolean;
}

function MenuRow({ item }: { item: MenuItem }) {
  const iconBg = (item.color ?? "#E84C1E") + "18";

  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3.5 bg-card border-b border-border last:border-0 active:opacity-70 transition-opacity ${
      item.highlight ? "bg-primary/5 dark:bg-primary/10" : ""
    }`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.highlight ? "#E84C1E22" : iconBg }}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-tight ${item.highlight ? "text-primary" : "text-foreground"}`}>{item.label}</p>
        {item.sublabel && <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{item.sublabel}</p>}
      </div>
      {item.badge && (
        <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[9px] font-bold tracking-wide shrink-0">
          {item.badge}
        </span>
      )}
      <ChevronRight size={15} className={item.highlight ? "text-primary/50 shrink-0" : "text-muted-foreground/40 shrink-0"} />
    </div>
  );

  if (item.externalHref) {
    return (
      <a href={item.externalHref} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  if (item.href) {
    return <Link href={item.href} className="block">{inner}</Link>;
  }
  if (item.onPress) {
    return <button onClick={item.onPress} className="w-full text-left">{inner}</button>;
  }
  return inner;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div className="px-4 mb-5">
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest mb-2 px-0.5">{title}</p>
      <div className="rounded-2xl overflow-hidden border border-border">
        {items.map((item, i) => <MenuRow key={i} item={item} />)}
      </div>
    </div>
  );
}

export default function More() {
  const { isAdmin, logout, adminSettings } = useAdmin();
  const { lang, toggleLanguage, t } = useLanguage();

  const ministryItems: MenuItem[] = [
    {
      icon: <Info size={17} className="text-primary" />,
      label: "About Dr. Thomas & Ministry",
      sublabel: "Our story, vision & all 17 ministries",
      href: "/about",
    },
    {
      icon: <BookOpen size={17} style={{ color: "#7C3AED" }} />,
      label: "Resources & Downloads",
      sublabel: "Bible studies, devotionals & training guides",
      href: "/resources",
      color: "#7C3AED",
    },
    {
      icon: <Gift size={17} style={{ color: "#C8860A" }} />,
      label: "Give / Donate",
      sublabel: "Support Dahinchu Agni Ministries",
      href: "/give",
      color: "#C8860A",
    },
    {
      icon: <MapPin size={17} className="text-primary" />,
      label: "Location & Contact",
      sublabel: "Rajahmundry, Andhra Pradesh, India",
      href: "/contact",
    },
  ];

  const mediaItems: MenuItem[] = [
    {
      icon: <Youtube size={17} style={{ color: "#DC2626" }} />,
      label: "YouTube Channel",
      sublabel: "Dahinchu Agni · Live & recorded services",
      externalHref: MINISTRY.youtubeChannelUrl,
      color: "#DC2626",
    },
    {
      icon: <Tv size={17} style={{ color: "#DC2626" }} />,
      label: "Calvary TV Ministry",
      sublabel: "Weekly Telugu broadcasts & programs",
      externalHref: MINISTRY.youtubeChannelUrl,
      color: "#DC2626",
    },
    {
      icon: <Facebook size={17} style={{ color: "#2563EB" }} />,
      label: "Facebook",
      sublabel: "facebook.com/DahinchuAgni",
      externalHref: MINISTRY.facebook,
      color: "#2563EB",
    },
    {
      icon: <Instagram size={17} style={{ color: "#D97706" }} />,
      label: "Instagram",
      sublabel: "instagram.com/dahinchu_agni",
      externalHref: MINISTRY.instagram,
      color: "#D97706",
    },
    {
      icon: <Globe size={17} style={{ color: "#059669" }} />,
      label: "Official Website",
      sublabel: "dahinchuagni.org",
      externalHref: MINISTRY.website,
      color: "#059669",
    },
  ];

  const appItems: MenuItem[] = [
    {
      icon: <Languages size={17} className="text-primary" />,
      label: lang === "en" ? "తెలుగులో చూడండి" : "Switch to English",
      sublabel: lang === "en" ? "Switch the entire app to Telugu" : "అప్లికేషన్‌ను ఇంగ్లీష్‌కి మార్చండి",
      color: "#E84C1E",
      onPress: toggleLanguage,
      highlight: true,
    },
    {
      icon: <Shield size={17} className="text-primary" />,
      label: "Admin Panel",
      sublabel: isAdmin ? "Admin mode active" : "Manage events, resources & prayers",
      href: "/admin",
      color: isAdmin ? "#059669" : undefined,
      badge: isAdmin ? "ADMIN" : undefined,
    },
    ...(isAdmin
      ? [{
          icon: <LogOut size={17} style={{ color: "#EF4444" }} />,
          label: "Admin Sign Out",
          color: "#EF4444",
          onPress: logout,
        } as MenuItem]
      : []),
  ];

  return (
    <AppShell subtitle={t("more")}>
      {/* Ministry hero card */}
      <Link href="/about" className="block mx-4 mt-4 mb-5">
        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: "linear-gradient(135deg,#FFF7ED,#FED7AA,#FBBF7A)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm shrink-0">
              <img src="/da-logo.png" alt="DA Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-amber-900 text-base font-bold leading-snug">{MINISTRY.name}</p>
              <p className="text-amber-700/80 text-[10px] mt-0.5">Founded 1994 · Dr. Thomas · Rajahmundry, India</p>
            </div>
            <ChevronRight size={16} className="text-amber-700 shrink-0" />
          </div>
          <div className="flex gap-5">
            {[{ n: "530+", l: "Churches" }, { n: "1,800+", l: "Pastors" }, { n: "17", l: "Ministries" }].map((s) => (
              <div key={s.l} className="flex flex-col items-center">
                <span className="text-primary text-base font-black">{s.n}</span>
                <span className="text-amber-700/70 text-[9px] uppercase tracking-wide">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {adminSettings.noticeText ? (
        <div className="mx-4 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-900 text-xs leading-relaxed">{adminSettings.noticeText}</p>
        </div>
      ) : null}

      <MenuSection title="Ministry" items={ministryItems} />
      <MenuSection title="Media & Online" items={mediaItems} />
      <MenuSection title={t("language") + " & App"} items={appItems} />

      <p className="text-center text-muted-foreground/40 text-xs pb-6 px-4">
        Dahinchu Agni Ministries · v1.0.0 · {MINISTRY.fullName}
      </p>
    </AppShell>
  );
}
