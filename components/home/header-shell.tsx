"use client";

import { useScrolled } from "@/lib/hooks/use-scrolled";
import { cn } from "@/lib/utils/cn.utils";

/**
 * The header's `<header>` element as a client component so it can react to
 * scroll; `children` stay server-rendered. Translucent at rest so the keyvisual
 * reads through, opaque once scrolled so content can't show under the nav.
 */
export default function HeaderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex h-20 w-full items-center justify-between px-6 transition-colors duration-200 sm:px-9 lg:px-36",
        scrolled ? "bg-[#101417]" : "bg-[rgba(16,20,23,0.8)]",
      )}
    >
      {children}
    </header>
  );
}
