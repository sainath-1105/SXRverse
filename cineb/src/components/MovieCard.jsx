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
        <Link to={`/watch/${t}/${item.id}`} className="group relative block w-full overflow-hidden rounded-[24px] bg-[#0a0812] border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 cursor-pointer shadow-2xl hover:shadow-primary/10">
            <div className="relative aspect-[2/3] w-full bg-[#020308] overflow-hidden">
                <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-[1500ms] group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                />

                {/* Media Type Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-[#020308]/60 backdrop-blur-xl border border-white/10 text-white/50 px-3 py-1.5 rounded-xl font-black text-[7px] uppercase tracking-[0.3em] shadow-2xl">
                        {t}
                    </div>
                </div>

                {/* Rating Badge */}
                <div className={`absolute top-4 right-4 backdrop-blur-xl border px-3 py-1.5 rounded-xl font-black text-[9px] flex items-center gap-1.5 z-20 shadow-2xl ${ratingColor}`}>
                    <Star size={10} className="fill-current" /> {rating}
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020308] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-background shadow-[0_0_50px_rgba(0,224,84,0.4)] transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out">
                        <Play size={24} className="fill-current translate-x-0.5" />
                    </div>
                </div>
            </div>

            <div className="p-5 bg-gradient-to-b from-[#0a0812] to-[#020308]">
                <h3 className="text-[13px] font-black truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors duration-500 italic">{title}</h3>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{date}</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">H265</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
