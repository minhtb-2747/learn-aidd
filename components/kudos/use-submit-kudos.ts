"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createKudos } from "@/app/actions/kudos";
import { uploadKudosImages, discardKudosImages } from "./upload-kudos-images";
import type { PendingImage } from "./image-uploader";

export interface SubmitKudosInput {
  recipientId: string;
  honorTitle: string;
  content: string;
  hashtags: string[];
  anonymous: boolean;
  nickname: string;
  images: PendingImage[];
}

export interface UseSubmitKudosOptions {
  /** Upload failures are reported with this message, prefixed by the file name. */
  uploadErrorMessage: string;
  /** Lets the dialog shell refuse to close while a submit is in flight. */
  onBusyChange?: (busy: boolean) => void;
  /** Called once the kudos row exists — closes the dialog. */
  onSubmitted: () => void;
}

/**
 * Submit orchestration for the Kudos composer: upload the held files, then
 * create the row, then roll the files back if the row never lands.
 *
 * Lives apart from `write-kudos-form.tsx` so that file stays inside the
 * project's 200-line rule; the split is along a real seam, since everything
 * here is about the write path and nothing about field state.
 *
 * Note the whole chain outlives this hook's component — `startTransition`
 * does not cancel on unmount. That is why `onBusyChange` exists: the shell has
 * to block its close paths, or a "cancelled" compose still posts.
 */
export function useSubmitKudos({
  uploadErrorMessage,
  onBusyChange,
  onSubmitted,
}: UseSubmitKudosOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onBusyChange?.(isPending);
  }, [isPending, onBusyChange]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const submit = useCallback(
    (input: SubmitKudosInput) => {
      setErrorMessage(null);
      startTransition(async () => {
        // Files reach Storage here, not when they were picked, so abandoning
        // the composer costs nothing and leaves no orphans behind.
        const uploaded = await uploadKudosImages(
          input.images.map((image) => image.file),
          uploadErrorMessage,
        );
        if (!uploaded.ok) {
          setErrorMessage(uploaded.error);
          return;
        }

        const result = await createKudos({
          recipientId: input.recipientId,
          honorTitle: input.honorTitle,
          content: input.content,
          hashtags: input.hashtags,
          isAnonymous: input.anonymous,
          anonymousName: input.anonymous ? input.nickname : undefined,
          imageUrls: uploaded.urls,
        });

        if (result.ok) {
          onSubmitted();
        } else {
          // Objects landed but the kudos row did not — best-effort cleanup so
          // they don't sit in the bucket unreferenced. Errors are swallowed.
          discardKudosImages(uploaded.paths);
          setErrorMessage(result.error);
        }
      });
    },
    [uploadErrorMessage, onSubmitted],
  );

  return { submit, isPending, errorMessage, clearError };
}
