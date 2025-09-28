-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE miracle_category AS ENUM (
  'kindness',
  'nature',
  'health',
  'family',
  'friendship',
  'achievement',
  'recovery',
  'discovery',
  'gratitude',
  'other'
);

CREATE TYPE privacy_level AS ENUM (
  'public',
  'anonymous',
  'blurred_location'
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create miracles table
CREATE TABLE public.miracles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 1000),
  category miracle_category NOT NULL,
  location POINT NOT NULL,
  location_name TEXT,
  privacy_level privacy_level DEFAULT 'public',
  photo_url TEXT,
  video_url TEXT,
  youtube_url TEXT,
  upvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upvotes table
CREATE TABLE public.upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  miracle_id UUID REFERENCES public.miracles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, miracle_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  miracle_id UUID REFERENCES public.miracles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table for moderation
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  miracle_id UUID REFERENCES public.miracles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (miracle_id IS NOT NULL AND comment_id IS NULL) OR
    (miracle_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_miracles_location ON public.miracles USING GIST (location);
CREATE INDEX idx_miracles_category ON public.miracles(category);
CREATE INDEX idx_miracles_created_at ON public.miracles(created_at DESC);
CREATE INDEX idx_miracles_user_id ON public.miracles(user_id);
CREATE INDEX idx_miracles_approved ON public.miracles(is_approved) WHERE is_approved = true;

CREATE INDEX idx_upvotes_miracle_id ON public.upvotes(miracle_id);
CREATE INDEX idx_upvotes_user_id ON public.upvotes(user_id);

CREATE INDEX idx_comments_miracle_id ON public.comments(miracle_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.miracles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update miracle upvotes count
CREATE OR REPLACE FUNCTION public.update_miracle_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.miracles 
    SET upvotes_count = upvotes_count + 1 
    WHERE id = NEW.miracle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.miracles 
    SET upvotes_count = upvotes_count - 1 
    WHERE id = OLD.miracle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for upvotes count
CREATE TRIGGER update_miracle_upvotes_count_trigger
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_miracle_upvotes_count();

-- Create function to update miracle comments count
CREATE OR REPLACE FUNCTION public.update_miracle_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.miracles 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.miracle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.miracles 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.miracle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count
CREATE TRIGGER update_miracle_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_miracle_comments_count();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Miracles policies
CREATE POLICY "Approved miracles are viewable by everyone" ON public.miracles
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert their own miracles" ON public.miracles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own miracles" ON public.miracles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own miracles" ON public.miracles
  FOR DELETE USING (auth.uid() = user_id);

-- Upvotes policies
CREATE POLICY "Upvotes are viewable by everyone" ON public.upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own upvotes" ON public.upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON public.upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can insert their own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Create storage bucket for miracle photos and videos
INSERT INTO storage.buckets (id, name, public) VALUES ('miracle-media', 'miracle-media', true);

-- Create storage policies
CREATE POLICY "Miracle media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'miracle-media');

CREATE POLICY "Users can upload their own miracle media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'miracle-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own miracle media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'miracle-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own miracle media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'miracle-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
