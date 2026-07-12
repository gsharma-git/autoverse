-- Allow admin users to upload/manage files in the vendor-images bucket
-- Products go to vendor-images/products/
-- Dealers go to vendor-images/dealers/

-- Allow admins to upload (insert) into vendor-images bucket
create policy "Admin can upload to vendor-images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'vendor-images'
    and (
      -- Check the user has admin role
      exists (
        select 1 from public.user_roles
        where user_id = auth.uid()
          and role::text = 'admin'
      )
    )
  );

-- Allow admins to update files in vendor-images bucket
create policy "Admin can update vendor-images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'vendor-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role::text = 'admin'
    )
  );

-- Allow admins to delete files in vendor-images bucket
create policy "Admin can delete from vendor-images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'vendor-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role::text = 'admin'
    )
  );

-- Ensure bucket is public so uploaded images are accessible without auth
update storage.buckets
set public = true
where id = 'vendor-images';
