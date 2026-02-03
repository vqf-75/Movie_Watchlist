/*
  # Add Additional Media Attributes

  1. Changes
    - Add `genres` (text) - Comma-separated genres
    - Add `rating` (numeric) - IMDb/TMDB rating (0-10)
    - Add `runtime` (integer) - Runtime in minutes
    - Add `director` (text) - Director name(s)
    - Add `language` (text) - Original language
    - Add `release_date` (text) - Full release date
    - Add `budget` (bigint) - Budget in USD
    - Add `revenue` (bigint) - Revenue in USD
    - Add `main_cast` (text) - Main cast members
    - Add `tv_status` (text) - Status (e.g., Returning Series, Ended)
    
    These columns are added to both `watched_items` and `watchlist_items` tables
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'genres'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN genres text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'rating'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN rating numeric(3,1);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'runtime'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN runtime integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'director'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN director text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'language'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN language text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'release_date'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN release_date text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'budget'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN budget bigint;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'revenue'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN revenue bigint;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'main_cast'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN main_cast text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'tv_status'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN tv_status text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'genres'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN genres text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'rating'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN rating numeric(3,1);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'runtime'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN runtime integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'director'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN director text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'language'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN language text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'release_date'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN release_date text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'budget'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN budget bigint;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'revenue'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN revenue bigint;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'main_cast'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN main_cast text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'tv_status'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN tv_status text;
  END IF;
END $$;
