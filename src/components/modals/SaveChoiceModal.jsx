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
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-[var(--border-strong)] text-[var(--text-main)] animate-in zoom-in-95 duration-150">
                <h3 className="text-sm font-extrabold text-[var(--text-main)] uppercase tracking-wider mb-2">
                    {lang === 'sv' ? "Hur vill du spara?" : "How would you like to save?"}
                </h3>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-5 leading-relaxed">
                    {lang === 'sv'
                        ? `Detta ${label} finns redan sparat. Vill du skriva över originalet eller spara dina ändringar som en ny kopia?`
                        : `This ${label} already exists. Would you like to overwrite the original or save your changes as a new copy?`}
                </p>

                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={onOverwrite}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                        <Save size={15} />
                        <span>{lang === 'sv' ? "Skriv över originalet" : "Overwrite original"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onSaveAsCopy}
                        className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Copy size={15} />
                        <span>{lang === 'sv' ? "Spara som ny kopia" : "Save as new copy"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}