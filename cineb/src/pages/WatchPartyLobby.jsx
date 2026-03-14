import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogIn, Plus, Lock, Unlock, PlayCircle, EyeOff, Eye } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { fetchApi, getImageUrl } from '../api';
import { Search, X, Loader2, RefreshCw, Calendar, MessageCircle } from 'lucide-react';

let socket;

export default function WatchPartyLobby() {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [activeRooms, setActiveRooms] = useState([]);
    const [promptRoom, setPromptRoom] = useState(null);

    // Create Room Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [episodesList, setEpisodesList] = useState([]);
    const [isPrivate, setIsPrivate] = useState(false);
    const [customRoomName, setCustomRoomName] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        socket = io(import.meta.env.VITE_API_URL);

        socket.on('rooms_updated', (rooms) => {
            setActiveRooms(rooms);
        });

        // Initial fetch
        fetch(`${import.meta.env.VITE_API_URL}/api/rooms`)
            .then(res => res.json())
            .then(data => setActiveRooms(data))
            .catch(console.error);

        return () => socket.disconnect();
    }, []);

    const getFinalUsername = () => {
        return user ? user.name : (username.trim() || 'Guest_' + Math.floor(1000 + Math.random() * 9000));
    };

    const handleRefresh = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/rooms`)
            .then(res => res.json())
            .then(data => setActiveRooms(data))
            .catch(console.error);
    };

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const data = await fetchApi('/search/multi', { query: q });
        setSearchResults(data?.results?.filter(r => r.media_type !== 'person') || []);
        setIsSearching(false);
    };

    const handleSelectMedia = async (media) => {
        setSelectedMedia(media);
        setCustomRoomName(media.title || media.name);
        if (media.media_type === 'tv') {
            const data = await fetchApi(`/tv/${media.id}/season/1`);
            setEpisodesList(data?.episodes || []);
        }
    };

    const changeSeason = async (s) => {
        setSelectedSeason(s);
        setSelectedEpisode(1);
        const data = await fetchApi(`/tv/${selectedMedia.id}/season/${s}`);
        setEpisodesList(data?.episodes || []);
    };

    const handleCreateRoom = async () => {
        setError('');
        const finalUsername = getFinalUsername();

        const mediaData = {
            id: selectedMedia.id,
            type: selectedMedia.media_type,
            title: selectedMedia.title || selectedMedia.name,
            poster_path: selectedMedia.poster_path,
            season: selectedMedia.media_type === 'tv' ? selectedSeason : null,
            episode: selectedMedia.media_type === 'tv' ? selectedEpisode : null
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: customRoomName,
                    host: finalUsername,
                    password: isPrivate ? createPassword : '',
                    media: mediaData
                })
            });
            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('wp_username', finalUsername);
                sessionStorage.setItem('wp_room', data.room.id);
                sessionStorage.setItem('wp_isHost', 'true');
                navigate('/party/room/' + data.room.id);
            } else {
                setError('Failed to create room.');
            }
        } catch (err) {
            setError('Server connection failed.');
        }
    };

    const attemptJoinRoom = async (code, pass = '') => {
        setError('');
        setPasswordError('');
        const finalUsername = getFinalUsername();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room: code.toUpperCase(), password: pass })
            });
            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('wp_username', finalUsername);
                sessionStorage.setItem('wp_room', code.toUpperCase());
                sessionStorage.setItem('wp_isHost', 'false');
                navigate('/party/room/' + code.toUpperCase());
            } else {
                if (res.status === 401) {
                    setPasswordError('Incorrect password.');
                    setPromptRoom(code.toUpperCase());
                } else if (res.status === 404) {
                    setError('Room not found! Ensure it is active.');
                }
            }
        } catch (err) {
            setError('Server connection failed.');
        }
    };

    const handleJoinWithCode = (e) => {
        e.preventDefault();
        if (!roomCode.trim()) {
            setError('Please enter a room code to join.');
            return;
        }
        attemptJoinRoom(roomCode);
    };

    const handleJoinClickFromList = (room) => {
        if (room.hasPassword) {
            setPromptRoom(room.id);
            setJoinPassword('');
            setPasswordError('');
        } else {
            attemptJoinRoom(room.id);
        }
    };

    const submitPasswordPrompt = (e) => {
        e.preventDefault();
        attemptJoinRoom(promptRoom, joinPassword);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Password Prompt Modal */}
            {promptRoom && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-card border border-white/5 p-8 rounded-3xl max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                        <Lock size={40} className="text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-center mb-2 uppercase tracking-tighter">Private Party</h3>
                        <p className="text-textMuted text-center text-[11px] mb-6 font-medium">This room is password protected</p>

                        {passwordError && <p className="text-primary text-[10px] font-black uppercase text-center mb-4 tracking-widest">{passwordError}</p>}

                        <form onSubmit={submitPasswordPrompt}>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                value={joinPassword}
                                onChange={e => setJoinPassword(e.target.value)}
                                className="w-full bg-background/50 border border-white/5 text-white rounded-2xl p-4 outline-none focus:border-primary/50 mb-6 text-center tracking-widest"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setPromptRoom(null)} className="flex-1 px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] transition uppercase tracking-wider">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-4 rounded-2xl bg-primary hover:bg-primaryDark text-background font-bold text-[11px] transition uppercase tracking-wider shadow-lg shadow-primary/20">Join Room</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-card border border-white/5 rounded-3xl w-full max-w-2xl relative shadow-2xl my-4 sm:my-8 max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-textMuted hover:text-white transition">
                            <X size={24} />
                        </button>

                        <div className="p-4 sm:p-8 overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-1 uppercase tracking-tighter">Create Room</h2>
                            {!selectedMedia ? (
                                <div className="mt-6">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Find a movie..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-full bg-background/50 border border-white/5 text-white rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition shadow-inner"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mt-6 min-h-[300px] max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                        {isSearching ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                                <Loader2 className="animate-spin mb-4" size={32} />
                                                <p>Searching titles...</p>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                                {searchResults.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleSelectMedia(item)}
                                                        className="group flex flex-col items-start text-left"
                                                    >
                                                        <div className="aspect-[2/3] w-full bg-background rounded-xl overflow-hidden mb-2 border border-white/5 transition transform group-hover:scale-105 group-hover:border-primary">
                                                            <img
                                                                src={getImageUrl(item.poster_path, 'w185')}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-white truncate w-full">{item.title || item.name}</span>
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{item.media_type} • {(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : searchQuery ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                                <Search size={48} className="mb-4 opacity-10" />
                                                <p>Nothing found for "{searchQuery}"</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center">
                                                <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center mb-4">
                                                    <Search size={24} className="opacity-40" />
                                                </div>
                                                <p className="text-sm">Type in the search box to find something to watch</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Selected Media Preview */}
                                    <div className="bg-background p-4 rounded-3xl border border-white/5 flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
                                        <button onClick={() => setSelectedMedia(null)} className="absolute top-4 right-4 text-xs font-bold bg-white/5 hover:bg-white/10 p-2 rounded-full text-white transition text-textMuted hover:text-white">
                                            <X size={14} />
                                        </button>
                                        <img
                                            src={getImageUrl(selectedMedia.poster_path, 'w185')}
                                            className="w-24 h-36 rounded-xl object-cover border border-white/10"
                                            alt=""
                                        />
                                        <div className="flex-1 pt-2">
                                            <h3 className="text-xl font-black text-white">{selectedMedia.title || selectedMedia.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{selectedMedia.media_type.toUpperCase()} • {(selectedMedia.release_date || selectedMedia.first_air_date || '').slice(0, 4)}</p>

                                            {selectedMedia.media_type === 'tv' && (
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        className="bg-background border border-white/10 text-xs rounded-lg p-2 outline-none text-white focus:border-primary/50"
                                                        onChange={(e) => changeSeason(e.target.value)}
                                                        value={selectedSeason}
                                                    >
                                                        {[...Array(selectedMedia.seasons?.length || 1)].map((_, i) => (
                                                            <option key={i} value={i + 1}>Season {i + 1}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Episodes Grid if TV */}
                                    {selectedMedia.media_type === 'tv' && episodesList.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {episodesList.map(ep => (
                                                <button
                                                    key={ep.id}
                                                    onClick={() => setSelectedEpisode(ep.episode_number)}
                                                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${selectedEpisode === ep.episode_number ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20' : 'bg-background border-white/5 text-textMuted hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    E{ep.episode_number}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Room Config */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-textMuted/40 ml-1">Room Name</label>
                                            <input
                                                type="text"
                                                value={customRoomName}
                                                onChange={(e) => setCustomRoomName(e.target.value)}
                                                className="w-full bg-background border border-white/5 text-white rounded-2xl py-3 px-4 outline-none focus:border-primary/50 mt-1"
                                            />
                                        </div>

                                        <div className="bg-background border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isPrivate ? 'bg-accent/10 text-accent' : 'bg-white/5 text-textMuted/40'}`}>
                                                        {isPrivate ? <Lock size={18} /> : <Unlock size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">Make room private</p>
                                                        <p className="text-[10px] text-textMuted/40 tracking-tight">Private rooms require a password to join</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>

                                            {isPrivate && (
                                                <div className="animate-in slide-in-from-top-2 duration-300 border-t border-gray-800/50 pt-4">
                                                    <label className="text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Room Password</label>
                                                    <div className="relative mt-1">
                                                        <input
                                                            type={showCreatePassword ? "text" : "password"}
                                                            value={createPassword}
                                                            onChange={(e) => setCreatePassword(e.target.value)}
                                                            className="w-full bg-background border border-white/5 text-white rounded-xl py-3 px-4 outline-none focus:border-primary/50 pr-10"
                                                            placeholder="Set secret code"
                                                        />
                                                        <button
                                                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-primary transition-colors"
                                                        >
                                                            {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 mt-2 px-1">Share this password with friends you want to invite</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateRoom}
                                        className="w-full bg-primary hover:bg-primaryDark text-background py-4.5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition active:scale-[0.98] mt-4 uppercase tracking-wider"
                                    >
                                        Create Party
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-2 uppercase">Watch Party</h1>
                    <p className="text-textMuted text-[11px] md:text-sm font-medium uppercase tracking-wider opacity-60">Watch movies together in real-time</p>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-3">
                    <button
                        onClick={handleRefresh}
                        className="p-3 bg-white/5 border border-white/5 text-textMuted hover:text-white rounded-2xl transition hover:border-white/10"
                        title="Refresh rooms"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            setSelectedMedia(null);
                            setSearchQuery('');
                        }}
                        className="bg-primary hover:bg-primaryDark text-background px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg shadow-primary/20 uppercase tracking-wider text-[11px]"
                    >
                        <Plus size={20} /> Create Room
                    </button>
                </div>
            </div>

            {/* Room Filters */}
            <div className="mb-10 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-primary text-background font-bold text-[10px] uppercase tracking-wider transition">Active Parties</button>
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white/5 text-textMuted font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition">Popular</button>
            </div>

            {/* Room Grid */}
            {activeRooms.length === 0 ? (
                <div className="bg-card/50 border border-white/5 rounded-[32px] md:rounded-[48px] p-10 md:p-24 flex flex-col items-center justify-center text-center shadow-inner mt-4 backdrop-blur-md">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                        <div className="relative w-24 h-24 rounded-[32px] bg-background border border-white/10 flex items-center justify-center">
                            <Users size={40} className="text-primary" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3 tracking-tighter uppercase">No Active Rooms</h3>
                    <p className="text-textMuted max-w-sm font-medium uppercase tracking-wider text-[11px] leading-relaxed">There are no parties active right now. Why not start your own?</p>

                    <button
                        onClick={() => {
                            setShowCreateModal(true);
                            setSelectedMedia(null);
                            setSearchQuery('');
                        }}
                        className="mt-10 px-10 py-5 bg-primary text-background rounded-[24px] font-bold hover:scale-105 transition shadow-2xl shadow-primary/30 uppercase tracking-wider text-xs"
                    >
                        Create a Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeRooms.map(room => (
                        <div key={room.id} className="group relative bg-card rounded-3xl overflow-hidden border border-white/5 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-black/50">
                            {/* Backdrop Image */}
                            <div className="aspect-video w-full relative overflow-hidden">
                                {room.media?.poster_path ? (
                                    <div className="absolute inset-0">
                                        <img
                                            src={getImageUrl(room.media.poster_path, 'w500')}
                                            alt=""
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-card to-background"></div>
                                )}

                                {/* Room Tags */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {room.hasPassword && (
                                        <div className="bg-background/60 backdrop-blur-md p-2 rounded-lg text-primary border border-primary/20 shadow-lg">
                                            <Lock size={14} />
                                        </div>
                                    )}
                                    <div className="bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white border border-white/10 shadow-lg flex items-center gap-2">
                                        <Users size={14} className="text-primary/70" />
                                        <span className="text-xs font-bold">{room.viewers}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-0 relative mt-[-10px]">
                                <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate group-hover:text-primary transition uppercase tracking-tight">{room.roomName}</h3>
                                {room.media ? (
                                    <p className="text-[11px] font-bold text-textMuted mb-4 flex items-center gap-2 uppercase tracking-wide truncate">
                                        <span className="w-1 h-3 bg-primary rounded-full"></span>
                                        {room.media.title || room.media.name}
                                    </p>
                                ) : (
                                    <p className="text-[11px] font-bold text-textMuted mb-4 uppercase tracking-wide">Selecting Movie...</p>
                                )}

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-bold border border-white/5 text-primary">
                                            {room.host.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-textMuted/60">Host: {room.host}</span>
                                    </div>

                                    <button
                                        onClick={() => handleJoinClickFromList(room)}
                                        className="bg-primary hover:bg-primaryDark text-background px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-wider"
                                    >
                                        <LogIn size={14} /> Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
