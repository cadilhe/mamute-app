-- Migration: Add email field to profiles and configure admin RLS policies for user management
-- Version: 004

-- 1. Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Sync existing emails from auth.users to profiles
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 4. Enable RLS on profiles (usually already enabled) and add admin policies
-- (Assuming profiles table already has RLS enabled)

-- Allow super administrators to create new profiles
DROP POLICY IF EXISTS "admin_insert_profiles" ON profiles;
CREATE POLICY "admin_insert_profiles" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL
  ));

-- Allow super administrators to update any profile
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL
  ));

-- Allow super administrators to delete any profile
DROP POLICY IF EXISTS "admin_delete_profiles" ON profiles;
CREATE POLICY "admin_delete_profiles" ON profiles
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'teacher' AND unit_id IS NULL
  ));
