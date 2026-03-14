import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) throw new Error('Name is required');
                if (password.length < 6) throw new Error('Password must be at least 6 characters');
                await signup(name, email, password);
            }
            // If successful, go to home or previous page
            navigate(-1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-textMuted hover:text-white mb-8 transition-colors self-start max-w-md mx-auto w-full"
            >
                <ArrowLeft size={18} /> Back
            </button>
            <div className="w-full max-w-md bg-card border border-white/5 rounded-[32px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 shadow-[0_0_15px_rgba(0,224,84,0.5)]"></div>

                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-inner bg-glow-green">
                        {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter leading-none text-glow-green italic">
                    {isLogin ? 'Access Portal' : 'Citizen Registry'}
                </h2>
                <p className="text-center text-textMuted/60 mb-10 text-[10px] font-black uppercase tracking-widest leading-loose">
                    {isLogin ? 'Enter credentials to resume your journey.' : 'Enlist now to begin hosting private sessions.'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Display Name</label>
                            <input
                                type="text"
                                placeholder="Your cool username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border border-gray-700 text-white text-sm rounded-lg p-3 outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            placeholder="you@awesome.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-background border border-gray-700 text-white text-sm rounded-lg p-3 outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-background border border-gray-700 text-white text-sm rounded-lg p-3 outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-background font-black py-4.5 mt-6 rounded-2xl hover:bg-primaryDark transition shadow-xl shadow-primary/20 disabled:opacity-20 uppercase tracking-[0.2em] text-xs"
                    >
                        {loading ? 'Authorizing...' : isLogin ? 'Infiltrate' : 'Establish'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-textMuted">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="hover:text-primary transition font-semibold"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
