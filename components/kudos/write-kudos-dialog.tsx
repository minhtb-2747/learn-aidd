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
 * "Viết Kudo" / "Chỉnh sửa bài viết" modal shell (MoMorph node `520:11647`
 * create, `1949:13746` edit): the cream rounded card centered over a dark
 * scrim. Owns the scrim, focus trap, Escape handling, body-scroll lock, and
 * the dialog title; field state and the submit call live in
 * `WriteKudosForm` (split out in phase 07 — once the "Gửi" button called a
 * real `createKudos` server action, this file alone would have exceeded the
 * 200-line guideline). The parent (`KudosModalsProvider`) remounts this
 * component via a changing React `key` each time a NEW compose/edit session
 * starts (so a fresh `initial` always takes effect as `WriteKudosForm`'s own
 * initial state), while the Rules-panel hand-off toggles `open` on the SAME
 * instance so an in-progress draft survives that round-trip.
 */
export default function WriteKudosDialog({
  open,
  onClose,
  onOpenRules,
  mode = "create",
  initial,
}: WriteKudosDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleCancel = useCallback(() => {
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
    // Two layers on purpose. Centring with `items-center` directly on the
    // scrolling box is the obvious one-word change and it is broken: once the
    // dialog is taller than the viewport — which this one is, with the editor
    // and image uploader open — a centred flex item overflows equally in both
    // directions, and the part above the scroll origin cannot be scrolled to.
    // The title and the recipient field simply become unreachable.
    // So the scroll lives on the outer box and the centring on an inner one
    // that is at least as tall as the viewport: centred when it fits, scrolled
    // from the top when it doesn't.
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
            onSubmitted={onClose}
          />
        </div>
      </div>
    </div>
  );
}
