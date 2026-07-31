"use client";

import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn.utils";
import { CloseIcon, PlusIcon } from "./hashtag-input";
import { validateImageFile } from "@/lib/kudos/validate-image-file";
import { uploadKudoImage, removeKudoImage } from "@/app/actions/kudos-images";

export interface UploadedImage {
  id: string;
  /** Local `blob:` preview while `status === "uploading"`, Supabase public URL once `"done"`. */
  url: string;
  /** Storage object path — set once the upload succeeds, used for cleanup on remove. */
  path: string | null;
  status: "uploading" | "done";
}

export interface ImageUploaderProps {
  label: string;
  addLabel: string;
  maxLabel: string;
  uploadErrorMessage: string;
  removeAriaLabel: string;
  value: UploadedImage[];
  onChange: Dispatch<SetStateAction<UploadedImage[]>>;
  max?: number;
  className?: string;
}

/**
 * "Image" gallery field (MoMorph spec F, node `520:9896`) — real upload to
 * the public `kudo-images` Storage bucket via `uploadKudoImage`. `onChange`
 * takes `Dispatch<SetStateAction<...>>` so async callbacks can apply
 * functional updates against the live array, not a stale closure.
 */
export default function ImageUploader({
  label,
  addLabel,
  maxLabel,
  uploadErrorMessage,
  removeAriaLabel,
  value,
  onChange,
  max = 5,
  className,
}: ImageUploaderProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  // Keep the ref current (without mutating it during render) so the
  // unmount cleanup below can see the latest tiles, not a stale closure.
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Revoke any still-pending preview URLs if the composer unmounts mid-upload.
  useEffect(
    () => () =>
      valueRef.current.forEach((image) => {
        if (image.status === "uploading") URL.revokeObjectURL(image.url);
      }),
    [],
  );

  function handlePick() {
    if (value.length >= max) return;
    inputRef.current?.click();
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    event.target.value = ""; // allow re-selecting the same file later
    if (!fileList) return;

    const files = Array.from(fileList).slice(0, Math.max(0, max - value.length));
    const nextErrors: string[] = [];
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) nextErrors.push(`${file.name}: ${validationError}`);
      else startUpload(file);
    }
    setErrors(nextErrors);
  }

  function startUpload(file: File) {
    const id = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    onChange((current) => [...current, { id, url: previewUrl, path: null, status: "uploading" }]);

    const formData = new FormData();
    formData.append("file", file);

    uploadKudoImage(formData)
      .catch((): { ok: false; error: string } => ({
        ok: false,
        error: uploadErrorMessage,
      }))
      .then((result) => {
        URL.revokeObjectURL(previewUrl);
        onChange((current) => {
          const stillPresent = current.some((image) => image.id === id);
          if (!stillPresent) {
            // Removed while the upload was in flight — clean up the orphan.
            if (result.ok) void removeKudoImage(result.path);
            return current;
          }
          if (!result.ok) {
            setErrors((currentErrors) => [...currentErrors, `${file.name}: ${result.error}`]);
            return current.filter((image) => image.id !== id);
          }
          return current.map((image) =>
            image.id === id
              ? { id, url: result.publicUrl, path: result.path, status: "done" as const }
              : image,
          );
        });
      });
  }

  function handleRemove(id: string) {
    onChange((current) => {
      const target = current.find((image) => image.id === id);
      if (target?.status === "done" && target.path) void removeKudoImage(target.path);
      else if (target?.status === "uploading") URL.revokeObjectURL(target.url);
      return current.filter((image) => image.id !== id);
    });
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {value.map((image) => (
          <div
            key={image.id}
            className="relative h-20 w-20 shrink-0 rounded-[18px] border border-gold-line bg-white p-0.5"
          >
            <div className="relative h-full w-full overflow-hidden rounded border border-gold">
              {image.status === "uploading" ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob: preview, not eligible for next/image optimization
                <img src={image.url} alt="" className="h-full w-full object-cover opacity-50" />
              ) : (
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              )}
              {image.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent"
                  />
                </div>
              )}
            </div>
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
            <li key={message} role="alert" className="text-sm font-bold text-danger">
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
