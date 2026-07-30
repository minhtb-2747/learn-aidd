-- =============================================================================
-- Aggregate the Spotlight board's per-receiver counts in the DATABASE
-- =============================================================================
-- THE BUG this fixes (silent wrongness, not an error):
--   `getSpotlightData()` used to `select("receiver_id, created_at")` over ALL
--   published kudos and aggregate in TypeScript. PostgREST caps every response
--   at `max_rows = 1000` (supabase/config.toml). Past 1000 published kudos the
--   response is TRUNCATED with no error and no indication — so the word-cloud
--   counts would quietly start under-reporting. Aggregating server-side means
--   one row per receiver, so the cap is no longer reachable by kudos volume.
--
-- `security_invoker = true` is essential: it makes the view execute with the
-- QUERYING role's privileges, so `kudos_select` RLS still applies through the
-- view. Without it the view would run as its owner and leak non-published rows.
-- =============================================================================

CREATE VIEW public.spotlight_receiver_counts
WITH (security_invoker = true) AS
SELECT
    k.receiver_id,
    count(*)::bigint     AS kudos_count,
    max(k.created_at)    AS last_received_at
FROM public.kudos k
WHERE k.status = 'published'
  AND k.deleted_at IS NULL
GROUP BY k.receiver_id;

COMMENT ON VIEW public.spotlight_receiver_counts IS
  'Per-receiver published-kudos totals for the Spotlight board. Aggregated in SQL so PostgREST''s max_rows cap cannot silently truncate the counts. security_invoker=true keeps kudos_select RLS in force.';

-- Read-only exposure, matching the underlying table's access.
GRANT SELECT ON public.spotlight_receiver_counts TO anon, authenticated, service_role;
