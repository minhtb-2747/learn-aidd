-- =============================================================================
-- Close a privilege-escalation hole on public.profiles
-- =============================================================================
-- THE BUG (reproduced before this migration existed):
--   A signed-in user could promote themselves to admin with one REST call:
--     PATCH /rest/v1/profiles?id=eq.<their own id>   {"role":"admin"}
--   → HTTP 200, `role` changed from 'user' to 'admin'.
--
-- WHY it was possible — two things had to line up:
--   1. The recovered `profiles_update` policy is
--        FOR UPDATE USING (auth.uid() = id)
--      with NO `WITH CHECK`. Postgres then defaults WITH CHECK to the USING
--      expression, so the policy only ever asks "is this YOUR row?" — never
--      "which COLUMNS may you change?". RLS is row-level; it cannot express
--      column-level intent.
--   2. `20260421000003_role_grants.sql` granted table-wide UPDATE to
--      `authenticated`, which is what made the policy's blind spot reachable.
--
-- THE FIX: column-level privileges, which is the correct tool for
-- "these columns, not those". Note a table-level GRANT would OVERRIDE column
-- grants, so the table-level UPDATE must be REVOKED first — granting columns
-- alongside a table-wide grant would be a no-op and a false sense of safety.
--
-- `role` is now unwritable by any client, so it can only be changed by a
-- privileged path (service_role / SQL / a future admin RPC with its own
-- authorization). `deleted_at` and `department_id` are likewise withheld:
-- soft-deletion and org structure are not the user's own to edit.
-- =============================================================================

REVOKE UPDATE ON public.profiles FROM anon, authenticated;

-- Only self-service display/preference fields. RLS's `auth.uid() = id` still
-- restricts this to the user's OWN row; these two gates are complementary —
-- the policy picks the row, these grants pick the columns.
GRANT UPDATE (full_name, avatar_url, locale) ON public.profiles TO authenticated;

-- Belt and braces: even if a future migration re-grants table-wide UPDATE,
-- this policy makes the intent explicit at the row level too. It cannot see
-- OLD values (RLS has no OLD), so it cannot itself pin `role` — the column
-- grants above are what actually enforce that.
COMMENT ON POLICY profiles_update ON public.profiles IS
  'Row gate only (own row). Column-level GRANTs in 20260730000001 are what prevent role/deleted_at/department_id from being client-writable.';
