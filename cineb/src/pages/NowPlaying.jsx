import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { getBestImage, getLyrics } from '../api/musicApi';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Heart, ArrowLeft, ListMusic,
  Timer, X, ChevronDown, Mic2
} from 'lucide-react';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function NowPlaying() {
  const navigate = useNavigate();
  const {
    currentSong, isPlaying, progress, duration,
    volume, setVolume, isMuted, setIsMuted,
    isLoading, repeatMode, cyclRepeat, isShuffled, setIsShuffled,
    togglePlay, handleNext, handlePrev, seek, queue, queueIndex,
    sleepTimer, startSleepTimer, clearSleepTimer,
  } = useMusic();
  const { toggleLike, isLiked } = useMusicLibrary();

  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const progressRef = useRef(null);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) return;
    setLyrics(null);
    if (currentSong.hasLyrics === 'true' || currentSong.hasLyrics === true) {
      setLoadingLyrics(true);
      getLyrics(currentSong.id).then(l => {
        setLyrics(l);
        setLoadingLyrics(false);
      });
    }
  }, [currentSong?.id]);

  if (!currentSong) {
    navigate('/music');
    return null;
  }

  const art = getBestImage(currentSong.image);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const artistNames = currentSong.primaryArtists || '';
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const sleepOptions = [5, 10, 15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-[300] bg-[#060606] flex flex-col overflow-hidden">
      {/* Background Art Blur */}
      {art && (
        <div className="absolute inset-0 z-0">
          <img src={art} alt="" className="w-full h-full object-cover opacity-20 blur-[100px] scale-150" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>
      )}

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate('/music')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronDown size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Now Playing
        </span>
        <div className="flex items-center gap-2">
          {/* Sleep Timer Button */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(s => !s)}
              className={`p-2 rounded-lg transition-all ${sleepTimer ? 'text-[#ffcc00]' : 'text-white/30 hover:text-white'}`}
            >
              <Timer size={18} />
            </button>
            {showSleepMenu && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px] z-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 px-3 py-2">Sleep Timer</p>
                {sleepTimer && (
                  <button
                    onClick={() => { clearSleepTimer(); setShowSleepMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    ✕ Cancel ({sleepTimer}m)
                  </button>
                )}
                {sleepOptions.map(m => (
                  <button
                    key={m}
                    onClick={() => { startSleepTimer(m); setShowSleepMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${sleepTimer === m ? 'text-[#ffcc00] bg-[#ffcc00]/10' : 'text-white/70 hover:bg-white/5'}`}
                  >
                    {m} Minutes
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Lyrics Toggle */}
          <button
            onClick={() => setShowLyrics(l => !l)}
            className={`p-2 rounded-lg transition-all ${showLyrics ? 'text-[#ffcc00]' : 'text-white/30 hover:text-white'}`}
          >
            <Mic2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 overflow-hidden">
        {/* Album Art */}
        <div className={`transition-all duration-700 ${showLyrics ? 'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80' : 'w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96'}`}>
          <div className={`w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 ${isPlaying ? 'ring-4 ring-[#ffcc00]/20' : ''} transition-all duration-500`}>
            {art
              ? <img src={art} alt="" className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse-slow' : ''}`} />
              : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Mic2 size={64} className="text-white/10" /></div>
            }
          </div>
        </div>

        {/* Lyrics Panel */}
        {showLyrics && (
          <div className="flex-1 max-w-lg h-64 md:h-80 lg:h-96 overflow-y-auto custom-scrollbar animate-entrance">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffcc00] mb-4 flex items-center gap-2">
              <Mic2 size={12} /> Lyrics
            </h3>
            {loadingLyrics ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-white/20 border-t-[#ffcc00] rounded-full animate-spin" />
              </div>
            ) : lyrics ? (
              <p className="text-sm md:text-base text-white/70 leading-relaxed whitespace-pre-line font-medium">
                {lyrics}
              </p>
            ) : (
              <p className="text-xs text-white/20 uppercase tracking-widest font-bold">
                Lyrics not available for this track
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 px-6 pb-8 space-y-4">
        {/* Song Info + Like */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-black text-white truncate">{currentSong.name}</h2>
            <p className="text-xs text-white/40 truncate mt-1 uppercase tracking-widest font-bold">{artistNames}</p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            className="shrink-0 ml-4 p-2 group"
          >
            <Heart
              size={24}
              fill={isLiked(currentSong.id) ? '#ffcc00' : 'none'}
              className={`transition-all duration-300 ${isLiked(currentSong.id) ? 'text-[#ffcc00] scale-110' : 'text-white/30 group-hover:text-white'}`}
            />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-[#ffcc00] rounded-full relative transition-all"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-white/30">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setIsShuffled(s => !s)}
            className={`p-2 rounded-lg transition-all ${isShuffled ? 'text-[#ffcc00]' : 'text-white/30 hover:text-white'}`}
          >
            <Shuffle size={20} />
          </button>

          <button onClick={handlePrev} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
            <SkipBack size={28} />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-[#ffcc00] text-black flex items-center justify-center hover:bg-white transition-all active:scale-90 shadow-xl shadow-[#ffcc00]/20"
          >
            {isLoading
              ? <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />
            }
          </button>

          <button onClick={handleNext} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
            <SkipForward size={28} />
          </button>

          <button
            onClick={cyclRepeat}
            className={`p-2 rounded-lg transition-all ${repeatMode !== 'none' ? 'text-[#ffcc00]' : 'text-white/30 hover:text-white'}`}
          >
            <RepeatIcon size={20} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setIsMuted(m => !m)} className="text-white/30 hover:text-white transition-colors">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); if (isMuted) setIsMuted(false); }}
            className="w-32 accent-[#ffcc00] cursor-pointer"
          />
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="hidden md:flex items-center justify-center gap-6 text-[8px] font-bold text-white/15 uppercase tracking-[0.2em]">
          <span>Space: Play/Pause</span>
          <span>←→: Seek 10s</span>
          <span>Shift+←→: Skip</span>
          <span>↑↓: Volume</span>
          <span>M: Mute</span>
        </div>
      </div>
    </div>
  );
}
