"use client";

import { uploadKudoImage, removeKudoImage } from "@/app/actions/kudos-images";

export type UploadKudosImagesResult =
  | { ok: true; urls: string[]; paths: string[] }
  | { ok: false; error: string };

/**
 * Submit-time upload of the composer's held files.
 *
 * **One file per server-action call.** `next.config.ts` caps action bodies at
 * 6 MB, sized for a single 5 MB image; the picker allows five, so a batched
 * call could carry 25 MB and would be rejected outright.
 *
 * **Sequential, not `Promise.all`** — for rollback, not bandwidth. Concurrent
 * uploads leave siblings in flight when one fails, so cleanup would have to
 * settle them all before knowing what to delete. In order: fail at *k*, delete
 * `0..k-1`, nothing races. Array order also matches `display_order` for free.
 */
export async function uploadKudosImages(
  files: File[],
  fallbackErrorMessage: string,
): Promise<UploadKudosImagesResult> {
  if (files.length === 0) return { ok: true, urls: [], paths: [] };

  const urls: string[] = [];
  const paths: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    // A transport-level throw (offline, action 500) surfaces as a rejection
    // rather than an `{ok:false}`, so both shapes are normalised here.
    const result = await uploadKudoImage(formData).catch(
      (): { ok: false; error: string } => ({ ok: false, error: fallbackErrorMessage }),
    );

    if (!result.ok) {
      discardKudosImages(paths);
      // The form has a single error slot, so the message must name the file.
      return { ok: false, error: `${file.name}: ${result.error}` };
    }

    urls.push(result.publicUrl);
    paths.push(result.path);
  }

  return { ok: true, urls, paths };
}

/**
 * Deletes Storage objects whose kudos row never landed.
 *
 * Best-effort by design: the user's submit already failed, and a failed
 * cleanup must not produce a second error on top of it. The `.catch` is not
 * optional — without it a rejected action becomes an unhandled rejection.
 */
export function discardKudosImages(paths: string[]): void {
  for (const path of paths) {
    void removeKudoImage(path).catch(() => {});
  }
}
