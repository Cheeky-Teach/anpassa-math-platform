// src/components/activities/modals/ActivityHubModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { ACTIVITY_REGISTRY, getActivityDefinition } from '../registry/activityRegistry';

const getActivityTheme = (id) => {
    switch (id) {
        case 'you_vs_class':
        case 'activity_you_vs_class':
            return {
                borderHover: 'hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10',
                iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
                accentBar: 'bg-gradient-to-r from-amber-500 to-amber-600'
            };
        case 'four_corners':
        case 'activity_four_corners':
            return {
                borderHover: 'hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10',
                iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
                accentBar: 'bg-gradient-to-r from-sky-500 to-sky-600'
            };
        default:
            return {
                borderHover: 'hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10',
                iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                accentBar: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            };
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 420, damping: 28 }
    }
};

export default function ActivityHubModal({
    isOpen,
    onClose,
    sourcePacket = [],
    onLaunchActivity,
    profile = null,
    lang = 'sv'
}) {
    const [activeWizardKey, setActiveWizardKey] = useState(null);

    if (!isOpen) return null;

    const t = {
        sv: {
            title: "Aktiviteter & Spel",
            subtitle: "Starta en interaktiv genomgång eller repetition med dina uppgifter",
            choose: "Starta Läge",
            coming_soon: "Kommer snart",
            cancel: "Stäng"
        },
        en: {
            title: "Activities & Games",
            subtitle: "Launch an interactive review or game using your question set",
            choose: "Launch Mode",
            coming_soon: "Coming Soon",
            cancel: "Close"
        }
    }[lang];

    const activeDef = getActivityDefinition(activeWizardKey);

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                        className="relative bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-[var(--text-main)] z-10"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[var(--text-main)]">{t.title}</h2>
                                    <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">{t.subtitle}</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Staggered Card Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar bg-[var(--bg-canvas)]"
                        >
                            {Object.values(ACTIVITY_REGISTRY).map((act) => {
                                const Icon = act.icon;
                                const titleText = act.title[lang] || act.title.sv;
                                const descText = act.desc?.[lang] || act.desc?.sv || "";
                                const theme = getActivityTheme(act.id);

                                return (
                                    <motion.div
                                        key={act.id}
                                        variants={cardVariants}
                                        whileHover={act.available ? { y: -4, scale: 1.01 } : {}}
                                        whileTap={act.available ? { scale: 0.98 } : {}}
                                        onClick={() => act.available && setActiveWizardKey(act.id)}
                                        className={`group relative overflow-hidden p-5 rounded-2xl border flex flex-col justify-between transition-colors duration-200 ${
                                            act.available 
                                                ? `bg-[var(--bg-card)] border-[var(--border-main)] ${theme.borderHover} cursor-pointer` 
                                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        {/* Top Accent Glow Bar */}
                                        {act.available && (
                                            <div className={`absolute top-0 inset-x-0 h-1 opacity-80 transition-opacity group-hover:opacity-100 ${theme.accentBar}`} />
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-200 shadow-2xs ${theme.iconBg}`}>
                                                    <Icon size={22} className={act.available ? '' : 'text-[var(--text-muted)]'} />
                                                </div>

                                                {!act.available && (
                                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
                                                        {t.coming_soon}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-tight mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {titleText}
                                            </h3>
                                            <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed mb-5">
                                                {descText}
                                            </p>
                                        </div>

                                        {act.available && (
                                            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-main)]/60">
                                                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                    {t.choose}
                                                </span>
                                                <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                                                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 border-t border-[var(--border-main)] flex justify-end bg-[var(--bg-surface)] shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer shadow-2xs"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}