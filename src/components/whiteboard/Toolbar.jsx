import React, { useState } from 'react';
import { 
    Type, PenTool, Highlighter, Minus, Square, 
    Circle, Palette, Trash2, PlusSquare, PlusCircle, 
    Hash, MousePointer2, Box, Dices, Timer, 
    LineChart, Ruler, Compass, Table, Clock,
    Undo2, Redo2, RefreshCw, Share2, Triangle,
    Cone, Cylinder, Pyramid, Orbit, Home
} from 'lucide-react';

const Toolbar = ({ 
    lang = 'sv', activeTool, setActiveTool, color, setColor, 
    onClear, onUndo, onRedo, canUndo, canRedo 
}) => {
    const [showColors, setShowColors] = useState(false);
    const [show3DMenu, setShow3DMenu] = useState(false);

    const colors = ['#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    // --- TRANSLATION MAPPING ---
    const translations = {
        sv: {
            cat_writing: "Skriva",
            cat_geometry: "Geometri",
            cat_analysis: "Statistik",
            cat_system: "System",
            undo: "Ångra",
            redo: "Gör om",
            select: "Markera",
            text: "Text (T)",
            math: "Matte",
            pen: "Penna",
            highlighter: "Markör",
            line: "Linje",
            ruler: "Tallinje",
            rect: "Fyrkant",
            circle: "Cirkel",
            triangle: "Triangel",
            frac_rect: "Bråk Fyr",
            frac_circle: "Bråk Cirk",
            shapes_3d: "3D Former",
            protractor: "Gradskiva",
            coord: "Koordsystem",
            tchart: "Tabell",
            dice: "Tärning",
            spinner: "Snurra",
            node: "Nod",
            timer: "Timer",
            clock: "Klocka",
            color: "Färg",
            clear: "Rensa",
            // 3D Labels
            cube: "Kub",
            prism: "Rätblock",
            cylinder: "Cylinder",
            sphere: "Klot",
            cone: "Kon",
            pyramid: "Pyramid",
            icecream: "Glass-strut",
            silo: "Silo",
            house: "Hus",
            tube: "Rör",
            frustum: "Stympad kon",
            hemi: "Halvklot",
            triprism: "Tri-Prisma"
        },
        en: {
            cat_writing: "Write",
            cat_geometry: "Geometry",
            cat_analysis: "Statistics",
            cat_system: "System",
            undo: "Undo",
            redo: "Redo",
            select: "Select",
            text: "Text (T)",
            math: "Math",
            pen: "Pen",
            highlighter: "Highlighter",
            line: "Line",
            ruler: "Number Line",
            rect: "Rectangle",
            circle: "Circle",
            triangle: "Triangle",
            frac_rect: "Frac Rect",
            frac_circle: "Frac Circle",
            shapes_3d: "3D Shapes",
            protractor: "Protractor",
            coord: "Coordinate System",
            tchart: "Table",
            dice: "Dice",
            spinner: "Spinner",
            node: "Node",
            timer: "Timer",
            clock: "Clock",
            color: "Color",
            clear: "Clear",
            // 3D Labels
            cube: "Cube",
            prism: "Prism",
            cylinder: "Cylinder",
            sphere: "Sphere",
            cone: "Cone",
            pyramid: "Pyramid",
            icecream: "Ice Cream",
            silo: "Silo",
            house: "House",
            tube: "Tube",
            frustum: "Frustum",
            hemi: "Hemisphere",
            triprism: "Tri-Prism"
        }
    };

    const t = translations[lang] || translations.sv;

    const shapes3D = [
        { id: '3d_cube', label: t.cube, icon: Box },
        { id: '3d_prism', label: t.prism, icon: Box },
        { id: '3d_cylinder', label: t.cylinder, icon: Cylinder },
        { id: '3d_sphere', label: t.sphere, icon: Orbit },
        { id: '3d_cone', label: t.cone, icon: Cone },
        { id: '3d_pyramid', label: t.pyramid, icon: Pyramid },
        { id: '3d_triprism', label: t.triprism, icon: Triangle },
        { id: '3d_house', label: t.house, icon: Home },
        { id: '3d_icecream', label: t.icecream, icon: Cone },
        { id: '3d_silo', label: t.silo, icon: Cylinder },
        { id: '3d_tube', label: t.tube, icon: Circle },
        { id: '3d_frustum', label: t.frustum, icon: Cone },
        { id: '3d_hemi', label: t.hemi, icon: Orbit },
    ];

    const ToolButton = ({ id, icon: Icon, label, category = "writing", onClick = null, disabled = false, children = null }) => {
        const theme = {
            writing: { active: 'bg-blue-600', hover: 'hover:text-blue-600 hover:bg-blue-50' },
            geometry: { active: 'bg-emerald-600', hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
            analysis: { active: 'bg-orange-500', hover: 'hover:text-orange-500 hover:bg-orange-50' },
            system: { active: 'bg-slate-700', hover: 'hover:text-rose-600 hover:bg-rose-50' }
        }[category];
        const isActive = activeTool === id || (id === 'shapes_3d' && activeTool.startsWith('3d_'));
        return (
            <button
                onClick={onClick || (() => { setActiveTool(id); setShowColors(false); setShow3DMenu(false); })}
                disabled={disabled} title={label}
                className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center border shrink-0
                    ${isActive ? `${theme.active} text-white shadow-sm scale-105 border-transparent` : `bg-white text-slate-500 border-slate-100 ${theme.hover}`} 
                    ${disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}`}
            >
                {children ? children : <Icon size={18} />}
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 w-[94px] shrink-0 shadow-2xl z-[500] relative select-none">
            
            {/* SUBMENUS ARE FIXED TO ESCAPE ALL CLIPPING CONTEXTS */}
            {show3DMenu && (
                <div className="fixed right-[100px] top-20 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] border-2 border-emerald-100 w-[300px] grid grid-cols-3 gap-3 z-[1000] animate-in slide-in-from-right-4">
                    {shapes3D.map(s => (
                        <button key={s.id} onClick={() => { setActiveTool(s.id); setShow3DMenu(false); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeTool === s.id ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'hover:bg-emerald-50 text-slate-600'}`}>
                            <s.icon size={22} />
                            <span className="text-[10px] mt-1.5 font-black uppercase text-center leading-tight">{s.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {showColors && (
                <div className="fixed right-[100px] bottom-10 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] border-2 border-slate-100 w-[140px] grid grid-cols-2 gap-3 z-[1000] animate-in slide-in-from-right-4">
                    {colors.map(c => <button key={c} onClick={() => { setColor(c); setShowColors(false); }} className={`w-12 h-12 rounded-xl border-4 ${color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />)}
                </div>
            )}

            <div className="p-1.5 flex flex-col gap-2.5 h-full overflow-y-auto no-scrollbar">
                {/* Writing Tool Grid */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest pl-1">{t.cat_writing}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="undo" icon={Undo2} label={t.undo} onClick={onUndo} disabled={!canUndo} />
                        <ToolButton id="redo" icon={Redo2} label={t.redo} onClick={onRedo} disabled={!canRedo} />
                        <ToolButton id="select" icon={MousePointer2} label={t.select} />
                        <ToolButton id="text" icon={Type} label={t.text} />
                        <ToolButton id="math" icon={Hash} label={t.math} />
                        <ToolButton id="pen" icon={PenTool} label={t.pen} />
                        <ToolButton id="highlighter" icon={Highlighter} label={t.highlighter} />
                        <ToolButton id="line" icon={Minus} label={t.line} />
                    </div>
                </div>

                {/* Geometry Tool Grid */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest pl-1">{t.cat_geometry}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="rect" icon={Square} label={t.rect} category="geometry" />
                        <ToolButton id="circle" icon={Circle} label={t.circle} category="geometry" />
                        <ToolButton id="triangle" icon={Triangle} label={t.triangle} category="geometry" />
                        <ToolButton id="frac_rect" icon={PlusSquare} label={t.frac_rect} category="geometry" />
                        <ToolButton id="frac_circle" icon={PlusCircle} label={t.frac_circle} category="geometry" />
                        <ToolButton id="shapes_3d" icon={Box} label={t.shapes_3d} category="geometry" onClick={() => { setShow3DMenu(!show3DMenu); setShowColors(false); }} />
                        <ToolButton id="protractor" icon={Compass} label={t.protractor} category="geometry" />
                    </div>
                </div>

                {/* Analysis Tool Grid */}
                <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-black text-orange-400 uppercase tracking-widest pl-1">{t.cat_analysis}</span>
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="coord" icon={LineChart} label={t.coord} category="analysis" />
                        <ToolButton id="tchart" icon={Table} label={t.tchart} category="analysis" />
                        <ToolButton id="dice" icon={Dices} label={t.dice} category="analysis" />
                        <ToolButton id="spinner" icon={RefreshCw} label={t.spinner} category="analysis" />
                        <ToolButton id="node" icon={Share2} label={t.node} category="analysis" />
                        <ToolButton id="timer" icon={Timer} label={t.timer} category="analysis" />
                        <ToolButton id="clock" icon={Clock} label={t.clock} category="analysis" />
                        <ToolButton id="ruler" icon={Ruler} label={t.ruler} category="analysis" />
                    </div>
                </div>

                {/* Utilities */}
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 pb-10">
                    <div className="grid grid-cols-2 gap-1">
                        <ToolButton id="color_picker" label={t.color} category="system" icon={Palette} onClick={() => { setShowColors(!showColors); setShow3DMenu(false); }}>
                            <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                        </ToolButton>
                        <ToolButton id="clear_all" icon={Trash2} label={t.clear} category="system" onClick={onClear} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;