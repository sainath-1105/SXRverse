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
        <div className="mb-14 px-8 max-w-[1600px] mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(0,255,133,0.5)]"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{title}</h2>
                </div>
                <Link to={type === 'movie' ? '/movies' : '/anime'} className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted hover:text-primary transition-all duration-300 flex items-center gap-2 group">
                    View Network <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide snap-x">
                {items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="snap-start w-40 sm:w-48 lg:w-56 flex-shrink-0 transition-transform duration-500 hover:scale-105">
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
                // Find first item with a backdrop image
                const item = data.results.find(i => i.backdrop_path);
                if (item) setFeatured(item);
            }
        });
    }, []);

    return (
        <div className="pb-10">
            {/* Featured Hero Banner */}
            {featured ? (
                <div className="px-4 md:px-8 mb-16 w-full max-w-[1600px] mx-auto mt-4 md:mt-6">
                    <div className="h-[60vh] md:h-[75vh] rounded-[32px] md:rounded-[40px] bg-background border border-white/5 flex items-end p-6 sm:p-12 md:p-20 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                        {/* Background Image */}
                        <img
                            src={getImageUrl(featured.backdrop_path, 'w1280')}
                            alt={featured.title || featured.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-[2000ms] ease-out"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block"></div>

                        <div className="relative z-10 max-w-4xl animate-in">
                            <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <span className="bg-primary text-background px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-primary/20">
                                    Now Trending
                                </span>
                                <div className="h-[1px] w-8 md:w-12 bg-white/10"></div>
                                <span className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hidden sm:inline ">Vault Entry #771</span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-4 md:mb-6 tracking-tighter leading-[0.9] drop-shadow-2xl  italic uppercase">{featured.title || featured.name}</h1>

                            <div className="flex items-center gap-4 md:gap-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-10 flex-wrap">
                                <div className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-lg">
                                    <span className="text-xs">★</span>
                                    <span>{featured.vote_average?.toFixed(1)}</span>
                                </div>
                                <span className="text-white/20">•</span>
                                <span className="text-textMuted/80">{(featured.release_date || featured.first_air_date || '').slice(0, 4)}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">{featured.media_type}</span>
                            </div>

                            <p className="text-textMuted mb-8 md:mb-12 line-clamp-2 leading-relaxed text-xs md:text-lg md:w-2/3 opacity-80">
                                {featured.overview}
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <Link to={`/watch/${featured.media_type}/${featured.id}`} className="bg-primary text-background font-black py-3 md:py-4.5 px-8 md:px-12 rounded-xl md:rounded-2xl shadow-xl shadow-primary/10 hover:bg-primaryDark transition-all flex items-center justify-center gap-3 text-xs md:text-sm">
                                    <Play size={18} fill="currentColor" /> Watch Now
                                </Link>
                                <button className="bg-white/5 backdrop-blur-xl text-white font-black py-3 md:py-4.5 px-8 md:px-12 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs md:text-sm">
                                    Add to My List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 md:px-8 mb-16 w-full max-w-[1600px] mx-auto mt-4 md:mt-6">
                    <div className="h-[60vh] md:h-[75vh] rounded-[32px] md:rounded-[40px] bg-card/50 border border-white/5 animate-pulse"></div>
                </div>
            )}

            {/* Continue Watching */}
            {history && history.length > 0 && (
                <div className="mb-14 px-8 max-w-[1600px] mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_12px_rgba(188,0,255,0.5)]"></div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Resuming Playback</h2>
                    </div>

                    <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-hide snap-x">
                        {history.map((item, idx) => (
                            <div key={`history-${item.id}-${idx}`} className="snap-start w-40 sm:w-48 lg:w-56 flex-shrink-0 relative">
                                <MovieCard item={item} type={item.media_type} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Row title="Trending Movies" fetchUrl="/trending/movie/day" type="movie" />
            <Row title="Trending Shows" fetchUrl="/trending/tv/day" type="tv" />
            <Row title="Top Rated Movies" fetchUrl="/movie/top_rated" type="movie" />
        </div>
    );
}
