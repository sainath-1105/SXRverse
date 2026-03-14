import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchManga } from '../api';
import { BookOpen, Star, Clock, List, ArrowLeft, Share2, Heart } from 'lucide-react';

export default function MangaDetails() {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const [chapters, setChapters] = useState([]);
    const [fetchingChapters, setFetchingChapters] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        fetchManga(`/manga/${id}/full`).then(async (data) => {
            if (data && data.data) {
                setDetail(data.data);

                // Fetch Chapters from MangaDex
                setFetchingChapters(true);
                try {
                    const title = data.data.title;
                    const searchRes = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1`);
                    const searchData = await searchRes.json();
                    if (searchData.data?.length > 0) {
                        const mdId = searchData.data[0].id;
                        const feedRes = await fetch(`https://api.mangadex.org/manga/${mdId}/feed?translatedLanguage[]=en&limit=500&order[chapter]=asc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`);
                        const feedData = await feedRes.json();
                        if (feedData.data) {
                            const unique = feedData.data.filter((v, i, a) => a.findIndex(t => t.attributes.chapter === v.attributes.chapter) === i);
                            setChapters(unique);
                        }
                    }
                } catch (e) {
                    console.error("Dex Chapter Fetch Error:", e);
                }
                setFetchingChapters(false);
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="p-10 text-center animate-pulse text-primary font-black uppercase tracking-[0.5em] text-xs">Initializing Neural Link...</div>;
    if (!detail) return <div className="p-10 text-center text-red-500 font-black uppercase tracking-widest text-xs">Archive Not Found</div>;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-10">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-textMuted hover:text-white transition-colors mb-6 md:mb-10 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Return to Archives</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* Visual Section */}
                <div className="w-full lg:w-[450px] shrink-0">
                    <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative group aspect-[2/3] w-full max-w-[450px] mx-auto">
                        <img
                            src={detail.images?.jpg?.large_image_url}
                            alt={detail.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"></div>
                        <div className="absolute inset-x-0 bottom-0 p-8 flex items-center gap-3">
                            <Link
                                to={`/manga/read/${id}`}
                                className="flex-1 bg-primary text-background font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl hover:bg-primaryDark transition-all text-xs uppercase tracking-widest active:scale-95"
                            >
                                <BookOpen size={18} /> INITIALIZE READING
                            </Link>
                            <button className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95">
                                <Heart size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-glow-green">
                            {detail.type} Archive
                        </span>
                        <div className="h-[1px] w-8 bg-white/10 hidden sm:block"></div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ranked #{detail.rank}</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-none uppercase break-words italic text-glow-green">
                        {detail.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest mb-12">
                        <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl shadow-inner">
                            <Star size={12} className="fill-current" />
                            <span>{detail.score} Integrity</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 text-white/60 border border-white/10 px-4 py-2 rounded-xl">
                            <Clock size={12} />
                            <span>{detail.status}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded-xl text-glow-purple">
                            <List size={12} />
                            <span>{chapters.length || detail.chapters || '??'} Segments</span>
                        </div>
                    </div>

                    <div className="mb-14">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <div className="w-2 h-4 bg-primary rounded-full shadow-[0_0_10px_#00E054]"></div> Overview
                        </h3>
                        <p className="text-textMuted leading-relaxed text-sm md:text-xl max-w-4xl opacity-80 italic tracking-tight">
                            {detail.synopsis}
                        </p>
                    </div>

                    {/* Chapter Feed Section (MangaFire Style) */}
                    <div className="mb-14">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="w-2 h-4 bg-accent rounded-full shadow-[0_0_10px_#BC00FF]"></div> Transmission Feed
                            </h3>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Ready to Uplink</span>
                        </div>

                        {fetchingChapters ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        ) : chapters.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                {chapters.map(ch => (
                                    <Link
                                        key={ch.id}
                                        to={`/manga/read/${id}`}
                                        className="group p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary hover:bg-primary/20 transition-all text-center relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                                        <span className="relative z-10 text-[11px] font-black text-textMuted group-hover:text-primary transition-colors uppercase tracking-widest">CH. {ch.attributes.chapter}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 italic">
                                <p className="text-textMuted text-[10px] font-black uppercase tracking-widest leading-loose">No direct transmission feed detected. Accessing fallback archives...</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Origins</h3>
                            <div className="space-y-4">
                                {detail.authors?.map(author => (
                                    <div key={author.mal_id} className="flex flex-col group cursor-default">
                                        <span className="text-white font-black uppercase tracking-tighter text-base group-hover:text-primary transition-colors">{author.name}</span>
                                        <span className="text-[9px] text-textMuted uppercase tracking-widest font-black opacity-50">Mastermind</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Neural Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {detail.genres?.map(genre => (
                                    <span key={genre.mal_id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-textMuted hover:text-primary hover:border-primary/30 transition-all cursor-default">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
