import type { CollectionIcon } from "@/lib/profile/types";

export interface IconCollectionProps {
  icons: CollectionIcon[];
  title: string;
}

/**
 * "Bộ sưu tập icon của tôi" row (MoMorph spec `A.3`): 6 circular slots, one
 * per Secret Box icon. Per spec `A`'s description ("Nếu chưa có icon nào thì
 * để icon xám" — show a gray icon while none is unlocked yet), every slot in
 * the mock data starts locked, so this renders plain gray placeholder
 * circles rather than any invented icon artwork.
 */
export default function IconCollection({ icons, title }: IconCollectionProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {icons.map((icon, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="h-16 w-16 shrink-0 rounded-full border-2 border-white bg-[#323231]"
            data-unlocked={icon.unlocked}
          />
        ))}
      </div>
      <p className="text-xl leading-7 font-bold text-white">{title}</p>
    </div>
  );
}
