import { useEffect, useState } from 'react';
import { fetchApi } from '../api';
import MovieCard from '../components/MovieCard';
import MovieSkeleton from '../components/MovieSkeleton';

export default function TVShows() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [sort, setSort] = useState('popularity.desc');
    const [language, setLanguage] = useState('');

    const POPULAR_LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ru', name: 'Russian' },
    ];

    useEffect(() => {
        fetchApi('/genre/tv/list').then(data => {
            if (data && data.genres) setGenres(data.genres);
        });
    }, []);

    const fetchTV = async (pageNum, reset = false) => {
        setLoading(true);
        const params = {
            sort_by: sort,
            page: pageNum,
        };
        if (selectedGenre) params.with_genres = selectedGenre;
        if (language) params.with_original_language = language;

        const data = await fetchApi('/discover/tv', params);
        if (data && data.results) {
            if (reset || pageNum === 1) setItems(data.results);
            else setItems(prev => [...prev, ...data.results]);
        }
        setLoading(false);
    };

    useEffect(() => {
        setPage(1);
        fetchTV(1, true);
    }, [selectedGenre, sort, language]);

    useEffect(() => {
        if (page > 1) fetchTV(page);
    }, [page]);

    return (
        <div className="px-8 max-w-[1600px] mx-auto py-10 flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-72 flex-shrink-0">
                <div className="bg-card border border-white/5 rounded-[32px] p-8 sticky top-28 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
                    <h2 className="text-xl font-bold text-white mb-8 tracking-tight uppercase">Filters</h2>

                    <div className="mb-10">
                        <label className="block text-[11px] font-bold text-textMuted uppercase tracking-wider mb-3 ml-1">Sort By</label>
                        <select
                            className="w-full bg-background border border-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl focus:ring-0 focus:border-primary/50 block p-4 outline-none cursor-pointer hover:bg-white/5 transition-all"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="popularity.desc">Most Popular</option>
                            <option value="vote_average.desc">Top Rated</option>
                            <option value="first_air_date.desc">New Releases</option>
                        </select>
                    </div>

                    <div className="mb-10">
                        <label className="block text-[11px] font-bold text-textMuted uppercase tracking-wider mb-3 ml-1">Language</label>
                        <select
                            className="w-full bg-background border border-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl focus:ring-0 focus:border-primary/50 block p-4 outline-none cursor-pointer hover:bg-white/5 transition-all"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="">All Languages</option>
                            {POPULAR_LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-textMuted uppercase tracking-wider mb-3 ml-1">Genres</label>
                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                            <button
                                onClick={() => setSelectedGenre('')}
                                className={`text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!selectedGenre ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-[1.02]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                            >
                                All Genres
                            </button>
                            {genres.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setSelectedGenre(g.id)}
                                    className={`text-left px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedGenre == g.id ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-[1.02]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-4 mb-14">
                    <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(251,191,36,0.25)]"></div>
                    <h1 className="text-4xl font-bold text-white tracking-tighter uppercase whitespace-nowrap">
                        TV Shows
                    </h1>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
                    {items.map((item, idx) => (
                        <MovieCard key={`${item.id}-${idx}`} item={item} type="tv" />
                    ))}

                    {loading && Array.from({ length: 12 }).map((_, i) => (
                        <MovieSkeleton key={`sk-${i}`} />
                    ))}
                </div>

                <div className="mt-20 mb-10 flex justify-center">
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="bg-white/5 border border-white/10 px-14 py-5 rounded-[24px] text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-background hover:border-primary hover:shadow-[0_20px_40px_rgba(251,191,36,0.2)] transition-all duration-500 disabled:opacity-20"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            </div>
        </div >
    );
}
