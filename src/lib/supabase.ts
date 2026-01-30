import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MediaItem {
  id: string;
  user_id: string;
  title: string;
  media_type: 'movie' | 'tv';
  year?: number;
  poster_url?: string;
  total_episodes: number;
  total_seasons: number;
  tmdb_id?: number;
  created_at: string;
}

export interface WatchedItem extends MediaItem {
  watched_at: string;
}

export interface WatchlistItem extends MediaItem {
}
