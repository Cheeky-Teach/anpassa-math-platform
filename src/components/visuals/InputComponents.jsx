import React, { useRef, useEffect } from 'react';

// =====================================================================
// FRACTION INPUT COMPONENT
// Handles standard fractions (n/d) and mixed numbers (w n/d)
// Features: 
// - Visual separator line
// - Slash ('/') navigation
// - Tab navigation
// =====================================================================

interface FractionInputProps {
    value: string; // Expected format: "n/d" or "w n/d" or just "n"
    onChange: (val: string) => void;
    allowMixed?: boolean;
    autoFocus?: boolean;
}

export const FractionInput: React.FC<FractionInputProps> = ({ value, onChange, allowMixed = false, autoFocus = false }) => {
    const wholeRef = useRef<HTMLInputElement>(null);
    const numRef = useRef<HTMLInputElement>(null);
    const denRef = useRef<HTMLInputElement>(null);

    // Parse the current string value into parts
    let w = "", n = "", d = "";
    
    if (value.includes(' ')) {
        const parts = value.split(' ');
        w = parts[0];
        if (parts[1].includes('/')) {
            [n, d] = parts[1].split('/');
        }
    } else if (value.includes('/')) {
        [n, d] = value.split('/');
    } else {
        n = value;
    }

    const update = (newW: string, newN: string, newD: string) => {
        let res = "";
        if (newW) res += `${newW} `;
        if (newN || newD) res += `${newN}/${newD}`;
        onChange(res.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: 'w' | 'n' | 'd') => {
        if (e.key === '/' || e.key === 'Divide') {
            e.preventDefault();
            if (field === 'w') numRef.current?.focus();
            if (field === 'n') denRef.current?.focus();
        }
        if (e.key === 'Backspace') {
            if (field === 'd' && d === '') {
                e.preventDefault();
                numRef.current?.focus();
            }
            if (field === 'n' && n === '' && allowMixed) {
                e.preventDefault();
                wholeRef.current?.focus();
            }
        }
    };

    useEffect(() => {
        if (autoFocus) {
            if (allowMixed) wholeRef.current?.focus();
            else numRef.current?.focus();
        }
    }, [autoFocus, allowMixed]);

    return (
        <div className="inline-flex items-center gap-2 font-mono text-xl text-slate-800">
            {/* Mixed Number (Whole) Part */}
            {allowMixed && (
                <input
                    ref={wholeRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-12 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                    value={w}
                    onChange={(e) => update(e.target.value, n, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'w')}
                    placeholder="#"
                />
            )}

            {/* Fraction Part (Stack) */}
            <div className="flex flex-col items-center justify-center">
                <input
                    ref={numRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded-t focus:border-blue-500 focus:outline-none focus:z-10 bg-white"
                    value={n}
                    onChange={(e) => update(w, e.target.value, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'n')}
                    placeholder="n"
                />
                
                <div className="w-full h-0.5 bg-slate-800 my-0.5"></div>
                
                <input
                    ref={denRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded-b focus:border-blue-500 focus:outline-none focus:z-10 bg-white"
                    value={d}
                    onChange={(e) => update(w, n, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'd')}
                    placeholder="d"
                />
            </div>
        </div>
    );
};

// =====================================================================
// EXPONENT INPUT COMPONENT
// Handles powers (base^exponent)
// Features: 
// - Base number input
// - Superscript exponent input
// - Caret ('^') navigation
// =====================================================================

interface ExponentInputProps {
    value: string; // Expected format: "base^exponent" e.g. "10^2"
    onChange: (val: string) => void;
    autoFocus?: boolean;
}

export const ExponentInput: React.FC<ExponentInputProps> = ({ value, onChange, autoFocus = false }) => {
    const baseRef = useRef<HTMLInputElement>(null);
    const expRef = useRef<HTMLInputElement>(null);

    // Parse value: "base^exp"
    let base = "";
    let exp = "";

    if (value.includes('^')) {
        [base, exp] = value.split('^');
    } else {
        base = value;
    }

    const update = (newBase: string, newExp: string) => {
        // If exponent exists, join with caret, otherwise just base
        if (newExp) {
            onChange(`${newBase}^${newExp}`);
        } else {
            onChange(newBase);
        }
    };

    const handleBaseKeyDown = (e: React.KeyboardEvent) => {
        // Allow user to jump to exponent by typing '^'
        if (e.key === '^' || (e.shiftKey && e.key === '6')) {
            e.preventDefault();
            expRef.current?.focus();
        }
    };

    const handleExpKeyDown = (e: React.KeyboardEvent) => {
        // Backspace on empty exponent jumps back to base
        if (e.key === 'Backspace' && exp === '') {
            e.preventDefault();
            baseRef.current?.focus();
        }
    };

    useEffect(() => {
        if (autoFocus) {
            baseRef.current?.focus();
        }
    }, [autoFocus]);

    return (
        <div className="inline-flex items-start font-mono text-xl text-slate-800">
            {/* Base Number */}
            <input
                ref={baseRef}
                type="text"
                inputMode="text"
                className="w-16 h-12 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-2xl"
                value={base}
                onChange={(e) => update(e.target.value, exp)}
                onKeyDown={handleBaseKeyDown}
                placeholder="x"
            />

            {/* Exponent (Superscript) */}
            <input
                ref={expRef}
                type="text"
                inputMode="numeric"
                className="w-10 h-8 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-sm relative -top-3 ml-1 shadow-sm"
                value={exp}
                onChange={(e) => update(base, e.target.value)}
                onKeyDown={handleExpKeyDown}
                placeholder="y"
            />
        </div>
    );
};