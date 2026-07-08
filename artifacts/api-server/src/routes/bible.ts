import { Router, Request as ExpressRequest, Response as ExpressResponse } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { broadcastNotification } from "./notifications.js";

const router = Router();

// ─── Book metadata (standard 66-book Protestant canon) ────────────────────────
export const BIBLE_BOOKS = [
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

// ─── Telugu Bible cache ────────────────────────────────────────────────────────
type TeluguVerse = { Verseid: string; Verse: string };
type TeluguChapter = { Verse: TeluguVerse[] };
type TeluguBook = { Chapter: TeluguChapter[] };
type TeluguBible = { Book: TeluguBook[] };

let teluguBibleCache: TeluguBible | null = null;
let teluguBiblePromise: Promise<TeluguBible> | null = null;

async function getTeluguBible(): Promise<TeluguBible> {
  if (teluguBibleCache) return teluguBibleCache;
  if (teluguBiblePromise) return teluguBiblePromise;

  teluguBiblePromise = fetch(
    "https://raw.githubusercontent.com/godlytalias/Bible-Database/master/Telugu/bible.json",
    { signal: AbortSignal.timeout(30_000) }
  )
    .then(async (r) => {
      if (!r.ok) throw new Error(`Failed to fetch Telugu Bible: ${r.status}`);
      const data = (await r.json()) as TeluguBible;
      teluguBibleCache = data;
      teluguBiblePromise = null;
      return data;
    })
    .catch((err) => {
      teluguBiblePromise = null;
      throw err;
    });

  return teluguBiblePromise;
}

function stripBollsTags(text: string): string {
  return text
    .replace(/<S>\d+<\/S>/g, "")
    .replace(/<sup>[^<]*<\/sup>/gi, "")
    .replace(/<\/?mark>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─── Questions storage ─────────────────────────────────────────────────────────
const QUESTIONS_FILE = join(process.cwd(), "bible_questions.json");

type BibleQuestion = {
  id: string;
  name: string;
  email: string;
  question: string;
  verse: string;
  verseText?: string;
  answered: boolean;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
};

function loadQuestions(): BibleQuestion[] {
  if (!existsSync(QUESTIONS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(QUESTIONS_FILE, "utf8")) as BibleQuestion[];
  } catch {
    return [];
  }
}

function saveQuestions(q: BibleQuestion[]) {
  writeFileSync(QUESTIONS_FILE, JSON.stringify(q, null, 2));
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /bible/books
router.get("/bible/books", (_req: ExpressRequest, res: ExpressResponse) => {
  res.json(BIBLE_BOOKS);
});

// GET /bible/chapter?lang=en|te&book=1&chapter=1
router.get("/bible/chapter", async (req: ExpressRequest, res: ExpressResponse) => {
  const book = Math.max(1, Math.min(66, parseInt(req.query.book as string) || 1));
  const bookMeta = BIBLE_BOOKS[book - 1];
  const chapter = Math.max(1, Math.min(bookMeta.chapters, parseInt(req.query.chapter as string) || 1));
  const lang = (req.query.lang as string) === "te" ? "te" : "en";

  try {
    if (lang === "te") {
      const bible = await getTeluguBible();
      const bookData = bible.Book[book - 1];
      const chapterData = bookData?.Chapter[chapter - 1];
      if (!chapterData) return res.status(404).json({ error: "Not found" });
      return res.json(
        chapterData.Verse.map((v, i) => ({ verse: i + 1, text: stripBollsTags(v.Verse) }))
      );
    } else {
      const resp = await fetch(
        `https://bolls.life/get-chapter/KJV/${book}/${chapter}/`,
        { signal: AbortSignal.timeout(10_000) }
      );
      const data = (await resp.json()) as Array<{ verse: number; text: string }>;
      return res.json(data.map((v) => ({ verse: v.verse, text: stripBollsTags(v.text) })));
    }
  } catch (err) {
    req.log?.error({ err }, "bible chapter fetch failed");
    return res.status(502).json({ error: "Failed to load Bible chapter" });
  }
});

// GET /bible/search?lang=en|te&q=love
router.get("/bible/search", async (req: ExpressRequest, res: ExpressResponse) => {
  const q = ((req.query.q as string) || "").trim();
  const lang = (req.query.lang as string) === "te" ? "te" : "en";

  if (!q || q.length < 2) return res.json([]);

  try {
    if (lang === "te") {
      const bible = await getTeluguBible();
      const results: Array<{ book: number; chapter: number; verse: number; text: string }> = [];
      outer: for (let b = 0; b < bible.Book.length; b++) {
        for (let c = 0; c < bible.Book[b].Chapter.length; c++) {
          for (let v = 0; v < bible.Book[b].Chapter[c].Verse.length; v++) {
            const text = stripBollsTags(bible.Book[b].Chapter[c].Verse[v].Verse);
            if (text.includes(q)) {
              results.push({ book: b + 1, chapter: c + 1, verse: v + 1, text });
              if (results.length >= 30) break outer;
            }
          }
        }
      }
      return res.json(results);
    } else {
      const resp = await fetch(
        `https://bolls.life/search/KJV/?search=${encodeURIComponent(q)}&back=30`,
        { signal: AbortSignal.timeout(10_000) }
      );
      const data = (await resp.json()) as Array<{
        book: number; chapter: number; verse: number; text: string;
      }>;
      return res.json(
        data.map((v) => ({
          book: v.book, chapter: v.chapter, verse: v.verse,
          text: stripBollsTags(v.text),
        }))
      );
    }
  } catch (err) {
    req.log?.error({ err }, "bible search failed");
    return res.status(502).json({ error: "Search failed" });
  }
});

// POST /bible/questions
router.post("/bible/questions", (req: ExpressRequest, res: ExpressResponse) => {
  const { name, email, question, verse, verseText } = req.body as Record<string, string>;
  if (!name?.trim() || !question?.trim()) {
    return res.status(400).json({ error: "Name and question are required" });
  }
  const questions = loadQuestions();
  const entry: BibleQuestion = {
    id: Date.now().toString(),
    name: name.trim(),
    email: (email || "").trim(),
    question: question.trim(),
    verse: (verse || "").trim(),
    verseText: (verseText || "").trim(),
    answered: false,
    createdAt: new Date().toISOString(),
  };
  questions.unshift(entry);
  saveQuestions(questions);
  req.log?.info({ id: entry.id, name: entry.name }, "bible question submitted");
  return res.json({ ok: true, id: entry.id });
});

// GET /bible/questions — admin
router.get("/bible/questions", (_req: ExpressRequest, res: ExpressResponse) => {
  res.json(loadQuestions());
});

// PATCH /bible/questions/:id — answer question (admin)
router.patch("/bible/questions/:id", async (req: ExpressRequest, res: ExpressResponse) => {
  const questions = loadQuestions();
  const idx = questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const answer = (req.body.answer as string | undefined)?.trim() || "";
  questions[idx] = {
    ...questions[idx],
    answered: true,
    answer,
    answeredAt: new Date().toISOString(),
  };
  saveQuestions(questions);

  // Send push notification to all subscribers
    const q = questions[idx];
    const verseRef = q.verse ? ` (${q.verse})` : "";
    await broadcastNotification({
      title: "Your Bible Question Was Answered!",
      body: `Staff replied to your question${verseRef}: "${q.question.slice(0, 80)}…"`,
      data: { type: "bible-answer", questionId: q.id },
    }).catch(() => {});

  return res.json({ ok: true });
});

export default router;
