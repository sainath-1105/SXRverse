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
        <div className="min-h-screen bg-[#080808] pt-32 pb-40 px-8 md:px-16 overflow-hidden selection:bg-[#ff4d4d]">
            <div className="max-w-[1400px] mx-auto relative z-10">
                
                {/* Tactical Header */}
                <header className="flex flex-col md:flex-row items-center gap-12 mb-20 animate-entrance">
                    <button onClick={() => navigate(-1)} className="p-5 bg-white/5 border border-white/10 rounded-full hover:bg-[#ff4d4d] hover:text-white transition-all group">
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                              <div className="h-[1px] w-12 bg-[#ffcc00] opacity-40"></div>
                              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ffcc00]">User Profile</span>
                         </div>
                         <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Profile Center</h1>
                    </div>
                </header>

                {/* Profile Diagnostic Node */}
                <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 md:p-16 mb-12 shadow-2xl relative overflow-hidden group">
                     {/* Dynamic HUD Lines */}
                     <div className="absolute top-0 right-0 w-32 h-[1px] bg-[#ff4d4d] opacity-40"></div>
                     <div className="absolute top-0 right-0 w-[1px] h-32 bg-[#ffcc00] opacity-10"></div>

                     <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                          <div className="relative group/avatar">
                               <ProfileAvatar user={{ ...user, avatar: selectedAvatar }} size="2xl" className="ring-8 ring-white/5" />
                               <div className="absolute inset-0 bg-[#ff4d4d]/20 rounded-[32px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                   <Camera size={32} className="text-white" />
                               </div>
                               {currentAvatarData && (
                                   <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-[#ffcc00] px-6 py-2 rounded-full shadow-2xl">
                                       <span className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest">{currentAvatarData.name}</span>
                                   </div>
                               )}
                          </div>

                          <div className="flex-1 text-center md:text-left space-y-4">
                               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">{user.name}</h2>
                               {user.slogan && (
                                   <p className="text-lg font-medium text-white/40 italic flex items-center justify-center md:justify-start gap-3">
                                       <Quote size={16} className="text-[#ff4d4d]" />
                                       {user.slogan}
                                   </p>
                               )}
                               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                                    <div className="px-5 py-2 bg-[#ffcc00] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Level_Alpha_Member</div>
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">{user.email}</span>
                               </div>
                          </div>

                          <button 
                            onClick={() => { logout(); navigate('/'); }}
                            className="px-10 py-5 border border-[#ff4d4d]/20 text-[#ff4d4d] hover:bg-[#ff4d4d] hover:text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#ff4d4d]/10"
                          >
                              Discontinue_Session
                          </button>
                     </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {/* Data Integrity Form */}
                     <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 shadow-2xl">
                          <div className="flex items-center gap-4 mb-12">
                               <Edit3 size={24} className="text-[#ff4d4d]" />
                               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Modify_Identity</h3>
                          </div>

                          <div className="space-y-10">
                               <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Display_Alias</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        maxLength={30}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-2xl p-6 outline-none focus:border-[#ffcc00]/40 text-sm font-bold tracking-tight transition-all"
                                    />
                                    <div className="flex justify-between items-center px-2">
                                         <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">Display Name</span>
                                         <span className="text-[9px] font-black text-white/20">{editName.length}/30</span>
                                    </div>
                               </div>

                               <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Motto_Buffer</label>
                                    <textarea
                                        value={editSlogan}
                                        onChange={e => setEditSlogan(e.target.value)}
                                        maxLength={100}
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/5 text-white rounded-2xl p-6 outline-none focus:border-[#ffcc00]/40 text-sm font-bold tracking-tight transition-all resize-none"
                                    />
                                     <div className="flex justify-between items-center px-2">
                                         <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">About You</span>
                                         <span className="text-[9px] font-black text-white/20">{editSlogan.length}/100</span>
                                    </div>
                               </div>

                               <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || saving}
                                    className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.6em] text-[12px] transition-all flex items-center justify-center gap-4 ${saved
                                        ? 'bg-[#00ff88] text-black shadow-[0_20px_50px_rgba(0,255,136,0.3)]'
                                        : hasChanges
                                            ? 'bg-[#ffcc00] text-black hover:scale-[1.02] shadow-[0_20px_50px_rgba(255,204,0,0.2)]'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    {saved ? <><Check size={18} /> SYNC_COMPLETE</> : saving ? 'UPLOADING...' : 'COMMIT_CHANGES'}
                                </button>
                          </div>
                     </div>

                     {/* Avatar Matrix */}
                     <div className="bg-[#121212] border border-white/5 rounded-[4rem] p-12 shadow-2xl">
                          <div className="flex items-center gap-4 mb-12">
                               <Sparkles size={24} className="text-[#ffcc00]" />
                               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Avatar_Database</h3>
                          </div>

                          <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                               {AVATAR_CATEGORIES.map(cat => (
                                   <button
                                       key={cat.name}
                                       onClick={() => setActiveTab(cat.name)}
                                       className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === cat.name ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                                   >
                                       {cat.name}
                                   </button>
                               ))}
                          </div>

                          <div className="grid grid-cols-4 gap-6">
                               {(activeTab === '' ? [] : AVATAR_CATEGORIES.find(c => c.name === activeTab)?.avatars || []).map(avatar => (
                                   <button
                                       key={avatar.id}
                                       onClick={() => setSelectedAvatar(avatar.id)}
                                       className={`aspect-square rounded-[1.5rem] relative group transition-all duration-500 border-2 overflow-hidden ${selectedAvatar === avatar.id ? 'border-[#ffcc00] scale-110 shadow-2xl ring-4 ring-[#ffcc00]/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                   >
                                       <img src={avatar.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                       {selectedAvatar === avatar.id && (
                                           <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#ffcc00] flex items-center justify-center shadow-2xl ring-2 ring-black">
                                               <Check size={12} className="text-black" />
                                           </div>
                                       )}
                                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                       <span className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-black text-white uppercase tracking-tighter">{avatar.name}</span>
                                   </button>
                               ))}
                          </div>
                     </div>
                </div>
            </div>
        </div>
    );
}
