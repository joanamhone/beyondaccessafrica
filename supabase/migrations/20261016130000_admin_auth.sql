/*
# Admin authentication via Supabase Auth

## Summary
Admins sign in with Supabase email/password auth. Being signed in is not
enough to manage content: the user's id must also be listed in `admin_users`.

## New Tables
- `admin_users` — one row per admin, keyed by `auth.users.id`.

## New Functions
- `is_admin()` — true when the current signed-in user is in `admin_users`.
  SECURITY DEFINER so policies can call it without exposing `admin_users`.

## Security
- `admin_users`: RLS on; a signed-in user can only see their own row (used by
  the frontend to check admin status). No client-side writes — admins are added
  via the SQL editor / dashboard.
- `guides`: admins can read every guide (including unpublished drafts) and
  insert, update and delete. Existing public read policy is unchanged.

## Adding an admin
1. Dashboard → Authentication → Users → Add user (email + password, auto-confirm).
2. Run:
     INSERT INTO admin_users (user_id)
     SELECT id FROM auth.users WHERE email = 'admin@example.com';
*/

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_read_own" ON admin_users;
CREATE POLICY "admin_users_read_own" ON admin_users
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- is_admin()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- guides: admin management
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_read_all_guides" ON guides;
CREATE POLICY "admin_read_all_guides" ON guides
  FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "admin_insert_guides" ON guides;
CREATE POLICY "admin_insert_guides" ON guides
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "admin_update_guides" ON guides;
CREATE POLICY "admin_update_guides" ON guides
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "admin_delete_guides" ON guides;
CREATE POLICY "admin_delete_guides" ON guides
  FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
