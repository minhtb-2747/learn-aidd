-- =============================================================================
-- Auth → profile bridge
-- =============================================================================
-- Kept separate from the initial schema because it reaches into the `auth`
-- schema, which Supabase owns. Recovered from the previously-running local
-- stack; see the note at the head of 20260421000000_initial_schema.sql.
--
-- Deviation from the recovered original: `SET search_path = public` is added.
-- A SECURITY DEFINER function with a mutable search_path can be steered by its
-- caller; pinning it closes that vector. Behaviour is unchanged.
--
-- This is what makes Google sign-in work end-to-end: GoTrue inserts the row in
-- `auth.users`, and this trigger materialises the matching `public.profiles`
-- row that every screen reads from. Without it, a freshly signed-in user has a
-- session but no profile, and the app renders as if they did not exist.
-- =============================================================================

-- Google returns `full_name`/`name` and `avatar_url`/`picture` in
-- `raw_user_meta_data`; email sign-ups may supply neither, hence the ''
-- fallbacks (`profiles.full_name` is NOT NULL).
CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
