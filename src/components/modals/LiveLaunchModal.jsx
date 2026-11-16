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
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-main)]">
                
                {/* MODAL HEADER */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--border-main)] shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-4 ring-rose-100 dark:ring-rose-950/60 animate-pulse shrink-0" />
                        <div>
                            <h3 className="text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-none">
                                {lang === 'sv' ? "Starta Live Session" : "Launch Live Session"}
                            </h3>
                            <p className="text-xs font-semibold text-[var(--text-muted)] mt-1">
                                {lang === 'sv' 
                                    ? "Konfigurera sessionen i 3 enkla steg: Tempo → Arbetsyta → Återkoppling" 
                                    : "Configure your session in 3 clear steps: Pacing → Work Area → Feedback"}
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* CONTEXTUAL CANVAS HINT */}
                {hasDrawings && !enableCanvas && (
                    <div className="mt-4 p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between gap-3 text-xs shrink-0 shadow-2xs">
                        <div className="flex items-center gap-2.5 text-sky-950 dark:text-sky-100 font-semibold">
                            <Monitor size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
                            <span>
                                {lang === 'sv' 
                                    ? "Tavlan innehåller ritade figurer eller laborativt material. Vill du låta eleverna rita och svara direkt på tavlan?" 
                                    : "This board contains figures or manipulatives. Enable the drawing canvas so students can interact directly?"}
                            </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => { setEnableCanvas(true); setResponseStyle('flexible'); }}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider shrink-0 transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                        >
                            {lang === 'sv' ? "Aktivera Rityta" : "Enable Canvas"}
                        </button>
                    </div>
                )}

                {/* 3-COLUMN BODY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-5 overflow-y-auto custom-scrollbar flex-1 items-start">
                    
                    {/* COLUMN 1: TEMPO & ORDNING */}
                    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] p-4 space-y-3.5">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
                            <span className="w-5 h-5 rounded-md bg-sky-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                                1
                            </span>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                {lang === 'sv' ? "Tempo & Ordning" : "Pacing & Order"}
                            </span>
                        </div>

                        <div className="space-y-2 flex-1">
                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'open' })}
                                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'open' 
                                        ? 'border-sky-600 bg-[var(--bg-card)] shadow-2xs ring-1 ring-sky-600' 
                                        : 'border-[var(--border-main)] bg-[var(--bg-card)] hover:border-sky-400'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-[var(--text-main)] flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Öppet (Egen takt)" : "Open (Free Pacing)"}</span>
                                    {liveSettings.pacing === 'open' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                                </div>
                                <div className="text-[11px] font-medium leading-tight mt-1 text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Elever bläddrar fritt fram och tillbaka." : "Students navigate freely back and forth."}
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'progressive' })}
                                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'progressive' 
                                        ? 'border-sky-600 bg-[var(--bg-card)] shadow-2xs ring-1 ring-sky-600' 
                                        : 'border-[var(--border-main)] bg-[var(--bg-card)] hover:border-sky-400'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-[var(--text-main)] flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Låst (En i taget)" : "Progressive"}</span>
                                    {liveSettings.pacing === 'progressive' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                                </div>
                                <div className="text-[11px] font-medium leading-tight mt-1 text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Måste svara för att gå vidare." : "Answer required to advance. No return."}
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setLiveSettings({ ...liveSettings, pacing: 'teacher', order: 'original' })}
                                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    liveSettings.pacing === 'teacher' 
                                        ? 'border-sky-600 bg-[var(--bg-card)] shadow-2xs ring-1 ring-sky-600' 
                                        : 'border-[var(--border-main)] bg-[var(--bg-card)] hover:border-sky-400'
                                }`}
                            >
                                <div className="font-bold text-xs uppercase tracking-tight text-[var(--text-main)] flex items-center justify-between">
                                    <span>{lang === 'sv' ? "Lärarstyrd" : "Teacher-Led"}</span>
                                    {liveSettings.pacing === 'teacher' && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                                </div>
                                <div className="text-[11px] font-medium leading-tight mt-1 text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Du byter uppgift för hela klassen samtidigt." : "Synchronized whole-class pacing."}
                                </div>
                            </button>
                        </div>

                        <div className="pt-3 border-t border-[var(--border-main)]">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1.5 block">
                                {lang === 'sv' ? "Uppgiftsordning" : "Order"}
                            </label>
                            <div className="grid grid-cols-2 gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-main)]">
                                <button 
                                    type="button"
                                    onClick={() => setLiveSettings({ ...liveSettings, order: 'original' })}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                        liveSettings.order === 'original' 
                                            ? 'bg-sky-600 text-white shadow-2xs font-extrabold' 
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {lang === 'sv' ? "Normal" : "Default"}
                                </button>
                                <button 
                                    type="button"
                                    disabled={liveSettings.pacing === 'teacher'}
                                    onClick={() => setLiveSettings({ ...liveSettings, order: 'randomized' })}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all disabled:opacity-40 cursor-pointer ${
                                        liveSettings.order === 'randomized' 
                                            ? 'bg-sky-600 text-white shadow-2xs font-extrabold' 
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {lang === 'sv' ? "Slumpad" : "Shuffle"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: ELEVENS ARBETSGÅNG */}
                    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] p-4 space-y-3.5">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                                2
                            </span>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                {lang === 'sv' ? "Elevens Arbetsyta" : "Student Work Area"}
                            </span>
                        </div>

                        <div className="space-y-2.5 flex-1">
                            <label className="p-3 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-emerald-500 rounded-xl flex items-center justify-between gap-3 shadow-2xs cursor-pointer transition-colors">
                                <div>
                                    <div className="text-xs font-bold uppercase text-[var(--text-main)]">
                                        {lang === 'sv' ? "Kladdpapper" : "Math Scratchpad"}
                                    </div>
                                    <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Steg-för-steg matematiska rader" : "Step-by-step arithmetic lines"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={enableScratchpad}
                                    onChange={e => setEnableScratchpad(e.target.checked)}
                                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                />
                            </label>

                            <label className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-colors shadow-2xs cursor-pointer ${
                                enableCanvas 
                                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500' 
                                    : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-emerald-400'
                            }`}>
                                <div>
                                    <div className="text-xs font-bold uppercase text-[var(--text-main)] flex items-center gap-1.5">
                                        {lang === 'sv' ? "Interaktiv Rityta" : "Interactive Canvas"}
                                        <span className="text-[9px] bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Valfri</span>
                                    </div>
                                    <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Rita, manipulera figurer & tavla" : "Draw & use digital manipulatives"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={enableCanvas}
                                    onChange={e => setEnableCanvas(e.target.checked)}
                                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                />
                            </label>
                        </div>

                        {(enableScratchpad || enableCanvas) && (
                            <div className="pt-3 border-t border-[var(--border-main)]">
                                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1.5 block">
                                    {lang === 'sv' ? "Krav på arbetsgång" : "Required Format"}
                                </label>
                                <select 
                                    value={responseStyle} 
                                    onChange={e => setResponseStyle(e.target.value)}
                                    className="w-full p-2 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl text-xs font-semibold text-[var(--text-main)] outline-none cursor-pointer focus:border-emerald-600 transition-colors"
                                >
                                    <option value="flexible">{lang === 'sv' ? "Valfri (Visa alla valda verktyg)" : "Flexible (Show all enabled)"}</option>
                                    <option value="answer_only">{lang === 'sv' ? "Bara slutsvar (Dölj arbetsytor)" : "Final answer only"}</option>
                                    {enableScratchpad && <option value="scratchpad_only">{lang === 'sv' ? "Endast Kladdpapper" : "Scratchpad only"}</option>}
                                    {enableCanvas && <option value="canvas_only">{lang === 'sv' ? "Endast Rityta" : "Canvas only"}</option>}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* COLUMN 3: ÅTERKOPPLING */}
                    <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] p-4 space-y-3.5">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
                            <span className="w-5 h-5 rounded-md bg-amber-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                                3
                            </span>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                {lang === 'sv' ? "Återkoppling & Slut" : "Feedback & Finish"}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1">
                            <label className="p-3 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-amber-500 rounded-xl flex items-center justify-between gap-3 shadow-2xs cursor-pointer transition-colors">
                                <div>
                                    <div className="text-xs font-bold uppercase text-[var(--text-main)]">
                                        {lang === 'sv' ? "Resultatsöversikt" : "Final Summary"}
                                    </div>
                                    <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight mt-0.5">
                                        {lang === 'sv' ? "Låt elever granska sina svar efteråt" : "Show answer review at end"}
                                    </div>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={liveSettings.summary}
                                    onChange={e => setLiveSettings({ ...liveSettings, summary: e.target.checked })}
                                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                                />
                            </label>

                            <div className="callout callout-warning text-[11px] leading-relaxed">
                                <Info size={14} className="inline mr-1.5 -mt-0.5 text-amber-600 dark:text-amber-400" />
                                {lang === 'sv'
                                    ? "Elever ser endast sina egna svar. Du som lärare har full översikt i realtid på storskärmen via lärarvyn."
                                    : "Students only see their own answers. You monitor all student progress live from the teacher dashboard."}
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="pt-4 border-t border-[var(--border-main)] flex items-center justify-between gap-3 shrink-0">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>

                    <button 
                        type="button"
                        onClick={handleConfirm}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <Send size={15} />
                        <span>{lang === 'sv' ? "Starta Live Session" : "Start Live Session"}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}