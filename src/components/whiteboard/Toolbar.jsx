import React, { useState } from 'react';
import { 
    Type, PenTool, Highlighter, Minus, Square, 
    Circle, Palette, Trash2, PlusSquare, PlusCircle, 
    Hash, MousePointer2, Box, Dices, Timer, 
    LineChart, Ruler, Compass, Table, Clock,
    Undo2, Redo2, RefreshCw, Share2
} from 'lucide-react';

const Toolbar = ({ 
    lang = 'sv',
    activeTool, 
    setActiveTool, 
    color, 
    setColor, 
    onClear,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
    const [showColors, setShowColors] = useState(false);

    const colors = [
        '#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', 
        '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ];

    const t = {
        sv: {
            cat_writing: "Skriva", cat_geometry: "Geometri", cat_analysis: "Graf", cat_system: "System",
            undo: "Ångra", redo: "Gör om", select: "Markera", text: "Text (T)",
            math: "Matte (+-x/)", pen: "Penna", highlighter: "Överstryka", line: "Linje",
            ruler: "Tallinje", rect: "Rektangel", circle: "Cirkel", frac_rect: "+Bråk Rekt",
            frac_circle: "+Bråk Cirk", shapes_3d: "3D Former", protractor: "Gradskiva",
            coord: "Koordinatsystem", tchart: "Värdetabell", dice: "Tärning", spinner: "Snurra", node: "Nod (Träd)",
            timer: "Timer", clock: "Klocka", color: "Färg", clear: "Rensa allt"
        },
        en: {
            cat_writing: "Write", cat_geometry: "Geometry", cat_analysis: "Graph", cat_system: "System",
            undo: "Undo", redo: "Redo", select: "Select", text: "Text (T)",
            math: "Math (+-x/)", pen: "Pen", highlighter: "Highlight", line: "Line",
            ruler: "Number Line", rect: "Rectangle", circle: "Circle", frac_rect: "+Frac Rect",
            frac_circle: "+Frac Circle", shapes_3d: "3D Shapes", protractor: "Protractor",
            coord: "Coordinate System", tchart: "T-Chart", dice: "Dice", spinner: "Spinner", node: "Node (Tree)",
            timer: "Timer", clock: "Clock", color: "Color", clear: "Clear All"
        }
    }[lang];

    const ToolButton = ({ id, icon: Icon, label, category = "writing", onClick = null, disabled = false, children = null }) => {
        const theme = {
            writing: { active: 'bg-blue-600', hover: 'hover:text-blue-600 hover:bg-blue-50' },
            geometry: { active: 'bg-emerald-600', hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
            analysis: { active: 'bg-orange-500', hover: 'hover:text-orange-500 hover:bg-orange-50' },
            system: { active: 'bg-slate-700', hover: 'hover:text-rose-600 hover:bg-rose-50' }
        }[category];

        const isActive = activeTool === id;

        return (
            <button
                onClick={isActive && id === 'color_picker' ? () => setShowColors(!showColors) : (onClick || (() => setActiveTool(id)))}
                disabled={disabled}
                title={label}
                className={`
                    w-10 h-10 rounded-lg transition-all flex items-center justify-center border shrink-0
                    ${isActive 
                        ? `${theme.active} text-white shadow-sm scale-105 border-transparent` 
                        : `bg-white text-slate-500 border-slate-100 ${theme.hover}`
                    } 
                    ${disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}
                `}
            >
                {children ? children : <Icon size={20} />}
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 w-[100px] shrink-0 shadow-xl z-[60] relative select-none">
            <div className="p-2 flex flex-col gap-4">
                
                {/* 1. WRITING TOOLS */}
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter pl-1">{t.cat_writing}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="undo" icon={Undo2} label={t.undo} category="writing" onClick={onUndo} disabled={!canUndo} />
                        <ToolButton id="redo" icon={Redo2} label={t.redo} category="writing" onClick={onRedo} disabled={!canRedo} />
                        <ToolButton id="select" icon={MousePointer2} label={t.select} category="writing" />
                        <ToolButton id="text" icon={Type} label={t.text} category="writing" />
                        <ToolButton id="math" icon={Hash} label={t.math} category="writing" />
                        <ToolButton id="pen" icon={PenTool} label={t.pen} category="writing" />
                        <ToolButton id="highlighter" icon={Highlighter} label={t.highlighter} category="writing" />
                        <ToolButton id="line" icon={Minus} label={t.line} category="writing" />
                        <ToolButton id="ruler" icon={Ruler} label={t.ruler} category="writing" />
                    </div>
                </div>

                {/* 2. GEOMETRY TOOLS */}
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter pl-1">{t.cat_geometry}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="rect" icon={Square} label={t.rect} category="geometry" />
                        <ToolButton id="circle" icon={Circle} label={t.circle} category="geometry" />
                        <ToolButton id="frac_rect" icon={PlusSquare} label={t.frac_rect} category="geometry" />
                        <ToolButton id="frac_circle" icon={PlusCircle} label={t.frac_circle} category="geometry" />
                        <ToolButton id="shapes_3d" icon={Box} label={t.shapes_3d} category="geometry" />
                        <ToolButton id="protractor" icon={Compass} label={t.protractor} category="geometry" />
                    </div>
                </div>

                {/* 3. ANALYSIS TOOLS */}
                <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-tighter pl-1">{t.cat_analysis}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="coord" icon={LineChart} label={t.coord} category="analysis" />
                        <ToolButton id="tchart" icon={Table} label={t.tchart} category="analysis" />
                        <ToolButton id="dice" icon={Dices} label={t.dice} category="analysis" />
                        <ToolButton id="spinner" icon={RefreshCw} label={t.spinner} category="analysis" />
                        <ToolButton id="node" icon={Share2} label={t.node} category="analysis" />
                        <ToolButton id="timer" icon={Timer} label={t.timer} category="analysis" />
                        <ToolButton id="clock" icon={Clock} label={t.clock} category="analysis" />
                    </div>
                </div>

                {/* 4. UTILITIES */}
                <div className="flex flex-col gap-1 border-t border-slate-50 pt-2">
                    <div className="grid grid-cols-2 gap-1">
                        <div className="relative">
                            <ToolButton 
                                id="color_picker" 
                                label={t.color} 
                                category="system"
                                onClick={() => setShowColors(!showColors)}
                                icon={Palette}
                            >
                                <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                            </ToolButton>

                            {showColors && (
                                /* UPDATED POPOVER: wider width and 2-column grid for clarity */
                                <div className="absolute right-full bottom-0 mr-4 p-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 w-[110px] grid grid-cols-2 gap-2 animate-in slide-in-from-right-2 z-[110]">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => { setColor(c); setShowColors(false); }}
                                            className={`w-10 h-10 rounded-lg transition-transform active:scale-90 shadow-sm border border-slate-100 ${color === c ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <ToolButton id="clear_all" icon={Trash2} label={t.clear} category="system" onClick={onClear} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;