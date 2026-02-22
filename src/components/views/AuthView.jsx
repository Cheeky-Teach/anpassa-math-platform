import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Chrome, Mail, ArrowRight, GraduationCap, Users, 
    Lock, User, ChevronLeft, Zap, Star, CreditCard, 
    CheckCircle2, Loader2, AlertCircle, Building2, Search 
} from 'lucide-react';

export default function AuthView({ lang, studentMode, onSuccess, onBack, initialCode }) {
    // --- 1. SHARED STATE ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPlanPicker, setShowPlanPicker] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'

    // --- 2. STUDENT STATE ---
    const [code, setCode] = useState(initialCode || '');

    // --- 3. TEACHER STATE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [schoolInput, setSchoolInput] = useState('');
    const [schoolSuggestions, setSchoolSuggestions] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null); // {id, name}

    const t = {
        sv: { 
            student_h: studentMode === 'live' ? "Live-rum" : "Ditt Klassrum",
            code_placeholder: "Skriv kod...", 
            teacher_h: authMode === 'signup' ? "Skapa lärarkonto" : authMode === 'forgot' ? "Återställ lösenord" : "Logga in", 
            btn_join: "Gå med",
            error_code: "Ogiltig kod. Kontrollera med din lärare.",
            error_full: "Rummet är fullt (Max 35 elever).",
            error_sub: "Lärarens konto har gått ut.",
            name_prompt: "Vad heter du?",
            back: "Tillbaka",
            plan_h: "Välj din plan",
            plan_sub: "Börja använda Anpassa idag.",
            trial_btn: "Börja 30 dagars gratis period",
            coming_soon: "Kommer snart",
            school_label: "Skola / Organisation",
            school_hint: "Sök på din skola (t.ex. 'Vittra')...",
            forgot_pw: "Glömt lösenord?",
            reset_btn: "Skicka återställningslänk",
            login_link: "Logga in istället",
            signup_link: "Inget konto? Skapa här",
            error_school: "Vänligen ange din skola."
        },
        en: { 
            student_h: studentMode === 'live' ? "Live Room" : "Your Class",
            code_placeholder: "Enter code...", 
            teacher_h: authMode === 'signup' ? "Create Account" : authMode === 'forgot' ? "Reset Password" : "Teacher Login", 
            btn_join: "Join",
            error_code: "Invalid code.",
            error_full: "Room is full (Max 35 students).",
            error_sub: "Teacher subscription expired.",
            name_prompt: "What is your name?",
            back: "Back",
            plan_h: "Choose your plan",
            plan_sub: "Start using Anpassa today.",
            trial_btn: "Start 30-day free trial",
            coming_soon: "Coming soon",
            school_label: "School / Organization",
            school_hint: "Search for your school (e.g. 'Global High')...",
            forgot_pw: "Forgot password?",
            reset_btn: "Send reset link",
            login_link: "Login instead",
            signup_link: "No account? Create here",
            error_school: "Please provide your school."
        }
    }[lang];

    // --- 4. AUTO-HANDSHAKE ENGINE ---
    useEffect(() => {
        if (initialCode && initialCode.length >= 3) {
            executeJoin(initialCode);
        }
    }, []);

    // --- 5. SCHOOL SEARCH LOGIC ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Only search if user hasn't already clicked a suggestion
            if (schoolInput.length < 3 || (selectedSchool && selectedSchool.name === schoolInput)) {
                setSchoolSuggestions([]);
                return;
            }
            const { data } = await supabase
                .from('schools')
                .select('id, name')
                .ilike('name', `%${schoolInput}%`)
                .limit(5);
            setSchoolSuggestions(data || []);
        };
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [schoolInput]);

    // --- 6. AUTH HANDLERS ---
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/profile',
        });
        if (error) setMessage({ type: 'error', text: error.message });
        else setMessage({ type: 'success', text: lang === 'sv' ? "Återställningslänk skickad!" : "Reset link sent!" });
        setLoading(false);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (authMode === 'signup') {
                if (!schoolInput.trim()) throw new Error(t.error_school);

                // SAFEGUARD: Even if they didn't click a suggestion, check if name matches an existing school exactly
                let schoolId = selectedSchool?.id;
                let finalSchoolName = schoolInput.trim();

                const { data: exactMatch } = await supabase
                    .from('schools')
                    .select('id')
                    .eq('name', finalSchoolName)
                    .maybeSingle();

                if (exactMatch) {
                    schoolId = exactMatch.id;
                } else if (!schoolId) {
                    // Create new school entry
                    const { data: newS, error: sErr } = await supabase
                        .from('schools')
                        .insert([{ name: finalSchoolName }])
                        .select()
                        .single();
                    if (sErr) throw sErr;
                    schoolId = newS.id;
                }

                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: { 
                        data: { 
                            full_name: fullName, 
                            school_name: finalSchoolName,
                            school_id: schoolId,
                            role: 'teacher' 
                        } 
                    }
                });
                if (error) throw error;
                if (data.user) { setPendingUser(data.user); setShowPlanPicker(true); }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess({ role: 'teacher', user: data.user });
            }
        } catch (err) { setMessage({ type: 'error', text: err.message }); setLoading(false); }
    };

    // --- NEW: DYNAMIC REDIRECT LOGIC ---
    const handleGoogleLogin = async () => {
        setLoading(true);
        // Detect current environment (Localhost vs Production)
        const redirectTo = window.location.origin.endsWith('/') 
            ? window.location.origin 
            : `${window.location.origin}/`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo
            }
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    const executeJoin = async (targetCode) => {
        const cleanCode = targetCode.trim().toUpperCase();
        setLoading(true);
        setMessage(null);
        try {
            if (studentMode === 'live') {
                const { data: room, error: roomError } = await supabase.from('rooms').select('*').eq('class_code', cleanCode).eq('status', 'active').single();
                if (roomError || !room) throw new Error(t.error_code);
                const { data: participants } = await supabase.from('responses').select('student_alias').eq('room_id', room.id);
                const uniqueCount = new Set(participants?.map(p => p.student_alias)).size;
                if (uniqueCount >= 35) throw new Error(t.error_full);
                let studentName = localStorage.getItem('anpassa_alias') || prompt(t.name_prompt);
                if (studentName) {
                    localStorage.setItem('anpassa_alias', studentName);
                    onSuccess({ role: 'live', room, student_name: studentName });
                } else setLoading(false);
            } else {
                const { data: teacher, error: teacherError } = await supabase.from('teacher_public_info').select('*').eq('class_code', cleanCode).single();
                if (teacherError || !teacher) throw new Error(t.error_code);
                const isTeacherActive = teacher.subscription_status === 'active' || (teacher.subscription_status === 'trial' && new Date(teacher.subscription_end_date) > new Date());
                if (isTeacherActive) onSuccess({ role: 'student', class: { teacher_id: teacher.id, class_name: teacher.full_name } });
                else throw new Error(t.error_sub);
            }
        } catch (err) { setMessage({ type: 'error', text: err.message }); setLoading(false); }
    };

    const handleCodeJoin = (e) => {
        e.preventDefault();
        executeJoin(code);
    };

    const startTrial = async () => {
        setLoading(true);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        try {
            const { error } = await supabase.from('profiles').update({ 
                subscription_status: 'trial',
                subscription_tier: 0,
                subscription_end_date: endDate.toISOString()
            }).eq('id', pendingUser.id);
            if (error) throw error;
            onSuccess({ role: 'teacher', user: pendingUser });
        } catch (err) { setMessage({ type: 'error', text: err.message }); setLoading(false); }
    };

    if (showPlanPicker) {
        return (
            <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-full max-w-4xl text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h2 className="text-4xl font-bold text-slate-900 uppercase italic tracking-tighter mb-2">{t.plan_h}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/60">{t.plan_sub}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-emerald-500 flex flex-col items-center text-center relative overflow-hidden transition-all hover:scale-[1.02]">
                        <div className="bg-emerald-500 text-white px-8 py-1 absolute top-4 -right-8 rotate-45 text-[9px] font-black uppercase tracking-widest shadow-lg">Populär</div>
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Zap size={32} /></div>
                        <h3 className="text-xl font-bold uppercase mb-2">Testperiod</h3>
                        <div className="text-4xl font-black mb-8 text-slate-800">0 kr<span className="text-xs text-slate-400 font-medium"> / 30 dgr</span></div>
                        <button onClick={startTrial} className="mt-auto w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-bold uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto" /> : t.trial_btn}</button>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-emerald-50 flex flex-col items-center text-center opacity-40 grayscale"><div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6"><Star size={32} /></div><h3 className="text-xl font-bold uppercase mb-2 text-slate-700">Pro-Lärare</h3><button disabled className="mt-auto w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{t.coming_soon}</button></div>
                    <div className="bg-white p-10 rounded-[3rem] border border-emerald-50 flex flex-col items-center text-center opacity-40 grayscale"><div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6"><CreditCard size={32} /></div><h3 className="text-xl font-bold uppercase mb-2 text-slate-700">Hela Skolan</h3><button disabled className="mt-auto w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{t.coming_soon}</button></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            <button onClick={onBack} className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-all z-20">
                <ChevronLeft size={18} /> {t.back}
            </button>
            
            <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-12 border border-emerald-50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                {studentMode ? (
                    <div className="space-y-10 text-center">
                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner ${studentMode === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                            {studentMode === 'live' ? <Users size={48} /> : <GraduationCap size={48} />}
                        </div>
                        <h2 className="text-3xl font-bold uppercase tracking-tighter italic text-slate-800 leading-tight">{t.student_h}</h2>
                        <form onSubmit={handleCodeJoin} className="space-y-6">
                            <input type="text" maxLength={12} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={`w-full p-6 rounded-[2rem] text-center text-3xl font-bold uppercase tracking-[0.2em] outline-none transition-all border-4 ${studentMode === 'live' ? 'bg-emerald-50/30 border-emerald-50 focus:border-emerald-500 focus:bg-white' : 'bg-amber-50/30 border-amber-50 focus:border-amber-500 focus:bg-white'}`} placeholder="KOD" required />
                            <button disabled={loading} className={`w-full py-6 text-white rounded-[2rem] font-bold text-xl uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${studentMode === 'live' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/10'}`}>
                                {loading ? <Loader2 className="animate-spin" /> : t.btn_join} <ArrowRight />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="text-center"><h2 className="text-3xl font-bold uppercase italic tracking-tighter text-slate-800">{t.teacher_h}</h2></div>
                        
                        {authMode !== 'forgot' && (
                            <button 
                                onClick={handleGoogleLogin} 
                                className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                Google
                            </button>
                        )}

                        <div className="relative py-2 flex items-center"><div className="flex-grow border-t border-slate-100"></div><span className="px-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Eller</span><div className="flex-grow border-t border-slate-100"></div></div>
                        
                        <form onSubmit={authMode === 'forgot' ? handlePasswordReset : handleEmailAuth} className="space-y-4">
                            {authMode === 'signup' && (
                                <>
                                    <div className="relative">
                                        <User className="absolute left-5 top-5 text-emerald-200" size={18} />
                                        <input type="text" placeholder="Ditt för- och efternamn" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required />
                                    </div>
                                    
                                    <div className="relative">
                                        <Building2 className="absolute left-5 top-5 text-emerald-200" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder={t.school_hint} 
                                            value={schoolInput} 
                                            onChange={(e) => setSchoolInput(e.target.value)} 
                                            className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" 
                                            required 
                                        />
                                        {schoolSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-emerald-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                                {schoolSuggestions.map(s => (
                                                    <button key={s.id} type="button" onClick={() => { setSelectedSchool(s); setSchoolInput(s.name); setSchoolSuggestions([]); }} className="w-full p-4 text-left hover:bg-emerald-50 text-sm font-bold text-slate-600 flex items-center gap-3 border-b last:border-0 border-slate-50">
                                                        <CheckCircle2 size={14} className="text-emerald-500" /> {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-5 top-5 text-emerald-200" size={18} />
                                <input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required />
                            </div>
                            
                            {authMode !== 'forgot' && (
                                <div className="relative">
                                    <Lock className="absolute left-5 top-5 text-emerald-200" size={18} />
                                    <input type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required />
                                </div>
                            )}

                            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                                {loading ? <Loader2 className="animate-spin mx-auto" /> : authMode === 'signup' ? "Skapa konto" : authMode === 'forgot' ? t.reset_btn : "Logga in"}
                            </button>
                        </form>

                        <div className="flex flex-col items-center gap-3 pt-2">
                            {authMode === 'login' && (
                                <button onClick={() => setAuthMode('forgot')} className="text-[10px] font-black text-slate-400 hover:text-emerald-700 uppercase tracking-widest">{t.forgot_pw}</button>
                            )}
                            <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setMessage(null); }} className="text-xs font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-widest transition-colors">
                                {authMode === 'login' ? t.signup_link : t.login_link}
                            </button>
                        </div>
                    </div>
                )}
                {message && <div className={`mt-8 p-5 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-3 border animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}><AlertCircle size={16}/> {message.text}</div>}
            </div>
        </div>
    );
}