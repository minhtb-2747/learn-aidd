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
 * "Gửi lời cảm ơn và ghi nhận tới …" pill, shown only on someone else's
 * profile. Opens the shared Write-Kudos dialog with this person already
 * selected as the recipient.
 *
 * Exists as its own client component purely to cross the server/client
 * boundary for `useKudosModals` — the profile page itself is a server
 * component, and the label arrives already translated so this stays
 * presentational.
 *
 * Measurements come from the design export (680×72): fill `#FFEA9E` at 10%
 * over a 1px `#998C5F` stroke — the same "ghost pill" as the Spotlight search
 * field and `SentFilter`, hence the shared `bg-gold/10` / `border-gold-line`
 * tokens rather than one-off hex values.
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
