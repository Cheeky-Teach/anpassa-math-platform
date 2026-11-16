// src/components/views/AuthView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    Mail, Lock, User, ChevronLeft, Zap, 
    CheckCircle2, Loader2, AlertCircle, Building2, 
    ShieldCheck, Star
} from 'lucide-react';

const getOrAssignStudentId = () => {
    let guestId = localStorage.getItem('guest_student_id');
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem('guest_student_id', guestId);
    }
    return guestId;
};

const SubtleGridBackdrop = () => (
    <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.45]" 
        aria-hidden="true"
        style={{
            backgroundImage: `
                linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 35%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 35%, transparent 100%)'
        }}
    />
);

export default function AuthView({ lang, studentMode, onSuccess, onBack, initialCode }) {
    // --- 1. SHARED STATE ---
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPlanPicker, setShowPlanPicker] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false); 
    const [pendingUser, setPendingUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); 
    const [showExpired, setShowExpired] = useState(false);

    // --- 2. TEACHER ONBOARDING STATE ---
    const [fullName, setFullName] = useState('');
    const [schoolInput, setSchoolInput] = useState('');
    const [schoolSuggestions, setSchoolSuggestions] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [inviteCodeInput, setInviteCodeInput] = useState(''); 
    const [isIndividual, setIsIndividual] = useState(false); 

    // --- 3. STUDENT STATE ---
    const [code, setCode] = useState(initialCode || '');
    const nameInputRef = useRef(null);

    // --- 4. MANUAL AUTH STATE ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const t = {
        sv: { 
            student_h: studentMode === 'live' ? "Live-rum" : "Ditt Klassrum",
            student_sub: studentMode === 'live' ? "Anslut till lärarens pågående lektion" : "Öppna din klass arbetsyta och moduler",
            code_placeholder: "Skriv kod...", 
            teacher_h: authMode === 'signup' ? "Skapa lärarkonto" : authMode === 'forgot' ? "Återställ lösenord" : "Logga in", 
            teacher_sub: authMode === 'signup' ? "Registrera med din inbjudningskod" : authMode === 'forgot' ? "Vi skickar en återställningslänk via e-post" : "Logga in till din lärarstudio",
            onboarding_h: "Verifiera lärarkonto",
            onboarding_sub: "Ange inbjudningskod och skola för att fortsätta.",
            invite_label: "Lärarkod (Invite Code)",
            school_placeholder: "Sök efter din skola...",
            individual_label: "Jag är en privatlärare (ingen skola)",
            btn_join: "Gå med",
            error_code: "Ogiltig kod eller avslutat rum.",
            error_invite: "Felaktig lärarkod. Vänligen kontakta support.",
            error_api: "API-anslutningsfel. Kör 'vercel dev' lokalt.",
            error_school: "Vänligen välj en skola eller välj 'Privatlärare'.",
            back: "Tillbaka",
            plan_h: "Välj din plan",
            plan_sub: "Kom igång direkt med 30 dagars kostnadsfri testperiod.",
            trial_btn: "Börja 30 dagars testperiod",
            login_link: "Logga in istället",
            signup_link: "Skapa konto här",
            btn_continue: "Fortsätt",
            signup_success: "Konto skapat! Vidare till verifiering...",
            name_label: "Ditt namn",
            name_placeholder: "Skriv ditt namn...",
            btn_reset: "Skicka återställningslänk",
            forgot_link: "Glömt lösenord?"
        },
        en: { 
            student_h: studentMode === 'live' ? "Live Room" : "Your Class",
            student_sub: studentMode === 'live' ? "Join your teacher's active session" : "Open your class workspace and units",
            code_placeholder: "Enter code...", 
            teacher_h: authMode === 'signup' ? "Create Account" : authMode === 'forgot' ? "Reset Password" : "Teacher Login", 
            teacher_sub: authMode === 'signup' ? "Register using your teacher invite code" : authMode === 'forgot' ? "We will email you a password reset link" : "Sign in to your teacher studio",
            onboarding_h: "Verify Teacher Account",
            onboarding_sub: "Enter your invite code and school to continue.",
            invite_label: "Teacher Invite Code",
            school_placeholder: "Search for your school...",
            individual_label: "I am an individual teacher (no school)",
            btn_join: "Join",
            error_code: "Invalid code or closed room.",
            error_invite: "Invalid teacher code. Please contact support.",
            error_api: "API connection error. Run 'vercel dev' locally.",
            error_school: "Please select a school or choose 'Individual'.",
            back: "Back",
            plan_h: "Choose your plan",
            plan_sub: "Get started immediately with a 30-day free trial.",
            trial_btn: "Start 30-day free trial",
            login_link: "Login instead",
            signup_link: "Create account here",
            btn_continue: "Continue",
            signup_success: "Account created! Proceeding to verification...",
            name_label: "Your Name",
            name_placeholder: "Type your name...",
            btn_reset: "Send reset link",
            forgot_link: "Forgot password?"
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

    // --- AUTH LISTENER ---
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user && event === 'SIGNED_IN') {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
                
                // 1. Missing Onboarding
                if (!profile || !profile.subscription_status || !profile.class_code) {
                    setPendingUser(session.user);
                    setFullName(prev => (prev !== '' ? prev : session.user.user_metadata?.full_name || ''));
                    setShowOnboarding(true);
                    setLoading(false);
                    return;
                }

                // 2. Expiration Gatekeeper
                const isExpired = profile.subscription_status === 'expired' || 
                                 (profile.subscription_end_date && new Date(profile.subscription_end_date) < new Date());
                
                if (isExpired) {
                    setShowExpired(true);
                    setLoading(false);
                    return;
                }
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const executeStudentJoin = async (targetCode) => {
        setLoading(true);
        setMessage(null);

        try {
            const cleanInput = (targetCode || '').trim().toUpperCase();
            if (!cleanInput) {
                throw new Error(t.code_placeholder);
            }

            const rawNoHyphens = cleanInput.replace(/[^A-Z0-9]/g, '');
            const potentialMatches = new Set([cleanInput, rawNoHyphens]);

            if (rawNoHyphens.length === 6) {
                potentialMatches.add(`${rawNoHyphens.slice(0, 3)}-${rawNoHyphens.slice(3)}`);
            }
            if (rawNoHyphens.length === 7) {
                potentialMatches.add(`${rawNoHyphens.slice(0, 3)}-${rawNoHyphens.slice(3)}`);
                potentialMatches.add(`${rawNoHyphens.slice(0, 4)}-${rawNoHyphens.slice(4)}`);
            }

            const searchCodes = Array.from(potentialMatches);
            const studentId = getOrAssignStudentId();

            // 1. LIVE MODE (Active classroom room)
            if (studentMode === 'live') {
                if (!fullName.trim()) {
                    throw new Error(t.name_placeholder);
                }

                const { data: room, error: roomError } = await supabase
                    .from('rooms')
                    .select('*')
                    .in('class_code', searchCodes)
                    .eq('status', 'active')
                    .maybeSingle();

                if (roomError || !room) {
                    throw new Error(t.error_code);
                }

                onSuccess({ role: 'live', room, student_name: fullName.trim(), student_id: studentId });

            // 2. PRACTICE MODE (Self Practice / Student Gateway)
            } else {
                let teacher = null;

                try {
                    const { data: rpcTeachers, error: rpcErr } = await supabase
                        .rpc('get_active_class', { search_codes: searchCodes });

                    if (!rpcErr && rpcTeachers && rpcTeachers.length > 0) {
                        teacher = rpcTeachers[0];
                    }
                } catch (e) {
                    console.warn("RPC attempt failed:", e);
                }

                if (!teacher) {
                    try {
                        const { data: directProfiles, error: directErr } = await supabase
                            .from('profiles')
                            .select('id, full_name, class_code, school_name, subscription_status')
                            .or(`class_code.in.(${searchCodes.map(c => `"${c}"`).join(',')})`)
                            .maybeSingle();

                        if (!directErr && directProfiles) {
                            teacher = directProfiles;
                        }
                    } catch (e) {
                        console.warn("Direct lookup failed:", e);
                    }
                }

                if (!teacher) {
                    throw new Error(t.error_code);
                }

                try {
                    const { data: gatekeeperResult, error: gatekeeperError } = await supabase.rpc('attempt_student_login', {
                        p_teacher_code: teacher.class_code,
                        p_student_id: studentId
                    });

                    if (!gatekeeperError && gatekeeperResult && gatekeeperResult.success === false) {
                        throw new Error(gatekeeperResult.message || t.error_code);
                    }
                } catch (gateErr) {
                    if (gateErr.message && gateErr.message !== t.error_code) {
                        throw gateErr;
                    }
                }

                onSuccess({ role: 'student', class: teacher, student_id: studentId });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentMode === 'practice' && initialCode) {
            executeStudentJoin(initialCode);
        } else if (studentMode === 'live' && initialCode) {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
        }
    }, [initialCode, studentMode]);

    const handleStudentJoin = async (e) => {
        e.preventDefault();
        await executeStudentJoin(code);
    };

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
        setMessage(null);
        try {
            if (authMode === 'signup') {
                if (!inviteCodeInput.trim()) {
                    throw new Error(lang === 'sv' ? "Vänligen ange en lärarkod först." : "Please enter a teacher invite code first.");
                }

                const verifyRes = await fetch('/api/verify-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inviteCode: inviteCodeInput })
                });

                if (!verifyRes.ok) throw new Error(t.error_invite);
            }

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (authMode === 'signup') {
                const verifyRes = await fetch('/api/verify-invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ inviteCode: inviteCodeInput })
                });

                if (!verifyRes.ok) throw new Error(t.error_invite);

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
                
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
                
                const isExpired = profile?.subscription_status === 'expired' || 
                                 (profile?.subscription_end_date && new Date(profile?.subscription_end_date) < new Date());
                                 
                if (isExpired) {
                    setShowExpired(true);
                    setLoading(false);
                    return;
                }

                onSuccess({ role: 'teacher', user: data.user });
            }
        } catch (err) { 
            setMessage({ type: 'error', text: err.message }); 
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/profile`, 
            });
            if (error) throw error;
            setMessage({ 
                type: 'success', 
                text: lang === 'sv' ? "Återställningslänk skickad till din e-post!" : "Reset link sent to your email!" 
            });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
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
        const classCodeStr = generateClassCode();
        try {
            const { error } = await supabase.from('profiles').update({ 
                subscription_status: 'trial',
                subscription_end_date: endDate.toISOString(),
                class_code: classCodeStr 
            }).eq('id', pendingUser.id);
            if (error) throw error;
            onSuccess({ role: 'teacher', user: pendingUser });
        } catch (err) { setMessage({ type: 'error', text: err.message }); }
        finally { setLoading(false); }
    };

    // --- VIEW 1: SUBSCRIPTION EXPIRED ---
    if (showExpired) {
        return (
            <div className="min-h-screen bg-[var(--bg-canvas,#f9fbf7)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
                <SubtleGridBackdrop />
                <div className="w-full max-w-md bg-[var(--bg-card,#ffffff)] rounded-2xl shadow-lg p-8 sm:p-10 border border-[var(--border-strong,#cbd5e1)] text-center relative z-10 animate-in fade-in duration-200">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-center mx-auto mb-5">
                        <Lock size={22} />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] mb-2">
                        {lang === 'sv' ? "Prenumeration utgången" : "Subscription Expired"}
                    </h2>
                    <p className="text-sm font-normal text-[var(--text-muted)] mb-7 leading-relaxed">
                        {lang === 'sv' 
                            ? "Din tillgång till plattformen har löpt ut. Kontakta support för att förnya din licens och återfå åtkomst till Anpassa." 
                            : "Your access to the platform has expired. Please contact support to renew your license and regain access to Anpassa."}
                    </p>
                    <a 
                        href="mailto:anpassa@proton.me" 
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mb-4 shadow-2xs"
                    >
                        <Mail size={16} /> 
                        <span>{lang === 'sv' ? "Kontakta Support" : "Contact Support"}</span>
                    </a>
                    <button 
                        type="button"
                        onClick={handleAbort} 
                        className="text-xs font-bold text-[var(--text-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Logga ut och gå tillbaka" : "Sign out & go back"}
                    </button>
                </div>
            </div>
        );
    }
    
    // --- VIEW 2: PLAN PICKER ---
    if (showPlanPicker) {
        return (
            <div className="min-h-screen bg-[var(--bg-canvas,#f9fbf7)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
                <SubtleGridBackdrop />
                <button 
                    type="button"
                    onClick={handleAbort} 
                    className="fixed top-6 left-6 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card,#ffffff)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors z-20 cursor-pointer shadow-2xs"
                >
                    <ChevronLeft size={16} /> 
                    <span>{t.back}</span>
                </button>

                <div className="text-center mb-10 relative z-10 max-w-lg">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block mb-1.5">
                        Anpassa Studio
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">{t.plan_h}</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-2">{t.plan_sub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full relative z-10">
                    {/* Plan 1: Trial (Primary Active) */}
                    <div className="bg-[var(--bg-card,#ffffff)] p-7 rounded-2xl shadow-md border-2 border-emerald-600 flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-base font-extrabold tracking-tight text-[var(--text-main)] mb-1">Testperiod</h3>
                            <div className="text-3xl font-black font-mono tabular-nums text-[var(--text-main)] mb-6">
                                0 kr<span className="text-xs text-[var(--text-muted)] font-sans font-medium"> / 30 dgr</span>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={startTrial} 
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.trial_btn}
                        </button>
                    </div>

                    {/* Plan 2: Pro Teacher */}
                    <div className="bg-[var(--bg-card,#ffffff)] p-7 rounded-2xl shadow-2xs border border-[var(--border-strong)] flex flex-col justify-between relative">
                        <div className="absolute top-4 right-4 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                            Pro
                        </div>
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center mb-4">
                                <Star size={20} />
                            </div>
                            <h3 className="text-base font-extrabold tracking-tight text-[var(--text-main)] mb-1">Pro Lärare</h3>
                            <div className="text-3xl font-black font-mono tabular-nums text-[var(--text-main)] mb-6">
                                -- kr<span className="text-xs text-[var(--text-muted)] font-sans font-medium"> / mån</span>
                            </div>
                        </div>
                        <button 
                            type="button"
                            disabled 
                            className="w-full py-3 bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] rounded-xl font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                        >
                            {lang === 'sv' ? "Kommer snart" : "Coming soon"}
                        </button>
                    </div>

                    {/* Plan 3: School */}
                    <div className="bg-[var(--bg-card,#ffffff)] p-7 rounded-2xl shadow-2xs border border-[var(--border-strong)] flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-4">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-base font-extrabold tracking-tight text-[var(--text-main)] mb-1">Skola</h3>
                            <div className="text-2xl font-extrabold text-[var(--text-muted)] mb-6">
                                Offert
                            </div>
                        </div>
                        <button 
                            type="button"
                            disabled 
                            className="w-full py-3 bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] rounded-xl font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                        >
                            {lang === 'sv' ? "Kontakta oss" : "Contact us"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 3: TEACHER ONBOARDING ---
    if (showOnboarding) {
        return (
            <div className="min-h-screen bg-[var(--bg-canvas,#f9fbf7)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
                <SubtleGridBackdrop />
                <button 
                    type="button"
                    onClick={handleAbort} 
                    className="fixed top-6 left-6 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card,#ffffff)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors z-20 cursor-pointer shadow-2xs"
                >
                    <ChevronLeft size={16} /> 
                    <span>{t.back}</span>
                </button>

                <div className="w-full max-w-md bg-[var(--bg-card,#ffffff)] rounded-2xl shadow-lg p-8 sm:p-9 border border-[var(--border-strong,#cbd5e1)] relative z-10 animate-in fade-in duration-200">
                    <div className="mb-7 pb-4 border-b border-[var(--border-main)]">
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                            Anpassa
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">{t.onboarding_h}</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{t.onboarding_sub}</p>
                    </div>

                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                            <input 
                                type="text" 
                                placeholder={t.name_label} 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                required 
                            />
                        </div>

                        <div className="relative">
                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" size={16} />
                            <input 
                                type="text" 
                                placeholder={t.invite_label} 
                                value={inviteCodeInput} 
                                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())} 
                                className="w-full pl-10 pr-4 py-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-300 dark:border-amber-800 outline-none focus:border-amber-500 font-mono font-bold text-sm text-[var(--text-main)] tracking-widest text-center uppercase" 
                                required 
                            />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)]">
                            <span className={`text-xs font-bold ${isIndividual ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                                {t.individual_label}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setIsIndividual(!isIndividual)} 
                                className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${isIndividual ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-2xs ${isIndividual ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {!isIndividual && (
                            <div className="relative animate-in fade-in duration-150">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input 
                                    type="text" 
                                    placeholder={t.school_placeholder} 
                                    value={schoolInput} 
                                    onChange={(e) => setSchoolInput(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                    required 
                                />
                                {schoolSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-xl z-50 overflow-hidden">
                                        {schoolSuggestions.map(s => (
                                            <button 
                                                key={s.id} 
                                                type="button" 
                                                onClick={() => { setSelectedSchool(s); setSchoolInput(s.name); setSchoolSuggestions([]); }} 
                                                className="w-full px-4 py-3 text-left hover:bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-main)] flex items-center gap-2.5 border-b border-[var(--border-main)] last:border-0 cursor-pointer"
                                            >
                                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> 
                                                <span>{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading} 
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.btn_continue}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-5 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
                            message.type === 'error' 
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}>
                            <AlertCircle size={15} className="shrink-0" /> 
                            <span>{message.text}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW 4: MAIN STUDENT JOIN / TEACHER LOGIN ---
    return (
        <div className="min-h-screen bg-[var(--bg-canvas,#f9fbf7)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans overflow-x-clip">
            <SubtleGridBackdrop />
            
            <button 
                type="button"
                onClick={onBack} 
                className="fixed top-6 left-6 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card,#ffffff)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors z-20 cursor-pointer shadow-2xs"
            >
                <ChevronLeft size={16} /> 
                <span>{t.back}</span>
            </button>

            <div className="w-full max-w-md bg-[var(--bg-card,#ffffff)] rounded-2xl shadow-lg p-7 sm:p-9 border border-[var(--border-strong,#cbd5e1)] relative z-10 animate-in fade-in duration-200">
                
                {/* Card Masthead */}
                <div className="mb-7 pb-4 border-b border-[var(--border-main)] flex items-baseline justify-between gap-2">
                    <div>
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                            Anpassa
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] leading-tight">
                            {studentMode ? t.student_h : t.teacher_h}
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            {studentMode ? t.student_sub : t.teacher_sub}
                        </p>
                    </div>
                </div>

                {studentMode ? (
                    <form onSubmit={handleStudentJoin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-muted)] block">
                                {lang === 'sv' ? "Klass- eller rumskod" : "Class or room code"}
                            </label>
                            <input 
                                type="text" 
                                maxLength={12} 
                                value={code} 
                                onChange={(e) => setCode(e.target.value.toUpperCase())} 
                                className={`w-full py-4 px-4 rounded-xl text-center text-2xl font-mono font-bold uppercase tracking-[0.2em] outline-none transition-all border bg-[var(--bg-surface)] text-[var(--text-main)] ${
                                    studentMode === 'live' 
                                        ? 'border-[var(--border-strong)] focus:border-emerald-600 focus:bg-[var(--bg-card)]' 
                                        : 'border-amber-300 dark:border-amber-800 focus:border-amber-500 focus:bg-[var(--bg-card)]'
                                }`}
                                placeholder="KOD" 
                                required 
                            />
                        </div>

                        {studentMode === 'live' && (
                            <div className="space-y-1.5 animate-in fade-in duration-150">
                                <label className="text-xs font-bold text-[var(--text-muted)] block">
                                    {t.name_label}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                    <input 
                                        ref={nameInputRef}
                                        type="text" 
                                        placeholder={t.name_placeholder} 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading} 
                            className={`w-full py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs active:scale-[0.98] transition-all cursor-pointer mt-2 ${
                                studentMode === 'live' 
                                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                                    : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : t.btn_join}
                        </button>
                        
                        {message && (
                            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" /> 
                                <span>{message.text}</span>
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-5">
                        {/* Invite Code sits at the top for Signups */}
                        {authMode === 'signup' && (
                            <div className="space-y-1.5 animate-in fade-in duration-150">
                                <label className="text-xs font-bold text-[var(--text-muted)] block">
                                    {t.invite_label}
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="XXXX-XXXX" 
                                        value={inviteCodeInput} 
                                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())} 
                                        className="w-full pl-10 pr-4 py-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-300 dark:border-amber-800 outline-none focus:border-amber-500 font-mono font-bold text-sm text-[var(--text-main)] tracking-widest text-center uppercase transition-colors" 
                                    />
                                </div>
                            </div>
                        )}

                        {authMode !== 'forgot' && (
                            <>
                                <button 
                                    type="button"
                                    onClick={handleGoogleLogin} 
                                    disabled={loading}
                                    className="w-full py-3 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl flex items-center justify-center gap-3 font-bold text-xs text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors shadow-2xs active:scale-[0.98] cursor-pointer"
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> 
                                    <span>{lang === 'sv' ? "Fortsätt med Google" : "Continue with Google"}</span>
                                </button>
                                
                                <div className="relative flex items-center">
                                    <div className="flex-grow border-t border-[var(--border-main)]"></div>
                                    <span className="px-3 text-[11px] font-bold text-[var(--text-muted)]">
                                        {lang === 'sv' ? "eller med e-post" : "or with email"}
                                    </span>
                                    <div className="flex-grow border-t border-[var(--border-main)]"></div>
                                </div>
                            </>
                        )}

                        <form onSubmit={authMode === 'forgot' ? handleForgotPassword : handleEmailAuth} className="space-y-3.5">
                            {authMode === 'signup' && (
                                <div className="relative animate-in fade-in duration-150">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder={t.name_label} 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                        required 
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input 
                                    type="email" 
                                    placeholder={lang === 'sv' ? "E-postadress" : "Email address"} 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                    required 
                                />
                            </div>

                            {authMode !== 'forgot' && (
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                        <input 
                                            type="password" 
                                            placeholder={lang === 'sv' ? "Lösenord" : "Password"} 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] outline-none focus:border-emerald-600 focus:bg-[var(--bg-card)] text-sm font-semibold text-[var(--text-main)] transition-colors" 
                                            required 
                                        />
                                    </div>
                                    {authMode === 'login' && (
                                        <div className="flex justify-end">
                                            <button 
                                                type="button"
                                                onClick={() => { setAuthMode('forgot'); setMessage(null); }}
                                                className="text-xs font-bold text-[var(--text-muted)] hover:text-emerald-700 transition-colors cursor-pointer"
                                            >
                                                {t.forgot_link}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading} 
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 
                                 authMode === 'signup' ? (lang === 'sv' ? "Skapa konto med E-post" : "Sign up with Email") : 
                                 authMode === 'forgot' ? t.btn_reset : (lang === 'sv' ? "Logga in" : "Sign in")}
                            </button>
                        </form>
                        
                        {message && (
                            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
                                message.type === 'error' 
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}>
                                <AlertCircle size={15} className="shrink-0" /> 
                                <span>{message.text}</span>
                            </div>
                        )}

                        <div className="pt-3 border-t border-[var(--border-main)] flex justify-center">
                            <button 
                                type="button"
                                onClick={() => { 
                                    if (authMode === 'forgot') setAuthMode('login');
                                    else setAuthMode(authMode === 'login' ? 'signup' : 'login'); 
                                    setMessage(null); 
                                }} 
                                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
                            >
                                {authMode === 'forgot' ? t.login_link : (authMode === 'login' ? t.signup_link : t.login_link)}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}