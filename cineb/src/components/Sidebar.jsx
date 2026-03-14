import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Tv, Film, Users, LayoutGrid, Heart, History,
    Settings, LogOut, Radio, MonitorPlay, Zap, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../pages/Profile';

export default function Sidebar({ isOpen, className }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
                        <span className="text-[10px] font-bold text-primary tracking-wider leading-none mt-1.5 uppercase opacity-80">Premium</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 px-5 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar pb-10 mt-4">
                {sections.map((section) => (
                    <div key={section.title}>
                        <p className="px-5 text-[10px] font-bold text-textMuted/40 uppercase tracking-wider mb-4">
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
                                            ? 'bg-white/5 text-white font-bold shadow-inner shadow-white/[0.02]'
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
            <div className="p-6 border-t border-white/5 bg-[#020308]">
                {user ? (
                    <div className="flex flex-col gap-3">
                        <div
                            onClick={() => navigate('/profile')}
                            className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 blur-2xl rounded-full"></div>
                            <ProfileAvatar user={user} size="md" className="group-hover:scale-105 transition-transform border border-white/5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-white truncate group-hover:text-primary transition-colors uppercase tracking-tight">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">PREMIUM</span>
                                    <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">#1105</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-red-500/10 group active:scale-95"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth"
                        className="w-full flex items-center justify-center gap-3 py-5 bg-primary hover:bg-primaryDark text-background rounded-3xl font-black text-[11px] uppercase tracking-widest transition shadow-lg shadow-primary/20 active:scale-95"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}
