import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { MINISTRY } from "@/constants/ministry";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(_data: FormValues) {
    setSubmitted(true);
    form.reset();
    toast({ title: "Message Sent", description: "Thank you! We'll get back to you soon." });
    setTimeout(() => setSubmitted(false), 4000);
  }

  const contacts = [
    { icon: <Mail size={18} />, label: "Email", value: MINISTRY.email, href: `mailto:${MINISTRY.email}` },
    { icon: <Phone size={18} />, label: "Phone", value: MINISTRY.phone, href: `tel:${MINISTRY.phone}` },
    { icon: <MapPin size={18} />, label: "Headquarters", value: "Rajahmundry, Andhra Pradesh, India", href: undefined },
  ];

  return (
    <AppShell subtitle="Contact">
      <section className="pt-8 pb-10 border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground">Get In <span className="fire-gradient-text">Touch</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you need prayer, have questions about the ministry, or want to connect — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="grid md:grid-cols-5 gap-8">

            {/* Contact info */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
              {contacts.map((c) => (
                <div key={c.label} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-foreground font-medium text-sm hover:text-primary transition-colors break-all">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-foreground font-medium text-sm">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="md:col-span-3 bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-xl font-bold text-foreground mb-5">Send a Message</h2>

              {submitted && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-5">
                  <CheckCircle2 size={16} /> Message sent! We'll be in touch soon.
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} className="input-field" data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} className="input-field" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">Message / Prayer Request</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How can we help or pray for you?"
                            className="input-field min-h-[130px] resize-none"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 bg-primary text-white hover:bg-primary/90 fire-glow" data-testid="btn-submit-contact">
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>

          </div>
        </div>
      </section>
    </AppShell>
  );
}
