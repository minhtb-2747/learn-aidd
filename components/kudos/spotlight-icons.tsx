export interface SpotlightIconProps {
  className?: string;
}

/**
 * Glyphs used only by the Spotlight board's own chrome. They live here rather
 * than in `@/icons` because nothing else renders them, and rather than inline
 * in `spotlight-board.tsx` because that file is already at the project's
 * 200-line ceiling.
 */

/** "Expand/pan-zoom" glyph, the board's single control in the design (B.7.2). */
export function PanZoomIcon({ className }: SpotlightIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Magnifier glyph for the board's search field. */
export function SpotlightSearchIcon({ className }: SpotlightIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
        fill="currentColor"
      />
    </svg>
  );
}
