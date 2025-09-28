-- Add Prayer Requests Module
-- This migration adds prayer request functionality to the existing Miracles app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create prayer request categories enum
DO $$ BEGIN
    CREATE TYPE prayer_category AS ENUM (
      'health',
      'family',
      'work',
      'relationships',
      'spiritual_growth',
      'financial',
      'education',
      'peace',
      'grief',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create prayer request urgency levels enum
DO $$ BEGIN
    CREATE TYPE prayer_urgency AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create prayer requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 1000),
  category prayer_category NOT NULL,
  urgency prayer_urgency DEFAULT 'medium',
  location POINT NOT NULL,
  location_name TEXT,
  privacy_level privacy_level DEFAULT 'public',
  photo_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  prayers_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prayers offered table (similar to upvotes but for prayers)
CREATE TABLE IF NOT EXISTS public.prayers_offered (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  message TEXT CHECK (length(message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prayer_request_id)
);

-- Create prayer request comments table
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prayer_requests_location ON public.prayer_requests USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON public.prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_urgency ON public.prayer_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON public.prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_approved ON public.prayer_requests(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_prayer_requests_answered ON public.prayer_requests(is_answered);

CREATE INDEX IF NOT EXISTS idx_prayers_offered_prayer_request_id ON public.prayers_offered(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayers_offered_user_id ON public.prayers_offered(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_comments_prayer_request_id ON public.prayer_comments(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_user_id ON public.prayer_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_created_at ON public.prayer_comments(created_at DESC);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.prayer_requests;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.prayer_comments;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.prayer_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update prayer requests prayers count
CREATE OR REPLACE FUNCTION public.update_prayer_requests_prayers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests 
    SET prayers_count = prayers_count + 1 
    WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prayer_requests 
    SET prayers_count = prayers_count - 1 
    WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for prayers count
DROP TRIGGER IF EXISTS update_prayer_requests_prayers_count_trigger ON public.prayers_offered;
CREATE TRIGGER update_prayer_requests_prayers_count_trigger
  AFTER INSERT OR DELETE ON public.prayers_offered
  FOR EACH ROW EXECUTE FUNCTION public.update_prayer_requests_prayers_count();

-- Create function to update prayer requests comments count
CREATE OR REPLACE FUNCTION public.update_prayer_requests_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.prayer_request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prayer_requests 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.prayer_request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count
DROP TRIGGER IF EXISTS update_prayer_requests_comments_count_trigger ON public.prayer_comments;
CREATE TRIGGER update_prayer_requests_comments_count_trigger
  AFTER INSERT OR DELETE ON public.prayer_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_prayer_requests_comments_count();

-- Enable Row Level Security
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers_offered ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prayer requests
DROP POLICY IF EXISTS "Approved prayer requests are viewable by everyone" ON public.prayer_requests;
CREATE POLICY "Approved prayer requests are viewable by everyone" ON public.prayer_requests
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can insert their own prayer requests" ON public.prayer_requests;
CREATE POLICY "Users can insert their own prayer requests" ON public.prayer_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own prayer requests" ON public.prayer_requests;
CREATE POLICY "Users can update their own prayer requests" ON public.prayer_requests
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON public.prayer_requests;
CREATE POLICY "Users can delete their own prayer requests" ON public.prayer_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prayers offered
DROP POLICY IF EXISTS "Prayers offered are viewable by everyone" ON public.prayers_offered;
CREATE POLICY "Prayers offered are viewable by everyone" ON public.prayers_offered
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own prayers" ON public.prayers_offered;
CREATE POLICY "Users can insert their own prayers" ON public.prayers_offered
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own prayers" ON public.prayers_offered;
CREATE POLICY "Users can delete their own prayers" ON public.prayers_offered
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prayer comments
DROP POLICY IF EXISTS "Prayer comments are viewable by everyone" ON public.prayer_comments;
CREATE POLICY "Prayer comments are viewable by everyone" ON public.prayer_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own prayer comments" ON public.prayer_comments;
CREATE POLICY "Users can insert their own prayer comments" ON public.prayer_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own prayer comments" ON public.prayer_comments;
CREATE POLICY "Users can update their own prayer comments" ON public.prayer_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own prayer comments" ON public.prayer_comments;
CREATE POLICY "Users can delete their own prayer comments" ON public.prayer_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Extend reports table to support prayer requests
-- Add prayer_request_id column to existing reports table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'prayer_request_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update the check constraint for reports table to include prayer requests
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reports_check' 
        AND table_name = 'reports'
        AND table_schema = 'public'
        AND constraint_type = 'CHECK'
    ) THEN
        ALTER TABLE public.reports DROP CONSTRAINT reports_check;
    END IF;
    
    -- Add new constraint that includes prayer_request_id
    ALTER TABLE public.reports ADD CONSTRAINT reports_check CHECK (
        (miracle_id IS NOT NULL AND comment_id IS NULL AND prayer_request_id IS NULL) OR
        (miracle_id IS NULL AND comment_id IS NOT NULL AND prayer_request_id IS NULL) OR
        (miracle_id IS NULL AND comment_id IS NULL AND prayer_request_id IS NOT NULL)
    );
END $$;

-- Create index for prayer_request_id in reports table
CREATE INDEX IF NOT EXISTS idx_reports_prayer_request_id ON public.reports(prayer_request_id);

-- Add RLS policy for prayer request reports
DROP POLICY IF EXISTS "Users can report prayer requests" ON public.reports;
CREATE POLICY "Users can report prayer requests" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND prayer_request_id IS NOT NULL);

-- Create storage bucket for prayer request photos (reuse miracle-media bucket)
-- The existing miracle-media bucket can be used for prayer request photos as well
-- No need to create a new bucket since the existing one already has the right policies

-- Add comment to indicate the migration is complete
COMMENT ON TABLE public.prayer_requests IS 'Prayer requests submitted by users for community support';
COMMENT ON TABLE public.prayers_offered IS 'Prayers offered by users for specific prayer requests';
COMMENT ON TABLE public.prayer_comments IS 'Comments on prayer requests';
