import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Simulated submission since it's not connected
    toast({
      title: "Message Sent",
      description: "Thank you for reaching out. We will get back to you soon.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <section className="pt-24 pb-12 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Get In <span className="fire-gradient-text">Touch</span></h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Whether you need prayer, have questions about the ministry, or want to connect, we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-5 gap-12 max-w-5xl mx-auto">
            
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Email</p>
                      <a href="mailto:info@dahinchuagni.org" className="text-white hover:text-primary transition-colors">
                        info@dahinchuagni.org
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-white">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Headquarters</p>
                      <p className="text-white">
                        Global Fire Center<br />
                        New Delhi, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 bg-card p-6 md:p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="bg-black/50 border-white/10 text-white placeholder:text-white/30" data-testid="input-name" />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="bg-black/50 border-white/10 text-white placeholder:text-white/30" data-testid="input-email" />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Message / Prayer Request</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help or pray for you?" 
                            className="min-h-[150px] bg-black/50 border-white/10 text-white placeholder:text-white/30" 
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
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

      <Footer />
    </div>
  );
}
