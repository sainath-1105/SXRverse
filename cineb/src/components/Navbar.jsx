import { Search, Bell, Menu, X, Star, Film, Tv, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchApi, getImageUrl } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Navbar({ onMenuClick }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const suggestionsRef = useRef(null);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuRef = useRef(null);

    const languages = [
        { code: 'en-US', name: 'English', flag: '🇺🇸' },
        { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
        { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
        { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
        { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    ];

    const currentLang = languages.find(l => l.code === (localStorage.getItem('app_lang') || 'en-US')) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code) => {
        localStorage.setItem('app_lang', code);
        setShowLangMenu(false);
        window.location.reload(); // Reload to refresh all API data
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 1) {
                setLoading(true);
                fetchApi('/search/multi', { query, include_adult: false }).then(data => {
                    if (data && data.results) {
                        setSuggestions(data.results.filter(i => i.media_type !== 'person').slice(0, 6));
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
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery('');
        setShowSuggestions(false);
        navigate(`/watch/${suggestion.media_type}/${suggestion.id}`);
    };

    return (
        <nav className="sticky top-0 h-20 bg-[#020308]/80 backdrop-blur-2xl z-[40] flex items-center justify-between px-4 sm:px-8 border-b border-white/5 transition-all duration-300 w-full shadow-2xl">
            <div className="flex items-center gap-4 lg:gap-8">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2.5 -ml-1 text-textMuted hover:text-white transition bg-white/5 rounded-xl border border-white/5 group active:scale-95"
                >
                    <Menu size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
                <div className="relative flex-1 md:flex-none" ref={suggestionsRef}>
                    <form onSubmit={handleSearch} className="relative flex items-center group max-w-xs md:max-w-none">
                        <Search size={14} className="absolute left-4 text-textMuted/40 group-focus-within:text-primary transition-all duration-300" />
                        <input
                            type="text"
                            placeholder="Enter movie title, series or anime..."
                            className="bg-[#0a0812]/50 border border-white/5 text-[11px] rounded-2xl pl-11 pr-10 py-3.5 w-[140px] sm:w-64 lg:w-80 focus:outline-none focus:border-primary/30 focus:bg-[#0a0812] transition-all duration-500 text-white placeholder-textMuted/30 focus:sm:w-[420px] shadow-2xl font-medium tracking-tight"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setSuggestions([]); }}
                                className="absolute right-4 p-1 text-textMuted/40 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (query.length > 1) && (suggestions.length > 0 || loading) && (
                        <div className="absolute top-full left-0 right-0 mt-4 bg-[#0a0812]/95 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in slide-in-from-top-4">
                            {loading && suggestions.length === 0 ? (
                                <div className="p-8 text-center text-textMuted text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Database...</div>
                            ) : (
                                <div className="py-2">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSuggestionClick(item)}
                                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all text-left group"
                                        >
                                            <div className="w-11 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/5 shadow-xl">
                                                <img
                                                    src={getImageUrl(item.poster_path, 'w92')}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1000ms]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-[13px] font-black truncate leading-none mb-2 uppercase tracking-tight">{item.title || item.name}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                                                        {item.media_type === 'movie' ? <Film size={10} /> : <Tv size={10} />}
                                                        {item.media_type}
                                                    </span>
                                                    <span className="text-[8px] font-black text-textMuted uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                        <Star size={10} className="fill-primary text-primary" />
                                                        {item.vote_average?.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleSearch}
                                        className="w-full p-5 border-t border-white/5 text-[9px] font-black text-white/40 uppercase tracking-[0.4em] hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-3"
                                    >
                                        <Search size={12} /> Complete Search
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-6">
                {/* Language Switcher */}
                <div className="relative hidden sm:block" ref={langMenuRef}>
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-2.5 text-textMuted/60 hover:text-white transition-all bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] group"
                    >
                        <span>{currentLang.flag}</span>
                        <span className="hidden lg:inline">{currentLang.name}</span>
                    </button>

                    {showLangMenu && (
                        <div className="absolute top-full right-0 mt-3 w-56 bg-[#0a0812]/95 backdrop-blur-3xl border border-white/10 rounded-[20px] shadow-2xl z-[100] py-3 animate-in slide-in-from-top-2">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center justify-between px-6 py-3 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all ${currentLang.code === lang.code ? 'text-primary' : 'text-textMuted'}`}
                                >
                                    <span>{lang.name}</span>
                                    <span className="opacity-60">{lang.flag}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="p-3 text-textMuted/40 hover:text-primary transition-all relative shrink-0 bg-white/5 rounded-xl border border-white/5 md:bg-transparent md:border-none md:p-0">
                    <Bell size={18} />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-[#020308] shadow-[0_0_10px_#00E054]"></div>
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 group"
                        >
                            <div className="text-right hidden lg:block mr-2">
                                <p className="text-[11px] font-black text-white group-hover:text-primary transition-colors tracking-tighter uppercase italic">{user.name}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                    <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em]">PRM-V1</p>
                                </div>
                            </div>
                            <ProfileAvatar user={user} size="md" className="group-hover:scale-110 transition-transform border border-white/10 shadow-2xl" />
                        </Link>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="px-6 py-3.5 bg-primary hover:bg-primaryDark text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition shadow-[0_10px_30px_rgba(0,224,84,0.2)] active:scale-95"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>

    );
}
