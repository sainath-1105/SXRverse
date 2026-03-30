import { useEffect, useState } from 'react';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Play, Plus, Info, Zap, ArrowRight, Star, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [featured, setFeatured] = useState(null);
    const [dailyFilms, setDailyFilms] = useState([]);
    const [popularTv, setPopularTv] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [trend, daily, tv, arrivals] = await Promise.all([
                    fetchApi('/trending/all/day'),
                    fetchApi('/movie/popular'),
                    fetchApi('/tv/popular'),
                    fetchApi('/movie/now_playing')
                ]);

                if (trend?.results) setFeatured(trend.results[0]);
                if (daily?.results) setDailyFilms(daily.results.slice(0, 10));
                if (tv?.results) setPopularTv(tv.results.slice(0, 10));
                if (arrivals?.results) setNewArrivals(arrivals.results.slice(0, 12));
            } catch (err) {
                console.error("Home Load Error:", err);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white selection:bg-[#ffcc00] selection:text-black pb-20">
            {/* Immersive Hero (Image 4 Naruto/Stranger Things style) */}
            {featured && (
                <section className="relative h-[70vh] md:h-[85vh] w-full flex items-end overflow-hidden group -mt-14 md:-mt-20">
                    <div className="absolute inset-0">
                        <img
                            src={getImageUrl(featured.backdrop_path, 'original')}
                            className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-110 ease-out"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-transparent to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 md:px-16 pb-10 md:pb-20 animate-entrance">
                        <div className="flex flex-col gap-6 max-w-4xl">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#ffcc00] text-black px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    {featured.media_type === 'movie' ? 'FILM' : 'SERIAL'}
                                </span>
                                <div className="h-[1px] w-12 bg-white/20"></div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 tracking-widest uppercase">
                                     <Star size={10} className="text-[#ffcc00] fill-[#ffcc00]" />
                                     {featured.vote_average?.toFixed(1)} Rating
                                </div>
                            </div>

                            <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-black italic uppercase tracking-tighter leading-[0.85] text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                {featured.title || featured.name}
                            </h1>

                            <p className="text-white/70 text-base md:text-xl leading-relaxed max-w-2xl line-clamp-2 opacity-80 font-medium tracking-tight mb-8">
                                {featured.overview}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link to={`/watch/${featured.media_type}/${featured.id}`} className="bg-[#ffcc00] text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500 hover:bg-white hover:scale-105 shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                                    <Play size={18} fill="currentColor" /> Watch Now
                                </Link>
                                <Link to={`/watch/${featured.media_type}/${featured.id}`} className="bg-white/5 backdrop-blur-3xl border border-white/10 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-500 hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-3">
                                    <Info size={18} /> Description
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 space-y-16 md:space-y-32 mt-10">
                {/* Filmy Dnia (Image 4 Style Grid) */}
                <section>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                             <div className="w-1.5 h-8 bg-[#ffcc00] rounded-full shadow-[0_0_15px_rgba(255,204,0,0.4)]"></div>
                             <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Movies of the Day</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-10">
                        {loading 
                            ? Array.from({length: 5}).map((_, i) => <MovieSkeleton key={i} />)
                            : dailyFilms.slice(0, 5).map((item, idx) => (
                                <div key={item.id} className="animate-entrance" style={{ animationDelay: `${idx * 100}ms` }}>
                                     <PosterNode item={item} type="movie" />
                                </div>
                            ))
                        }
                    </div>
                </section>

                {/* Popularne Seriale */}
                <section>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                             <div className="w-1.5 h-8 bg-[#ff4d4d] rounded-full shadow-[0_0_15px_rgba(255,77,77,0.4)]"></div>
                             <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Popular Shows</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-10">
                        {loading 
                            ? Array.from({length: 5}).map((_, i) => <MovieSkeleton key={i} />)
                            : popularTv.slice(0, 5).map((item, idx) => (
                                <div key={item.id} className="animate-entrance" style={{ animationDelay: `${idx * 100}ms` }}>
                                     <PosterNode item={item} type="tv" />
                                </div>
                            ))
                        }
                    </div>
                </section>

                {/* Nowości Filmowe (Image 4 bottom list style) */}
                <section className="pb-40">
                    <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-4">
                             <div className="w-1.5 h-8 bg-white rounded-full"></div>
                             <h2 className="text-3xl font-black uppercase tracking-tighter text-white">New Releases</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-16 gap-y-8">
                        {loading 
                            ? Array.from({length: 9}).map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse"></div>)
                            : newArrivals.map((item, idx) => (
                                <Link 
                                    key={item.id} 
                                    to={`/watch/movie/${item.id}`} 
                                    className="flex items-center gap-6 group p-4 rounded-3xl transition-all duration-500 hover:bg-white/[0.03] animate-entrance"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="relative w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                        <img
                                            src={getImageUrl(item.poster_path, 'w185')}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                             <span className="text-[9px] font-black text-[#ffcc00] uppercase tracking-widest">New Arrival</span>
                                             <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                             <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{item.release_date?.slice(0, 4)}</span>
                                        </div>
                                        <h3 className="text-[15px] font-black text-white uppercase tracking-tight truncate mb-2 group-hover:text-[#ffcc00] transition-colors">{item.title}</h3>
                                        <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed h-[34px] group-hover:text-white/60 transition-colors">
                                            {item.overview}
                                        </p>
                                        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transform translate-x--4 group-hover:translate-x-0 transition-all duration-500">
                                             <span className="text-[10px] font-black uppercase text-[#ffcc00] tracking-widest">Watch Now</span>
                                             <ArrowRight size={12} className="text-[#ffcc00]" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </section>
            </div>

            {/* Tactical Footer Overlay */}
            <footer className="px-4 md:px-16 py-8 md:py-12 border-t border-white/5 bg-[#080808]">
                 <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="flex flex-col items-center md:items-start gap-4">
                         <div className="text-xl font-black uppercase tracking-tighter text-white">SXR VERSE</div>
                         <div className="flex gap-10 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">
                             <span>Terms of Use</span>
                             <span>Privacy Statement</span>
                             <span>System Access</span>
                         </div>
                     </div>
                     <div className="flex flex-col items-center md:items-end gap-4">
                         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">EDBAR AKSARA'S CREATIVE</div>
                         <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-[#ffcc00] shadow-inner">
                             @nndyyx_
                         </div>
                     </div>
                 </div>
            </footer>
        </div>
    );
}

function PosterNode({ item, type }) {
    return (
        <Link to={`/watch/${type}/${item.id}`} className="group block relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:border-[#ffcc00]/40">
            <img
                src={getImageUrl(item.poster_path, 'w500')}
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ease-out"
                alt=""
            />
            
            {/* Year Badge (Image 4 Style) */}
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-[#ffcc00] text-black px-3 py-1.5 rounded-xl text-[10px] font-black shadow-2xl transform transition-transform group-hover:scale-110">
                    {(item.release_date || item.first_air_date || '').slice(0, 4)}
                </div>
            </div>

            {/* Hover Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                         <div className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full"></div>
                         <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{item.media_type || type}</span>
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {item.title || item.name}
                    </h3>
                </div>
            </div>

        </Link>
    );
}
