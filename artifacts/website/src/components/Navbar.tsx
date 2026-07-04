import { Link, useLocation } from "wouter";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/media", label: "Sermons" },
    { href: "/events", label: "Events" },
    { href: "/prayer", label: "Prayer" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/da-logo-dark.png" alt="Dahinchu Agni Logo" className="h-10 w-auto" />
            <span className="font-sans text-xl font-bold tracking-tight text-white hidden sm:block">
              DAHINCHU AGNI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-white/70"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/give">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 fire-glow" data-testid="nav-btn-give">
                Donate Now
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="btn-mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/10 bg-background px-4 py-6">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium transition-colors ${
                  location === link.href ? "text-primary" : "text-white/70"
                }`}
                onClick={() => setIsOpen(false)}
                data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/give" onClick={() => setIsOpen(false)}>
              <Button className="w-full mt-4 bg-primary text-primary-foreground" data-testid="mobile-nav-btn-give">
                Donate Now
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
