/**
 * Extract `@name` mention CANDIDATES from kudos content. Pure and Supabase-free;
 * matching against real Sunners happens in `app/actions/kudos.ts`.
 *
 * A Vietnamese full name spans several words and a mention has no delimiter
 * marking where the name ends and the sentence resumes. Rather than guess, this
 * emits every word-count prefix up to `MAX_MENTION_WORDS` — "@Trần Bình Minh ơi"
 * yields "Trần", "Trần Bình", "Trần Bình Minh". The caller's exact match drops
 * the false positives; only names longer than the cap are missed.
 */

const MAX_MENTION_WORDS = 4;

// \p{L}/\p{M} (letter/mark) covers Vietnamese diacritics; requires the `u` flag.
const WORD = /[\p{L}\p{M}][\p{L}\p{M}\d]*/gu;
const MENTION_START = new RegExp(`@(${WORD.source}(?:\\s+${WORD.source}){0,${MAX_MENTION_WORDS - 1}})`, "gu");

export function extractMentionCandidates(text: string): string[] {
  const candidates = new Set<string>();

  for (const match of text.matchAll(MENTION_START)) {
    const words = match[1].trim().split(/\s+/).filter(Boolean);
    for (let wordCount = 1; wordCount <= words.length; wordCount += 1) {
      const candidate = words.slice(0, wordCount).join(" ");
      if (candidate) candidates.add(candidate);
    }
  }

  return Array.from(candidates);
}
