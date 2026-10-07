import React, { useState, useEffect } from 'react';
import { 
    Type, PenTool, Highlighter, Minus, Square, 
    Circle, Palette, Trash2, PlusSquare, PlusCircle, 
    Hash, MousePointer2, Box, Dices, Timer, 
    LineChart, Ruler, Compass, Table, Clock,
    Undo2, Redo2, RefreshCw, Share2, Triangle,
    Cone, Cylinder, Pyramid, Orbit, Home,
    FileText, ChevronDown, ChevronUp, Grid3X3, Calculator, Watch,
    MessageCircle
} from 'lucide-react';

const Toolbar = ({ 
    lang = 'sv', activeTool, setActiveTool, color, setColor, 
    onClear, onUndo, onRedo, canUndo, canRedo, bgType, onToggleBg 
}) => {
    const [showColors, setShowColors] = useState(false);
    const [show3DMenu, setShow3DMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); 

    useEffect(() => {
        if (isCollapsed) {
            setShowColors(false);
            setShow3DMenu(false);
        }
    }, [isCollapsed]);

    const colors = ['#06b6d4', '#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    // 🟢 ADDED: Comprehensive Translation Dictionary for every tool
    const t = {
        sv: {
            cube: "Kub", prism: "Rätblock", cylinder: "Cylinder", sphere: "Klot", cone: "Kon", pyramid: "Pyramid", 
            icecream: "Glass-strut", silo: "Silo", house: "Hus", tube: "Rör", frustum: "Stympad kon", hemi: "Halvklot", triprism: "Tri-Prisma",
            undo: "Ångra", redo: "Gör om", select: "Markera / Flytta",
            pen: "Penna", highlighter: "Överstruken", line: "Linje", math: "LaTeX", richText: "Text", timer: "Timer", realClock: "Klocka",
            rect: "Rektangel", circle: "Cirkel", triangle: "Triangel", frac_rect: "Bråk (Rektangel)", frac_circle: "Bråk (Cirkel)", shapes_3d: "3D Figurer", protractor: "Gradskiva",
            coord: "Koordinatsystem", tchart: "Värdetabell", dice: "Tärningar", spinner: "Lyckohjul", ruler: "Linjal", clock_prac: "Klocka (Övning)", calc: "Miniräknare",
            color: "Välj färg", bg: "Ändra bakgrund", clear: "Rensa allt", volume_cue: "Arbetsro"
        },
        en: {
            cube: "Cube", prism: "Prism", cylinder: "Cylinder", sphere: "Sphere", cone: "Cone", pyramid: "Pyramid", 
            icecream: "Ice Cream", silo: "Silo", house: "House", tube: "Tube", frustum: "Frustum", hemi: "Hemisphere", triprism: "Tri-Prism",
            undo: "Undo", redo: "Redo", select: "Select / Move",
            pen: "Pen", highlighter: "Highlighter", line: "Line", math: "Math Box", richText: "Text (Wordpad)", timer: "Timer", realClock: "Real Clock",
            rect: "Rectangle", circle: "Circle", triangle: "Triangle", frac_rect: "Fraction (Rect)", frac_circle: "Fraction (Circle)", shapes_3d: "3D Shapes", protractor: "Protractor",
            coord: "Coordinate Plane", tchart: "T-Chart", dice: "Dice", spinner: "Spinner", ruler: "Ruler", clock_prac: "Clock (Practice)", calc: "Calculator",
            color: "Choose Color", bg: "Toggle Background", clear: "Clear All", volume_cue: "Work Mode"
        }
    }[lang] || {};

    const shapes3D = [
        { id: '3d_cube', label: t.cube, icon: Box }, { id: '3d_prism', label: t.prism, icon: Box },
        { id: '3d_cylinder', label: t.cylinder, icon: Cylinder }, { id: '3d_sphere', label: t.sphere, icon: Orbit },
        { id: '3d_cone', label: t.cone, icon: Cone }, { id: '3d_pyramid', label: t.pyramid, icon: Pyramid },
        { id: '3d_triprism', label: t.triprism, icon: Triangle }, { id: '3d_house', label: t.house, icon: Home },
        { id: '3d_icecream', label: t.icecream, icon: Cone }, { id: '3d_silo', label: t.silo, icon: Cylinder },
        { id: '3d_tube', label: t.tube, icon: Circle }, { id: '3d_frustum', label: t.frustum, icon: Cone },
        { id: '3d_hemi', label: t.hemi, icon: Orbit },
    ];

    const ToolButton = ({ id, icon: Icon, label, category = "writing", onClick = null, disabled = false, children = null }) => {
        const theme = {
            writing: { active: 'bg-blue-600', hover: 'hover:text-blue-600 hover:bg-blue-50' },
            geometry: { active: 'bg-emerald-600', hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
            analysis: { active: 'bg-orange-500', hover: 'hover:text-orange-500 hover:bg-orange-50' },
            system: { active: 'bg-slate-700', hover: 'hover:text-rose-600 hover:bg-rose-50' }
        }[category];
        
        const isActive = activeTool === id || (id === 'shapes_3d' && activeTool?.startsWith('3d_'));
        
        return (
            // 🟢 ADDED: 'group relative' so the tooltip can anchor to the button and appear on hover
            <button
                onClick={onClick || (() => { setActiveTool(id); setShowColors(false); setShow3DMenu(false); })}
                disabled={disabled} 
                className={`group relative w-9 h-9 rounded-xl transition-all flex items-center justify-center border shrink-0
                    ${isActive ? `${theme.active} text-white shadow-md scale-110 border-transparent` : `bg-white text-slate-500 border-slate-100 ${theme.hover}`} 
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
            >
                {children ? children : <Icon size={18} />}
                
                {/* 🟢 NEW: SLEEK FLOATING TOOLTIP */}
                {label && (
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-[1001]">
                        {label}
                        {/* CSS Triangle pointing down */}
                        <svg className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 text-slate-800" viewBox="0 0 10 10">
                            <polygon points="0,0 10,0 5,5" fill="currentColor" />
                        </svg>
                    </span>
                )}
            </button>
        );
    };

    const Divider = () => <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1 shrink-0" />;

    return (
        <div 
            className={`absolute bottom-0 left-0 right-0 h-auto min-h-[64px] py-2 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 select-none transition-transform duration-300 ease-in-out
                ${isCollapsed ? 'translate-y-full' : 'translate-y-0'}`}
        >
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/95 backdrop-blur-md border-t border-x border-slate-200 rounded-t-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
                title={isCollapsed ? (lang === 'sv' ? "Visa verktyg" : "Show toolbar") : (lang === 'sv' ? "Dölj verktyg" : "Hide toolbar")}
            >
                {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Pop-up Menus */}
            {show3DMenu && !isCollapsed && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] border-2 border-emerald-100 w-[320px] grid grid-cols-4 gap-3 z-[1000] animate-in slide-in-from-bottom-4">
                    {shapes3D.map(s => (
                        <button key={s.id} onClick={() => { setActiveTool(s.id); setShow3DMenu(false); }}
                            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${activeTool === s.id ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'hover:bg-emerald-50 text-slate-600 cursor-pointer'}`}>
                            <s.icon size={20} />
                            <span className="text-[8px] mt-1 font-black uppercase text-center leading-tight">{s.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {showColors && !isCollapsed && (
                <div className="absolute bottom-full mb-3 right-8 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] border-2 border-slate-100 w-[240px] grid grid-cols-5 gap-3 z-[1000] animate-in slide-in-from-bottom-4">
                    {colors.map(c => <button key={c} onClick={() => { setColor(c); setShowColors(false); }} className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-blue-500 scale-125 shadow-lg' : 'border-transparent hover:scale-110 cursor-pointer'}`} style={{ backgroundColor: c }} />)}
                </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-y-2 gap-x-1 mx-auto w-full max-w-6xl">
                {/* System & Navigation */}
                <div className="flex items-center gap-1">
                    <ToolButton id="undo" icon={Undo2} category="system" onClick={onUndo} disabled={!canUndo} label={t.undo} />
                    <ToolButton id="redo" icon={Redo2} category="system" onClick={onRedo} disabled={!canRedo} label={t.redo} />
                    <ToolButton id="select" icon={MousePointer2} category="system" label={t.select} />
                </div>
                <Divider />

                {/* Writing & Math */}
                <div className="flex items-center gap-1">
                    <ToolButton id="pen" icon={PenTool} category="writing" label={t.pen} />
                    <ToolButton id="highlighter" icon={Highlighter} category="writing" label={t.highlighter} />
                    <ToolButton id="line" icon={Minus} category="writing" label={t.line} />
                    <ToolButton id="math" icon={Hash} category="writing" label={t.math} />
                    <ToolButton id="richText" icon={FileText} category="writing" label={t.richText} />
                    <ToolButton id="timer" icon={Timer} category="writing" label={t.timer} />
                    <ToolButton id="realClock" icon={Watch} category="writing" label={t.realClock} />
                    <ToolButton id="volume_cue" icon={MessageCircle} category="writing" label={t.volume_cue} />
                </div>
                <Divider />

                {/* Geometry */}
                <div className="flex items-center gap-1">
                    <ToolButton id="rect" icon={Square} category="geometry" label={t.rect} />
                    <ToolButton id="circle" icon={Circle} category="geometry" label={t.circle} />
                    <ToolButton id="triangle" icon={Triangle} category="geometry" label={t.triangle} />
                    <ToolButton id="frac_rect" icon={PlusSquare} category="geometry" label={t.frac_rect} />
                    <ToolButton id="frac_circle" icon={PlusCircle} category="geometry" label={t.frac_circle} />
                    <ToolButton id="shapes_3d" icon={Box} category="geometry" onClick={() => { setShow3DMenu(!show3DMenu); setShowColors(false); }} label={t.shapes_3d} />
                    <ToolButton id="protractor" icon={Compass} category="geometry" label={t.protractor} />
                </div>
                <Divider />

                {/* Analysis & Widgets */}
                <div className="flex items-center gap-1">
                    <ToolButton id="coord" icon={LineChart} category="analysis" label={t.coord} />
                    <ToolButton id="tchart" icon={Table} category="analysis" label={t.tchart} />
                    <ToolButton id="dice" icon={Dices} category="analysis" label={t.dice} />
                    <ToolButton id="spinner" icon={RefreshCw} category="analysis" label={t.spinner} />
                    <ToolButton id="ruler" icon={Ruler} category="analysis" label={t.ruler} />
                    <ToolButton id="clock" icon={Clock} category="analysis" label={t.clock_prac} />
                    <ToolButton id="calculator" icon={Calculator} category="analysis" label={t.calc} />
                </div>
                <Divider />

                {/* Color & Clear */}
                <div className="flex items-center gap-1">
                    <ToolButton id="color_picker" category="system" icon={Palette} onClick={() => { setShowColors(!showColors); setShow3DMenu(false); }} label={t.color}>
                        <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                    </ToolButton>
                    <ToolButton 
                        id="toggle_bg" 
                        icon={bgType === 'grid' ? Grid3X3 : Square} 
                        category="system" 
                        onClick={onToggleBg} 
                        label={t.bg}
                    />
                    <ToolButton id="clear_all" icon={Trash2} category="system" onClick={onClear} label={t.clear} />
                </div>
            </div>
        </div>
    );
};

export default Toolbar;