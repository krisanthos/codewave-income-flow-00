-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create simplified RLS policies without recursive references
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create admin policies using hardcoded admin emails to avoid recursion
CREATE POLICY "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' IN ('sebestianarchibald@gmail.com', 'victorycrisantos@gmail.com')
);

CREATE POLICY "Admin users can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.jwt() ->> 'email' IN ('sebestianarchibald@gmail.com', 'victorycrisantos@gmail.com')
);