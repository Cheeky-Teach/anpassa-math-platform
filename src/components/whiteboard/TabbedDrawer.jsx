// src/components/whiteboard/TabbedDrawer.jsx
import React, { useState } from 'react';
import IntegerCounterBin from './tools/manipulatives/IntegerCounterBin';
import BaseTenBlocksBin from './tools/manipulatives/BaseTenBlocksBin';
import AlgebraTileBin from './tools/manipulatives/AlgebraTileBin';

export default function TabbedDrawer({ 
    onSpawn, 
    lang = 'sv',
    showDividingLine = true,
    elements = [],
    setElements = () => {}
}) {
    const [activeMode, setActiveMode] = useState('counters');

    const modes = {
        counters: {
            label: { sv: "Räknemarkörer", en: "Counters" },
            component: IntegerCounterBin
        },
        base10: {
            label: { sv: "Bas-10", en: "Base-10" },
            component: BaseTenBlocksBin
        },
        algebra: {
            label: { sv: "Algebrabrickor", en: "Algebra Tiles" },
            component: AlgebraTileBin
        }
    };

    const ActiveComponent = modes[activeMode].component;

        return (
        <div className="flex flex-col gap-3 w-full font-sans select-none animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {Object.keys(modes).map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => setActiveMode(mode)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                            activeMode === mode 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {modes[mode].label[lang] || modes[mode].label.sv}
                    </button>
                ))}
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-3 min-h-0 custom-scrollbar">
                <ActiveComponent 
                    onSpawn={onSpawn}
                    elements={elements}
                    setElements={setElements}
                    lang={lang}
                />
            </div>
        </div>
    );
}
