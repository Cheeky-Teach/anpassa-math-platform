// src/components/activities/shared/CategoryClashHelpModal.jsx
import React, { useState } from 'react';
import { 
    X, Sparkles, LayoutGrid, ListFilter, Shield, 
    RefreshCcw, Eye, HelpCircle, CheckSquare, Users, BookOpen,
    Calculator, Type, SlidersHorizontal
} from 'lucide-react';

export default function CategoryClashHelpModal({ isOpen, onClose, lang = 'sv' }) {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('quickstart'); // 'quickstart' | 'rules' | 'faq'

    const t = {
        sv: {
            title: "Lärarguide: Poängjakten",
            subtitle: "Så skapar och leder du flexibla frågesportsspel med anpassad svårighetsgrad",
            tabs: {
                quickstart: "Snabbstart (30 sek)",
                rules: "Regler & Spellägen",
                faq: "Tips & Frågor"
            },
            close: "Stäng",
            quickstart: {
                step1_title: "1. Välj Storlek & Ämnen",
                step1_desc: "Välj 3–6 kolumner och 3–5 rader. Välj ett matematiskt ämne för varje kolumn och sätt ett eget nivåspann (t.ex. Nivå 1–3 eller Nivå 3–6).",
                step2_title: "2. Blanda Tal & Textuppgifter",
                step2_desc: "Ställ in 'Tal' (ren formel) eller 'Text' (vardagsproblem) per kolumn. Du kan även växla enskilda brickor mellan tal och text inifrån granskningsläget.",
                step3_title: "3. Granska & Starta Live",
                step3_desc: "Eleverna ansluter med en 6-siffrig PIN. Klicka på en bricka för att skicka frågan till elevernas enheter och visa live-svaren i realtid på storskärmen.",
                pro_tip_label: "Proffstips:",
                pro_tip_text: "Eleverna kan vänta i lobbyn medan du granskar frågorna i lugn och ro under fliken 'Förbered / Granska'."
            },
            rules: {
                grid_title: "Flexibelt Bräde & Automatisk Nivåtrappa",
                grid_desc: "Du bestämmer själv hur stort brädet ska vara (3–6 kolumner och 3–5 rader). När du väljer ett start- och slutspann för en kolumn fördelar generatorn automatiskt svårighetsgraden jämnt så att högre poäng alltid motsvarar svårare utmaningar.",
                mix_title: "Blandade Frågetyper (Tal & Textuppgifter)",
                mix_desc: "Du behöver inte välja mellan ett rent mattebräde eller ett renodlat textuppgiftsbräde. Välj 'Tal' på enklare räknesätt och 'Text' på tillämpade områden som räta linjen eller procent. I granskningsläget klickar du bara på 'Gör till text' eller 'Gör till tal' inuti frågefönstret för att justera specifika rutor.",
                mode_title: "Individuellt (Solo) vs Lagspel",
                mode_desc_solo: "Individuellt (Standard): Alla elever spelar för sig själva. Poäng delas ut per korrekt inlämnat svar. Topplistan, streaks och klassens gemensamma energinivå uppdateras live.",
                mode_desc_team: "Lagspel: Skapa 2–4 lag under poängraden. När en elev svarar rätt tilldelas poängen automatiskt till elevens lag.",
                clear_title: "Hur brickor töms (Skydd mot feltryck)",
                clear_desc: "Att stänga en fråga med X eller Avbryt sparar brickan kvar på spelplanen. Först när du klickar på 'Klar (Töm bricka)' gråas rutan ut. Skulle du råka tömma fel bricka klickar du bara på den gråade rutan för att öppna den igen."
            },
            faq: {
                q1: "Hur ändrar jag en enskild fråga till en textuppgift (eller tvärtom)?",
                a1: "Öppna frågan i 'Förbered / Granska'-läget och klicka på knappen 'Gör till text' eller 'Gör till tal' i övre verktygsraden. Frågan räknas om omedelbart och uppdateras på brädet.",
                q2: "Vad betyder etiketterna 'Tal', 'Text' och 'Blandat' på kategorirubrikerna?",
                a2: "De visar snabbt vad kolumnen innehåller: 'Tal' betyder att alla rader är rena formler, 'Text' betyder att hela kolumnen består av vardagsproblem, och 'Blandat' visar att kolumnen har en mix av båda.",
                q3: "Hur döljer jag svaren på projektorn så att eleverna inte ser varandras svar?",
                a3: "Klicka på Ögat (Dölj svar) i svarspanelen till höger. Då visas svaren som punkter (••••••) på projektorn tills alla har lämnat in.",
                q4: "Kan jag skydda elevernas identitet på storskärmen?",
                a4: "Ja! Klicka på Sköld-ikonen (Anonymisera) i svarslistan. Alla namn ersätts då med 'Elev 1', 'Elev 2', etc.",
                q5: "Vad händer om en fråga har konstiga tal eller är för svår?",
                a5: "Klicka på 'Slumpa nya siffror' (snurrande pil). Frågan räknas om med nya tal direkt, och elevernas inlämningsruta nollställs i realtid.",
                q6: "Hur döljer jag formelrutan för en specifik fråga?",
                a6: "Formeln döljs automatiskt för elever vid textuppgifter. Vill du manuellt dölja eller visa formeln eller frågetexten trycker du på Formel- eller Text-knappen i verktygsraden längst upp i frågefönstret."
            }
        },
        en: {
            title: "Teacher Guide: Category Clash",
            subtitle: "How to create and run flexible trivia review games with custom progression",
            tabs: {
                quickstart: "Quick Start (30s)",
                rules: "Rules & Board Setup",
                faq: "Tips & FAQ"
            },
            close: "Close",
            quickstart: {
                step1_title: "1. Pick Size & Topics",
                step1_desc: "Choose 3–6 columns and 3–5 rows. Assign a math topic to each column and set custom level bounds (e.g., Levels 1–3 or Levels 3–6).",
                step2_title: "2. Mix Math & Story Problems",
                step2_desc: "Toggle 'Math' (pure formula) or 'Story' (applied word problem) per column. You can also flip individual tiles between math and text inside the inspect modal.",
                step3_title: "3. Review & Launch Live",
                step3_desc: "Students join using a 6-digit PIN. Click any tile to beam the problem directly to student screens and monitor incoming responses live on the projector.",
                pro_tip_label: "Pro Tip:",
                pro_tip_text: "Students can join the lobby while you review questions at your own pace under the 'Setup / Curate' tab."
            },
            rules: {
                grid_title: "Flexible Grid & Stepped Difficulty",
                grid_desc: "You can freely customize board dimensions (3–6 columns and 3–5 rows). When you set a level range for a column, the generator evenly distributes difficulty so higher point tiers correlate with tougher math challenges.",
                mix_title: "Heterogeneous Boards (Math & Story Problems)",
                mix_desc: "You never have to choose between an all-formula or all-word-problem board. Set 'Math' for rapid mental arithmetic columns and 'Story' for applied topics like linear graphs or percentage. In curate mode, simply tap 'Story' or 'Formula' inside any tile stage to adjust specific questions.",
                mode_title: "Individual (Solo) vs Team Play",
                mode_desc_solo: "Individual (Default): Students play on their own. Points are credited upon correct submission. The Top 7 leaderboard, streaks, and class energy pool track progress live.",
                mode_desc_team: "Team Play: Set up 2–4 teams on the scoreboard. When a student submits a correct answer, points are awarded directly to their team's score.",
                clear_title: "How Tiles Are Cleared (Mishap Protection)",
                clear_desc: "Closing a question with X or Cancel leaves the tile active on the board. The tile is only cleared when you click 'Done (Clear tile)'. If cleared by accident, click the dimmed tile to reopen and restore it."
            },
            faq: {
                q1: "How do I turn a single question into a word problem (or back to math)?",
                a1: "Open the question in 'Setup / Curate' mode and click the 'Story' or 'Formula' button in the top toolbar. The question immediately recalculates and updates the board.",
                q2: "What do the 'Math', 'Story', and 'Mixed' badges on category headers mean?",
                a2: "They give a quick overview of the column's contents: 'Math' means every row is a formula, 'Story' indicates word problems throughout, and 'Mixed' highlights that individual tiles have been flipped.",
                q3: "How do I hide student answers on the projector screen?",
                a3: "Click the Eye icon (Hide Answers) on the right live panel. Student answers will be masked with dots (••••••) on the projector until everyone has finished.",
                q4: "Can I protect student privacy on the main display?",
                a4: "Yes! Click the Shield icon (Anonymize) in the live responses dock. All student names will be masked as 'Student 1', 'Student 2', etc.",
                q5: "What if a question has awkward numbers or is too difficult?",
                a5: "Click 'Re-roll numbers' (rotating arrow). The question immediately recalculates with fresh numbers and resets student inputs in real time.",
                q6: "How do I suppress the formula box on a specific question?",
                a6: "Formulas are automatically hidden from students on word problems. To manually hide or reveal formulas or text descriptions, toggle the Equation or Text button in the question modal's top bar."
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
                                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs">
                                        <LayoutGrid size={13} />
                                    </div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                        {t.quickstart.step1_title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {t.quickstart.step1_desc}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                                        <Type size={13} />
                                    </div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                        {t.quickstart.step2_title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {t.quickstart.step2_desc}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                                        <Sparkles size={13} />
                                    </div>
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
                                    <SlidersHorizontal size={15} className="text-indigo-400" />
                                    <span>{t.rules.grid_title}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t.rules.grid_desc}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                                    <Type size={15} className="text-amber-400" />
                                    <span>{t.rules.mix_title}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {t.rules.mix_desc}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                                    <Users size={15} className="text-emerald-400" />
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
                                    <CheckSquare size={15} className="text-amber-400" />
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

                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q5}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a5}
                                </p>
                            </details>

                            <details className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <summary className="font-bold text-xs text-white uppercase cursor-pointer flex items-center justify-between">
                                    <span>{t.faq.q6}</span>
                                    <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                                    {t.faq.a6}
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