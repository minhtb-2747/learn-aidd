-- =============================================================================
-- Seed: reference data (departments, badges, hashtags, campaigns, awards)
-- =============================================================================
-- LOCAL DEVELOPMENT ONLY. This file is loaded automatically by
-- `npx supabase db reset` via `[db.seed] sql_paths` in supabase/config.toml.
-- It must never be pointed at a remote/hosted project.
--
-- Idempotency: all inserts here use ON CONFLICT DO NOTHING (departments,
-- badges, hashtags, award_categories have unique columns) or a
-- "table already has rows" guard (campaigns, which has no unique column),
-- so re-running this file after a partial/duplicate run is a safe no-op.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- departments
-- -----------------------------------------------------------------------------
INSERT INTO public.departments (name) VALUES
  ('BOD'),
  ('CEVC1'),
  ('CEVC2'),
  ('CEVC3'),
  ('CEVC10'),
  ('OPD'),
  ('Infra')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- badges
-- -----------------------------------------------------------------------------
-- Two families share this table:
--   1) The 4 Hero-tier badges (lib/kudos/rules-content.ts::HERO_TIERS) — names
--      must match the UI exactly. Assets exist under public/images/kudos/.
--   2) The 6 Secret Box collectible icons
--      (lib/kudos/rules-content.ts::COLLECTIBLE_ICONS) — no image assets exist
--      for these, so image_url is left NULL and the UI renders a styled
--      placeholder. drop_rate across the 6 collectibles sums to 100 (they are
--      the actual secret-box prize pool); the 4 hero badges are earned
--      deterministically by sender count, not "dropped", so their drop_rate
--      values are nominal/illustrative only.
INSERT INTO public.badges (name, description, image_url, drop_rate) VALUES
  ('New Hero', 'Có 1-4 người gửi Kudos cho bạn', '/images/kudos/badge-new-hero.svg', 40.00),
  ('Rising Hero', 'Có 5-9 người gửi Kudos cho bạn', '/images/kudos/badge-rising-hero.svg', 25.00),
  ('Super Hero', 'Có 10-20 người gửi Kudos cho bạn', '/images/kudos/badge-super-hero.svg', 15.00),
  ('Legend Hero', 'Có hơn 20 người gửi Kudos cho bạn', '/images/kudos/badge-legend-hero.svg', 5.00),
  ('REVIVAL', 'Secret Box collectible icon', NULL, 30.00),
  ('TOUCH OF LIGHT', 'Secret Box collectible icon', NULL, 22.00),
  ('STAY GOLD', 'Secret Box collectible icon', NULL, 18.00),
  ('FLOW TO HORIZON', 'Secret Box collectible icon', NULL, 15.00),
  ('BEYOND THE BOUNDARY', 'Secret Box collectible icon', NULL, 10.00),
  ('ROOT FURTHER', 'Secret Box collectible icon', NULL, 5.00)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- hashtags
-- -----------------------------------------------------------------------------
INSERT INTO public.hashtags (name) VALUES
  ('Dedicated'),
  ('Inspiring'),
  ('Teamwork'),
  ('Creative'),
  ('Supportive'),
  ('ProblemSolver'),
  ('GoTheExtraMile'),
  ('Mentor'),
  ('Reliable'),
  ('Positive'),
  ('Innovative'),
  ('TeamPlayer')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- campaigns
-- -----------------------------------------------------------------------------
-- No unique column exists on campaigns, so guard the whole insert with a
-- "table is still empty" check instead of ON CONFLICT.
INSERT INTO public.campaigns (name, description, start_date, end_date, heart_multiplier, is_active)
SELECT * FROM (VALUES
  ('Tuần Lễ Tri Ân Nhân Đôi', 'Mọi lượt thả tim trong tuần này được tính x2 giá trị.', now() - interval '3 days', now() + interval '11 days', 2, true),
  ('Chiến Dịch Quý Trước', 'Chiến dịch tri ân đã kết thúc của quý trước.', now() - interval '90 days', now() - interval '60 days', 2, false)
) AS v(name, description, start_date, end_date, heart_multiplier, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns LIMIT 1);

-- -----------------------------------------------------------------------------
-- award_categories
-- -----------------------------------------------------------------------------
-- Matches award names whose assets exist under public/images/home/.
INSERT INTO public.award_categories (name, slug, description, quantity, unit_type, prize_value, image_url, display_order) VALUES
  ('MVP', 'mvp', 'Cá nhân xuất sắc nhất toàn công ty.', 1, 'individual', 50000000, '/images/home/award-name-mvp.png', 1),
  ('Best Manager', 'best-manager', 'Quản lý truyền cảm hứng và dẫn dắt đội nhóm tốt nhất.', 3, 'individual', 20000000, '/images/home/award-name-best-manager.png', 2),
  ('Signature Creator', 'signature-creator', 'Cá nhân có dấu ấn sáng tạo nổi bật trong sản phẩm.', 5, 'individual', 10000000, '/images/home/award-name-signature-creator.png', 3),
  ('Top Project Leader', 'top-project-leader', 'Trưởng dự án dẫn dắt đội nhóm về đích xuất sắc.', 5, 'individual', 15000000, '/images/home/award-name-top-project-leader.png', 4),
  ('Top Project', 'top-project', 'Dự án tiêu biểu nhất trong năm.', 3, 'team', 30000000, '/images/home/award-name-top-project.png', 5),
  ('Top Talent', 'top-talent', 'Nhân tài trẻ có tiềm năng phát triển vượt trội.', 10, 'individual', 5000000, '/images/home/award-name-top-talent.png', 6)
ON CONFLICT (slug) DO NOTHING;
