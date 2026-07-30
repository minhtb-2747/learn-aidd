import { cn } from "@/lib/utils/cn.utils";

export interface KudosAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Neutral avatar placeholder: a gold-bordered initials circle. The Figma
 * design pulls real Gmail profile photos for every avatar (MM_MEDIA_Avatar);
 * per the implementation scope we substitute a neutral placeholder instead
 * of shipping anyone's real photo as mock UI data.
 */
export default function KudosAvatar({ name, size = 64, className }: KudosAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white/70 bg-gold-line/30 font-bold text-gold",
        className,
      )}
    >
      {initials}
    </span>
  );
}
