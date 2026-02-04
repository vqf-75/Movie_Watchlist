import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, WatchedItem, WatchlistItem } from '../lib/supabase';
import { LogOut, Plus, Search, Trash2, CheckCircle, Clock, Film, X, Star, Users, Zap, DollarSign, Globe } from 'lucide-react';
import SearchModal from './SearchModal';

type Tab = 'watched' | 'watchlist';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('watched');
  const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState<'watched' | 'watchlist'>('watched');
  const [selectedItem, setSelectedItem] = useState<WatchedItem | WatchlistItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadWatchedItems(), loadWatchlistItems()]);
    setLoading(false);
  };

  const loadWatchedItems = async () => {
    const { data, error } = await supabase
      .from('watched_items')
      .select('*')
      .order('watched_at', { ascending: false });

    if (!error && data) {
      setWatchedItems(data);
    }
  };

  const loadWatchlistItems = async () => {
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWatchlistItems(data);
    }
  };

  const deleteWatchedItem = async (id: string) => {
    await supabase.from('watched_items').delete().eq('id', id);
    await loadWatchedItems();
  };

  const deleteWatchlistItem = async (id: string) => {
    await supabase.from('watchlist_items').delete().eq('id', id);
    await loadWatchlistItems();
  };

  const moveToWatched = async (item: WatchlistItem) => {
    await supabase.from('watchlist_items').delete().eq('id', item.id);
    await supabase.from('watched_items').insert({
      user_id: user!.id,
      title: item.title,
      media_type: item.media_type,
      year: item.year,
      poster_url: item.poster_url,
      total_episodes: item.total_episodes,
      total_seasons: item.total_seasons,
      tmdb_id: item.tmdb_id,
    });
    await loadData();
  };

  const openSearch = (type: 'watched' | 'watchlist') => {
    setSearchType(type);
    setShowSearchModal(true);
  };

  const handleAddMedia = () => {
    loadData();
  };

  const totalEpisodes = watchedItems.reduce((acc, item) => acc + (item.total_episodes || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Film className="w-8 h-8 text-blue-500" />
              <h1 className="ml-3 text-2xl font-bold text-white">MediaTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Watched</p>
                <p className="text-white text-3xl font-bold mt-1">{watchedItems.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Episodes Watched</p>
                <p className="text-white text-3xl font-bold mt-1">{totalEpisodes}</p>
              </div>
              <Film className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Watchlist</p>
                <p className="text-white text-3xl font-bold mt-1">{watchlistItems.length}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-200" />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('watched')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'watched'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Watched ({watchedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'watchlist'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Watchlist ({watchlistItems.length})
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => openSearch(activeTab)}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add {activeTab === 'watched' ? 'to Watched' : 'to Watchlist'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeTab === 'watched'
              ? watchedItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onDelete={deleteWatchedItem}
                    onClick={() => setSelectedItem(item)}
                    type="watched"
                  />
                ))
              : watchlistItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onDelete={deleteWatchlistItem}
                    onMoveToWatched={moveToWatched}
                    onClick={() => setSelectedItem(item)}
                    type="watchlist"
                  />
                ))}
          </div>
        )}

        {!loading &&
          ((activeTab === 'watched' && watchedItems.length === 0) ||
            (activeTab === 'watchlist' && watchlistItems.length === 0)) && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                No items yet. Click "Add to {activeTab === 'watched' ? 'Watched' : 'Watchlist'}" to get started!
              </p>
            </div>
          )}
      </div>

      {showSearchModal && (
        <SearchModal
          type={searchType}
          onClose={() => setShowSearchModal(false)}
          onAdd={handleAddMedia}
        />
      )}

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

interface MediaCardProps {
  item: WatchedItem | WatchlistItem;
  onDelete: (id: string) => void;
  onMoveToWatched?: (item: WatchlistItem) => void;
  onClick: () => void;
  type: 'watched' | 'watchlist';
}

function MediaCard({ item, onDelete, onMoveToWatched, onClick, type }: MediaCardProps) {
  return (
    <div className="group relative bg-slate-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
      <div className="aspect-[2/3] bg-slate-700" onClick={onClick}>
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-12 h-12 text-slate-600" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate" title={item.title}>
          {item.title}
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          {item.year} • {item.media_type === 'tv' ? 'TV Show' : 'Movie'}
        </p>
        {item.media_type === 'tv' && item.total_episodes > 0 && (
          <p className="text-blue-400 text-xs mt-1">
            {item.total_seasons} {item.total_seasons === 1 ? 'Season' : 'Seasons'} • {item.total_episodes} Episodes
          </p>
        )}
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex space-x-2">
        {type === 'watchlist' && onMoveToWatched && (
          <button
            onClick={() => onMoveToWatched(item as WatchlistItem)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg transition"
            title="Mark as Watched"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </button>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg shadow-lg transition"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

interface DetailModalProps {
  item: WatchedItem | WatchlistItem;
  onClose: () => void;
}

function DetailModal({ item, onClose }: DetailModalProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const formatLanguage = (lang: string | undefined) => {
    const langNames: Record<string, string> = {
      'EN': 'English',
      'ES': 'Spanish',
      'FR': 'French',
      'DE': 'German',
      'IT': 'Italian',
      'PT': 'Portuguese',
      'RU': 'Russian',
      'JA': 'Japanese',
      'KO': 'Korean',
      'ZH': 'Chinese',
    };
    return langNames[lang || ''] || lang || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <button
            onClick={onClose}
            className="float-right p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>

          <div className="flex flex-col md:flex-row gap-6 mb-6 pt-4">
            <div className="flex-shrink-0 w-40 h-56 bg-slate-700 rounded-lg overflow-hidden">
              {item.poster_url ? (
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-16 h-16 text-slate-600" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">{item.title}</h2>
              {item.release_date && (
                <p className="text-sm text-slate-400 mb-3">
                  {new Date(item.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                </div>

                {item.year && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{item.year}</span>
                  </div>
                )}

                {item.rating && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{item.rating.toFixed(1)}/10</span>
                  </div>
                )}

                {item.language && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span>{formatLanguage(item.language)}</span>
                  </div>
                )}

                {item.media_type === 'movie' && item.runtime && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{item.runtime} min</span>
                  </div>
                )}

                {item.media_type === 'tv' && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{item.total_seasons} {item.total_seasons === 1 ? 'Season' : 'Seasons'}</span>
                  </div>
                )}

                {item.media_type === 'tv' && item.total_episodes > 0 && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Film className="w-4 h-4 text-blue-500" />
                    <span>{item.total_episodes} Episodes</span>
                  </div>
                )}

                {item.tv_status && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{item.tv_status}</span>
                  </div>
                )}

                {'watched_at' in item && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Watched on {new Date(item.watched_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {item.genres && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {item.genres.split(', ').map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.main_cast && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4" />
                Cast
              </h3>
              <p className="text-slate-300 text-sm">{item.main_cast}</p>
            </div>
          )}

          {item.director && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Director</h3>
              <p className="text-slate-300 text-sm">{item.director}</p>
            </div>
          )}

          {item.media_type === 'movie' && (item.budget || item.revenue) && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              {item.budget ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </h3>
                  <p className="text-slate-300 text-sm">{formatCurrency(item.budget)}</p>
                </div>
              ) : null}
              {item.revenue ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Revenue
                  </h3>
                  <p className="text-slate-300 text-sm">{formatCurrency(item.revenue)}</p>
                </div>
              ) : null}
            </div>
          )}

          {item.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
