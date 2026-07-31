-- =============================================================================
-- Allow reading OPENED secret boxes across users
-- =============================================================================
-- This is the one policy that is an addition rather than a recovery.
--
-- Why: the Kudos board sidebar renders the "newest gift recipients" leaderboard
-- (spec item D.3) — other people's rewards, by definition. The recovered
-- `secret_boxes_select` policy is scoped to `user_id = auth.uid()`, so that
-- query returns an empty list for everyone. The leaderboard cannot be built
-- without widening SELECT.
--
-- Scope of the widening: OPENED boxes only. An unopened box is still a
-- surprise and stays private to its owner, which is the whole point of the
-- Secret Box mechanic. The pre-existing owner-scoped `secret_boxes_select`
-- policy is left in place — PostgreSQL ORs permissive policies together, so
-- owners keep seeing their own unopened boxes while everyone sees opened ones.
--
-- What is exposed: `user_id` and `badge_id` (display keys already visible on
-- the board) plus `opened_at`. No INSERT/UPDATE/DELETE policy is added —
-- box creation and opening are not app-facing in this build.
-- =============================================================================

CREATE POLICY secret_boxes_select_opened
    ON public.secret_boxes FOR SELECT
    USING (is_opened = true);
