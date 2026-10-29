// src/components/activities/shared/CategoryClashHelpModal.jsx
import React, { useState } from 'react';
import { 
    X, Sparkles, LayoutGrid, ListFilter, Shield, 
    RefreshCcw, Eye, HelpCircle, CheckSquare, Users, BookOpen
} from 'lucide-react';

export default function CategoryClashHelpModal({ isOpen, onClose, lang = 'sv' }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('quickstart'); // 'quickstart' | 'rules' | 'faq'

    const t = {
        sv: {
            title: "Lärarguide: Poängjakten",
            subtitle: "Så skapar och leder du engagerande repetitionsspel i helklass",
            tabs: {
                quickstart: "Snabbstart (30 sek)",
                rules: "Regler & Spellägen",
                faq: "Tips & Frågor"
            },
            close: "Stäng",
            quickstart: {
                step1_title: "Välj 4 Kriterier",
                step1_desc: "Välj 4 matematiska teman. Generatorn bygger automatiskt 16 uppgifter i en progression från 100 till 400 poäng.",
                step2_title: "Granska & Slumpa",
                step2_desc: "Klicka på fliken Granska för att se alla frågor, dölja formler för textuppgifter, eller slumpa nya siffror med ett klick.",
                step3_title: "Starta Live",
                step3_desc: "Eleverna ansluter med 6-siffrig PIN. Klicka på en bricka för att skicka frågan direkt till alla elevers skärmar.",
                pro_tip_label: "Proffstips:",
                pro_tip_text: "Eleverna kan ansluta i lobbyn medan du granskar frågorna i lugn och ro under fliken Förbered."
            },
            rules: {
                mode_title: "Individuellt (Solo) vs Lagspel",
                mode_desc_solo: "Individuellt (Standard): Alla elever spelar för sig själva. Poäng delas ut per korrekt inlämnat svar. Perfekt för formativ bedömning eller snabb repetition.",
                mode_desc_team: "Lagspel: Skapa 2–4 lag under poängraden. När en elev svarar rätt tilldelas poängen automatiskt till elevens lag.",
                clear_title: "Hur brickor töms (Skydd mot feltryck)",
                clear_desc: "Att stänga en fråga med X eller Avbryt sparar brickan kvar på spelplanen. Först när du klickar på den gröna knappen \"Klar (Töm bricka)\" försvinner poängen. Skulle du råka tömma fel bricka kan du klicka på den gråade rutan för att öppna den igen."
            },
            faq: {
                q1: "Hur döljer jag svaren på projektorn så att eleverna inte ser varandras svar?",
                a1: "Klicka på Ögat (Dölj svar) i svarspanelen till höger. Då visas svaren som punkter (••••••) på projektorn tills alla har lämnat in.",
                q2: "Kan jag skydda elevernas identitet på storskärmen?",
                a2: "Ja! Klicka på Sköld-ikonen (Anonymisera) i svarslistan. Alla namn ersätts då med \"Elev 1\", \"Elev 2\", etc.",
                q3: "Vad händer om en fråga har konstiga tal eller är för svår?",
                a3: "Klicka på Slumpa nya siffror (snurrande pil). Frågan räknas om med nya tal direkt, och elevernas inlämningsruta nollställs i realtid.",
                q4: "Hur döljer jag formelrutan för textuppgifter?",
                a4: "Formeln döljs automatiskt för elever vid problemlösningsuppgifter. Vill du visa den kan du trycka på Formel-knappen i Granska-vyn eller direkt i frågefönstret."
            }
        },
        en: {
            title: "Teacher Guide: Category Clash",
            subtitle: "How to create and run engaging classroom review games",
            tabs: {
                quickstart: "Quick Start (30s)",
                rules: "Rules & Modes",
                faq: "Tips & FAQ"
            },
            close: "Close",
            quickstart: {
                step1_title: "Pick 4 Topics",
                step1_desc: "Select 4 math topics. The generator automatically builds 16 questions with difficulty progressing from 100 to 400 points.",
                step2_title: "Review & Re-roll",
                step2_desc: "Open the Audit tab to review all questions, hide formulas for word problems, or re-roll numbers with a single click.",
                step3_title: "Launch Live",
                step3_desc: "Students join using the 6-digit PIN. Click any tile on the board to beam that question directly to their devices.",
                pro_tip_label: "Pro Tip:",
                pro_tip_text: "Students can join the lobby while you review questions at your own pace under the Setup tab."
            },
            rules: {
                mode_title: "Individual (Solo) vs Team Play",
                mode_desc_solo: "Individual (Default): Students play independently. Points are awarded per correct answer. Ideal for quick formative assessment or warm-ups.",
                mode_desc_team: "Team Play: Set up 2–4 teams on the scoreboard. When a student submits a correct answer, points are credited automatically to their team.",
                clear_title: "How Tiles Are Cleared (Mishap Protection)",
                clear_desc: "Closing a question with X or Cancel leaves the tile active on the board. The tile is only marked done when you click \"Done (Clear tile)\". If cleared by accident, click the dimmed tile to restore and reopen it."
            },
            faq: {
                q1: "How do I hide student answers on the projector screen?",
                a1: "Click the Eye icon (Hide Answers) on the right live panel. Student answers will be masked with dots (••••••) on the projector until everyone has finished.",
                q2: "Can I protect student privacy on the main display?",
                a2: "Yes! Click the Shield icon (Anonymize) in the live responses dock. All student names will be masked as \"Student 1\", \"Student 2\", etc.",
                q3: "What if a question has awkward numbers or is too difficult?",
                a3: "Click Re-roll numbers (rotating arrow). The question immediately recalculates with fresh numbers and resets student answer inputs in real time.",
                q4: "How do I suppress the formula box on word problems?",
                a4: "Formulas are automatically hidden from students on word problems. If you want to reveal them, toggle the Equation button in the Audit view or inside the question stage."
            }
        }
    }[lang] || {};

    return (
        <div className="fixed inset-0 z-[700] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 select-none">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden text-white max-h-[88vh]">
                
                {/* Header */}
                <div className="px-6 sm:px-8 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white leading-tight">
                                {t.title}
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 sm:px-8 gap-2 pt-2 shrink-0">
                    {Object.entries(t.tabs || {}).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                activeTab === key 
                                    ? 'border-indigo-500 text-indigo-400' 
                                    : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 text-sm text-slate-300">
                    
                    {/* TAB 1: QUICKSTART */}
                    {activeTab === 'quickstart' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs">1</div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                        {t.quickstart.step1_title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {t.quickstart.step1_desc}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">2</div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                        {t.quickstart.step2_title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {t.quickstart.step2_desc}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">3</div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                        {t.quickstart.step3_title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {t.quickstart.step3_desc}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-3">
                                <Sparkles size={20} className="shrink-0 text-amber-400" />
                                <span>
                                    <strong>{t.quickstart.pro_tip_label}</strong> {t.quickstart.pro_tip_text}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: RULES & PLAY MODES */}
                    {activeTab === 'rules' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                                    <Users size={15} className="text-indigo-400" />
                                    <span>{t.rules.mode_title}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <strong>{lang === 'sv' ? "Individuellt:" : "Individual:"}</strong> {t.rules.mode_desc_solo}
                                    <br className="my-1" />
                                    <strong>{lang === 'sv' ? "Lagspel:" : "Team Play:"}</strong> {t.rules.mode_desc_team}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                                    <CheckSquare size={15} className="text-emerald-400" />
                                    <span>{t.rules.clear_title}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t.rules.clear_desc}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: FAQ */}
                    {activeTab === 'faq' && (
                        <div className="space-y-3">
                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q1}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a1}
                                </p>
                            </details>

                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q2}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a2}
                                </p>
                            </details>

                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q3}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a3}
                                </p>
                            </details>

                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q4}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a4}
                                </p>
                            </details>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 sm:px-8 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                        {t.close}
                    </button>
                </div>

            </div>
        </div>
    );
}