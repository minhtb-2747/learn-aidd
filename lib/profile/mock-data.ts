import type { KudosPost } from "@/lib/kudos/mock-data";

/**
 * Mock content for the "Profile bản thân" (Sunner Profile) screen (MoMorph
 * frame `362:5037`, screenId `3FoIx6ALVb`). There is no backend yet, so every
 * value below is lifted verbatim from the Figma design content (name, dept,
 * badge, stat numbers, post copy, hashtags) — matching the sibling
 * `lib/kudos/mock-data.ts` convention of local literals for user-generated
 * content and design-authored labels.
 */

export interface ProfilePerson {
  name: string;
  department: string;
  /** Recognition-tier badge shown next to the name (spec `A.2`), e.g. "Legend Hero". */
  badge: string;
}

export interface ProfileStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

/** One "Bộ sưu tập icon của tôi" slot (spec `A.3`) — locked/gray until the matching Secret Box icon is unlocked. */
export interface CollectionIcon {
  unlocked: boolean;
}

/** One post in the "KUDOS" list (spec `D`), wrapping the shared `KudosPost` shape with the profile-only "Spam" tag (spec `D.3.1`). */
export interface ProfileKudosPost {
  post: KudosPost;
  isSpam: boolean;
}

/** Spec `A` — the logged-in Sunner's own profile info. */
export const profilePerson: ProfilePerson = {
  name: "Huỳnh Dương Xuân Nhật",
  department: "CEVC3",
  badge: "Legend Hero",
};

/** Spec `B.1`–`B.5` — every counter is "25" except the first ("Số kudos bạn nhận được" = 5). */
export const profileStats: ProfileStats = {
  kudosReceived: 5,
  kudosSent: 25,
  heartsReceived: 25,
  boxesOpened: 25,
  boxesUnopened: 25,
};

/** Spec `A.3` — the design shows all 6 slots as the same locked/gray placeholder (no icon unlocked yet). */
export const collectionIcons: CollectionIcon[] = Array.from({ length: 6 }, () => ({
  unlocked: false,
}));

const PROFILE_PERSON_AS_SENDER = {
  name: profilePerson.name,
  department: profilePerson.department,
  badge: profilePerson.badge,
};

const RECEIVER = {
  name: "Huỳnh Dương Xuân",
  department: "CEVC10",
  badge: "Legend Hero",
};

const POST_TIME = "10:00 - 10/30/2025";
const POST_CONTENT =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";
const POST_HASHTAGS = ["Dedicated", "Inspring"];
const GALLERY_IMAGE = "/images/kudos/gallery-sample.png";

/**
 * Spec `D` — 4 post cards; the design instances the first two from the "KUDO
 * spam" component variant (spec `D.3.1` "Spam" status badge, orange), the
 * last two from the plain "KUDO" variant.
 */
export const profileKudosPosts: ProfileKudosPost[] = [true, true, false, false].map(
  (isSpam, index) => ({
    isSpam,
    post: {
      id: `profile-post-${index + 1}`,
      sender: PROFILE_PERSON_AS_SENDER,
      receiver: RECEIVER,
      time: POST_TIME,
      title: "IDOL GIỚI TRẺ",
      content: POST_CONTENT,
      hashtags: POST_HASHTAGS,
      images: Array.from({ length: 5 }, () => GALLERY_IMAGE),
      likes: 1000,
    },
  }),
);

/**
 * "Đã gửi (5)" / "Đã nhận (N)" filter counts (spec `C.3`). Only "Đã gửi"'s
 * count (5) comes from the design text; "Đã nhận" has no equivalent frame in
 * this screen so it's a plain mock number, per the profile-page build scope
 * ("switch the count label" is enough interaction — no separate received-post
 * dataset exists in the design to swap in).
 */
export const sentFilterCount = 5;
export const receivedFilterCount = 12;
