import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import {
  ChevronLeft, ChevronRight, Search, X, BookOpen,
  ChevronDown, Send, Loader2, Languages, MessageSquarePlus, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  );
}

function VerseList({
  verses, highlighted, onHighlight, lang,
}: {
  verses: Verse[];
  highlighted: number | null;
  onHighlight: (v: number) => void;
  lang: "en" | "te";
}) {
  return (
    <div
      className="space-y-0.5"
      style={{ fontFamily: lang === "te" ? "'Noto Sans Telugu', sans-serif" : undefined }}
    >
      {verses.map((v) => (
        <span
          key={v.verse}
          onClick={() => onHighlight(v.verse)}
          className={`inline cursor-pointer leading-8 transition-colors rounded px-0.5 ${
            highlighted === v.verse
              ? "bg-primary/15 text-primary"
              : "hover:bg-muted"
          }`}
        >
          <sup className="text-[10px] font-bold text-muted-foreground/70 mr-0.5 select-none">
            {v.verse}
          </sup>
          {v.text}{" "}
        </span>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BiblePage() {
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
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({ name: "", email: "", question: "", verse: "" });
  const [questionSent, setQuestionSent] = useState(false);
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

  // ── Question mutation ─────────────────────────────────────────────────────────
  const questionMutation = useMutation({
    mutationFn: async (data: typeof questionForm) => {
      const res = await fetch(`${BASE}/api/bible/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      setQuestionSent(true);
      setQuestionForm({ name: "", email: "", question: "", verse: "" });
    },
  });

  // ── Debounce search ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // ── Focus search input when opening ──────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  // ── Navigation helpers ────────────────────────────────────────────────────────
  const goToChapter = useCallback((book: number, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setHighlighted(null);
    setBookPickerOpen(false);
    setChapterPickerOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const prevChapter = () => {
    if (selectedChapter > 1) {
      goToChapter(selectedBook, selectedChapter - 1);
    } else if (selectedBook > 1) {
      const prev = books.find((b) => b.id === selectedBook - 1);
      if (prev) goToChapter(prev.id, prev.chapters);
    }
  };

  const nextChapter = () => {
    if (currentBook && selectedChapter < currentBook.chapters) {
      goToChapter(selectedBook, selectedChapter + 1);
    } else if (selectedBook < 66) {
      goToChapter(selectedBook + 1, 1);
    }
  };

  // ── Highlighted verse reference string ───────────────────────────────────────
  const verseRef = highlighted
    ? `${currentBook?.name || ""} ${selectedChapter}:${highlighted}`
    : "";

  // ── OT/NT boundary ────────────────────────────────────────────────────────────
  const OT = books.filter((b) => b.id <= 39);
  const NT = books.filter((b) => b.id >= 40);

  const chapterNumbers = currentBook
    ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1)
    : [];

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-0">

        {/* ── Sticky top nav ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-background border-b border-border">
          {/* Book / Chapter row */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            {/* Book picker */}
            <div className="relative flex-1">
              <button
                onClick={() => { setBookPickerOpen(!bookPickerOpen); setChapterPickerOpen(false); }}
                className="flex items-center gap-1.5 w-full px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold text-foreground transition-colors"
              >
                <BookOpen size={14} className="text-primary shrink-0" />
                <span className="truncate flex-1 text-left">
                  {currentBook?.name || "Genesis"}
                </span>
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Chapter nav */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevChapter}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30"
                disabled={selectedBook === 1 && selectedChapter === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => { setChapterPickerOpen(!chapterPickerOpen); setBookPickerOpen(false); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold transition-colors min-w-[52px] justify-center"
              >
                {selectedChapter}
                <ChevronDown size={12} className="text-muted-foreground" />
              </button>
              <button
                onClick={nextChapter}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30"
                disabled={selectedBook === 66 && selectedChapter === (currentBook?.chapters ?? 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Search + language toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-xl transition-colors ${searchOpen ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* View mode tabs */}
          <div className="flex items-center gap-1.5 px-3 pb-2.5">
            {(["split", "en", "te"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === mode
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "split" && <Languages size={12} />}
                {mode === "split" ? "Split" : mode === "en" ? "English" : "తెలుగు"}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground/60 font-medium">
              {currentBook?.name} {selectedChapter}
            </span>
          </div>

          {/* Book picker dropdown */}
          {bookPickerOpen && (
            <div className="absolute left-0 right-0 top-full z-50 bg-background border-b border-border shadow-lg max-h-72 overflow-y-auto">
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border">
                Old Testament
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 p-2">
                {OT.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => goToChapter(b.id, 1)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedBook === b.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-y border-border">
                New Testament
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 p-2">
                {NT.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => goToChapter(b.id, 1)}
                    className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedBook === b.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapter picker dropdown */}
          {chapterPickerOpen && (
            <div className="absolute left-0 right-0 top-full z-50 bg-background border-b border-border shadow-lg max-h-56 overflow-y-auto p-3">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {chapterNumbers.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => goToChapter(selectedBook, ch)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                      selectedChapter === ch
                        ? "bg-primary text-white"
                        : "bg-muted/60 hover:bg-muted text-foreground"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Search panel ───────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="border-b border-border bg-muted/30 px-3 py-3 space-y-3">
            {/* Search input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the Bible…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button onClick={() => setSearchOpen(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                <X size={16} />
              </button>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Search in:</span>
              {(["en", "te"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSearchLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    searchLang === lang ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "en" ? "English" : "తెలుగు"}
                </button>
              ))}
            </div>

            {/* Results */}
            {debouncedQuery.length >= 2 && (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {searchLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                ) : !searchResults || searchResults.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No results found</p>
                ) : (
                  searchResults.map((r, i) => {
                    const bookName = searchLang === "te"
                      ? (books.find((b) => b.id === r.book)?.teluguName ?? `Book ${r.book}`)
                      : (books.find((b) => b.id === r.book)?.name ?? `Book ${r.book}`);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          goToChapter(r.book, r.chapter);
                          setHighlighted(r.verse);
                          setSearchOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl bg-background hover:bg-primary/5 border border-border/60 transition-colors"
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-primary text-xs font-bold">{bookName} {r.chapter}:{r.verse}</span>
                        </div>
                        <p
                          className="text-foreground/80 text-xs leading-relaxed line-clamp-2"
                          style={{ fontFamily: searchLang === "te" ? "'Noto Sans Telugu', sans-serif" : undefined }}
                        >
                          {r.text}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Bible content ──────────────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {/* Chapter heading */}
          <div className="px-4 pt-5 pb-3">
            <h1 className="text-foreground text-xl font-black tracking-tight">
              {currentBook?.name}
            </h1>
            {currentBook?.teluguName && (
              <p
                className="text-muted-foreground text-sm mt-0.5"
                style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}
              >
                {currentBook.teluguName}
              </p>
            )}
            <p className="text-primary text-xs font-semibold mt-1 uppercase tracking-widest">
              Chapter {selectedChapter}
            </p>
          </div>

          {/* Verse content */}
          {viewMode === "split" ? (
            <div className="grid grid-cols-2 gap-0 border-t border-border divide-x divide-border mx-0">
              {/* English */}
              <div className="px-4 py-4">
                <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">
                  KJV English
                </div>
                {enLoading ? (
                  <Spinner />
                ) : (
                  <VerseList
                    verses={enVerses ?? []}
                    highlighted={highlighted}
                    onHighlight={setHighlighted}
                    lang="en"
                  />
                )}
              </div>
              {/* Telugu */}
              <div className="px-4 py-4">
                <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">
                  తెలుగు
                </div>
                {teLoading ? (
                  <Spinner />
                ) : (
                  <VerseList
                    verses={teVerses ?? []}
                    highlighted={highlighted}
                    onHighlight={setHighlighted}
                    lang="te"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-border">
              <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">
                {viewMode === "en" ? "KJV English" : "తెలుగు"}
              </div>
              {(viewMode === "en" ? enLoading : teLoading) ? (
                <Spinner />
              ) : (
                <VerseList
                  verses={(viewMode === "en" ? enVerses : teVerses) ?? []}
                  highlighted={highlighted}
                  onHighlight={setHighlighted}
                  lang={viewMode as "en" | "te"}
                />
              )}
            </div>
          )}

          {/* Highlighted verse copy hint */}
          {highlighted && (
            <div className="mx-4 my-3 p-3 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-primary text-xs font-bold">{verseRef}</p>
                <p className="text-foreground/70 text-xs mt-0.5 line-clamp-2">
                  {(viewMode !== "te" ? enVerses : teVerses)?.find((v) => v.verse === highlighted)?.text}
                </p>
              </div>
              <button
                onClick={() => {
                  const text = `${verseRef} — ${(viewMode !== "te" ? enVerses : teVerses)?.find((v) => v.verse === highlighted)?.text}`;
                  void navigator.clipboard.writeText(text);
                }}
                className="shrink-0 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Copy
              </button>
            </div>
          )}

          {/* Chapter navigation footer */}
          <div className="flex items-center gap-3 mx-4 my-4">
            <button
              onClick={prevChapter}
              disabled={selectedBook === 1 && selectedChapter === 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={nextChapter}
              disabled={selectedBook === 66 && selectedChapter === (currentBook?.chapters ?? 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-30"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* ── Ask a Question ──────────────────────────────────────────────── */}
          <div className="mx-4 mb-8">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => { setShowQuestionForm(!showQuestionForm); setQuestionSent(false); }}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquarePlus size={18} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground font-bold text-sm">Ask Our Staff</p>
                    <p className="text-muted-foreground text-xs">Questions about any verse or passage</p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${showQuestionForm ? "rotate-180" : ""}`}
                />
              </button>

              {showQuestionForm && (
                <div className="px-4 pb-4 border-t border-border/60 space-y-3 pt-4">
                  {questionSent ? (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Check size={24} className="text-green-600" />
                      </div>
                      <p className="text-foreground font-bold text-sm">Question Sent!</p>
                      <p className="text-muted-foreground text-xs text-center">
                        Our staff will get back to you soon.
                      </p>
                      <button
                        onClick={() => setQuestionSent(false)}
                        className="mt-2 text-primary text-xs font-semibold"
                      >
                        Ask another question
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Your name *"
                          value={questionForm.name}
                          onChange={(e) => setQuestionForm((f) => ({ ...f, name: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          placeholder="Email (optional)"
                          value={questionForm.email}
                          onChange={(e) => setQuestionForm((f) => ({ ...f, email: e.target.value }))}
                          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <input
                        placeholder="Verse reference (e.g. John 3:16)"
                        value={questionForm.verse || verseRef}
                        onChange={(e) => setQuestionForm((f) => ({ ...f, verse: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <textarea
                        placeholder="Your question *"
                        rows={3}
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm((f) => ({ ...f, question: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                      <Button
                        onClick={() =>
                          questionMutation.mutate({
                            ...questionForm,
                            verse: questionForm.verse || verseRef,
                          })
                        }
                        disabled={!questionForm.name.trim() || !questionForm.question.trim() || questionMutation.isPending}
                        className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90"
                      >
                        {questionMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                          <Send size={16} className="mr-2" />
                        )}
                        {questionMutation.isPending ? "Sending…" : "Send Question"}
                      </Button>
                      {questionMutation.isError && (
                        <p className="text-red-500 text-xs text-center">
                          Failed to send. Please try again.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
