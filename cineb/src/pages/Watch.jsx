import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi, getImageUrl } from '../api';
import { PlayCircle, ArrowLeft, Server, Film, List, Heart, SkipBack, SkipForward, Users, Globe } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { useContinueWatching } from '../hooks/useContinueWatching';
import MovieCard from '../components/MovieCard';
import ChatPanel from '../components/ChatPanel';
import { io } from 'socket.io-client';

const SERVERS = [
    { name: 'Vidlink', url: (id, t, s, e) => t === 'movie' ? `https://vidlink.pro/movie/${id}?autoplay=true` : `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true` },
    { name: 'Embed', url: (id, t, s, e) => t === 'movie' ? `https://embed.su/embed/movie/${id}?autoplay=1` : `https://embed.su/embed/tv/${id}/${s}/${e}?autoplay=1` },
    { name: 'VidSrc', url: (id, t, s, e) => t === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}&autoplay=1` : `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}&autoplay=1` },
    { name: 'VidSrc 2', url: (id, t, s, e) => t === 'movie' ? `https://vidsrc.to/embed/movie/${id}?autoplay=1` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}?autoplay=1` },
];

export default function Watch({ explicitType, explicitId, startTime, partyRoom, isHost: partyIsHost, username: partyUsername }) {
    const params = useParams();
    const type = explicitType || params.type;
    const id = explicitId || params.id;

    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);


    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [activeServer, setActiveServer] = useState(0); // Default to Vidlink (cleanest)
    const [episodesList, setEpisodesList] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [showPartyPrompt, setShowPartyPrompt] = useState(false);
    const [adShieldClicks, setAdShieldClicks] = useState(0);

    const { toggleWatchlist, isInWatchlist } = useWatchlist();
    const { history, addToHistory } = useContinueWatching();
    const inList = detail ? isInWatchlist(detail.id, type) : false;

    // Load progress from history once on mount
    useEffect(() => {
        const savedItem = history.find(i => String(i.id) === String(id) && i.media_type === type);
        if (savedItem && savedItem.season && savedItem.episode) {
            setSeason(savedItem.season);
            setEpisode(savedItem.episode);
        }
    }, [id, type]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchApi(`/${type}/${id}?append_to_response=credits,recommendations`).then(data => {
            setDetail(data);
        });
    }, [id, type]);

    // Save to Continue Watching history
    useEffect(() => {
        if (detail) {
            addToHistory(detail, type, season, episode);
        }
    }, [detail, type, season, episode]);

    // Handle Watch Party Prompt
    useEffect(() => {
        if (explicitType && explicitId) {
            // Already inside the Dashboard View
            setShowPartyPrompt(false);
            setShowChat(true);
            return;
        }

        const wpRoom = sessionStorage.getItem('wp_room');
        const isHost = sessionStorage.getItem('wp_isHost') === 'true';

        if (wpRoom && explicitType) {
            if (isHost) {
                setShowPartyPrompt(true);
            } else {
                setShowChat(true);
            }
        }
    }, [id, explicitType, explicitId]);

    const startWatchParty = () => {
        const wpRoom = sessionStorage.getItem('wp_room');
        const username = sessionStorage.getItem('wp_username') || "Guest";
        if (wpRoom) {
            const tempSocket = io(import.meta.env.VITE_API_URL);
            tempSocket.on('connect', () => {
                // We must join the room so the server associates this socket with our username/host status
                tempSocket.emit('join_room', { room: wpRoom, username });

                // Small delay to ensure join_room is processed before start_video
                setTimeout(() => {
                    tempSocket.emit('start_video', { room: wpRoom, type, id });
                    setTimeout(() => {
                        tempSocket.disconnect();
                        navigate('/party/room/' + wpRoom);
                    }, 100);
                }, 100);
            });
        }
        setShowPartyPrompt(false);
    };

    const watchSolo = () => {
        setShowPartyPrompt(false);
    };

    useEffect(() => {
        if (type === 'tv' && detail) {
            // Fetch episodes for current season
            fetchApi(`/tv/${id}/season/${season}`).then(data => {
                if (data && data.episodes) setEpisodesList(data.episodes);
            });
        }
    }, [season, id, type, detail]);

    useEffect(() => {
        const handleIframeMessage = (event) => {
            // Check for VidLink 'video_ended' or standard events
            if (event.data && (event.data.type === 'video_ended' || event.data === 'video_ended')) {
                if (type === 'tv' && episode < episodesList.length) {
                    setEpisode(e => e + 1);
                }
            }
        };

        window.addEventListener('message', handleIframeMessage);
        return () => window.removeEventListener('message', handleIframeMessage);
    }, [type, episode, episodesList]);

    if (!detail) return <div className="p-10 text-center animate-pulse text-textMuted">Loading Video Data...</div>;

    const url = SERVERS[activeServer].url(id, type, season, episode);

    // Host: periodically send estimated time to server so late joiners get current position
    const partyTimeRef = useRef(startTime || 0);
    const partyStartedAtRef = useRef(Date.now());

    useEffect(() => {
        if (!partyRoom || !partyIsHost) return;

        // Track time since video started in this session
        partyTimeRef.current = startTime || 0;
        partyStartedAtRef.current = Date.now();

        const partySocket = io(import.meta.env.VITE_API_URL);
        partySocket.on('connect', () => {
            partySocket.emit('join_room', { room: partyRoom, username: partyUsername });
        });

        // Send time updates every 10 seconds
        const interval = setInterval(() => {
            const elapsed = (Date.now() - partyStartedAtRef.current) / 1000;
            const currentTime = Math.floor(partyTimeRef.current + elapsed);
            partySocket.emit('time_update', {
                room: partyRoom,
                currentTime,
                isPlaying: true
            });
        }, 10000);

        return () => {
            clearInterval(interval);
            partySocket.disconnect();
        };
    }, [partyRoom, partyIsHost, partyUsername, id, type]);

    if (explicitType) {
        // Build URL with time offset for party mode
        let partyUrl = url;
        if (startTime && startTime > 0) {
            // Add time offset - different embed providers use different params
            // vidsrc.me, embed.su support #t=seconds, vidlink supports &t=seconds
            const separator = partyUrl.includes('?') ? '&' : '?';
            partyUrl = `${partyUrl}${separator}t=${startTime}`;
        }

        return (
            <div className="w-full h-full bg-black relative">
                <iframe
                    src={partyUrl}
                    className="w-full h-full border-none"
                    allow="autoplay; fullscreen; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    referrerPolicy="no-referrer"
                    title="Video Player"
                ></iframe>
            </div>
        );
    }

    const handleNextEp = () => {
        if (episode < episodesList.length) setEpisode(episode + 1);
    };

    const handlePrevEp = () => {
        if (episode > 1) setEpisode(episode - 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10 flex flex-col lg:flex-row gap-6 md:gap-10">
            <div className={`flex-1 transition-all duration-300 w-full lg:max-w-none`}>
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => {
                            if (explicitType) {
                                sessionStorage.removeItem('wp_room');
                                sessionStorage.removeItem('wp_isHost');
                                navigate('/party');
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="flex items-center gap-2 text-textMuted hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} /> {explicitType ? 'Exit Party' : 'Back'}
                    </button>
                    {!showChat && !explicitType && (
                        <button onClick={() => setShowChat(true)} className="flex items-center gap-2 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest px-5 py-2.5 border border-primary/20 shadow-[0_10px_20px_rgba(0,255,133,0.1)] rounded-xl hover:bg-primary hover:text-background transition-all ">
                            <Users size={16} /> Party Mode
                        </button>
                    )}
                </div>

                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-gray-800 shadow-2xl relative mb-4">
                    {/* Watch Party Prompt Overlay */}
                    {showPartyPrompt && (
                        <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
                            <div className="bg-card border border-white/5 p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary mx-auto mb-6 shadow-inner border border-primary/20 ">
                                        <Users size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Watch Party</h2>
                                    <p className="text-textMuted text-[12px] mb-8 mt-2">Start a watch party for room <span className="text-primary font-bold">{sessionStorage.getItem('wp_room')}</span>?</p>

                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={startWatchParty}
                                            className="bg-primary hover:bg-primaryDark text-background font-black py-4.5 rounded-2xl transition shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
                                        >
                                            Start Party
                                        </button>
                                        <button
                                            onClick={watchSolo}
                                            className="bg-white/5 hover:bg-white/10 text-white font-black py-4.5 rounded-2xl transition uppercase tracking-widest text-xs"
                                        >
                                            Watch Alone
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Ad Shield - absorbs first 2 clicks that usually trigger ads */}
                    {adShieldClicks < 2 && (
                        <div
                            className="absolute inset-0 z-40 cursor-pointer group/shield"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAdShieldClicks(prev => prev + 1);
                            }}
                        >
                            <div className="absolute inset-0 bg-black/10 group-hover/shield:bg-black/0 transition-colors"></div>
                            {adShieldClicks === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl border border-primary/30 animate-pulse shadow-[0_0_30px_rgba(0,224,84,0.2)]">
                                        Click to Unlock Player
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <iframe
                        src={SERVERS[activeServer].url(id, type, season, episode)}
                        className="w-full h-full border-none"
                        allow="autoplay; fullscreen; encrypted-media"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                        referrerPolicy="no-referrer"
                        title="Video Player"
                    ></iframe>
                </div>

                {/* Server Selection UI */}
                <div className="flex flex-wrap items-center gap-2 mb-8 bg-card border border-white/5 p-3 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2 mr-2 px-3 border-r border-white/10">
                        <Server size={14} className="text-primary" />
                        <span className="text-[11px] font-medium text-textMuted">Server Selection</span>
                    </div>
                    {SERVERS.map((srv, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setActiveServer(idx); setAdShieldClicks(0); }}
                            className={`px-4 py-2 rounded-xl text-[11px] font-medium transition-all flex items-center gap-2 ${activeServer === idx ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-white/5 text-textMuted hover:text-white hover:bg-white/10'}`}
                        >
                            {srv.name}
                            {idx === 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black ${activeServer === idx ? 'bg-background text-primary' : 'bg-primary/20 text-primary'}`}>
                                    DUB
                                </span>
                            )}
                        </button>
                    ))}
                    <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        HD Stream Active
                    </div>
                </div>



                {/* Next/Prev Episode Controls for TV */}
                {type === 'tv' && (
                    <div className="flex items-center justify-between bg-card border border-white/5 p-4 rounded-2xl mb-6 shadow-xl">
                        <button
                            onClick={handlePrevEp}
                            disabled={episode === 1}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl bg-white/5 text-textMuted disabled:opacity-20 hover:bg-white/10 transition"
                        >
                            <SkipBack size={16} /> Rewind
                        </button>
                        <span className="text-primary font-black uppercase tracking-[0.2em] text-[11px]">S0{season} • E{episode < 10 ? '0' + episode : episode}</span>
                        <button
                            onClick={handleNextEp}
                            disabled={episode === episodesList.length}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl bg-primary text-background disabled:opacity-50 hover:bg-primaryDark transition shadow-lg shadow-primary/10"
                        >
                            Forward <SkipForward size={16} />
                        </button>
                    </div>
                )}

                {/* Title & Info */}
                <div className="mt-6 flex flex-col md:flex-row gap-6 md:gap-8">
                    <img
                        src={getImageUrl(detail.poster_path, 'w185')}
                        alt={detail.title || detail.name}
                        className="w-32 h-48 rounded-2xl object-cover border border-white/5 hidden lg:block shrink-0 shadow-2xl"
                    />

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{detail.title || detail.name}</h1>
                            <button
                                onClick={() => toggleWatchlist(detail, type)}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-[11px] transition-all border shrink-0 ${inList ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                            >
                                <Heart size={14} className={inList ? 'fill-current' : ''} />
                                {inList ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:gap-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-6 py-2 border-y border-white/5">
                            <span className="flex items-center gap-1.5 text-primary text-[11px]"><Film size={12} /> {type.toUpperCase()}</span>
                            <span className="text-white/20">•</span>
                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 font-bold">{detail.vote_average?.toFixed(1)} IMDB</span>
                            <span className="text-white/20">•</span>
                            <span className="text-textMuted">{(detail.release_date || detail.first_air_date || '').slice(0, 4)}</span>
                            {detail.runtime && (
                                <>
                                    <span className="text-white/20">•</span>
                                    <span className="text-textMuted">{detail.runtime} MINS</span>
                                </>
                            )}
                            {detail.spoken_languages && detail.spoken_languages.length > 0 && (
                                <>
                                    <span className="text-white/20">•</span>
                                    <span className="text-accent flex items-center gap-1.5">
                                        <Globe size={12} />
                                        {detail.spoken_languages.map(l => l.english_name).join(', ')}
                                    </span>
                                </>
                            )}
                        </div>


                        <p className="text-textMuted text-xs md:text-base leading-relaxed mb-8 opacity-70">
                            {detail.overview}
                        </p>


                        {/* TV Shows Selector */}
                        {type === 'tv' && detail.seasons?.length > 0 && (
                            <div className="bg-card p-5 rounded-xl border border-gray-800 mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-textMuted mb-4 flex items-center gap-2">
                                    <List size={14} /> Episodes Menu
                                </h3>

                                <div className="mb-4">
                                    <select
                                        className="bg-background border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none"
                                        value={season}
                                        onChange={(e) => { setSeason(parseInt(e.target.value)); setEpisode(1) }}
                                    >
                                        {detail.seasons.filter(s => s.season_number > 0).map(s => (
                                            <option key={s.id} value={s.season_number}>
                                                {s.name} ({s.episode_count} eps)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {episodesList.map(ep => (
                                        <button
                                            key={ep.id}
                                            onClick={() => setEpisode(ep.episode_number)}
                                            className={`aspect-square rounded flex items-center justify-center text-sm font-bold transition-all border ${episode === ep.episode_number ? 'bg-primary text-black border-primary' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            {ep.episode_number}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cast & Recommendations */}
                <div className="mt-12 border-t border-gray-800 pt-8">
                    {detail.credits?.cast?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3 text-white">Top Cast</h2>
                            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                                {detail.credits.cast.slice(0, 15).map(person => (
                                    <div key={person.id} className="snap-start w-24 sm:w-32 flex-shrink-0 text-center">
                                        <div className="aspect-[2/3] w-full bg-gray-900 rounded-xl border border-gray-800 mb-3 overflow-hidden">
                                            {person.profile_path ? (
                                                <img
                                                    src={getImageUrl(person.profile_path, 'w185')}
                                                    alt={person.name}
                                                    className="w-full h-full object-cover placeholder-opacity-50"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">No Photo</div>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-white truncate">{person.name}</p>
                                        <p className="text-xs text-textMuted truncate">{person.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {detail.recommendations?.results?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-4 border-l-4 border-primary pl-3 text-white">You May Also Like</h2>
                            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                                {detail.recommendations.results.map(item => (
                                    <div key={item.id} className="snap-start w-36 sm:w-44 lg:w-48 flex-shrink-0">
                                        <MovieCard item={item} type={item.media_type || type} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div> {/* End of main content area flex-1 */}

            {/* Chat Panel Overlay Panel for Desktop */}
            {showChat && (
                <div className="w-full lg:w-80 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] bg-card border border-white/5 rounded-2xl overflow-hidden shrink-0 h-[600px] lg:h-[800px] lg:sticky lg:top-24 mt-8 lg:mt-0">
                    <ChatPanel
                        room={sessionStorage.getItem('wp_room') || `watch-${type}-${id}`}
                        onClose={() => {
                            setShowChat(false);
                            sessionStorage.removeItem('wp_room');
                        }}
                    />
                </div>
            )}
        </div>
    );
}
