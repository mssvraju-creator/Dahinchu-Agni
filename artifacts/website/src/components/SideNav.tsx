import { Link, useLocation } from "wouter";
import { useGetLiveStream, getGetLiveStreamQueryKey } from "@workspace/api-client-react";
import {
  Home, PlayCircle, Calendar, Heart, MoreHorizontal,
  BookOpen, Gift, Info, Phone, Radio, Shield
} from "lucide-react";

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

const PRIMARY_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/media", label: "Media", icon: PlayCircle },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/prayer", label: "Prayer", icon: Heart },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

const SECONDARY_TABS = [
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/give", label: "Give", icon: Gift },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Phone },
];

function isActive(location: string, href: string) {
  if (href === "/") return location === "/";
  return location.startsWith(href);
}

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const [location] = useLocation();
  const active = isActive(location, href);
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
        active
          ? "bg-primary/10 text-primary"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
        <span className={`text-sm font-medium ${active ? "text-primary" : ""}`}>{label}</span>
      </div>
    </Link>
  );
}

export function SideNav() {
  const { data: liveStatus } = useGetLiveStream(
    { channelId: CHANNEL_ID },
    { query: { refetchInterval: 60000, queryKey: getGetLiveStreamQueryKey({ channelId: CHANNEL_ID }) } }
  );

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 xl:w-64 bg-background border-r border-white/10 z-50 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10 shrink-0">
        <img src="/da-logo-dark.png" alt="DA Logo" className="h-9 w-auto" />
        <div className="min-w-0">
          <p className="text-white font-black text-sm leading-tight tracking-tight">DAHINCHU AGNI</p>
          <p className="text-white/40 text-[10px] leading-none mt-0.5">Consuming Fire · Igniting Nations</p>
        </div>
      </div>

      {/* Live badge */}
      {liveStatus?.isLive && (
        <a
          href={`https://www.youtube.com/watch?v=${liveStatus.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/20 border border-red-500/30"
        >
          <Radio size={13} className="text-red-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase">Live Now</p>
            <p className="text-white/70 text-xs truncate">{liveStatus.title ?? "Live Service"}</p>
          </div>
        </a>
      )}

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 px-2 mt-4">
        {PRIMARY_TABS.map((tab) => <NavItem key={tab.href} {...tab} />)}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 border-t border-white/10" />

      {/* Secondary nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {SECONDARY_TABS.map((tab) => <NavItem key={tab.href} {...tab} />)}
        <NavItem href="/admin" label="Admin" icon={Shield} />
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pb-5 pt-3 border-t border-white/10 shrink-0">
        <p className="text-white/20 text-[10px] text-center leading-relaxed">
          © 2025 Dahinchu Agni Ministries{"\n"}All rights reserved.
        </p>
      </div>
    </aside>
  );
}
