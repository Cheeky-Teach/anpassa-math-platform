// src/components/modals/StreakModal.jsx
import React from 'react';

const StreakModal = ({ visible, streak, ui, onClose }) => {
    if (!visible) return null;

    let icon = "🥉";
    if (streak >= 50) icon = "👑";
    else if (streak >= 40) icon = "🏆";
    else if (streak >= 30) icon = "🥇";
    else if (streak >= 20) icon = "🥈";
    else if (streak >= 15) icon = "🥉";

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] rounded-2xl shadow-2xl border border-[var(--border-strong)] max-w-sm w-full p-6 sm:p-8 text-center relative animate-in zoom-in-95 duration-150">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner animate-pulse">
                    {icon}
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-main)] mb-1.5">
                    {ui?.streak_modal_title || "Streak Milestone!"}
                </h3>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-6 leading-relaxed">
                    {ui?.streak_modal_msg ? ui.streak_modal_msg.replace('{streak}', streak) : `You've achieved a streak of ${streak}!`}
                </p>
                <button 
                    type="button"
                    onClick={onClose} 
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                >
                    {ui?.btn_close_streak || "Continue"}
                </button>
            </div>
        </div>
    );
};

export default StreakModal;