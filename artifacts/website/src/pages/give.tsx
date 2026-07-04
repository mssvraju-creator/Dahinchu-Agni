import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, HeartHandshake, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Give() {
  const { toast } = useToast();
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedPaypal, setCopiedPaypal] = useState(false);

  const bankDetails = {
    name: "Dahinchu Agni Ministries",
    account: "1234567890",
    ifsc: "BANK0001234",
    bankName: "Global Ministry Bank"
  };

  const paypalEmail = "give@dahinchuagni.org";

  const copyToClipboard = (text: string, type: 'bank' | 'paypal') => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedPaypal(true);
      setTimeout(() => setCopiedPaypal(false), 2000);
    }
    toast({
      title: "Copied to clipboard",
      description: "Information has been copied to your clipboard.",
    });
  };

  return (
    <AppShell subtitle="Give">
      <section className="pt-8 pb-10 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
            <HeartHandshake size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Partner <span className="fire-gradient-text">With Us</span></h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your generous giving helps us broadcast the gospel, support the community, and keep the fire burning globally.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Bank Transfer</CardTitle>
                <CardDescription className="text-white/60">Direct deposit to our ministry account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Account Name</label>
                    <p className="text-white font-medium text-lg">{bankDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Bank Name</label>
                    <p className="text-white font-medium">{bankDetails.bankName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">Account Number</label>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                      <code className="text-primary font-mono text-lg">{bankDetails.account}</code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(bankDetails.account, 'bank')}
                        className="text-white/50 hover:text-white hover:bg-white/10"
                        data-testid="btn-copy-account"
                      >
                        {copiedBank ? <CheckCircle2 className="text-green-500" /> : <Copy size={18} />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider">IFSC / Swift Code</label>
                    <p className="text-white font-medium font-mono">{bankDetails.ifsc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="bg-card border-white/10 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">PayPal</CardTitle>
                  <CardDescription className="text-white/60">For international partners</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <label className="text-xs text-white/50 uppercase tracking-wider">PayPal Email</label>
                    <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 mt-1">
                      <span className="text-white font-medium">{paypalEmail}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(paypalEmail, 'paypal')}
                        className="text-white/50 hover:text-white hover:bg-white/10"
                        data-testid="btn-copy-paypal"
                      >
                        {copiedPaypal ? <CheckCircle2 className="text-green-500" /> : <Copy size={18} />}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-auto text-sm text-white/40 italic">
                    * Dahinchu Agni Ministries is a registered non-profit. For giving receipts, please contact our support team.
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </section>

    </AppShell>
  );
}
