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
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[var(--border-main)] bg-[var(--bg-surface)]">
                    <div>
                        <h2 className="text-base font-extrabold text-[var(--text-main)]">{t.title}</h2>
                        <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{t.subtitle}</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    
                    {/* Visual Counter */}
                    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-main)] relative overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
                        ) : (
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{t.active_label}</span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className={`text-4xl font-extrabold font-mono tracking-tight ${isNearingCap ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {capacity.active_count}
                                        </span>
                                        <span className="text-lg font-bold font-mono text-[var(--text-muted)]">/ {capacity.max_slots}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Users size={28} className={isNearingCap ? 'text-amber-500/40' : 'text-emerald-500/40'} />
                                </div>
                            </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] h-2 rounded-full mt-4 overflow-hidden relative z-10">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${isNearingCap ? 'bg-amber-500' : 'bg-emerald-600'}`}
                                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Explainer / Warning */}
                    <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-4 rounded-xl flex gap-3 text-sky-950 dark:text-sky-100">
                        <AlertCircle className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" size={20} />
                        <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider">{t.warning_title}</h4>
                            <p className="text-xs font-medium leading-relaxed opacity-90">
                                {t.warning_desc}
                            </p>
                            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                ✓ {t.warning_safe}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        type="button"
                        onClick={handlePurge}
                        disabled={purging || loading}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-50"
                    >
                        {purging ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        <span>{purging ? t.btn_purged : t.btn_purge}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}