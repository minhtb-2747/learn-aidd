import Link from "next/link";
import type { KudosPerson } from "@/lib/kudos/types";
import KudosAvatar from "./kudos-avatar";
import HeroBadge from "./hero-badge";
import ProfileHoverCard from "./profile-hover-card";

export interface KudosPersonInfoProps {
  person: KudosPerson;
}

/**
 * Sender/receiver block shared by the highlight card and feed post: avatar,
 * name, department, tier badge. Always on the cards' cream background, so text
 * stays dark.
 *
 * `person.profileId === null` marks an anonymous sender — nothing to open or
 * preview, so name and avatar render as plain text with no `Link`/hover card,
 * and department/badge are omitted.
 */
export default function KudosPersonInfo({ person }: KudosPersonInfoProps) {
  const isAnonymous = person.profileId === null;

  const avatarAndName = (
    <>
      <KudosAvatar name={person.name} size={64} />
      <p className="w-full truncate text-lg leading-7 font-bold text-ink">
        {person.name}
      </p>
    </>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      {isAnonymous ? (
        <div className="flex w-full flex-col items-center gap-2">
          {avatarAndName}
        </div>
      ) : (
        <ProfileHoverCard
          person={person}
          className="flex w-full flex-col items-center"
        >
          <Link
            href={`/profile/${person.profileId}`}
            className="flex w-full flex-col items-center gap-2 rounded transition-opacity duration-150 hover:opacity-80"
          >
            {avatarAndName}
          </Link>
        </ProfileHoverCard>
      )}
      {/* Department and tier badge share one line, separated by a bullet, per
          the design — they read as a single "who they are" caption.
          The bullet only appears when there is actually a badge to separate:
          someone with no kudos received yet has no tier, and an unconditional
          separator left a dangling "CEVC10 ·" on the card. */}
      {!isAnonymous && (
        <div className="flex max-w-full items-center justify-center gap-2">
          {/* #999999 per the design export — `text-black/50` over the cream
              card resolved warmer and read as a different grey. */}
          <span className="truncate text-sm leading-5 font-bold text-[#999999]">
            {person.department}
          </span>
          {person.badge && (
            <>
              <span aria-hidden="true" className="text-[#999999]/40">
                •
              </span>
              <HeroBadge badge={person.badge} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
