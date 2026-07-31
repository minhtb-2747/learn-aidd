-- =============================================================================
-- Storage: `kudo-images` bucket + object policies
-- =============================================================================
-- Transcribed from the live bucket/policy snapshot taken before the orphaned
-- `ssa-2025-ex` stack was stopped:
--   plans/260730-1458-google-oauth-and-supabase-data/research/storage-contract-snapshot.txt
--
-- Bucket is intentionally PUBLIC-read: kudo gallery images are rendered by
-- <Image> straight from the CDN URL, so no signed-URL round-trip is needed.
-- Writes stay authenticated AND owner-scoped.
--
-- Ownership convention (load-bearing — phase 09 upload paths depend on it):
-- every object must be stored under a top-level folder named with the
-- uploader's uid, i.e. `{auth.uid()}/{filename}`. The write policies enforce
-- this via `storage.foldername(name)[1]`, which is why they do NOT rely on the
-- `owner` column.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kudo-images',
    'kudo-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone (incl. anon) may read kudo images — the board is public once signed in
-- and the images carry no private data.
CREATE POLICY "Allow public read access to kudo-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'kudo-images');

CREATE POLICY "Allow authenticated users to upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'kudo-images'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );

CREATE POLICY "Allow users to update own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'kudo-images'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );

CREATE POLICY "Allow users to delete own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'kudo-images'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );
