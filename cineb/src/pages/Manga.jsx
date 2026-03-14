import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchManga } from '../api';
import MangaCard from '../components/MangaCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search, X, Loader2 } from 'lucide-react';

export default function Manga() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('manga'); // manga, manhwa, manhua
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 600);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchItems = async (pageNum, reset = false) => {
        setLoading(true);
        const params = {
            page: pageNum,
            type: type,
            order_by: 'popularity',
            sort: 'desc'
        };

        // If there's a search query, Jikan uses /manga?q=... and sometimes ignores order_by/type if not careful
        // but typically q works with type.
        if (debouncedQuery.trim()) {
            params.q = debouncedQuery;
            delete params.order_by; // Search usually has its own relevance sorting
        }

        const data = await fetchManga('/manga', params);
        if (data && data.data) {
            if (reset || pageNum === 1) setItems(data.data);
            else setItems(prev => [...prev, ...data.data]);
        }
        setLoading(false);
    };

    useEffect(() => {
        setPage(1);
        fetchItems(1, true);
    }, [type, debouncedQuery]);

    useEffect(() => {
        if (page > 1) fetchItems(page);
    }, [page]);

    return (
        <div className="pb-10">
            {/* MangaFire-Style Featured Hero */}
            {items.length > 0 && page === 1 && !searchQuery && (
                <div className="px-4 md:px-8 mb-16 w-full max-w-[1600px] mx-auto mt-4 md:mt-6">
                    <div className="h-[50vh] md:h-[65vh] rounded-[32px] md:rounded-[40px] bg-[#0a0812] border border-white/5 flex items-end p-6 sm:p-12 md:p-20 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                        <img
                            src={items[0].images?.jpg?.large_image_url}
                            alt={items[0].title}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-[2000ms] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020308] via-[#020308]/60 to-transparent"></div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-50 shadow-[0_0_20px_rgba(0,224,84,0.3)]"></div>

                        <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-primary text-background px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-lg shadow-primary/20">
                                    Highly Anticipated
                                </span>
                                <div className="h-[1px] w-12 bg-white/10"></div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] text-glow-purple italic">Neural Vault #019</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[0.9] text-glow-green italic uppercase drop-shadow-2xl">{items[0].title}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest mb-10 opacity-70">
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="text-xs">★</span> {items[0].score || '8.9'}
                                </div>
                                <span className="text-white/20">•</span>
                                <span>{items[0].type}</span>
                                <span className="text-white/20">•</span>
                                <span>{items[0].status}</span>
                            </div>

                            <p className="text-textMuted mb-12 line-clamp-2 leading-relaxed text-sm md:text-lg md:w-2/3 opacity-80 uppercase tracking-tight">
                                {items[0].synopsis || 'Initializing data stream for this specific archive. Summary pending calibration...'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <Link to={`/manga/read/${items[0].mal_id}`} className="bg-primary text-background font-black py-4.5 px-12 rounded-2xl shadow-xl shadow-primary/10 hover:bg-primaryDark transition-all flex items-center justify-center gap-3 text-sm active:scale-95">
                                    Explore Chapter 01
                                </Link>
                                <Link to={`/manga/${items[0].mal_id}`} className="bg-white/5 backdrop-blur-xl text-white font-black py-4.5 px-12 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center justify-center">
                                    Archive Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8 md:gap-12 relative">
                {/* Filter Sidebar */}
                <aside className="w-full md:w-72 flex-shrink-0">
                    <div className="bg-card border border-white/5 rounded-[32px] p-8 md:sticky md:top-28 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 shadow-[0_0_15px_rgba(0,224,84,0.5)]"></div>
                        <h2 className="text-xl font-black text-white mb-8 tracking-tighter uppercase italic text-glow-green">Index Categories</h2>

                        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-3 scrollbar-hide">
                            <label className="hidden md:block text-[10px] font-black text-textMuted uppercase tracking-[0.2em] mb-4 ml-1">Archive Type</label>
                            {[
                                { id: 'manga', label: 'Japanese Manga' },
                                { id: 'manhwa', label: 'Korean Manhwa' },
                                { id: 'manhua', label: 'Chinese Manhua' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setType(t.id); setSearchQuery(''); }}
                                    className={`whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${type === t.id ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-[1.02]' : 'text-textMuted hover:text-white hover:bg-white/5 bg-white/[0.02] border border-white/5 md:border-none'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-14">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,224,84,0.4)]"></div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap italic">
                                Transmission <span className="text-white/20 text-2xl font-black">/ Reading Room</span>
                            </h1>
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <Search size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchQuery ? 'text-primary' : 'text-textMuted'}`} />
                            <input
                                type="text"
                                placeholder="Search Archives..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-card border border-white/5 text-white rounded-2xl py-5 pl-14 pr-12 outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-xs font-black uppercase tracking-widest placeholder:text-textMuted/40 shadow-inner"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-textMuted hover:text-white transition-all"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {items.length === 0 && !loading ? (
                        <div className="py-32 flex flex-col items-center text-center bg-card rounded-[48px] border border-white/5 shadow-inner">
                            <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-textMuted mb-8 animate-pulse">
                                <Search size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Neural Search Empty</h3>
                            <p className="text-textMuted text-[10px] font-black uppercase tracking-[0.3em] max-w-xs">Modify frequency parameters or try another sector.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 gap-y-10 md:gap-y-12">
                            {items.map((item, idx) => (
                                <div key={`${item.mal_id}-${idx}`} className="transition-transform duration-500 hover:scale-105">
                                    <MangaCard item={item} />
                                </div>
                            ))}

                            {loading && Array.from({ length: 10 }).map((_, i) => (
                                <MovieSkeleton key={`sk-${i}`} />
                            ))}
                        </div>
                    )}

                    <div className="mt-24 mb-10 flex justify-center">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={loading}
                            className="group relative px-20 py-6 bg-white/5 border border-white/10 rounded-[30px] overflow-hidden transition-all duration-500 hover:border-primary active:scale-95 disabled:opacity-20"
                        >
                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-[11px] group-hover:text-primary transition-colors">
                                {loading ? 'Loading Next Sector...' : 'Decompress More Archives'}
                            </span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
