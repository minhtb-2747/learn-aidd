import KudosAvatar from "@/components/kudos/kudos-avatar";
import HeroBadge from "@/components/kudos/hero-badge";
import type { ProfilePerson } from "@/lib/profile/mock-data";

export interface ProfileHeaderProps {
  person: ProfilePerson;
}

/**
 * "Profile bản thân" hero block (MoMorph spec `A.1`/`A.2`): a large avatar
 * that overlaps the keyvisual banner above it, the Sunner's name, department,
 * and recognition-tier `HeroBadge`. Sits on `bg-ink` (not the cream card
 * background `KudosPersonInfo` uses), so its own name/department text
 * styling is defined here rather than reusing that component.
 */
export default function ProfileHeader({ person }: ProfileHeaderProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
      <KudosAvatar
        name={person.name}
        size={200}
        className="border-4 text-5xl"
      />
      <h1 className="mt-2 text-3xl leading-11 font-bold text-white sm:text-4xl">
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
