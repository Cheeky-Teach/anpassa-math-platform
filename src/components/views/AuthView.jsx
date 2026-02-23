import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Mail, Lock, User, ChevronLeft, Zap, 
    CheckCircle2, Loader2, AlertCircle, Building2, 
    ShieldCheck, Star
} from 'lucide-react';

export default function AuthView({ lang, studentMode, onSuccess, onBack, initialCode }) {
    // --- 1. SHARED STATE ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPlanPicker, setShowPlanPicker] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false); 
    const [pendingUser, setPendingUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); 

    // --- 2. TEACHER ONBOARDING STATE ---
    const [fullName, setFullName] = useState('');
    const [schoolInput, setSchoolInput] = useState('');
    const [schoolSuggestions, setSchoolSuggestions] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [inviteCodeInput, setInviteCodeInput] = useState(''); 
    const [isIndividual, setIsIndividual] = useState(false); 

    // --- 3. STUDENT STATE ---
    const [code, setCode] = useState(initialCode || '');

    // --- 4. MANUAL AUTH STATE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const t = {
        sv: { 
            student_h: studentMode === 'live' ? "Live-rum" : "Ditt Klassrum",
            code_placeholder: "Skriv kod...", 
            teacher_h: authMode === 'signup' ? "Skapa lärarkonto" : authMode === 'forgot' ? "Återställ" : "Logga in", 
            onboarding_h: "Verifiera lärarkonto",
            onboarding_sub: "Ange inbjudningskod och skola för att fortsätta.",
            invite_label: "Lärarkod (Invite Code)",
            school_placeholder: "Sök efter din skola...",
            individual_label: "Jag är en privatlärare (ingen skola)",
            btn_join: "Gå med",
            error_code: "Ogiltig kod.",
            error_invite: "Felaktig lärarkod. Vänligen kontakta support.",
            error_api: "API-anslutningsfel. Kör 'vercel dev' lokalt.",
            error_school: "Vänligen välj en skola eller välj 'Privatlärare'.",
            back: "Tillbaka",
            plan_h: "Välj din plan",
            trial_btn: "Börja 30 dagars testperiod",
            login_link: "Logga in istället",
            signup_link: "Skapa konto här",
            btn_continue: "Fortsätt",
            signup_success: "Konto skapat! Vidare till verifiering..."
        },
        en: { 
            student_h: studentMode === 'live' ? "Live Room" : "Your Class",
            code_placeholder: "Enter code...", 
            teacher_h: authMode === 'signup' ? "Create Account" : authMode === 'forgot' ? "Reset" : "Teacher Login", 
            onboarding_h: "Verify Teacher Account",
            onboarding_sub: "Enter your invite code and school to continue.",
            invite_label: "Teacher Invite Code",
            school_placeholder: "Search for your school...",
            individual_label: "I am an individual teacher (no school)",
            btn_join: "Join",
            error_code: "Invalid code.",
            error_invite: "Invalid teacher code. Please contact support.",
            error_api: "API connection error. Run 'vercel dev' locally.",
            error_school: "Please select a school or choose 'Individual'.",
            back: "Back",
            plan_h: "Choose your plan",
            trial_btn: "Start 30-day free trial",
            login_link: "Login instead",
            signup_link: "Create account here",
            btn_continue: "Continue",
            signup_success: "Account created! Proceeding to verification..."
        }
    }[lang];

    // --- ESCAPE HATCH ---
    const handleAbort = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setLoading(false);
        onBack();
    };

    const generateClassCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let res = "";
        for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res.slice(0,3) + "-" + res.slice(3);
    };

    // --- ENHANCED AUTH LISTENER (FIXED FEEDBACK LOOP) ---
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
                
                if (!profile || !profile.subscription_status || !profile.class_code) {
                    setPendingUser(session.user);
                    
                    // FIX: Only auto-populate name if current state is empty
                    // This prevents the "spamming" bug where typing is overwritten by metadata
                    setFullName(prev => {
                        if (prev !== '') return prev; 
                        return session.user.user_metadata?.full_name || '';
                    });

                    setShowOnboarding(true);
                    setLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Empty dependency array is critical here

    // --- SCHOOL SEARCH ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (isIndividual || schoolInput.length < 3 || (selectedSchool && selectedSchool.name === schoolInput)) {
                setSchoolSuggestions([]);
                return;
            }
            const { data } = await supabase.from('schools').select('id, name').ilike('name', `%${schoolInput}%`).limit(5);
            setSchoolSuggestions(data || []);
        };
        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [schoolInput, isIndividual, selectedSchool]);

    // --- AUTH HANDLERS ---
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
            if (authMode === 'signup') {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { data: { full_name: fullName } }
                });
                
                if (error) throw error;
                if (data.user) {
                    setPendingUser(data.user);
                    setMessage({ type: 'success', text: t.signup_success });
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess({ role: 'teacher', user: data.user });
            }
        } catch (err) { 
            setMessage({ type: 'error', text: err.message }); 
            setLoading(false);
        }
    };

    const handleOnboardingSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const verifyRes = await fetch('/api/verify-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: inviteCodeInput })
            });

            if (!verifyRes.ok) throw new Error(t.error_invite);

            let schoolId = null;
            let schoolName = isIndividual ? "Individual Account" : schoolInput.trim();

            if (!isIndividual) {
                if (!schoolName) throw new Error(t.error_school);
                const { data: exactMatch } = await supabase.from('schools').select('id').eq('name', schoolName).maybeSingle();
                if (exactMatch) schoolId = exactMatch.id;
                else {
                    const { data: newS } = await supabase.from('schools').insert([{ name: schoolName }]).select().single();
                    schoolId = newS?.id;
                }
            }

            const { error: upErr } = await supabase.from('profiles').update({
                full_name: fullName,
                school_name: schoolName,
                school_id: schoolId,
                role: 'teacher'
            }).eq('id', pendingUser.id);

            if (upErr) throw upErr;
            setShowOnboarding(false);
            setShowPlanPicker(true);
        } catch (err) { setMessage({ type: 'error', text: err.message }); }
        finally { setLoading(false); }
    };

    const startTrial = async () => {
        setLoading(true);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        const classCode = generateClassCode();
        try {
            const { error } = await supabase.from('profiles').update({ 
                subscription_status: 'trial',
                subscription_end_date: endDate.toISOString(),
                class_code: classCode 
            }).eq('id', pendingUser.id);
            if (error) throw error;
            onSuccess({ role: 'teacher', user: pendingUser });
        } catch (err) { setMessage({ type: 'error', text: err.message }); }
        finally { setLoading(false); }
    };

    // --- RENDERING ---

    if (showPlanPicker) {
        return (
            <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 font-sans">
                <button onClick={handleAbort} className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-all z-20">
                    <ChevronLeft size={18} /> {t.back}
                </button>
                <h2 className="text-4xl font-bold uppercase italic mb-12 tracking-tighter text-slate-900">{t.plan_h}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-50 flex flex-col items-center">
                        <Zap className="text-emerald-500 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase mb-2">Testperiod</h3>
                        <div className="text-3xl font-black mb-6">0 kr<span className="text-xs text-slate-400 font-medium"> / 30 dgr</span></div>
                        <button onClick={startTrial} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-lg">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : t.trial_btn}
                        </button>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border-4 border-indigo-500/30 flex flex-col items-center relative">
                        <div className="absolute -top-3 bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Mest populär</div>
                        <Star className="text-indigo-400 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase mb-2 text-white">Pro Lärare</h3>
                        <div className="text-3xl font-black mb-6 text-white">--- kr<span className="text-xs text-slate-400 font-medium"> / mån</span></div>
                        <button disabled className="w-full py-4 bg-slate-800 text-slate-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Kommer snart</button>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-50 flex flex-col items-center">
                        <Building2 className="text-slate-400 mb-4" size={32} />
                        <h3 className="text-lg font-bold uppercase mb-2">Skola</h3>
                        <div className="text-xl font-black mb-6 uppercase italic text-slate-400">Offert</div>
                        <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Kontakta oss</button>
                    </div>
                </div>
            </div>
        );
    }

    if (showOnboarding) {
        return (
            <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 font-sans">
                <button onClick={handleAbort} className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-all z-20">
                    <ChevronLeft size={18} /> {t.back}
                </button>
                <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-12 border border-emerald-50 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-10 leading-none">
                        <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-slate-800">{t.onboarding_h}</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest leading-relaxed">{t.onboarding_sub}</p>
                    </div>
                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-5 top-5 text-emerald-200" size={18} />
                            <input type="text" placeholder="Ditt namn" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required />
                        </div>
                        <div className="relative">
                            <ShieldCheck className="absolute left-5 top-5 text-amber-300" size={18} />
                            <input type="text" placeholder={t.invite_label} value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())} className="w-full pl-14 pr-6 py-5 bg-amber-50/20 rounded-2xl border-2 border-amber-100 outline-none focus:ring-2 focus:ring-amber-400 font-black text-slate-800 tracking-widest text-center" required />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isIndividual ? 'text-indigo-900' : 'text-slate-400'}`}>{t.individual_label}</span>
                            <button type="button" onClick={() => setIsIndividual(!isIndividual)} className={`w-12 h-6 rounded-full transition-all relative p-1 ${isIndividual ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isIndividual ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {!isIndividual && (
                            <div className="relative animate-in slide-in-from-top-2 duration-300">
                                <Building2 className="absolute left-5 top-5 text-emerald-200" size={18} />
                                <input type="text" placeholder={t.school_placeholder} value={schoolInput} onChange={(e) => setSchoolInput(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required />
                                {schoolSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-emerald-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                        {schoolSuggestions.map(s => (
                                            <button key={s.id} type="button" onClick={() => { setSelectedSchool(s); setSchoolInput(s.name); setSchoolSuggestions([]); }} className="w-full p-4 text-left hover:bg-emerald-50 text-sm font-bold text-slate-600 flex items-center gap-3 border-b border-slate-50 last:border-0"><CheckCircle2 size={14} className="text-emerald-500" /> {s.name}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto" /> : t.btn_continue}</button>
                    </form>
                    {message && (
                        <div className={`mt-8 p-5 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                            message.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            <AlertCircle size={16}/> {message.text}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fbf7] flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
            <button onClick={onBack} className="absolute top-10 left-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-all z-20">
                <ChevronLeft size={18} /> {t.back}
            </button>
            <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-12 border border-emerald-50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-slate-800 leading-none">{studentMode ? t.student_h : t.teacher_h}</h2>
                </div>
                <div className="space-y-8">
                    <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google
                    </button>
                    <div className="relative py-2 flex items-center"><div className="flex-grow border-t border-slate-100"></div><span className="px-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Eller</span><div className="flex-grow border-t border-slate-100"></div></div>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative"><Mail className="absolute left-5 top-5 text-emerald-200" size={18} /><input type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required /></div>
                        <div className="relative"><Lock className="absolute left-5 top-5 text-emerald-200" size={18} /><input type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-[#f9fbf7] rounded-2xl border-2 border-emerald-50 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" required /></div>
                        <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto" /> : authMode === 'signup' ? "Skapa konto" : "Logga in"}</button>
                    </form>
                    
                    {message && (
                        <div className={`mt-4 p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-3 border animate-in fade-in slide-in-from-top-2 ${
                            message.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            <AlertCircle size={16}/> {message.text}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-3 pt-2">
                        <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setMessage(null); }} className="text-xs font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-widest transition-colors">{authMode === 'login' ? t.signup_link : t.login_link}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}