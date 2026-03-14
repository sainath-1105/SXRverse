import { useEffect, useState } from 'react';
import { fetchApi, getImageUrl } from '../api';
import MovieCard from '../components/MovieCard';
import { ChevronRight, Play, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContinueWatching } from '../hooks/useContinueWatching';

function Row({ title, fetchUrl, type }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchApi(fetchUrl).then(data => {
            if (data && data.results) setItems(data.results);
        });
    }, [fetchUrl]);

    return (
        <div className="mb-20 px-4 md:px-8 max-w-[1600px] mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"></div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{title}</h2>
                </div>
                <Link to={type === 'movie' ? '/movies' : '/tv'} className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted hover:text-primary transition-all duration-300 flex items-center gap-3 group bg-white/5 px-6 py-3 rounded-full border border-white/5">
                    Explore <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
                {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="snap-start w-44 sm:w-56 lg:w-64 flex-shrink-0 transition-all duration-500 hover:scale-105">
                        <MovieCard item={item} type={type} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    const [featured, setFeatured] = useState(null);
    const { history } = useContinueWatching();

    useEffect(() => {
        fetchApi('/trending/all/day').then(data => {
            if (data && data.results && data.results.length > 0) {
                const item = data.results.find(i => i.backdrop_path);
                if (item) setFeatured(item);
            }
        });
    }, []);

    return (
        <div className="pb-20">
            {/* Featured Hero Banner */}
            {featured ? (
                <div className="px-0 md:px-8 mb-20 w-full max-w-[1600px] mx-auto sm:mt-4 md:mt-8">
                    <div className="h-[75vh] md:h-[85vh] rounded-none md:rounded-[48px] bg-background border-b md:border border-white/5 flex items-end p-8 sm:p-12 md:p-24 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                        {/* Background Image */}
                        <img
                            src={getImageUrl(featured.backdrop_path, 'original')}
                            alt={featured.title || featured.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 md:opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-[3000ms] ease-out"
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden lg:block"></div>

                        <div className="relative z-10 max-w-5xl animate-in duration-1000">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="bg-primary text-background px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(251,191,36,0.3)]">
                                    Trending
                                </span>
                                <div className="h-[1px] w-12 bg-white/10"></div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">SXR Premium Direct</span>
                            </div>

                            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-[0.85] drop-shadow-2xl uppercase italic">{featured.title || featured.name}</h1>

                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] mb-12 flex-wrap opacity-60">
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="text-xs">★</span>
                                    <span>{featured.vote_average?.toFixed(1)}</span>
                                </div>
                                <span className="text-white/20">/</span>
                                <span className="text-white">{(featured.release_date || featured.first_air_date || '').slice(0, 4)}</span>
                                <span className="text-white/20">/</span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">{featured.media_type}</span>
                            </div>

                            <p className="text-textMuted mb-16 line-clamp-3 leading-relaxed text-sm md:text-xl md:w-2/3 opacity-80 tracking-tight font-medium">
                                {featured.overview}
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                                <Link to={`/watch/${featured.media_type}/${featured.id}`} className="bg-primary text-background font-black py-5 md:py-6 px-10 md:px-16 rounded-[24px] shadow-[0_20px_40px_rgba(251,191,36,0.2)] hover:bg-primaryDark transition-all flex items-center justify-center gap-4 text-[12px] uppercase tracking-widest active:scale-95">
                                    <Play size={20} fill="currentColor" /> Watch Now
                                </Link>
                                <button className="bg-white/5 backdrop-blur-3xl text-white font-black py-5 md:py-6 px-10 md:px-16 rounded-[24px] border border-white/10 hover:bg-white/10 transition-all text-[12px] uppercase tracking-widest active:scale-95">
                                    + Watchlist
                                </button>
                            </div>
                        </div>

                        {/* Premium Tag Overlay */}
                        <div className="absolute top-12 right-12 hidden md:block">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">PRM-88219</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-0 md:px-8 mb-20 w-full max-w-[1600px] mx-auto sm:mt-4 md:mt-8">
                    <div className="h-[75vh] md:h-[85vh] rounded-none md:rounded-[48px] bg-card/50 border border-white/5 animate-pulse"></div>
                </div>
            )}

            {/* Continue Watching */}
            {history && history.length > 0 && (
                <div className="mb-20 px-8 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-10 bg-accent rounded-full shadow-[0_0_20px_rgba(252,165,165,0.4)]"></div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Resume Stream</h2>
                    </div>

                    <div className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide snap-x -mx-8 px-8 md:mx-0 md:px-0">
                        {history.map((item, idx) => (
                            <div key={`history-${item.id}-${idx}`} className="snap-start w-44 sm:w-56 lg:w-64 flex-shrink-0 relative transition-transform duration-500 hover:scale-105">
                                <MovieCard item={item} type={item.media_type} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Row title="Trending Cinema" fetchUrl="/trending/movie/day" type="movie" />
            <Row title="Direct TV" fetchUrl="/trending/tv/day" type="tv" />
            <Row title="Classics" fetchUrl="/movie/top_rated" type="movie" />
        </div>
    );
}

