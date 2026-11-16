// src/components/views/ProfileView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DeveloperPortal from './DeveloperPortal';
import PreferencesToggle from '../ui/PreferencesToggle';
import '../../styles/theme.css';
import { 
    User, Shield, CreditCard, CheckCircle2, XCircle, 
    Loader2, Save, ChevronLeft, Zap, Building2,
    Lock, KeyRound, Eye, EyeOff, Terminal, Activity,
    Languages, MonitorPlay, Bug, Globe
} from 'lucide-react';

// =========================================================================
// MAIN PROFILE VIEW
// =========================================================================
export default function ProfileView({ profile, onBack, lang = 'sv', onLanguageChange }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [codeStatus, setCodeStatus] = useState('idle');
    const [originalCode] = useState(profile?.class_code || '');
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        class_code: profile?.class_code || '',
        school_name: profile?.school_name || '',
        new_password: '',
        confirm_password: ''
    });

    const [subscriptionEndDate, setSubscriptionEndDate] = useState(profile?.subscription_end_date || null);
    const [isLoadingSub, setIsLoadingSub] = useState(false);

    useEffect(() => {
        const checkProvider = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const isGoogle = user?.app_metadata?.provider === 'google' || user?.identities?.some(id => id.provider === 'google');
            setIsGoogleUser(isGoogle);
        };
        checkProvider();
    }, []);

    useEffect(() => {
        if (profile?.subscription_end_date) {
            setSubscriptionEndDate(profile.subscription_end_date);
            return;
        }
        const fetchSubscription = async () => {
            setIsLoadingSub(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data, error } = await supabase.from('profiles').select('subscription_end_date').eq('id', user.id).single();
                if (!error && data) setSubscriptionEndDate(data.subscription_end_date);
            } catch (err) { console.error(err); } finally { setIsLoadingSub(false); }
        };
        fetchSubscription();
    }, [profile]);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                full_name: profile.full_name || prev.full_name,
                school_name: profile.school_name || prev.school_name,
                class_code: profile.class_code || prev.class_code
            }));
        }
    }, [profile]);

    useEffect(() => {
        const checkCode = async () => {
            const code = formData.class_code.toUpperCase().trim();
            if (code.length < 3 || code.length > 12 || !/^[A-Z0-9-]+$/.test(code)) {
                setCodeStatus('invalid'); return;
            }
            if (code === originalCode) { setCodeStatus('available'); return; }
            setCodeStatus('checking');
            const { data, error } = await supabase.rpc('check_code_available', { requested_code: code });
            if (!error) setCodeStatus(data ? 'available' : 'taken');
        };
        const timer = setTimeout(checkCode, 500);
        return () => clearTimeout(timer);
    }, [formData.class_code, originalCode]);

    const getSubscriptionStatus = (dateString) => {
        if (!dateString) return null;
        const endDate = new Date(dateString);
        const isActive = endDate > new Date();
        const formattedDate = endDate.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return { formattedDate, isActive };
    };

    const handleSave = async () => {
        if (!profile?.id) return;
        if (codeStatus !== 'available' && formData.class_code !== originalCode) return;
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            alert(lang === 'sv' ? "Lösenorden matchar inte." : "Passwords do not match."); return;
        }

        setIsSaving(true);
        try {
            let resolvedSchoolId = profile.school_id;
            let finalSchoolName = formData.school_name.trim();

            if (!resolvedSchoolId && finalSchoolName) {
                const { data: existingSchool } = await supabase.from('schools').select('id').eq('name', finalSchoolName).maybeSingle();
                if (existingSchool) resolvedSchoolId = existingSchool.id;
                else {
                    const { data: newS, error: sErr } = await supabase.from('schools').insert([{ name: finalSchoolName }]).select().single();
                    if (sErr) throw sErr;
                    resolvedSchoolId = newS.id;
                }
            }

            const { error: profileError } = await supabase.from('profiles').update({
                full_name: formData.full_name.trim(),
                class_code: formData.class_code.toUpperCase().trim(),
                school_name: finalSchoolName,
                school_id: resolvedSchoolId, 
                updated_at: new Date().toISOString()
            }).eq('id', profile.id);

            if (profileError) throw profileError;

            if (formData.new_password) {
                const { error: authError } = await supabase.auth.updateUser({ password: formData.new_password });
                if (authError) throw authError;
            }

            alert(lang === 'sv' ? "Ändringar sparade!" : "Changes saved!");
            setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
        } catch (err) { alert("Error: " + err.message); } finally { setIsSaving(false); }
    };

    const navItems = [
        { id: 'profile', icon: <User size={16} />, label: lang === 'sv' ? 'Profil & Inställningar' : 'Profile & Settings' },
        ...(!isGoogleUser ? [{ id: 'security', icon: <Shield size={16} />, label: lang === 'sv' ? 'Säkerhet' : 'Security' }] : []),
        ...(profile?.role === 'super_admin' ? [{ id: 'developer', icon: <Terminal size={16} />, label: 'Developer Portal', isDev: true }] : [])
    ];

    return (
        <div className="layout-wrapper flex flex-col min-h-screen font-sans bg-[var(--bg-canvas,#f9fbf7)] text-[var(--text-main)] select-none">
            
            {/* COMPACT STICKY HEADER */}
            <header className="sticky top-0 z-50 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-strong)] px-6 py-3 flex justify-between items-center shadow-2xs">
                <button 
                    type="button"
                    onClick={onBack} 
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16}/> <span>{lang === 'sv' ? 'Tillbaka' : 'Back'}</span>
                </button>
                
                <h1 className="text-xs font-extrabold uppercase tracking-tight text-[var(--text-main)] hidden lg:block">
                    {lang === 'sv' ? 'Kontoinställningar' : 'Account Settings'}
                </h1>
                
                {/* ACTIONS: PREFERENCES TOGGLE, LANGUAGE SWITCHER & SAVE */}
                <div className="flex items-center gap-3">
                    <PreferencesToggle />

                    {onLanguageChange && (
                        <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-0.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => onLanguageChange('sv')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    lang === 'sv'
                                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                                title="Svenska"
                            >
                                SV
                            </button>
                            <button
                                type="button"
                                onClick={() => onLanguageChange('en')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    lang === 'en'
                                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                                title="English"
                            >
                                EN
                            </button>
                        </div>
                    )}

                    <button 
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || (codeStatus !== 'available' && formData.class_code !== originalCode) || activeTab === 'developer'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>}
                        <span className="hidden sm:inline-block">{lang === 'sv' ? 'Spara Ändringar' : 'Save Changes'}</span>
                    </button>
                </div>
            </header>

            {/* SIDEBAR LAYOUT */}
            <main className={`flex-1 w-full ${activeTab === 'developer' ? 'px-4 sm:px-6' : 'max-w-6xl mx-auto px-4 sm:px-8'} flex flex-col md:flex-row gap-6 py-8 relative z-10`}>
                
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    {navItems.map(item => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer border ${
                                activeTab === item.id 
                                    ? (item.isDev ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-2xs' : 'bg-[var(--text-main)] text-[var(--bg-canvas)] border-[var(--text-main)] shadow-2xs') 
                                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-strong)]'
                            }`}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                </aside>

                <div className="flex-1 min-w-0">
                    
                    {/* TAB 1: PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subscription Box */}
                                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-strong)] p-6 shadow-2xs">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
                                            <CreditCard size={18} />
                                        </div>
                                        <h2 className="font-extrabold uppercase text-xs tracking-wider text-[var(--text-main)]">
                                            {lang === 'sv' ? 'Prenumeration' : 'Subscription'}
                                        </h2>
                                    </div>
                                    {isLoadingSub ? (
                                        <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400 mx-auto my-4" size={24} />
                                    ) : (() => {
                                        const status = getSubscriptionStatus(subscriptionEndDate);
                                        if (!status) return <p className="text-xs font-bold text-[var(--text-muted)]">{lang === 'sv' ? 'Ingen aktiv prenumeration hittades.' : 'No active subscription found.'}</p>;
                                        return (
                                            <div>
                                                <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5 border ${status.isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'}`}>
                                                    {status.isActive ? (lang === 'sv' ? 'Aktiv' : 'Active') : (lang === 'sv' ? 'Utgången' : 'Expired')}
                                                </div>
                                                <p className="text-xs font-bold text-[var(--text-main)] font-mono">
                                                    {status.isActive ? (lang === 'sv' ? `Gäller t.o.m. ${status.formattedDate}` : `Valid until ${status.formattedDate}`) : (lang === 'sv' ? `Gick ut ${status.formattedDate}` : `Expired on ${status.formattedDate}`)}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Class Code Box */}
                                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-strong)] p-6 shadow-2xs">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
                                            <Zap size={18} />
                                        </div>
                                        <h2 className="font-extrabold uppercase text-xs tracking-wider text-[var(--text-main)]">
                                            {lang === 'sv' ? 'Inloggningskod' : 'Class Code'}
                                        </h2>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" maxLength={12}
                                            className={`w-full bg-[var(--bg-surface)] border rounded-xl px-4 py-3 font-mono font-bold text-lg tracking-[0.2em] uppercase outline-none transition-all shadow-inner ${
                                                codeStatus === 'available' ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' :
                                                codeStatus === 'taken' ? 'border-rose-500 text-rose-700 dark:text-rose-300' :
                                                'border-[var(--border-strong)] focus:border-emerald-600 text-[var(--text-main)]'
                                            }`}
                                            value={formData.class_code}
                                            onChange={(e) => setFormData({...formData, class_code: e.target.value})}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {codeStatus === 'checking' && <Loader2 className="animate-spin text-[var(--text-muted)]" size={18}/>}
                                            {codeStatus === 'available' && <CheckCircle2 className="text-emerald-600" size={18} />}
                                            {codeStatus === 'taken' && <XCircle className="text-rose-600" size={18} />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-2 ml-1">
                                        {codeStatus === 'taken' ? (lang === 'sv' ? 'Koden är upptagen' : 'Code is taken') : (lang === 'sv' ? 'Elevernas inloggningskod' : 'Student access code')}
                                    </p>
                                </div>
                            </div>

                            {/* Bento Row 2: Personal Info */}
                            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-strong)] p-6 shadow-2xs">
                                <h2 className="font-extrabold uppercase text-xs tracking-wider text-[var(--text-main)] mb-5 border-b border-[var(--border-main)] pb-3">
                                    {lang === 'sv' ? 'Personuppgifter' : 'Personal Info'}
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] ml-1">
                                            {lang === 'sv' ? 'Fullständigt Namn' : 'Full Name'}
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] focus:border-emerald-600 rounded-xl px-4 py-3 text-xs font-bold text-[var(--text-main)] outline-none transition-all shadow-inner"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] ml-1">
                                            {lang === 'sv' ? 'Skola / Organisation' : 'School / Organization'}
                                        </label>
                                        <div className="relative">
                                            <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${profile?.school_id ? 'text-[var(--text-muted)] opacity-40' : 'text-emerald-600'}`} size={16} />
                                            <input 
                                                type="text"
                                                disabled={!!profile?.school_id}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl font-bold text-xs transition-all border shadow-inner ${
                                                    profile?.school_id 
                                                        ? 'bg-[var(--bg-surface-hover)] border-[var(--border-main)] text-[var(--text-muted)] cursor-not-allowed opacity-75' 
                                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] focus:border-emerald-600 text-[var(--text-main)] outline-none'
                                                }`}
                                                value={formData.school_name}
                                                onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                                            />
                                            {profile?.school_id && (
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                                    <Lock size={14} className="text-[var(--text-muted)] opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: SECURITY */}
                    {activeTab === 'security' && !isGoogleUser && (
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-strong)] p-6 shadow-2xs animate-in fade-in duration-200">
                            <h2 className="font-extrabold uppercase text-xs tracking-wider text-[var(--text-main)] mb-5 border-b border-[var(--border-main)] pb-3">
                                {lang === 'sv' ? 'Byt Lösenord' : 'Change Password'}
                            </h2>
                            <div className="max-w-md space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] ml-1">
                                        {lang === 'sv' ? 'Nytt Lösenord' : 'New Password'}
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" size={16} />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            className="w-full pl-10 pr-10 py-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] focus:border-emerald-600 rounded-xl font-bold text-xs text-[var(--text-main)] outline-none transition-all shadow-inner"
                                            placeholder="••••••••"
                                            value={formData.new_password}
                                            onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] ml-1">
                                        {lang === 'sv' ? 'Bekräfta Lösenord' : 'Confirm Password'}
                                    </label>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-strong)] focus:border-emerald-600 rounded-xl font-bold text-xs text-[var(--text-main)] outline-none transition-all shadow-inner"
                                        placeholder="••••••••"
                                        value={formData.confirm_password}
                                        onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DEVELOPER PORTAL */}
                    {activeTab === 'developer' && profile?.role === 'super_admin' && (
                        <DeveloperPortal lang={lang} profile={profile} />
                    )}

                </div>
            </main>
        </div>
    );
}