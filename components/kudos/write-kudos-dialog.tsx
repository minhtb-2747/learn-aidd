"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type JSX, type MouseEvent } from "react";
import { SaveIcon, SendIcon } from "@/icons";
import RichTextEditor from "./rich-text-editor";
import RecipientSelect from "./recipient-select";
import HashtagInput, { CloseIcon } from "./hashtag-input";
import ImageUploader from "./image-uploader";
import KudosAnonymousField from "./kudos-anonymous-field";
import KudosHonorTitleField from "./kudos-honor-title-field";
import * as Copy from "./write-kudos-dialog-copy";

export interface WriteKudosInitial {
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
 * "Viết Kudo" / "Chỉnh sửa bài viết" modal (MoMorph node `520:11647` create,
 * `1949:13746` edit): the cream rounded card centered over a dark scrim,
 * gathering Người nhận + Danh hiệu + a FUNCTIONAL rich-text message +
 * Hashtag + Image + anonymous toggle (+ its dependent Nickname field).
 * `mode="edit"` re-labels the title/submit button and seeds fields from
 * `initial`. The parent (`KudosModalsProvider`) remounts this component via a
 * changing React `key` each time a NEW compose/edit session starts (so a
 * fresh `initial` always takes effect as this component's own initial
 * state), while the Rules-panel hand-off toggles `open` on the SAME instance
 * so an in-progress draft survives that round-trip. Mock only — Gửi/Lưu
 * stub out (no backend) once required fields are filled.
 */
export default function WriteKudosDialog({
  open,
  onClose,
  onOpenRules,
  mode = "create",
  initial,
}: WriteKudosDialogProps): JSX.Element | null {
  const [recipient, setRecipient] = useState<string | null>(initial?.recipient ?? null);
  const [honorTitle, setHonorTitle] = useState(initial?.honorTitle ?? "");
  const [hashtags, setHashtags] = useState<string[]>(initial?.hashtags ?? []);
  const [hasContent, setHasContent] = useState(false);
  const [anonymous, setAnonymous] = useState(initial?.anonymous ?? false);
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
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

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled =
      Boolean(recipient) && honorTitle.trim().length > 0 && hashtags.length > 0;
    // Edit mode seeds the body via RichTextEditor's initialContent (which
    // reports hasContent=true on mount), so both modes gate on hasContent.
    const nicknameReady = !anonymous || nickname.trim().length > 0;
    return requiredFieldsFilled && hasContent && nicknameReady;
  }, [recipient, honorTitle, hashtags, hasContent, anonymous, nickname]);

  const handleRichTextChange = useCallback((next: boolean) => setHasContent(next), []);

  function handleSubmit() {
    if (!canSubmit) return;
    // Stub — no backend in this build's scope.
    onClose();
  }

  function handleScrimMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) handleCancel();
  }

  if (!open) return null;

  const title = mode === "edit" ? Copy.EDIT_TITLE : Copy.CREATE_TITLE;
  const submitLabel = mode === "edit" ? Copy.EDIT_SUBMIT_LABEL : Copy.CREATE_SUBMIT_LABEL;
  const SubmitIcon = mode === "edit" ? SaveIcon : SendIcon;

  return (
    <div
      role="presentation"
      onMouseDown={handleScrimMouseDown}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10"
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

        <RecipientSelect
          label={Copy.RECIPIENT_LABEL}
          placeholder={Copy.RECIPIENT_PLACEHOLDER}
          value={recipient}
          onChange={setRecipient}
        />

        <KudosHonorTitleField
          label={Copy.HONOR_TITLE_LABEL}
          placeholder={Copy.HONOR_TITLE_PLACEHOLDER}
          help={Copy.HONOR_TITLE_HELP}
          value={honorTitle}
          onChange={setHonorTitle}
        />

        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-4">
            <RichTextEditor
              placeholder={Copy.CONTENT_PLACEHOLDER}
              communityLabel={Copy.COMMUNITY_LABEL}
              onOpenRules={onOpenRules}
              onChange={handleRichTextChange}
              initialContent={initial?.content}
            />
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-ink">
              {Copy.CONTENT_HELP}
            </p>
          </div>

          <HashtagInput
            label={Copy.HASHTAG_LABEL}
            addLabel={Copy.HASHTAG_ADD_LABEL}
            maxLabel={Copy.HASHTAG_MAX_LABEL}
            value={hashtags}
            onChange={setHashtags}
          />

          <ImageUploader
            label={Copy.IMAGE_LABEL}
            addLabel={Copy.IMAGE_ADD_LABEL}
            maxLabel={Copy.IMAGE_MAX_LABEL}
          />
        </div>

        <KudosAnonymousField
          anonymousLabel={Copy.ANONYMOUS_LABEL}
          nicknameLabel={Copy.NICKNAME_LABEL}
          nicknamePlaceholder={Copy.NICKNAME_PLACEHOLDER}
          anonymous={anonymous}
          onAnonymousChange={setAnonymous}
          nickname={nickname}
          onNicknameChange={setNickname}
        />

        <div className="flex w-full items-stretch gap-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded border border-gold-line bg-gold/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink transition-colors hover:bg-gold/20"
          >
            {Copy.CANCEL_LABEL}
            <CloseIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold p-4 text-[22px] leading-7 font-bold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitLabel}
            <SubmitIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
