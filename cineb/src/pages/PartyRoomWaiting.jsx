import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Loader2, Film, MessageCircle, ArrowLeft, Send, Share2 } from 'lucide-react';
import { io } from 'socket.io-client';
import Watch from './Watch';

let socket;

export default function PartyRoomWaiting() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Waiting for Host...");
    const [playingVideo, setPlayingVideo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState("");
    const [viewers, setViewers] = useState([]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'info'

    const isHost = sessionStorage.getItem('wp_isHost') === 'true';
    const username = sessionStorage.getItem('wp_username') || "Guest";
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket = io(import.meta.env.VITE_API_URL);

        socket.on('connect', () => {
            socket.emit('join_room', { room: roomCode, username });
        });

        socket.on('video_sync', (data) => {
            if (data.type && data.id) {
                setPlayingVideo({ type: data.type, id: data.id });
            }
        });

        socket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('room_users', (users) => {
            setViewers(users);
        });

        socket.on('kicked', () => {
            alert("You have been removed from the session by the host.");
            navigate('/party');
        });

        return () => socket.disconnect();
    }, [roomCode, username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!currentMsg.trim()) return;
        const msgData = {
            room: roomCode,
            author: username,
            message: currentMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        socket.emit('send_message', msgData);
        setMessages(prev => [...prev, msgData]);
        setCurrentMsg("");
    };

    const handleKick = (userId, targetUsername) => {
        if (window.confirm(`Are you sure you want to dismiss ${targetUsername}?`)) {
            socket.emit('kick_user', { room: roomCode, userId });
        }
    };

    const handleInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Session frequency copied to clipboard! Share it with your squad.");
    };

    const handleBack = () => {
        sessionStorage.removeItem('wp_room');
        sessionStorage.removeItem('wp_isHost');
        navigate('/party');
    };

    return (
        <div className="flex flex-col h-screen bg-background text-white overflow-hidden -m-8 md:-m-12">
            {/* Top Bar */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-xl transition text-textMuted hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter flex items-center gap-2">
                            PREMIUM <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-[10px] tracking-widest">{roomCode}</span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-[9px] text-textMuted font-black uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            {viewers.length} Attendees
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleInvite}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition border border-white/5 text-textMuted hover:text-white"
                    >
                        <Share2 size={14} /> Invite
                    </button>
                    {isHost && (
                        <Link to="/" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primaryDark text-background rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-primary/20">
                            <Film size={14} /> Library
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area: Player or Waiting */}
                <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                    {playingVideo ? (
                        <div className="flex-1 bg-black flex flex-col overflow-hidden">
                            <Watch explicitType={playingVideo.type} explicitId={playingVideo.id} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_#0F121E_0%,_#07090F_100%)]">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                                <div className="relative w-24 h-24 bg-card border border-white/10 rounded-[32px] flex items-center justify-center text-primary shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    <Loader2 className="animate-spin" size={40} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black mb-3 tracking-tighter uppercase text-white">Curating Selection</h2>
                            <p className="text-textMuted max-w-sm font-bold uppercase tracking-[0.2em] text-[10px] leading-loose">
                                {isHost
                                    ? "Select a masterpiece from the library to begin the synchronization."
                                    : "Take a seat. The host is currently selecting the feature presentation."}
                            </p>

                            {isHost && (
                                <div className="mt-12 flex gap-4">
                                    <Link to="/movies" className="px-10 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition">
                                        Movies
                                    </Link>
                                    <Link to="/anime" className="px-10 py-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 hover:scale-105 active:scale-95 transition">
                                        Anime
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar: Chat & Participants */}
                <div className="w-80 border-l border-white/5 bg-background flex flex-col shrink-0">
                    <div className="p-4 flex gap-2 border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition ${activeTab === 'chat' ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-white/5 text-textMuted hover:text-white'}`}
                        >
                            <MessageCircle size={14} /> Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition ${activeTab === 'info' ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-white/5 text-textMuted hover:text-white'}`}
                        >
                            <Users size={14} /> Lounge
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'chat' ? (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-10">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.author === username ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-1.5 mb-1.5 px-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-textMuted/60">{msg.author}</span>
                                                <span className="text-[8px] text-textMuted/40 italic">{msg.time}</span>
                                            </div>
                                            <div className={`px-4 py-3 rounded-2xl text-[11px] leading-relaxed max-w-[90%] font-bold ${msg.author === username ? 'bg-primary text-background' : 'bg-card text-white border border-white/5'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 bg-background/80 backdrop-blur-xl border-t border-white/5">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={currentMsg}
                                            onChange={(e) => setCurrentMsg(e.target.value)}
                                            placeholder="Whisper message..."
                                            className="w-full bg-card border border-white/5 text-white rounded-2xl py-3 pl-4 pr-12 outline-none focus:border-primary/50 transition text-[11px] font-bold"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-background transition hover:scale-110 active:scale-95">
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4 h-full overflow-y-auto custom-scrollbar">
                                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 px-2">Watching now ({viewers.length})</p>
                                {viewers.map((u, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5 group transition-all hover:bg-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-card to-background flex items-center justify-center text-white font-black text-sm relative border border-white/10 group-hover:border-primary/50 transition-colors shadow-inner">
                                            {u.username.charAt(0).toUpperCase()}
                                            {u.isHost && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-background p-0.5 rounded-full shadow-lg border-2 border-background">
                                                    <Users size={8} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white truncate flex items-center gap-2">
                                                {u.username}
                                                {u.isHost && <span className="text-[7px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded uppercase tracking-[0.2em]">Host</span>}
                                            </p>
                                            <p className="text-[8px] text-textMuted font-black uppercase tracking-widest opacity-60">Citizen Status</p>
                                        </div>

                                        {isHost && !u.isHost && (
                                            <button
                                                onClick={() => handleKick(u.id, u.username)}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                                                title="Dismiss Citizen"
                                            >
                                                <EyeOff size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
