import { useQuery } from "@tanstack/react-query";

export interface BibleBook {
  id: number;
  name: string;
  teluguName: string;
  chapters: number;
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface SearchResult {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface CombinedVerse {
  verse: number;
  telugu: string;
  english: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 1,  name: "Genesis",          teluguName: "ఆదికాండము",              chapters: 50 },
  { id: 2,  name: "Exodus",           teluguName: "నిర్గమకాండము",           chapters: 40 },
  { id: 3,  name: "Leviticus",        teluguName: "లేవీయకాండము",            chapters: 27 },
  { id: 4,  name: "Numbers",          teluguName: "సంఖ్యాకాండము",           chapters: 36 },
  { id: 5,  name: "Deuteronomy",      teluguName: "ద్వితీయోపదేశకాండము",    chapters: 34 },
  { id: 6,  name: "Joshua",           teluguName: "యెహోషువ",                chapters: 24 },
  { id: 7,  name: "Judges",           teluguName: "న్యాయాధిపతులు",          chapters: 21 },
  { id: 8,  name: "Ruth",             teluguName: "రూతు",                    chapters: 4  },
  { id: 9,  name: "1 Samuel",         teluguName: "1 సమూయేలు",              chapters: 31 },
  { id: 10, name: "2 Samuel",         teluguName: "2 సమూయేలు",              chapters: 24 },
  { id: 11, name: "1 Kings",          teluguName: "1 రాజులు",               chapters: 22 },
  { id: 12, name: "2 Kings",          teluguName: "2 రాజులు",               chapters: 25 },
  { id: 13, name: "1 Chronicles",     teluguName: "1 దినవృత్తాంతములు",     chapters: 29 },
  { id: 14, name: "2 Chronicles",     teluguName: "2 దినవృత్తాంతములు",     chapters: 36 },
  { id: 15, name: "Ezra",             teluguName: "ఎజ్రా",                   chapters: 10 },
  { id: 16, name: "Nehemiah",         teluguName: "నెహెమ్యా",                chapters: 13 },
  { id: 17, name: "Esther",           teluguName: "ఎస్తేరు",                 chapters: 10 },
  { id: 18, name: "Job",              teluguName: "యోబు",                    chapters: 42 },
  { id: 19, name: "Psalms",           teluguName: "కీర్తనలు",               chapters: 150 },
  { id: 20, name: "Proverbs",         teluguName: "సామెతలు",                chapters: 31 },
  { id: 21, name: "Ecclesiastes",     teluguName: "ప్రసంగి",                chapters: 12 },
  { id: 22, name: "Song of Solomon",  teluguName: "పరమగీతము",               chapters: 8  },
  { id: 23, name: "Isaiah",           teluguName: "యెషయా",                   chapters: 66 },
  { id: 24, name: "Jeremiah",         teluguName: "యిర్మీయా",               chapters: 52 },
  { id: 25, name: "Lamentations",     teluguName: "విలాపవాక్యములు",         chapters: 5  },
  { id: 26, name: "Ezekiel",          teluguName: "యెహెజ్కేలు",             chapters: 48 },
  { id: 27, name: "Daniel",           teluguName: "దానియేలు",               chapters: 12 },
  { id: 28, name: "Hosea",            teluguName: "హోషేయ",                   chapters: 14 },
  { id: 29, name: "Joel",             teluguName: "యోవేలు",                  chapters: 3  },
  { id: 30, name: "Amos",             teluguName: "ఆమోసు",                   chapters: 9  },
  { id: 31, name: "Obadiah",          teluguName: "ఓబద్యా",                  chapters: 1  },
  { id: 32, name: "Jonah",            teluguName: "యోనా",                    chapters: 4  },
  { id: 33, name: "Micah",            teluguName: "మీకా",                    chapters: 7  },
  { id: 34, name: "Nahum",            teluguName: "నహూమ్",                   chapters: 3  },
  { id: 35, name: "Habakkuk",         teluguName: "హబక్కూకు",                chapters: 3  },
  { id: 36, name: "Zephaniah",        teluguName: "జెఫన్యా",                 chapters: 3  },
  { id: 37, name: "Haggai",           teluguName: "హగ్గయి",                  chapters: 2  },
  { id: 38, name: "Zechariah",        teluguName: "జెకర్యా",                 chapters: 14 },
  { id: 39, name: "Malachi",          teluguName: "మలాకీ",                   chapters: 4  },
  { id: 40, name: "Matthew",          teluguName: "మత్తయి",                  chapters: 28 },
  { id: 41, name: "Mark",             teluguName: "మార్కు",                  chapters: 16 },
  { id: 42, name: "Luke",             teluguName: "లూకా",                    chapters: 24 },
  { id: 43, name: "John",             teluguName: "యోహాను",                  chapters: 21 },
  { id: 44, name: "Acts",             teluguName: "అపొస్తలుల కార్యములు",     chapters: 28 },
  { id: 45, name: "Romans",           teluguName: "రోమీయులకు",              chapters: 16 },
  { id: 46, name: "1 Corinthians",    teluguName: "1 కొరింథీయులకు",         chapters: 16 },
  { id: 47, name: "2 Corinthians",    teluguName: "2 కొరింథీయులకు",         chapters: 13 },
  { id: 48, name: "Galatians",        teluguName: "గలతీయులకు",              chapters: 6  },
  { id: 49, name: "Ephesians",        teluguName: "ఎఫెసీయులకు",             chapters: 6  },
  { id: 50, name: "Philippians",      teluguName: "ఫిలిప్పీయులకు",          chapters: 4  },
  { id: 51, name: "Colossians",       teluguName: "కొలొస్సయులకు",           chapters: 4  },
  { id: 52, name: "1 Thessalonians",  teluguName: "1 థెస్సలొనీకయులకు",      chapters: 5  },
  { id: 53, name: "2 Thessalonians",  teluguName: "2 థెస్సలొనీకయులకు",      chapters: 3  },
  { id: 54, name: "1 Timothy",        teluguName: "1 తిమోతికి",             chapters: 6  },
  { id: 55, name: "2 Timothy",        teluguName: "2 తిమోతికి",             chapters: 4  },
  { id: 56, name: "Titus",            teluguName: "తీతుకు",                  chapters: 3  },
  { id: 57, name: "Philemon",         teluguName: "ఫిలేమోనుకు",             chapters: 1  },
  { id: 58, name: "Hebrews",          teluguName: "హెబ్రీయులకు",            chapters: 13 },
  { id: 59, name: "James",            teluguName: "యాకోబు",                  chapters: 5  },
  { id: 60, name: "1 Peter",          teluguName: "1 పేతురు",               chapters: 5  },
  { id: 61, name: "2 Peter",          teluguName: "2 పేతురు",               chapters: 3  },
  { id: 62, name: "1 John",           teluguName: "1 యోహాను",               chapters: 5  },
  { id: 63, name: "2 John",           teluguName: "2 యోహాను",               chapters: 1  },
  { id: 64, name: "3 John",           teluguName: "3 యోహాను",               chapters: 1  },
  { id: 65, name: "Jude",             teluguName: "యూదా",                    chapters: 1  },
  { id: 66, name: "Revelation",       teluguName: "ప్రకటన",                  chapters: 22 },
];

type TeluguVerse = { Verseid: string; Verse: string };
type TeluguChapter = { Verse: TeluguVerse[] };
type TeluguBook = { Chapter: TeluguChapter[] };
type TeluguBible = { Book: TeluguBook[] };

let teluguCache: TeluguBible | null = null;
let teluguPromise: Promise<TeluguBible> | null = null;

function fetchWithTimeout(uri: string, ms: number): Promise<Response> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms);
  return fetch(uri, { signal: ac.signal }).finally(() => clearTimeout(id));
}

