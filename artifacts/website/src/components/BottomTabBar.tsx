import { Link, useLocation } from "wouter";
import { Home, PlayCircle, Calendar, Heart, MoreHorizontal } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/media", label: "Media", icon: PlayCircle },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/prayer", label: "Prayer", icon: Heart },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomTabBar() {
  const [location] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-background/95 backdrop-blur-md border-t border-white/10 pb-safe">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px]">
            <Icon
              size={22}
              className={`transition-colors ${active ? "text-primary" : "text-white/40"}`}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-white/40"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
