import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
    User, Shield, School, CreditCard, CheckCircle2, XCircle, 
    Loader2, Save, ChevronLeft, Zap, Star, Building2, Target
} from 'lucide-react';

export default function ProfileView({ profile, onBack, lang = 'sv' }) {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        class_code: profile?.class_code || '',
        school_name: profile?.school_name || ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [codeStatus, setCodeStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken', 'invalid'
    const [originalCode] = useState(profile?.class_code || '');

    // --- 1. CODE AVAILABILITY CHECKER ---
    useEffect(() => {
        const checkCode = async () => {
            const code = formData.class_code.toUpperCase().trim();
            
            // Validation: 3-12 chars, Alphanumeric
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
            
            if (!error) {
                setCodeStatus(data ? 'available' : 'taken');
            }
        };

        const timer = setTimeout(checkCode, 500); // Debounce
        return () => clearTimeout(timer);
    }, [formData.class_code, originalCode]);

    const handleSave = async () => {
        // Double check permissions and status before firing
        if (!profile?.id) {
            alert("Session saknas. Logga in igen.");
            return;
        }

        if (codeStatus !== 'available' && formData.class_code !== originalCode) return;
        
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name.trim(),
                    class_code: formData.class_code.toUpperCase().trim(),
                    school_name: formData.school_name.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id); // Strict ID matching

            if (error) throw error;
            alert(lang === 'sv' ? "Profil sparad!" : "Profile saved!");
            onBack(); 
        } catch (err) {
            console.error("Save Error:", err);
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
                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-800">Kontoinställningar</h1>
                    <div className="w-24" /> 
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-10 relative z-10">
                <section className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden">
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
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-slate-400 ml-2 tracking-wider">Skola / Organisation</label>
                            <div className="relative">
                                <Building2 className="absolute left-5 top-5 text-emerald-200" size={18} />
                                <input 
                                    type="text"
                                    className="w-full pl-14 pr-6 py-4 bg-[#f9fbf7] border-2 border-emerald-50 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                    placeholder="T.ex. Kunskapsskolan"
                                    value={formData.school_name}
                                    onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden">
                    <div className="p-8 border-b border-orange-50 bg-orange-50/30 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                            <Zap size={20} />
                        </div>
                        <h2 className="font-bold uppercase text-xs tracking-widest text-orange-900">Permanent Övningskod</h2>
                    </div>
                    <div className="p-8 flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex-1">
                            <p className="text-base text-slate-500 mb-6 leading-relaxed font-medium">
                                Denna kod används för att dina elever ska kunna logga in på din dashboard och öva på egen hand. 
                                Koden är personlig och unik för dig.
                            </p>
                            <div className="relative max-w-sm">
                                <input 
                                    type="text"
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
                                {codeStatus === 'taken' && <p className="text-xs font-bold text-rose-500 uppercase tracking-wide">Namnet är redan upptaget</p>}
                                {codeStatus === 'invalid' && <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Kräver 3-12 tecken (A-Z, 0-9)</p>}
                                {codeStatus === 'available' && <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Koden är tillgänglig!</p>}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                        <CreditCard size={18} className="text-emerald-600" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-800/40">Din Plan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-emerald-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden ring-8 ring-emerald-500/10">
                            <div className="absolute top-0 right-0 p-5 bg-emerald-500 rounded-bl-[2rem] text-[9px] font-black uppercase tracking-widest shadow-lg">Aktiv</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Nuvarande Plan</div>
                            <div className="text-3xl font-black italic tracking-tighter mb-8 uppercase leading-none">Testperiod</div>
                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-3 text-xs font-bold">
                                    <CheckCircle2 size={16} className="text-emerald-400" /> Full Studio-tillgång
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold">
                                    <CheckCircle2 size={16} className="text-emerald-400" /> Live-rum obegränsat
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[9px] font-bold uppercase text-emerald-400/60 mb-1">Slutar gälla:</p>
                                <p className="font-bold text-base">{profile?.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString() : '---'}</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-emerald-50 flex flex-col opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 group">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Individuell</div>
                            <div className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Pro-Lärare</div>
                            <div className="text-4xl font-black text-emerald-800 mb-8 tracking-tighter">--- kr<span className="text-sm font-medium text-slate-400">/mån</span></div>
                            <button disabled className="mt-auto w-full py-4 bg-[#f9fbf7] text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest border border-slate-100">Kommer Snart</button>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-emerald-50 flex flex-col opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 group">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Organisation</div>
                            <div className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Hel Skola</div>
                            <p className="text-sm text-slate-400 font-bold mb-10 leading-relaxed">Offertbaserad lösning för hela skolenheten.</p>
                            <button disabled className="mt-auto w-full py-4 bg-[#f9fbf7] text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest border border-slate-100">Kommer Snart</button>
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
                <svg className="relative block w-full h-[400px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100/40"></path>
                </svg>
            </div>
        </div>
    );
}