-- =============================================================================
-- Seed: kudos + hashtags/mentions/images + likes (engagement)
-- =============================================================================
-- LOCAL DEVELOPMENT ONLY. Loaded automatically by `npx supabase db reset`.
--
-- Every user reference below resolves a `seedNN@seed.local` email (created in
-- 02-users-profiles.sql) to a profile id via a small regexp-based CTE, so
-- nothing here hardcodes a UUID.
--
-- `kudos` has no natural unique key, so the whole insert is guarded by
-- "only run if the table is still empty" (true on a fresh `db reset`; a
-- second bare `psql -f` run becomes a no-op). Child tables with a real unique
-- constraint (kudo_hashtags, kudo_mentions, kudo_likes) use
-- ON CONFLICT DO NOTHING instead, which is safe to run unconditionally.
--
-- Hero-tier engineering (lib/kudos/rules-content.ts::HERO_TIERS counts
-- DISTINCT SENDERS of PUBLISHED kudos per receiver):
--   seed05 (Hoàng Văn Đức)   receives from 22 distinct senders -> Legend (>20)
--   seed10 (Đặng Thị Mai)    receives from 12 distinct senders -> Super (10-20)
--   seed15 (Đinh Văn Sơn)    receives from  7 distinct senders -> Rising (5-9)
--   seed08, seed12, seed25, seed30  receive 1-4 distinct senders -> New Hero
--   seed31, seed32           receive ZERO published kudos       -> no badge
-- Every kudos row is inserted with an explicit seed_no (1..60) in a single
-- INSERT ... SELECT from a literal VALUES list; on a fresh, empty table this
-- guarantees kudos.id == seed_no (Postgres processes a VALUES source in
-- literal order with no sort/parallelism, and nextval() is called once per
-- row in that same order), which the like-skew step below relies on to pick
-- five specific "top" kudos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- kudos
-- -----------------------------------------------------------------------------
WITH users_map(no, id) AS (
  SELECT (regexp_replace(email, '^seed(\d+)@seed\.local$', '\1'))::int, id
  FROM auth.users
  WHERE email ~ '^seed\d+@seed\.local$'
),
pairs(seed_no, sender_no, receiver_no, status, is_anon, anon_name) AS (
  VALUES
    -- Legend tier: 22 distinct senders -> receiver 5
    (1, 1, 5, 'published', false, NULL::varchar),
    (2, 2, 5, 'published', true, 'Một đồng đội giấu tên'),
    (3, 3, 5, 'published', false, NULL),
    (4, 4, 5, 'published', false, NULL),
    (5, 6, 5, 'published', false, NULL),
    (6, 7, 5, 'published', false, NULL),
    (7, 8, 5, 'published', false, NULL),
    (8, 9, 5, 'published', false, NULL),
    (9, 10, 5, 'published', false, NULL),
    (10, 11, 5, 'published', false, NULL),
    (11, 12, 5, 'published', false, NULL),
    (12, 13, 5, 'published', false, NULL),
    (13, 14, 5, 'published', true, 'Người hâm mộ thầm lặng'),
    (14, 15, 5, 'published', false, NULL),
    (15, 16, 5, 'published', false, NULL),
    (16, 17, 5, 'published', false, NULL),
    (17, 18, 5, 'published', false, NULL),
    (18, 19, 5, 'published', false, NULL),
    (19, 20, 5, 'published', false, NULL),
    (20, 21, 5, 'published', false, NULL),
    (21, 22, 5, 'published', false, NULL),
    (22, 23, 5, 'published', false, NULL),
    -- Super tier: 12 distinct senders -> receiver 10
    (23, 21, 10, 'published', false, NULL),
    (24, 22, 10, 'published', false, NULL),
    (25, 23, 10, 'published', false, NULL),
    (26, 24, 10, 'published', false, NULL),
    (27, 25, 10, 'published', true, 'Fan cứng CEVC'),
    (28, 26, 10, 'published', false, NULL),
    (29, 27, 10, 'published', false, NULL),
    (30, 28, 10, 'published', false, NULL),
    (31, 29, 10, 'published', false, NULL),
    (32, 30, 10, 'published', false, NULL),
    (33, 31, 10, 'published', false, NULL),
    (34, 32, 10, 'published', false, NULL),
    -- Rising tier: 7 distinct senders -> receiver 15
    (35, 16, 15, 'published', false, NULL),
    (36, 17, 15, 'published', false, NULL),
    (37, 18, 15, 'published', false, NULL),
    (38, 19, 15, 'published', true, 'Ẩn danh Sun*'),
    (39, 20, 15, 'published', false, NULL),
    (40, 21, 15, 'published', false, NULL),
    (41, 22, 15, 'published', false, NULL),
    -- New Hero tier: 1-4 distinct senders across several receivers
    (42, 9, 8, 'published', false, NULL),
    (43, 11, 8, 'published', false, NULL),
    (44, 13, 12, 'published', false, NULL),
    (45, 26, 25, 'published', false, NULL),
    (46, 27, 25, 'published', true, 'Đồng đội bí mật'),
    (47, 28, 25, 'published', false, NULL),
    (48, 29, 25, 'published', false, NULL),
    (49, 31, 30, 'published', false, NULL),
    (50, 32, 30, 'published', false, NULL),
    (51, 1, 30, 'published', false, NULL),
    -- Organic extra kudos (breadth, still New Hero band for their receivers)
    (52, 14, 2, 'published', false, NULL),
    (53, 18, 3, 'published', false, NULL),
    (54, 24, 6, 'published', false, NULL),
    (55, 30, 9, 'published', false, NULL),
    -- Spam (sent by, not received by, the target) and hidden rows: excluded
    -- from published-only tier counts by design.
    (56, 1, 9, 'spam', false, NULL),
    (57, 3, 14, 'spam', false, NULL),
    (58, 7, 19, 'spam', false, NULL),
    (59, 2, 28, 'hidden', false, NULL),
    (60, 6, 17, 'hidden', false, NULL)
),
titles(idx, title) AS (
  VALUES
    (1, 'Ngôi Sao Cống Hiến'),
    (2, 'Đồng Đội Vàng'),
    (3, 'Người Truyền Cảm Hứng'),
    (4, 'Chiến Binh Deadline'),
    (5, 'Trái Tim Nhiệt Huyết'),
    (6, 'Bậc Thầy Giải Quyết Vấn Đề'),
    (7, 'Người Bạn Đáng Tin Cậy'),
    (8, 'Ngọn Lửa Sáng Tạo'),
    (9, 'Người Hùng Thầm Lặng'),
    (10, 'Cột Trụ Của Team'),
    (11, 'Tinh Thần Thép'),
    (12, 'Người Kết Nối Yêu Thương'),
    (13, 'Nhà Cố Vấn Tận Tâm'),
    (14, 'Ánh Sáng Của Dự Án')
),
contents(idx, content) AS (
  VALUES
    (1, 'Cảm ơn bạn đã luôn hỗ trợ team trong những lúc deadline gấp rút nhất, sự tận tâm của bạn thực sự truyền cảm hứng cho cả nhóm.'),
    (2, 'Không phải ai cũng sẵn sàng ở lại muộn để giúp đồng đội gỡ bug, nhưng bạn đã làm điều đó không chút than phiền. Cảm ơn bạn rất nhiều!'),
    (3, 'Sự tỉ mỉ và tinh thần trách nhiệm của bạn trong từng dòng code khiến cả team yên tâm hơn rất nhiều. Mong bạn tiếp tục phát huy nhé.'),
    (4, 'Bạn luôn là người đầu tiên giơ tay nhận việc khó, và luôn hoàn thành xuất sắc. Team thực sự may mắn khi có bạn đồng hành.'),
    (5, 'Cảm ơn vì những buổi review code đầy tâm huyết, những góp ý của bạn đã giúp mình trưởng thành hơn rất nhiều trong công việc.'),
    (6, 'Bạn là người luôn giữ tinh thần tích cực cho cả team, ngay cả khi dự án gặp nhiều khó khăn. Năng lượng đó thật sự quý giá.'),
    (7, 'Nhờ có bạn hướng dẫn tận tình mà mình đã vượt qua giai đoạn onboard đầy bỡ ngỡ. Cảm ơn bạn đã kiên nhẫn với một newbie như mình.'),
    (8, 'Ý tưởng sáng tạo của bạn trong buổi brainstorm hôm trước đã giúp cả team tìm ra hướng đi mới cho sản phẩm. Cảm ơn bạn rất nhiều.'),
    (9, 'Bạn luôn âm thầm hỗ trợ phía sau mà không cần ai ghi nhận, nhưng hôm nay mình muốn nói lời cảm ơn thật lòng đến bạn.'),
    (10, 'Sự chuyên nghiệp và tinh thần cầu tiến của bạn là tấm gương để cả phòng ban noi theo. Rất vui vì được làm việc cùng bạn.'),
    (11, 'Cảm ơn bạn đã luôn lắng nghe và chia sẻ mỗi khi mình gặp áp lực công việc. Có bạn ở đây khiến mọi thứ nhẹ nhàng hơn nhiều.'),
    (12, 'Bạn đã giúp team tiết kiệm không biết bao nhiêu thời gian nhờ automation script tự viết. Thật sự là một đóng góp tuyệt vời.'),
    (13, 'Mỗi lần gặp vấn đề khó, mình đều nghĩ ngay đến bạn vì biết chắc sẽ có hướng giải quyết. Cảm ơn vì sự đáng tin cậy đó.'),
    (14, 'Bạn đã đại diện cả team thuyết trình trước khách hàng vô cùng ấn tượng. Cảm ơn vì đã mang lại niềm tự hào cho cả phòng.')
)
INSERT INTO public.kudos (sender_id, receiver_id, title, content, is_anonymous, anonymous_name, status, created_at, updated_at)
SELECT
  su.id, ru.id, t.title, c.content, p.is_anon, p.anon_name, p.status,
  now() - ((p.seed_no * 37) % 42) * interval '1 day' - (p.seed_no % 20) * interval '1 hour' - ((p.seed_no * 13) % 60) * interval '1 minute',
  now() - ((p.seed_no * 37) % 42) * interval '1 day' - (p.seed_no % 20) * interval '1 hour' - ((p.seed_no * 13) % 60) * interval '1 minute'
