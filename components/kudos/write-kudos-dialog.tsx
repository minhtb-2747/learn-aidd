"use client";

import { useCallback, useEffect, useRef, type JSX, type MouseEvent } from "react";
import WriteKudosForm from "./write-kudos-form";
import * as Copy from "./write-kudos-dialog-copy";

export interface WriteKudosInitial {
  recipientId?: string;
  recipient?: string;
  honorTitle?: string;
  hashtags?: string[];
  content?: string;
  anonymous?: boolean;
  nickname?: string;
}

export interface WriteKudosDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenRules?: () => void;
  mode?: "create" | "edit";
  initial?: WriteKudosInitial;
}

/**
 * "Viết Kudo" / "Chỉnh sửa bài viết" modal shell. Owns the scrim, focus, Escape,
 * body-scroll lock and title; field state and submit live in `WriteKudosForm`.
 * `KudosModalsProvider` remounts this via a changing `key` per compose session,
 * so a fresh `initial` always takes effect.
 *
 * Two responsibilities that are easy to miss:
 *
 * - **Refuses to close while submitting.** The submit is a promise chain that
 *   survives unmount, so without this guard a user who "cancelled" mid-upload
 *   would still have their kudos posted, silently.
 * - **The Rules-panel hand-off does NOT preserve the draft** — `open` goes
 *   false and the whole form unmounts, text and picked images alike.
 */
export default function WriteKudosDialog({
  open,
  onClose,
  onOpenRules,
  mode = "create",
  initial,
}: WriteKudosDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  // A ref, not state — must not re-subscribe the Escape listener every time
  // the form starts or stops submitting.
  const busyRef = useRef(false);

  const handleCancel = useCallback(() => {
    // Closing mid-submit cancels nothing; the chain would post anyway.
    if (busyRef.current) return;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    dialogRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleCancel]);

  function handleScrimMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) handleCancel();
  }

  if (!open) return null;

  const title = mode === "edit" ? Copy.EDIT_TITLE : Copy.CREATE_TITLE;

  return (
    // Two layers on purpose: scroll on the outer box, centring on an inner one
    // at least as tall as the viewport. Putting `items-center` on the scrolling
    // box instead looks equivalent and is broken — once the dialog outgrows the
    // viewport a centred flex item overflows BOTH ways, and everything above
    // the scroll origin (title, recipient field) becomes unreachable.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
      <div
        role="presentation"
        onMouseDown={handleScrimMouseDown}
        className="flex min-h-full items-center justify-center px-4 py-10"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="write-kudos-dialog-title"
          tabIndex={-1}
          className="flex w-full max-w-188 flex-col gap-8 rounded-3xl bg-[#FFF8E1] p-10 outline-none"
        >
          <h2
            id="write-kudos-dialog-title"
            className="text-center text-[32px] leading-10 font-bold text-ink"
          >
            {title}
          </h2>

          <WriteKudosForm
            mode={mode}
            initial={initial}
            onOpenRules={onOpenRules}
            onCancel={handleCancel}
            onBusyChange={(busy) => {
              busyRef.current = busy;
            }}
            onSubmitted={onClose}
          />
        </div>
      </div>
    </div>
  );
}
