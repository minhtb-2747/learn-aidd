"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn.utils";
import { CloseIcon, PlusIcon } from "./hashtag-input";
import { validateImageFile } from "@/lib/kudos/validate-image-file";

export interface PendingImage {
  id: string;
  /** Held locally until the form is submitted — nothing is uploaded on pick. */
  file: File;
  /** `blob:` object URL; revoked on remove and on unmount. */
  previewUrl: string;
}

/**
 * Local tile id — a React key, nothing more.
 *
 * `crypto.randomUUID()` is secure-context-only: over a LAN IP (testing on a
 * phone) it is `undefined` and throws inside the pick handler before any error
 * state exists, so the picker looks dead. Nothing here needs crypto strength.
 */
let tileCounter = 0;
function nextTileId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  tileCounter += 1;
  return `tile-${Date.now()}-${tileCounter}`;
}

export interface ImageUploaderProps {
  label: string;
  addLabel: string;
  maxLabel: string;
  removeAriaLabel: string;
  value: PendingImage[];
  onChange: (next: PendingImage[]) => void;
  max?: number;
  className?: string;
}

/**
 * "Image" gallery field. Picking only holds the `File` and shows a local
 * `blob:` preview — upload happens at submit time in `write-kudos-form.tsx`.
 * That ordering is what makes abandoning the dialog free: nothing has reached
 * Storage yet, so there is nothing to clean up.
 */
export default function ImageUploader({
  label,
  addLabel,
  maxLabel,
  removeAriaLabel,
  value,
  onChange,
  max = 5,
  className,
}: ImageUploaderProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  // Kept current so the unmount cleanup below sees the latest tiles, not a
  // stale closure.
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Revoke every preview URL if the composer unmounts with files still held.
  useEffect(
    () => () =>
      valueRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      ),
    [],
  );

  function handlePick() {
    if (value.length >= max) return;
    inputRef.current?.click();
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    // Copy the FileList out BEFORE clearing the input — `input.files` is live,
    // so `value = ""` empties the very object this points at and reading it
    // afterwards yields zero files, with no tile and no error.
    const files = Array.from(event.target.files ?? []).slice(
      0,
      Math.max(0, max - value.length),
    );
    event.target.value = ""; // allow re-selecting the same file later
    if (files.length === 0) return;

    // Accumulated, then applied in ONE `onChange`. `value` is a plain array,
    // not a state updater, so per-file calls would each build off the same
    // stale `value` and keep only the last tile.
    const added: PendingImage[] = [];
    const nextErrors: string[] = [];

    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        nextErrors.push(`${file.name}: ${validationError}`);
        continue;
      }
      added.push({
        id: nextTileId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (added.length > 0) onChange([...value, ...added]);
    setErrors(nextErrors);
  }

  function handleRemove(id: string) {
    const target = value.find((image) => image.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(value.filter((image) => image.id !== id));
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {value.map((image) => (
          <div key={image.id} className="relative h-20 w-20 shrink-0">
            {/* Border and radius on the image, not a wrapper, or the curves
                don't line up. `unoptimized` is required — a `blob:` src lives
                only in this tab and Next's optimizer fetches server-side. */}
            <Image
              src={image.previewUrl}
              alt=""
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 rounded-[18px] border border-gold-line object-cover"
            />
            <button
              type="button"
              aria-label={removeAriaLabel}
              onClick={() => handleRemove(image.id)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-danger text-white"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={handlePick}
            className="flex h-12 cursor-pointer items-center gap-1 rounded-lg border border-gold-line bg-white px-2 py-1.5 text-black/50 transition-colors hover:bg-gold/10"
          >
            <PlusIcon className="h-6 w-6 text-ink" />
            <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px]">
              <span>{addLabel}</span>
              <span>{maxLabel}</span>
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((message) => (
            <li
              key={message}
              role="alert"
              className="text-sm font-bold text-danger"
            >
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
