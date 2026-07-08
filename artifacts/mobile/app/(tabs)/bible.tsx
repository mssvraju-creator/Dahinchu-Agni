import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useBibleBooks, useBibleChapter, useBibleSearch } from "@/hooks/useBible";
import type { BibleBook } from "@/hooks/useBible";
import { QuestionModal } from "@/components/bible/QuestionModal";
import { useMyQuestions } from "@/hooks/useBibleQuestions";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ViewState = "books" | "chapters" | "reading";

type BibleBookWithReady = BibleBook & { ready?: boolean };

const TESTAMENT_BREAK = 39;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isWide = SCREEN_WIDTH >= 600;

const BOOKS_PER_ROW = isWide ? 4 : 3;
const CHAPTERS_PER_ROW = isWide ? 8 : 5;

function getBookName(book: BibleBook, lang: "te" | "en"): string {
  return lang === "te" ? book.teluguName : book.name;
}

export default function BibleScreen() {
  const colors = useColors();

  const [viewState, setViewState] = useState<ViewState>("books");
  const [selectedBook, setSelectedBook] = useState<BibleBookWithReady | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [answersModalVisible, setAnswersModalVisible] = useState(false);
  const { questions: myQuestions, loading: myQLoading, refresh: refreshMyQ } = useMyQuestions();

  const { data: books, isLoading: booksLoading, refetch: refetchBooks } = useBibleBooks();
  const { data: chapterVerses, isLoading: chapterLoading } = useBibleChapter(
    selectedBook?.id ?? null,
    selectedChapter,
  );
  const { data: searchResults, isLoading: searchLoading } = useBibleSearch(searchQuery.trim());

  const highlightedVerseText = useMemo(() => {
    if (!highlightedVerse || !chapterVerses) return "";
    const v = chapterVerses.find((cv) => cv.verse === highlightedVerse);
    if (!v) return "";
    return [v.telugu, v.english].filter(Boolean).join(" ");
  }, [highlightedVerse, chapterVerses]);

  const highlightedVerseRef = useMemo(() => {
    if (!highlightedVerse || !selectedBook) return "";
    return `${selectedBook.name} ${selectedChapter}:${highlightedVerse}`;
  }, [highlightedVerse, selectedBook, selectedChapter]);

  const testamentGroups = useMemo(() => {
    if (!books) return [];
    const ot = books.filter((b) => b.id <= TESTAMENT_BREAK);
    const nt = books.filter((b) => b.id > TESTAMENT_BREAK);
    return [
      { title: "Old Testament", telTitle: "పాత నిబంధన", books: ot },
      { title: "New Testament", telTitle: "కొత్త నిబంధన", books: nt },
    ];
  }, [books]);

  const goToBook = useCallback((book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setHighlightedVerse(null);
    setViewState("chapters");
    setSearchQuery("");
  }, []);

  const goToChapter = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setHighlightedVerse(null);
    setViewState("reading");
  }, []);

  const goBack = useCallback(() => {
    if (viewState === "reading") {
      setViewState("chapters");
      setSelectedChapter(null);
    } else if (viewState === "chapters") {
      setViewState("books");
      setSelectedBook(null);
    }
    setHighlightedVerse(null);
  }, [viewState]);

  const toggleHighlight = useCallback((verse: number) => {
    setHighlightedVerse((prev) => (prev === verse ? null : verse));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleSearchResult = useCallback(
    (bookId: number, chapter: number, verse: number) => {
      const book = books?.find((b) => b.id === bookId);
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(chapter);
        setHighlightedVerse(verse);
        setViewState("reading");
        setSearchQuery("");
      }
    },
    [books],
  );

  async function handleRefresh() {
    setRefreshing(true);
    await refetchBooks();
    setRefreshing(false);
  }

  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          {(viewState === "chapters" || viewState === "reading") && (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Bible</Text>
            {viewState === "reading" && selectedBook && selectedChapter && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                {getBookName(selectedBook, "te")} / {selectedBook.name} {selectedChapter}
              </Text>
            )}
            {viewState === "chapters" && selectedBook && (
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                {getBookName(selectedBook, "te")} / {selectedBook.name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => { setAnswersModalVisible(true); refreshMyQ(); }}
            style={styles.myQBtn}
          >
            <Feather name="message-circle" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder={
            viewState === "reading" && selectedBook && selectedChapter
              ? `Search in ${selectedBook.name} ${selectedChapter}...`
              : "Search Bible (Telugu / English)..."
          }
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          viewState === "books" ? (
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" />
          ) : undefined
        }
      >
        {/* Search results */}
        {searchQuery.trim().length >= 2 ? (
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            books={books ?? []}
            query={searchQuery}
            colors={colors}
            onSelectResult={handleSearchResult}
          />
        ) : viewState === "reading" && selectedBook && selectedChapter && chapterVerses ? (
          <ReaderView
            verses={chapterVerses}
            book={selectedBook}
            chapter={selectedChapter}
            highlightedVerse={highlightedVerse}
            loading={chapterLoading}
            colors={colors}
            onToggleVerse={toggleHighlight}
            onAskQuestion={() => setQuestionModalVisible(true)}
            hasHighlight={highlightedVerse !== null}
          />
        ) : viewState === "chapters" && selectedBook ? (
          <ChapterGrid
            book={selectedBook}
            colors={colors}
            onSelectChapter={goToChapter}
          />
        ) : (
          <BookList
            testamentGroups={testamentGroups}
            loading={booksLoading}
            colors={colors}
            onSelectBook={goToBook}
            searchQuery={searchQuery}
          />
        )}
      </ScrollView>

      {/* My Questions Modal */}
      <Modal visible={answersModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAnswersModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeaderInner, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>My Questions</Text>
            <TouchableOpacity onPress={() => setAnswersModalVisible(false)} style={styles.modalClose}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {myQLoading ? (
              <View style={styles.answersEmpty}>
                <ActivityIndicator size="large" color="#E84C1E" />
                <Text style={[styles.answersEmptyText, { color: colors.mutedForeground }]}>Loading...</Text>
              </View>
            ) : myQuestions.length === 0 ? (
              <View style={styles.answersEmpty}>
                <Feather name="message-circle" size={36} color={colors.mutedForeground} />
                <Text style={[styles.answersEmptyTitle, { color: colors.foreground }]}>No questions yet</Text>
                <Text style={[styles.answersEmptyText, { color: colors.mutedForeground }]}>
                  Tap a verse then "Ask a Question" to get started
                </Text>
              </View>
            ) : (
              myQuestions.map((q) => (
                <View key={q.id} style={[styles.answerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <View style={[styles.answerDot, { backgroundColor: q.answered ? "#059669" : "#E84C1E" }]} />
                    <Text style={[styles.answerStatus, { color: q.answered ? "#059669" : "#E84C1E" }]}>
                      {q.answered ? "Answered" : "Pending"}
                    </Text>
                  </View>
                  {q.verse ? (
                    <Text style={[styles.answerVerse, { color: "#E84C1E" }]}>{q.verse}</Text>
                  ) : null}
                  <Text style={[styles.answerQuestion, { color: colors.foreground }]}>{q.question}</Text>
                  {q.answered && q.answer ? (
                    <View style={[styles.answerReply, { backgroundColor: "#F0FDF4" }]}>
                      <Text style={styles.answerReplyLabel}>Answer</Text>
                      <Text style={styles.answerReplyText}>{q.answer}</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.answerDate, { color: colors.mutedForeground }]}>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      <QuestionModal
        visible={questionModalVisible}
        onClose={() => setQuestionModalVisible(false)}
        verseRef={highlightedVerseRef}
        verseText={highlightedVerseText}
        bookName={selectedBook?.name ?? ""}
        chapter={selectedChapter ?? 0}
      />
    </View>
  );
}

function BookList({
  testamentGroups,
  loading,
  colors,
  onSelectBook,
  searchQuery,
}: {
  testamentGroups: { title: string; telTitle: string; books: BibleBook[] }[];
  loading: boolean;
  colors: any;
  onSelectBook: (book: BibleBook) => void;
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return testamentGroups;
    const q = searchQuery.toLowerCase();
    const filterBooks = (books: BibleBook[]) =>
      books.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.teluguName.includes(q) ||
          String(b.id).includes(q),
      );
    return testamentGroups
      .map((g) => ({ ...g, books: filterBooks(g.books) }))
      .filter((g) => g.books.length > 0);
  }, [testamentGroups, searchQuery]);

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#E84C1E" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading Bible books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      {filtered.map((group) => (
        <View key={group.title} style={{ marginBottom: 8 }}>
          <View style={styles.testamentHeader}>
            <Text style={[styles.testamentTitle, { color: colors.foreground }]}>{group.title}</Text>
            <Text style={[styles.testamentTelTitle, { color: colors.mutedForeground }]}>{group.telTitle}</Text>
          </View>
          <View style={styles.bookGrid}>
            {group.books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => onSelectBook(book)}
              >
                <Text style={[styles.bookNum, { color: colors.mutedForeground }]}>{book.id}</Text>
                <Text style={[styles.bookName, { color: colors.foreground }]} numberOfLines={1}>
                  {book.name}
                </Text>
                <Text style={[styles.bookTelName, { color: "#E84C1E" }]} numberOfLines={1}>
                  {book.teluguName}
                </Text>
                <Text style={[styles.bookChapters, { color: colors.mutedForeground }]}>
                  {book.chapters} chapters
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ChapterGrid({
  book,
  colors,
  onSelectChapter,
}: {
  book: BibleBook;
  colors: any;
  onSelectChapter: (chapter: number) => void;
}) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.chapterHeader}>
        <Text style={[styles.chapterHeaderTitle, { color: colors.foreground }]}>
          {book.name} — Select Chapter
        </Text>
        <Text style={[styles.chapterHeaderTel, { color: "#E84C1E" }]}>{book.teluguName}</Text>
      </View>
      <View style={styles.chapterGrid}>
        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch}
            style={[styles.chapterCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => onSelectChapter(ch)}
          >
            <Text style={[styles.chapterNum, { color: colors.foreground }]}>{ch}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ReaderView({
  verses,
  book,
  chapter,
  highlightedVerse,
  loading,
  colors,
  onToggleVerse,
  onAskQuestion,
  hasHighlight,
}: {
  verses: { verse: number; telugu: string; english: string }[];
  book: BibleBook;
  chapter: number;
  highlightedVerse: number | null;
  loading: boolean;
  colors: any;
  onToggleVerse: (verse: number) => void;
  onAskQuestion: () => void;
  hasHighlight: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#E84C1E" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading chapter...</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={[styles.chapterTitleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chapterTitleEn, { color: colors.foreground }]}>
          {book.name} {chapter}
        </Text>
        <Text style={[styles.chapterTitleTe, { color: "#E84C1E" }]}>
          {book.teluguName} {chapter}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.askBtn, { backgroundColor: "#E84C1E" }]}
        onPress={() => {
          if (!highlightedVerse) onToggleVerse(1);
          onAskQuestion();
        }}
        activeOpacity={0.8}
      >
        <Feather name="help-circle" size={14} color="#FFFFFF" />
        <Text style={styles.askBtnText}>
          {hasHighlight ? `Ask about verse ${highlightedVerse}` : "Ask a Question"}
        </Text>
      </TouchableOpacity>

      {verses.map((v) => {
        const isHighlighted = highlightedVerse === v.verse;
        return (
          <TouchableOpacity
            key={v.verse}
            style={[
              styles.verseBlock,
              !isHighlighted && { borderColor: "transparent" },
              isHighlighted && { borderLeftColor: "#E84C1E", borderLeftWidth: 3 },
            ]}
            activeOpacity={0.7}
            onPress={() => onToggleVerse(v.verse)}
          >
            <View style={styles.verseNumWrap}>
              <View style={[styles.verseNumDot, { backgroundColor: isHighlighted ? "#E84C1E" : colors.border }]}>
                <Text style={[styles.verseNumText, { color: isHighlighted ? "#FFFFFF" : colors.mutedForeground }]}>
                  {v.verse}
                </Text>
              </View>
            </View>
            <View style={styles.verseTextWrap}>
              <Text style={[styles.verseTelText, { color: colors.foreground }]}>{v.telugu}</Text>
              <Text style={[styles.verseEnText, { color: colors.foreground, opacity: 0.65 }]}>{v.english}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.askBtn, styles.askBtnBottom, { backgroundColor: "#E84C1E" }]}
        onPress={() => {
          if (!highlightedVerse && verses.length > 0) onToggleVerse(1);
          onAskQuestion();
        }}
        activeOpacity={0.8}
      >
        <Feather name="help-circle" size={14} color="#FFFFFF" />
        <Text style={styles.askBtnText}>
          {hasHighlight ? `Ask about verse ${highlightedVerse}` : "Ask a Question"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function SearchResults({
  results,
  loading,
  books,
  query,
  colors,
  onSelectResult,
}: {
  results: { telugu: any[]; english: any[] } | null | undefined;
  loading: boolean;
  books: BibleBook[];
  query: string;
  colors: any;
  onSelectResult: (bookId: number, chapter: number, verse: number) => void;
}) {
  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#E84C1E" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Searching...</Text>
      </View>
    );
  }

  const teResults = results?.telugu ?? [];
  const enResults = results?.english ?? [];
  const total = teResults.length + enResults.length;

  if (total === 0) {
    return (
      <View style={styles.centerLoading}>
        <Feather name="search" size={32} color={colors.mutedForeground} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          No results for "{query}"
        </Text>
      </View>
    );
  }

  function getBookRef(bookId: number, chapter: number, verse: number): string {
    const book = books.find((b) => b.id === bookId);
    if (!book) return `${bookId} ${chapter}:${verse}`;
    return `${book.name} ${chapter}:${verse}`;
  }

  function getTeluguBookRef(bookId: number, chapter: number, verse: number): string {
    const book = books.find((b) => b.id === bookId);
    if (!book) return `${bookId} ${chapter}:${verse}`;
    return `${book.teluguName} ${chapter}:${verse}`;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.searchCount, { color: colors.mutedForeground }]}>
        {total} result{total !== 1 ? "s" : ""} for "{query}"
      </Text>

      {enResults.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.searchLangTitle, { color: colors.foreground }]}>English (KJV)</Text>
          {enResults.map((r: any, i: number) => (
            <TouchableOpacity
              key={`en-${i}`}
              style={[styles.searchResultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => onSelectResult(r.book, r.chapter, r.verse)}
            >
              <Text style={[styles.searchResultText, { color: colors.foreground }]}>{r.text}</Text>
              <Text style={[styles.searchResultRef, { color: "#E84C1E" }]}>
                {getBookRef(r.book, r.chapter, r.verse)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {teResults.length > 0 && (
        <View>
          <Text style={[styles.searchLangTitle, { color: colors.foreground }]}>తెలుగు (Telugu)</Text>
          {teResults.map((r: any, i: number) => (
            <TouchableOpacity
              key={`te-${i}`}
              style={[styles.searchResultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => onSelectResult(r.book, r.chapter, r.verse)}
            >
              <Text style={[styles.searchResultText, { color: colors.foreground }]}>{r.text}</Text>
              <Text style={[styles.searchResultRef, { color: "#E84C1E" }]}>
                {getTeluguBookRef(r.book, r.chapter, r.verse)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "DMSerifDisplay_400Regular",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  centerLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  testamentHeader: {
    marginBottom: 10,
  },
  testamentTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  testamentTelTitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  bookCard: {
    width: `${100 / BOOKS_PER_ROW - 3}%` as any,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 3,
  },
  bookNum: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  bookName: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  bookTelName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  bookChapters: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  chapterHeader: {
    marginBottom: 14,
  },
  chapterHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  chapterHeaderTel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },

  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chapterCard: {
    width: `${100 / CHAPTERS_PER_ROW - 2.5}%` as any,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNum: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  chapterTitleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  chapterTitleEn: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  chapterTitleTe: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  verseBlock: {
    flexDirection: "row",
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  verseNumWrap: {
    width: 28,
    alignItems: "center",
    paddingTop: 2,
  },
  verseNumDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  verseNumText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  verseTextWrap: {
    flex: 1,
    marginLeft: 4,
  },
  verseTelText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  verseEnText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  askBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  askBtnBottom: {
    marginTop: 16,
    marginBottom: 24,
  },
  askBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  myQBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  modalContainer: {
    flex: 1,
  },
  modalHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  answersEmpty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  answersEmptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  answersEmptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  answerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  answerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  answerStatus: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answerVerse: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  answerQuestion: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  answerReply: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  answerReplyLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  answerReplyText: {
    fontSize: 13,
    color: "#166534",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  answerDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  searchCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  searchLangTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  searchResultCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  searchResultRef: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
});
