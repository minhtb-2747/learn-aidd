import Link from "next/link";
import { StarIcon } from "@/icons";
import { starsForBadge, type KudosPerson } from "@/lib/kudos/mock-data";
import KudosAvatar from "./kudos-avatar";
import HeroBadge from "./hero-badge";
import ProfileHoverCard from "./profile-hover-card";

export interface KudosPersonInfoProps {
  person: KudosPerson;
}

/**
 * Sender/receiver info block shared by the highlight card and feed post
 * (spec B.3.2/B.3.6/C.3.1/C.3.3): avatar, name, department, star rating
 * ("hoa thị"), and recognition-tier badge — all rendered on the cards'
 * cream (`#FFF8E1`) background, so text stays dark (`text-ink`).
 */
export default function KudosPersonInfo({ person }: KudosPersonInfoProps) {
  const stars = starsForBadge(person.badge);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      {/* Hover → mini-profile card; click → the person's profile page.
          Mock — every person resolves to the same demo profile. */}
      <ProfileHoverCard
        person={person}
        className="flex w-full flex-col items-center"
      >
        <Link
          href="/profile/demo"
          className="flex w-full flex-col items-center gap-2 rounded transition-opacity duration-150 hover:opacity-80"
        >
          <KudosAvatar name={person.name} size={64} />
          <p className="w-full truncate text-base leading-6 font-bold text-ink">
            {person.name}
          </p>
        </Link>
      </ProfileHoverCard>
      <p className="text-sm leading-5 font-bold text-black/50">
        {person.department}
      </p>
      {/* Decorative: the recognition tier is already conveyed by the badge
          text below, so the star row is hidden from assistive tech (avoids a
          redundant, hard-to-localize "N stars" label). */}
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: stars }, (_, index) => (
          <StarIcon key={index} className="h-3.5 w-3.5 shrink-0 text-gold" />
        ))}
      </div>
      <HeroBadge badge={person.badge} />
    </div>
  );
}
