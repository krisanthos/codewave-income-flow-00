-- Drop all existing RLS policies on profiles table
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create clean, simple RLS policies without recursion
CREATE POLICY "profile_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profile_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profile_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create admin policies using JWT email claim to avoid recursion
CREATE POLICY "profile_admin_select_all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' IN ('sebestianarchibald@gmail.com', 'victorycrisantos@gmail.com')
);

CREATE POLICY "profile_admin_update_all" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.jwt() ->> 'email' IN ('sebestianarchibald@gmail.com', 'victorycrisantos@gmail.com')
);