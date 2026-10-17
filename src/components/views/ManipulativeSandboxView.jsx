// src/components/views/ManipulativeSandboxView.jsx
import React, { useState } from 'react';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import { ChevronLeft, RotateCcw, PieChart, Layers, Compass, SplitSquareVertical } from 'lucide-react';

const LAB_META = {
  fractions: { labelSv: 'Bråklabb', labelEn: 'Fraction Lab', icon: PieChart },
  algebra_tiles: { labelSv: 'Algebrabrickor', labelEn: 'Algebra Tiles', icon: Layers },
  geometry: { labelSv: 'Geometri & Koordinater', labelEn: 'Geometry Lab', icon: Compass }
};

export default function ManipulativeSandboxView({ labType: initialLab = 'fractions', lang = 'sv', onBack }) {
  const [activeLab, setActiveLab] = useState(initialLab);
  const [showDividingLine, setShowDividingLine] = useState(true);
  const [elements, setElements] = useState([]);

  return (
    <div className="w-screen h-screen relative bg-[#f9fbf7] overflow-hidden select-none">
      {/* Top Header Navigation */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            type="button"
            onClick={onBack}
            className="px-3.5 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-bold text-xs uppercase cursor-pointer"
          >
            <ChevronLeft size={18} />
            {lang === 'sv' ? "Tillbaka" : "Back"}
          </button>

          <button 
            type="button"
            onClick={() => setElements([])}
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-bold text-xs uppercase cursor-pointer"
            title="Rensa"
          >
            <RotateCcw size={16} />
          </button>

          {activeLab === 'algebra_tiles' && (
            <button
              type="button"
              onClick={() => setShowDividingLine(!showDividingLine)}
              className={`px-3 py-2 rounded-2xl shadow-sm border flex items-center gap-1.5 font-bold text-xs uppercase cursor-pointer ${
                showDividingLine
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SplitSquareVertical size={16} />
              <span>{showDividingLine ? "Ekvationsmatta (=)" : "Öppen yta"}</span>
            </button>
          )}
        </div>

        {/* Lab Switcher */}
        <div className="flex bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm pointer-events-auto gap-1">
          {Object.entries(LAB_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const isActive = activeLab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { setActiveLab(key); setElements([]); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{lang === 'sv' ? meta.labelSv : meta.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Static Equation Divider */}
      {activeLab === 'algebra_tiles' && showDividingLine && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1920 1080">
          <line x1="960" y1="100" x2="960" y2="980" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10 10" />
          <g transform="translate(960, 540)">
            <circle r="28" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" />
            <text textAnchor="middle" dominantBaseline="central" y="-1" fontSize="32" fontWeight="900" fill="#475569">=</text>
          </g>
          <text x="560" y="150" textAnchor="middle" fontSize="18" fontWeight="900" fill="#94a3b8">VÄNSTER LED (VL)</text>
          <text x="1360" y="150" textAnchor="middle" fontSize="18" fontWeight="900" fill="#94a3b8">HÖGER LED (HL)</text>
        </svg>
      )}

      {/* 🟢 Unified Canvas handles Toolbar, Drawers, and Bins out of the box */}
      <InteractiveCanvas 
        key={`canvas_${activeLab}`}
        lang={lang}
        elements={elements}
        setElements={setElements}
        resolution={{ w: 1920, h: 1080 }}
        toolbarMode={activeLab} 
        showDividingLine={showDividingLine}
      />
    </div>
  );
}