import { AppShell } from "@/components/AppShell";
import { Flame, Globe, Heart } from "lucide-react";

export default function About() {
  return (
    <AppShell subtitle="About">
      <section className="pt-8 pb-10 bg-muted/40 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground">Our <span className="fire-gradient-text">Story</span></h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              Dahinchu Agni Ministries was born out of a profound encounter with the Holy Spirit and a mandate to carry His fire to the ends of the earth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6 text-foreground border-l-4 border-primary pl-4">The Mandate</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The name "Dahinchu Agni" translates to "Consuming Fire." It reflects our core belief that when God's presence invades a life, it consumes everything that hinders love and ignites a passion for His kingdom.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We are not just a church; we are a movement of believers dedicated to prophetic worship, uncompromising preaching of the Word, and demonstrating the power of God through miracles, signs, and wonders.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10" />
                <img src="/da-logo.png" alt="Dahinchu Agni" className="w-1/2 opacity-50 relative z-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Our Core <span className="fire-gradient-text">Values</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">The pillars that define who we are and what we do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Flame size={32} />, title: "Holy Spirit Encounter", desc: "We prioritize the presence of God above all else, creating atmospheres where the Holy Spirit can move freely." },
              { icon: <Globe size={32} />, title: "Global Reach", desc: "Through our online streams and international missions, we are taking the Gospel to every nation." },
              { icon: <Heart size={32} />, title: "Radical Love", desc: "We believe in loving fiercely, serving unconditionally, and demonstrating Christ's love to the broken." },
            ].map((v) => (
              <div key={v.title} className="p-8 rounded-2xl bg-card border border-border text-center transition-transform hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{v.title}</h3>
                <p className="text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ministry <span className="fire-gradient-text">Impact</span></h2>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {[{ n: "530+", l: "Churches Planted" }, { n: "1,800+", l: "Pastors Trained" }, { n: "17", l: "Active Ministries" }, { n: "1994", l: "Founded" }].map((s) => (
              <div key={s.l} className="flex flex-col items-center">
                <span className="text-4xl font-black text-primary">{s.n}</span>
                <span className="text-muted-foreground text-sm mt-1">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
