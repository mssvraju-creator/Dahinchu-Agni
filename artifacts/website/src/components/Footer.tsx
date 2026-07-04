import { Link } from "wouter";
import { Youtube, Facebook, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/50 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img src="/da-logo-dark.png" alt="Dahinchu Agni Logo" className="h-10 w-auto" />
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                DAHINCHU AGNI
              </span>
            </Link>
            <p className="text-white/60 max-w-sm">
              A Spirit-filled fire ministry with global reach — passionate worship, prophetic preaching, and the power of the Holy Spirit. Consuming Fire — Igniting Nations.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-white/60 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/media" className="text-white/60 hover:text-primary transition-colors">Sermons</Link></li>
              <li><Link href="/about" className="text-white/60 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/give" className="text-white/60 hover:text-primary transition-colors">Give</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Connect</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-white/60 hover:text-primary transition-colors">Contact Us</Link></li>
              <li>
                <div className="flex gap-4 mt-4">
                  <a href="https://www.youtube.com/@Dahinchuagni" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary transition-colors" data-testid="social-youtube">
                    <Youtube size={24} />
                  </a>
                  <a href="#" className="text-white/60 hover:text-primary transition-colors" data-testid="social-facebook">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="text-white/60 hover:text-primary transition-colors" data-testid="social-instagram">
                    <Instagram size={24} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Dahinchu Agni Ministries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
