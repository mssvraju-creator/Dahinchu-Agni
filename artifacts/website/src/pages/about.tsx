import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Flame, Globe, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-16 bg-secondary/10 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white">Our <span className="fire-gradient-text">Story</span></h1>
            <p className="text-xl text-white/80 leading-relaxed font-medium">
              Dahinchu Agni Ministries was born out of a profound encounter with the Holy Spirit and a mandate to carry His fire to the ends of the earth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6 text-white border-l-4 border-primary pl-4">The Mandate</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                The name "Dahinchu Agni" translates to "Consuming Fire." It reflects our core belief that when God's presence invades a life, it consumes everything that hinders love and ignites a passion for His kingdom.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                We are not just a church; we are a movement of believers dedicated to prophetic worship, uncompromising preaching of the Word, and demonstrating the power of God through miracles, signs, and wonders.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay z-10" />
                 {/* Placeholder for real image, using CSS gradient for visual interest */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#222]" />
                 <div className="absolute inset-0 flex items-center justify-center text-white/20">
                   <img src="/da-logo.png" alt="Dahinchu Agni" className="w-1/2 opacity-30" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Core <span className="fire-gradient-text">Values</span></h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">The pillars that define who we are and what we do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-background border border-white/5 text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Flame size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Holy Spirit Encounter</h3>
              <p className="text-white/60">We prioritize the presence of God above all else, creating atmospheres where the Holy Spirit can move freely.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-background border border-white/5 text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Global Reach</h3>
              <p className="text-white/60">Through our online streams and international missions, we are taking the Gospel to every nation.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-background border border-white/5 text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Radical Love</h3>
              <p className="text-white/60">We believe in loving fiercely, serving unconditionally, and demonstrating Christ's love to the broken.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
