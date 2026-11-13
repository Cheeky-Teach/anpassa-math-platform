// src/components/modals/SaveChoiceModal.jsx
import React from 'react';
import { Save, Copy } from 'lucide-react';

export default function SaveChoiceModal({
    isOpen,
    onClose,
    onOverwrite,
    onSaveAsCopy,
    lang = 'sv',
    itemTypeLabel = { sv: 'material', en: 'document' }
}) {
    if (!isOpen) return null;

    const label = itemTypeLabel[lang] || itemTypeLabel.sv;

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-2">
                    {lang === 'sv' ? "Hur vill du spara?" : "How would you like to save?"}
                </h3>
                <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
                    {lang === 'sv'
                        ? `Detta ${label} finns redan sparat. Vill du skriva över originalet eller spara dina ändringar som en ny kopia?`
                        : `This ${label} already exists. Would you like to overwrite the original or save your changes as a new copy?`}
                </p>

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={onOverwrite}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Save size={15} />
                        <span>{lang === 'sv' ? "Skriv över originalet" : "Overwrite original"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onSaveAsCopy}
                        className="w-full py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Copy size={15} />
                        <span>{lang === 'sv' ? "Spara som ny kopia" : "Save as new copy"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}