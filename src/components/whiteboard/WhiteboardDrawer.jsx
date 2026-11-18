// src/components/whiteboard/WhiteboardDrawer.jsx
import React from 'react';
import { X, Layers } from 'lucide-react';
import { CATEGORY_DEFINITIONS, getToolsByCategory } from './tools/registry';
import TabbedDrawer from './TabbedDrawer';

const SHAPES_2D_PRESETS = [
    {
        id: 'rect_rectangle',
        spawnType: 'rect',
        payload: { rectType: 'rectangle' },
        sv: 'Rektangel',
        en: 'Rectangle',
        svg: <rect x="3" y="6" width="22" height="16" rx="1.5" />
    },
    {
        id: 'rect_square',
        spawnType: 'rect',
        payload: { rectType: 'square' },
        sv: 'Kvadrat',
        en: 'Square',
        svg: <rect x="5" y="5" width="18" height="18" rx="1.5" />
    },
    {
        id: 'rect_parallelogram',
        spawnType: 'rect',
        payload: { rectType: 'parallelogram' },
        sv: 'Parallellogram',
        en: 'Parallelogram',
        svg: <polygon points="8,6 25,6 20,22 3,22" />
    },
    {
        id: 'rect_rhombus',
        spawnType: 'rect',
        payload: { rectType: 'rhombus' },
        sv: 'Romb',
        en: 'Rhombus',
        svg: <polygon points="14,3 25,14 14,25 3,14" />
    },
    {
        id: 'rect_trapezoid',
        spawnType: 'rect',
        payload: { rectType: 'trapezoid' },
        sv: 'Paralleltrapets',
        en: 'Trapezoid',
        svg: <polygon points="8,6 20,6 25,22 3,22" />
    },
    {
        id: 'tri_right',
        spawnType: 'triangle',
        payload: { triangleType: 'right' },
        sv: 'Rätvinklig triangel',
        en: 'Right Triangle',
        svg: <polygon points="5,4 5,23 24,23" />
    },
    {
        id: 'tri_isosceles',
        spawnType: 'triangle',
        payload: { triangleType: 'isosceles' },
        sv: 'Likbent triangel',
        en: 'Isosceles Triangle',
        svg: <polygon points="14,4 4,23 24,23" />
    },
    {
        id: 'tri_equilateral',
        spawnType: 'triangle',
        payload: { triangleType: 'equilateral' },
        sv: 'Liksidig triangel',
        en: 'Equilateral Triangle',
        svg: <polygon points="14,5 3,23 25,23" />
    },
    {
        id: 'tri_scalene',
        spawnType: 'triangle',
        payload: { triangleType: 'scalene' },
        sv: 'Oliksidig triangel',
        en: 'Scalene Triangle',
        svg: <polygon points="10,4 3,23 25,19" />
    },
    {
        id: 'circle',
        spawnType: 'circle',
        payload: {},
        sv: 'Cirkel',
        en: 'Circle',
        svg: <circle cx="14" cy="14" r="10" />
    },
    {
        id: 'polygon',
        spawnType: 'polygon',
        payload: { polygonSides: 5 },
        sv: 'Månghörning',
        en: 'Polygon',
        svg: <polygon points="14,3 25,11 21,24 7,24 3,11" />
    }
];

