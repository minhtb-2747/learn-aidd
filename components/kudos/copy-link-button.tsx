"use client";

import { useEffect, useState } from "react";
import { LinkIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

export interface CopyLinkButtonProps {
  /** URL copied to the clipboard; defaults to the current page URL. */
  href?: string;
  label: string;
  toastMessage: string;
  className?: string;
}

const TOAST_DURATION_MS = 2500;

/**
 * "Copy Link" action shared by highlight cards and feed posts (spec C.4.2 /
 * B.4.4): copies a URL to the clipboard and shows a small self-dismissing
 * toast next to the button. No global toast system exists yet in this repo,
 * so the confirmation is scoped locally rather than introducing one.
 */
export default function CopyLinkButton({
  href,
  label,
  toastMessage,
  className,
}: CopyLinkButtonProps) {
  const [showToast, setShowToast] = useState(false);
  // Bumped on each successful copy so the auto-dismiss timer restarts even when
  // the toast is already visible (rapid re-clicks).
  const [toastNonce, setToastNonce] = useState(0);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showToast, toastNonce]);

  async function handleCopy() {
    const url = href ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable/denied — the copy did NOT happen, so do not
      // show a success toast (nothing else actionable here).
      return;
    }
    setShowToast(true);
    setToastNonce((nonce) => nonce + 1);
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-150 hover:bg-white/10",
          className,
        )}
      >
        {label}
        <LinkIcon className="h-6 w-6 shrink-0" />
      </button>

      {showToast && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-ink px-3 py-2 text-sm font-bold whitespace-nowrap text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        >
          {toastMessage}
        </span>
      )}
    </span>
  );
}
