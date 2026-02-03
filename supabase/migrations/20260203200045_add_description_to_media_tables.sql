/*
  # Add Description Column

  1. Changes
    - Add `description` (text) column to `watched_items` table
    - Add `description` (text) column to `watchlist_items` table
    - Description stores the overview/synopsis of movies and TV shows
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watched_items' AND column_name = 'description'
  ) THEN
    ALTER TABLE watched_items ADD COLUMN description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_items' AND column_name = 'description'
  ) THEN
    ALTER TABLE watchlist_items ADD COLUMN description text;
  END IF;
END $$;
