-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create library_items table
CREATE TABLE IF NOT EXISTS library_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, show_id)
);

-- Enable Row Level Security on library_items
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for library_items
-- Users can view their own library items
CREATE POLICY "Users can view own library items" 
ON library_items FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own library items
CREATE POLICY "Users can insert own library items" 
ON library_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own library items (for sorting)
CREATE POLICY "Users can update own library items" 
ON library_items FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own library items
CREATE POLICY "Users can delete own library items" 
ON library_items FOR DELETE 
USING (auth.uid() = user_id);

-- Create episode_library_items table (單集收藏)
CREATE TABLE IF NOT EXISTS episode_library_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Enable Row Level Security on episode_library_items
ALTER TABLE episode_library_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for episode_library_items
CREATE POLICY "Users can view own episode library items"
ON episode_library_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own episode library items"
ON episode_library_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own episode library items"
ON episode_library_items FOR DELETE
USING (auth.uid() = user_id);

-- Ensure profiles are updatable by the user (if not already set)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to see other users' profiles (e.g. for comments, if public) 
-- Or strictly restrict to own profile depending on privacy requirements. 
-- For now, assuming basic "Users can view own profile" or public read if social features exist.
-- If strictly private:
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
