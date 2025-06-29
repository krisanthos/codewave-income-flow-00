
-- Create table for social media posts that users can interact with
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', etc.
  post_url TEXT NOT NULL,
  post_title TEXT NOT NULL,
  post_description TEXT,
  reward_amount NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track user interactions with social posts
CREATE TABLE public.user_social_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.social_posts(id),
  interaction_type TEXT NOT NULL, -- 'like', 'share', 'comment', 'follow'
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, post_id, interaction_type)
);

-- Create table for daily task completions to prevent duplicate claims
CREATE TABLE public.daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL, -- 'daily_checkin', 'website_rating', etc.
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_type, completion_date)
);

-- Add RLS policies
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_task_completions ENABLE ROW LEVEL SECURITY;

-- Social posts are readable by everyone
CREATE POLICY "Anyone can view active social posts" 
  ON public.social_posts 
  FOR SELECT 
  USING (is_active = true);

-- Users can view their own interactions
CREATE POLICY "Users can view their own interactions" 
  ON public.user_social_interactions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own interactions
CREATE POLICY "Users can create their own interactions" 
  ON public.user_social_interactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can view their own daily completions
CREATE POLICY "Users can view their own daily completions" 
  ON public.daily_task_completions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own daily completions
CREATE POLICY "Users can create their own daily completions" 
  ON public.daily_task_completions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Insert some sample social media posts
INSERT INTO public.social_posts (platform, post_url, post_title, post_description, reward_amount) VALUES
('facebook', 'https://www.facebook.com/profile.php?id=61576663620789', 'Like Our Latest Facebook Post', 'Like our most recent post about earning opportunities', 25),
('instagram', 'https://instagram.com/example', 'Follow Our Instagram', 'Follow us for daily tips and updates', 30),
('twitter', 'https://twitter.com/example', 'Retweet Our Latest Tweet', 'Help spread the word about our platform', 20);
