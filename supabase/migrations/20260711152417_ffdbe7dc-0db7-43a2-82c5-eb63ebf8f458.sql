-- Storage policies for vendor-images bucket
DROP POLICY IF EXISTS "Vendors can upload to their own folder" ON storage.objects;
CREATE POLICY "Vendors can upload to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vendor-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Vendors can update their own files" ON storage.objects;
CREATE POLICY "Vendors can update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vendor-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Vendors can delete their own files" ON storage.objects;
CREATE POLICY "Vendors can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vendor-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can read vendor-images" ON storage.objects;
CREATE POLICY "Anyone can read vendor-images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'vendor-images');
