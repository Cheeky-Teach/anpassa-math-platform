// src/components/whiteboard/WhiteboardDrawer.jsx
import React from 'react';
import { X, Layers, Box, PieChart, LineChart, Dices } from 'lucide-react';
import { CATEGORY_DEFINITIONS, getToolsByCategory } from './tools/registry';
import AlgebraTileBin from './tools/manipulatives/AlgebraTileBin';
import IntegerCounterBin from './tools/manipulatives/IntegerCounterBin';
import TabbedDrawer from './TabbedDrawer';

export default function WhiteboardDrawer({ 
    activeDrawer, 
    onClose, 
    onSpawn, 
    lang = 'sv',
    showDividingLine = true,
    elements = [],
    setElements = () => {},
    selectedIds = [],
    setSelectedIds = () => {}
}) {
    if (!activeDrawer) return null;

    const categoryDef = CATEGORY_DEFINITIONS[activeDrawer] || {
        id: activeDrawer,
        label: { sv: "Verktyg", en: "Tools" },
        icon: Layers,
        color: "text-indigo-600"
    };

    const Icon = categoryDef.icon;
    const categoryTitle = categoryDef.label[lang] || categoryDef.label.sv;
    const categoryTools = getToolsByCategory(activeDrawer);

    return (
        <aside 
            onPointerDown={(e) => e.stopPropagation()} 
            className="absolute right-6 top-20 z-[60] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl shadow-2xl p-4 flex flex-col select-none animate-in fade-in slide-in-from-right-4 duration-200 w-80 max-h-[calc(100vh-160px)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <Icon size={18} className={categoryDef.color} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {categoryTitle}
                    </span>
                </div>
                <button 
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={lang === 'sv' ? "Stäng panel" : "Close panel"}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-3 min-h-0 custom-scrollbar">
                
                {/* 1. Numbers & Arithmetic Hub */}
                {activeDrawer === 'arithmetic' ? (
                    <TabbedDrawer 
                        onSpawn={onSpawn}
                        elements={elements}
                        setElements={setElements}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        lang={lang}
                    />
                ) : activeDrawer === 'shapes' ? (
                    /* 2. Specialized Shapes Category (2D + 3D sub-grids) */
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {lang === 'sv' ? "2D Figurer" : "2D Shapes"}
                        </span>
                        {/* In the 2D Shapes section */}
                        <div className="grid grid-cols-2 gap-2">
                            {categoryTools.filter(t => !['shapes_3d', 'angle_arc'].includes(t.id)).map(t => {
                                const ToolIcon = t.icon;
                                return (
                                    <button 
                                        key={t.id}
                                        type="button"
                                        onClick={() => onSpawn(t.id)} 
                                        className="p-3 rounded-2xl border border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300 flex items-center gap-2.5 cursor-pointer transition-all shadow-xs active:scale-95 text-left group"
                                    >
                                        <ToolIcon size={20} className="text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold text-slate-700 truncate">
                                            {t.name[lang] || t.name.sv}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
                            {lang === 'sv' ? "3D Figurer" : "3D Shapes"}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'cube', sv: 'Kub', en: 'Cube' },
                                { id: 'prism', sv: 'Prisma', en: 'Prism' },
                                { id: 'triprism', sv: 'Triang. Prisma', en: 'Tri. Prism' },
                                { id: 'pyramid', sv: 'Pyramid', en: 'Pyramid' },
                                { id: 'house', sv: 'Hus', en: 'House' },
                                { id: 'cylinder', sv: 'Cylinder', en: 'Cylinder' },
                                { id: 'silo', sv: 'Silo', en: 'Silo' },
                                { id: 'tube', sv: 'Rör (Tube)', en: 'Tube' },
                                { id: 'cone', sv: 'Kon', en: 'Cone' },
                                { id: 'icecream', sv: 'Glasskon', en: 'Cone Cup' },
                                { id: 'sphere', sv: 'Klot', en: 'Sphere' },
                                { id: 'hemi', sv: 'Halvklot', en: 'Hemisphere' }
                            ].map(sh => (
                                <button 
                                    key={sh.id} 
                                    type="button"
                                    onClick={() => onSpawn('shapes_3d', { shape3D: sh.id })}
                                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-700 cursor-pointer text-center truncate active:scale-95 transition-all shadow-2xs"
                                    title={lang === 'sv' ? sh.sv : sh.en}
                                >
                                    {lang === 'sv' ? sh.sv : sh.en}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* 3. Universal Data-Driven Tool Grid */
                    <div className="grid grid-cols-2 gap-2.5">
                        {categoryTools.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                                <button 
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSpawn(item.id)} 
                                    className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 flex flex-col items-center gap-1.5 cursor-pointer text-center active:scale-95 transition-all shadow-xs group"
                                >
                                    <ItemIcon size={24} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                                    <span className="text-[11px] font-bold text-slate-700 leading-tight">
                                        {item.name[lang] || item.name.sv}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}