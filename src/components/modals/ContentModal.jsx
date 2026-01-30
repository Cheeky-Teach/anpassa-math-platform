import React from 'react';
import { CONTENT_MAP } from '../../constants/content_map';

const ContentModal = ({ visible, onClose }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-bounce-in border border-slate-200">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Innehållsförteckning</h2>
                        <p className="text-slate-500 text-sm mt-1">Översikt över alla områden och nivåer</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-12">
                        {Object.entries(CONTENT_MAP).map(([catKey, category]) => (
                            <div key={catKey}>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-6">
                                    {category.title}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {category.topics.map(topic => (
                                        <div key={topic.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-indigo-100 transition-colors">
                                            <h4 className="font-bold text-indigo-700 mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                {topic.title}
                                            </h4>
                                            
                                            <div className="space-y-3">
                                                {topic.levels.map(lvl => (
                                                    <div key={lvl.lvl} className="flex items-start gap-3 text-sm">
                                                        <div className="font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs mt-0.5">
                                                            {lvl.lvl}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-700">{lvl.desc}</div>
                                                            <div className="text-slate-500 text-xs italic mt-0.5">Ex: {lvl.ex}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentModal;