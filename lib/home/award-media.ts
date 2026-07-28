/**
 * Per-award orb media metadata (stylized name badge + its intrinsic
 * dimensions) extracted from the Figma design. Single source of truth shared by
 * the homepage "Hệ thống giải thưởng" grid (`components/home/awards-section.tsx`)
 * and the Award System screen (`components/award-system/award-detail-list.tsx`).
 *
 * Copy is NOT here — each consumer resolves title/description from its own i18n
 * namespace (HomePage vs AwardSystem) keyed by `msgKey`.
 */
export const AWARD_MEDIA = [
  {
    slug: "top-talent",
    msgKey: "topTalent",
    nameImageSrc: "/images/home/award-name-top-talent.png",
    nameImageWidth: 221,
    nameImageHeight: 35,
  },
  {
    slug: "top-project",
    msgKey: "topProject",
    nameImageSrc: "/images/home/award-name-top-project.png",
    nameImageWidth: 232,
    nameImageHeight: 35,
  },
  {
    slug: "top-project-leader",
    msgKey: "topProjectLeader",
    nameImageSrc: "/images/home/award-name-top-project-leader.png",
    nameImageWidth: 232,
    nameImageHeight: 64,
  },
  {
    slug: "best-manager",
    msgKey: "bestManager",
    nameImageSrc: "/images/home/award-name-best-manager.png",
    nameImageWidth: 232,
    nameImageHeight: 30,
  },
  {
    slug: "signature-2025-creator",
    msgKey: "signatureCreator",
    nameImageSrc: "/images/home/award-name-signature-creator.png",
    nameImageWidth: 232,
    nameImageHeight: 54,
  },
  {
    slug: "mvp",
    msgKey: "mvp",
    nameImageSrc: "/images/home/award-name-mvp.png",
    nameImageWidth: 116,
    nameImageHeight: 52,
  },
] as const;
