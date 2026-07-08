import { useCallback, useEffect, useState } from "react";

const API_BASE = "";

export interface SubmittedQuestion {
  id: string;
  name: string;
  question: string;
  verse: string;
  answered: boolean;
  answer?: string;
  createdAt: string;
}

// In-memory store of submitted question IDs (persists during session)
let submittedIds: string[] = [];

export function useSubmitBibleQuestion() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  async function submit(params: {
    name: string;
    email: string;
    question: string;
    verse: string;
    verseText: string;
  }) {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setLastId(null);
    try {
      const res = await fetch(`${API_BASE}/api/bible/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setSuccess(true);
      setLastId(data.id);
      if (data.id) {
        submittedIds.push(data.id);
      }
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to submit question");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitting(false);
    setError(null);
    setSuccess(false);
    setLastId(null);
  }

  return { submit, submitting, error, success, lastId, reset };
}

export function useMyQuestions() {
  const [questions, setQuestions] = useState<SubmittedQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (submittedIds.length === 0) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bible/questions`);
      if (!res.ok) throw new Error("Failed");
      const all: any[] = await res.json();
      const mine = all
        .filter((q: any) => submittedIds.includes(q.id))
        .map((q: any) => ({
          id: q.id,
          name: q.name,
          question: q.question,
          verse: q.verse,
          answered: q.answered,
          answer: q.answer,
          createdAt: q.createdAt,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setQuestions(mine);
    } catch {
      // keep existing data on error
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, refresh: fetchQuestions };
}
