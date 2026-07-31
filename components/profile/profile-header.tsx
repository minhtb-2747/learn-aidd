import KudosAvatar from "@/components/kudos/kudos-avatar";
import HeroBadge from "@/components/kudos/hero-badge";
import type { ProfilePerson } from "@/lib/profile/types";

export interface ProfileHeaderProps {
  person: ProfilePerson;
}

/**
 * Profile hero block: a large avatar overlapping the keyvisual banner, plus
 * name, department and `HeroBadge`. Sits on `bg-ink` rather than the cream card
 * background `KudosPersonInfo` uses, hence its own text styling instead of
 * reusing that component.
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