const SHAPES_3D_PRESETS = [
    {
        id: 'cube',
        sv: 'Kub',
        en: 'Cube',
        svg: (
            <>
                <rect x="4" y="9" width="14" height="14" />
                <polyline points="4,9 10,4 24,4 24,18 18,23" />
                <line x1="18" y1="9" x2="24" y2="4" />
            </>
        )
    },
    {
        id: 'prism',
        sv: 'Rätblock / Prisma',
        en: 'Rectangular Prism',
        svg: (
            <>
                <rect x="3" y="10" width="16" height="12" />
                <polyline points="3,10 9,5 25,5 25,17 19,22" />
                <line x1="19" y1="10" x2="25" y2="5" />
            </>
        )
    },
    {
        id: 'triprism',
        sv: 'Triangulärt prisma',
        en: 'Triangular Prism',
        svg: (
            <>
                <polygon points="4,22 10,9 16,22" />
                <polyline points="10,9 20,6 25,19 16,22" />
            </>
        )
    },
    {
        id: 'pyramid',
        sv: 'Pyramid',
        en: 'Pyramid',
        svg: (
            <>
                <polygon points="14,3 4,21 17,24" />
                <polyline points="14,3 24,19 17,24" />
            </>
        )
    },
    {
        id: 'house',
        sv: 'Hus (Sammansatt)',
        en: 'House Solid',
        svg: (
            <>
                <polygon points="4,13 11,6 18,13 18,23 4,23" />
                <polyline points="11,6 18,4 24,11 24,20 18,23" />
                <line x1="18" y1="13" x2="24" y2="11" />
            </>
        )
    },
    {
        id: 'cylinder',
        sv: 'Cylinder',
        en: 'Cylinder',
        svg: (
            <>
                <ellipse cx="14" cy="7" rx="8" ry="3.2" />
                <path d="M6,7 V21 A8,3.2 0 0,0 22,21 V7" />
            </>
        )
    },
    {
        id: 'silo',
        sv: 'Silo',
        en: 'Silo',
        svg: (
            <>
                <path d="M7,11 A7,7 0 0,1 21,11 V22 A7,2.5 0 0,1 7,22 Z" />
                <path d="M7,11 A7,2.5 0 0,0 21,11" fill="none" />
            </>
        )
    },
    {
        id: 'tube',
        sv: 'Rör (Tube)',
        en: 'Hollow Tube',
        svg: (
            <>
                <ellipse cx="14" cy="7" rx="8" ry="3.2" />
                <ellipse cx="14" cy="7" rx="3.5" ry="1.4" />
                <path d="M6,7 V21 A8,3.2 0 0,0 22,21 V7" />
            </>
        )
    },
    {
        id: 'cone',
        sv: 'Kon',
        en: 'Cone',
        svg: (
            <>
                <path d="M14,4 L6,21 A8,3 0 0,0 22,21 Z" />
            </>
        )
    },
    {
        id: 'icecream',
        sv: 'Glasskon',
        en: 'Ice Cream Cone',
        svg: (
            <>
                <path d="M7,11 A7,7 0 0,1 21,11 L14,25 Z" />
                <path d="M7,11 A7,2.2 0 0,0 21,11" fill="none" />
            </>
        )
    },
    {
        id: 'sphere',
        sv: 'Klot',
        en: 'Sphere',
        svg: (
            <>
                <circle cx="14" cy="14" r="10" />
                <ellipse cx="14" cy="14" rx="10" ry="3.5" fill="none" strokeDasharray="2.5 2" />
            </>
        )
    },
    {
        id: 'hemi',
        sv: 'Halvklot',
        en: 'Hemisphere',
        svg: (
            <>
                <path d="M4,16 A10,10 0 0,1 24,16" />
                <ellipse cx="14" cy="16" rx="10" ry="3.5" />
            </>
        )
    }
];

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
            className="absolute right-5 top-20 z-[60] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl w-56 p-3 flex flex-col select-none animate-in fade-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-160px)]"
        >
            {/* Unified Compact Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Icon size={15} className={`${categoryDef.color} shrink-0`} />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 truncate">
                        {categoryTitle}
                    </span>
                </div>
                <button 
                    type="button"
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={lang === 'sv' ? "Stäng panel" : "Close panel"}
                >
                    <X size={15} />
                </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-0.5 flex flex-col gap-2.5 min-h-0 custom-scrollbar">
                
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
                    /* 2. Icon-Only Mini Palette (2D + 3D Shapes) */
                    <div className="flex flex-col gap-2.5">
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
                                {lang === 'sv' ? "2D Figurer" : "2D Shapes"}
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {SHAPES_2D_PRESETS.map((sh) => {
                                    const label = lang === 'sv' ? sh.sv : sh.en;
                                    return (
                                        <button
                                            key={sh.id}
                                            type="button"
                                            onClick={() => onSpawn(sh.spawnType, sh.payload)}
                                            className="aspect-square rounded-xl border border-slate-200 hover:bg-emerald-50/80 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-90 group"
                                            title={label}
                                            aria-label={label}
                                        >
                                            <svg
                                                viewBox="0 0 28 28"
                                                className="w-6 h-6 text-emerald-600 fill-emerald-500/15 stroke-current group-hover:scale-110 transition-transform"
                                                strokeWidth="2.1"
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                            >
                                                {sh.svg}
                                            </svg>
                                        </button>
                                    );
                                })}

                                {categoryTools
                                    .filter(t => !['shapes_3d', 'angle_arc', 'rect', 'triangle', 'circle', 'polygon'].includes(t.id))
                                    .map(t => {
                                        const ToolIcon = t.icon;
                                        const label = t.name[lang] || t.name.sv;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => onSpawn(t.id)}
                                                className="aspect-square rounded-xl border border-slate-200 hover:bg-emerald-50/80 hover:border-emerald-400 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-90 group"
                                                title={label}
                                                aria-label={label}
                                            >
                                                <ToolIcon size={19} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
                                {lang === 'sv' ? "3D Figurer" : "3D Shapes"}
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                                {SHAPES_3D_PRESETS.map(sh => {
                                    const label = lang === 'sv' ? sh.sv : sh.en;
                                    return (
                                        <button 
                                            key={sh.id} 
                                            type="button"
                                            onClick={() => onSpawn('shapes_3d', { shape3D: sh.id })}
                                            className="aspect-square rounded-xl border border-slate-200 hover:bg-indigo-50/80 hover:border-indigo-400 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-90 group"
                                            title={label}
                                            aria-label={label}
                                        >
                                            <svg
                                                viewBox="0 0 28 28"
                                                className="w-6 h-6 text-slate-700 group-hover:text-indigo-600 fill-indigo-500/10 stroke-current group-hover:scale-110 transition-transform"
                                                strokeWidth="1.9"
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                            >
                                                {sh.svg}
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 3. Universal Compact Tool Grid */
                    <div className="grid grid-cols-2 gap-1.5">
                        {categoryTools.map((item) => {
                            const ItemIcon = item.icon;
                            const label = item.name[lang] || item.name.sv;
                            return (
                                <button 
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSpawn(item.id)} 
                                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 flex flex-col items-center justify-center gap-1 cursor-pointer text-center active:scale-95 transition-all shadow-2xs group"
                                    title={label}
                                >
                                    <ItemIcon size={20} className="text-slate-600 group-hover:text-indigo-600 transition-colors shrink-0" />
                                    <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2 w-full">
                                        {label}
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