import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAdmin, type AdminSettings } from "@/context/AdminContext";
import { usePrayer } from "@/context/PrayerContext";
import { useGetNotificationStats } from "@workspace/api-client-react";
import { type MinistryEvent, type MinistryResource } from "@/constants/ministry";
import { Button } from "@/components/ui/button";
import {
  Lock, LogOut, Calendar, BookOpen, Heart, Bell, Settings,
  Plus, Trash2, CheckCircle2, Users, Send, Loader2, X, Upload, FileAudio, FileVideo, File,
} from "lucide-react";

const TABS = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "prayers", label: "Prayers", icon: Heart },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function LoginScreen({ onLogin }: { onLogin: (code: string) => boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onLogin(code);
    if (!ok) {
      setError(true);
      setCode("");
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <AppShell subtitle="Admin">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm flex flex-col gap-6 items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Admin Access</h1>
            <p className="text-muted-foreground text-sm">Enter your passcode to manage ministry content</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              type="password"
              placeholder="Enter passcode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-muted border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors text-center tracking-widest text-lg ${
                error ? "border-red-500 animate-pulse" : "border-border focus:border-primary/50"
              }`}
              data-testid="input-passcode"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">Incorrect passcode</p>}
            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 fire-glow h-12" data-testid="btn-login">
              Login
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function EventsTab() {
  const { events, addEvent, deleteEvent } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MinistryEvent>>({ category: "service", isRecurring: false });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.location || !form.description) return;
    addEvent({
      id: Date.now().toString(),
      title: form.title!, date: form.date!, time: form.time!, endTime: form.endTime,
      location: form.location!, description: form.description!,
      category: form.category as MinistryEvent["category"],
      isRecurring: form.isRecurring, recurringPattern: form.recurringPattern,
      registrationUrl: form.registrationUrl,
    });
    setShowForm(false);
    setForm({ category: "service", isRecurring: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{events.length} Events</h2>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-white hover:bg-primary/90" data-testid="btn-add-event">
          <Plus size={16} className="mr-2" /> Add Event
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">New Event</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <input required placeholder="Title" value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" data-testid="event-title" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.date || ""} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input-field" />
            <input required type="time" value={form.time || ""} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="input-field" />
          </div>
          <input required placeholder="Location" value={form.location || ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="input-field" />
          <textarea required placeholder="Description" rows={3} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MinistryEvent["category"] }))} className="input-field">
            {["service", "prayer", "conference", "training", "youth", "special"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={!!form.isRecurring} onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))} className="accent-primary" />
            Recurring event
          </label>
          {form.isRecurring && <input placeholder="Recurring pattern (e.g. Every Sunday)" value={form.recurringPattern || ""} onChange={(e) => setForm((f) => ({ ...f, recurringPattern: e.target.value }))} className="input-field" />}
          <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Add Event</Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-card border border-border" data-testid={`admin-event-${ev.id}`}>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{ev.title}</p>
              <p className="text-sm text-muted-foreground">{ev.date} · {ev.time} · {ev.location.split(",")[0]}</p>
            </div>
            <button onClick={() => deleteEvent(ev.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0" data-testid={`btn-delete-event-${ev.id}`}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileUploadButton({ onUploaded }: { onUploaded: (url: string, name: string, type: MinistryResource["type"]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  function detectType(mimeType: string): MinistryResource["type"] {
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType === "application/pdf") return "pdf";
    return "article";
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(`Uploading ${file.name}…`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUploaded(data.url, file.name, detectType(file.type));
      setProgress(null);
    } catch {
      setProgress("Upload failed — try a URL instead");
      setTimeout(() => setProgress(null), 3000);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" accept="*/*" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 text-sm transition-colors w-full justify-center"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? "Uploading…" : "Upload file (mp3, video, pdf, any)"}
      </button>
      {progress && <p className="text-xs text-muted-foreground mt-1 text-center">{progress}</p>}
    </div>
  );
}

function ResourcesTab() {
  const { resources, addResource, deleteResource } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MinistryResource>>({ category: "bible-study", type: "pdf", isFree: true });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) return;
    addResource({
      id: Date.now().toString(),
      title: form.title!, description: form.description!,
      category: form.category as MinistryResource["category"],
      type: form.type as MinistryResource["type"],
      isFree: !!form.isFree, url: form.url, author: form.author,
    });
    setShowForm(false);
    setForm({ category: "bible-study", type: "pdf", isFree: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{resources.length} Resources</h2>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-white hover:bg-primary/90" data-testid="btn-add-resource">
          <Plus size={16} className="mr-2" /> Add Resource
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">New Resource</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <input required placeholder="Title" value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" />
          <textarea required placeholder="Description" rows={3} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" />
          <input placeholder="Author (optional)" value={form.author || ""} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="input-field" />
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">File / Link</p>
            <FileUploadButton onUploaded={(url, _name, type) => setForm((f) => ({ ...f, url, type }))} />
            <div className="flex items-center gap-2 text-muted-foreground/40 text-xs"><div className="flex-1 h-px bg-border" />or paste URL<div className="flex-1 h-px bg-border" /></div>
            <input placeholder="https://… or leave blank" value={form.url || ""} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MinistryResource["category"] }))} className="input-field">
              {["bible-study", "devotional", "training", "prayer", "discipleship"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MinistryResource["type"] }))} className="input-field">
              {["pdf", "video", "audio", "article"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={!!form.isFree} onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))} className="accent-primary" />
            Free resource
          </label>
          <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Add Resource</Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {resources.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-card border border-border" data-testid={`admin-resource-${r.id}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {r.type === "audio" ? <FileAudio size={15} className="text-primary" /> : r.type === "video" ? <FileVideo size={15} className="text-primary" /> : <File size={15} className="text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {r.type}{r.isFree ? " · Free" : ""}</p>
              </div>
            </div>
            <button onClick={() => deleteResource(r.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0" data-testid={`btn-delete-resource-${r.id}`}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrayersTab() {
  const { prayers, markPrayed, deletePrayer } = usePrayer();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground">{prayers.length} Prayer Requests</h2>
      {prayers.map((p) => (
        <div key={p.id} className={`flex flex-col gap-3 p-4 rounded-xl border ${p.isPrayed ? "bg-green-50 border-green-200 opacity-70" : "bg-card border-border"}`} data-testid={`admin-prayer-${p.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground text-sm">{p.isAnonymous ? "Anonymous" : p.name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)} · {p.isPublic ? "Public" : "Private"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!p.isPrayed && (
                <button onClick={() => markPrayed(p.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Mark as prayed" data-testid={`btn-prayed-${p.id}`}>
                  <CheckCircle2 size={16} />
                </button>
              )}
              <button onClick={() => deletePrayer(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" data-testid={`btn-delete-prayer-${p.id}`}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed">{p.request}</p>
          {p.isPrayed && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Marked as prayed</p>}
        </div>
      ))}
      {prayers.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <Heart size={40} className="mx-auto mb-3 opacity-30" />
          <p>No prayer requests yet</p>
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const { data: statsData, isLoading } = useGetNotificationStats();
  const [liveTitle, setLiveTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sending, setSending] = useState<"live" | "custom" | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  async function sendLive() {
    setSending("live");
    try {
      const res = await fetch("/api/notifications/send-live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: "DAFIRE94", streamTitle: liveTitle || undefined }) });
      if (res.ok) { setSent("Live alert sent!"); setLiveTitle(""); } else setSent("Failed to send");
    } catch { setSent("Failed to send"); }
    setSending(null);
    setTimeout(() => setSent(null), 3000);
  }

  async function sendCustom() {
    if (!customTitle || !customBody) return;
    setSending("custom");
    try {
      const res = await fetch("/api/notifications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: "DAFIRE94", title: customTitle, body: customBody }) });
      if (res.ok) { setSent("Notification sent!"); setCustomTitle(""); setCustomBody(""); } else setSent("Failed to send");
    } catch { setSent("Failed to send"); }
    setSending(null);
    setTimeout(() => setSent(null), 3000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Users size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Push Subscribers</p>
          <p className="text-2xl font-black text-foreground">{isLoading ? "—" : (statsData?.subscribers ?? 0)}</p>
        </div>
      </div>

      {sent && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> {sent}
        </div>
      )}

      <div className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Bell size={16} className="text-red-500" /> Quick Live Alert</h3>
        <p className="text-sm text-muted-foreground">Send an instant "We're Live!" notification to all subscribers</p>
        <input placeholder="Custom title (optional)" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} className="input-field" data-testid="input-live-title" />
        <Button onClick={sendLive} disabled={sending === "live"} className="bg-red-500 text-white hover:bg-red-600" data-testid="btn-send-live">
          {sending === "live" ? <Loader2 size={16} className="animate-spin mr-2" /> : <Bell size={16} className="mr-2" />}
          Send Live Alert
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Send size={16} className="text-primary" /> Custom Notification</h3>
        <input placeholder="Notification title" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="input-field" data-testid="input-notif-title" />
        <textarea placeholder="Notification message" value={customBody} onChange={(e) => setCustomBody(e.target.value)} rows={3} className="input-field resize-none" data-testid="input-notif-body" />
        <Button onClick={sendCustom} disabled={sending === "custom" || !customTitle || !customBody} className="bg-primary text-white hover:bg-primary/90" data-testid="btn-send-notif">
          {sending === "custom" ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
          Send Notification
        </Button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { adminSettings, updateAdminSettings } = useAdmin();
  const [form, setForm] = useState<AdminSettings>(adminSettings);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateAdminSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground">Site Settings</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground font-medium">Notice Banner (leave blank to hide)</label>
        <input value={form.noticeText} onChange={(e) => setForm((f) => ({ ...f, noticeText: e.target.value }))} placeholder="e.g. Special service this Sunday at 6PM" className="input-field" data-testid="input-notice-text" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground font-medium">Welcome Message</label>
        <textarea rows={3} value={form.welcomeMessage} onChange={(e) => setForm((f) => ({ ...f, welcomeMessage: e.target.value }))} className="input-field resize-none" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground font-medium">Contact Email</label>
        <input value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} className="input-field" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground font-medium">Contact Phone</label>
        <input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} className="input-field" />
      </div>
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-card border border-border">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-foreground/80 text-sm">Live Stream Enabled</span>
          <input type="checkbox" checked={form.liveStreamEnabled} onChange={(e) => setForm((f) => ({ ...f, liveStreamEnabled: e.target.checked }))} className="accent-primary w-4 h-4" />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-foreground/80 text-sm">Prayer Wall Enabled</span>
          <input type="checkbox" checked={form.prayerWallEnabled} onChange={(e) => setForm((f) => ({ ...f, prayerWallEnabled: e.target.checked }))} className="accent-primary w-4 h-4" />
        </label>
      </div>
      <Button type="submit" className={`${saved ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"} text-white transition-colors`} data-testid="btn-save-settings">
        {saved ? <><CheckCircle2 size={16} className="mr-2" /> Saved!</> : "Save Settings"}
      </Button>
    </form>
  );
}

export default function Admin() {
  const { isAdmin, login, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabId>("events");

  if (!isAdmin) return <LoginScreen onLogin={login} />;

  const TabContent = {
    events: <EventsTab />,
    resources: <ResourcesTab />,
    prayers: <PrayersTab />,
    notifications: <NotificationsTab />,
    settings: <SettingsTab />,
  }[activeTab];

  return (
    <AppShell subtitle="Admin Panel">
      <section className="pt-6 pb-8 bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Dahinchu Agni Ministries</p>
          </div>
          <Button variant="outline" onClick={logout} className="border-border text-muted-foreground hover:bg-muted" data-testid="btn-logout">
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </section>

      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-20 z-10">
        <div className="container mx-auto px-4 md:px-6 flex overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${id}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      <section className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          {TabContent}
        </div>
      </section>
    </AppShell>
  );
}
