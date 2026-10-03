import React, { useRef, useEffect } from 'react';
import { Plus, Undo2, Redo2 } from 'lucide-react';
import 'mathlive'; 

export default function MathScratchpad({ steps, onChange, disabled, lang = 'sv' }) {
    const mfRefs = useRef([]);

    // 🟢 1. INJECT CUSTOM SPLIT KEYBOARD (Numpad Left, Grid Right)
    useEffect(() => {
        if (window.mathVirtualKeyboard) {
            window.mathVirtualKeyboard.layouts = [
                {
                    label: 'Grundskola',
                    rows: [
                        [ 
                            "7", "8", "9", "\\div", 
                            { class: "separator", w: 0.5 },
                            { latex: "\\frac{a}{b}", insert: "\\frac{#@}{#?}", aside: lang === 'sv' ? "bråk" : "fraction" }, 
                            { latex: "\\sqrt{x}", insert: "\\sqrt{#0}", aside: lang === 'sv' ? "rot" : "root" }, 
                            "(", ")"
                        ],
                        [ 
                            "4", "5", "6", "\\cdot", 
                            { class: "separator", w: 0.5 },
                            { latex: "x^2", insert: "^2", aside: lang === 'sv' ? "kvadrat" : "square" }, 
                            { latex: "x^n", insert: "^{#?}", aside: lang === 'sv' ? "upphöjt" : "power" }, 
                            "x", "y"
                        ],
                        [ 
                            "1", "2", "3", "-", 
                            { class: "separator", w: 0.5 },
                            { latex: "\\cdot 10^n", insert: "\\cdot 10^{#?}", aside: lang === 'sv' ? "tiopotens" : "sci not" }, 
                            "\\pi", 
                            { label: '←', command: ['performWithFeedback', 'moveToPreviousChar'], class: "action" }, 
                            { label: '→', command: ['performWithFeedback', 'moveToNextChar'], class: "action" }
                        ],
                        [ 
                            "0", lang === 'sv' ? "," : ".", "=", "+", 
                            { class: "separator", w: 0.5 },
                            { label: '⌫', command: ['performWithFeedback', 'deleteBackward'], class: 'action font-bold', w: 2 }, 
                            { label: lang === 'sv' ? '↵ Ny rad' : '↵ Enter', command: ['performWithFeedback', 'commit'], class: 'action font-bold', w: 2 }
                        ]
                    ]
                }
            ];
        }
    }, [lang]);

    const handleStepChange = (val, idx) => {
        const next = [...steps];
        next[idx] = val;
        onChange(next);
    };

    const addRow = (focusIdx = null) => {
        const next = [...steps, ''];
        onChange(next);
        setTimeout(() => {
            const target = focusIdx !== null ? focusIdx : next.length - 1;
            mfRefs.current[target]?.focus();
        }, 50);
    };

    const removeRow = (idx) => {
        if (steps.length <= 1) {
            onChange(['']);
            return;
        }
        const next = steps.filter((_, i) => i !== idx);
        onChange(next);
        setTimeout(() => {
            mfRefs.current[Math.max(0, idx - 1)]?.focus();
        }, 50);
    };

    // Helper to fire commands to whichever input is actively focused
    const triggerCommand = (cmd) => {
        let target = document.activeElement;
        if (!mfRefs.current.includes(target)) {
            target = mfRefs.current[steps.length - 1]; // Default to the last field
        }
        if (target) {
            target.executeCommand(cmd);
            target.focus();
        }
    };

    // 🟢 2. LOCK DOWN & HOOK EVENTS
    useEffect(() => {
        const currentRefs = mfRefs.current;
        
        const handleInput = (e, idx) => handleStepChange(e.target.value, idx);
        
        const handleChange = (e, idx) => {
            if (document.activeElement === currentRefs[idx]) {
                addRow(idx + 1);
            }
        };

        const handleKeyDown = (e, idx) => {
            if (e.key === 'Backspace' && steps[idx] === '' && steps.length > 1) {
                e.preventDefault();
                removeRow(idx);
            }
        };

        // 🛑 PASTE BLOCKER
        const handlePaste = (e) => {
            e.preventDefault(); 
            return false;
        };

        currentRefs.forEach((mf, idx) => {
            if (!mf) return;
            
            mf.menuItems = []; 
            mf.inlineShortcuts = { '*': '\\cdot', '/': '\\div', 'pi': '\\pi' };

            mf.addEventListener('input', (e) => handleInput(e, idx));
            mf.addEventListener('change', (e) => handleChange(e, idx));
            mf.addEventListener('keydown', (e) => handleKeyDown(e, idx));
            mf.addEventListener('paste', handlePaste); // Attach paste blocker
        });

        return () => {
            currentRefs.forEach((mf, idx) => {
                if (!mf) return;
                mf.removeEventListener('input', (e) => handleInput(e, idx));
                mf.removeEventListener('change', (e) => handleChange(e, idx));
                mf.removeEventListener('keydown', (e) => handleKeyDown(e, idx));
                mf.removeEventListener('paste', handlePaste);
            });
        };
    }, [steps]);

    return (
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            
            {/* 🟢 3. SEAMLESS DARK MODE OVERRIDE */}
            <style>{`
                math-field::part(menu-toggle) {
                    display: none !important;
                }
                
                :root {
                    /* Height Adjustments */
                    --keyboard-height: 220px !important;
                    --keycap-height: 36px !important;
                    --keycap-gap: 5px !important;
                    --keycap-font-size: 1.15rem !important;
                    --keycap-small-font-size: 0.75rem !important;
                    
                    /* 🎨 SEAMLESS DARK THEME (Matches bg-slate-900) */
                    --keyboard-background: #0f172a !important; 
                    
                    /* Standard Keys (slate-800) */
                    --keycap-background: #1e293b !important;
                    --keycap-text: #f8fafc !important;
                    
                    /* Action/Modifier Keys (slate-700) */
                    --keycap-modifier-background: #334155 !important;
                    --keycap-modifier-text: #f8fafc !important;

                    /* Hint Subtext (slate-400) */
                    --keycap-secondary-text: #94a3b8 !important;
                }

                math-virtual-keyboard .separator {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    pointer-events: none !important;
                }
            `}</style>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2">
                <span className="text-xs font-bold text-slate-500">
                    {lang === 'sv' ? 'Anteckningar & uträkning' : 'Work & calculations'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    {lang === 'sv' ? 'Tryck Enter för ny rad' : 'Press Enter for new line'}
                </span>
            </div>

            {/* Structured Rows */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 pb-1">
                {(steps.length === 0 ? [''] : steps).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 text-right font-mono text-[11px] font-bold text-slate-400 select-none">
                            {idx + 1}.
                        </span>
                        <math-field
                            ref={el => (mfRefs.current[idx] = el)}
                            disabled={disabled ? "true" : undefined}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: disabled ? '#f8fafc' : '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                fontSize: '14px',
                                outline: 'none',
                                color: disabled ? '#94a3b8' : '#1e293b',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            {step}
                        </math-field>
                    </div>
                ))}
            </div>

            {/* 🟢 4. ROW CONTROLS & UNDO/REDO */}
            {!disabled && (
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => addRow()}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1 transition-colors px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md"
                        >
                            <Plus size={14} /> {lang === 'sv' ? 'Ny rad' : 'New line'}
                        </button>
                        
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); triggerCommand('undo'); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title={lang === 'sv' ? 'Ångra' : 'Undo'}
                        >
                            <Undo2 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); triggerCommand('redo'); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
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