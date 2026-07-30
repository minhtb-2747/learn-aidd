-- =============================================================================
-- Seed: 32 Sunners (auth.users -> trigger-created profiles -> UPDATE)
-- =============================================================================
-- LOCAL DEVELOPMENT ONLY. Loaded automatically by `npx supabase db reset`.
--
-- `public.handle_new_user()` fires AFTER INSERT ON auth.users and creates the
-- matching `public.profiles` row from `raw_user_meta_data`. We therefore never
-- INSERT into profiles directly — we insert auth.users (which the trigger
-- turns into a bare profile row), then UPDATE profiles to attach
-- department/role/locale/avatar.
--
-- auth.users rows carry NO real password. `encrypted_password` below is a
-- fixed, meaningless bcrypt-shaped placeholder — these seed identities are
-- never expected to log in with a password; real login is Google OAuth.
-- Emails use the non-routable `@seed.local` domain and the pattern
-- `seedNN@seed.local`, which later seed files rely on (via regexp) to look
-- up a user's profile id without hardcoding UUIDs again.
--
-- Deterministic ids: '00000000-0000-4000-8000-0000000000NN' (NN = 01..32).
-- Idempotency: `ON CONFLICT (id) DO NOTHING` on the auth.users insert (so the
-- trigger never double-fires on a re-run); the profiles UPDATE is naturally
-- idempotent.
--
-- Demo identity for manual verification: seed01@seed.local
-- (00000000-0000-4000-8000-000000000001, "Nguyễn Văn An", role=admin).
-- =============================================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'seed01@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Nguyễn Văn An'), now() - interval '200 days', now() - interval '200 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'seed02@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Trần Thị Bình'), now() - interval '199 days', now() - interval '199 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'seed03@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Lê Hoàng Cường'), now() - interval '198 days', now() - interval '198 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'seed04@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Phạm Thị Dung'), now() - interval '197 days', now() - interval '197 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'seed05@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Hoàng Văn Đức'), now() - interval '196 days', now() - interval '196 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'seed06@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Đỗ Thị Hoa'), now() - interval '195 days', now() - interval '195 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'seed07@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Vũ Minh Khôi'), now() - interval '194 days', now() - interval '194 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'seed08@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Bùi Thị Lan'), now() - interval '193 days', now() - interval '193 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'seed09@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Ngô Văn Long'), now() - interval '192 days', now() - interval '192 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'seed10@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Đặng Thị Mai'), now() - interval '191 days', now() - interval '191 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000011', 'authenticated', 'authenticated', 'seed11@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Dương Văn Nam'), now() - interval '190 days', now() - interval '190 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000012', 'authenticated', 'authenticated', 'seed12@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Lý Thị Oanh'), now() - interval '189 days', now() - interval '189 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000013', 'authenticated', 'authenticated', 'seed13@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Phan Văn Phúc'), now() - interval '188 days', now() - interval '188 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000014', 'authenticated', 'authenticated', 'seed14@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Trịnh Thị Quỳnh'), now() - interval '187 days', now() - interval '187 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000015', 'authenticated', 'authenticated', 'seed15@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Đinh Văn Sơn'), now() - interval '186 days', now() - interval '186 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000016', 'authenticated', 'authenticated', 'seed16@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Tô Thị Thảo'), now() - interval '185 days', now() - interval '185 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000017', 'authenticated', 'authenticated', 'seed17@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Mai Văn Tùng'), now() - interval '184 days', now() - interval '184 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000018', 'authenticated', 'authenticated', 'seed18@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Chu Thị Uyên'), now() - interval '183 days', now() - interval '183 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000019', 'authenticated', 'authenticated', 'seed19@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Hà Văn Việt'), now() - interval '182 days', now() - interval '182 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000020', 'authenticated', 'authenticated', 'seed20@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Lương Thị Xuân'), now() - interval '181 days', now() - interval '181 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000021', 'authenticated', 'authenticated', 'seed21@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Vương Văn Yên'), now() - interval '180 days', now() - interval '180 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000022', 'authenticated', 'authenticated', 'seed22@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Cao Thị Ánh'), now() - interval '179 days', now() - interval '179 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000023', 'authenticated', 'authenticated', 'seed23@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Kiều Văn Bảo'), now() - interval '178 days', now() - interval '178 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000024', 'authenticated', 'authenticated', 'seed24@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Tạ Thị Cẩm'), now() - interval '177 days', now() - interval '177 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000025', 'authenticated', 'authenticated', 'seed25@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Đoàn Văn Duy'), now() - interval '176 days', now() - interval '176 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000026', 'authenticated', 'authenticated', 'seed26@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Nguyễn Thị Giang'), now() - interval '175 days', now() - interval '175 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000027', 'authenticated', 'authenticated', 'seed27@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Trần Văn Hải'), now() - interval '174 days', now() - interval '174 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000028', 'authenticated', 'authenticated', 'seed28@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Lê Thị Huyền'), now() - interval '173 days', now() - interval '173 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000029', 'authenticated', 'authenticated', 'seed29@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Phạm Văn Khang'), now() - interval '172 days', now() - interval '172 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000030', 'authenticated', 'authenticated', 'seed30@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Hoàng Thị Linh'), now() - interval '171 days', now() - interval '171 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000031', 'authenticated', 'authenticated', 'seed31@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Vũ Văn Minh'), now() - interval '170 days', now() - interval '170 days'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000032', 'authenticated', 'authenticated', 'seed32@seed.local', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Ffh0ir9d1t6qz.7VlAP7Pjxs0v1G2', now(), '{"provider":"google","providers":["google"]}', jsonb_build_object('full_name', 'Bùi Thị Ngọc'), now() - interval '169 days', now() - interval '169 days')
ON CONFLICT (id) DO NOTHING;

