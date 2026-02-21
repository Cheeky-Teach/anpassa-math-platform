import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    User, Shield, School, CreditCard, CheckCircle2, XCircle, 
    Loader2, Save, ChevronLeft, Zap, Star, Building2, Target,
    Lock, KeyRound, Eye, EyeOff
} from 'lucide-react';

export default function ProfileView({ profile, onBack, lang = 'sv' }) {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        class_code: profile?.class_code || '',
        school_name: profile?.school_name || '',
        new_password: '',
        confirm_password: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [codeStatus, setCodeStatus] = useState('idle');
    const [originalCode] = useState(profile?.class_code || '');
    const [showPassword, setShowPassword] = useState(false);

    // Detect if user is using Google OAuth (Password fields are useless for them)
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    useEffect(() => {
        const checkProvider = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const isGoogle = user?.app_metadata?.provider === 'google' || 
                             user?.identities?.some(id => id.provider === 'google');
            setIsGoogleUser(isGoogle);
        };
        checkProvider();
    }, []);

    // --- FIX: Sync internal state if profile prop updates ---
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

    // --- CODE AVAILABILITY CHECKER ---
    useEffect(() => {
        const checkCode = async () => {
            const code = formData.class_code.toUpperCase().trim();
            if (code.length < 3 || code.length > 12 || !/^[A-Z0-9-]+$/.test(code)) {
                setCodeStatus('invalid');
                return;
            }
            if (code === originalCode) {
                setCodeStatus('available');
                return;
            }
            setCodeStatus('checking');
            const { data, error } = await supabase.rpc('check_code_available', { requested_code: code });
            if (!error) setCodeStatus(data ? 'available' : 'taken');
        };

        const timer = setTimeout(checkCode, 500); // Debounce
        return () => clearTimeout(timer);
    }, [formData.class_code, originalCode]);

    const handleSave = async () => {
        if (!profile?.id) return;
        if (codeStatus !== 'available' && formData.class_code !== originalCode) return;
        
        // Validation for password change
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            alert(lang === 'sv' ? "Lösenorden matchar inte." : "Passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            // --- NEW: SCHOOL ID RESOLUTION LOGIC ---
            // Ensures we never create a row with a name but no ID
            let resolvedSchoolId = profile.school_id;
            let finalSchoolName = formData.school_name.trim();

            if (!resolvedSchoolId && finalSchoolName) {
                // 1. Try to find if this school already exists in our system
                const { data: existingSchool } = await supabase
                    .from('schools')
                    .select('id')
                    .eq('name', finalSchoolName)
                    .maybeSingle();

                if (existingSchool) {
                    resolvedSchoolId = existingSchool.id;
                } else {
                    // 2. Create the school entry if it is truly unique/new
                    const { data: newS, error: sErr } = await supabase
                        .from('schools')
                        .insert([{ name: finalSchoolName }])
                        .select()
                        .single();
                    if (sErr) throw sErr;
                    resolvedSchoolId = newS.id;
                }
            }

            // 1. Update Profile Information
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name.trim(),
                    class_code: formData.class_code.toUpperCase().trim(),
                    school_name: finalSchoolName,
                    school_id: resolvedSchoolId, // The UUID link is now guaranteed
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // 2. Update Password if provided
            if (formData.new_password) {
                const { error: authError } = await supabase.auth.updateUser({
                    password: formData.new_password
                });
                if (authError) throw authError;
            }

            alert(lang === 'sv' ? "Ändringar sparade!" : "Changes saved!");
            onBack(); 
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans pb-40 relative overflow-hidden">
            <header className="bg-white/70 backdrop-blur-md border-b border-emerald-100 px-6 py-5 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold uppercase text-emerald-700 hover:text-emerald-900 transition-colors">
                        <ChevronLeft size={20}/> Dashboard
                    </button>
                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-800">
                        {lang === 'sv' ? 'Profil & Säkerhet' : 'Profile & Security'}
                    </h1>
                    <div className="w-24" /> 
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-10 relative z-10">
                {/* --- SECTION: PERSONUPPGIFTER --- */}
                <section className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <h2 className="font-bold uppercase text-xs tracking-widest text-emerald-900">Personuppgifter</h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-slate-400 ml-2 tracking-wider">Fullständigt Namn</label>
                            <input 
                                type="text"
                                className="w-full px-6 py-4 bg-[#f9fbf7] border-2 border-emerald-50 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>

                        {/* --- SAFEGUARD: SCHOOL LOCKING --- */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-slate-400 ml-2 tracking-wider">Skola / Organisation</label>
                            <div className="relative">
                                <Building2 className={`absolute left-5 top-5 ${profile?.school_id ? 'text-slate-300' : 'text-emerald-200'}`} size={18} />
                                <input 
                                    type="text"
                                    disabled={!!profile?.school_id} // LOCK if ID is assigned
                                    className={`w-full pl-14 pr-6 py-4 rounded-2xl font-bold transition-all border-2 ${
                                        profile?.school_id 
                                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-[#f9fbf7] border-emerald-50 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none'
                                    }`}
                                    value={formData.school_name}
                                    onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                                />
                                {profile?.school_id && (
                                    <div className="mt-2 ml-2 flex items-center gap-1.5 text-[9px] font-bold text-amber-600 uppercase italic">
                                        <Lock size={10} /> Kontakta support för att byta organisation
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECTION: SÄKERHET (Only for Email users) --- */}
                {!isGoogleUser && (
                    <section className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                        <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white">
                                <Shield size={20} />
                            </div>
                            <h2 className="font-bold uppercase text-xs tracking-widest text-slate-800">Säkerhet</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-slate-400 ml-2 tracking-wider">Nytt Lösenord</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-5 text-slate-300" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-14 pr-14 py-4 bg-[#f9fbf7] border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.new_password}
                                        onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-5 text-slate-300 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase text-slate-400 ml-2 tracking-wider">Bekräfta Lösenord</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-6 py-4 bg-[#f9fbf7] border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* --- SECTION: ÖVNINGSKOD --- */}
                <section className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <div className="p-8 border-b border-orange-50 bg-orange-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                            <Zap size={20} />
                        </div>
                        <h2 className="font-bold uppercase text-xs tracking-widest text-orange-900">Permanent Övningskod</h2>
                    </div>
                    <div className="p-8 flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                                Denna kod används för att dina elever ska kunna logga in på din dashboard och öva på egen hand.
                            </p>
                            <div className="relative max-w-sm">
                                <input 
                                    type="text"
                                    maxLength={12}
                                    className={`w-full px-8 py-5 rounded-[2rem] font-black text-3xl tracking-[0.2em] uppercase outline-none transition-all border-4 ${
                                        codeStatus === 'available' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                        codeStatus === 'taken' ? 'border-rose-500 bg-rose-50 text-rose-700' :
                                        'border-[#f9fbf7] bg-[#f9fbf7] text-slate-900'
                                    }`}
                                    value={formData.class_code}
                                    onChange={(e) => setFormData({...formData, class_code: e.target.value})}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                    {codeStatus === 'checking' && <Loader2 className="animate-spin text-emerald-600" />}
                                    {codeStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={24} />}
                                    {codeStatus === 'taken' && <XCircle className="text-rose-500" size={24} />}
                                </div>
                            </div>
                            <div className="mt-4 px-4">
                                {codeStatus === 'taken' && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Koden är upptagen</p>}
                                {codeStatus === 'available' && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Koden är tillgänglig!</p>}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50 animate-in slide-in-from-bottom-6 duration-500">
                <button 
                    onClick={handleSave}
                    disabled={isSaving || (codeStatus !== 'available' && formData.class_code !== originalCode)}
                    className="w-full bg-emerald-900 text-white py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(6,78,59,0.3)] hover:bg-emerald-700 hover:-translate-y-1 transition-all font-black uppercase tracking-widest flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={22}/>}
                    Spara Ändringar
                </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0">
                <svg className="relative block w-full h-[400px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                </svg>
            </div>
        </div>
    );
}