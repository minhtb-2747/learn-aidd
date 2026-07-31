/**
 * Domain types for Sun* Kudos, backed by the real Supabase schema.
 *
 * This is the single source of truth for the view-model shapes the Kudos and
 * profile screens render. Rows are turned into these objects by
 * `./kudos-mapper.ts`, and every value reaching a client component is one of
 * these plain, serializable types — never a raw Supabase row (which would leak
 * columns like `sender_id`, `role` or `deleted_at` across the boundary).
 */

/** Sender/receiver info shown on a kudos card or profile header. */
export interface KudosPerson {
  /** Real profile id for navigation/hover-card lookups; `null` for an anonymous sender. */
  profileId: string | null;
  name: string;
  department: string;
  /** Recognition-tier badge shown next to the name, e.g. "Legend Hero". Empty string when the person has no tier yet. */
  badge: string;
  /** Total published kudos this person has received — feeds `ProfileHoverCard`. */
  kudosReceived: number;
  /** Total kudos this person has sent — feeds `ProfileHoverCard`. */
  kudosSent: number;
}

export interface HighlightKudos {
  /** Stringified `kudos.id` (bigint) so existing `key` usage is untouched. */
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  time: string;
  /** Danh hiệu (honor title) shown as a pill, e.g. "IDOL GIỚI TRẺ". */
  title: string;
  content: string;
  hashtags: string[];
  likes: number;
  /** Whether the current session user has already liked this kudos — real initial state for the heart button. */
  likedByCurrentUser: boolean;
}

export interface KudosPost {
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  time: string;
  title: string;
  content: string;
  hashtags: string[];
  /** Gallery thumbnail srcs, max 5. */
  images: string[];
  likes: number;
  likedByCurrentUser: boolean;
}

export interface LeaderboardEntry {
  name: string;
  description: string;
}

/** Sidebar stats block — renamed from `SidebarStats` (mock), same fields. */
export interface KudosStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

/** One entry in the spotlight word-cloud, before the seeded layout math places it on the canvas. */
export interface SpotlightEntry {
  profileId: string | null;
  name: string;
  kudosCount: number;
  /** Display-formatted receipt time (see `format-kudos-time.ts`'s `formatTickerTime`). */
  receivedAt: string;
}

/** One line in the "recent activity" ticker. */
export interface TickerLine {
  id: string;
  time: string;
  name: string;
}
