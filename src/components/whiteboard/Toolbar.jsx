import React, { useState, useEffect } from 'react';
import { 
    PenTool, Highlighter, Minus, Palette, Trash2, 
    Hash, MousePointer2, Timer, Undo2, Redo2, 
    FileText, ChevronDown, ChevronUp, Grid3X3, Watch,
    MessageCircle, Eraser, Layers, Shapes, PieChart, LineChart
} from 'lucide-react';

const Toolbar = ({ 
    lang = 'sv', activeTool, setActiveTool, color, setColor, 
    onClear, onUndo, onRedo, canUndo, canRedo, bgType, onToggleBg,
    mode = 'all', onToggleDrawer, activeDrawer, allowedTools = null 
}) => {
    // 1. Guard against 'none' mode (used in student previews and reports)
    if (mode === 'none') return null;

    const [showColors, setShowColors] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); 

    useEffect(() => {
        if (isCollapsed) {
            setShowColors(false);
            if (onToggleDrawer) onToggleDrawer(null);
        }
    }, [isCollapsed, onToggleDrawer]);

    const colors = ['#06b6d4', '#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    const t = {
        sv: {
            undo: "Ångra", redo: "Gör om", select: "Markera / Flytta",
            pen: "Penna", highlighter: "Överstruken", line: "Linje", math: "LaTeX", richText: "Text", timer: "Timer", realClock: "Klocka",
            color: "Välj färg", bg: "Ändra bakgrund", clear: "Rensa allt", volume_cue: "Arbetsro", eraser: "Suddgummi",
            bin_algebra: "Algebra", bin_shapes: "Figurer", bin_fractions: "Bråk", bin_data: "Verktyg"
        },
        en: {
            undo: "Undo", redo: "Redo", select: "Select / Move",
            pen: "Pen", highlighter: "Highlighter", line: "Line", math: "Math Box", richText: "Text (Wordpad)", timer: "Timer", realClock: "Real Clock",
            color: "Choose Color", bg: "Toggle Background", clear: "Clear All", volume_cue: "Work Mode", eraser: "Eraser",
            bin_algebra: "Algebra", bin_shapes: "Shapes", bin_fractions: "Fractions", bin_data: "Tools"
        }
    }[lang] || {};

    const isToolVisible = (toolId) => {
        if (allowedTools && Array.isArray(allowedTools)) {
            return allowedTools.includes(toolId);
        }
        if (mode === 'all') return true;

        if (mode === 'fractions') {
            return ['select', 'pen', 'highlighter', 'eraser', 'drawer_fractions', 'color_picker', 'clear_all'].includes(toolId);
        }

        if (mode === 'algebra_tiles') {
            return ['select', 'pen', 'eraser', 'line', 'richText', 'drawer_algebra', 'color_picker', 'clear_all'].includes(toolId);
        }

        if (mode === 'geometry') {
            return ['select', 'pen', 'highlighter', 'eraser', 'line', 'drawer_shapes', 'drawer_data', 'color_picker', 'toggle_bg', 'clear_all'].includes(toolId);
        }

        if (mode === 'student') {
            const baseStudent = ['select', 'pen', 'highlighter', 'eraser', 'line', 'color_picker', 'clear_all'];
            // Allow drawer bins if the slide requires them
            return [...baseStudent, 'drawer_algebra', 'drawer_shapes', 'drawer_fractions', 'drawer_data'].includes(toolId);
        }

        return true;
    };

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
                type="button"
                onClick={onClick || (() => { 
                    setActiveTool(id); 
                    setShowColors(false); 
                    if (onToggleDrawer) onToggleDrawer(null);
                })}
                disabled={disabled} 
                className={`group relative w-9 h-9 rounded-xl transition-all flex items-center justify-center border shrink-0
                    ${isActive ? `${theme.active} text-white shadow-md scale-110 border-transparent` : `bg-white text-slate-500 border-slate-100 ${theme.hover}`} 
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
            >
                {children ? children : <Icon size={18} />}
                
                {label && (
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-[1001]">
                        {label}
                        <svg className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 text-slate-800" viewBox="0 0 10 10">
                            <polygon points="0,0 10,0 5,5" fill="currentColor" />
                        </svg>
                    </span>
                )}
            </button>
        );
    };

    const DrawerButton = ({ id, drawerKey, icon: Icon, label, activeBg, hoverBorder }) => {
        const isOpen = activeDrawer === drawerKey;
        return (
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                e.stopPropagation();
                if (onToggleDrawer) {
                    onToggleDrawer(isOpen ? null : drawerKey);
                } else {
                    console.warn("[1. Toolbar] onToggleDrawer prop is missing or undefined!");
                }
            }}
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer shrink-0 ${
                    isOpen 
                        ? `${activeBg} text-white shadow-md scale-105 border-transparent` 
                        : `bg-white text-slate-700 border-slate-200 ${hoverBorder}`
                }`}
                title={label}
            >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
            </button>
        );
    };

    const Divider = () => <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1 shrink-0" />;

    const showWriting = ['pen', 'eraser', 'highlighter', 'line', 'math', 'richText', 'timer', 'realClock', 'volume_cue'].some(isToolVisible);
    const showDrawers = ['drawer_algebra', 'drawer_shapes', 'drawer_fractions', 'drawer_data'].some(isToolVisible);

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

            {/* Color Palette Menu */}
            {showColors && !isCollapsed && (
                <div className="absolute bottom-full mb-3 right-8 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] border-2 border-slate-100 w-[240px] grid grid-cols-5 gap-3 z-[1000] animate-in slide-in-from-bottom-4">
                    {colors.map(c => (
                        <button key={c} onClick={() => { setColor(c); setShowColors(false); }} className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-blue-500 scale-125 shadow-lg' : 'border-transparent hover:scale-110 cursor-pointer'}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-y-2 gap-x-1 mx-auto w-full max-w-6xl">
                {/* System & Navigation */}
                <div className="flex items-center gap-1">
                    <ToolButton id="undo" icon={Undo2} category="system" onClick={onUndo} disabled={!canUndo} label={t.undo} />
                    <ToolButton id="redo" icon={Redo2} category="system" onClick={onRedo} disabled={!canRedo} label={t.redo} />
                    {isToolVisible('select') && <ToolButton id="select" icon={MousePointer2} category="system" label={t.select} />}
                </div>

                {showWriting && (
                    <>
                        <Divider />
                        {/* Core Writing & Time Tools */}
                        <div className="flex items-center gap-1">
                            {isToolVisible('pen') && <ToolButton id="pen" icon={PenTool} category="writing" label={t.pen} />}
                            {isToolVisible('eraser') && <ToolButton id="eraser" icon={Eraser} category="writing" label={t.eraser} />}
                            {isToolVisible('highlighter') && <ToolButton id="highlighter" icon={Highlighter} category="writing" label={t.highlighter} />}
                            {isToolVisible('line') && <ToolButton id="line" icon={Minus} category="writing" label={t.line} />}
                            {isToolVisible('math') && <ToolButton id="math" icon={Hash} category="writing" label={t.math} />}
                            {isToolVisible('richText') && <ToolButton id="richText" icon={FileText} category="writing" label={t.richText} />}
                            {isToolVisible('timer') && <ToolButton id="timer" icon={Timer} category="writing" label={t.timer} />}
                            {isToolVisible('realClock') && <ToolButton id="realClock" icon={Watch} category="writing" label={t.realClock} />}
                            {isToolVisible('volume_cue') && <ToolButton id="volume_cue" icon={MessageCircle} category="writing" label={t.volume_cue} />}
                        </div>
                    </>
                )}

                {showDrawers && (
                    <>
                        <Divider />
                        {/* 🟢 Clean Deck Bins */}
                        <div className="flex items-center gap-1.5">
                            {isToolVisible('drawer_algebra') && (
                                <DrawerButton 
                                    id="drawer_algebra" 
                                    drawerKey="algebra" 
                                    icon={Layers} 
                                    label={t.bin_algebra} 
                                    activeBg="bg-indigo-600"
                                    hoverBorder="hover:border-indigo-300 hover:bg-indigo-50"
                                />
                            )}
                            {isToolVisible('drawer_shapes') && (
                                <DrawerButton 
                                    id="drawer_shapes" 
                                    drawerKey="shapes" 
                                    icon={Shapes} 
                                    label={t.bin_shapes} 
                                    activeBg="bg-emerald-600"
                                    hoverBorder="hover:border-emerald-300 hover:bg-emerald-50"
                                />
                            )}
                            {isToolVisible('drawer_fractions') && (
                                <DrawerButton 
                                    id="drawer_fractions" 
                                    drawerKey="fractions" 
                                    icon={PieChart} 
                                    label={t.bin_fractions} 
                                    activeBg="bg-amber-500"
                                    hoverBorder="hover:border-amber-300 hover:bg-amber-50"
                                />
                            )}
                            {isToolVisible('drawer_data') && (
                                <DrawerButton 
                                    id="drawer_data" 
                                    drawerKey="data" 
                                    icon={LineChart} 
                                    label={t.bin_data} 
                                    activeBg="bg-blue-600"
                                    hoverBorder="hover:border-blue-300 hover:bg-blue-50"
                                />
                            )}
                        </div>
                    </>
                )}

                <Divider />
                {/* Color & Canvas Controls */}
                <div className="flex items-center gap-1">
                    {isToolVisible('color_picker') && (
                        <ToolButton id="color_picker" category="system" icon={Palette} onClick={() => { setShowColors(!showColors); if (onToggleDrawer) onToggleDrawer(null); }} label={t.color}>
                            <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                        </ToolButton>
                    )}
                    {isToolVisible('toggle_bg') && (
                        <ToolButton 
                            id="toggle_bg" 
                            icon={bgType === 'grid' ? Grid3X3 : Minus} 
                            category="system" 
                            onClick={onToggleBg} 
                            label={t.bg}
                        />
                    )}
                    {isToolVisible('clear_all') && <ToolButton id="clear_all" icon={Trash2} category="system" onClick={onClear} label={t.clear} />}
                </div>
            </div>
        </div>
    );
};

export default Toolbar;