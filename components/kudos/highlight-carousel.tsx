"use client";

import { useRouter } from "next/navigation";
import type { HighlightKudos } from "@/lib/kudos/types";
import CarouselArrowButton from "./carousel-arrow-button";
import { useCarouselNav } from "./use-carousel-nav";
import HighlightFilterDropdown from "./highlight-filter-dropdown";
import KudosCard from "./kudos-card";

export interface HighlightCarouselProps {
  subtitle: string;
  title: string;
  hashtagLabel: string;
  departmentLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  /** Hearts one like is worth right now (active campaign multiplier, else 1). */
  heartMultiplier: number;
  viewDetailLabel: string;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
  /** Shown instead of the carousel when a filter matches nothing. */
  emptyLabel: string;
  kudos: HighlightKudos[];
  hashtagOptions: string[];
  departmentOptions: string[];
  activeHashtag?: string;
  activeDepartment?: string;
}

/**
 * "HIGHLIGHT KUDOS" section (MoMorph `B_Highlight`, node 2940:13451): filter
 * dropdowns above a 3-up peek carousel.
 *
 * Track is full-bleed: 528×525 cards on a 552px pitch, so three are in frame at
 * 1440 and the outer two bleed past the edges.
 *
 * Neighbours are NOT dimmed or scaled — what fades them is a pair of overlays
 * of the page background, solid for their inner half then eased out. That is
 * why a card looks swallowed by the background rather than uniformly greyed.
 *
 * Embla handles motion; `align: "center"` + `containScroll: false` is what
 * gives the symmetric peek (the default would snap the end slides flush).
 *
 * Filters are URL-driven (`?hashtag=&department=`) so the server re-queries the
 * top 5 and a reload preserves the selection.
 */
export default function HighlightCarousel({
  subtitle,
  title,
  hashtagLabel,
  departmentLabel,
  prevAriaLabel,
  nextAriaLabel,
  heartMultiplier,
  viewDetailLabel,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
  emptyLabel,
  kudos,
  hashtagOptions,
  departmentOptions,
  activeHashtag,
  activeDepartment,
}: HighlightCarouselProps) {
  const router = useRouter();
  const total = kudos.length;

  // Open on the second card once there are three, so both neighbours peek.
  const { viewportRef, selected, canPrev, canNext, scrollPrev, scrollNext } =
    useCarouselNav(total >= 3 ? 1 : 0);

  function updateFilter(key: "hashtag" | "department", value: string | null) {
    const params = new URLSearchParams();
    const nextHashtag = key === "hashtag" ? value : (activeHashtag ?? null);
    const nextDepartment = key === "department" ? value : (activeDepartment ?? null);
    if (nextHashtag) params.set("hashtag", nextHashtag);
    if (nextDepartment) params.set("department", nextDepartment);
    const query = params.toString();
    router.replace(`/kudos${query ? `?${query}` : ""}`, { scroll: false });
  }

  const cardProps = {
    heartMultiplier,
    viewDetailLabel,
    likeAriaLabel,
    unlikeAriaLabel,
    copyLinkLabel,
    toastMessage,
  };

  return (
    <section className="flex flex-col gap-10 py-8">
      {/* Only the heading follows the page gutter; the track is full-bleed. */}
      <div className="flex flex-col gap-4 px-6 sm:px-9 lg:px-36">
        <p className="text-2xl leading-8 font-bold text-white">{subtitle}</p>
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 className="text-4xl leading-16 font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <HighlightFilterDropdown
              label={hashtagLabel}
              options={hashtagOptions}
              active={activeHashtag ?? null}
              onSelect={(option) => updateFilter("hashtag", option)}
            />
            <HighlightFilterDropdown
              label={departmentLabel}
              options={departmentOptions}
              active={activeDepartment ?? null}
              onSelect={(option) => updateFilter("department", option)}
            />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <p className="px-6 py-16 text-center text-lg font-bold text-white/60">
          {emptyLabel}
        </p>
      ) : (
        <>
          <div className="relative">
            {/* Embla's viewport does the clipping that creates the peek. */}
            <div className="overflow-hidden" ref={viewportRef}>
              <div className="flex touch-pan-y">
                {kudos.map((item) => (
                  <div
                    key={item.id}
                    // 38.33% ≈ the 552px slide pitch at 1440; `px-3` takes 24px
                    // back as the gutter. The `max-w-138` cap holds that gutter
                    // past 1440 — without it the slide keeps growing while the
                    // card stays at its 528px max, leaving dead space.
                    className="flex max-w-138 min-w-0 shrink-0 grow-0 basis-[92%] justify-center px-3 sm:basis-[68%] lg:basis-[38.33%]"
                  >
                    <KudosCard kudos={item} {...cardProps} />
                  </div>
                ))}
              </div>
            </div>

            {/* Fading to `rgba(0,16,26,0)` rather than `transparent` matters —
                the keyword resolves to transparent *black* and would grey the
                midpoint on the way out. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[18%] lg:w-[27.8%]"
              style={{
                background:
                  "linear-gradient(to right, #00101A 0%, #00101A 50%, rgba(0,16,26,0) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-[18%] lg:w-[27.8%]"
              style={{
                background:
                  "linear-gradient(to left, #00101A 0%, #00101A 50%, rgba(0,16,26,0) 100%)",
              }}
            />

            {/* Large edge chevrons, vertically centred and sitting inside the
                solid part of the fade (≈120px in at 1440). */}
            <CarouselArrowButton
              direction="prev"
              size="edge"
              disabled={!canPrev}
              ariaLabel={prevAriaLabel}
              onClick={scrollPrev}
              className="absolute top-1/2 left-1 z-10 -translate-y-1/2 lg:left-[6.3%]"
            />
            <CarouselArrowButton
              direction="next"
              size="edge"
              disabled={!canNext}
              ariaLabel={nextAriaLabel}
              onClick={scrollNext}
              className="absolute top-1/2 right-1 z-10 -translate-y-1/2 lg:right-[6.3%]"
            />
          </div>

          <div className="flex items-center justify-center gap-6">
            <CarouselArrowButton
              direction="prev"
              size="inline"
              disabled={!canPrev}
              ariaLabel={prevAriaLabel}
              onClick={scrollPrev}
            />
            <span className="text-2xl leading-9 font-bold text-white/60">
              <span className="text-[45px] text-gold">{selected + 1}</span>/{total}
            </span>
            <CarouselArrowButton
              direction="next"
              size="inline"
              disabled={!canNext}
              ariaLabel={nextAriaLabel}
              onClick={scrollNext}
            />
          </div>
        </>
      )}
    </section>
  );
}
