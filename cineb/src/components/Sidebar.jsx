import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Tv, Film, Users, LayoutGrid, Heart, History,
    Settings, LogOut, Radio, MonitorPlay, Zap, BookOpen, Music
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
                { name: 'Music', icon: <Music size={20} />, path: '/music' },
            ]
        },
        {
            title: 'Features',
            items: [
                { name: 'SXR Feed', icon: <MonitorPlay size={20} />, path: '/feed', color: 'text-[#ffcc00]' },
                { name: 'Channels', icon: <Radio size={20} />, path: '/channels' },
                { name: 'Watch Party', icon: <Users size={20} />, path: '/party' },
                { name: 'Upgrade Premium', icon: <Zap size={20} />, path: '/4k', color: 'text-accent' },
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
            <div className="h-14 md:h-20 flex items-center px-6 md:px-8 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent shrink-0">
                <Link to="/" className="group flex items-center">
                    <img src="/sxr-logo.png" alt="SXR" className="h-8 md:h-10 w-auto object-contain group-hover:brightness-125 transition-all" />
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
                                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(251,191,36,0.3)]"></div>
                                    )}
                                    <span className={`transition-all duration-300 ${isActive(item.path) ? 'text-primary scale-110' : 'group-hover:text-primary group-hover:scale-110 group-hover:rotate-3'} ${item.color || ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[13px] font-bold tracking-tight">
                                        {item.name}
                                    </span>
                                    {isActive(item.path) && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse"></div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Status */}
            <div className="p-6 border-t border-white/5 bg-background font-medium">
                {user ? (
                    <div className="flex flex-col gap-3">
                        <div
                            onClick={() => navigate('/profile')}
                            className="bg-card border border-white/5 p-4 rounded-3xl flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 blur-2xl rounded-full"></div>
                            <ProfileAvatar user={user} size="md" className="group-hover:scale-105 transition-transform border border-white/5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-white truncate group-hover:text-primary transition-colors uppercase tracking-tight">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[7px] font-black text-primary uppercase tracking-[0.15em] px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">PREMIUM</span>
                                    <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">#1105</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-accent/5 text-accent hover:bg-accent hover:text-background transition-all text-[9px] font-black uppercase tracking-widest border border-accent/10 group active:scale-95"
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
