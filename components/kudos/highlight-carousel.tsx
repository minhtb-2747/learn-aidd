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
 * Layout per the design export (`slide.svg`, 1440×525): the track is
 * full-bleed — cards are 528×525 on a 552px pitch (24px gutter), so at 1440
 * three are in frame and the outer two bleed past the viewport edges.
 *
 * Every card is drawn identically: the neighbours are NOT dimmed, scaled or
 * desaturated. What fades them is a pair of 400px-wide overlays of the page
 * background (`#00101A`) — solid for their inner half, then easing to
 * transparent. That is the design's "shadow", and it is why a card looks
 * progressively swallowed by the background rather than uniformly greyed.
 *
 * Large chevrons sit on top of those overlays; a smaller pair flanks the
 * "n/total" readout underneath.
 *
 * Motion is handled by Embla (`embla-carousel-react`) rather than hand-rolled
 * index math, which is what gives drag/swipe, momentum and the eased
 * transition on next/back for free. `align: "center"` + `containScroll: false`
 * is what produces the symmetric peek on both sides — with the default
 * `containScroll` the first and last slides would snap flush to the edges and
 * lose it.
 *
 * Filters stay URL-driven (`?hashtag=&department=`, see `app/kudos/page.tsx`)
 * so the server re-queries the top 5 and a reload preserves the selection.
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

  // Open on the second card once there are at least three, so both neighbours
  // peek and the edge fades read as designed. With one or two there is nothing
  // to the left, and starting there would just leave a gap.
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
      {/* Only the heading block follows the page gutter — the track below is
          deliberately full-bleed so the neighbour cards run off both edges. */}
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
                    // 38.33% ≈ the design's 552px slide pitch at 1440; `px-3`
                    // takes 24px of that back as the gutter, leaving the 528px
                    // card (`max-w-132` on KudosCard) exactly as drawn.
                    // The `max-w-138` (=552px) cap is what keeps the gutter at
                    // 24px past 1440: without it the slide keeps growing while
                    // the card stays pinned at its 528px max, and the surplus
                    // turns into dead space between cards.
                    className="flex max-w-138 min-w-0 shrink-0 grow-0 basis-[92%] justify-center px-3 sm:basis-[68%] lg:basis-[38.33%]"
                  >
                    <KudosCard kudos={item} {...cardProps} />
                  </div>
                ))}
              </div>
            </div>

            {/* The design's edge treatment: the page background laid back over
                the track, solid for its inner half then eased out. Fading to
                `rgba(0,16,26,0)` rather than `transparent` matters — the CSS
                keyword resolves to transparent *black* and would grey the
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
