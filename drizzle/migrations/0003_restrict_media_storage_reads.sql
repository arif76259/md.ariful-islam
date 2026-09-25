DROP POLICY IF EXISTS "media anon read" ON storage.objects;
CREATE POLICY "media admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());