import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Camera, Check, Edit3, Quote, Sparkles, User } from 'lucide-react';

// Pre-built anime/series/movie character avatars
const AVATAR_CATEGORIES = [
    {
        name: 'Cozy',
        avatars: [
            { id: 'hinata_cozy', name: 'Hinata', image: '/avatars/hinata_cozy.jpg', gradient: 'from-purple-200 to-pink-200', initials: 'HC' },
            { id: 'girl_bow', name: 'Misty', image: '/avatars/girl_bow.jpg', gradient: 'from-gray-200 to-stone-200', initials: 'GB' },
            { id: 'army_guy', name: 'Commander', image: '/avatars/army_guy.jpg', gradient: 'from-blue-200 to-indigo-200', initials: 'AG' },
            { id: 'tanktop_guy', name: 'Slayer', image: '/avatars/tanktop_guy.jpg', gradient: 'from-stone-200 to-gray-200', initials: 'TG' },
            { id: 'glasses_guy', name: 'Scholar', image: '/avatars/glasses_guy.jpg', gradient: 'from-blue-100 to-cyan-100', initials: 'GG' },
            { id: 'redhair_guy', name: 'Blaze', image: '/avatars/redhair_guy.jpg', gradient: 'from-red-200 to-orange-200', initials: 'RH' },
        ]
    },
    {
        name: 'Anime',
        avatars: [
            { id: 'zoro_wano', name: 'Zoro', image: '/avatars/zoro_wano.jpg', gradient: 'from-green-500 to-emerald-400', initials: 'ZR' },
            { id: 'luffy_happy', name: 'Luffy', image: '/avatars/luffy_happy.jpg', gradient: 'from-red-500 to-rose-400', initials: 'LF' },
            { id: 'gojo_chill', name: 'Gojo', image: '/avatars/gojo_chill.jpg', gradient: 'from-cyan-400 to-blue-300', initials: 'GJ' },
            { id: 'sukuna_red', name: 'Sukuna', image: '/avatars/sukuna_red.jpg', gradient: 'from-red-900 to-gray-900', initials: 'SK' },
            { id: 'mikasa', name: 'Mikasa', image: 'https://i.pinimg.com/736x/29/79/c1/2979c13be6f88836ec3ba096899479b1.jpg', gradient: 'from-purple-600 to-violet-400', initials: 'MK' },
            { id: 'levi', name: 'Levi', image: 'https://i.pinimg.com/736x/71/84/0d/71840d874591465bc57c0e527f074218.jpg', gradient: 'from-slate-600 to-gray-400', initials: 'LV' },
        ]
    },
    {
        name: 'Heroes',
        avatars: [
            { id: 'spiderman_cozy', name: 'Spidey', image: 'https://i.pinimg.com/736x/ec/90/19/ec901967261a8ef14115e5b61e0e8445.jpg', gradient: 'from-red-300 to-blue-300', initials: 'SC' },
            { id: 'ironman', name: 'Iron Man', image: 'https://i.pinimg.com/736x/28/7f/7a/287f7a77517c3852cd8f39572910777a.jpg', gradient: 'from-red-600 to-yellow-500', initials: 'IM' },
            { id: 'batman', name: 'Batman', image: 'https://i.pinimg.com/736x/b2/90/73/b290733a46580f8490a0247690623a85.jpg', gradient: 'from-gray-800 to-gray-600', initials: 'BM' },
            { id: 'deadpool', name: 'Deadpool', image: 'https://i.pinimg.com/736x/cb/09/cc/cb09cca307f5963773950d268d374431.jpg', gradient: 'from-red-800 to-red-500', initials: 'DP' },
        ]
    }
];

// Flatten all avatars for lookup
const ALL_AVATARS = AVATAR_CATEGORIES.flatMap(c => c.avatars);

function getAvatarById(id) {
    return ALL_AVATARS.find(a => a.id === id);
}

