import { useEffect } from "react";

// Module-level on purpose: the lock is a property of the document, not of any
// one modal, so overlapping modals have to share a single counter.
let lockCount = 0;
let restoreTo = "";

/**
 * Locks body scroll while `active`, counting overlapping locks.
 *
 * Two modals can be up at once — the Rules panel layers over the Write dialog —
 * and letting each keep its own `previousOverflow` corrupts the pair. React
 * runs every cleanup before every effect, so on closing the upper one the lower
 * one re-captures a `previousOverflow` of "hidden" and the page stays locked
 * for good once both are gone. Counting means the first lock records the real
 * value and only the last release restores it.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return undefined;

    if (lockCount === 0) {
      restoreTo = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = restoreTo;
    };
  }, [active]);
}
