// src/components/live/teacher/components/EndSessionModal.jsx
import React from 'react';
import { X, Printer, Copy, Save, Loader2 } from 'lucide-react';

export default function EndSessionModal({
    engine,
    isOpen,
    onClose,
    onOpenPrintReport,
    lang = 'sv'
}) {
    if (!isOpen) return null;

    const { livePacket, responses, students, isClosing, handleEndSession } = engine;

    const copyToClipboard = async () => {
        let tableHTML = `<table border="1" style="border-collapse: collapse; font-family: sans-serif; font-size: 11px;">
            <thead style="background: #f1f5f9;">
                <tr><th style="padding: 6px; text-align: left;">Elev</th><th style="padding: 6px;">Resultat</th>`;
        livePacket.forEach((_, i) => tableHTML += `<th style="padding: 4px; width: 25px; text-align: center;">${i+1}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        let plainText = `Elev\tResultat\t${livePacket.map((_, i) => i + 1).join('\t')}\n`;

        students.forEach(student => {
            const studentResps = livePacket.map((_, qIdx) => responses.find(r => r.student_alias === student && r.question_index === qIdx));
            const score = studentResps.filter(r => r?.is_correct).length;
            tableHTML += `<tr><td style="padding: 6px; font-weight: bold;">${student}</td><td style="padding: 6px; text-align: center;">${score}/${livePacket.length}</td>`;
            plainText += `${student}\t${score}/${livePacket.length}`;

            studentResps.forEach(r => {
                const symbol = r ? (r.is_correct ? '✓' : '✕') : '-';
                const color = r ? (r.is_correct ? '#10b981' : '#f43f5e') : '#94a3b8';
                tableHTML += `<td style="padding: 4px; color: ${color}; text-align: center; font-weight: bold;">${symbol}</td>`;
                plainText += `\t${symbol}`;
            });
            tableHTML += `</tr>`;
            plainText += `\n`;
        });
        tableHTML += `</tbody></table>`;

        try {
            if (navigator?.clipboard?.write && window.ClipboardItem) {
                const blob = new Blob([tableHTML], { type: 'text/html' });
                const item = new ClipboardItem({ 'text/html': blob });
                await navigator.clipboard.write([item]);
            } else {
                await navigator.clipboard.writeText(plainText);
            }
            alert(lang === 'sv' ? "Kompakt tabell har kopierats!" : "Compact table copied!");
        } catch {
            try {
                await navigator.clipboard.writeText(plainText);
                alert(lang === 'sv' ? "Kopierat som text (HTML blockerades)." : "Copied as plain text (HTML blocked).");
            } catch {
                alert(lang === 'sv' ? "Kunde inte kopiera." : "Could not copy.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans no-print">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-xl rounded-2xl shadow-2xl border border-[var(--border-strong)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0 shadow-2xs">
                    <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                            Anpassa Studio
                        </span>
                        <h2 className="text-base font-extrabold tracking-tight text-[var(--text-main)]">
                            {lang === 'sv' ? "Avsluta Session" : "End Session"}
                        </h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer border border-[var(--border-main)] shadow-2xs"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content Options */}
                <div className="p-6 space-y-3.5 bg-[var(--bg-canvas)]">
                    {/* Option 1: Print Report */}
                    <button 
                        type="button"
                        onClick={() => { onOpenPrintReport(); onClose(); }} 
                        className="w-full group p-4 bg-[var(--bg-card)] hover:border-sky-500 border border-[var(--border-strong)] rounded-xl text-left transition-all cursor-pointer shadow-2xs flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 shadow-2xs">
                            <Printer size={18}/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)] block mb-0.5">
                                {lang === 'sv' ? "Utskriftsvänlig Rapport" : "Printable Report"}
                            </span>
                            <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">
                                {lang === 'sv' ? "Genererar en kompakt A4-översikt i liggande format." : "Generates a compact A4 overview in landscape format."}
                            </p>
                        </div>
                    </button>

                    {/* Option 2: Copy Table */}
                    <button 
                        type="button"
                        onClick={copyToClipboard} 
                        className="w-full group p-4 bg-[var(--bg-card)] hover:border-emerald-500 border border-[var(--border-strong)] rounded-xl text-left transition-all cursor-pointer shadow-2xs flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                            <Copy size={18}/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)] block mb-0.5">
                                {lang === 'sv' ? "Kopiera Tabell" : "Copy Table"}
                            </span>
                            <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">
                                {lang === 'sv' ? "Klistra in resultatet direkt i Word eller Excel." : "Paste the result directly into Word or Excel."}
                            </p>
                        </div>
                    </button>

                    {/* Option 3: Close & Archive */}
                    <button 
                        type="button"
                        onClick={handleEndSession} 
                        disabled={isClosing} 
                        className="w-full group p-4 bg-[var(--bg-card)] hover:border-slate-500 border border-[var(--border-strong)] rounded-xl text-left transition-all disabled:opacity-50 cursor-pointer shadow-2xs flex items-center gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] flex items-center justify-center shrink-0 shadow-2xs">
                            {isClosing ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)] block mb-0.5">
                                {lang === 'sv' ? "Stäng & Arkivera (7 dagar)" : "Close & Archive (7 days)"}
                            </span>
                            <p className="text-[11px] font-medium text-[var(--text-muted)] truncate">
                                {lang === 'sv' ? "Rensas automatiskt efter 7 dagar." : "Automatically cleared after 7 days."}
                            </p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex justify-end items-center shrink-0 shadow-2xs">
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="px-5 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}