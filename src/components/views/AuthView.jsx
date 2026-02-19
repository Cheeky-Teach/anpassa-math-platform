import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Chrome, Mail, ArrowRight, GraduationCap, Users, Lock, User, ChevronLeft } from 'lucide-react';

export default function AuthView({ lang, studentMode, onSuccess, onBack }) {
    // --- 1. SHARED STATE ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // --- 2. STUDENT STATE ---
    const [code, setCode] = useState('');

    // --- 3. TEACHER STATE ---
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const t = {
        sv: { 
            student_h: studentMode === 'live' ? "Gå med i Live Room" : "Gå med i din klass",
            code_placeholder: "6-siffrig kod", 
            teacher_h: isSignUp ? "Skapa lärarkonto" : "Logga in som lärare", 
            btn_google: "Logga in med Google",
            btn_join: "Gå med",
            btn_login: "Logga in",
            btn_signup: "Skapa konto",
            toggle_signup: "Inget konto? Gå med här",
            toggle_login: "Har redan ett konto? Logga in",
            or_email: "Eller med e-post",
            error_code: "Ogiltig kod. Kontrollera med din lärare.",
            error_sub: "Koden är korrekt, men lärarens konto har gått ut.",
            name_placeholder: "Ditt namn",
            back: "← Tillbaka"
        },
        en: { 
            student_h: studentMode === 'live' ? "Join Live Room" : "Join Your Class",
            code_placeholder: "6-digit code", 
            teacher_h: isSignUp ? "Create Teacher Account" : "Teacher Login", 
            btn_google: "Sign in with Google",
            btn_join: "Join",
            btn_login: "Log In",
            btn_signup: "Create Account",
            toggle_signup: "No account? Join here",
            toggle_login: "Already have an account? Log In",
            or_email: "Or with email",
            error_code: "Invalid code. Check with your teacher.",
            error_sub: "Code valid, but teacher subscription has expired.",
            name_placeholder: "Your Name",
            back: "← Back"
        }
    }[lang];

    // --- 5. STUDENT JOIN LOGIC + HANDSHAKE DEBUGGER ---
    const handleCodeJoin = async (e) => {
        e.preventDefault();
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode.length !== 6) return;
        
        setLoading(true);
        setMessage(null);
        
        console.group("🔑 HANDSHAKE DEBUGGER");
        console.log("Attempting to join with code:", cleanCode);
        console.log("Student Mode:", studentMode);

        try {
            if (studentMode === 'live') {
                // DEBUG STEP 1: Check if the room exists AT ALL (ignoring status)
                const { data: anyRoom, error: debugError } = await supabase
                    .from('rooms')
                    .select('status, class_code')
                    .eq('class_code', cleanCode);
                
                console.log("Room lookup (all status):", anyRoom);
                if (debugError) console.error("Database Error:", debugError.message);

                // ACTUAL QUERY: Must be active
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('class_code', cleanCode)
                    .eq('status', 'active')
                    .single();

                if (data) {
                    console.log("✅ Success! Room data found:", data);
                    onSuccess({ role: 'live', room: data });
                } else {
                    console.warn("❌ Failed to find active room.");
                    if (anyRoom && anyRoom.length > 0) {
                        console.warn(`Room exists but status is '${anyRoom[0].status}' instead of 'active'`);
                        setMessage({ type: 'error', text: `Sessionen är '${anyRoom[0].status}'.` });
                    } else {
                        setMessage({ type: 'error', text: t.error_code });
                    }
                }
            } else {
                // Practice Class Logic
                const { data, error } = await supabase
                    .from('classes')
                    .select('*, profiles(subscription_status, subscription_end_date)')
                    .eq('invite_code', cleanCode)
                    .single();
                
                if (data) {
                    const teacherSub = data.profiles;
                    const isTeacherActive = teacherSub?.subscription_status === 'active' || 
                                          new Date(teacherSub?.subscription_end_date) > new Date();
                    
                    if (isTeacherActive) onSuccess({ role: 'student', class: data });
                    else setMessage({ type: 'error', text: t.error_sub });
                } else {
                    setMessage({ type: 'error', text: t.error_code });
                }
            }
        } catch (err) {
            console.error("🔥 Critical Handshake Crash:", err);
            setMessage({ type: 'error', text: "Systemfel. Se konsollen." });
        } finally {
            console.groupEnd();
            setLoading(false);
        }
    };

    // --- 6. TEACHER AUTH LOGIC ---
    const handleGoogleLogin = async () => {
        setLoading(true);
        await supabase.auth.signInWithOAuth({ 
            provider: 'google', 
            options: { redirectTo: window.location.origin } 
        });
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { full_name: fullName, role: 'teacher' } }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: lang === 'sv' ? "Kolla din e-post!" : "Check your email!" });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <button 
                onClick={onBack} 
                className="absolute top-8 left-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
                <ChevronLeft size={16} /> {t.back}
            </button>
            
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200">
                {studentMode ? (
                    <div className="space-y-8 text-center">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                            {studentMode === 'live' ? <Users size={48} /> : <GraduationCap size={48} />}
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">{t.student_h}</h2>
                        <form onSubmit={handleCodeJoin} className="space-y-6">
                            <input 
                                type="text" maxLength={6} value={code} 
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full p-6 bg-slate-100 rounded-[2rem] text-center text-5xl font-black uppercase tracking-[0.4em] outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all border-none"
                                placeholder="XXXXXX"
                                required
                            />
                            <button 
                                disabled={loading || code.length !== 6}
                                className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-xl uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                                {loading ? '...' : t.btn_join} <ArrowRight />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">{t.teacher_h}</h2>
                        </div>
                        <button 
                            onClick={handleGoogleLogin} 
                            className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-4 font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t.btn_google}
                        </button>
                        <div className="relative py-2 flex items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.or_email}</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>
                        <form onSubmit={handleEmailAuth} className="space-y-3">
                            {isSignUp && (
                                <div className="relative">
                                    <User className="absolute left-4 top-4 text-slate-400" size={18} />
                                    <input 
                                        type="text" placeholder={t.name_placeholder} value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                                        required
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                                <input 
                                    type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                                <input 
                                    type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                                    required
                                />
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                                {isSignUp ? t.btn_signup : t.btn_login}
                            </button>
                        </form>
                        <div className="text-center pt-2">
                            <button 
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                                {isSignUp ? t.toggle_login : t.toggle_signup}
                            </button>
                        </div>
                    </div>
                )}
                {message && (
                    <div className={`mt-6 p-4 rounded-2xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}