import KudosPostCard, {
  type KudosPostCardProps,
} from "@/components/kudos/kudos-post";

export interface ProfileKudosCardProps extends KudosPostCardProps {
  /** Renders the red "Spam" tag badge in the card's top-right corner (MoMorph spec `D.3.1`). */
  isSpam: boolean;
  spamLabel: string;
}

/**
 * Thin wrapper around the shared `KudosPostCard` that adds the profile-only
 * "Spam" status badge (spec `D.3.1`, orange `#FF8104` pill). Kept as a
 * separate wrapper — rather than editing `kudos-post.tsx` — since that file
 * is shared, read-only reuse per this task's file-ownership scope.
 */
export default function ProfileKudosCard({
  isSpam,
  spamLabel,
  ...cardProps
}: ProfileKudosCardProps) {
  return (
    <div className="relative">
      {isSpam && (
        <span className="absolute top-6 right-6 z-10 rounded bg-[#FF8104] px-4 py-2 text-base leading-6 font-bold tracking-[0.5px] text-white">
          {spamLabel}
        </span>
      )}
      <KudosPostCard {...cardProps} />
    </div>
  );
}
