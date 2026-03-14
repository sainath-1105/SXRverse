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
        <nav className="sticky top-0 h-20 bg-background/60 backdrop-blur-xl z-[40] flex items-center justify-between px-6 border-b border-white/5 transition-all duration-300 w-full">
            <div className="flex items-center gap-4 lg:gap-6">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-textMuted hover:text-white transition bg-white/5 rounded-xl border border-white/5"
                >
                    <Menu size={20} />
                </button>
                <div className="relative flex-1 md:flex-none" ref={suggestionsRef}>
                    <form onSubmit={handleSearch} className="relative flex items-center group max-w-xs md:max-w-none">
                        <Search size={16} className="absolute left-4 text-textMuted group-focus-within:text-primary transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Search movies, TV shows..."
                            className="bg-white/5 border border-white/5 text-[12px] rounded-xl pl-11 pr-10 py-3 w-full md:w-64 lg:w-80 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300 text-white placeholder-textMuted/50 focus:md:w-[420px] shadow-inner font-medium tracking-tight"
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
                                className="absolute right-3 p-1 text-textMuted hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (query.length > 1) && (suggestions.length > 0 || loading) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                            {loading && suggestions.length === 0 ? (
                                <div className="p-6 text-center text-textMuted text-[11px] font-medium animate-pulse">Searching...</div>
                            ) : (
                                <div className="py-2">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSuggestionClick(item)}
                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-white/5">
                                                <img
                                                    src={getImageUrl(item.poster_path, 'w92')}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-[13px] font-semibold truncate leading-none mb-1.5">{item.title || item.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[8px] font-black text-primary/80 uppercase tracking-widest flex items-center gap-1">
                                                        {item.media_type === 'movie' ? <Film size={10} /> : <Tv size={10} />}
                                                        {item.media_type}
                                                    </span>
                                                    <span className="text-white/20 text-[8px]">•</span>
                                                    <span className="text-[8px] font-black text-textMuted uppercase tracking-widest flex items-center gap-1">
                                                        <Star size={10} className="fill-primary text-primary" />
                                                        {item.vote_average?.toFixed(1)} Rating
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleSearch}
                                        className="w-full p-4 border-t border-white/5 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Search size={12} /> View all results for "{query}"
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Language Switcher */}
                <div className="relative" ref={langMenuRef}>
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-1.5 md:gap-2 text-textMuted hover:text-white transition-all bg-white/5 border border-white/5 px-2.5 sm:px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                        <span>{currentLang.flag}</span>
                        <span className="hidden lg:inline">{currentLang.name}</span>
                    </button>

                    {showLangMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all ${currentLang.code === lang.code ? 'text-primary' : 'text-textMuted'}`}
                                >
                                    <span>{lang.name}</span>
                                    <span>{lang.flag}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

                <button className="text-textMuted hover:text-primary transition-all relative shrink-0">
                    <Bell size={18} />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-[0_0_8px_rgba(0,255,133,0.5)]"></div>
                </button>

                <div className="hidden sm:flex h-4 w-[1px] bg-white/10"></div>

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/profile"
                            className="hidden sm:flex items-center gap-2 group"
                        >
                            <div className="text-right hidden lg:block">
                                <p className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                                <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] opacity-80">Premium</p>
                            </div>
                            <ProfileAvatar user={user} size="md" className="group-hover:scale-105 transition-transform border border-white/10" />
                        </Link>
                        <button
                            onClick={logout}
                            className="md:hidden p-2 text-textMuted hover:text-red-500 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="px-6 py-2.5 bg-primary hover:bg-primaryDark text-background rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-primary/20"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}
