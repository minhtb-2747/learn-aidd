/**
 * Copy + local mock data for the Kudos "Thể lệ" (Rules) panel.
 *
 * Transcribed verbatim from the MoMorph design (frame `Thể lệ UPDATE`,
 * node 3204:6052 "Thể Lệ", screenId `b1Filzi9i6`). Vietnamese text lives
 * here as local literals — this screen has no i18n key set assigned yet,
 * matching the precedent in `./spotlight-names.ts`.
 *
 * Two of the design's six collectible-icon assets and all four hero-tier
 * pill backgrounds are composite/sprite Figma renders with no clean single
 * image export (some `MM_MEDIA_*` nodes returned no download URL at all).
 * Per this build's presentational-mock scope, `kudos-rules-panel.tsx`
 * renders all ten as styled gradient placeholders (circle/pill + caption)
 * instead of downloaded assets — see the component's top comment.
 */

/** Panel heading (node 3204:6055). */
export const RULES_PANEL_TITLE = "Thể lệ";

export interface HeroTier {
  id: string;
  /** Badge pill label (e.g. "New Hero"). */
  badgeLabel: string;
  /** Kudos-received range copy (e.g. "Có 1-4 người gửi Kudos cho bạn"). */
  rangeLabel: string;
  /** Flavor description shown under the range. */
  description: string;
}

/** Section 1 — "Người nhận" (node 3204:6131): the 4 Hero badge tiers. */
export const RECEIVER_SECTION = {
  title: "NGƯỜI NHẬN KUDOS: HUY HIỆU HERO CHO NHỮNG ẢNH HƯỞNG TÍCH CỰC",
  intro:
    "Dựa trên số lượng đồng đội gửi trao Kudos, bạn sẽ sở hữu Huy hiệu Hero tương ứng, được hiển thị trực tiếp cạnh tên profile",
} as const;

export const HERO_TIERS: HeroTier[] = [
  {
    id: "new-hero",
    badgeLabel: "New Hero",
    rangeLabel: "Có 1-4 người gửi Kudos cho bạn",
    description:
      "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
  },
  {
    id: "rising-hero",
    badgeLabel: "Rising Hero",
    rangeLabel: "Có 5-9 người gửi Kudos cho bạn",
    description:
      "Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.",
  },
  {
    id: "super-hero",
    badgeLabel: "Super Hero",
    rangeLabel: "Có 10–20 người gửi Kudos cho bạn",
    description:
      "Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.",
  },
  {
    id: "legend-hero",
    badgeLabel: "Legend Hero",
    rangeLabel: "Có hơn 20 người gửi Kudos cho bạn",
    description:
      "Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.",
  },
];

/** Section 2 — "Người gửi" (node 3204:6076/3204:6077-6089): the 6-icon collection. */
export const SENDER_SECTION = {
  title: "NGƯỜI GỬI KUDOS: SƯU TẬP TRỌN BỘ 6 ICON, NHẬN NGAY PHẦN QUÀ BÍ ẨN",
  intro:
    "Mỗi lời Kudos bạn gửi sẽ được đăng tải trên hệ thống và nhận về những lượt ❤️ từ cộng đồng Sunner. Cứ mỗi 5 lượt ❤️, bạn sẽ được mở 1 Secret Box, với cơ hội nhận về một trong 6 icon độc quyền của SAA.",
  closing:
    "Những Sunner thu thập trọn bộ 6 icon sẽ nhận về một phần quà bí ẩn từ SAA 2025.",
} as const;

export interface CollectibleIcon {
  id: string;
  /** Caption under the thumbnail — the icon's name (node `*_Badge {NAME}`). */
  caption: string;
}

/** The 6 Secret Box collectible icons (nodes 3204:6082/6087/6086/6083/6084/6088), 3x2 grid. */
export const COLLECTIBLE_ICONS: CollectibleIcon[] = [
  { id: "revival", caption: "REVIVAL" },
  { id: "touch-of-light", caption: "TOUCH OF LIGHT" },
  { id: "stay-gold", caption: "STAY GOLD" },
  { id: "flow-to-horizon", caption: "FLOW TO HORIZON" },
  { id: "beyond-the-boundary", caption: "BEYOND THE BOUNDARY" },
  { id: "root-further", caption: "ROOT FURTHER" },
];

/** Section 3 — "KUDOS QUỐC DÂN" (nodes 3204:6090/6091). */
export const NATIONAL_KUDOS_SECTION = {
  title: "KUDOS QUỐC DÂN",
  body: "5 Kudos nhận về nhiều ❤️ nhất toàn Sun* sẽ chính thức trở thành Kudos Quốc Dân và được trao phần quà đặc biệt từ SAA 2025: Root Further.",
} as const;

/** Footer buttons (nodes 3204:6093 "B.1_Button đóng" / 3204:6094 "B.2_Button viết kudos"). */
export const RULES_PANEL_FOOTER = {
  closeLabel: "Đóng",
  writeKudosLabel: "Viết KUDOS",
} as const;
