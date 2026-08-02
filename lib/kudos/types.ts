/**
 * View-model shapes for the Kudos and profile screens. `./kudos-mapper.ts` turns
 * rows into these, and every value crossing to a client component is one of them
 * — never a raw Supabase row, which would leak columns like `sender_id`,
 * `role` or `deleted_at` across the boundary.
 */

/** Sender/receiver info shown on a kudos card or profile header. */
export interface KudosPerson {
  /** Real profile id for navigation/hover-card lookups; `null` for an anonymous sender. */
  profileId: string | null;
  name: string;
  department: string;
  /** Tier badge, e.g. "Legend Hero"; empty string when there is no tier yet. */
  badge: string;
  /** Total published kudos this person has received — feeds `ProfileHoverCard`. */
  kudosReceived: number;
  /** Total kudos this person has sent — feeds `ProfileHoverCard`. */
  kudosSent: number;
}

export interface HighlightKudos {
  /** Stringified `kudos.id` (bigint). */
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  time: string;
  /** Danh hiệu (honor title) shown as a pill, e.g. "IDOL GIỚI TRẺ". */
  title: string;
  content: string;
  hashtags: string[];
  likes: number;
  /** Seeds the heart button's initial state. */
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

/** Sidebar stats block. */
export interface KudosStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

/** One word-cloud entry, before the seeded layout places it. */
export interface SpotlightEntry {
  profileId: string | null;
  name: string;
  kudosCount: number;
  /** Display-formatted receipt time (`formatTickerTime`). */
  receivedAt: string;
}

/** One line in the "recent activity" ticker. */
export interface TickerLine {
  id: string;
  time: string;
  name: string;
}
