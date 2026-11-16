// src/components/activities/modals/ActivityHubModal.jsx
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { ACTIVITY_REGISTRY, getActivityDefinition } from '../registry/activityRegistry';

export default function ActivityHubModal({
    isOpen,
    onClose,
    sourcePacket = [],
    onLaunchActivity, // Unified callback: (gameKey, config) => void
    profile = null,
    lang = 'sv'
}) {
    const [activeWizardKey, setActiveWizardKey] = useState(null);

    if (!isOpen) return null;

    const t = {
        sv: {
            title: "Aktiviteter & Spel",
            subtitle: "Starta en interaktiv genomgång eller repetition med dina uppgifter",
            choose: "Välj aktivitet",
            coming_soon: "Kommer snart",
            cancel: "Stäng"
        },
        en: {
            title: "Activities & Games",
            subtitle: "Launch an interactive review or game using your question set",
            choose: "Select Activity",
            coming_soon: "Coming Soon",
            cancel: "Close"
        }
    }[lang];

    const activeDef = getActivityDefinition(activeWizardKey);

    // Dynamic wizard mount
    if (activeDef?.SetupModal) {
        const SetupComponent = activeDef.SetupModal;
        return (
            <SetupComponent
                isOpen={true}
                onClose={() => setActiveWizardKey(null)}
                sourcePacket={sourcePacket}
                profile={profile}
                lang={lang}
                onLaunch={(config) => {
                    setActiveWizardKey(null);
                    onClose();
                    onLaunchActivity(activeDef.key, config);
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-[var(--text-main)] animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                    <div>
                        <h2 className="text-base font-extrabold uppercase tracking-tight text-[var(--text-main)]">{t.title}</h2>
                        <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">{t.subtitle}</p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Dynamic Activity Card Grid */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[var(--bg-canvas)]">
                    {Object.values(ACTIVITY_REGISTRY).map((act) => {
                        const Icon = act.icon;
                        const titleText = act.title[lang] || act.title.sv;
                        const descText = act.desc?.[lang] || act.desc?.sv || "";

                        return (
                            <div
                                key={act.id}
                                onClick={() => act.available && setActiveWizardKey(act.id)}
                                className={`p-4.5 rounded-xl border flex flex-col justify-between transition-all shadow-2xs ${
                                    act.available 
                                        ? 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-sm cursor-pointer' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-2xs flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                                            <Icon size={18} className={act.available ? '' : 'text-[var(--text-muted)]'} />
                                        </div>
                                        {!act.available && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono">
                                                {t.coming_soon}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide mb-1">
                                        {titleText}
                                    </h3>
                                    <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed mb-4">
                                        {descText}
                                    </p>
                                </div>

                                {act.available && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 group cursor-pointer">
                                        <span>{t.choose}</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-[var(--border-main)] flex justify-end bg-[var(--bg-surface)] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shadow-2xs"
                    >
                        {t.cancel}
                    </button>
                </div>

            </div>
        </div>
    );
}