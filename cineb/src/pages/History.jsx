import { useContinueWatching } from '../hooks/useContinueWatching';
import MovieCard from '../components/MovieCard';
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react';

export default function History() {
    const { history, clearHistory, removeFromHistory } = useContinueWatching();

    return (
        <div className="px-8 max-w-[1600px] mx-auto py-10">
            <div className="flex items-center justify-between mb-14">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(255,184,0,0.4)]"></div>
                    <h1 className="text-4xl font-bold text-white tracking-tighter uppercase whitespace-nowrap">
                        Watch History
                    </h1>
                </div>

                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-red-500 hover:border-red-500/30 transition-all group"
                    >
                        <Trash2 size={16} className="group-hover:animate-bounce" /> Clear History
                    </button>
                )}
            </div>

            {
                history.length === 0 ? (
                    <div className="bg-card/50 border border-white/5 rounded-[48px] p-24 flex flex-col items-center justify-center text-center shadow-inner mt-4 backdrop-blur-md">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                            <div className="relative w-24 h-24 rounded-[32px] bg-background border border-white/10 flex items-center justify-center">
                                <HistoryIcon size={40} className="text-primary/40" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3 tracking-tighter uppercase">No Watch History</h3>
                        <p className="text-textMuted max-w-sm font-medium uppercase tracking-wider text-[11px] leading-relaxed">You haven't watched anything yet. Start watching movies and shows to build your history.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 gap-y-16">
                        {history.slice().reverse().map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="relative group">
                                <MovieCard item={item} type={item.media_type} />

                                {/* Timestamp / Episode Badge */}
                                <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between px-2">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-textMuted uppercase tracking-widest">
                                        <Clock size={10} className="text-primary" />
                                        {item.media_type === 'tv' ? `S${item.season} E${item.episode}` : 'Watched'}
                                    </div>
                                    <button
                                        onClick={() => removeFromHistory(item.id, item.media_type)}
                                        className="p-1.5 rounded-lg bg-white/5 text-textMuted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>

                                {/* Progress bar simulation */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/50 w-[70%]" style={{ width: `${Math.floor(Math.random() * 60) + 30}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
