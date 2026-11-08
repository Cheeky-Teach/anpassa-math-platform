// src/components/views/ManipulativeSandboxView.jsx
import React, { useState, useRef } from 'react';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import { 
    ChevronLeft, RotateCcw, SplitSquareVertical, 
    Grid3X3, Minus, Download 
} from 'lucide-react';
import { downloadSvgAsImage } from '../whiteboard/utils/exportSVG';

export default function ManipulativeSandboxView({ lang = 'sv', onBack }) {
    const [elements, setElements] = useState([]);
    const [surfaceMode, setSurfaceMode] = useState('blank');
    const canvasRef = useRef(null);

    const t = {
        sv: {
            back: "Tillbaka",
            clear: "Rensa tavla",
            export: "Ladda ner som bild",
            surface: "Arbetsyta",
            equationMat: "Ekvationsmatta (=)",
            grid: "Rutnät",
            blank: "Öppen yta",
            lhs: "VÄNSTER LED (VL)",
            rhs: "HÖGER LED (HL)"
        },
        en: {
            back: "Back",
            clear: "Clear Board",
            export: "Download as Image",
            surface: "Surface",
            equationMat: "Equation Mat (=)",
            grid: "Grid",
            blank: "Blank Canvas",
            lhs: "LEFT SIDE (LHS)",
            rhs: "RIGHT SIDE (RHS)"
        }
    }[lang || 'sv'];

    const handleDownload = () => {
        const svgNode = canvasRef.current?.getSvg();
        if (!svgNode) return;

        downloadSvgAsImage(svgNode, {
            width: 1920,
            height: 1080,
            fileName: `matematik-tavla-${Date.now()}.png`,
            backgroundColor: surfaceMode === 'grid' ? '#ffffff' : '#f9fbf7'
        });
    };

    return (
        <div className="w-screen h-screen relative bg-[#f9fbf7] overflow-hidden select-none">
            {/* Top Navigation & Workspace Controls */}
            <header className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Back Button */}
                    <button 
                        type="button"
                        onClick={onBack}
                        className="px-3.5 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-bold text-xs uppercase cursor-pointer transition-colors active:scale-95"
                    >
                        <ChevronLeft size={18} />
                        <span>{t.back}</span>
                    </button>

                    {/* Clear Board Action */}
                    <button 
                        type="button"
                        onClick={() => {
                            if (elements.length === 0) return;
                            if (window.confirm(lang === 'sv' ? "Vill du rensa hela arbetsytan?" : "Clear the entire workspace?")) {
                                setElements([]);
                            }
                        }}
                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors active:scale-95"
                        title={t.clear}
                    >
                        <RotateCcw size={16} />
                    </button>

                    {/* 🟢 Export / Download Image Button */}
                    <button 
                        type="button"
                        onClick={handleDownload}
                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors active:scale-95"
                        title={t.export}
                    >
                        <Download size={16} />
                    </button>

                    {/* Surface Backdrop Selector (Non-Destructive) */}
                    <div className="flex bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm gap-1">
                        <button
                            type="button"
                            onClick={() => setSurfaceMode('equation_mat')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                surfaceMode === 'equation_mat'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title={t.equationMat}
                        >
                            <SplitSquareVertical size={14} />
                            <span className="hidden sm:inline">{t.equationMat}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSurfaceMode('grid')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                surfaceMode === 'grid'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title={t.grid}
                        >
                            <Grid3X3 size={14} />
                            <span className="hidden sm:inline">{t.grid}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSurfaceMode('blank')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                surfaceMode === 'blank'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                            title={t.blank}
                        >
                            <Minus size={14} />
                            <span className="hidden sm:inline">{t.blank}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Static Equation Divider Layer */}
            {surfaceMode === 'equation_mat' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1920 1080">
                    <line x1="960" y1="100" x2="960" y2="980" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10 10" />
                    <g transform="translate(960, 540)">
                        <circle r="28" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
                        <text textAnchor="middle" dominantBaseline="central" y="-1" fontSize="32" fontWeight="900" fill="#475569">=</text>
                    </g>
                    <text x="560" y="150" textAnchor="middle" fontSize="18" fontWeight="900" fill="#94a3b8">
                        {t.lhs}
                    </text>
                    <text x="1360" y="150" textAnchor="middle" fontSize="18" fontWeight="900" fill="#94a3b8">
                        {t.rhs}
                    </text>
                </svg>
            )}

            {/* Core Interactive Canvas with Sandbox Toolbar */}
            <InteractiveCanvas 
                ref={canvasRef}
                key="manipulatives_workspace"
                lang={lang}
                elements={elements}
                setElements={setElements}
                resolution={{ w: 1920, h: 1080 }}
                bgType={surfaceMode === 'grid' ? 'grid' : 'blank'}
                onToggleBg={() => setSurfaceMode(prev => prev === 'grid' ? 'blank' : 'grid')}
                toolbarMode="sandbox"
                showDividingLine={surfaceMode === 'equation_mat'}
            />
        </div>
    );
}