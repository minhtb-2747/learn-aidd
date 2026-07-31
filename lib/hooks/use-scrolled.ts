import { useEffect, useState } from "react";

/**
 * True once the window has scrolled past `threshold` pixels.
 *
 * Starts `false` to keep SSR and the first client render in agreement; the
 * mount effect then corrects it — a reload can restore a mid-page scroll
 * offset without ever firing a scroll event.
 */
export function useScrolled(threshold = 0): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    // Passive: read-only, must never block scrolling.
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}
