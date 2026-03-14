import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetchApi('/search/multi', { query, include_adult: false }).then(data => {
                if (data && data.results) {
                    // Filter out actors/crew members, only show movies or TV shows with a poster
                    setItems(data.results.filter(i => i.media_type !== 'person' && i.poster_path));
                }
                setLoading(false);
            });
        }
    }, [query]);

    return (
        <div className="px-8 max-w-[1600px] mx-auto py-10">
            <div className="flex items-center gap-4 mb-14">
                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(0,224,84,0.4)]"></div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap italic ">
                    Search <span className="text-white/20 text-2xl font-black">/ {query}</span>
                </h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 gap-y-12">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <MovieSkeleton key={`sk-${i}`} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="bg-card/50 border border-white/5 rounded-[48px] p-24 flex flex-col items-center justify-center text-center shadow-inner mt-4 animate-in backdrop-blur-md">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full shadow-[0_0_15px_rgba(0,224,84,0.5)]"></div>
                        <div className="relative w-24 h-24 rounded-[32px] bg-background border border-white/10 flex items-center justify-center">
                            <SearchIcon size={40} className="text-primary/50" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">No Results Found</h3>
                    <p className="text-textMuted max-w-sm font-bold uppercase tracking-widest text-[10px] leading-loose">We couldn't find anything matching your search. Try different keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 gap-y-10 md:gap-y-12">
                    {items.map((item, idx) => (
                        <MovieCard key={`${item.id}-${idx}`} item={item} type={item.media_type} />
                    ))}
                </div>
            )}
        </div>
    );
}
