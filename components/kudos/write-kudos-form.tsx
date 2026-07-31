"use client";

import { useCallback, useMemo, useState, type JSX } from "react";
import { useTranslations } from "next-intl";
import { SaveIcon, SendIcon } from "@/icons";
import RichTextEditor, { type RichTextEditorState } from "./rich-text-editor";
import RecipientSelect, { type RecipientOption } from "./recipient-select";
import HashtagInput, { CloseIcon } from "./hashtag-input";
import ImageUploader, { type PendingImage } from "./image-uploader";
import { useSubmitKudos } from "./use-submit-kudos";
import KudosAnonymousField from "./kudos-anonymous-field";
import KudosHonorTitleField from "./kudos-honor-title-field";
import * as Copy from "./write-kudos-dialog-copy";
import type { WriteKudosInitial } from "./write-kudos-dialog";

export interface WriteKudosFormProps {
  mode: "create" | "edit";
  initial?: WriteKudosInitial;
  onOpenRules?: () => void;
  onCancel: () => void;
  /** Reports in-flight submits so the shell can block its close paths. */
  onBusyChange?: (busy: boolean) => void;
  /** Called after a successful create, or on the edit-mode stub — closes the dialog. */
  onSubmitted: () => void;
}

/**
 * Field state + submit for the Write/Edit dialog; the shell (scrim, focus,
 * title) stays in `write-kudos-dialog.tsx`. `mode="edit"` is still a
 * close-only stub.
 */
export default function WriteKudosForm({
  mode,
  initial,
  onOpenRules,
  onCancel,
  onBusyChange,
  onSubmitted,
}: WriteKudosFormProps): JSX.Element {
  const t = useTranslations("Kudos");
  const [recipient, setRecipient] = useState<RecipientOption | null>(
    initial?.recipientId ? { id: initial.recipientId, name: initial.recipient ?? "" } : null,
  );
  const [honorTitle, setHonorTitle] = useState(initial?.honorTitle ?? "");
  const [hashtags, setHashtags] = useState<string[]>(initial?.hashtags ?? []);
  const [hasContent, setHasContent] = useState(false);
  const [content, setContent] = useState(initial?.content ?? "");
  const [anonymous, setAnonymous] = useState(initial?.anonymous ?? false);
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [images, setImages] = useState<PendingImage[]>([]);

  const { submit, isPending, errorMessage, clearError } = useSubmitKudos({
    uploadErrorMessage: t("imageUploader.uploadError"),
    onBusyChange,
    onSubmitted,
  });

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled =
      Boolean(recipient) && honorTitle.trim().length > 0 && hashtags.length > 0;
    // Edit mode seeds the body via `initialContent`, which reports
    // hasContent=true on mount — so both modes can gate on it.
    const nicknameReady = !anonymous || nickname.trim().length > 0;
    // Images don't gate submit: nothing uploads before submit, so there is no
    // half-finished gallery to wait on.
    return requiredFieldsFilled && hasContent && nicknameReady;
  }, [recipient, honorTitle, hashtags, hasContent, anonymous, nickname]);

  const handleRichTextChange = useCallback((state: RichTextEditorState) => {
    setHasContent(state.hasContent);
    setContent(state.text);
  }, []);

  // The failure message names a file that may no longer be in the gallery.
  const handleImagesChange = useCallback(
    (next: PendingImage[]) => {
      setImages(next);
      clearError();
    },
    [clearError],
  );

  function handleSubmit() {
    if (!canSubmit || isPending) return;

    if (mode === "edit") {
      // Edit is still a stub — no backend call.
      onSubmitted();
      return;
    }

    submit({
      recipientId: recipient!.id,
      honorTitle,
      content,
      hashtags,
      anonymous,
      nickname,
      images,
    });
  }

  const submitLabel = mode === "edit" ? Copy.EDIT_SUBMIT_LABEL : Copy.CREATE_SUBMIT_LABEL;
  const SubmitIcon = mode === "edit" ? SaveIcon : SendIcon;

  return (
    <>
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
          inputPlaceholder={t("hashtagInput.placeholder")}
          removeAriaLabel={(tag) => t("hashtagInput.removeAria", { tag })}
          value={hashtags}
          onChange={setHashtags}
        />

        <ImageUploader
          label={Copy.IMAGE_LABEL}
          addLabel={Copy.IMAGE_ADD_LABEL}
          maxLabel={Copy.IMAGE_MAX_LABEL}
          removeAriaLabel={t("imageUploader.removeAria")}
          value={images}
          onChange={handleImagesChange}
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

      {errorMessage && (
        <p role="alert" className="text-base leading-6 font-bold text-danger">
          {errorMessage}
        </p>
      )}

      <div className="flex w-full items-stretch gap-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex cursor-pointer items-center gap-2 rounded border border-gold-line bg-gold/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {Copy.CANCEL_LABEL}
          <CloseIcon className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold p-4 text-[22px] leading-7 font-bold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending && mode === "create" ? Copy.SUBMIT_PENDING_LABEL : submitLabel}
          <SubmitIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
