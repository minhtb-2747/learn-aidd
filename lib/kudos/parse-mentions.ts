/**
 * Extract `@name` mention *candidates* from plain kudos content.
 *
 * Pure and Supabase-free by design (phase-07 spec) so it stays trivially
 * testable-by-inspection — the actual "does this candidate match a real
 * Sunner" check happens in `app/actions/kudos.ts`, against
 * `profiles.full_name`.
 *
 * Limitation (documented, not "fixed"): Vietnamese full names are made of
 * multiple words ("Trần Bình Minh"), and a mention has no delimiter marking
 * where the name ends and the surrounding sentence begins. Rather than
 * guessing, this returns every word-count prefix (1 word, 2 words, ... up to
 * `MAX_MENTION_WORDS`) starting at each "@" as its own candidate — e.g.
 * "@Trần Bình Minh ơi" yields "Trần", "Trần Bình", and "Trần Bình Minh". The
 * caller does an exact (case-insensitive) match against real names, so
 * false-positive candidates that don't match anything are silently dropped;
 * this only produces false negatives for names longer than the cap.
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
