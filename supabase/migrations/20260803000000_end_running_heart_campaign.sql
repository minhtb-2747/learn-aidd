-- End any running x2-hearts campaign, so a like is worth exactly 1 heart.
--
-- `getActiveCampaign()` (lib/kudos/queries/engagement.ts) matches a campaign
-- only when `is_active` AND `start_date <= now() <= end_date`. Statement 1 alone
-- is enough to stop it matching; statement 2 closes the date window as well, so
-- flipping the flag back on its own cannot silently restart the x2 weeks.
--
-- Why `end_date = now()` rather than a date far in the past: likes already
-- recorded at `heart_value = 2` were made INSIDE this window, and pulling
-- `start_date` backwards would leave them unexplained — hearts worth double
-- while no campaign was running. Ending the window today keeps that history
-- coherent and leaves `kudos.like_count` untouched.
--
-- Both statements are idempotent and match nothing on a `campaigns` table that
-- is empty or already settled. Only campaigns that have already started have
-- their `end_date` moved, so `chk_campaign_dates (start_date < end_date)` holds.

UPDATE public.campaigns
   SET is_active = false
 WHERE is_active;

UPDATE public.campaigns
   SET end_date = now()
 WHERE deleted_at IS NULL
   AND start_date < now()
   AND end_date > now();
