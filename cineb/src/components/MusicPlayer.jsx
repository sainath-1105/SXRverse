import { useMusic } from '../context/MusicContext';
import { getBestImage } from '../api/musicApi';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Music2, ChevronUp, ListMusic, X, Heart, Plus
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, progress, duration,
    volume, setVolume, isMuted, setIsMuted,
    isLoading, repeatMode, cyclRepeat, isShuffled, setIsShuffled,
    togglePlay, handleNext, handlePrev, seek, queue, queueIndex,
  } = useMusic();
  const { toggleLike, isLiked, playlists, toggleSongInPlaylist } = useMusicLibrary();

  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const progressRef = useRef(null);
  const navigate = useNavigate();

  if (!currentSong) return null;

  const art = getBestImage(currentSong.image);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const artistNames = currentSong.primaryArtists || '';

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <>
      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-[72px] right-4 w-80 max-h-96 bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[199] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/50">Queue — {queue.length} songs</span>
            <button onClick={() => setShowQueue(false)} className="text-white/30 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            {queue.map((song, idx) => {
              const img = getBestImage(song.image);
              const active = idx === queueIndex;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-all ${active ? 'bg-[#1db954]/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/5">
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold truncate ${active ? 'text-[#1db954]' : 'text-white'}`}>{song.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{song.primaryArtists}</p>
                  </div>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddModal && currentSong && (
        <div className="fixed inset-0 z-[201] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#121212] border border-white/10 p-5 md:p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[80vh] animate-entrance" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
              <img src={getBestImage(currentSong.image)} className="w-12 h-12 rounded object-cover" alt="" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">Add to Playlist</h3>
                <p className="text-xs text-white/40 truncate">{currentSong.name}</p>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar space-y-2 mb-4">
              <button 
                onClick={() => { toggleLike(currentSong); setShowAddModal(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#450af5] to-[#e8115b] flex items-center justify-center shrink-0">
                  <Heart size={18} fill="white" className="text-white" />
                </div>
                <span className="font-bold text-sm text-white">Liked Songs</span>
                {isLiked(currentSong.id) && <span className="ml-auto text-xs text-[#1db954] font-bold">Added</span>}
              </button>
              
              {playlists.map(p => {
                const hasSong = p.songs.some(s => s.id === currentSong.id);
                return (
                  <button 
                    key={p.id}
                    onClick={() => { toggleSongInPlaylist(p.id, currentSong); setShowAddModal(false); }}
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

            {playlists.length === 0 && (
              <p className="text-xs text-center text-white/40 mb-4 px-4 leading-relaxed">
                You don't have any custom playlists yet. Create one from the <b className="text-[#1db954]">Music Dashboard</b> to add this song!
              </p>
            )}

            <button 
              onClick={() => setShowAddModal(false)}
              className="w-full py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mini Player Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[200] transition-all duration-500 ${expanded ? 'translate-y-full pointer-events-none' : ''}`}>
        {/* Progress bar at very top of bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="w-full h-1 bg-white/10 cursor-pointer group"
        >
          <div
            className="h-full bg-[#1db954] relative transition-all"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="bg-[#0d0d0d]/95 backdrop-blur-2xl border-t border-white/[0.07] px-3 md:px-6 py-2.5 flex items-center gap-3 md:gap-5">
          {/* Song info */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate('/music')}
          >
            <div className="relative shrink-0">
              <div className={`w-10 h-10 rounded-xl overflow-hidden border border-white/10 ${isPlaying ? 'ring-2 ring-[#1db954]/40' : ''}`}>
                {art
                  ? <img src={art} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1db954]/10 flex items-center justify-center"><Music2 size={16} className="text-[#1db954]" /></div>
                }
              </div>
              {isPlaying && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1db954] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              )}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-[12px] font-black text-white truncate">{currentSong.name}</p>
              <p className="text-[10px] text-white/40 truncate">{artistNames}</p>
            </div>
          </div>

          {/* Like Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }} 
            className="shrink-0 group hidden md:block mr-1 lg:mr-2"
          >
            <Heart size={16} fill={isLiked(currentSong.id) ? '#1db954' : 'none'} className={`transition-all ${isLiked(currentSong.id) ? 'text-[#1db954] scale-110' : 'text-white/30 group-hover:text-white'}`} />
          </button>

          {/* Add to Playlist Button */}
          <div className="relative shrink-0 hidden md:block mr-2 lg:mr-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
              className="p-1.5 text-white/30 hover:text-white transition-all hover:scale-110 hover:bg-white/5 rounded-full"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {/* Shuffle — desktop only */}
            <button
              onClick={() => setIsShuffled(s => !s)}
              className={`hidden md:flex p-2 rounded-lg transition-all ${isShuffled ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
            >
              <Shuffle size={15} />
            </button>

            <button onClick={handlePrev} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center hover:bg-white transition-all active:scale-90 shadow-lg shadow-[#1db954]/20"
            >
              {isLoading
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />
              }
            </button>

            <button onClick={handleNext} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
              <SkipForward size={18} />
            </button>

            {/* Repeat — desktop only */}
            <button
              onClick={cyclRepeat}
              className={`hidden md:flex p-2 rounded-lg transition-all ${repeatMode !== 'none' ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
            >
              <RepeatIcon size={15} />
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Time — desktop only */}
            <span className="hidden lg:block text-[10px] font-mono text-white/30">
              {formatTime(progress)} / {formatTime(duration)}
            </span>

            {/* Volume — desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setIsMuted(m => !m)} className="text-white/30 hover:text-white transition-colors p-1">
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={isMuted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); if (isMuted) setIsMuted(false); }}
                className="w-20 accent-[#1db954] cursor-pointer"
              />
            </div>

            {/* Queue toggle */}
            <button
              onClick={() => setShowQueue(q => !q)}
              className={`p-2 rounded-lg transition-all ${showQueue ? 'text-[#1db954]' : 'text-white/30 hover:text-white'}`}
            >
              <ListMusic size={16} />
            </button>

            {/* Expand */}
            <button
              onClick={() => navigate('/now-playing')}
              className="p-2 text-white/30 hover:text-white transition-colors"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
