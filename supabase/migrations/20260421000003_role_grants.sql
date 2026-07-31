-- =============================================================================
-- Explicit role grants for the API roles
-- =============================================================================
-- WHY THIS EXISTS (do not delete it as redundant):
--
-- Postgres table privileges and RLS are two independent gates. A request must
-- pass BOTH: the role needs a table-level GRANT, and then the row must satisfy
-- an RLS policy. Enabling RLS with perfect policies achieves nothing if the
-- role has no GRANT — PostgREST returns
-- `42501 permission denied for table ...` before any policy is consulted.
--
-- The trap: this database has two different sets of default privileges for
-- schema `public` (see `pg_default_acl`).
--   • tables created by `supabase_admin` → anon/authenticated/service_role get
--     arwdDxtm (i.e. INSERT/SELECT/UPDATE/DELETE + the rest)
--   • tables created by `postgres`       → they get only Dxtm
--     (TRUNCATE/REFERENCES/TRIGGER/MAINTAIN) — notably NO SELECT
--
-- The Supabase CLI applies migrations as `postgres`, so tables created by a
-- migration land in the SECOND category and are unreadable by the API roles.
-- The stack these tables were recovered from had them created by
-- `supabase_admin`, which is why it worked there; `pg_dump` then emitted only
-- the delta against default privileges, so the recovered DDL carried no hint
-- that SELECT was ever needed.
--
-- Granting explicitly makes the schema self-contained: it no longer matters
-- which role applies these migrations, locally or hosted.
--
-- SECURITY: these grants are deliberately coarse; RLS remains the row-level
-- authorization boundary. `anon` gets SELECT only. `authenticated` gets DML,
-- but every write is still gated by a policy that pins the row to
-- `auth.uid()` (e.g. `kudos_insert` requires `sender_id = auth.uid()`,
-- `kudo_likes_insert` requires `user_id = auth.uid()`), and tables with no
-- INSERT/UPDATE policy reject those verbs outright.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Existing tables/sequences (this form is a snapshot, hence it runs after the
-- migrations that create them).
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- `authenticated` needs sequence USAGE to insert into the bigserial-keyed
-- tables (kudos, kudo_likes, kudo_hashtags, ...).
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Future tables created by `postgres` (i.e. by any later migration) inherit the
-- same grants, so this trap cannot silently reappear.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
