import React, { useState, useEffect } from 'react';
import { 
    Type, PenTool, Highlighter, Minus, Square, 
    Circle, Palette, Trash2, PlusSquare, PlusCircle, 
    Hash, MousePointer2, Box, Dices, Timer, 
    LineChart, Ruler, Compass, Table, Clock,
    Undo2, Redo2, RefreshCw, Share2, Triangle,
    Cone, Cylinder, Pyramid, Orbit, Home,
    FileText, ChevronDown, ChevronUp 
} from 'lucide-react';

const Toolbar = ({ 
    lang = 'sv', activeTool, setActiveTool, color, setColor, 
    onClear, onUndo, onRedo, canUndo, canRedo 
}) => {
    const [showColors, setShowColors] = useState(false);
    const [show3DMenu, setShow3DMenu] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // 🟢 NEW: Toolbar collapse state

    // Close popups automatically if the toolbar is collapsed
    useEffect(() => {
        if (isCollapsed) {
            setShowColors(false);
            setShow3DMenu(false);
        }
    }, [isCollapsed]);

    const colors = ['#06b6d4', '#0f172a', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    const t = {
        sv: {
            cube: "Kub", prism: "Rätblock", cylinder: "Cylinder", sphere: "Klot", cone: "Kon", pyramid: "Pyramid", 
            icecream: "Glass-strut", silo: "Silo", house: "Hus", tube: "Rör", frustum: "Stympad kon", hemi: "Halvklot", triprism: "Tri-Prisma"
        },
        en: {
            cube: "Cube", prism: "Prism", cylinder: "Cylinder", sphere: "Sphere", cone: "Cone", pyramid: "Pyramid", 
            icecream: "Ice Cream", silo: "Silo", house: "House", tube: "Tube", frustum: "Frustum", hemi: "Hemisphere", triprism: "Tri-Prism"
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
            <button
                onClick={onClick || (() => { setActiveTool(id); setShowColors(false); setShow3DMenu(false); })}
                disabled={disabled} title={label}
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border shrink-0
                    ${isActive ? `${theme.active} text-white shadow-md scale-110 border-transparent` : `bg-white text-slate-500 border-slate-100 ${theme.hover}`} 
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}`}
            >
                {children ? children : <Icon size={20} />}
            </button>
        );
    };

    const Divider = () => <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />;

    return (
        <div 
            className={`absolute bottom-0 left-0 right-0 h-[70px] bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center px-4 overflow-visible shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 select-none transition-transform duration-300 ease-in-out
                ${isCollapsed ? 'translate-y-full' : 'translate-y-0'}`}
        >
            {/* 🟢 FLOATING COLLAPSE TOGGLE TAB */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/95 backdrop-blur-md border-t border-x border-slate-200 rounded-t-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
                title={isCollapsed ? "Visa verktyg" : "Dölj verktyg"}
            >
                {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Pop-up Menus */}
            {show3DMenu && !isCollapsed && (
                <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] border-2 border-emerald-100 w-[320px] grid grid-cols-4 gap-3 z-[1000] animate-in slide-in-from-bottom-4">
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
                <div className="absolute bottom-[80px] right-8 p-4 bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.2)] border-2 border-slate-100 w-[240px] grid grid-cols-5 gap-3 z-[1000] animate-in slide-in-from-bottom-4">
                    {colors.map(c => <button key={c} onClick={() => { setColor(c); setShowColors(false); }} className={`w-8 h-8 rounded-full border-4 ${color === c ? 'border-blue-500 scale-125 shadow-lg' : 'border-transparent hover:scale-110 cursor-pointer'}`} style={{ backgroundColor: c }} />)}
                </div>
            )}

            <div className="flex items-center gap-1 mx-auto overflow-x-auto custom-scrollbar px-2 py-1">
                {/* System & Navigation */}
                <ToolButton id="undo" icon={Undo2} category="system" onClick={onUndo} disabled={!canUndo} />
                <ToolButton id="redo" icon={Redo2} category="system" onClick={onRedo} disabled={!canRedo} />
                <ToolButton id="select" icon={MousePointer2} category="system" />
                <Divider />

                {/* Writing & Math */}
                <ToolButton id="pen" icon={PenTool} category="writing" />
                <ToolButton id="highlighter" icon={Highlighter} category="writing" />
                <ToolButton id="line" icon={Minus} category="writing" />
                <ToolButton id="math" icon={Hash} category="writing" />
                <ToolButton id="richText" icon={FileText} category="writing" />
                <Divider />

                {/* Geometry */}
                <ToolButton id="rect" icon={Square} category="geometry" />
                <ToolButton id="circle" icon={Circle} category="geometry" />
                <ToolButton id="triangle" icon={Triangle} category="geometry" />
                <ToolButton id="frac_rect" icon={PlusSquare} category="geometry" />
                <ToolButton id="frac_circle" icon={PlusCircle} category="geometry" />
                <ToolButton id="shapes_3d" icon={Box} category="geometry" onClick={() => { setShow3DMenu(!show3DMenu); setShowColors(false); }} />
                <ToolButton id="protractor" icon={Compass} category="geometry" />
                <Divider />

                {/* Analysis & Widgets */}
                <ToolButton id="coord" icon={LineChart} category="analysis" />
                <ToolButton id="tchart" icon={Table} category="analysis" />
                <ToolButton id="dice" icon={Dices} category="analysis" />
                <ToolButton id="spinner" icon={RefreshCw} category="analysis" />
                <ToolButton id="ruler" icon={Ruler} category="analysis" />
                <ToolButton id="timer" icon={Timer} category="analysis" />
                <ToolButton id="clock" icon={Clock} category="analysis" />
                <Divider />

                {/* Color & Clear */}
                <ToolButton id="color_picker" category="system" icon={Palette} onClick={() => { setShowColors(!showColors); setShow3DMenu(false); }}>
                    <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                </ToolButton>
                <ToolButton id="clear_all" icon={Trash2} category="system" onClick={onClear} />
            </div>
        </div>
    );
};

export default Toolbar;