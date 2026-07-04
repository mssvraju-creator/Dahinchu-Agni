import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Copy, HeartHandshake, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Give() {
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedPaypal, setCopiedPaypal] = useState(false);

  const bankDetails = {
    name: "Dahinchu Agni Ministries",
    account: "1234567890",
    ifsc: "BANK0001234",
    bankName: "Global Ministry Bank",
  };
  const paypalEmail = "give@dahinchuagni.org";

  function copy(text: string, type: "bank" | "paypal") {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === "bank") { setCopiedBank(true); setTimeout(() => setCopiedBank(false), 2000); }
    else { setCopiedPaypal(true); setTimeout(() => setCopiedPaypal(false), 2000); }
  }

  return (
    <AppShell subtitle="Give">
      <section className="pt-8 pb-10 border-b border-border bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <HeartHandshake size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground">Partner <span className="fire-gradient-text">With Us</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous giving helps us broadcast the gospel, support the community, and keep the fire burning globally.
          </p>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Bank Transfer */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Bank Transfer</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Direct deposit to our ministry account</p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Account Name</label>
                  <p className="text-foreground font-semibold mt-0.5">{bankDetails.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Bank Name</label>
                  <p className="text-foreground font-medium mt-0.5">{bankDetails.bankName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Account Number</label>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-xl border border-border mt-0.5">
                    <code className="text-primary font-mono text-base font-bold">{bankDetails.account}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copy(bankDetails.account, "bank")}
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      data-testid="btn-copy-account"
                    >
                      {copiedBank ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">IFSC / Swift Code</label>
                  <p className="text-foreground font-mono font-medium mt-0.5">{bankDetails.ifsc}</p>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">PayPal</h2>
                <p className="text-muted-foreground text-sm mt-0.5">For international partners</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">PayPal Email</label>
                <div className="flex items-center justify-between bg-muted p-3 rounded-xl border border-border mt-0.5">
                  <span className="text-foreground font-medium text-sm">{paypalEmail}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(paypalEmail, "paypal")}
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                    data-testid="btn-copy-paypal"
                  >
                    {copiedPaypal ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
              <div className="mt-auto p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-amber-800 text-xs leading-relaxed">
                  Dahinchu Agni Ministries is a registered non-profit. For giving receipts, please contact our support team.
                </p>
              </div>
            </div>

          </div>

          {/* Scripture */}
          <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-foreground font-semibold italic leading-relaxed">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </p>
            <p className="text-primary text-sm font-bold mt-2">— 2 Corinthians 9:7</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
