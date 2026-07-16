import { cn } from "@/lib/utils/cn.utils";

export interface HeaderNavLink {
  /** Translated label. */
  label: string;
  /** Stub destination — integration points this at the real route/anchor. */
  href: string;
  /** Whether this is the current section (yellow underline). */
  selected?: boolean;
}

/**
 * Primary navigation links in the sticky header. Labels are always supplied by
 * the caller (already translated); defaults to an empty list rather than
 * hardcoding untranslated copy.
 */
export default function HeaderNav({ links = [] }: { links?: HeaderNavLink[] }) {
  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className={cn(
            "px-4 py-4 text-sm leading-5 font-bold tracking-[0.1px] transition-colors duration-200",
            link.selected
              ? "border-b border-[#FFEA9E] text-[#FFEA9E] [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
              : "text-white hover:bg-white/10",
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
