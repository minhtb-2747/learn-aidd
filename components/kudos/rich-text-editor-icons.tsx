/**
 * Toolbar glyphs for `rich-text-editor.tsx`, extracted so that file stays
 * under the 200-line guideline (phase 07: adding `{hasContent, text}` to its
 * `onChange` contract pushed the combined file over the limit).
 */

export interface IconProps {
  className?: string;
}

export function BoldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M6 4h6.5a4 4 0 0 1 2.9 6.7A4.5 4.5 0 0 1 13 20H6V4Zm3 3v4h3.5a2 2 0 0 0 0-4H9Zm0 7v3.5h4a1.75 1.75 0 0 0 0-3.5H9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ItalicIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M10 4h8v2h-2.6l-3.2 12H15v2H7v-2h2.6l3.2-12H10V4Z" fill="currentColor" />
    </svg>
  );
}

export function StrikethroughIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M4 11h16v2H4v-2Zm5.4-3.3c-.2-.4-.3-.8-.3-1.2 0-1.4 1.5-2.9 4.3-2.9 1.8 0 3.1.6 4 1.4l-1.3 1.5c-.6-.5-1.5-.9-2.6-.9-1.3 0-1.9.5-1.9 1.1 0 .4.2.7.6 1H9.4ZM14.9 15.3c.3.5.4.9.4 1.4 0 1.6-1.5 3.3-4.5 3.3-2 0-3.6-.7-4.6-1.7l1.4-1.5c.7.7 1.8 1.2 3.1 1.2 1.5 0 2.1-.6 2.1-1.3 0-.5-.3-.9-.7-1.4h2.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OrderedListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M9 5h12v2H9V5Zm0 6h12v2H9v-2Zm0 6h12v2H9v-2ZM3.5 4h1.8v3.6h1v1H2.7v-1h1.6V5H2.7V4h.8ZM2.3 11.2h2.6v.9H3.7l1.3 1.5v.8H2.3v-.9h1.6l-1.6-1.5v-.8Zm.4 6h1.7v.8h-1v.5h1v.9H2.7v-.9h1v-.4h-1v-.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BulletListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M9 5h12v2H9V5Zm0 6h12v2H9v-2Zm0 6h12v2H9v-2ZM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M6.6 5.6C4 6.9 2.5 9 2.5 11.6V17a2 2 0 0 0 2 2h2.7a2 2 0 0 0 2-2v-2.9a2 2 0 0 0-2-2H5.4c.2-1.7 1.3-3 3-4L6.6 5.6Zm9.3 0c-2.6 1.3-4.1 3.4-4.1 6v5.4a2 2 0 0 0 2 2h2.7a2 2 0 0 0 2-2v-2.9a2 2 0 0 0-2-2h-1.8c.2-1.7 1.3-3 3-4l-1.8-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
