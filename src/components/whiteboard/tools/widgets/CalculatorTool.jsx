// src/components/whiteboard/tools/widgets/CalculatorTool.jsx
import React from 'react';
import { GripHorizontal, Stamp, ArrowRightLeft } from 'lucide-react';

const CALC_BUTTONS = [
    '(', ')', '^', '√',
    'AC', 'DEL', '%', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', 'π', '='
];

const CALC_W = 320;
const CALC_H = 540;

const toFraction = (decimal) => {
    if (isNaN(decimal) || !isFinite(decimal)) return null;
    if (Number.isInteger(decimal)) return `${decimal}`;
    
    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance && k1 <= 100);

    return k1 <= 100 ? `${h1}/${k1}` : null;
};

export const CalculatorTool = {
    type: 'calculator',
    hasOptions: true,

    createDefault: (id, color = '#3b82f6') => ({
        id,
        type: 'calculator',
        x: 600,
        y: 180,
        width: CALC_W,
        height: CALC_H,
        expression: "",
        result: "",
        ans: "",
        calcMode: "PEMDAS",
        displayFormat: 'decimal',
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, setElements, lang = 'sv', t }) => {
        const currentMode = el.calcMode || 'PEMDAS';
        const displayFormat = el.displayFormat || 'decimal';

        const toggleMode = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                calcMode: currentMode === 'PEMDAS' ? 'LTR' : 'PEMDAS'
            } : o));
        };

        const toggleFormat = () => {
            setElements(prev => prev.map(o => o.id === el.id ? {
                ...o,
                displayFormat: displayFormat === 'decimal' ? 'fraction' : 'decimal'
            } : o));
        };

        const stampToCanvas = () => {
            if (!el.expression && !el.result) return;
            const exprText = `${el.expression || '0'} = ${el.result || '0'}`;
            const newId = `math_${Date.now()}`;
            
            setElements(prev => [
                ...prev,
                {
                    id: newId,
                    type: 'richText',
                    x: el.x + (Number(el.width) || CALC_W) + 30,
                    y: el.y + 40,
                    text: exprText,
                    fontSize: 28,
                    fill: '#0f172a'
                }
            ]);
        };

        return (
            <div 
                className="flex items-center gap-2.5 font-sans font-bold text-sm select-none !text-slate-900" 
                style={{ color: '#0f172a' }}
            >
                <button
                    type="button"
                    onClick={toggleMode}
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        currentMode === 'PEMDAS'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                            : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    }`}
                    title={lang === 'sv' ? "Växla beräkningsordning" : "Toggle Calculation Order"}
                >
                    {currentMode === 'PEMDAS' ? 'Prioritetsregler (PEMDAS)' : 'Från vänster (L→R)'}
                </button>

                <button
                    type="button"
                    onClick={toggleFormat}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        displayFormat === 'fraction'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <ArrowRightLeft size={14} />
                    <span>{displayFormat === 'fraction' ? (lang === 'sv' ? "Bråkform" : "Fraction") : (lang === 'sv' ? "Decimalform" : "Decimal")}</span>
                </button>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                <button
                    type="button"
                    onClick={stampToCanvas}
                    disabled={!el.result}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl border border-emerald-700 font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-95"
                >
                    <Stamp size={14} />
                    <span>{lang === 'sv' ? "Stämpla" : "Stamp"}</span>
                </button>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            lang = 'sv', 
            showUI = false, 
            renderHandles = null, 
            setElements = null,
            setSelectedId = null,
            setInteractionMode = null,
            setIsDrawing = null,
            setDragOffset = null,
            getCoordinates = null
        } = options;

        if (!el) return null;

        const currentMode = el.calcMode || 'PEMDAS';
        const displayFormat = el.displayFormat || 'decimal';
        const w = Number(el.width) || CALC_W;
        const h = Number(el.height) || CALC_H;

        // Dynamic font calculations scaling proportionally with the calculator's current dimensions
        const btnFontSize = Math.max(16, Math.min(36, Math.round(w * 0.075)));
        const screenResultSize = Math.max(26, Math.min(56, Math.round(w * 0.12)));
        const screenExprSize = Math.max(14, Math.min(26, Math.round(w * 0.052)));
        const screenHeight = Math.max(90, Math.round(h * 0.22));
        const btnBevel = Math.max(2, Math.min(6, Math.round(w * 0.015)));

        const formatNumberLocale = (numStr) => {
            if (!numStr || numStr === "Error") return numStr;
            const parsed = parseFloat(numStr);
            if (displayFormat === 'fraction' && !isNaN(parsed)) {
                const frac = toFraction(parsed);
                if (frac) return frac;
            }
            return lang === 'sv' ? numStr.replace(/\./g, ',') : numStr;
        };

        const handleCalcClick = (btn) => {
            if (!setElements) return;
            setElements(prev => prev.map(o => {
                if (o.id !== el.id) return o;
                let expr = o.expression || "";
                let res = o.result || "";
                let ans = o.ans || "";

                if (btn === 'AC') {
                    expr = ""; res = "";
                } else if (btn === 'DEL') {
                    expr = expr.slice(0, -1); res = "";
                } else if (btn === '=') {
                    try {
                        let parsed = expr
                            .replace(/×/g, '*')
                            .replace(/÷/g, '/')
                            .replace(/π/g, Math.PI.toString())
                            .replace(/(\d+(\.\d+)?)%/g, (_, num) => (parseFloat(num) / 100).toString());

                        let evaluated;
                        if (currentMode === 'PEMDAS') {
                            let pemdasStr = parsed
                                .replace(/\^/g, '**')
                                .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
                                .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
                            evaluated = new Function(`return ${pemdasStr}`)();
                        } else {
                            const solveLTR = (equation) => {
                                let str = equation;
                                while (str.includes('√(')) {
                                    str = str.replace(/√\(([^()]+)\)/g, (_, inner) => Math.sqrt(solveLTR(inner)).toString());
                                }
                                while (str.includes('(')) {
                                    str = str.replace(/\(([^()]+)\)/g, (_, inner) => solveLTR(inner).toString());
                                }
                                str = str.replace(/√(\d+(?:\.\d+)?)/g, (_, num) => Math.sqrt(parseFloat(num)).toString());

                                let tokens = str.match(/\d+(?:\.\d+)?|[+\-*/^]/g);
                                if (!tokens) return parseFloat(str) || 0;

                                let result = 0;
                                let startIndex = 0;

                                if (tokens[0] === '-') {
                                    result = -parseFloat(tokens[1] || 0);
                                    startIndex = 2;
                                } else {
                                    result = parseFloat(tokens[0] || 0);
                                    startIndex = 1;
                                }

                                for (let i = startIndex; i < tokens.length; i += 2) {
                                    let op = tokens[i];
                                    let nextNumOffset = 1;
                                    let isNegative = false;
                                    if (tokens[i + 1] === '-') {
                                        isNegative = true;
                                        nextNumOffset = 2;
                                    }

                                    let nextNum = parseFloat(tokens[i + nextNumOffset] || 0);
                                    if (isNegative) nextNum = -nextNum;

                                    if (op === '+') result += nextNum;
                                    else if (op === '-') result -= nextNum;
                                    else if (op === '*') result *= nextNum;
                                    else if (op === '/') result /= nextNum;
                                    else if (op === '^') result = Math.pow(result, nextNum);

                                    if (isNegative) i++;
                                }
                                return result;
                            };
                            evaluated = solveLTR(parsed);
                        }

                        const final = Math.round(evaluated * 10000000) / 10000000;
                        res = final.toString();
                        ans = final.toString();
                    } catch (e) {
                        res = "Error";
                    }
                } else {
                    if (res !== "" && res !== "Error" && !['+', '-', '×', '÷', '^', '%'].includes(btn)) {
                        expr = btn;
                    } else if (res !== "" && res !== "Error") {
                        expr = res + btn;
                    } else {
                        expr += btn;
                    }
                    res = "";
                }
                return { ...o, expression: expr, result: res, ans: ans };
            }));
        };

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y})`} 
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar */}
                <g 
                    className="cursor-move group"
                    style={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (setSelectedId) setSelectedId(el.id);
                        if (setInteractionMode) setInteractionMode('moving');
                        if (setIsDrawing) setIsDrawing(true);
                        if (getCoordinates && setDragOffset) {
                            setDragOffset(getCoordinates(e, false));
                        }
                    }}
                >
                    <rect 
                        x={w / 2 - 50} 
                        y={-28} 
                        width={100} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 7} y={-23} />
                </g>

                {/* 2. Extrusion Base Shadow */}
                <rect 
                    x={0} 
                    y={8} 
                    width={w} 
                    height={h} 
                    rx={26} 
                    fill="#0f172a" 
                    fillOpacity="0.32" 
                    className="pointer-events-none" 
                />

                {/* 3. Main Calculator Chassis */}
                <rect 
                    x={0} 
                    y={0} 
                    width={w} 
                    height={h} 
                    fill="#1e293b" 
                    rx={26} 
                    stroke="#0f172a" 
                    strokeWidth={3} 
                    filter="drop-shadow(0 12px 28px rgba(0,0,0,0.22))"
                    className="pointer-events-none" 
                />

                {/* 4. Calculator Content Layer */}
                <foreignObject x={0} y={0} width={w} height={h} className="pointer-events-auto">
                    <div 
                        style={{ width: `${w}px`, height: `${h}px` }} 
                        className="flex flex-col p-4 pointer-events-auto select-none box-border font-sans"
                    >
                        {/* Status Header */}
                        <div className="flex justify-between items-center mb-2 px-1 ui-ignore shrink-0" onPointerDown={e => e.stopPropagation()}>
                            <span 
                                style={{ fontSize: `${Math.max(10, Math.round(w * 0.038))}px` }} 
                                className="font-black uppercase tracking-widest text-slate-400"
                            >
                                Anpassa Math
                            </span>
                            <span 
                                style={{ fontSize: `${Math.max(9, Math.round(w * 0.032))}px` }} 
                                className={`font-black uppercase px-2.5 py-0.5 rounded-full border shadow-xs tracking-wider
                                    ${currentMode === 'PEMDAS' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}
                            >
                                {currentMode === 'PEMDAS' ? 'PEMDAS' : 'L → R'}
                            </span>
                        </div>

                        {/* Scalable OLED / LCD Display Screen */}
                        <div 
                            style={{ height: `${screenHeight}px` }} 
                            className="bg-slate-950 rounded-2xl mb-3.5 p-3.5 flex flex-col justify-between items-end border-2 border-slate-700/80 shadow-inner font-mono overflow-hidden shrink-0"
                        >
                            <div 
                                style={{ fontSize: `${screenExprSize}px` }} 
                                className="text-slate-400 font-bold tracking-wider w-full text-right overflow-hidden break-all leading-tight"
                            >
                                {lang === 'sv' ? (el.expression || "0").replace(/\./g, ',') : (el.expression || "0")}
                            </div>
                            <div 
                                style={{ fontSize: `${screenResultSize}px` }} 
                                className="text-emerald-400 font-black truncate w-full text-right tracking-tight leading-none"
                            >
                                {formatNumberLocale(el.result || (el.expression ? "" : "0"))}
                            </div>
                        </div>

                        {/* Scalable 3D Button Grid */}
                        <div className="grid grid-cols-4 gap-2 flex-1 ui-ignore" onPointerDown={e => e.stopPropagation()}>
                            {CALC_BUTTONS.map(btn => {
                                let colorClass = "bg-slate-700 hover:bg-slate-600 text-white border-slate-900";

                                if (btn === 'AC' || btn === 'DEL') {
                                    colorClass = "bg-rose-600 hover:bg-rose-500 text-white border-rose-900";
                                } else if (btn === '=') {
                                    colorClass = "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-900";
                                } else if (['÷', '×', '-', '+', '^', '%', '√'].includes(btn)) {
                                    colorClass = "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-700";
                                }

                                return (
                                    <button 
                                        key={btn} 
                                        type="button"
                                        onClick={() => handleCalcClick(btn)}
                                        style={{ 
                                            fontSize: `${btnFontSize}px`,
                                            borderBottomWidth: `${btnBevel}px`
                                        }}
                                        className={`${colorClass} rounded-2xl font-black flex items-center justify-center transition-all cursor-pointer shadow-sm active:translate-y-1 active:border-b-0`}
                                    >
                                        {btn}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </foreignObject>

                {/* 5. Standard Selection Handles */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el)}
                    </g>
                )}
            </g>
        );
    }
};

export default CalculatorTool;