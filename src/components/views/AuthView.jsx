import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AuthView = ({ ui, lang }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (isSignUp && password !== confirmPassword) {
            setMessage({ 
                type: 'error', 
                text: lang === 'sv' ? "Lösenorden matchar inte!" : "Passwords do not match!" 
            });
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { data, error: authError } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: { full_name: fullName, role: role }
                    }
                });
                if (authError) throw authError;

                if (data.user) {
                    await supabase.from('profiles').insert([{ 
                        id: data.user.id, 
                        full_name: fullName, 
                        role: role,
                        alias: role === 'student' ? `User-${Math.floor(Math.random() * 10000)}` : null
                    }]);
                }
                setMessage({ 
                    type: 'success', 
                    text: lang === 'sv' ? "Konto skapat! Kolla din e-post." : "Account created! Check your email." 
                });
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
                data: { role: role } 
            }
        });
        if (error) setMessage({ type: 'error', text: error.message });
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black text-indigo-600 mb-1 tracking-tighter">Anpassa</h1>
                    <p className="text-slate-500 text-sm font-medium font-mono">
                        {isSignUp ? (lang === 'sv' ? "SKAPA KONTO" : "CREATE ACCOUNT") : (lang === 'sv' ? "VÄLKOMMEN TILLBAKA" : "WELCOME BACK")}
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                        {lang === 'sv' ? "Jag är en..." : "I am a..."}
                    </label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                        <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${role === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                            {lang === 'sv' ? "Elev" : "Student"}
                        </button>
                        <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${role === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                            {lang === 'sv' ? "Lärare" : "Teacher"}
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <button 
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-3 p-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-indigo-100 transition-all font-bold text-slate-600 shadow-sm"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.7 1 4.1 3.5 2.3 7.1l3.7 2.9C6.9 7.1 9.3 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.7-2.4 3.5l3.8 3c2.2-2 3.6-5 3.6-8.6z"/><path fill="#FBBC05" d="M6 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L2.3 7.1C1.4 8.7 1 10.3 1 12s.4 3.3 1.3 4.9l3.7-2.2z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.8-3c-1 .7-2.3 1.2-3.6 1.2-2.7 0-5.1-2.1-5.9-4.9l-3.7 2.9C4.1 20.5 7.7 23 12 23z"/></svg>
                        {lang === 'sv' ? "Logga in med Google" : "Continue with Google"}
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-tighter"><span className="bg-white px-3 text-slate-300 font-black">{lang === 'sv' ? "Eller e-post" : "Or Email"}</span></div>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                    {isSignUp && (
                        <div>
                            <input type="text" placeholder={lang === 'sv' ? "Namn" : "Name"} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                    )}
                    <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder={lang === 'sv' ? "Lösenord" : "Password"} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    
                    {isSignUp && (
                        <input 
                            type="password" 
                            placeholder={lang === 'sv' ? "Bekräfta lösenord" : "Confirm password"} 
                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    )}

                    <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                        {loading ? '...' : (isSignUp ? (lang === 'sv' ? "SKAPA KONTO" : "CREATE ACCOUNT") : (lang === 'sv' ? "LOGGA IN" : "LOG IN"))}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-4 rounded-2xl text-xs font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mt-8 text-center border-t border-slate-50 pt-6">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">
                        {isSignUp ? (lang === 'sv' ? "Har redan ett konto? Logga in" : "Already have an account? Log In") : (lang === 'sv' ? "Inget konto? Gå med här" : "No account? Join here")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;