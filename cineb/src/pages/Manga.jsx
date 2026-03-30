import { useEffect, useState } from 'react';
import { fetchManga } from '../api';
import MovieSkeleton from '../components/MovieSkeleton';
import { Search, Zap, TrendingUp, Filter, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Manga() {
    const [mangaList, setMangaList] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
             const [latest, trendData] = await Promise.all([
                 fetchManga('/manga?limit=24&order[rating]=desc'),
                 fetchManga('/manga?limit=10&order[popularity]=desc')
             ]);
             setMangaList(latest?.data || []);
             setTrending(trendData?.data || []);
             setLoading(false);
        };
        load();
    }, []);

    const hero = trending[0];

    return (
        <div className="min-h-screen bg-[#080808] text-white pt-32 pb-40 selection:bg-[#ff4d4d]">
            {/* Spotlight Hero (Image 3 Itachi Style) */}
            {hero && (
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12">
                    <div className="absolute inset-0 z-0">
                         <img 
                            src={hero.images?.jpg?.large_image_url} 
                            alt="" 
                            className="w-full h-full object-cover opacity-20 blur-sm scale-110" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
                         {/* Overhead Spotlight effect */}
                         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[120%] bg-radial-gradient from-[#ff4d4d]/10 to-transparent opacity-40 blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 max-w-[1200px] mx-auto text-center px-8 animate-entrance">
                         <h1 className="text-4xl md:text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tighter italic mb-6 leading-none">
                             Discover the Best <br /> <span className="text-[#ff4d4d]">Manga</span>
                         </h1>
                         <p className="text-white/40 text-[10px] md:text-sm max-w-2xl mx-auto mb-10 font-black uppercase tracking-[0.4em]">
                             Premium Manga Collection
                         </p>
                         <div className="flex items-center justify-center gap-6">
                              <Link to={`/manga/read/${hero.mal_id}`} className="bg-[#ff4d4d] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all">Read Now</Link>
                              <Link to={`/manga/${hero.mal_id}`} className="bg-white/5 border border-white/10 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all">Details</Link>
                         </div>
                    </div>
                </section>
            )}

            {/* Tactical Search & Filter Matrix (Image 3 Style) */}
            <section className="max-w-[1920px] mx-auto px-8 md:px-16 mb-20">
                <div className="bg-[#121212] border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="flex flex-col gap-8">
                        <div className="relative flex-1">
                             <input 
                                 type="text" 
                                 placeholder="Search Manga..." 
                                 className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-14 text-sm font-bold tracking-tight outline-none focus:border-[#ff4d4d] transition-all"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                             />
                             <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                             <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#ff4d4d] text-white px-8 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest">Search</button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            {['Quality', 'Genre', 'Rating', 'Year', 'Language', 'Order By'].map(f => (
                                <div key={f} className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{f}:</span>
                                    <div className="bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-[11px] font-bold text-white/60 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
                                        All <Filter size={10} className="opacity-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Two-Column Grid (Image 3 Style) */}
            <main className="max-w-[1920px] mx-auto px-8 md:px-16 grid grid-cols-1 xl:grid-cols-12 gap-16">
                 {/* Left Body: New Releases */}
                 <div className="xl:col-span-9 space-y-20">
                     <div className="flex items-center justify-between border-b border-white/5 pb-6">
                          <h2 className="text-2xl font-black uppercase tracking-tighter italic">New Releases</h2>
                          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-[#ff4d4d]">See More</Link>
                     </div>
                     
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                        {loading 
                            ? Array.from({length: 9}).map((_, i) => <MovieSkeleton key={i} />)
                            : mangaList.map((item, idx) => (
                                <Link 
                                    key={item.mal_id} 
                                    to={`/manga/${item.mal_id}`} 
                                    className="group animate-entrance"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 mb-6 group-hover:border-[#ff4d4d]/40 transition-all duration-700">
                                         <img src={item.images?.jpg?.large_image_url} alt="" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
 
                                    </div>
                                    <h3 className="text-[15px] font-black uppercase tracking-tight truncate group-hover:text-[#ff4d4d] transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                         <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest italic">{item.type}</span>
                                         <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                         <span className="text-[9px] font-bold text-[#ff4d4d] uppercase tracking-widest">Available</span>
                                    </div>
                                </Link>
                            ))
                        }
                     </div>
                 </div>

                 {/* Right Body: Top Trending (Image 3 Numbered List) */}
                 <aside className="xl:col-span-3 space-y-10">
                     <div className="flex items-center gap-4 mb-10">
                          <TrendingUp size={20} className="text-[#ff4d4d]" />
                          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Top Trending</h2>
                     </div>

                     <div className="flex flex-col gap-6">
                         {trending.map((item, idx) => (
                             <Link key={item.mal_id} to={`/manga/${item.mal_id}`} className="flex items-center gap-6 group p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-500">
                                 <div className="text-3xl font-black italic tracking-tighter text-white/10 group-hover:text-[#ff4d4d] transition-colors">
                                     {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                 </div>
                                 <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                     <img src={item.images?.jpg?.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                      <h4 className="text-[12px] font-black uppercase tracking-tight truncate group-hover:text-[#ff4d4d] transition-colors">{item.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                           <Star size={10} className="text-[#ffcc00] fill-[#ffcc00]" />
                                           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.score}</span>
                                      </div>
                                 </div>
                             </Link>
                         ))}
                     </div>
                 </aside>
            </main>
        </div>
    );
}
