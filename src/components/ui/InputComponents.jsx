import React, { useRef, useEffect } from 'react';

// =====================================================================
// FRACTION INPUT COMPONENT
// Handles standard fractions (n/d) and mixed numbers (w n/d)
// =====================================================================

export const FractionInput = ({ value, onChange, allowMixed = false, autoFocus = false }) => {
    const wholeRef = useRef(null);
    const numRef = useRef(null);
    const denRef = useRef(null);

    // Parse the current string value into parts
    let w = "", n = "", d = "";
    
    // Handle "1 1/2" or "1/2" or "3"
    const strVal = value || "";
    if (strVal.includes(' ')) {
        const parts = strVal.split(' ');
        w = parts[0];
        if (parts[1] && parts[1].includes('/')) {
            [n, d] = parts[1].split('/');
        } else {
            n = parts[1] || "";
        }
    } else if (strVal.includes('/')) {
        [n, d] = strVal.split('/');
    } else {
        // Default behavior: treating single number as numerator
        n = strVal;
    }

    const update = (newW, newN, newD) => {
        let res = "";
        if (newW) {
            res += newW;
            if (newN || newD) res += " ";
        }
        if (newN || newD) {
            res += `${newN}/${newD}`;
        }
        onChange(res);
    };

    // Auto-focus logic
    useEffect(() => {
        if (autoFocus) {
            if (allowMixed) wholeRef.current?.focus();
            else numRef.current?.focus();
        }
    }, [autoFocus, allowMixed]);

    // Navigation Handlers
    const handleWholeKeyDown = (e) => {
        if (e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            numRef.current?.focus();
        }
    };

    const handleNumKeyDown = (e) => {
        if (e.key === '/') {
            e.preventDefault();
            denRef.current?.focus();
        }
        if (e.key === 'Backspace' && n === '') {
            if (allowMixed) {
                e.preventDefault();
                wholeRef.current?.focus();
            }
        }
        if (e.key === 'ArrowLeft' && allowMixed) {
            e.preventDefault();
            wholeRef.current?.focus();
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            denRef.current?.focus();
        }
    };

    const handleDenKeyDown = (e) => {
        if (e.key === 'Backspace' && d === '') {
            e.preventDefault();
            numRef.current?.focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            numRef.current?.focus();
        }
    };

    return (
        <div className="inline-flex items-center gap-2 font-mono text-xl text-slate-800">
            {allowMixed && (
                <input
                    ref={wholeRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-14 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-2xl"
                    value={w}
                    onChange={(e) => update(e.target.value, n, d)}
                    onKeyDown={handleWholeKeyDown}
                    placeholder="0"
                />
            )}
            
            <div className="flex flex-col items-center gap-1">
                <input
                    ref={numRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                    value={n}
                    onChange={(e) => update(w, e.target.value, d)}
                    onKeyDown={handleNumKeyDown}
                    placeholder="n"
                />
                <div className="w-full h-0.5 bg-slate-800 rounded-full"></div>
                <input
                    ref={denRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                    value={d}
                    onChange={(e) => update(w, n, e.target.value)}
                    onKeyDown={handleDenKeyDown}
                    placeholder="d"
                />
            </div>
        </div>
    );
};

// =====================================================================
// EXPONENT INPUT COMPONENT
// Handles base^power
// =====================================================================

export const ExponentInput = ({ value, onChange, autoFocus = false }) => {
    const baseRef = useRef(null);
    const expRef = useRef(null);

    // Parse "base^exp"
    let base = "", exp = "";
    const strVal = value || "";
    if (strVal.includes('^')) {
        [base, exp] = strVal.split('^');
    } else {
        base = strVal;
    }

    const update = (newBase, newExp) => {
        if (newExp) onChange(`${newBase}^${newExp}`);
        else onChange(newBase);
    };

    // Navigation
    const handleBaseKeyDown = (e) => {
        if (e.key === '^' || e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            expRef.current?.focus();
        }
    };

    const handleExpKeyDown = (e) => {
        if (e.key === 'Backspace' && exp === '') {
            e.preventDefault();
            baseRef.current?.focus();
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
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
        <div className="inline-flex items-start font-mono text-xl text-slate-800 pt-4">
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
                placeholder="n"
            />
        </div>
    );
};