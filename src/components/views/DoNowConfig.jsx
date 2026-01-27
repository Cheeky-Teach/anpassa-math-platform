import React, { useState } from 'react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';

const DoNowConfig = ({ ui, onBack, onGenerate, lang }) => {
    const [selected, setSelected] = useState([]);

    const handleToggle = (topicId, level) => {
        setSelected(prev => {
            const exists = prev.find(p => p.topic === topicId && p.level === level);
            if (exists) {
                return prev.filter(p => !(p.topic === topicId && p.level === level));
            } else {
                if (prev.length >= 3) return prev; // Max 3
                return [...prev, { topic: topicId, level }];
            }
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2">
                    <span>←</span> {ui.backBtn}
                </button>
                <h2 className="text-2xl font-bold text-slate-800">{ui.donow_title}</h2>
                <button
                    onClick={() => onGenerate(selected)}
                    disabled={selected.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                >
                    {ui.donow_gen} ({selected.length}/3)
                </button>
            </div>

            <p className="text-slate-500 mb-6 text-center">{ui.donow_desc}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-10">
                {Object.entries(CATEGORIES).map(([catKey, category]) => (
                    <div key={catKey} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">{category.label[lang]}</h3>
                        <div className="space-y-4">
                            {category.topics.map(topic => (
                                <div key={topic.id}>
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">{topic.label[lang]}</div>
                                    <div className="flex flex-col gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => {
                                            if (!LEVEL_DESCRIPTIONS[topic.id]?.[lvl]) return null;
                                            const isSelected = selected.some(s => s.topic === topic.id && s.level === lvl);
                                            return (
                                                <button
                                                    key={lvl}
                                                    onClick={() => handleToggle(topic.id, lvl)}
                                                    className={`text-sm py-2 px-3 rounded border transition-all text-left flex items-center gap-2 ${isSelected ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-bold ring-1 ring-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                                >
                                                    <span className="font-mono font-bold w-6 text-center bg-white/50 rounded">{lvl}</span>
                                                    <span className="truncate">{LEVEL_DESCRIPTIONS[topic.id][lvl][lang]}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoNowConfig;