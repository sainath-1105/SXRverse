import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Radio, Tv, Play, Users, Volume2, Info } from 'lucide-react';

export default function Channels() {
    const [genres, setGenres] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeHero, setActiveHero] = useState(null);

    useEffect(() => {
        // Fetch TV genres as channels
        fetchApi('/genre/tv/list').then(data => {
            if (data && data.genres) {
                setGenres(data.genres);
                setSelectedChannel(data.genres[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedChannel) {
            setLoading(true);
            fetchApi('/discover/tv', { with_genres: selectedChannel.id }).then(data => {
                if (data && data.results) {
                    setItems(data.results);
                    setActiveHero(data.results[0]);
                }
                setLoading(false);
            });
        }
    }, [selectedChannel]);

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
            {/* Channel Lineup Sidebar */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-card/10 backdrop-blur-sm">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Radio size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Live Guide</h2>
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">Linear Feed</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {genres.map((g, idx) => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedChannel(g)}
                            className={`w-full flex items-center gap-4 p-4 rounded-[20px] transition-all duration-300 group ${selectedChannel?.id === g.id ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-[1.02]' : 'text-textMuted hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs transition-all ${selectedChannel?.id === g.id ? 'bg-background/20' : 'bg-white/5 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                0{idx + 1}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-widest">{g.name}</p>
                                <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60 ${selectedChannel?.id === g.id ? 'text-background' : 'text-primary'}`}>On Air</p>
                            </div>
                            {selectedChannel?.id === g.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-background animate-pulse shadow-[0_0_8px_white]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Feed */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-background/50">
                {/* Channel Player Preview */}
                {activeHero && (
                    <div className="relative h-[60vh] shrink-0 overflow-hidden group">
                        <img
                            src={getImageUrl(activeHero.backdrop_path, 'w1280')}
                            alt={activeHero.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                        <div className="absolute inset-x-0 bottom-0 p-12 flex items-end justify-between gap-10">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-primary px-3 py-1 rounded text-background text-[10px] font-black uppercase tracking-widest shadow-lg">LIVE</div>
                                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                        <Users size={12} className="text-primary" />
                                        12.4K TUNED IN
                                    </div>
                                </div>
                                <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase drop-shadow-2xl">{activeHero.name}</h1>
                                <p className="text-textMuted text-xs font-bold leading-relaxed line-clamp-2 max-w-xl uppercase tracking-widest opacity-80">{activeHero.overview}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link to={`/watch/tv/${activeHero.id}`} className="w-16 h-16 rounded-full bg-primary text-background flex items-center justify-center shadow-2xl hover:bg-primaryDark transition-all hover:scale-110 transform active:scale-95 group">
                                    <Play size={28} fill="currentColor" className="ml-1 transition-transform group-hover:rotate-12" />
                                </Link>
                                <div className="flex flex-col gap-2">
                                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                        <Volume2 size={18} />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                        <Info size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scanline Effect Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
                    </div>
                )}

                {/* Grid Content */}
                <div className="p-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,184,0,0.5)]"></div>
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase">Upcoming in {selectedChannel?.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => <MovieSkeleton key={i} />)
                        ) : (
                            items.slice(1).map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="relative group">
                                    <MovieCard item={item} type="tv" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[24px]"></div>
                                    <div className="absolute top-4 left-4 z-20 pointer-events-none transform -translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
                                        <div className="bg-primary text-background font-black text-[8px] px-2 py-0.5 rounded tracking-tighter shadow-xl">STREAMING</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
