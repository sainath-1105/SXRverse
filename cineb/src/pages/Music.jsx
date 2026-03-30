import { useState, useEffect } from 'react';
import { 
  FEATURED_PLAYLISTS, 
  getPlaylistById, 
  searchSongs, 
  getBestImage 
} from '../api/musicApi';
import { useMusic } from '../context/MusicContext';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { Play, Search, Disc3, Music as MusicIcon, ListMusic, Loader2, Heart, Plus, Trash2, ArrowLeft, Clock } from 'lucide-react';

export default function Music() {
  const { playSong } = useMusic();
  const { likedSongs, playlists, createPlaylist, deletePlaylist, toggleLike, isLiked, toggleSongInPlaylist, recentlyPlayed } = useMusicLibrary();
  const [playlistsData, setPlaylistsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const BROWSE_CATEGORIES = ["Pop", "Hip-Hop", "Lo-Fi", "Bollywood", "Romance", "Workout", "Chill", "Party", "Punjabi", "Tamil", "Telugu", "Retro"];

  // Reusable Add-to-Playlist Menu for any song card
  const AddMenu = ({ song }) => (
    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" onClick={e => e.stopPropagation()}>
      <div className="relative cursor-pointer">
        <div className="w-7 h-7 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-[#ffcc00] hover:text-black transition-colors pointer-events-none border border-white/10">
          <Plus size={14} strokeWidth={3} />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          value=""
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.value) {
              if (e.target.value === 'like') toggleLike(song);
              else toggleSongInPlaylist(e.target.value, song);
              e.target.value = '';
            }
          }}
        >
          <option value="" disabled>Add to...</option>
          <option value="like">{isLiked(song.id) ? '♥ Remove from Liked' : '♥ Add to Liked'}</option>
          {playlists.length > 0 && <optgroup label="My Playlists">
            {playlists.map(p => {
              const hasSong = p.songs.some(s => s.id === song.id);
              return <option key={p.id} value={p.id}>{hasSong ? '✗ Remove from' : '+ Add to'} {p.name}</option>;
            })}
          </optgroup>}
        </select>
      </div>
    </div>
  );

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const promises = FEATURED_PLAYLISTS.slice(0, 4).map(p => getPlaylistById(p.id));
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
    }, 500);
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

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-10 md:space-y-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="hero-title flex items-center gap-3 md:gap-4 mb-2">
            SXR <span className="text-[#ffcc00] flex items-center gap-2">MUSIC <Disc3 className="w-8 h-8 md:w-12 md:h-12 animate-spin-slow" /></span>
          </h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/40">
            Millions of songs • Highest Quality • Unstoppable
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="SEARCH SONGS, ARTISTS..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] pl-11 pr-4 py-3.5 outline-none focus:border-[#ffcc00]/50 focus:bg-white/[0.05] transition-all text-white placeholder-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#ffcc00] transition-colors" />
        </div>
      </div>

      {/* Browse Categories Pills */}
      <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2">
        {BROWSE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSearchQuery(cat)}
            className="shrink-0 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-[#ffcc00] hover:text-black hover:border-[#ffcc00] text-[10px] font-black uppercase tracking-widest text-white/70 transition-all duration-300"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results Area */}
      {searchQuery.trim().length > 2 && (
        <div className="animate-entrance">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffcc00] flex items-center gap-2">
              <Search size={14} /> Search Results
            </h2>
            <button 
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-2 bg-white/5 text-white/70 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft size={10} /> Back
            </button>
          </div>
          
          {isSearching ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffcc00]" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {searchResults.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handlePlaySong(song, searchResults)}
                  className="relative flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-[#ffcc00]/30 transition-all group text-left"
                >
                  <AddMenu song={song} />
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={getBestImage(song.image)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play fill="currentColor" size={14} className="text-[#ffcc00]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white truncate group-hover:text-[#ffcc00] transition-colors">
                      {song.name}
                    </p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mt-0.5">
                      {song.primaryArtists || 'Unknown Artist'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs font-bold text-white/30 uppercase tracking-widest bg-white/[0.02] rounded-3xl border border-white/[0.04]">
              No songs found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Main Content Areas */}
      {!searchQuery.trim() && (
        <div className="space-y-16">
          {/* Liked Songs Section */}
          {likedSongs.length > 0 && (
            <div className="animate-entrance">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <Heart className="text-[#ffcc00]" fill="#ffcc00" size={18} />
                  Liked Songs
                </h2>
                <button 
                  onClick={() => playSong(likedSongs[0], likedSongs, 0)}
                  className="flex items-center gap-2 bg-[#ffcc00] text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play fill="currentColor" size={10} /> Play Liked
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                {likedSongs.map((song, idx) => (
                  <button
                    key={'liked-'+song.id}
                    onClick={() => handlePlaySong(song, likedSongs)}
                    className="snap-start shrink-0 w-36 md:w-44 group text-left relative"
                  >
                    <AddMenu song={song} />
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 md:mb-4 border border-white/10 group-hover:border-[#ffcc00]/50 transition-colors shadow-xl">
                      <img 
                        src={getBestImage(song.image) || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                      <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 w-8 md:w-10 h-8 md:h-10 bg-[#ffcc00] rounded-full flex items-center justify-center text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(255,204,0,0.4)]">
                        <Play fill="currentColor" size={14} className="ml-0.5" />
                      </div>
                    </div>
                    <p className="text-[11px] md:text-[12px] font-black text-white truncate group-hover:text-[#ffcc00] transition-colors">
                      {song.name}
                    </p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mt-1">
                      {song.primaryArtists || 'Unknown Artist'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recently Played Section */}
          {recentlyPlayed.length > 0 && (
            <div className="animate-entrance">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <Clock className="text-[#ffcc00]" size={18} />
                  Recently Played
                </h2>
                <button 
                  onClick={() => playSong(recentlyPlayed[0], recentlyPlayed, 0)}
                  className="flex items-center gap-2 bg-[#ffcc00] text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play fill="currentColor" size={10} /> Play All
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                {recentlyPlayed.slice(0, 15).map((song) => (
                  <button
                    key={'recent-'+song.id}
                    onClick={() => handlePlaySong(song, recentlyPlayed)}
                    className="snap-start shrink-0 w-36 md:w-44 group text-left relative"
                  >
                    <AddMenu song={song} />
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 md:mb-4 border border-white/10 group-hover:border-[#ffcc00]/50 transition-colors shadow-xl">
                      <img 
                        src={getBestImage(song.image) || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                      <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 w-8 md:w-10 h-8 md:h-10 bg-[#ffcc00] rounded-full flex items-center justify-center text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(255,204,0,0.4)]">
                        <Play fill="currentColor" size={14} className="ml-0.5" />
                      </div>
                    </div>
                    <p className="text-[11px] md:text-[12px] font-black text-white truncate group-hover:text-[#ffcc00] transition-colors">
                      {song.name}
                    </p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mt-1">
                      {song.primaryArtists || 'Unknown Artist'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* My Playlists Section */}
          <div className="animate-entrance">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                <ListMusic className="text-[#ffcc00]" size={18} />
                My Playlists
              </h2>
              <button 
                onClick={() => {
                  const name = prompt("Enter a name for your new playlist:");
                  if (name) createPlaylist(name);
                }}
                className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
              >
                <Plus size={10} /> Create New
              </button>
            </div>
            
            {playlists.length === 0 ? (
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold py-4">No custom playlists yet. Create one to save your favorite hits!</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                {playlists.map((playlist) => (
                  <div key={'my-pl-'+playlist.id} className="snap-start shrink-0 w-36 md:w-44 group relative bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-[#ffcc00]/30 rounded-2xl p-4 transition-all">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete playlist?')) deletePlaylist(playlist.id); }} className="p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="w-full aspect-square bg-gradient-to-br from-white/5 to-white/0 rounded-xl mb-4 flex items-center justify-center border border-white/5">
                      <MusicIcon size={32} className="text-white/20 group-hover:text-[#ffcc00] transition-colors duration-500" />
                    </div>
                    <h3 className="text-[11px] md:text-[12px] font-black text-white truncate mb-1 pr-4">{playlist.name}</h3>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{playlist.songs.length} Songs</p>
                    
                    {playlist.songs.length > 0 && (
                      <button 
                        onClick={() => playSong(playlist.songs[0], playlist.songs, 0)}
                        className="mt-3 w-full py-2 bg-[#ffcc00]/10 text-[#ffcc00] hover:bg-[#ffcc00] hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        Play
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Playlists Loader/Render */}
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#ffcc00]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcc00]">Loading Universe...</span>
              </div>
            </div>
          ) : (
            playlistsData.map(playlist => (
              <div key={playlist.id} className="animate-entrance">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                    <ListMusic className="text-[#ffcc00]" size={18} />
                    {playlist.name}
                  </h2>
                  <button 
                    onClick={() => handlePlayPlaylist(playlist)}
                    className="flex items-center gap-2 bg-[#ffcc00] text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Play fill="currentColor" size={10} /> Play All
                  </button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x">
                  {playlist.songs?.map((song, idx) => (
                    <button
                      key={song.id}
                      onClick={() => handlePlaySong(song, playlist.songs)}
                      className="snap-start shrink-0 w-36 md:w-44 group text-left relative"
                    >
                      <AddMenu song={song} />
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 md:mb-4 border border-white/10 group-hover:border-[#ffcc00]/50 transition-colors shadow-xl">
                        <img 
                          src={getBestImage(song.image)} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                        <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 w-8 md:w-10 h-8 md:h-10 bg-[#ffcc00] rounded-full flex items-center justify-center text-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(255,204,0,0.4)]">
                          <Play fill="currentColor" size={14} className="ml-0.5" />
                        </div>
                      </div>
                      <p className="text-[11px] md:text-[12px] font-black text-white truncate group-hover:text-[#ffcc00] transition-colors">
                        {song.name}
                      </p>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate mt-1">
                        {song.primaryArtists || 'Unknown Artist'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
