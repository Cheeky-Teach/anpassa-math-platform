// src/components/modals/LiveLaunchModal.jsx
import React, { useState } from 'react';
import { X, Send, Monitor, Info } from 'lucide-react';

export default function LiveLaunchModal({
    isOpen,
    onClose,
    onConfirm,
    packetCount = 0,
    hasDrawings = false,
    lang = 'sv',
    initialSettings = {}
}) {
    // Session configuration states
    const [liveSettings, setLiveSettings] = useState({
        pacing: initialSettings.pacing || 'open',
        order: initialSettings.order || 'original',
        summary: initialSettings.summary !== false
    });
    const [enableScratchpad, setEnableScratchpad] = useState(
        initialSettings.allowScratchpad ?? (initialSettings.scratchpad !== false)
    );
    const [enableCanvas, setEnableCanvas] = useState(
        initialSettings.allowCanvas === true
    );
    const [responseStyle, setResponseStyle] = useState(
        initialSettings.responseStyle || 'flexible'
    );

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            ...liveSettings,
            scratchpad: enableScratchpad,
            allowScratchpad: enableScratchpad,
            allowCanvas: enableCanvas,
            responseStyle
        });
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-5xl flex flex-col max-h-[94vh] overflow-hidden text-slate-800 dark:text-slate-100">
                
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-950/60 animate-pulse" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">
                                {lang === 'sv' ? "Starta Live Session" : "Launch Live Session"}
                            </h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                            {lang === 'sv' 
                                ? "Konfigurera sessionen i 3 enkla steg: Tempo → Arbetsyta → Återkoppling" 
                                : "Configure your session in 3 clear steps: Pacing → Work Area → Feedback"}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={22}/>
                    </button>
                </div>

                {/* CONTEXTUAL CANVAS HINT */}
                {hasDrawings && !enableCanvas && (
                    <div className="mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 text-xs shrink-0 shadow-sm">
                        <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200 font-bold">
                            <Monitor size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>
                                {lang === 'sv' 
                                    ? "Tavlan innehåller ritade figurer eller laborativt material. Vill du låta eleverna rita och svara direkt på tavlan?" 
                                    : "This board contains figures or manipulatives. Enable the drawing canvas so students can interact directly?"}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => { setEnableCanvas(true); setResponseStyle('flexible'); }}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm"
                        >
                            {lang === 'sv' ? "Aktivera Rityta" : "Enable Canvas"}
                        </button>
                    </div>
                )}

                {/* 3-COLUMN BODY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6 overflow-y-auto custom-scrollbar flex-1 items-start">
                    
                    {/* KOLUMN 1: TEMPO & ORDNING */}
                    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 p-4 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-blue-100 dark:border-blue-900/40">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                                1
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                                {lang === 'sv' ? "Tempo & Ordning" : "Pacing & Order"}
                            </span>
                        </div>

                        <div className="space-y-2 flex-1">
                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'open' })}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'open' 
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 shadow-sm ring-1 ring-blue-500' 
                                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Öppet (Egen takt)" : "Open (Free Pacing)"}</span>
                                    {liveSettings.pacing === 'open' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                                <div className="text-[10px] font-medium leading-tight mt-1 text-slate-500 dark:text-slate-400">
                                    {lang === 'sv' ? "Elever bläddrar fritt fram och tillbaka." : "Students navigate freely back and forth."}
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'progressive' })}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'progressive' 
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 shadow-sm ring-1 ring-blue-500' 
                                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Låst (En i taget)" : "Progressive"}</span>
                                    {liveSettings.pacing === 'progressive' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                                <div className="text-[10px] font-medium leading-tight mt-1 text-slate-500 dark:text-slate-400">
                                    {lang === 'sv' ? "Måste svara för att gå vidare." : "Answer required to advance. No return."}
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'teacher', order: 'original' })}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'teacher' 
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 shadow-sm ring-1 ring-blue-500' 
                                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Lärarstyrd" : "Teacher-Led"}</span>
                                    {liveSettings.pacing === 'teacher' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                                <div className="text-[10px] font-medium leading-tight mt-1 text-slate-500 dark:text-slate-400">
                                    {lang === 'sv' ? "Du byter uppgift för hela klassen samtidigt." : "Synchronized whole-class pacing."}
                                </div>
                            </button>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80">
                            <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider mb-2 block">
                                {lang === 'sv' ? "Uppgiftsordning" : "Order"}
                            </label>
                            <div className="grid grid-cols-2 gap-1.5 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button 
                                    type="button"
                                    onClick={() => setLiveSettings({ ...liveSettings, order: 'original' })}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                        liveSettings.order === 'original' 
                                            ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm font-black' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {lang === 'sv' ? "Normal" : "Default"}
                                </button>
                                <button 
                                    type="button"
                                    disabled={liveSettings.pacing === 'teacher'}
                                    onClick={() => setLiveSettings({ ...liveSettings, order: 'randomized' })}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-40 cursor-pointer ${
                                        liveSettings.order === 'randomized' 
                                            ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-sm font-black' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {lang === 'sv' ? "Slumpad" : "Shuffle"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* KOLUMN 2: ELEVENS ARBETSGÅNG */}
                    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 p-4 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                                2
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                                {lang === 'sv' ? "Elevens Arbetsyta" : "Student Work Area"}
                            </span>
                        </div>

                        <div className="space-y-2.5 flex-1">
                            <label className="p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl flex items-center justify-between gap-3 shadow-sm cursor-pointer transition-colors">
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                                        {lang === 'sv' ? "Kladdpapper" : "Math Scratchpad"}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Steg-för-steg matematiska rader" : "Step-by-step arithmetic lines"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={enableScratchpad}
                                    onChange={e => setEnableScratchpad(e.target.checked)}
                                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                                />
                            </label>

                            <label className={`p-3.5 border-2 rounded-xl flex items-center justify-between gap-3 transition-colors shadow-sm cursor-pointer ${
                                enableCanvas 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                            }`}>
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                                        {lang === 'sv' ? "Interaktiv Rityta" : "Interactive Canvas"}
                                        <span className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Valfri</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Rita, manipulera figurer & tavla" : "Draw & use digital manipulatives"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={enableCanvas}
                                    onChange={e => setEnableCanvas(e.target.checked)}
                                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                                />
                            </label>
                        </div>

                        {(enableScratchpad || enableCanvas) && (
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80">
                                <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider mb-2 block">
                                    {lang === 'sv' ? "Krav på arbetsgång" : "Required Format"}
                                </label>
                                <select 
                                    value={responseStyle} 
                                    onChange={e => setResponseStyle(e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer focus:border-emerald-500 transition-colors"
                                >
                                    <option value="flexible">{lang === 'sv' ? "Valfri (Visa alla valda verktyg)" : "Flexible (Show all enabled)"}</option>
                                    <option value="answer_only">{lang === 'sv' ? "Bara slutsvar (Dölj arbetsytor)" : "Final answer only"}</option>
                                    {enableScratchpad && <option value="scratchpad_only">{lang === 'sv' ? "Endast Kladdpapper" : "Scratchpad only"}</option>}
                                    {enableCanvas && <option value="canvas_only">{lang === 'sv' ? "Endast Rityta" : "Canvas only"}</option>}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* KOLUMN 3: ÅTERKOPPLING */}
                    <div className="flex flex-col h-full bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border-2 border-amber-200 dark:border-amber-900/60 p-4 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-amber-100 dark:border-amber-900/40">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                                3
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                {lang === 'sv' ? "Återkoppling & Slut" : "Feedback & Finish"}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1">
                            <label className="p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 rounded-xl flex items-center justify-between gap-3 shadow-sm cursor-pointer transition-colors">
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                                        {lang === 'sv' ? "Resultatsöversikt" : "Final Summary"}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Låt elever granska sina svar efteråt" : "Show answer review at end"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={liveSettings.summary}
                                    onChange={e => setLiveSettings({ ...liveSettings, summary: e.target.checked })}
                                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                                />
                            </label>

                            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed shadow-xs">
                                <Info size={16} className="inline mr-1.5 -mt-0.5 text-amber-600 dark:text-amber-400" />
                                {lang === 'sv'
                                    ? "Elever ser endast sina egna svar. Du som lärare har full översikt i realtid på storskärmen via lärarvyn."
                                    : "Students only see their own answers. You monitor all student progress live from the teacher dashboard."}
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>

                    <button 
                        type="button"
                        onClick={handleConfirm}
                        className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                        <Send size={16} />
                        {lang === 'sv' ? "Starta Live Session" : "Start Live Session"}
                    </button>
                </div>

            </div>
        </div>
    );
}