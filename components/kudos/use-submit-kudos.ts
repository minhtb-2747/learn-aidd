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
 * Submit orchestration for the composer: upload the held files, create the row,
 * roll the files back if the row never lands.
 *
 * The chain OUTLIVES this hook's component — `startTransition` does not cancel
 * on unmount. That is why `onBusyChange` exists: the shell must block its close
 * paths, or a "cancelled" compose still posts.
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
        // Files reach Storage here, not at pick time, so abandoning the
        // composer costs nothing and leaves no orphans.
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
          // Objects landed but the row did not — best-effort cleanup so they
          // don't sit in the bucket unreferenced.
          discardKudosImages(uploaded.paths);
          setErrorMessage(result.error);
        }
      });
    },
    [uploadErrorMessage, onSubmitted],
  );

  return { submit, isPending, errorMessage, clearError };
}
