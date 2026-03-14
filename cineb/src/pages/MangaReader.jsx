import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchManga } from '../api';
import { ChevronUp, ChevronDown, ArrowLeft, Settings, Maximize2, Monitor, BookOpen, List } from 'lucide-react';

export default function MangaReader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [progress, setProgress] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [readingMode, setReadingMode] = useState('vertical'); // vertical or horizontal
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollTop = useRef(0);
    const containerRef = useRef(null);

    const [pages, setPages] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [mangaDexId, setMangaDexId] = useState(null);

    // Initial Metadata and Chapter List Fetch
    useEffect(() => {
        const loadMangaMetadata = async () => {
            try {
                // 1. Fetch Jikan Metadata
                const metaRes = await fetchManga(`/manga/${id}/full`);
                if (metaRes && metaRes.data) {
                    setDetail(metaRes.data);
                    const title = metaRes.data.title;

                    // 2. Search MangaDex for the UUID and Chapter Feed
                    const searchRes = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1`);
                    const searchData = await searchRes.json();

                    if (searchData.data && searchData.data.length > 0) {
                        const mdId = searchData.data[0].id;
                        setMangaDexId(mdId);

                        // Recursive fetch to get ALL chapters (MangaDex limits to 500 per request)
                        const fetchAllChapters = async (offset = 0, accrued = []) => {
                            const feedRes = await fetch(`https://api.mangadex.org/manga/${mdId}/feed?translatedLanguage[]=en&limit=500&offset=${offset}&order[chapter]=asc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`);
                            const feedData = await feedRes.json();

                            const newAccrued = [...accrued, ...feedData.data];
                            if (feedData.total > offset + 500) {
                                return fetchAllChapters(offset + 500, newAccrued);
                            }
                            return newAccrued;
                        };

                        const allChapters = await fetchAllChapters();

                        if (allChapters.length > 0) {
                            // Filter unique chapters by chapter number, prioritizing higher IDs or better quality if needed
                            // Here we just keep the first one we find for each chapter number
                            const uniqueChapters = allChapters.filter((v, i, a) =>
                                a.findIndex(t => t.attributes.chapter === v.attributes.chapter) === i
                            );

                            setChapters(uniqueChapters);
                            setCurrentChapter(uniqueChapters[0]); // Default to first chapter
                        }
                    }
                }
            } catch (err) {
                console.error("Manga Metadata Retrieval Failed:", err);
            }
        };

        loadMangaMetadata();
    }, [id]);

    // Page Loader (Triggers when chapter changes)
    useEffect(() => {
        const loadPages = async () => {
            if (!currentChapter) return;
            setLoading(true);
            try {
                const chapterId = currentChapter.id;
                const atHomeRes = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
                const atHomeData = await atHomeRes.json();

                if (atHomeData.chapter) {
                    const host = atHomeData.baseUrl;
                    const hash = atHomeData.chapter.hash;
                    const pageUrls = atHomeData.chapter.data.map(
                        filename => `${host}/data/${hash}/${filename}`
                    );
                    setPages(pageUrls);
                    if (containerRef.current) containerRef.current.scrollTo(0, 0);
                }
            } catch (err) {
                console.error("Page Fetch Failed:", err);
            }
            setLoading(false);
        };

        loadPages();

        const handleScroll = () => {
            if (containerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

                // Progress Calculation
                const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
                setProgress(scrolled);

                // Auto-hide Header Logic
                if (scrollTop > lastScrollTop.current && scrollTop > 100) {
                    setShowHeader(false);
                } else {
                    setShowHeader(true);
                }
                lastScrollTop.current = scrollTop;
            }
        };

        const container = containerRef.current;
        if (container) container.addEventListener('scroll', handleScroll);
        return () => {
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, [currentChapter]);

    if (loading) return <div className="h-screen bg-background flex items-center justify-center text-primary font-black uppercase tracking-[0.5em] animate-pulse">Initializing Neural Link...</div>;

    return (
        <div className="fixed inset-0 bg-[#020308] z-[100] flex flex-col overflow-hidden text-white font-sans">
            {/* MangaFire-Style Tactical Header */}
            <header
                className={`fixed top-0 left-0 right-0 h-16 md:h-20 border-b border-white/5 bg-background/90 backdrop-blur-2xl flex items-center justify-between px-4 md:px-8 z-[110] transition-transform duration-500 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}
            >
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => navigate(-1)} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all text-textMuted hover:text-white border border-white/5 shadow-inner">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest leading-none mb-1 truncate max-w-[150px] md:max-w-[300px]">{detail?.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[7px] md:text-[9px] text-primary font-black uppercase tracking-[0.2em] opacity-80">
                                Chapter {currentChapter?.attributes.chapter || '0'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/5 items-center">
                        <button onClick={() => setReadingMode(readingMode === 'vertical' ? 'horizontal' : 'vertical')} className="p-2 text-textMuted hover:text-white transition-all flex items-center gap-2">
                            <Monitor size={14} className={readingMode === 'horizontal' ? 'text-primary' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none hidden md:block">{readingMode} Mode</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 md:p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl border border-white/5 transition-all flex items-center gap-2 md:gap-3 group"
                    >
                        <List size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">Chapters Feed</span>
                    </button>
                </div>
            </header>

            {/* Main Reading Matrix */}
            <div
                ref={containerRef}
                className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center bg-[radial-gradient(circle_at_center,_#0a0812_0%,_#020308_100%)] ${readingMode === 'horizontal' ? 'overflow-x-auto snap-x snap-mandatory' : ''}`}
            >
                {/* HUD Calibration Overlay */}
                <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

                <div className={`w-full flex ${readingMode === 'horizontal' ? 'flex-row' : 'flex-col items-center'} pt-24 md:pt-32 pb-40`}>
                    {pages.length > 0 ? (
                        pages.map((url, i) => (
                            <div
                                key={i}
                                className={`relative group mb-4 md:mb-8 transition-all duration-700 hover:border-primary/20 flex flex-col items-center ${readingMode === 'horizontal' ? 'snap-center flex-shrink-0 w-screen h-[calc(100vh-120px)]' : 'w-full px-4'}`}
                                style={{ width: readingMode === 'vertical' ? `${zoom}%` : '', maxWidth: readingMode === 'vertical' ? '1200px' : '' }}
                            >
                                <img
                                    src={url}
                                    alt={`Page ${i + 1}`}
                                    className={`${readingMode === 'horizontal' ? 'h-full w-auto object-contain' : 'w-full h-auto'} block select-none shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5 rounded-lg md:rounded-2xl`}
                                    loading="lazy"
                                />
                                {/* Neural Scan Line */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 shadow-[0_0_20px_#00E054] opacity-0 group-hover:opacity-100 animate-scan pointer-events-none"></div>

                                <div className="mt-4 text-[8px] font-black text-white/20 uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">
                                    [ Page Segment {i + 1} // Calibrated ]
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center w-full">
                            <h3 className="text-xl font-black text-white/40 uppercase tracking-widest ">Neural Feed Blocked / Not Found</h3>
                        </div>
                    )}

                    {/* End Link Sequence */}
                    <div className="py-32 flex flex-col items-center text-center w-full">
                        <div className="w-24 h-24 rounded-[40px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-10 animate-pulse shadow-2xl shadow-primary/10">
                            <BookOpen size={40} />
                        </div>
                        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic ">Sector Concluded</h2>
                        <p className="text-textMuted font-black uppercase tracking-[0.3em] text-[10px] max-w-xs leading-loose mb-12">The next transmission is pending. Frequency update required.</p>

                        <div className="flex flex-col sm:flex-row gap-6 w-full px-8 sm:w-auto">
                            <button onClick={() => navigate(-1)} className="px-12 py-5 bg-white text-black rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">
                                Archive Access
                            </button>
                            <button
                                onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                            >
                                Re-sync Sector
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MangaFire floating Page HUD */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] transition-transform duration-500 ${showHeader ? 'translate-y-0' : 'translate-y-20'}`}>
                <div className="bg-card/80 backdrop-blur-3xl border border-white/10 px-4 sm:px-8 py-3 sm:py-4 rounded-3xl sm:rounded-[32px] flex items-center gap-4 sm:gap-8 shadow-[0_40px_80px_rgba(0,0,0,0.4)] w-[90vw] sm:w-auto">
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div className="w-full sm:w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_#00E054]" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.4em] italic">Depth: {Math.round(progress)}%</span>
                    </div>

                    <div className="h-8 w-[1px] bg-white/10"></div>

                    <div className="hidden sm:flex bg-white/5 p-1 rounded-2xl border border-white/5 items-center">
                        <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 text-textMuted hover:text-white transition-colors">－</button>
                        <span className="px-4 text-[10px] font-black text-white tabular-nums">{zoom}%</span>
                        <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 text-textMuted hover:text-white transition-colors">＋</button>
                    </div>

                    <button className="p-3 bg-primary text-background rounded-2xl shadow-xl hover:scale-105 transition-all ">
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Right Chapter Drawer (MangaFire Style) */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[150] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="relative w-80 md:w-[450px] bg-background border-l border-white/10 h-full flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-widest uppercase italic ">Chapter Index</h3>
                                <p className="text-[9px] text-textMuted font-black uppercase tracking-widest mt-1 opacity-60">Neural Uplink Stable</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-textMuted hover:text-white transition-all">
                                <ArrowLeft size={20} className="rotate-180" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                            {chapters.map((ch, idx) => (
                                <button
                                    key={ch.id}
                                    onClick={() => {
                                        setCurrentChapter(ch);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${currentChapter?.id === ch.id ? 'bg-primary border-primary text-background shadow-2xl shadow-primary/20 scale-[1.02]' : 'bg-card/50 border-white/5 text-textMuted hover:border-white/20 hover:text-white hover:bg-white/5'}`}
                                >
                                    <div className="flex flex-col">
                                        <div className={`text-[11px] font-black uppercase tracking-widest ${currentChapter?.id === ch.id ? 'text-background' : 'text-primary '}`}>
                                            CH. {ch.attributes.chapter || '0'}
                                        </div>
                                        <div className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-tight truncate max-w-[200px]">
                                            {ch.attributes.title || 'Untitled Segment'}
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${currentChapter?.id === ch.id ? 'bg-background/20' : 'bg-white/5 group-hover:bg-primary/20'}`}>
                                        <BookOpen size={14} className={currentChapter?.id === ch.id ? 'text-background' : 'text-textMuted group-hover:text-primary'} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* HUD Sidebars */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-10 pointer-events-none z-0">
                <div className="w-[1px] h-40 bg-gradient-to-b from-transparent via-primary to-transparent"></div>
                <div className="text-[8px] font-black text-white uppercase tracking-[0.5em] vertical-text">NEURAL LINK ACTIVE</div>
                <div className="w-[1px] h-40 bg-gradient-to-b from-transparent via-accent to-transparent"></div>
            </div>
            <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-10 pointer-events-none z-0">
                <div className="w-[1px] h-40 bg-gradient-to-b from-transparent via-accent to-transparent"></div>
                <div className="text-[8px] font-black text-white uppercase tracking-[0.5em] vertical-text">SXRverse MANGA ENGINE</div>
                <div className="w-[1px] h-40 bg-gradient-to-b from-transparent via-primary to-transparent"></div>
            </div>
        </div>
    );
}
