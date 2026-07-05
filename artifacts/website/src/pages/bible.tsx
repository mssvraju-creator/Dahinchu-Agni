import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import {
  ChevronLeft, ChevronRight, Search, X, BookOpen,
  ChevronDown, Send, Loader2, Languages, MessageSquarePlus,
  Check, Copy, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Book = { id: number; name: string; teluguName: string; chapters: number };
type Verse = { verse: number; text: string };
type SearchResult = { book: number; chapter: number; verse: number; text: string };
type ViewMode = "split" | "en" | "te";

// ─── API helpers ───────────────────────────────────────────────────────────────
const BASE = (import.meta.env.BASE_URL as string).replace(/\/$/, "");

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Verse row (block layout for clean single-verse highlighting) ──────────────
function VerseRow({
  verse, highlighted, onHighlight, lang,
}: {
  verse: Verse;
  highlighted: number | null;
  onHighlight: (v: number | null) => void;
  lang: "en" | "te";
}) {
  const isHL = highlighted === verse.verse;
  return (
    <div
      onClick={() => onHighlight(isHL ? null : verse.verse)}
      className={`flex gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none group ${
        isHL
          ? "bg-amber-50 border border-amber-300 shadow-sm dark:bg-amber-950/30 dark:border-amber-700"
          : "border border-transparent hover:bg-muted/50"
      }`}
    >
      <span className={`text-[11px] font-bold shrink-0 mt-1 min-w-[20px] text-right leading-tight ${
        isHL ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
      }`}>
        {verse.verse}
      </span>
      <p
        className={`text-[15px] leading-relaxed flex-1 ${
          isHL ? "text-foreground font-medium" : "text-foreground/85"
        }`}
        style={{ fontFamily: lang === "te" ? "'Noto Sans Telugu', sans-serif" : undefined }}
      >
        {verse.text}
      </p>
    </div>
  );
}

function VerseList({
  verses, highlighted, onHighlight, lang,
}: {
  verses: Verse[];
  highlighted: number | null;
  onHighlight: (v: number | null) => void;
  lang: "en" | "te";
}) {
  return (
    <div className="space-y-0.5">
      {verses.map((v) => (
        <VerseRow key={v.verse} verse={v} highlighted={highlighted} onHighlight={onHighlight} lang={lang} />
      ))}
    </div>
  );
}

// ─── Ask Staff Modal ───────────────────────────────────────────────────────────
function AskModal({
  open, onClose, defaultVerse,
}: {
  open: boolean;
  onClose: () => void;
  defaultVerse: string;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", question: "", verse: defaultVerse });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, verse: defaultVerse }));
  }, [open, defaultVerse]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch(`${BASE}/api/bible/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => setSent(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.question.trim()) return;
    mutation.mutate(form);
  }

  function handleClose() {
    setSent(false);
    setForm({ name: "", email: "", question: "", verse: defaultVerse });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md mx-auto bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle size={17} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-[15px] leading-tight">{t("askStaff")}</p>
              <p className="text-muted-foreground text-[11px]">We'll reply as soon as possible</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">{t("questionSent")}</p>
                <p className="text-muted-foreground text-sm mt-1">{t("questionSentDesc")}</p>
                <p className="text-muted-foreground/70 text-xs mt-2">Enable notifications to be alerted when your question is answered.</p>
              </div>
              <Button onClick={handleClose} variant="outline" className="border-border">
                Close
              </Button>
              <button onClick={() => setSent(false)} className="text-primary text-sm font-medium">
                {t("askAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("yourName")}</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Ravi Kumar"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("emailOpt")}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("verseRefPlaceholder")}</label>
                <input
                  value={form.verse}
                  onChange={(e) => setForm((f) => ({ ...f, verse: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. John 3:16"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("yourQuestion")}</label>
                <textarea
                  required
                  rows={4}
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="Type your Bible question here…"
                />
              </div>
              {mutation.isError && (
                <p className="text-red-500 text-sm">Failed to send. Please try again.</p>
              )}
              <Button
                type="submit"
                disabled={mutation.isPending || !form.name.trim() || !form.question.trim()}
                className="bg-primary text-white hover:bg-primary/90 h-12 text-base font-semibold fire-glow"
              >
                {mutation.isPending
                  ? <><Loader2 size={16} className="animate-spin mr-2" />{t("sending")}</>
                  : <><Send size={16} className="mr-2" />{t("send")}</>
                }
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BiblePage() {
  const { t } = useLanguage();
  const [selectedBook, setSelectedBook] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchLang, setSearchLang] = useState<"en" | "te">("en");
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data queries ─────────────────────────────────────────────────────────────
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["bible-books"],
    queryFn: () => apiFetch("/api/bible/books"),
    staleTime: Infinity,
  });

  const currentBook = books.find((b) => b.id === selectedBook);

  const { data: enVerses, isLoading: enLoading } = useQuery<Verse[]>({
    queryKey: ["bible-chapter", "en", selectedBook, selectedChapter],
    queryFn: () => apiFetch(`/api/bible/chapter?lang=en&book=${selectedBook}&chapter=${selectedChapter}`),
    staleTime: 10 * 60 * 1000,
    enabled: viewMode !== "te",
  });

  const { data: teVerses, isLoading: teLoading } = useQuery<Verse[]>({
    queryKey: ["bible-chapter", "te", selectedBook, selectedChapter],
    queryFn: () => apiFetch(`/api/bible/chapter?lang=te&book=${selectedBook}&chapter=${selectedChapter}`),
    staleTime: 10 * 60 * 1000,
    enabled: viewMode !== "en",
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchResult[]>({
    queryKey: ["bible-search", searchLang, debouncedQuery],
    queryFn: () =>
      apiFetch(`/api/bible/search?lang=${searchLang}&q=${encodeURIComponent(debouncedQuery)}`),
    staleTime: 60_000,
    enabled: debouncedQuery.length >= 2,
  });

  // ── Debounce search ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goToChapter = useCallback((book: number, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setHighlighted(null);
    setBookPickerOpen(false);
    setChapterPickerOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const prevChapter = () => {
    if (selectedChapter > 1) goToChapter(selectedBook, selectedChapter - 1);
    else if (selectedBook > 1) {
      const prev = books.find((b) => b.id === selectedBook - 1);
      if (prev) goToChapter(prev.id, prev.chapters);
    }
  };

  const nextChapter = () => {
    if (currentBook && selectedChapter < currentBook.chapters) goToChapter(selectedBook, selectedChapter + 1);
    else if (selectedBook < 66) goToChapter(selectedBook + 1, 1);
  };

  const handleHighlight = useCallback((v: number | null) => {
    setHighlighted(v);
    setCopied(false);
  }, []);

  // ── Highlighted verse reference ───────────────────────────────────────────────
  const verseRef = highlighted ? `${currentBook?.name || ""} ${selectedChapter}:${highlighted}` : "";

  const highlightedText = (() => {
    if (!highlighted) return "";
    const enV = enVerses?.find((v) => v.verse === highlighted)?.text ?? "";
    const teV = teVerses?.find((v) => v.verse === highlighted)?.text ?? "";
    const parts = [enV && `${verseRef} — ${enV}`, teV && teV].filter(Boolean);
    return parts.join("\n");
  })();

  function copyVerse() {
    if (!highlightedText) return;
    navigator.clipboard.writeText(highlightedText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── OT/NT ─────────────────────────────────────────────────────────────────────
  const OT = books.filter((b) => b.id <= 39);
  const NT = books.filter((b) => b.id >= 40);
  const chapterNumbers = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];

  const isLoading = (viewMode !== "te" && enLoading) || (viewMode !== "en" && teLoading);

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-0">

        {/* ── Sticky header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-background border-b border-border">
          {/* Book / Chapter / Actions row */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Book picker */}
            <div className="relative flex-1">
              <button
                onClick={() => { setBookPickerOpen(!bookPickerOpen); setChapterPickerOpen(false); }}
                className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold text-foreground transition-colors"
              >
                <BookOpen size={14} className="text-primary shrink-0" />
                <span className="truncate flex-1 text-left">{currentBook?.name || "Genesis"}</span>
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Chapter nav */}
            <div className="flex items-center gap-1">
              <button onClick={prevChapter} disabled={selectedBook === 1 && selectedChapter === 1}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => { setChapterPickerOpen(!chapterPickerOpen); setBookPickerOpen(false); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold transition-colors min-w-[52px] justify-center"
              >
                {selectedChapter}<ChevronDown size={12} className="text-muted-foreground" />
              </button>
              <button onClick={nextChapter} disabled={selectedBook === 66 && selectedChapter === (currentBook?.chapters ?? 1)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-xl transition-colors ${searchOpen ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"}`}>
              <Search size={16} />
            </button>

            {/* Ask button (header) */}
            <button
              onClick={() => setAskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              <MessageSquarePlus size={14} />
              <span className="hidden sm:inline">{t("askStaff")}</span>
              <span className="sm:hidden">Ask</span>
            </button>
          </div>

          {/* View mode tabs + reference */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1.5">
              {(["split", "en", "te"] as ViewMode[]).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === mode ? "bg-primary text-white shadow-sm" : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "split" && <Languages size={12} />}
                  {mode === "split" ? t("splitView") : mode === "en" ? t("englishOnly") : t("teluguOnly")}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground/60 font-medium">
              {currentBook?.name} {selectedChapter}
            </span>
          </div>
        </div>

        {/* ── Book picker dropdown ───────────────────────────────────────────── */}
        {bookPickerOpen && (
          <div className="absolute inset-x-0 top-[105px] z-40 bg-background border-b border-border shadow-xl max-h-[65vh] overflow-y-auto">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("oldTestament")}</p>
            </div>
            <div className="grid grid-cols-4 gap-0.5 px-3 pb-2">
              {OT.map((b) => (
                <button key={b.id} onClick={() => goToChapter(b.id, 1)}
                  className={`flex flex-col items-start px-2 py-2 rounded-xl text-left transition-colors ${
                    selectedBook === b.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="text-[12px] font-semibold leading-tight truncate w-full">{b.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight truncate w-full">{b.teluguName}</span>
                </button>
              ))}
            </div>
            <div className="px-4 pt-2 pb-1 border-t border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("newTestament")}</p>
            </div>
            <div className="grid grid-cols-4 gap-0.5 px-3 pb-3">
              {NT.map((b) => (
                <button key={b.id} onClick={() => goToChapter(b.id, 1)}
                  className={`flex flex-col items-start px-2 py-2 rounded-xl text-left transition-colors ${
                    selectedBook === b.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="text-[12px] font-semibold leading-tight truncate w-full">{b.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight truncate w-full">{b.teluguName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chapter picker dropdown ────────────────────────────────────────── */}
        {chapterPickerOpen && (
          <div className="absolute inset-x-0 top-[105px] z-40 bg-background border-b border-border shadow-xl max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-6 gap-1.5 p-4">
              {chapterNumbers.map((ch) => (
                <button key={ch} onClick={() => goToChapter(selectedBook, ch)}
                  className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                    selectedChapter === ch ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Search overlay ─────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="border-b border-border px-3 py-3 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchBible")}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1">
                {(["en", "te"] as const).map((l) => (
                  <button key={l} onClick={() => setSearchLang(l)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      searchLang === l ? "bg-primary text-white" : "text-muted-foreground"
                    }`}
                  >
                    {l === "en" ? "EN" : "TE"}
                  </button>
                ))}
              </div>
            </div>
            {searchLoading && <p className="text-center text-sm text-muted-foreground py-2">Searching…</p>}
            {searchResults && searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchResults.map((r, i) => {
                  const bk = books.find((b) => b.id === r.book);
                  return (
                    <button key={i} onClick={() => { goToChapter(r.book, r.chapter); setHighlighted(r.verse); setSearchOpen(false); }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-background transition-colors">
                      <p className="text-[11px] font-bold text-primary mb-0.5">
                        {bk?.name} {r.chapter}:{r.verse}
                      </p>
                      <p className="text-sm text-foreground/80 leading-snug line-clamp-2">{r.text}</p>
                    </button>
                  );
                })}
              </div>
            )}
            {searchResults?.length === 0 && debouncedQuery.length >= 2 && !searchLoading && (
              <p className="text-center text-sm text-muted-foreground py-2">No results found</p>
            )}
          </div>
        )}

        {/* ── Highlighted verse action bar ───────────────────────────────────── */}
        {highlighted && (
          <div className="border-b border-border bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary">{verseRef}</p>
            </div>
            <button
              onClick={copyVerse}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              {copied ? "Copied!" : t("copy")}
            </button>
            <button
              onClick={() => setAskModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <MessageSquarePlus size={13} />
              {t("askAboutVerse")}
            </button>
            <button onClick={() => setHighlighted(null)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Main content area ─────────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Chapter heading */}
              <div className="px-4 pt-5 pb-2">
                <h1 className="text-2xl font-black text-foreground leading-tight">
                  {currentBook?.name}
                </h1>
                {currentBook?.teluguName && (
                  <p className="text-muted-foreground text-sm mt-0.5" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>
                    {currentBook.teluguName}
                  </p>
                )}
                <p className="text-primary text-xs font-bold tracking-widest uppercase mt-1">
                  {t("chapter")} {selectedChapter}
                </p>
              </div>

              {/* Bible content */}
              {viewMode === "split" ? (
                <div className="grid grid-cols-2 divide-x divide-border px-2 pt-2 pb-4 gap-0">
                  <div className="pr-2 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">KJV English</p>
                    {enVerses && (
                      <VerseList verses={enVerses} highlighted={highlighted} onHighlight={handleHighlight} lang="en" />
                    )}
                  </div>
                  <div className="pl-2 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">తెలుగు</p>
                    {teVerses && (
                      <VerseList verses={teVerses} highlighted={highlighted} onHighlight={handleHighlight} lang="te" />
                    )}
                  </div>
                </div>
              ) : viewMode === "en" ? (
                <div className="px-2 pt-2 pb-4">
                  {enVerses && <VerseList verses={enVerses} highlighted={highlighted} onHighlight={handleHighlight} lang="en" />}
                </div>
              ) : (
                <div className="px-2 pt-2 pb-4">
                  {teVerses && <VerseList verses={teVerses} highlighted={highlighted} onHighlight={handleHighlight} lang="te" />}
                </div>
              )}

              {/* Chapter navigation footer */}
              <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <button onClick={prevChapter} disabled={selectedBook === 1 && selectedChapter === 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-semibold text-foreground transition-colors disabled:opacity-30">
                  <ChevronLeft size={16} /> {t("prevChapter")}
                </button>
                <button onClick={nextChapter} disabled={selectedBook === 66 && selectedChapter === (currentBook?.chapters ?? 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-semibold text-foreground transition-colors disabled:opacity-30">
                  {t("nextChapter")} <ChevronRight size={16} />
                </button>
              </div>

              {/* ── Prominent Ask Staff bottom banner ──────────────────────── */}
              <div className="mx-4 mb-6 rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-orange-50 dark:from-primary/10 dark:to-transparent">
                <div className="px-5 py-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-[15px] leading-tight">{t("askStaff")}</p>
                      <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                        Have a question about a verse or passage? Our team is here to help you understand God's Word.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setAskModalOpen(true)}
                    className="w-full bg-primary text-white hover:bg-primary/90 h-11 font-semibold fire-glow"
                  >
                    <MessageSquarePlus size={17} className="mr-2" />
                    {t("askQuestion")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Ask Staff Modal ──────────────────────────────────────────────────── */}
      <AskModal
        open={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        defaultVerse={verseRef}
      />
    </AppShell>
  );
}
