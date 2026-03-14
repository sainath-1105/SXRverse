import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';
import { Star, Play } from 'lucide-react';

export default function MovieCard({ item, type }) {
    const t = type || item.media_type || 'movie';
    const title = item.title || item.name;
    const date = (item.release_date || item.first_air_date || '').slice(0, 4);
    const ratingNum = item.vote_average || 0;
    const rating = ratingNum ? ratingNum.toFixed(1) : 'N/A';

    // Conditional colors for the badge
    const ratingColor = ratingNum >= 8.0 ? 'text-primary border-primary/30 bg-primary/10 ' :
        ratingNum >= 6.0 ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
            ratingNum > 0 ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                'text-gray-500 border-gray-500/30 bg-gray-500/10';

    const poster = getImageUrl(item.poster_path, 'w342');

    return (
        <Link to={`/watch/${t}/${item.id}`} className="group relative block w-full overflow-hidden rounded-[28px] bg-card border border-white/5 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 cursor-pointer shadow-2xl hover:shadow-primary/5 group">
            <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white/70 px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-[0.2em] shadow-xl">
                        {t}
                    </div>
                </div>

                <div className={`absolute top-4 right-4 backdrop-blur-md border px-3 py-1 rounded-xl font-black text-[10px] flex items-center gap-1.5 z-20 shadow-xl ${ratingColor}`}>
                    <Star size={10} className="fill-current" /> {rating}
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_40px_rgba(0,255,133,0.6)] transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out">
                        <Play size={28} className="fill-current translate-x-0.5" />
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-5 bg-gradient-to-b from-card to-background">
                <h3 className="text-xs md:text-sm font-black truncate text-white uppercase tracking-tighter group-hover:text-primary transition-colors duration-300 ">{title}</h3>
                <div className="flex items-center justify-between mt-2 md:mt-3">
                    <span className="text-[9px] md:text-[11px] font-bold text-textMuted uppercase tracking-widest">{date}</span>
                    <div className="h-[1px] w-4 bg-white/10"></div>
                    <span className="text-[9px] md:text-[11px] font-black text-accent uppercase tracking-[0.2em] ">PREMIUM 4K</span>
                </div>
            </div>
        </Link>
    );
}
