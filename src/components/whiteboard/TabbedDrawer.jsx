// src/components/whiteboard/TabbedDrawer.jsx
import React, { useState } from 'react';
import IntegerCounterBin from './tools/manipulatives/IntegerCounterBin';
import BaseTenBlocksBin from './tools/manipulatives/BaseTenBlocksBin';
import AlgebraTileBin from './tools/manipulatives/AlgebraTileBin';
import { CircleDot, Box, Layers } from 'lucide-react';

export default function TabbedDrawer({ 
    onSpawn, 
    lang = 'sv',
    showDividingLine = true,
    elements = [],
    setElements = () => {},
    selectedIds = [],
    setSelectedIds = () => {}
}) {
    const [activeMode, setActiveMode] = useState('counters');

    const modes = {
        counters: {
            label: { sv: "Markörer", en: "Counters" },
            icon: CircleDot,
            component: IntegerCounterBin
        },
        base10: {
            label: { sv: "Bas-10", en: "Base-10" },
            icon: Box,
            component: BaseTenBlocksBin
        },
        algebra: {
            label: { sv: "Algebra", en: "Algebra" },
            icon: Layers,
            component: AlgebraTileBin
        }
    };

    const ActiveComponent = modes[activeMode].component;

    return (
        <div className="flex flex-col gap-3 w-full font-sans select-none animate-in fade-in slide-in-from-right-4 duration-200">
            {/* 🟢 Distinct, Compact Segmented Tab Pill Strip */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200/80">
                {Object.keys(modes).map((mode) => {
                    const item = modes[mode];
                    const Icon = item.icon;
                    const isActive = activeMode === mode;

                    return (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setActiveMode(mode)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[11px] font-black transition-all cursor-pointer active:scale-95 ${
                                isActive 
                                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                            }`}
                        >
                            <Icon size={14} className={isActive ? 'text-indigo-600 shrink-0' : 'text-slate-400 shrink-0'} />
                            <span className="truncate">
                                {item.label[lang] || item.label.sv}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-3 min-h-0 custom-scrollbar">
                <ActiveComponent 
                    onSpawn={onSpawn}
                    elements={elements}
                    setElements={setElements}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    lang={lang}
                    showDivider={showDividingLine}
                />
            </div>
        </div>
    );
}