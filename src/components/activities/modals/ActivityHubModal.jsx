// src/components/activities/modals/ActivityHubModal.jsx
import React, { useState } from 'react';
import { X, Grid, Trophy, Swords, SplitSquareVertical, Sparkles, ArrowRight } from 'lucide-react';
import CategoryClashSetupModal from '../wizards/CategoryClashSetupModal.jsx';

export default function ActivityHubModal({
    isOpen,
    onClose,
    sourcePacket = [],
    onLaunchCategoryClash, // ({ dimensions, pointScale, categories, teams, wordProblems, sourceMode }) => void
    profile = null,
    lang = 'sv'
}) {
    const [activeWizard, setActiveWizard] = useState(null); // null | 'category_clash' | 'millionaire' | ...

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

    const activities = [
        {
            id: 'category_clash',
            title: lang === 'sv' ? "Poängjakten" : "Category Clash",
            desc: lang === 'sv' 
                ? "Klassiskt rutnät där lag väljer kategori och nivå för att samla poäng." 
                : "Grid matrix where teams pick topic and tier to rack up points.",
            icon: Grid,
            color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-500',
            badgeColor: 'bg-amber-500 text-slate-950',
            available: true
        },
        {
            id: 'millionaire',
            title: lang === 'sv' ? "Kvitt eller Dubbelt" : "Math Ladder",
            desc: lang === 'sv' 
                ? "15-stegs utmaning med eskalerande svårighetsgrad och klassiska livlinor." 
                : "15-step difficulty ladder with classic lifelines (50:50, Coach).",
            icon: Trophy,
            color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
            badgeColor: 'bg-indigo-600 text-white',
            available: false
        },
        {
            id: 'tug_of_war',
            title: lang === 'sv' ? "Dragkamp" : "Tug of War",
            desc: lang === 'sv' 
                ? "Två lag eller solospelare mot en klockbot kämpar om repet genom snabbhet." 
                : "Push-and-pull battle of speed and accuracy against a team or bot.",
            icon: Swords,
            color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
            badgeColor: 'bg-rose-500 text-white',
            available: false
        },
        {
            id: 'four_corners',
            title: lang === 'sv' ? "Fyra Hörn" : "Four Corners",
            desc: lang === 'sv' 
                ? "Fysisk eller digital ställningstagandeövning kring matematiska påståenden." 
                : "Physical or digital voting exercise evaluating mathematical claims.",
            icon: SplitSquareVertical,
            color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
            badgeColor: 'bg-emerald-500 text-slate-950',
            available: false
        }
    ];

    // If a wizard is active, show that specific wizard
    if (activeWizard === 'category_clash') {
        return (
            <CategoryClashSetupModal
                isOpen={true}
                onClose={() => setActiveWizard(null)}
                sourcePacket={sourcePacket}
                profile={profile} // 🟢 Pass profile down
                lang={lang}
                onLaunch={(config) => {
                    setActiveWizard(null);
                    onClose();
                    onLaunchCategoryClash(config);
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in select-none">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col text-slate-800">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">{t.title}</h2>
                        <p className="text-xs font-bold text-slate-400">{t.subtitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Activity Card Grid */}
                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {activities.map((act) => {
                        const Icon = act.icon;
                        return (
                            <div
                                key={act.id}
                                onClick={() => act.available && setActiveWizard(act.id)}
                                className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                                    act.available 
                                        ? 'bg-gradient-to-br ' + act.color + ' hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md' 
                                        : 'bg-slate-50 border-slate-200/80 opacity-55 cursor-not-allowed'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center">
                                            <Icon size={20} className={act.available ? '' : 'text-slate-400'} />
                                        </div>
                                        {!act.available && (
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                                                {t.coming_soon}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">
                                        {act.title}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                                        {act.desc}
                                    </p>
                                </div>

                                {act.available && (
                                    <div className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-900 group">
                                        <span>{t.choose}</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        {t.cancel}
                    </button>
                </div>

            </div>
        </div>
    );
}