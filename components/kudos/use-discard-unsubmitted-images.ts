"use client";

import { useCallback, useEffect, useRef } from "react";
import { removeKudoImage } from "@/app/actions/kudos-images";
import type { UploadedImage } from "./image-uploader";

/**
 * Deletes images that were uploaded but never submitted.
 *
 * The compose dialog unmounts its form on EVERY close path (cancel button,
 * Escape key, scrim click), so hanging the cleanup off unmount covers all of
 * them in one place rather than three. Without it, picking an image and then
 * closing the dialog strands that object in the `kudo-images` bucket forever.
 *
 * Call the returned `markSubmitted()` after a successful create: at that point
 * the objects belong to a persisted `kudos` row and must NOT be deleted.
 *
 * The ref mirror is updated in an effect (not during render) so the unmount
 * cleanup sees the latest list without re-subscribing on every keystroke —
 * writing a ref during render violates React's rules and is flagged by
 * `react-hooks/refs`.
 */
export function useDiscardUnsubmittedImages(images: UploadedImage[]): {
  markSubmitted: () => void;
} {
  const imagesRef = useRef<UploadedImage[]>(images);
  const submittedRef = useRef(false);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      if (submittedRef.current) return;
      for (const image of imagesRef.current) {
        if (image.status === "done" && image.path) void removeKudoImage(image.path);
      }
    },
    [],
  );

  const markSubmitted = useCallback(() => {
    submittedRef.current = true;
  }, []);

  return { markSubmitted };
}
