// src/components/live/teacher/components/FreeTextReviewModal.jsx
import React from 'react';
import { MessageSquare, X } from 'lucide-react';

export default function FreeTextReviewModal({
    response,
    isAnonymous = true,
    onClose,
    lang = 'sv'
}) {
    if (!response) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg border-2 border-blue-200 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                                {isAnonymous ? (lang === 'sv' ? "Elevsvar" : "Student Answer") : response.student_alias}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {lang === 'sv' ? "Uppgift" : "Question"} {response.question_index + 1}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700 text-base leading-relaxed font-medium min-h-[120px] max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {response.answer}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] rounded-xl transition-all cursor-pointer"
                    >
                        {lang === 'sv' ? "Stäng" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
}