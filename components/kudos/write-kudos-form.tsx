"use client";

import { useCallback, useMemo, useState, useTransition, type JSX } from "react";
import { useTranslations } from "next-intl";
import { SaveIcon, SendIcon } from "@/icons";
import RichTextEditor, { type RichTextEditorState } from "./rich-text-editor";
import RecipientSelect, { type RecipientOption } from "./recipient-select";
import HashtagInput, { CloseIcon } from "./hashtag-input";
import ImageUploader, { type UploadedImage } from "./image-uploader";
import { useDiscardUnsubmittedImages } from "./use-discard-unsubmitted-images";
import KudosAnonymousField from "./kudos-anonymous-field";
import KudosHonorTitleField from "./kudos-honor-title-field";
import * as Copy from "./write-kudos-dialog-copy";
import { createKudos } from "@/app/actions/kudos";
import type { WriteKudosInitial } from "./write-kudos-dialog";

export interface WriteKudosFormProps {
  mode: "create" | "edit";
  initial?: WriteKudosInitial;
  onOpenRules?: () => void;
  onCancel: () => void;
  /** Called after a successful create, or on the edit-mode stub — closes the dialog. */
  onSubmitted: () => void;
}

/**
 * Field block + submit for the Write/Edit-Kudos dialog (split out of
 * `write-kudos-dialog.tsx`, which kept the scrim/focus/title shell). Owns
 * all field state and the `createKudos` server-action call. `mode="edit"`
 * keeps the original close-only stub — out of scope for this phase.
 */
export default function WriteKudosForm({
  mode,
  initial,
  onOpenRules,
  onCancel,
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
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Discards uploads if the compose is abandoned; see the hook for why this
  // hangs off unmount rather than the individual close handlers.
  const { markSubmitted } = useDiscardUnsubmittedImages(images);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled =
      Boolean(recipient) && honorTitle.trim().length > 0 && hashtags.length > 0;
    // Edit mode seeds the body via RichTextEditor's initialContent (which
    // reports hasContent=true on mount), so both modes gate on hasContent.
    const nicknameReady = !anonymous || nickname.trim().length > 0;
    // Block submit while any image is still uploading so `createKudos` never
    // receives a half-finished gallery.
    const imagesReady = images.every((image) => image.status === "done");
    return requiredFieldsFilled && hasContent && nicknameReady && imagesReady;
  }, [recipient, honorTitle, hashtags, hasContent, anonymous, nickname, images]);

  const handleRichTextChange = useCallback((state: RichTextEditorState) => {
    setHasContent(state.hasContent);
    setContent(state.text);
  }, []);

  function handleSubmit() {
    if (!canSubmit || isPending) return;
    setErrorMessage(null);

    if (mode === "edit") {
      // Editing an existing kudos is out of scope for this phase — keep the
      // original close-only stub (no backend call). Edit mode never uploads,
      // so the unmount cleanup has nothing to discard either way.
      onSubmitted();
      return;
    }

    startTransition(async () => {
      const result = await createKudos({
        recipientId: recipient!.id,
        honorTitle,
        content,
        hashtags,
        isAnonymous: anonymous,
        anonymousName: anonymous ? nickname : undefined,
        imageUrls: images.filter((image) => image.status === "done").map((image) => image.url),
      });
      if (result.ok) {
        // The uploaded objects now belong to a persisted kudos row, so the
        // unmount cleanup must NOT delete them.
        markSubmitted();
        onSubmitted();
      } else {
        setErrorMessage(result.error);
      }
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
          uploadErrorMessage={t("imageUploader.uploadError")}
          removeAriaLabel={t("imageUploader.removeAria")}
          value={images}
          onChange={setImages}
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
          className="flex cursor-pointer items-center gap-2 rounded border border-gold-line bg-gold/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink transition-colors hover:bg-gold/20"
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
          {submitLabel}
          <SubmitIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
