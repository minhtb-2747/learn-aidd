import type { HighlightKudos, KudosPerson, KudosPost } from "@/lib/kudos/types";
import type { PersonMeta } from "@/lib/kudos/queries/people";
import { formatKudosTime } from "@/lib/kudos/format-kudos-time";

const ANONYMOUS_LABEL = "Ẩn danh";
const IMAGE_CAP = 5;

/**
 * Canonical row shape produced by `KUDOS_SELECT` (kudos-feed.ts) — shared by
 * the board feed and the profile sent/received lists so there is exactly one
 * row→view-model mapping in the codebase.
 */
export interface KudosRow {
  id: number;
  sender_id: string;
  receiver_id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  status: string;
  like_count: number;
  created_at: string;
  kudo_hashtags: { hashtags: { name: string } | null }[] | null;
  kudo_images: { image_url: string; display_order: number }[] | null;
}

/**
 * The one anonymous-kudos rule, in the one place it can go wrong: when
 * `profileId` is `null` the result carries only the (possibly-fallback)
 * anonymous name, every other field blanked/zeroed, and no `profileId` —
 * this is the single spot a mapping bug could de-anonymise a sender.
 */
export function toKudosPerson(
  profileId: string | null,
  meta: PersonMeta | undefined,
  options?: { anonymousName?: string | null },
): KudosPerson {
  if (profileId === null) {
    return {
      profileId: null,
      name: options?.anonymousName || ANONYMOUS_LABEL,
      department: "",
      badge: "",
      kudosReceived: 0,
      kudosSent: 0,
    };
  }

  return {
    profileId,
    name: meta?.name ?? "",
    department: meta?.department ?? "",
    badge: meta?.badge ?? "",
    kudosReceived: meta?.kudosReceived ?? 0,
    kudosSent: meta?.kudosSent ?? 0,
  };
}

function resolveSender(
  row: KudosRow,
  peopleMeta: Map<string, PersonMeta>,
): KudosPerson {
  return row.is_anonymous
    ? toKudosPerson(null, undefined, { anonymousName: row.anonymous_name })
    : toKudosPerson(row.sender_id, peopleMeta.get(row.sender_id));
}

function resolveHashtags(row: KudosRow): string[] {
  return (row.kudo_hashtags ?? [])
    .map((link) => link.hashtags?.name)
    .filter((name): name is string => Boolean(name));
}

function resolveImages(row: KudosRow): string[] {
  return (row.kudo_images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, IMAGE_CAP)
    .map((image) => image.image_url);
}

export function toHighlightKudos(
  row: KudosRow,
  peopleMeta: Map<string, PersonMeta>,
  likedByCurrentUser: Set<string>,
): HighlightKudos {
  const id = String(row.id);
  return {
    id,
    sender: resolveSender(row, peopleMeta),
    receiver: toKudosPerson(row.receiver_id, peopleMeta.get(row.receiver_id)),
    time: formatKudosTime(row.created_at),
    title: row.title,
    content: row.content,
    hashtags: resolveHashtags(row),
    likes: row.like_count,
    likedByCurrentUser: likedByCurrentUser.has(id),
  };
}

export function toKudosPost(
  row: KudosRow,
  peopleMeta: Map<string, PersonMeta>,
  likedByCurrentUser: Set<string>,
): KudosPost {
  return {
    ...toHighlightKudos(row, peopleMeta, likedByCurrentUser),
    images: resolveImages(row),
  };
}
