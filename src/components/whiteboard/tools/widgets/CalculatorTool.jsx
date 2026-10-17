// src/components/whiteboard/tools/widgets/CalculatorTool.jsx
import React from 'react';

const CALC_BUTTONS = [
    '(', ')', '^', '√',
    'AC', 'DEL', '%', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', 'π', '='
];

export const CalculatorTool = {
    type: 'calculator',
    hasOptions: false,

    createDefault: (id, color) => ({
        id,
        type: 'calculator',
        x: 600,
        y: 300,
        width: 280,
        height: 440,
        expression: "",
        result: "",
        ans: "",
        calcMode: "LTR",
        stroke: color,
        rotation: 0,
        opacity: 1
    }),

    render: ({ el, lang, transform, showUI, renderHandles, setElements }) => {
        const currentMode = el.calcMode || 'LTR';

        const handleCalcClick = (btn) => {
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
            <React.Fragment key={el.id}>
                <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#1e293b" rx={24 * (el.width / 280)} stroke="#334155" strokeWidth="6" className="shadow-2xl" />
                    
                    <foreignObject x={el.x} y={el.y} width={el.width} height={el.height}>
                        <div 
                            style={{ width: '280px', height: '440px', transform: `scale(${el.width / 280})`, transformOrigin: 'top left' }} 
                            className="flex flex-col p-5 pointer-events-auto"
                        >
                            <div className="flex justify-between items-center mb-2 px-1 ui-ignore" onPointerDown={e => e.stopPropagation()}>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Anpassa</span>
                                <button 
                                    onClick={() => setElements(prev => prev.map(o => o.id === el.id ? { ...o, calcMode: currentMode === 'LTR' ? 'PEMDAS' : 'LTR' } : o))}
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-inner transition-colors cursor-pointer
                                        ${currentMode === 'LTR' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}
                                    title={lang === 'sv' ? "Ändra beräkningsordning" : "Toggle Calculation Order"}
                                >
                                    {currentMode === 'LTR' ? 'L->R MODE' : 'PEMDAS MODE'}
                                </button>
                            </div>

                            <div className="bg-white rounded-xl h-32 mb-5 p-4 flex flex-col justify-between items-end border-4 border-slate-200 shadow-inner font-mono overflow-hidden shrink-0">
                                <div className="text-slate-500 font-bold text-3xl tracking-widest w-full text-right overflow-hidden break-all">
                                    {el.expression}
                                </div>
                                <div className="text-slate-900 text-5xl font-black truncate w-full text-right mt-1">
                                    {el.result}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2.5 flex-1 ui-ignore" onPointerDown={e => e.stopPropagation()}>
                                {CALC_BUTTONS.map(btn => {
                                    let bg = "bg-slate-200 hover:bg-slate-300 text-slate-800 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1";
                                    if (btn === 'AC' || btn === 'DEL') bg = "bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700 active:border-b-0 active:translate-y-1";
                                    if (btn === '=') bg = "bg-indigo-500 hover:bg-indigo-600 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1";
                                    if (['÷', '×', '-', '+'].includes(btn)) bg = "bg-amber-400 hover:bg-amber-500 text-slate-900 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1";

                                    return (
                                        <button 
                                            key={btn} 
                                            onClick={() => handleCalcClick(btn)}
                                            className={`${bg} rounded-xl font-black text-lg shadow-sm flex items-center justify-center transition-all cursor-pointer`}
                                        >
                                            {btn}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </foreignObject>
                </g>
                {showUI && renderHandles(el)}
            </React.Fragment>
        );
    }
};