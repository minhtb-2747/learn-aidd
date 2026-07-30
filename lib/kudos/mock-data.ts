/**
 * Mock content for the Sun* Kudos "Live board" screen (MoMorph frame
 * `2940:13431`, screenId `MaZUn5xHXZ`). There is no backend yet — every
 * value below is either lifted verbatim from the Figma design content (post
 * copy, times, hashtags, stat numbers, leaderboard names/descriptions) or,
 * for the one leaderboard the design node doesn't include ("10 SUNNER CÓ SỰ
 * THĂNG HẠNG MỚI NHẤT" — spec item `D` names it but the frame tree has no
 * `D.2` node), derived from the badge-tier vocabulary ("New Hero" → "Legend
 * Hero") that IS present elsewhere in the same design. Names/post bodies are
 * user-generated content in the real product, so — matching the sibling
 * `lib/kudos/spotlight-names.ts` mock module — they stay as plain literals
 * here rather than i18n keys; only UI chrome (labels, buttons) is localized.
 */

export interface KudosPerson {
  name: string;
  department: string;
  /** Recognition-tier badge shown next to the name, e.g. "Legend Hero". */
  badge: string;
}

/**
 * Star count ("số hoa thị") for a badge tier, per spec B.3.2's hover-tooltip
 * rule: 1 star = 10 Kudos received, 2 = 20, 3 = 50+. The design only
 * documents 3 tiers of stars, so "Legend Hero" (the top tier) caps at 3.
 */
export function starsForBadge(badge: string): number {
  const tier: Record<string, number> = {
    "New Hero": 1,
    "Rising Hero": 2,
    "Super Hero": 3,
    "Legend Hero": 3,
  };
  return tier[badge] ?? 1;
}

export interface HighlightKudos {
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  time: string;
  /** Danh hiệu (honor title) shown as a pill, e.g. "IDOL GIỚI TRẺ". */
  title: string;
  content: string;
  hashtags: string[];
  likes: number;
}

export interface KudosPost {
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  time: string;
  /** Danh hiệu (honor title) shown as a centered pill, e.g. "IDOL GIỚI TRẺ". */
  title: string;
  content: string;
  hashtags: string[];
  /** Gallery thumbnail srcs, max 5 per C.3.6 spec. */
  images: string[];
  likes: number;
}

export interface LeaderboardEntry {
  name: string;
  description: string;
}

export interface SidebarStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

const HUYNH_DUONG_XUAN_NHAT: KudosPerson = {
  name: "Huỳnh Dương Xuân Nhật",
  department: "CEVC10",
  badge: "New Hero",
};

const HUYNH_DUONG_XUAN_RECEIVER: KudosPerson = {
  name: "Huỳnh Dương Xuân",
  department: "CEVC10",
  badge: "Legend Hero",
};

const KUDOS_TIME = "10:00 - 10/30/2025";
const KUDOS_CONTENT =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";
const KUDOS_HASHTAGS = ["Dedicated", "Inspring"];
const GALLERY_IMAGE = "/images/kudos/gallery-sample.png";

/** "HIGHLIGHT KUDOS" carousel — spec B.2 calls for the top 5 by like count. */
export const highlightKudos: HighlightKudos[] = (
  ["New Hero", "Rising Hero", "Super Hero", "Super Hero", "Rising Hero"] as const
).map((badge, index) => ({
  id: `highlight-${index + 1}`,
  sender: { ...HUYNH_DUONG_XUAN_NHAT, badge },
  receiver: HUYNH_DUONG_XUAN_RECEIVER,
  time: KUDOS_TIME,
  title: "IDOL GIỚI TRẺ",
  content: KUDOS_CONTENT,
  hashtags: KUDOS_HASHTAGS,
  likes: 1000,
}));

/** "ALL KUDOS" feed — the design frame renders exactly 4 post cards (C.3/C.5/C.6/C.7). */
export const allKudosPosts: KudosPost[] = (
  ["New Hero", "Rising Hero", "Super Hero", "Super Hero"] as const
).map((badge, index) => ({
  id: `post-${index + 1}`,
  sender: { ...HUYNH_DUONG_XUAN_NHAT, badge },
  receiver: HUYNH_DUONG_XUAN_RECEIVER,
  time: KUDOS_TIME,
  title: "IDOL GIỚI TRẺ",
  content: KUDOS_CONTENT,
  hashtags: KUDOS_HASHTAGS,
  images: Array.from({ length: 5 }, () => GALLERY_IMAGE),
  likes: 1000,
}));

/** Sidebar stats block (D.1) — design shows "25" for every counter. */
export const sidebarStats: SidebarStats = {
  kudosReceived: 25,
  kudosSent: 25,
  heartsReceived: 25,
  boxesOpened: 25,
  boxesUnopened: 25,
};

/** "10 SUNNER NHẬN QUÀ MỚI NHẤT" (D.3) — 10 rows; the design repeats the same placeholder row, and the list scrolls within the sidebar card. */
export const giftRecipients: LeaderboardEntry[] = Array.from({ length: 10 }, () => ({
  name: "Huỳnh Dương Xuân",
  description: "Nhận được 1 áo phông SAA",
}));

/** Highlight-carousel "Hashtag" filter options (B.1.1) — per the design dropdown. */
export const hashtagFilterOptions = ["#Dedicated", "#Inspring"];

/** Highlight-carousel "Phòng ban" filter options (B.1.2) — per the design dropdown. */
export const departmentFilterOptions = [
  "CEVC2",
  "CEVC3",
  "CEVC4",
  "CEVC1",
  "OPD",
  "Infra",
];
