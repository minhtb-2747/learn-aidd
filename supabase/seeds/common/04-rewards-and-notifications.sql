-- =============================================================================
-- Seed: secret_boxes + notifications
-- =============================================================================
-- LOCAL DEVELOPMENT ONLY. Loaded automatically by `npx supabase db reset`.
--
-- Neither table has a natural unique key, so each insert is guarded by
-- "only run if the table is still empty" — a safe no-op on a second bare
-- `psql -f` run against an already-seeded database.
--
-- secret_boxes: SENDER_SECTION rule (lib/kudos/rules-content.ts) is "every 5
-- hearts received on kudos you sent earns 1 Secret Box". seed03 collects all
-- 6 collectible icons (opened_at 1-6 days ago, distinct badges) so the
-- profile screen's 6-icon slot UI has a fully-unlocked example; seed04/06/08
-- /11 have partial opened counts; several users have only unopened boxes.
-- 16 opened rows total (>= 12 required) with distinct opened_at, so the
-- board sidebar's 10-row "newest gift recipients" leaderboard has 10 real,
-- orderable rows.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- secret_boxes
-- -----------------------------------------------------------------------------
WITH users_map(no, id) AS (
  SELECT (regexp_replace(email, '^seed(\d+)@seed\.local$', '\1'))::int, id
  FROM auth.users
  WHERE email ~ '^seed\d+@seed\.local$'
),
box_rows(seed_no, user_no, badge_name, is_opened, days_ago) AS (
  VALUES
    -- seed03: all 6 collectibles opened -> fully-unlocked profile example
    (1, 3, 'REVIVAL'::varchar, true, 1::int),
    (2, 3, 'TOUCH OF LIGHT', true, 2),
    (3, 3, 'STAY GOLD', true, 3),
    (4, 3, 'FLOW TO HORIZON', true, 4),
    (5, 3, 'BEYOND THE BOUNDARY', true, 5),
    (6, 3, 'ROOT FURTHER', true, 6),
    -- partial collectors
    (7, 4, 'REVIVAL', true, 7),
    (8, 4, 'STAY GOLD', true, 8),
    (9, 4, 'ROOT FURTHER', true, 9),
    (10, 6, 'TOUCH OF LIGHT', true, 10),
    (11, 6, 'FLOW TO HORIZON', true, 11),
    (12, 6, 'BEYOND THE BOUNDARY', true, 12),
    (13, 6, 'REVIVAL', true, 13),
    (14, 8, 'STAY GOLD', true, 14),
    (15, 8, 'ROOT FURTHER', true, 15),
    (16, 11, 'REVIVAL', true, 16),
    -- unopened boxes (mystery — no badge assigned until opened)
    (17, 4, NULL, false, NULL),
    (18, 8, NULL, false, NULL),
    (19, 8, NULL, false, NULL),
    (20, 11, NULL, false, NULL),
    (21, 5, NULL, false, NULL),
    (22, 5, NULL, false, NULL),
    (23, 5, NULL, false, NULL),
    (24, 10, NULL, false, NULL),
    (25, 10, NULL, false, NULL),
    (26, 15, NULL, false, NULL),
    (27, 15, NULL, false, NULL),
    (28, 20, NULL, false, NULL),
    (29, 25, NULL, false, NULL),
    (30, 2, NULL, false, NULL),
    (31, 7, NULL, false, NULL),
    (32, 7, NULL, false, NULL),
    (33, 9, NULL, false, NULL),
    (34, 13, NULL, false, NULL),
    (35, 17, NULL, false, NULL)
)
INSERT INTO public.secret_boxes (user_id, badge_id, is_opened, opened_at, created_at)
SELECT
  um.id,
  b.id,
  br.is_opened,
  CASE WHEN br.is_opened THEN now() - br.days_ago * interval '1 day' ELSE NULL END,
  CASE WHEN br.is_opened THEN now() - (br.days_ago + 1) * interval '1 day' ELSE now() - interval '1 day' END
