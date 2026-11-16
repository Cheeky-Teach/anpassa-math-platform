// src/components/activities/shared/YouVsClassHelpModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, LayoutGrid, Shield, 
    RefreshCcw, Eye, HelpCircle, Users, BookOpen,
    Calculator, Trophy, Crown, Zap, Lock, Award, Layers
} from 'lucide-react';

export default function YouVsClassHelpModal({ isOpen, onClose, lang = 'sv' }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('quickstart'); // 'quickstart' | 'setup' | 'gameplay' | 'faq'

    const t = {
        sv: {
            title: "Lärarguide: Du mot Klassen (1 vs 100)",
            subtitle: "Så skapar du frågestegar och leder det spännande duellspelet mellan utmanaren och mobben",
            tabs: {
                quickstart: "Snabbstart (30 sek)",
                setup: "Spelupplägg & Stege",
                gameplay: "Spelregler & Faser",
                faq: "Tips & Frågor"
            },
            close: "Stäng",
            quickstart: {
                step1_title: "1. Välj Målområde & Nivå",
                step1_desc: "Använd kunskapskartan för att söka eller bläddra fram ett målområde. Välj nivå och lägg till det som mål.",
                step2_title: "2. Välj ZPD-läge & Rundor",
                step2_desc: "Välj hur stegen ska byggas (t.ex. förkunskaper + målnivå) och bestäm antal rundor (4–12) samt startpoäng och svarsformat.",
                step3_title: "3. Starta Live & Duellera",
                step3_desc: "Eleverna ansluter med rumskoden. Slumpa fram en utmanare till Heta Stolen och låt klassen (mobben) tävla mot hen!",
                pro_tip_label: "Proffstips:",
                pro_tip_text: "Utmanaren kan använda 'Fråga klassen' som livlinje, men det halverar den poängsatsning som gjorts."
            },
            setup: {
                map_title: "Kunskapskarta & Nivåbeskrivningar",
                map_desc: "I inställningsmodulen ser du direkta exempeluppgifter och nivåbeskrivningar för varje steg i kunskapskartan. Det gör det enkelt att bygga en pedagogisk stege utan gissningar.",
                zpd_title: "ZPD-lägen (Automatiska stegpoddar)",
                zpd_desc_1: "• Förkunskaper + Målnivå: Bygger en stegvis klättring från grundläggande förkunskaper upp till ert mål.",
                zpd_desc_2: "• Endast Målnivå: Fokuserar helt och hållet på vald svårighetsgrad.",
                zpd_desc_3: "• Målnivå + Nästa steg: Startar på målet och steppar upp till nästa nivå.",
                zpd_desc_4: "• Hela kedjan: En komplett bemästringsklättring från grund till fördjupning.",
                rounds_title: "Flexibelt antal rundor",
                rounds_desc: "Du kan välja allt från 4 till 12 rundor. Dessutom kan du när som helst lägga till extra rundor eller flash-rundor direkt under pågående spel."
            },
            gameplay: {
                phase1_title: "Fas 1: Heta Stolen & Satsning",
                phase1_desc: "Läraren slumpar fram en utmanare. Utmanaren väljer en poängsatsning (upp till 50% av sina totala poäng).",
                phase2_title: "Fas 2: Mobben Svarar",
                phase2_desc: "Resten av klassen (mobben) svarar på frågan. Utmanaren kan välja att 'Fråga klassen' för att se röstfördelningen mot en halvering av satsningen.",
                phase3_title: "Fas 3: Utmanarens Svar & Facit",
                phase3_desc: "Utmanaren låser in sitt svar. Läraren klickar på 'Visa Facit' för att rätta och dela ut poäng, multiplikatorer och bounties.",
                scoring_title: "Poäng & Multiplikatorer",
                scoring_desc: "Klarar utmanaren rundan vinner hen satsningen och ökar sin poängmultiplikator (+0.5x eller +1.0x om hen besegrar mobben). Om utmanaren åker dit delas poängen ut till mobben som en 'mob-bounty'."
            },
            faq: {
                q1: "Vad händer om utmanaren svarar fel?",
                a1: "Utmanaren förlorar sin satsning och Heta Stolen roteras automatiskt till en ny elev i nästa runda.",
                q2: "Kan utmanaren behålla sin plats i Heta Stolen?",
                a2: "Ja! Klarar utmanaren rundan får hen stanna kvar (upp till 3 rundor för en särklassig sweep-bonus på +250p).",
                q3: "Hur fungerar 'Fråga klassen'?",
                a3: "När utmanaren trycker på livlinan visas antingen svarsfördelningen (flerval) eller de vanligaste anonyma svaren (knappsats), men satsningen halveras.",
                q4: "Vad är en Flash-runda?",
                a4: "En snabbextra-runda på samma nivå med slumpmässigt genererade nya tal för att hålla spänningen på topp.",
                q5: "Hur ser slutskärmen ut?",
                a5: "När alla rundor är spelade visas en storstilad Top 3-podium med kvällens mästare, slutpoäng och multiplikatorer."
            }
        },
        en: {
            title: "Teacher Guide: You vs. Class (1 vs 100)",
            subtitle: "How to set up question ladders and run the thrilling duel between the challenger and the mob",
            tabs: {
                quickstart: "Quick Start (30s)",
                setup: "Game Setup & Ladder",
                gameplay: "Rules & Phases",
                faq: "Tips & FAQ"
            },
            close: "Close",
            quickstart: {
                step1_title: "1. Select Topic & Level",
                step1_desc: "Use the concept map to search or browse a target topic, select your level, and add it as a target.",
                step2_title: "2. Choose ZPD Mode & Rounds",
                step2_desc: "Pick how the ladder builds (e.g. prereqs + target), set the round count (4–12), starting baseline points, and answer format.",
                step3_title: "3. Go Live & Duel",
                step3_desc: "Students join using the room PIN. Spin the roulette to pick a challenger for the Hot Seat and let the class (the mob) compete against them!",
                pro_tip_label: "Pro Tip:",
                pro_tip_text: "The challenger can use 'Ask the Mob' as a lifeline, but it halves their current wager."
            },
            setup: {
                map_title: "Concept Map & Level Descriptions",
                map_desc: "In the setup wizard, you'll see exact sample problems and pedagogical level descriptions for every step in the concept map, making it effortless to build a scaffolded ladder.",
                zpd_title: "ZPD Modes (Automated Ladders)",
                zpd_desc_1: "• Prerequisites + Target: Builds a step-by-step climb from foundational prerequisites up to your goal.",
                zpd_desc_2: "• Target Level Only: Focuses strictly on the chosen difficulty tier.",
                zpd_desc_3: "• Target + Next Level: Starts at your target and steps up into higher difficulty.",
                zpd_desc_4: "• Full Climb: A complete mastery progression from basics to advanced.",
                rounds_title: "Flexible Round Count",
                rounds_desc: "Choose anywhere from 2 to 20 rounds. You can also append bonus rounds or flash rounds live during gameplay."
            },
            gameplay: {
                phase1_title: "Phase 1: Hot Seat & Wager",
                phase1_desc: "The teacher spins for a challenger. The challenger places a point wager (up to 50% of their total score).",
                phase2_title: "Phase 2: The Mob Answers",
                phase2_desc: "The rest of the class (the mob) submits their answers. The challenger can use 'Ask the Mob' to view the answer spread at the cost of half their wager.",
                phase3_title: "Phase 3: Challenger Answer & Reveal",
                phase3_desc: "The challenger locks in their answer. The teacher clicks 'Reveal' to grade and award points, score multipliers, and mob bounties.",
                scoring_title: "Points & Multipliers",
                scoring_desc: "If the challenger survives, they win their wager and boost their multiplier (+0.5x or +1.0x if they beat the mob). If they fail, their wager is split among the correct mob members as a bounty."
            },
            faq: {
                q1: "What happens if the challenger answers incorrectly?",
                a1: "The challenger loses their wager and the Hot Seat automatically rotates to a new student in the next round.",
                q2: "Can the challenger stay in the Hot Seat?",
                a2: "Yes! If they survive each round, they remain in the seat (surviving 3 rounds grants a massive +250p Sweep Bonus).",
                q3: "How does 'Ask the Mob' work?",
                a3: "When activated, it reveals the class vote spread (multiple choice) or top anonymous answers (keypad), but cuts the challenger's wager in half.",
                q4: "What is a Flash Round?",
                a4: "A quick bonus round on the exact same level with freshly randomized numbers to keep the energy high.",
                q5: "What does the end screen look like?",
                a5: "When all rounds finish, a cinematic Top 3 Podium celebrates tonight's champions with final scores and multipliers."
            }
        }
    }[lang] || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                        className="relative bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden text-[var(--text-main)] max-h-[88vh] z-10"
                    >
                        
                        {/* Header */}
                        <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                                        {t.title}
                                    </h2>
                                    <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
                                        {t.subtitle}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[var(--border-main)] bg-[var(--bg-surface)]/60 px-6 sm:px-8 gap-2 pt-2 shrink-0">
                            {Object.entries(t.tabs || {}).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={`pb-3 px-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                        activeTab === key 
                                            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Body Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[var(--text-main)] bg-[var(--bg-canvas)]">
                            
                            {/* TAB 1: QUICKSTART */}
                            {activeTab === 'quickstart' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex flex-col gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                                                <Layers size={13} />
                                            </div>
                                            <h4 className="font-extrabold text-xs uppercase tracking-wide">
                                                {t.quickstart.step1_title}
                                            </h4>
                                            <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                                {t.quickstart.step1_desc}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex flex-col gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-xs">
                                                <Zap size={13} />
                                            </div>
                                            <h4 className="font-extrabold text-xs uppercase tracking-wide">
                                                {t.quickstart.step2_title}
                                            </h4>
                                            <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                                {t.quickstart.step2_desc}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] flex flex-col gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 font-extrabold flex items-center justify-center text-xs">
                                                <Trophy size={13} />
                                            </div>
                                            <h4 className="font-extrabold text-xs uppercase tracking-wide">
                                                {t.quickstart.step3_title}
                                            </h4>
                                            <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                                {t.quickstart.step3_desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-3">
                                        <span>
                                            <strong>{t.quickstart.pro_tip_label}</strong> {t.quickstart.pro_tip_text}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SETUP & LADDER */}
                            {activeTab === 'setup' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-emerald-700 dark:text-emerald-400">
                                            <BookOpen size={15} />
                                            <span>{t.setup.map_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.setup.map_desc}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-amber-700 dark:text-amber-400">
                                            <Crown size={15} />
                                            <span>{t.setup.zpd_title}</span>
                                        </div>
                                        <div className="text-xs font-medium text-[var(--text-muted)] leading-relaxed space-y-1">
                                            <div>{t.setup.zpd_desc_1}</div>
                                            <div>{t.setup.zpd_desc_2}</div>
                                            <div>{t.setup.zpd_desc_3}</div>
                                            <div>{t.setup.zpd_desc_4}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-sky-700 dark:text-sky-400">
                                            <Award size={15} />
                                            <span>{t.setup.rounds_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.setup.rounds_desc}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: GAMEPLAY & RULES */}
                            {activeTab === 'gameplay' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-amber-700 dark:text-amber-400">
                                            <Crown size={15} />
                                            <span>{t.gameplay.phase1_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.gameplay.phase1_desc}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-sky-700 dark:text-sky-400">
                                            <Users size={15} />
                                            <span>{t.gameplay.phase2_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.gameplay.phase2_desc}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-emerald-700 dark:text-emerald-400">
                                            <Eye size={15} />
                                            <span>{t.gameplay.phase3_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.gameplay.phase3_desc}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2">
                                        <div className="flex items-center gap-2 font-extrabold text-xs uppercase text-teal-700 dark:text-teal-400">
                                            <Trophy size={15} />
                                            <span>{t.gameplay.scoring_title}</span>
                                        </div>
                                        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                                            {t.gameplay.scoring_desc}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: FAQ */}
                            {activeTab === 'faq' && (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map(idx => {
                                        const qKey = `q${idx}`;
                                        const aKey = `a${idx}`;
                                        return (
                                            <details key={idx} className="group p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)]">
                                                <summary className="font-extrabold text-xs uppercase cursor-pointer flex items-center justify-between">
                                                    <span>{t.faq[qKey]}</span>
                                                    <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
                                                </summary>
                                                <p className="text-xs font-medium text-[var(--text-muted)] mt-2.5 leading-relaxed">
                                                    {t.faq[aKey]}
                                                </p>
                                            </details>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 sm:px-8 py-3.5 border-t border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-end shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                            >
                                {t.close}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}