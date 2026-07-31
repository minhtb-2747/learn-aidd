"use client";

import { useEffect, useRef, useState } from "react";
import { TargetIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

export interface AwardNavItem {
  slug: string;
  label: string;
}

export interface AwardNavProps {
  items: AwardNavItem[];
  navAriaLabel: string;
}

/**
 * Left-side category navigation for the award system list. Clicking an item
 * smooth-scrolls to its `#award-<slug>` section and marks it active; a
 * scroll-spy (IntersectionObserver) keeps the active item in sync while the
 * user scrolls the page directly. Only one item is ever active at a time.
 */
export default function AwardNav({ items, navAriaLabel }: AwardNavProps) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");
  // Suppresses the scroll-spy for a moment after a click so the observer
  // doesn't fight the just-set active item while the smooth scroll settles.
  const suppressSpyRef = useRef(false);
  // Pending "un-suppress" timer — a rapid second click cancels the first
  // click's timeout instead of letting it clear suppression mid-scroll.
  const suppressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(`award-${item.slug}`))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    // Running ratio of EVERY section. An IntersectionObserver batch only
    // carries the sections whose ratio just crossed a threshold, so choosing
    // the argmax over this accumulated map (not the batch alone) keeps the
    // correct item active when several sections overlap the viewport.
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        if (suppressSpyRef.current) return;
        const best = [...ratios.entries()]
          .filter(([, ratio]) => ratio > 0)
          .sort((a, b) => b[1] - a[1])[0];
        if (best) {
          setActiveSlug(best[0].replace(/^award-/, ""));
        }
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Clear any pending suppression timer on unmount.
  useEffect(
    () => () => {
      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current);
      }
    },
    [],
  );

  const handleClick =
    (slug: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById(`award-${slug}`);
      if (!target) return;
      event.preventDefault();
      suppressSpyRef.current = true;
      setActiveSlug(slug);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (suppressTimerRef.current !== null) {
        window.clearTimeout(suppressTimerRef.current);
      }
      suppressTimerRef.current = window.setTimeout(() => {
        suppressSpyRef.current = false;
        suppressTimerRef.current = null;
      }, 1000);
    };

  return (
    <nav
      aria-label={navAriaLabel}
      className="flex w-full flex-row flex-wrap gap-2 lg:sticky lg:top-28 lg:w-45 lg:shrink-0 lg:flex-col lg:flex-nowrap lg:gap-4"
    >
      {items.map((item) => {
        const isActive = item.slug === activeSlug;
        return (
          <a
            key={item.slug}
            href={`#award-${item.slug}`}
            onClick={handleClick(item.slug)}
            aria-current={isActive ? "location" : undefined}
            className={cn(
              "flex items-center gap-1 rounded px-4 py-4 text-sm leading-5 font-bold tracking-[0.25px] transition-colors duration-200",
              isActive
                ? "border-b border-gold text-gold [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_var(--color-gold-glow)]"
                : "text-white hover:bg-white/10",
            )}
          >
            <TargetIcon className="h-6 w-6 shrink-0" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
