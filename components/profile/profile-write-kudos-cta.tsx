"use client";

import { PenIcon } from "@/icons";
import { useKudosModals } from "@/components/kudos/kudos-modals-provider";

export interface ProfileWriteKudosCtaProps {
  recipientId: string;
  recipientName: string;
  /** Pre-translated on the page, e.g. "Gửi lời cảm ơn và ghi nhận tới An". */
  label: string;
}

/**
 * "Gửi lời cảm ơn…" pill, shown only on someone else's profile; opens the
 * shared Write dialog with them preselected.
 *
 * Its own client component purely to cross the server/client boundary for
 * `useKudosModals` — the page is a server component and the label arrives
 * already translated, so this stays presentational.
 */
export default function ProfileWriteKudosCta({
  recipientId,
  recipientName,
  label,
}: ProfileWriteKudosCtaProps) {
  const { openWrite } = useKudosModals();

  return (
    <button
      type="button"
      onClick={() => openWrite({ recipientId, recipient: recipientName })}
      className="mx-auto flex h-18 w-full max-w-170 cursor-pointer items-center justify-center gap-4 rounded-full border border-gold-line bg-gold/10 px-8 text-base leading-6 font-bold text-white transition-colors duration-150 hover:bg-gold/20"
    >
      <PenIcon className="h-6 w-6 shrink-0" />
      {label}
    </button>
  );
}