export function ProfileAvatar({ user, size = 'md', className = '' }) {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-5xl',
    };

    const radiusClasses = {
        xs: 'rounded-lg',
        sm: 'rounded-xl',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        xl: 'rounded-3xl',
        '2xl': 'rounded-[32px]',
    };

    if (user?.avatar) {
        const avatar = getAvatarById(user.avatar);
        if (avatar) {
            return (
                <div className={`${sizeClasses[size]} ${radiusClasses[size]} overflow-hidden shadow-lg ${className}`}>
                    {avatar.image ? (
                        <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-black`}>
                            {avatar.initials}
                        </div>
                    )}
                </div>
            );
        }
    }

    return (
        <div className={`${sizeClasses[size]} ${radiusClasses[size]} bg-primary flex items-center justify-center text-background font-black shadow-lg ${className}`}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
}

export default function Profile() {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [editName, setEditName] = useState(user?.name || '');
    const [editSlogan, setEditSlogan] = useState(user?.slogan || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('Anime');

    if (!user) {
        navigate('/auth');
        return null;
    }

    const hasChanges = editName !== user.name || editSlogan !== (user.slogan || '') || selectedAvatar !== (user.avatar || '');

    const handleSave = async () => {
        if (!editName.trim()) {
            setError('Name cannot be empty');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await updateProfile({
                name: editName.trim(),
                slogan: editSlogan.trim(),
                avatar: selectedAvatar
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const currentAvatarData = selectedAvatar ? getAvatarById(selectedAvatar) : null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textMuted hover:text-white transition-colors mb-8 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Back</span>
            </button>

            {/* Profile Header Card */}
            <div className="bg-card border border-white/5 rounded-[32px] p-6 sm:p-10 mb-8 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-[100px]"></div>
                </div>

                <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                    {/* Avatar Preview */}
                    <div className="relative group">
                        <ProfileAvatar user={{ ...user, avatar: selectedAvatar }} size="2xl" />
                        <div className="absolute inset-0 bg-background/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={28} className="text-white" />
                        </div>
                        {currentAvatarData && (
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border border-white/10 px-3 py-1 rounded-full shadow-lg">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{currentAvatarData.name}</span>
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                        {user.slogan && (
                            <p className="text-textMuted text-sm mt-1.5 flex items-center gap-2 justify-center sm:justify-start">
                                <Quote size={12} className="text-primary opacity-50" />
                                {user.slogan}
                            </p>
                        )}
                        <p className="text-textMuted/50 text-xs mt-3">{user.email}</p>
                        <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                            <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={10} /> Member
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Left: Name & Slogan */}
                <div className="bg-card border border-white/5 rounded-[28px] p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Edit3 size={16} className="text-primary" />
                        </div>
                        Edit Profile
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-textMuted uppercase tracking-wider mb-2 ml-1">Display Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                maxLength={30}
                                className="w-full bg-background border border-white/5 text-white rounded-2xl py-3.5 px-4 outline-none focus:border-primary/50 transition text-sm"
                                placeholder="Your name"
                            />
                            <p className="text-[10px] text-textMuted/40 mt-1.5 ml-1">{editName.length}/30 characters</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-textMuted uppercase tracking-wider mb-2 ml-1">Slogan / Bio</label>
                            <textarea
                                value={editSlogan}
                                onChange={e => setEditSlogan(e.target.value)}
                                maxLength={100}
                                rows={3}
                                className="w-full bg-background border border-white/5 text-white rounded-2xl py-3.5 px-4 outline-none focus:border-primary/50 transition text-sm resize-none"
                                placeholder='e.g. "Believe it!" or "Plus Ultra!"'
                            />
                            <p className="text-[10px] text-textMuted/40 mt-1.5 ml-1">{editSlogan.length}/100 characters</p>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-xs mt-4 font-medium">{error}</p>}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${saved
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                            : hasChanges
                                ? 'bg-primary text-background hover:bg-primaryDark shadow-lg shadow-primary/20 active:scale-[0.98]'
                                : 'bg-white/5 text-textMuted/40 cursor-not-allowed'
                            }`}
                    >
                        {saved ? (
                            <><Check size={18} /> Saved!</>
                        ) : saving ? (
                            'Saving...'
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>

                {/* Right: Avatar Selection */}
                <div className="bg-card border border-white/5 rounded-[28px] p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                            <User size={16} className="text-accent" />
                        </div>
                        Choose Avatar
                    </h2>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {AVATAR_CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveTab(cat.name)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === cat.name
                                    ? 'bg-primary text-background'
                                    : 'bg-white/5 text-textMuted hover:bg-white/10'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setSelectedAvatar('');
                                setActiveTab('');
                            }}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${selectedAvatar === '' && activeTab === ''
                                ? 'bg-primary text-background'
                                : 'bg-white/5 text-textMuted hover:bg-white/10'
                                }`}
                        >
                            Default
                        </button>
                    </div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {activeTab === '' ? (
                            <button
                                onClick={() => setSelectedAvatar('')}
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border-2 ${selectedAvatar === ''
                                    ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20'
                                    : 'border-transparent bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-background font-black text-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[9px] font-bold text-textMuted">Default</span>
                            </button>
                        ) : (
                            AVATAR_CATEGORIES.find(c => c.name === activeTab)?.avatars.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border-2 ${selectedAvatar === avatar.id
                                        ? 'border-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20'
                                        : 'border-transparent bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
                                        }`}
                                >
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md`}>
                                        {avatar.initials}
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-bold text-textMuted truncate w-full text-center px-1">{avatar.name}</span>
                                    {selectedAvatar === avatar.id && (
                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                            <Check size={10} className="text-background" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-card border border-white/5 rounded-[28px] p-6 sm:p-8">
                <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">Account</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-white text-sm font-medium">Sign Out</p>
                        <p className="text-textMuted text-xs mt-0.5">Sign out of your account on this device</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="px-6 py-3 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
