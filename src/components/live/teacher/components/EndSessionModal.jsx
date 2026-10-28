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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 no-print">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-b-8 border-indigo-100">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-900">
                        {lang === 'sv' ? "Avsluta Session" : "End Session"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
                        <X />
                    </button>
                </div>
                <div className="p-8 space-y-4">
                    <button 
                        onClick={() => { onOpenPrintReport(); onClose(); }} 
                        className="w-full group p-6 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-600 rounded-3xl text-left transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Printer size={20}/></div>
                            <span className="font-black uppercase tracking-tight text-indigo-900 text-lg">
                                {lang === 'sv' ? "Utskriftsvänlig Rapport" : "Printable Report"}
                            </span>
                        </div>
                        <p className="text-indigo-600/60 text-xs font-bold leading-relaxed ml-14">
                            {lang === 'sv' ? "Genererar en kompakt A4-översikt i liggande format." : "Generates a compact A4 overview in landscape format."}
                        </p>
                    </button>

                    <button 
                        onClick={copyToClipboard} 
                        className="w-full group p-6 bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-600 rounded-3xl text-left transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Copy size={20}/></div>
                            <span className="font-black uppercase tracking-tight text-emerald-900 text-lg">
                                {lang === 'sv' ? "Kopiera Tabell" : "Copy Table"}
                            </span>
                        </div>
                        <p className="text-emerald-600/60 text-xs font-bold leading-relaxed ml-14">
                            {lang === 'sv' ? "Klistra in resultatet direkt i Word eller Excel." : "Paste the result directly into Word or Excel."}
                        </p>
                    </button>

                    <button 
                        onClick={handleEndSession} 
                        disabled={isClosing} 
                        className="w-full group p-6 bg-slate-50 border-2 border-slate-100 hover:border-slate-900 rounded-3xl text-left transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                                {isClosing ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            </div>
                            <span className="font-black uppercase tracking-tight text-slate-900 text-lg">
                                {lang === 'sv' ? "Stäng & Arkivera (7 dagar)" : "Close & Archive (7 days)"}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed ml-14">
                            {lang === 'sv' ? "Rensas automatiskt efter 7 dagar." : "Automatically cleared after 7 days."}
                        </p>
                    </button>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end items-center border-t border-slate-100">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}