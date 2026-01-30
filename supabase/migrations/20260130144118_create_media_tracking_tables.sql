/*
  # Media Tracking Database Schema

  1. New Tables
    - `watched_items`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `title` (text) - Movie or TV show title
      - `media_type` (text) - Either 'movie' or 'tv'
      - `year` (integer) - Release year
      - `poster_url` (text) - URL to poster image
      - `total_episodes` (integer) - Total number of episodes for TV shows
      - `total_seasons` (integer) - Total number of seasons for TV shows
      - `tmdb_id` (integer) - The Movie Database API ID for reference
      - `watched_at` (timestamptz) - When the item was marked as watched
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `watchlist_items`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `title` (text) - Movie or TV show title
      - `media_type` (text) - Either 'movie' or 'tv'
      - `year` (integer) - Release year
      - `poster_url` (text) - URL to poster image
      - `total_episodes` (integer) - Total number of episodes for TV shows
      - `total_seasons` (integer) - Total number of seasons for TV shows
      - `tmdb_id` (integer) - The Movie Database API ID for reference
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only read, insert, update, and delete their own items

  3. Indexes
    - Add indexes on user_id for faster queries
    - Add unique constraint to prevent duplicate entries
*/

-- Create watched_items table
CREATE TABLE IF NOT EXISTS watched_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  year integer,
  poster_url text,
  total_episodes integer DEFAULT 0,
  total_seasons integer DEFAULT 0,
  tmdb_id integer,
  watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create watchlist_items table
CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  year integer,
  poster_url text,
  total_episodes integer DEFAULT 0,
  total_seasons integer DEFAULT 0,
  tmdb_id integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS watched_items_user_id_idx ON watched_items(user_id);
CREATE INDEX IF NOT EXISTS watchlist_items_user_id_idx ON watchlist_items(user_id);

-- Add unique constraints to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS watched_items_user_tmdb_idx ON watched_items(user_id, tmdb_id) WHERE tmdb_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS watchlist_items_user_tmdb_idx ON watchlist_items(user_id, tmdb_id) WHERE tmdb_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE watched_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for watched_items
CREATE POLICY "Users can view own watched items"
  ON watched_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watched items"
  ON watched_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watched items"
  ON watched_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watched items"
  ON watched_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for watchlist_items
CREATE POLICY "Users can view own watchlist items"
  ON watchlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items"
  ON watchlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist items"
  ON watchlist_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);