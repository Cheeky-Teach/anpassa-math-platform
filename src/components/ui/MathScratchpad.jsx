import React, { useRef, useEffect } from 'react';
import { Plus, Undo2, Redo2 } from 'lucide-react';
import 'mathlive'; 

export default function MathScratchpad({ steps, onChange, disabled, lang = 'sv' }) {
    const mfRefs = useRef([]);
    const stepsRef = useRef(steps);
    const isAddingRef = useRef(false);

    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    // Custom Split Keyboard
    useEffect(() => {
        if (window.mathVirtualKeyboard) {
            window.mathVirtualKeyboard.layouts = [
                {
                    label: 'Grundskola',
                    rows: [
                        [ 
                            { class: "separator", w: 1 }, { class: "separator", w: 1 }, "7", "8", "9", "\\div", 
                            { class: "separator", w: 0.5 },
                            { latex: "\\frac{a}{b}", insert: "\\frac{#@}{#?}", aside: lang === 'sv' ? "bråk" : "fraction" }, 
                            { latex: "\\sqrt{x}", insert: "\\sqrt{#0}", aside: lang === 'sv' ? "rot" : "root" }, 
                            "(", ")"
                        ],
                        [ 
                            { class: "separator", w: 1 }, { class: "separator", w: 1 }, "4", "5", "6", "\\cdot", 
                            { class: "separator", w: 0.5 },
                            { latex: "x^2", insert: "^2", aside: lang === 'sv' ? "kvadrat" : "square" }, 
                            { latex: "x^n", insert: "^{#?}", aside: lang === 'sv' ? "upphöjt" : "power" }, 
                            "x", "y"
                        ],
                        [ 
                            { class: "separator", w: 1 }, { class: "separator", w: 1 }, "1", "2", "3", "-", 
                            { class: "separator", w: 0.5 },
                            { latex: "\\cdot 10^n", insert: "\\cdot 10^{#?}", aside: lang === 'sv' ? "tiopotens" : "sci not" }, 
                            "\\pi", 
                            { label: '←', command: ['performWithFeedback', 'moveToPreviousChar'], class: "action" }, 
                            { label: '→', command: ['performWithFeedback', 'moveToNextChar'], class: "action" }
                        ],
                        [ 
                            { label: "0", insert: "0", w: 2 }, (lang === 'sv' ? "," : "."), "=", "+", 
                            { class: "separator", w: 0.5 },
                            { label: '⌫', command: ['performWithFeedback', 'deleteBackward'], class: 'action font-bold', w: 2 }, 
                            { label: lang === 'sv' ? '↵ Ny rad' : '↵ Enter', insert: '§', class: 'action font-bold', w: 2 }
                        ]
                    ]
                }
            ];
        }
    }, [lang]);

    const triggerCommand = (cmd) => {
        let target = document.activeElement;
        if (!mfRefs.current.includes(target)) {
            target = mfRefs.current[steps.length - 1]; 
        }
        if (target) {
            target.executeCommand(cmd);
            target.focus();
        }
    };

    // Event Hooking
    useEffect(() => {
        const currentRefs = mfRefs.current;
        
        const handleInput = (e, idx) => {
            let val = e.target.value;
            const currentSteps = [...stepsRef.current];
            
            if (val.includes('§')) {
                val = val.replace(/§/g, ''); 
                e.target.value = val;
                currentSteps[idx] = val;
                
                if (!isAddingRef.current) {
                    isAddingRef.current = true;
                    currentSteps.splice(idx + 1, 0, '');
                    onChange(currentSteps);
                    setTimeout(() => { 
                        mfRefs.current[idx + 1]?.focus();
                        isAddingRef.current = false; 
                    }, 50);
                }
                return;
            }
            
            currentSteps[idx] = val;
            onChange(currentSteps);
        };

        let lastDeleteTime = 0;
        const handleKeyDown = (e, idx) => {
            const mf = currentRefs[idx];
            
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isAddingRef.current) {
                    isAddingRef.current = true;
                    const currentSteps = [...stepsRef.current];
                    currentSteps.splice(idx + 1, 0, '');
                    onChange(currentSteps);
                    setTimeout(() => { 
                        mfRefs.current[idx + 1]?.focus();
                        isAddingRef.current = false; 
                    }, 50);
                }
            } else if (e.key === 'Backspace') {
                if (mf.value === '' && stepsRef.current.length > 1) {
                    const now = Date.now();
                    if (now - lastDeleteTime > 400) { 
                        e.preventDefault();
                        const currentSteps = stepsRef.current.filter((_, i) => i !== idx);
                        onChange(currentSteps);
                        setTimeout(() => { 
                            mfRefs.current[Math.max(0, idx - 1)]?.focus();
                        }, 50);
                        lastDeleteTime = now;
                    } else {
                        e.preventDefault();
                    }
                }
            }
        };

        const handlePaste = (e) => {
            e.preventDefault(); 
            return false;
        };

        currentRefs.forEach((mf, idx) => {
            if (!mf) return;
            mf.menuItems = []; 
            mf.inlineShortcuts = { '*': '\\cdot', '/': '\\div', 'pi': '\\pi' };

            mf.addEventListener('input', (e) => handleInput(e, idx));
            mf.addEventListener('keydown', (e) => handleKeyDown(e, idx));
            mf.addEventListener('paste', handlePaste);
        });

        return () => {
            currentRefs.forEach((mf, idx) => {
                if (!mf) return;
                mf.removeEventListener('input', (e) => handleInput(e, idx));
                mf.removeEventListener('keydown', (e) => handleKeyDown(e, idx));
                mf.removeEventListener('paste', handlePaste);
            });
        };
    }, [steps.length]);

    // State Sync
    useEffect(() => {
        mfRefs.current.forEach((mf, idx) => {
            if (mf && steps[idx] !== undefined && mf.value !== steps[idx]) {
                mf.value = steps[idx];
            }
        });
    }, [steps]);

    return (
        /* 🟢 STRICT WHITE CARD: Immune to dark mode */
        <div className="flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm select-none">
            
            <style>{`
                /* 🟢 FORCE LIGHT SCHEME & PREVENT SQUISHING */
                math-field {
                    display: block !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    color-scheme: light !important;
                    --mathfield-text-color: #0f172a !important;
                    --mathfield-caret-color: #4f46e5 !important;
                    --mathfield-background: #ffffff !important;
                    color: #0f172a !important;
                }
                
                math-field::part(menu-toggle) {
                    display: none !important;
                }

                :root {
                    --keyboard-height: 220px !important;
                    --keycap-height: 36px !important;
                    --keycap-gap: 5px !important;
                    --keycap-font-size: 1.15rem !important;
                    --keycap-small-font-size: 0.75rem !important;
                    --keyboard-background: #0f172a !important; 
                    --keycap-background: #1e293b !important;
                    --keycap-text: #f8fafc !important;
                    --keycap-modifier-background: #334155 !important;
                    --keycap-modifier-text: #f8fafc !important;
                    --keycap-secondary-text: #94a3b8 !important;
                    --keycap-aside-font-size: 0.65rem !important;
                    --keycap-aside-bottom: 2px !important;
                }

                math-virtual-keyboard .separator {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    pointer-events: none !important;
                }
            `}</style>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                <span className="text-xs font-bold text-slate-700">
                    {lang === 'sv' ? 'Anteckningar & uträkning' : 'Work & calculations'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    {lang === 'sv' ? 'Tryck Enter för ny rad' : 'Press Enter for new line'}
                </span>
            </div>

            {/* Structured Rows */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pb-1 custom-scrollbar">
                {(steps.length === 0 ? [''] : steps).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 w-full">
                        <span className="w-5 text-right font-mono text-[11px] font-bold text-slate-400 select-none shrink-0">
                            {idx + 1}.
                        </span>
                        
                        {/* 🟢 Rigid flex item wrapper prevents custom element collapse */}
                        <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-50 transition-all shadow-2xs">
                            <math-field
                                ref={el => (mfRefs.current[idx] = el)}
                                disabled={disabled ? "true" : undefined}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    backgroundColor: disabled ? '#f8fafc' : '#ffffff'
                                }}
                            ></math-field>
                        </div>
                    </div>
                ))}
            </div>

            {/* ROW CONTROLS & UNDO/REDO */}
            {!disabled && (
                <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const next = [...stepsRef.current, ''];
                                onChange(next);
                                setTimeout(() => mfRefs.current[next.length - 1]?.focus(), 50);
                            }}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1 transition-colors px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer active:scale-95"
                        >
                            <Plus size={14} /> {lang === 'sv' ? 'Ny rad' : 'New line'}
                        </button>
                        
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); triggerCommand('undo'); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title={lang === 'sv' ? 'Ångra' : 'Undo'}
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); triggerCommand('redo'); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title={lang === 'sv' ? 'Gör om' : 'Redo'}
                        >
                            <Redo2 size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}