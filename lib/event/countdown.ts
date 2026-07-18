/**
 * Pure countdown domain logic for the SAA 2025 event.
 *
 * Deliberately framework-free and side-effect-free: every function takes its
 * inputs explicitly (including `now`) so it is trivially unit-testable and
 * carries no hidden `Date.now()` calls.
 */

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Countdown breakdown, in whole days / hours (0-23) / minutes (0-59). */
export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  isBeforeEvent: boolean;
}

/**
 * Compute the remaining time between `now` and `target`.
 *
 * - `target === null` → treated as "passed" (event has no configured date).
 * - `now >= target` → treated as "passed" (event already started/ended).
 * - Otherwise → whole days/hours/minutes remaining, `isBeforeEvent: true`.
 *
 * Uses the absolute epoch millisecond difference — never reconstructs local
 * wall-clock components — so timezone offsets baked into the ISO strings are
 * respected without drift.
 */
export function computeCountdown(target: Date | null, now: Date): Countdown {
  if (target === null || now.getTime() >= target.getTime()) {
    return { days: 0, hours: 0, minutes: 0, isBeforeEvent: false };
  }

  const diffMs = target.getTime() - now.getTime();

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutes = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);

  return { days, hours, minutes, isBeforeEvent: true };
}

/** Zero-pad a non-negative integer to at least 2 digits (e.g. `5` → `"05"`). */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