FROM box_rows br
JOIN users_map um ON um.no = br.user_no
LEFT JOIN public.badges b ON b.name = br.badge_name
WHERE NOT EXISTS (SELECT 1 FROM public.secret_boxes LIMIT 1);

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
-- seed05 gets 3 unread rows so the header bell badge lights up with a
-- realistic count > 1. reference_type/reference_id are resolved dynamically
-- against each user's actual received kudos / opened secret boxes rather
-- than assumed ids.
WITH users_map(no, id) AS (
  SELECT (regexp_replace(email, '^seed(\d+)@seed\.local$', '\1'))::int, id
  FROM auth.users
  WHERE email ~ '^seed\d+@seed\.local$'
),
rows_in(user_no, ntype, title, content, reference_type, ref_offset, is_read, hours_ago) AS (
  VALUES
    (5, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một đồng đội vừa gửi lời tri ân đến bạn.', 'kudos', 0, false, 2),
    (5, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Thêm một lời cảm ơn nữa dành cho bạn.', 'kudos', 1, false, 26),
    (5, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Cả team đang rất ấn tượng với bạn.', 'kudos', 2, true, 50),
    (5, 'like_received', 'Kudos của bạn được yêu thích', 'Kudos bạn nhận được vừa có thêm lượt tim mới.', 'kudos', 3, false, 5),
    (5, 'system', 'Chào mừng đến Sun* Kudos', 'Hãy lan tỏa những lời cảm ơn đến đồng đội nhé!', NULL, NULL, true, 200),
    (10, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một lời cảm ơn mới đã đến với bạn.', 'kudos', 0, true, 80),
    (10, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Đồng đội đang ghi nhận nỗ lực của bạn.', 'kudos', 1, false, 12),
    (10, 'mention', 'Bạn được nhắc đến trong một Kudos', 'Ai đó vừa nhắc tên bạn trong lời cảm ơn.', 'kudos', 2, false, 18),
    (15, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một lời tri ân mới dành cho bạn.', 'kudos', 0, false, 9),
    (15, 'system', 'Cập nhật Sun* Kudos', 'Tính năng Secret Box đã được cập nhật.', NULL, NULL, true, 150),
    (3, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon REVIVAL!', 'secret_box', 0, true, 25),
    (3, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon TOUCH OF LIGHT!', 'secret_box', 1, true, 49),
    (3, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon STAY GOLD!', 'secret_box', 2, false, 73),
    (4, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon REVIVAL!', 'secret_box', 0, false, 169),
    (8, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một đồng đội gửi lời cảm ơn đến bạn.', 'kudos', 0, true, 300),
    (8, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon STAY GOLD!', 'secret_box', 0, false, 337),
    (8, 'box_received', 'Bạn vừa mở một Secret Box', 'Chúc mừng bạn nhận được icon ROOT FURTHER!', 'secret_box', 1, false, 361),
    (25, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một lời cảm ơn mới đã đến.', 'kudos', 0, false, 15),
    (25, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Đồng đội đang rất trân trọng bạn.', 'kudos', 1, true, 40),
    (30, 'kudo_received', 'Bạn vừa nhận Kudos mới', 'Một lời cảm ơn mới đã đến với bạn.', 'kudos', 0, false, 6)
)
INSERT INTO public.notifications (user_id, type, title, content, reference_type, reference_id, is_read, created_at)
SELECT
  um.id,
  r.ntype,
  r.title,
  r.content,
  r.reference_type,
  CASE r.reference_type
    WHEN 'kudos' THEN (
      SELECT k.id FROM public.kudos k
      WHERE k.receiver_id = um.id AND k.status = 'published'
      ORDER BY k.id OFFSET r.ref_offset LIMIT 1
    )
    WHEN 'secret_box' THEN (
      SELECT sb.id FROM public.secret_boxes sb
      WHERE sb.user_id = um.id AND sb.is_opened
      ORDER BY sb.opened_at DESC OFFSET r.ref_offset LIMIT 1
    )
    ELSE NULL
  END,
  r.is_read,
  now() - r.hours_ago * interval '1 hour'
FROM rows_in r
JOIN users_map um ON um.no = r.user_no
WHERE NOT EXISTS (SELECT 1 FROM public.notifications LIMIT 1);
