import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, AlertCircle, Loader2, RefreshCw, X, Zap } from 'lucide-react';

export default function CapacityModal({ visible, onClose, classCode, lang = 'sv' }) {
    const [loading, setLoading] = useState(true);
    const [purging, setPurging] = useState(false);
    const [capacity, setCapacity] = useState({ active_count: 0, max_slots: 0 });

    const t = {
        sv: {
            title: "Hantera Elevplatser",
            subtitle: "Kontrollera hur många elever som är inloggade med din klasskod.",
            active_label: "Anslutna Elever",
            slots_label: "Max Platser",
            warning_title: "Varför finns det en gräns?",
            warning_desc: "Eftersom eleverna loggar in anonymt utan egna konton, finns det ett maxantal för din lärarkod. Detta ger dig kontroll över vilka som upptar platser i ditt klassrum. Om en elev stänger fliken utan att logga ut kan platsen förbli låst i upp till 3 minuter.",
            warning_safe: "Att klicka eller skriva i appen håller aktiva elever inloggade automatiskt. Om du klickar på knappen nedan rensas endast inaktiva elevsessioner. Elever som just nu arbetar i appen kommer inte att påverkas.",
            btn_purge: "Rensa inaktiva elever",
            btn_purged: "Platser frigjorda!"
        },
        en: {
            title: "Manage Student Slots",
            subtitle: "Control how many students are currently using your class code.",
            active_label: "Connected Students",
            slots_label: "Max Slots",
            warning_title: "Why is there a limit?",
            warning_desc: "Because students log in anonymously without personal accounts, your teacher code has a maximum capacity. This ensures you maintain control over who occupies a seat in your classroom. If a student closes their tab without logging out, their slot may remain occupied for up to 3 minutes.",
            warning_safe: "Typing or clicking in the app automatically keeps active students securely logged in. Clicking the button below only clears inactive student sessions. Students who are currently working will not be interrupted.",
            btn_purge: "Clear inactive students",
            btn_purged: "Slots freed!"
        }
    }[lang];

    const fetchCapacity = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_class_capacity', { p_teacher_code: classCode });
        if (!error && data) {
            setCapacity(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (visible && classCode) {
            fetchCapacity();
        }
    }, [visible, classCode]);

    const handlePurge = async () => {
        setPurging(true);
        await supabase.rpc('purge_class_sessions', { p_teacher_code: classCode });
        
        // Optimistically set count to 0. Active students will ping back to normal within 60s.
        setCapacity(prev => ({ ...prev, active_count: 0 }));
        
        setTimeout(() => {
            setPurging(false);
            onClose();
        }, 1500);
    };

    if (!visible) return null;

    const fillPercentage = capacity.max_slots > 0 ? (capacity.active_count / capacity.max_slots) * 100 : 0;
    const isNearingCap = fillPercentage >= 80;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{t.title}</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1">{t.subtitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Visual Counter */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
                        ) : (
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.active_label}</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className={`text-5xl font-black tracking-tighter ${isNearingCap ? 'text-amber-500' : 'text-emerald-600'}`}>
                                            {capacity.active_count}
                                        </span>
                                        <span className="text-xl font-bold text-slate-300">/ {capacity.max_slots}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Users size={32} className={isNearingCap ? 'text-amber-200' : 'text-emerald-200'} />
                                </div>
                            </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-6 overflow-hidden relative z-10">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isNearingCap ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Explainer / Warning */}
                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-4">
                        <AlertCircle className="text-indigo-500 shrink-0" size={24} />
                        <div>
                            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">{t.warning_title}</h4>
                            <p className="text-xs font-medium text-indigo-700 leading-relaxed mb-3">
                                {t.warning_desc}
                            </p>
                            <p className="text-xs font-bold text-emerald-700 bg-emerald-100/50 p-2 rounded-lg border border-emerald-200/50">
                                ✓ {t.warning_safe}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handlePurge}
                        disabled={purging || loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {purging ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                        {purging ? t.btn_purged : t.btn_purge}
                    </button>
                </div>
            </div>
        </div>
    );
}