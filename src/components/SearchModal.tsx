import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, X, Film, Loader2 } from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  media_type: 'movie' | 'tv';
  year: number | null;
  poster_path: string | null;
  overview: string;
}

interface SearchModalProps {
  type: 'watched' | 'watchlist';
  onClose: () => void;
  onAdd: () => void;
}

export default function SearchModal({ type, onClose, onAdd }: SearchModalProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);

  const searchMedia = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/search-media?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search media');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMedia = async (result: SearchResult) => {
    setAddingId(result.id);

    try {
      let totalEpisodes = 0;
      let totalSeasons = 0;
      let genres = '';
      let rating = null;
      let runtime = null;
      let director = '';
      let language = '';
      let releaseDate = '';
      let budget = null;
      let revenue = null;
      let mainCast = '';
      let tvStatus = '';

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const detailsResponse = await fetch(
        `${supabaseUrl}/functions/v1/search-media?id=${result.id}&type=${result.media_type}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (detailsResponse.ok) {
        const details = await detailsResponse.json();

        if (result.media_type === 'tv') {
          totalEpisodes = details.total_episodes || 0;
          totalSeasons = details.total_seasons || 0;
          tvStatus = details.status || '';
        } else {
          runtime = details.runtime || null;
          budget = details.budget || null;
          revenue = details.revenue || null;
        }

        genres = details.genres?.map((g: { name: string }) => g.name).join(', ') || '';
        rating = details.vote_average || null;
        language = details.original_language?.toUpperCase() || '';
        releaseDate = details.release_date || details.first_air_date || '';

        if (details.credits?.crew) {
          const directors = details.credits.crew
            .filter((p: { job: string }) => p.job === 'Director')
            .map((p: { name: string }) => p.name)
            .slice(0, 2)
            .join(', ');
          director = directors || '';
        }

        if (details.credits?.cast) {
          mainCast = details.credits.cast
            .slice(0, 5)
            .map((p: { name: string }) => p.name)
            .join(', ');
        }
      }

      const mediaData = {
        user_id: user!.id,
        title: result.title,
        media_type: result.media_type,
        year: result.year,
        poster_url: result.poster_path,
        total_episodes: totalEpisodes,
        total_seasons: totalSeasons,
        tmdb_id: result.id,
        description: result.overview,
        genres,
        rating,
        runtime,
        director,
        language,
        release_date: releaseDate,
        budget,
        revenue,
        main_cast: mainCast,
        tv_status: tvStatus,
      };

      const table = type === 'watched' ? 'watched_items' : 'watchlist_items';
      const { error } = await supabase.from(table).insert(mediaData);

      if (error) {
        if (error.code === '23505') {
          setError('This item is already in your list');
        } else {
          throw error;
        }
      } else {
        onAdd();
      }
    } catch (err) {
      setError('Failed to add media. Please try again.');
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMedia();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              Search Movies & TV Shows
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for a movie or TV show..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchMedia}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {loading ? 'Searching...' : 'Search for movies and TV shows to add to your list'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex space-x-4 bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition"
                >
                  <div className="w-20 h-28 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {result.poster_path ? (
                      <img
                        src={result.poster_path}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {result.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">
                      {result.year} • {result.media_type === 'tv' ? 'TV Show' : 'Movie'}
                    </p>
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {result.overview}
                    </p>
                  </div>
                  <button
                    onClick={() => addMedia(result)}
                    disabled={addingId === result.id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition self-center whitespace-nowrap"
                  >
                    {addingId === result.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