FROM pairs p
JOIN users_map su ON su.no = p.sender_no
JOIN users_map ru ON ru.no = p.receiver_no
JOIN titles t ON t.idx = ((p.seed_no - 1) % 14) + 1
JOIN contents c ON c.idx = (((p.seed_no - 1) * 5) % 14) + 1
WHERE NOT EXISTS (SELECT 1 FROM public.kudos LIMIT 1);

-- -----------------------------------------------------------------------------
-- kudo_hashtags — 1-3 tags per kudo, uneven distribution (for the filter UI)
-- -----------------------------------------------------------------------------
INSERT INTO public.kudo_hashtags (kudo_id, hashtag_id)
SELECT k.id, h.id
FROM public.kudos k
JOIN public.hashtags h ON h.id = ((k.id % 12) + 1)
ON CONFLICT (kudo_id, hashtag_id) DO NOTHING;

INSERT INTO public.kudo_hashtags (kudo_id, hashtag_id)
SELECT k.id, h.id
FROM public.kudos k
JOIN public.hashtags h ON h.id = (((k.id + 5) % 12) + 1)
WHERE k.id % 3 = 0
ON CONFLICT (kudo_id, hashtag_id) DO NOTHING;

INSERT INTO public.kudo_hashtags (kudo_id, hashtag_id)
SELECT k.id, h.id
FROM public.kudos k
JOIN public.hashtags h ON h.id = (((k.id + 8) % 12) + 1)
WHERE k.id % 7 = 0
ON CONFLICT (kudo_id, hashtag_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- kudo_mentions — tag a third party (never the sender or receiver) on ~12 kudos
-- -----------------------------------------------------------------------------
WITH users_map(no, id) AS (
  SELECT (regexp_replace(email, '^seed(\d+)@seed\.local$', '\1'))::int, id
  FROM auth.users
  WHERE email ~ '^seed\d+@seed\.local$'
)
INSERT INTO public.kudo_mentions (kudo_id, mentioned_user_id)
SELECT k.id, um.id
FROM public.kudos k
JOIN users_map um ON um.no = (((k.id * 3) % 32) + 1)
WHERE k.id % 5 = 0
  AND um.id != k.sender_id
  AND um.id != k.receiver_id
ON CONFLICT (kudo_id, mentioned_user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- kudo_images — 1-5 images on ~a third of kudos; only real asset on disk
-- -----------------------------------------------------------------------------
INSERT INTO public.kudo_images (kudo_id, image_url, display_order)
SELECT k.id, '/images/kudos/gallery-sample.png', gs.ord - 1
FROM public.kudos k
CROSS JOIN LATERAL generate_series(1, 1 + (k.id % 5)) AS gs(ord)
WHERE k.id % 3 = 1
  AND NOT EXISTS (SELECT 1 FROM public.kudo_images LIMIT 1);

-- -----------------------------------------------------------------------------
-- kudo_likes — skewed distribution so the top-5 highlight carousel is a real
-- ranking with a visible gap to #6. Only PUBLISHED kudos get likes.
-- like_count itself is never written here: trg_update_like_count computes it
-- from these rows via heart_value.
-- -----------------------------------------------------------------------------
WITH users_map(no, id) AS (
  SELECT (regexp_replace(email, '^seed(\d+)@seed\.local$', '\1'))::int, id
  FROM auth.users
  WHERE email ~ '^seed\d+@seed\.local$'
),
-- seed_no 1, 23, 35, 46, 52 == kudos.id on a fresh reset (see header comment).
like_targets(seed_no, target_count) AS (
  VALUES (1, 28), (23, 23), (35, 18), (46, 14), (52, 12)
),
target_counts AS (
  SELECT k.id AS kid, COALESCE(lt.target_count, 3 + (k.id % 6)) AS target_count
  FROM public.kudos k
  LEFT JOIN like_targets lt ON lt.seed_no = k.id
  WHERE k.status = 'published'
),
candidates AS (
  SELECT
    tc.kid,
    tc.target_count,
    um.id AS liker_id,
    row_number() OVER (PARTITION BY tc.kid ORDER BY ((um.no + tc.kid * 7) % 32)) AS rn
  FROM target_counts tc
  JOIN public.kudos k ON k.id = tc.kid
  CROSS JOIN users_map um
  WHERE um.id != k.sender_id
)
INSERT INTO public.kudo_likes (kudo_id, user_id, heart_value, is_special_day, created_at)
SELECT
  c.kid,
  c.liker_id,
  -- Every like is worth 1: no campaign is seeded active (01-reference-data.sql),
  -- so an x2 row here would contradict the campaign table. Ranking is unaffected
  -- — it comes from `target_count`, not from the heart value.
  1,
  false,
  -- rn % 3 = 0 -> a "recent" like; the rest are spread over past weeks.
  CASE WHEN c.rn % 3 = 0
    THEN now() - (c.rn % 60) * interval '1 hour'
    ELSE now() - (5 + (c.rn % 35)) * interval '1 day'
  END
FROM candidates c
WHERE c.rn <= c.target_count
ON CONFLICT (kudo_id, user_id) DO NOTHING;

-- Guard: the like-count trigger must be the sole writer and must be correct.
DO $$
DECLARE
  mismatch_count int;
BEGIN
  SELECT count(*) INTO mismatch_count
  FROM (
    SELECT k.id
    FROM public.kudos k
    LEFT JOIN public.kudo_likes l ON l.kudo_id = k.id
    GROUP BY k.id, k.like_count
    HAVING k.like_count <> COALESCE(SUM(l.heart_value), 0)
  ) bad;

  IF mismatch_count > 0 THEN
    RAISE EXCEPTION 'kudos.like_count out of sync with kudo_likes for % row(s) — trg_update_like_count did not fire as expected', mismatch_count;
  END IF;
END $$;
