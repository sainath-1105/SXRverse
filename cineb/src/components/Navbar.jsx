import { Search, Bell, Menu, Sparkles, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchApi, getImageUrl } from '../api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Navbar({ onMenuClick, isSidebarHidden }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileSearch, setMobileSearch] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const suggestionsRef = useRef(null);
    const mobileInputRef = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (mobileSearch && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [mobileSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 2) {
                setLoading(true);
                fetchApi('/search/multi', { query, include_adult: false }).then(data => {
                    if (data && data.results) {
                        setSuggestions(data.results.filter(i => i.media_type !== 'person' && i.poster_path).slice(0, 6));
                    }
                    setLoading(false);
                });
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setQuery('');
            setShowSuggestions(false);
            setMobileSearch(false);
        }
    };

    const navLinks = [
        { name: 'Movies', path: '/movies' },
        { name: 'TV Shows', path: '/tv' },
        { name: 'Anime', path: '/anime' },
        { name: 'Manga', path: '/manga' },
        { name: 'Music', path: '/music' },
        { name: 'SXR Feed', path: '/feed', highlight: true },
        { name: 'Premium', path: '/4k' },
    ];

    const isActive = (path) => location.pathname === path;

    const getPageTitle = () => {
        const titles = { '/': 'SXR VERSE', '/movies': 'Movies', '/tv': 'TV Shows', '/anime': 'Anime', '/manga': 'Manga', '/music': 'Music', '/feed': 'Feed', '/4k': 'Premium', '/search': 'Search', '/mylist': 'Watchlist', '/history': 'History', '/party': 'Party', '/channels': 'Channels', '/profile': 'Profile', '/auth': 'Sign In' };
        // Check for /watch routes
        if (location.pathname.startsWith('/watch')) return 'Now Playing';
        return titles[location.pathname] || 'SXR VERSE';
    };

    return (
        <nav className={`fixed top-0 ${isSidebarHidden ? 'left-0' : 'left-0 md:left-64'} right-0 z-[100]`}>
            <div className="transition-all duration-500 bg-[#0a0a0a] border-b border-white/[0.06]">

                {/* Mobile Search Overlay */}
                {mobileSearch && (
                    <div className="fixed inset-0 bg-[#0a0a0a] z-[300] md:hidden">
                        <div className="flex items-center px-3 gap-3 h-14 border-b border-white/10">
                            <button onClick={() => { setMobileSearch(false); setQuery(''); setShowSuggestions(false); }} className="shrink-0 w-10 h-10 flex items-center justify-center text-white/60 active:scale-90">
                                <ArrowLeft size={22} />
                            </button>
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <input
                                    ref={mobileInputRef}
                                    type="text"
                                    placeholder="Search movies, shows, anime..."
                                    className="flex-1 bg-white/10 border border-white/10 rounded-lg text-sm px-4 py-2.5 outline-none focus:border-[#ffcc00]/50 text-white placeholder-white/30"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                                    autoFocus
                                />
                                <button type="submit" className="shrink-0 px-4 py-2 bg-[#ffcc00] text-black rounded-lg text-xs font-black uppercase">Go</button>
                            </form>
                        </div>

                        {/* Mobile search results */}
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
                            {loading && (
                                <div className="p-8 text-center text-xs text-white/30 animate-pulse">Searching...</div>
                            )}
                            {!loading && suggestions.length > 0 && suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setQuery(''); setShowSuggestions(false); setMobileSearch(false); navigate(`/watch/${item.media_type}/${item.id}`); }}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 active:bg-white/5 text-left border-b border-white/[0.04]"
                                >
                                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                        <img src={getImageUrl(item.poster_path, 'w92')} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-white text-sm font-bold truncate">{item.title || item.name}</div>
                                        <div className="text-xs text-white/30 uppercase mt-0.5">{item.media_type} • {(item.release_date || item.first_air_date || '').slice(0, 4)}</div>
                                    </div>
                                </button>
                            ))}
                            {!loading && query.length > 2 && suggestions.length === 0 && (
                                <div className="p-8 text-center text-xs text-white/20">No results found</div>
                            )}
                            {query.length <= 2 && (
                                <div className="p-8 text-center text-xs text-white/20">Type at least 3 characters to search</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Navbar Row */}
                <div className="h-14 md:h-20 flex items-center justify-between px-3 md:px-8">
                    
                    {/* Left side */}
                    <div className="flex items-center gap-2 md:gap-12 min-w-0">
                        {/* Mobile: Menu + Back + Title */}
                        <div className="flex xl:hidden items-center gap-2 min-w-0">
                            <button 
                                onClick={onMenuClick} 
                                className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white active:scale-90 transition-transform"
                            >
                                <Menu size={20} />
                            </button>
                            {!isHome && (
                                <button 
                                    onClick={() => navigate(-1)} 
                                    className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg text-white active:scale-90 transition-transform"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <span className="text-sm font-black uppercase tracking-tight text-white truncate">
                                {getPageTitle()}
                            </span>
                        </div>


                        {/* Desktop: Logo (only when sidebar is hidden) */}
                        {isSidebarHidden && (
                            <Link to="/" className="group hidden xl:flex flex-col items-start shrink-0">
                                <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none group-hover:text-[#ffcc00] transition-colors">SXR VERSE</h1>
                                <span className="text-[6px] font-black tracking-[0.4em] text-[#ffcc00] uppercase mt-0.5 opacity-60">Version 4.2</span>
                            </Link>
                        )}

                        {/* Desktop: Nav Links */}
                        <div className="hidden xl:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                        isActive(link.path)
                                            ? 'text-black bg-[#ffcc00]'
                                            : link.highlight
                                            ? 'text-[#ffcc00] hover:bg-[#ffcc00]/10'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        {/* Mobile: Search icon */}
                        <button 
                            onClick={() => setMobileSearch(true)} 
                            className="md:hidden w-10 h-10 flex items-center justify-center bg-white/[0.06] rounded-lg text-white/40 active:scale-90 transition-transform"
                        >
                            <Search size={18} />
                        </button>

                        {/* Desktop: Search bar */}
                        <div className="relative group hidden md:block" ref={suggestionsRef}>
                            <form onSubmit={handleSearch} className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="SEARCH..."
                                    className="bg-white/[0.06] border border-white/[0.08] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] pl-9 pr-4 py-2.5 w-40 lg:w-56 xl:w-64 focus:w-72 transition-all duration-500 outline-none focus:border-[#ffcc00]/50 focus:bg-white/[0.08] text-white placeholder-white/20"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                                />
                                <Search size={12} className="absolute left-3 text-white/20 group-focus-within:text-[#ffcc00] transition-colors" />
                            </form>

                            {showSuggestions && query.length > 2 && (suggestions.length > 0 || loading) && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f0f0f]/95 backdrop-blur-3xl border border-white/[0.06] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-2 z-[110] min-w-[320px]">
                                     {loading ? (
                                        <div className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-white/20 animate-pulse">Searching...</div>
                                     ) : (
                                        <div className="space-y-1">
                                            {suggestions.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => { setQuery(''); setShowSuggestions(false); navigate(`/watch/${item.media_type}/${item.id}`); }}
                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-all text-left group"
                                                >
                                                    <div className="w-9 aspect-[2/3] rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                         <img src={getImageUrl(item.poster_path, 'w92')} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white text-[11px] font-black uppercase tracking-tight truncate mb-0.5 group-hover:text-[#ffcc00] transition-colors">{item.title || item.name}</h4>
                                                        <span className="text-[8px] font-black text-[#ffcc00] uppercase tracking-widest">{item.media_type} • {(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>

                        {/* Bell - desktop only */}
                        <button className="hidden lg:flex relative p-2.5 text-white/25 hover:text-[#ffcc00] transition-all bg-white/[0.04] rounded-xl hover:bg-[#ffcc00]/10 border border-white/[0.04]">
                            <Bell size={17} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff4d4d] rounded-full animate-pulse" />
                        </button>
                        
                        {/* User avatar */}
                        {user ? (
                            <Link to="/profile" className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden border border-white/10">
                                <ProfileAvatar user={user} size="sm" />
                            </Link>
                        ) : (
                            <Link to="/auth" className="hidden md:flex items-center gap-2 bg-[#ffcc00] text-black px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-white transition-all">
                                 <Sparkles size={12} /> Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
