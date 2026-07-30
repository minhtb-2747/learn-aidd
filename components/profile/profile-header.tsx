import KudosAvatar from "@/components/kudos/kudos-avatar";
import HeroBadge from "@/components/kudos/hero-badge";
import type { ProfilePerson } from "@/lib/profile/types";

export interface ProfileHeaderProps {
  person: ProfilePerson;
}

/**
 * Profile hero block (MoMorph spec `A.1`/`A.2`), shared by the viewer's own
 * profile and anyone else's: a large avatar that overlaps the keyvisual banner
 * above it, the Sunner's name, department and recognition-tier `HeroBadge`.
 * Sits on `bg-ink` (not the cream card background `KudosPersonInfo` uses), so
 * its own name/department text styling is defined here rather than reusing
 * that component.
 *
 * The star row was removed at the user's request — it restated in glyphs what
 * `HeroBadge` already says in words. `starsForBadge` stays in
 * `lib/kudos/hero-tier.ts` because `lib/kudos/queries/people.ts` still feeds
 * the hover-card from it.
 */
export default function ProfileHeader({ person }: ProfileHeaderProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
      <KudosAvatar
        name={person.name}
        size={200}
        className="border-4 text-5xl"
      />
      {/* Gold, matching every other screen title in the system (KUDOS,
          HIGHLIGHT KUDOS) — the name is this screen's title. */}
      <h1 className="mt-2 text-3xl leading-11 font-bold text-gold sm:text-4xl">
        {person.name}
      </h1>
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-7 font-bold text-white">
          {person.department}
        </span>
        <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden="true" />
        <HeroBadge badge={person.badge} />
      </div>
    </div>
  );
}
