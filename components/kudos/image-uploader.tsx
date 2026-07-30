"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn.utils";
import { CloseIcon, PlusIcon } from "./hashtag-input";

const SAMPLE_IMAGE = "/images/kudos/gallery-sample.png";

interface UploadedImage {
  id: string;
  src: string;
}

export interface ImageUploaderProps {
  label: string;
  addLabel: string;
  maxLabel: string;
  max?: number;
  className?: string;
}

/**
 * "Image" gallery field (MoMorph spec F, node `520:9896`) — MOCK upload:
 * pre-filled with sample thumbnails (each removable via the red corner
 * badge) plus a "+ Image / Tối đa {max}" tile. There's no real file
 * picker in this build's scope, so the add tile appends another sample
 * thumbnail (up to `max`) to demonstrate the flow instead of a no-op.
 */
export default function ImageUploader({
  label,
  addLabel,
  maxLabel,
  max = 5,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([
    { id: "sample-1", src: SAMPLE_IMAGE },
    { id: "sample-2", src: SAMPLE_IMAGE },
  ]);
  const idCounter = useRef(images.length);

  function handleAdd() {
    if (images.length >= max) return;
    idCounter.current += 1;
    setImages((current) => [...current, { id: `sample-${idCounter.current}`, src: SAMPLE_IMAGE }]);
  }

  function handleRemove(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative h-20 w-20 shrink-0 rounded-[18px] border border-gold-line bg-white p-0.5"
          >
            <div className="relative h-full w-full overflow-hidden rounded border border-gold">
              <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <button
              type="button"
              aria-label="Xóa ảnh"
              onClick={() => handleRemove(image.id)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-12 items-center gap-1 rounded-lg border border-gold-line bg-white px-2 py-1.5 text-black/50 transition-colors hover:bg-gold/10"
          >
            <PlusIcon className="h-6 w-6 text-ink" />
            <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px]">
              <span>{addLabel}</span>
              <span>{maxLabel}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
