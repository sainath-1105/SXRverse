import { Link, useLocation } from 'react-router-dom';
import {
    Home, Tv, Film, Users, LayoutGrid, Heart, History,
    Settings, LogOut, Radio, MonitorPlay, Zap, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, className }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const sections = [
        {
            title: 'Menu',
            items: [
                { name: 'Discover', icon: <LayoutGrid size={20} />, path: '/' },
                { name: 'Movies', icon: <Film size={20} />, path: '/movies' },
                { name: 'TV Shows', icon: <Tv size={20} />, path: '/tv' },
                { name: 'Anime', icon: <MonitorPlay size={20} />, path: '/anime' },
                { name: 'Manga', icon: <BookOpen size={20} />, path: '/manga' },
            ]
        },
        {
            title: 'Features',
            items: [
                { name: 'Channels', icon: <Radio size={20} />, path: '/channels' },
                { name: 'Watch Party', icon: <Users size={20} />, path: '/party' },
                { name: 'Premium 4K', icon: <Zap size={20} />, path: '/4k', color: 'text-accent' },
            ]
        },
        {
            title: 'Personal',
            items: [
                { name: 'Watchlist', icon: <Heart size={20} />, path: '/mylist' },
                { name: 'History', icon: <History size={20} />, path: '/history' },
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`${className} bg-background border-r border-white/5 flex flex-col transition-all duration-500 ease-out`}>
            {/* Logo Section */}
            <div className="h-20 md:h-24 flex items-center px-8 mb-4">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-[18px] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-black text-xl md:text-2xl shadow-[0_10px_25px_rgba(0,255,133,0.3)] transition-all group-hover:scale-110">
                        ▶
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black text-white leading-none tracking-tighter uppercase whitespace-nowrap">SXRverse</span>
                        <span className="text-[10px] font-black text-primary tracking-[0.3em] leading-none mt-1.5 uppercase opacity-80 text-glow-green">Premium</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 px-5 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar pb-10 mt-4">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="px-5 text-[10px] font-black text-textMuted/40 uppercase tracking-[0.25em] mb-4">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative
                                        ${isActive(item.path)
                                            ? 'bg-white/5 text-white font-black shadow-inner shadow-white/[0.02]'
                                            : 'text-textMuted hover:text-white hover:bg-white/[0.03]'}
                                    `}
                                >
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(0,255,133,0.5)]"></div>
                                    )}
                                    <span className={`transition-all duration-300 ${isActive(item.path) ? 'text-primary scale-110' : 'group-hover:text-primary group-hover:scale-110 group-hover:rotate-3'} ${item.color || ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[13px] font-bold tracking-tight">
                                        {item.name}
                                    </span>
                                    {isActive(item.path) && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,133,0.5)] animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Status */}
            <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent">
                {user ? (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 animate-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background font-black shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate">{user.name}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 opacity-80">Premium Member</p>
                            </div>
                            <button onClick={logout} className="text-textMuted hover:text-primary transition-colors p-2">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-background rounded-2xl transition-all font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/10 active:scale-95"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}