-- GoTrue compatibility: its Go models scan these columns into plain `string`,
-- so a NULL makes the auth service fail with
--   "Scan error on column index 3, name \"confirmation_token\":
--    converting NULL to string is unsupported"
-- and EVERY GoTrue operation on the affected user 500s (admin generate_link,
-- token refresh, magic link, ...). The INSERT above omits these columns, so
-- they default to NULL — normalise them to empty strings here.
--
-- Real Google sign-ups are unaffected (GoTrue writes those rows itself); this
-- only matters for users injected directly by seed SQL. Keep this in sync if
-- the column list above ever changes.
UPDATE auth.users
SET confirmation_token     = coalesce(confirmation_token, ''),
    recovery_token         = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change           = coalesce(email_change, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change IS NULL;

-- Attach department/role/locale; force avatar_url to NULL so the KudosAvatar
-- initials fallback (components/kudos/kudos-avatar.tsx) renders for everyone
-- (no external avatar image assets exist to seed with).
WITH updates(seed_no, dept_name, urole, locale) AS (
  VALUES
    (1, 'BOD', 'admin', 'vi'),
    (2, 'CEVC1', 'admin', 'vi'),
    (3, 'CEVC1', 'user', 'vi'),
    (4, 'CEVC2', 'user', 'vi'),
    (5, 'CEVC2', 'user', 'vi'),
    (6, 'CEVC3', 'user', 'en'),
    (7, 'CEVC3', 'user', 'vi'),
    (8, 'CEVC10', 'user', 'vi'),
    (9, 'CEVC10', 'user', 'vi'),
    (10, 'OPD', 'user', 'vi'),
    (11, 'OPD', 'user', 'vi'),
    (12, 'Infra', 'user', 'vi'),
    (13, 'Infra', 'user', 'en'),
    (14, 'BOD', 'user', 'vi'),
    (15, 'CEVC1', 'user', 'vi'),
    (16, 'CEVC1', 'user', 'vi'),
    (17, 'CEVC2', 'user', 'vi'),
    (18, 'CEVC2', 'user', 'vi'),
    (19, 'CEVC3', 'user', 'vi'),
    (20, 'CEVC3', 'user', 'en'),
    (21, 'CEVC10', 'user', 'vi'),
    (22, 'CEVC10', 'user', 'vi'),
    (23, 'OPD', 'user', 'vi'),
    (24, 'OPD', 'user', 'vi'),
    (25, 'Infra', 'user', 'vi'),
    (26, 'Infra', 'user', 'vi'),
    (27, 'BOD', 'user', 'en'),
    (28, 'CEVC1', 'user', 'vi'),
    (29, 'CEVC2', 'user', 'vi'),
    (30, 'CEVC3', 'user', 'vi'),
    (31, 'CEVC10', 'user', 'vi'),
    (32, 'OPD', 'user', 'vi')
)
UPDATE public.profiles p
SET department_id = d.id,
    role = u.urole,
    locale = u.locale,
    avatar_url = NULL
FROM updates u
JOIN public.departments d ON d.name = u.dept_name
JOIN auth.users au ON au.email = 'seed' || lpad(u.seed_no::text, 2, '0') || '@seed.local'
WHERE p.id = au.id;
