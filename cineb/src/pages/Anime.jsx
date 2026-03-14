import { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';

export default function Anime() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchAnime = async (pageNum) => {
        setLoading(true);
        const params = {
            with_genres: '16',
            with_original_language: 'ja',
            sort_by: 'popularity.desc',
            page: pageNum,
        };
        const data = await fetchApi('/discover/tv', params);
        if (data && data.results) {
            if (pageNum === 1) setItems(data.results);
            else setItems(prev => [...prev, ...data.results]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnime(page);
    }, [page]);

    return (
        <div className="px-8 max-w-[1600px] mx-auto py-10">
            <div className="flex items-center gap-4 mb-14">
                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(255,184,0,0.4)]"></div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                    Anime <span className="text-white/20 text-2xl font-black">/ Collection</span>
                </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 gap-y-12">
                {items.map((item, idx) => (
                    <MovieCard key={`${item.id}-${idx}`} item={item} type="tv" />
                ))}

                {loading && Array.from({ length: 12 }).map((_, i) => (
                    <MovieSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            <div className="mt-20 mb-10 flex justify-center">
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="bg-white/5 border border-white/10 px-14 py-5 rounded-[24px] text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-background hover:border-primary hover:shadow-[0_20px_40px_rgba(255,184,0,0.2)] transition-all duration-500 disabled:opacity-20"
                >
                    {loading ? 'Analyzing...' : 'Dispatch Extra Findings'}
                </button>
            </div>
        </div>
    );
}