function stripTags(text: string): string {
  return text
    .replace(/<S>\d+<\/S>/g, "")
    .replace(/<sup>[^<]*<\/sup>/gi, "")
    .replace(/<\/?mark>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function getTeluguBible(): Promise<TeluguBible> {
  if (teluguCache) return teluguCache;
  if (teluguPromise) return teluguPromise;

  teluguPromise = fetchWithTimeout(
    "https://raw.githubusercontent.com/godlytalias/Bible-Database/master/Telugu/bible.json",
    30000
  )
    .then(async (r) => {
      if (!r.ok) throw new Error(`Failed to fetch Telugu Bible: ${r.status}`);
      const data = (await r.json()) as TeluguBible;
      teluguCache = data;
      teluguPromise = null;
      return data;
    })
    .catch((err) => {
      teluguPromise = null;
      throw err;
    });

  return teluguPromise;
}

async function fetchEnglishChapter(book: number, chapter: number): Promise<BibleVerse[]> {
  const res = await fetchWithTimeout(
    `https://bolls.life/get-chapter/KJV/${book}/${chapter}/`,
    10000
  );
  const data = (await res.json()) as Array<{ verse: number; text: string }>;
  return data.map((v) => ({ verse: v.verse, text: stripTags(v.text) }));
}

async function fetchTeluguChapter(book: number, chapter: number): Promise<BibleVerse[]> {
  const bible = await getTeluguBible();
  const bookData = bible.Book[book - 1];
  const chapterData = bookData?.Chapter[chapter - 1];
  if (!chapterData) return [];
  return chapterData.Verse.map((v, i) => ({ verse: i + 1, text: stripTags(v.Verse) }));
}

export function useBibleBooks() {
  return useQuery({
    queryKey: ["bible", "books-v2"],
    queryFn: () => BIBLE_BOOKS,
    staleTime: Infinity,
  });
}

export function useBibleChapter(book: number | null, chapter: number | null) {
  return useQuery({
    queryKey: ["bible", "chapter-v2", book, chapter],
    queryFn: async () => {
      if (!book || !chapter) return null;
      const [te, en] = await Promise.all([
        fetchTeluguChapter(book, chapter),
        fetchEnglishChapter(book, chapter),
      ]);
      const maxLen = Math.max(te.length, en.length);
      return Array.from({ length: maxLen }, (_, i) => ({
        verse: i + 1,
        telugu: te[i]?.text ?? "",
        english: en[i]?.text ?? "",
      }));
    },
    enabled: !!book && !!chapter,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useBibleSearch(query: string) {
  return useQuery({
    queryKey: ["bible", "search-v2", query],
    queryFn: async () => {
      if (!query || query.length < 2) return null;

      const [teResults, enResults] = await Promise.all([
        (async () => {
          try {
            const bible = await getTeluguBible();
            const results: SearchResult[] = [];
            const q = query.toLowerCase();
            outer: for (let b = 0; b < bible.Book.length; b++) {
              for (let c = 0; c < bible.Book[b].Chapter.length; c++) {
                for (let v = 0; v < bible.Book[b].Chapter[c].Verse.length; v++) {
                  const text = stripTags(bible.Book[b].Chapter[c].Verse[v].Verse);
                  if (text.toLowerCase().includes(q)) {
                    results.push({ book: b + 1, chapter: c + 1, verse: v + 1, text });
                    if (results.length >= 30) break outer;
                  }
                }
              }
            }
            return results;
          } catch {
            return [] as SearchResult[];
          }
        })(),
        (async () => {
          try {
            const res = await fetchWithTimeout(
              `https://bolls.life/search/KJV/?search=${encodeURIComponent(query)}&back=30`,
              10000
            );
            const data = (await res.json()) as SearchResult[];
            return data.map((v) => ({ ...v, text: stripTags(v.text) }));
          } catch {
            return [] as SearchResult[];
          }
        })(),
      ]);

      return { telugu: teResults, english: enResults };
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
