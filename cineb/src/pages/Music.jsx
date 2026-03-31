import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FEATURED_PLAYLISTS, 
  getPlaylistById, 
  searchSongs, 
  getBestImage 
} from '../api/musicApi';
import { useMusic } from '../context/MusicContext';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { 
  Play, Pause, Search, Disc3, Music as MusicIcon, ListMusic, Loader2, 
  Heart, Plus, Trash2, ArrowLeft, Clock, Shuffle, ChevronRight, Headphones
} from 'lucide-react';

export default function Music() {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();
  const { likedSongs, playlists, createPlaylist, deletePlaylist, toggleLike, isLiked, toggleSongInPlaylist, recentlyPlayed } = useMusicLibrary();
  const navigate = useNavigate();
  const [playlistsData, setPlaylistsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addSongTarget, setAddSongTarget] = useState(null);

  const BROWSE_CATEGORIES = [
    { name: "Pop", gradient: "from-violet-600 to-indigo-800" },
    { name: "Hip-Hop", gradient: "from-orange-600 to-red-800" },
    { name: "Lo-Fi", gradient: "from-emerald-600 to-teal-800" },
    { name: "Bollywood", gradient: "from-pink-600 to-rose-800" },
    { name: "Romance", gradient: "from-red-500 to-pink-700" },
    { name: "Workout", gradient: "from-amber-500 to-orange-700" },
    { name: "Chill", gradient: "from-cyan-500 to-blue-700" },
    { name: "Party", gradient: "from-fuchsia-500 to-purple-700" },
    { name: "Punjabi", gradient: "from-yellow-500 to-amber-700" },
    { name: "Tamil", gradient: "from-lime-500 to-green-700" },
    { name: "Telugu", gradient: "from-sky-500 to-indigo-700" },
    { name: "Rock", gradient: "from-slate-500 to-zinc-800" },
    { name: "EDM", gradient: "from-blue-500 to-purple-800" },
    { name: "Indie", gradient: "from-rose-400 to-amber-600" },
    { name: "Classical", gradient: "from-stone-500 to-stone-800" },
    { name: "K-Pop", gradient: "from-pink-400 to-violet-700" },
  ];

  // Reusable Add-to-Playlist Menu
  const AddMenu = ({ song, dark }) => (
    <div className={`absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 drop-shadow-lg`} onClick={e => e.stopPropagation()}>
      <button 
        onClick={(e) => { e.stopPropagation(); setAddSongTarget(song); }}
        className={`w-7 h-7 ${dark ? 'bg-black/70' : 'bg-[#1db954]'} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg`}
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );

  // Like Button for songs
  const LikeBtn = ({ song }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Heart size={14} fill={isLiked(song.id) ? '#1db954' : 'none'} className={isLiked(song.id) ? 'text-[#1db954]' : 'text-white/30 hover:text-white'} />
    </button>
  );

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const promises = FEATURED_PLAYLISTS.map(p => getPlaylistById(p.id));
        const results = await Promise.all(promises);
        setPlaylistsData(results.filter(r => r !== null));
      } catch (err) {
        console.error("Failed to fetch featured playlists", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        searchSongs(searchQuery).then(data => {
          setSearchResults(data?.results || []);
          setIsSearching(false);
        }).catch(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePlaySong = (song, queue = []) => {
    playSong(song, queue, queue.findIndex(s => s.id === song.id) !== -1 ? queue.findIndex(s => s.id === song.id) : 0);
  };

  const handlePlayPlaylist = (playlist) => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSearchQuery(cat);
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Spotify-like gradient header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1db954]/20 via-[#121212] to-[#0a0a0a] pointer-events-none" />
        
        <div className="relative px-4 md:px-8 pt-6 md:pt-8 pb-8">
          {/* Greeting + Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {getGreeting()} 👋
              </h1>
              <p className="text-sm text-white/50 mt-1 font-medium">
                What do you want to listen to?
              </p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <input
                type="text"
                placeholder="Search songs, artists, albums..."
                className="w-full bg-white/10 rounded-full text-sm font-medium pl-11 pr-4 py-3 outline-none focus:bg-white/15 focus:ring-2 focus:ring-[#1db954] transition-all text-white placeholder-white/40"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#1db954] transition-colors" />
            </div>
          </div>

          {/* Quick Play Cards (Spotify's top 6 grid) */}
          {!searchQuery.trim() && recentlyPlayed.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8">
              {recentlyPlayed.slice(0, 6).map((song) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <button
                    key={'qp-'+song.id}
                    onClick={() => isActive ? togglePlay() : handlePlaySong(song, recentlyPlayed)}
                    className={`flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] rounded-md overflow-hidden transition-all group ${isActive ? 'bg-white/[0.15]' : ''}`}
                  >
                    <img 
                      src={getBestImage(song.image)} 
                      alt="" 
                      className="w-12 h-12 md:w-14 md:h-14 object-cover shrink-0" 
                      loading="lazy"
                    />
                    <span className={`text-[11px] md:text-sm font-bold truncate pr-2 ${isActive ? 'text-[#1db954]' : 'text-white'}`}>
                      {song.name}
                    </span>
                    <div className={`ml-auto mr-3 w-8 h-8 rounded-full bg-[#1db954] items-center justify-center text-black shadow-lg shadow-[#1db954]/30 shrink-0 opacity-0 group-hover:opacity-100 transition-all hidden md:flex`}>
                      {isActive && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-10">
        {/* Search Results */}
        {searchQuery.trim().length > 2 && (
          <div className="animate-entrance">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {activeCategory ? `${activeCategory} Music` : `Results for "${searchQuery}"`}
              </h2>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>
            
            {isSearching ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="bg-white/[0.02] rounded-lg overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 text-[11px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5">
                  <span>#</span>
                  <span>Title</span>
                  <span>Artist</span>
                  <span className="text-right">Duration</span>
                </div>
                {searchResults.map((song, idx) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={song.id}
                      onClick={() => handlePlaySong(song, searchResults)}
                      className={`w-full grid grid-cols-[40px_1fr] md:grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2.5 items-center hover:bg-white/[0.06] transition-all group text-left cursor-pointer ${isActive ? 'bg-white/[0.04]' : ''}`}
                    >
                      <span className="text-sm text-white/30 group-hover:hidden font-mono">{idx + 1}</span>
                      <span className="hidden group-hover:block pointer-events-none">
                        {isActive && isPlaying 
                          ? <Pause size={14} className="text-[#1db954]" fill="currentColor" />
                          : <Play size={14} className="text-white" fill="currentColor" />
                        }
                      </span>
                      <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                        <img src={getBestImage(song.image)} alt="" className="w-10 h-10 rounded object-cover shrink-0" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-[#1db954]' : 'text-white'}`}>{song.name}</p>
                          <p className="text-xs text-white/40 truncate md:hidden">{song.primaryArtists}</p>
                        </div>
                        <div className="pointer-events-auto">
                           <LikeBtn song={song} />
                        </div>
                      </div>
                      <span className="hidden md:block text-sm text-white/40 truncate pointer-events-none">{song.primaryArtists}</span>
                      <span className="hidden md:block text-sm text-white/40 text-right pointer-events-none">{song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,'0')}` : '--'}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center">
                <Search size={40} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 font-medium">No songs found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Browse Categories */}
        {!searchQuery.trim() && (
          <>
            {/* Categories Grid */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Browse All</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {BROWSE_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`relative aspect-[16/10] rounded-lg overflow-hidden bg-gradient-to-br ${cat.gradient} hover:scale-[1.03] active:scale-[0.98] transition-transform group`}
                  >
                    <span className="absolute top-3 left-3 text-base md:text-lg font-bold text-white drop-shadow-md">{cat.name}</span>
                    <Headphones size={48} className="absolute -bottom-2 -right-2 text-black/20 rotate-[25deg]" />
                  </button>
                ))}
              </div>
            </section>

            {/* Liked Songs Hero Card */}
            {likedSongs.length > 0 && (
              <section>
                <div className="relative bg-gradient-to-br from-[#450af5] to-[#8e8ee5] rounded-lg p-5 md:p-6 flex items-end gap-5 overflow-hidden group cursor-pointer hover:brightness-110 transition-all"
                  onClick={() => playSong(likedSongs[0], likedSongs, 0)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <div className="relative flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#450af5] to-[#e8115b] rounded-md flex items-center justify-center shadow-xl shrink-0">
                      <Heart size={28} fill="white" className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-white">Liked Songs</h3>
                      <p className="text-sm text-white/70">{likedSongs.length} songs</p>
                    </div>
                  </div>
                  <div className="relative w-12 h-12 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-xl shadow-[#1db954]/30 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shrink-0">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
              </section>
            )}

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Recently Played</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                  {recentlyPlayed.slice(0, 12).map((song) => (
                    <div
                      role="button"
                      tabIndex={0}
                      key={'recent-'+song.id}
                      onClick={() => handlePlaySong(song, recentlyPlayed)}
                      className="group text-left relative bg-white/[0.03] hover:bg-white/[0.08] rounded-lg p-3 md:p-4 transition-all duration-300 cursor-pointer"
                    >
                      <AddMenu song={song} />
                      <div className="relative aspect-square rounded-md overflow-hidden mb-3 shadow-lg shadow-black/30">
                        <img 
                          src={getBestImage(song.image)} alt="" 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-[#1db954]/40">
                          <Play fill="currentColor" size={18} className="ml-0.5" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{song.name}</p>
                      <p className="text-xs text-white/40 truncate mt-1">{song.primaryArtists || 'Unknown Artist'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Playlists */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Your Playlists</h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 text-[#1db954] hover:text-white text-sm font-bold transition-colors"
                >
                  <Plus size={16} /> Create
                </button>
              </div>
              
              {playlists.length === 0 ? (
                <div className="bg-white/[0.03] rounded-lg p-8 text-center">
                  <MusicIcon size={40} className="mx-auto text-white/10 mb-3" />
                  <p className="text-white/40 text-sm font-medium">Create your first playlist</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                  {playlists.map((playlist) => (
                    <div key={'my-pl-'+playlist.id} className="group relative bg-white/[0.03] hover:bg-white/[0.08] rounded-lg p-3 md:p-4 transition-all duration-300">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete playlist?')) deletePlaylist(playlist.id); }} className="p-1.5 bg-black/60 text-red-400 hover:text-red-300 rounded-full transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="aspect-square bg-gradient-to-br from-white/10 to-white/[0.02] rounded-md mb-3 flex items-center justify-center shadow-lg relative overflow-hidden">
                        <MusicIcon size={40} className="text-white/10" />
                        {playlist.songs.length > 0 && (
                          <div 
                            onClick={() => playSong(playlist.songs[0], playlist.songs, 0)}
                            className="absolute bottom-2 right-2 w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-[#1db954]/40 cursor-pointer"
                          >
                            <Play fill="currentColor" size={18} className="ml-0.5" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white truncate">{playlist.name}</h3>
                      <p className="text-xs text-white/40 mt-1">{playlist.songs.length} songs</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Featured Playlists */}
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1db954]" />
                  <span className="text-sm font-medium text-white/40">Loading playlists...</span>
                </div>
              </div>
            ) : (
              playlistsData.map(playlist => (
                <section key={playlist.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white">{playlist.name}</h2>
                    <button 
                      onClick={() => handlePlayPlaylist(playlist)}
                      className="flex items-center gap-2 text-white/50 hover:text-[#1db954] text-sm font-medium transition-colors"
                    >
                      <Shuffle size={14} /> Play All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                    {playlist.songs?.slice(0, 12).map((song) => {
                      const isActive = currentSong?.id === song.id;
                      return (
                        <div
                          role="button"
                          tabIndex={0}
                          key={song.id}
                          onClick={() => handlePlaySong(song, playlist.songs)}
                          className="group text-left relative bg-white/[0.03] hover:bg-white/[0.08] rounded-lg p-3 md:p-4 transition-all duration-300 cursor-pointer"
                        >
                          <AddMenu song={song} />
                          <div className="relative aspect-square rounded-md overflow-hidden mb-3 shadow-lg shadow-black/30">
                            <img 
                              src={getBestImage(song.image)} alt=""
                              className="w-full h-full object-cover" 
                              loading="lazy"
                            />
                            <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#1db954] rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-[#1db954]/40">
                              {isActive && isPlaying 
                                ? <Pause fill="currentColor" size={18} />
                                : <Play fill="currentColor" size={18} className="ml-0.5" />
                              }
                            </div>
                          </div>
                          <p className={`text-sm font-bold truncate ${isActive ? 'text-[#1db954]' : 'text-white'}`}>{song.name}</p>
                          <p className="text-xs text-white/40 truncate mt-1">{song.primaryArtists || 'Unknown Artist'}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </div>

      {/* Add to Playlist Modal */}
      {addSongTarget && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAddSongTarget(null)}>
          <div className="bg-[#121212] border border-white/10 p-5 md:p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh] animate-entrance" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
              <img src={getBestImage(addSongTarget.image)} className="w-12 h-12 rounded object-cover" alt="" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">Add to Playlist</h3>
                <p className="text-xs text-white/40 truncate">{addSongTarget.name}</p>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar space-y-2 mb-4">
              <button 
                onClick={() => { toggleLike(addSongTarget); setAddSongTarget(null); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#450af5] to-[#e8115b] flex items-center justify-center shrink-0">
                  <Heart size={18} fill="white" className="text-white" />
                </div>
                <span className="font-bold text-sm text-white">Liked Songs</span>
                {isLiked(addSongTarget.id) && <span className="ml-auto text-xs text-[#1db954] font-bold">Added</span>}
              </button>
              
              {playlists.map(p => {
                const hasSong = p.songs.some(s => s.id === addSongTarget.id);
                return (
                  <button 
                    key={p.id}
                    onClick={() => { toggleSongInPlaylist(p.id, addSongTarget); setAddSongTarget(null); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <ListMusic size={18} className="text-white/40" />
                    </div>
                    <span className="font-bold text-sm text-white truncate">{p.name}</span>
                    {hasSong && <span className="ml-auto text-xs text-[#1db954] font-bold">Added</span>}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => { setAddSongTarget(null); setShowCreateModal(true); }}
              className="w-full py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Playlist
            </button>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-entrance" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Create Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name (e.g. My Favorites)"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#1db954]/50 mb-5 font-medium placeholder:text-white/30 text-sm"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && newPlaylistName.trim()) {
                  createPlaylist(newPlaylistName.trim());
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setShowCreateModal(false); setNewPlaylistName(''); }}
                className="px-4 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newPlaylistName.trim()) {
                    createPlaylist(newPlaylistName.trim());
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }
                }}
                className={`px-6 py-2 bg-[#1db954] text-black text-sm font-bold rounded-full transition-all ${newPlaylistName.trim() ? 'hover:scale-105 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
