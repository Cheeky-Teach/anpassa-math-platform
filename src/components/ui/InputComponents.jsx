import React, { useRef, useEffect } from 'react';

// Shared helper to sanitize inner math sub-values
const cleanMathChunk = (val, allowLetters = true) => {
    if (!val) return '';
    const pattern = allowLetters 
        ? /[^a-zA-Z0-9+\-*/:.,><=^()\s]/g 
        : /[^0-9.,\-]/g;
    return String(val).replace(/<[^>]*>?/gm, '').replace(pattern, '');
};

// =====================================================================
// FRACTION INPUT COMPONENT
// =====================================================================
export const FractionInput = ({ 
    value = "", 
    onChange, 
    allowMixed = false, 
    autoFocus = false,
    disabled = false 
}) => {
    const wholeRef = useRef(null);
    const numRef = useRef(null);
    const denRef = useRef(null);

    let w = "", n = "", d = "";
    const strVal = String(value || "");

    if (strVal.includes(' ')) {
        const parts = strVal.split(' ');
        w = parts[0] || "";
        const fracPart = parts[1] || "";
        if (fracPart.includes('/')) {
            [n, d] = fracPart.split('/');
        } else {
            n = fracPart;
        }
    } else if (strVal.includes('/')) {
        [n, d] = strVal.split('/');
    } else {
        if (allowMixed) w = strVal;
        else n = strVal;
    }

    const update = (newW, newN, newD) => {
        let res = "";
        const cleanW = cleanMathChunk(newW, false);
        const cleanN = cleanMathChunk(newN, true);
        const cleanD = cleanMathChunk(newD, true);

        if (cleanW !== "") {
            res = `${cleanW} `;
        }
        if (cleanN !== "" || cleanD !== "") {
            res += `${cleanN}/${cleanD}`;
        }
        onChange(res);
    };

    useEffect(() => {
        if (autoFocus && !disabled) {
            if (allowMixed) wholeRef.current?.focus();
            else numRef.current?.focus();
        }
    }, [autoFocus, allowMixed, disabled]);

    // Handle smooth keyboard navigation between boxes
    const handleKeyDown = (e, currentBox) => {
        if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
            if (currentBox === 'whole') numRef.current?.focus();
        } else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
            if (currentBox === 'num' && allowMixed) wholeRef.current?.focus();
            if (currentBox === 'den' && allowMixed) wholeRef.current?.focus();
        } else if (e.key === 'ArrowDown' || e.key === '/' || e.key === 'Enter') {
            if (currentBox === 'whole') {
                e.preventDefault();
                numRef.current?.focus();
            } else if (currentBox === 'num') {
                e.preventDefault();
                denRef.current?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            if (currentBox === 'den') {
                e.preventDefault();
                numRef.current?.focus();
            }
        } else if (e.key === 'Backspace' && e.target.value === '') {
            if (currentBox === 'den') numRef.current?.focus();
            else if (currentBox === 'num' && allowMixed) wholeRef.current?.focus();
        }
    };

    return (
        <div className={`inline-flex items-center gap-3 font-mono text-slate-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            {allowMixed && (
                <input
                    ref={wholeRef}
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    autoComplete="off"
                    className="w-14 h-16 sm:w-16 sm:h-20 text-center border-2 border-slate-300 rounded-xl sm:rounded-2xl focus:border-indigo-500 focus:outline-none bg-white text-3xl sm:text-4xl font-black shadow-sm mr-2 transition-colors"
                    value={w}
                    onChange={(e) => update(e.target.value, n, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'whole')}
                    placeholder=""
                />
            )}
            <div className="flex flex-col items-center gap-1.5">
                <input
                    ref={numRef}
                    type="text"
                    disabled={disabled}
                    autoComplete="off"
                    className="w-16 h-11 text-center border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white font-black text-xl shadow-xs transition-colors"
                    value={n}
                    onChange={(e) => update(w, e.target.value, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'num')}
                    placeholder="t"
                />
                <div className="w-full h-1 bg-slate-800 rounded-full"></div>
                <input
                    ref={denRef}
                    type="text"
                    disabled={disabled}
                    autoComplete="off"
                    className="w-16 h-11 text-center border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white font-black text-xl shadow-xs transition-colors"
                    value={d}
                    onChange={(e) => update(w, n, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'den')}
                    placeholder="n"
                />
            </div>
        </div>
    );
};

// =====================================================================
// EXPONENT INPUT COMPONENT
// =====================================================================
export const ExponentInput = ({ 
    value = "", 
    onChange, 
    autoFocus = false,
    disabled = false 
}) => {
    const baseRef = useRef(null);
    const expRef = useRef(null);

    let base = "", exp = "";
    const strVal = String(value || "");
    
    if (strVal.includes('^')) {
        [base, exp] = strVal.split('^');
    } else {
        base = strVal;
    }

    const update = (newBase, newExp) => {
        const cleanBase = cleanMathChunk(newBase, true);
        const cleanExp = cleanMathChunk(newExp, true);
        
        if (cleanExp !== "") onChange(`${cleanBase}^${cleanExp}`);
        else onChange(cleanBase);
    };

    useEffect(() => {
        if (autoFocus && !disabled) baseRef.current?.focus();
    }, [autoFocus, disabled]);

    const handleKeyDown = (e, currentBox) => {
        if ((e.key === '^' || e.key === 'ArrowRight' || e.key === 'Enter') && currentBox === 'base') {
            e.preventDefault();
            expRef.current?.focus();
        } else if (e.key === 'ArrowLeft' && currentBox === 'exp' && e.target.selectionStart === 0) {
            e.preventDefault();
            baseRef.current?.focus();
        } else if (e.key === 'Backspace' && currentBox === 'exp' && e.target.value === '') {
            e.preventDefault();
            baseRef.current?.focus();
        }
    };

    return (
        <div className={`inline-flex items-start font-mono text-xl text-slate-800 pt-3 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <input
                ref={baseRef}
                type="text"
                disabled={disabled}
                autoComplete="off"
                className="w-16 h-12 text-center border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white text-2xl font-bold shadow-xs transition-colors"
                value={base}
                onChange={(e) => update(e.target.value, exp)}
                onKeyDown={(e) => handleKeyDown(e, 'base')}
                placeholder="x"
            />
            <input
                ref={expRef}
                type="text"
                disabled={disabled}
                autoComplete="off"
                className="w-11 h-9 text-center border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-base font-black relative -top-3 ml-1.5 shadow-sm transition-colors"
                value={exp}
                onChange={(e) => update(base, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'exp')}
                placeholder="n"
            />
        </div>
    );
};

// =====================================================================
// SCIENTIFIC NOTATION INPUT COMPONENT
// =====================================================================
export const ScientificInput = ({ 
    value = "", 
    onChange, 
    autoFocus = false,
    disabled = false 
}) => {
    const mantissaRef = useRef(null);
    const expRef = useRef(null);

    let mantissa = "", exponent = "";
    const strVal = String(value || "");

    // Supports parsing "a*10^n" or "a·10^n"
    if (strVal.includes('*10^')) {
        [mantissa, exponent] = strVal.split('*10^');
    } else if (strVal.includes('·10^')) {
        [mantissa, exponent] = strVal.split('·10^');
    } else {
        mantissa = strVal;
    }

    const update = (newM, newE) => {
        const cleanM = cleanMathChunk(newM, true);
        const cleanE = cleanMathChunk(newE, false); // Exponents in standard scientific notation are integers

        if (cleanE !== "") {
            onChange(`${cleanM}*10^${cleanE}`);
        } else {
            onChange(cleanM);
        }
    };

    useEffect(() => {
        if (autoFocus && !disabled) mantissaRef.current?.focus();
    }, [autoFocus, disabled]);

    const handleKeyDown = (e, currentBox) => {
        if ((e.key === '*' || e.key === 'ArrowRight' || e.key === 'Enter') && currentBox === 'mantissa') {
            e.preventDefault();
            expRef.current?.focus();
        } else if ((e.key === 'ArrowLeft' || (e.key === 'Backspace' && e.target.value === '')) && currentBox === 'exp') {
            e.preventDefault();
            mantissaRef.current?.focus();
        }
    };

    return (
        <div className={`inline-flex items-center font-mono text-slate-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Mantissa (a) */}
            <input
                ref={mantissaRef}
                type="text"
                disabled={disabled}
                autoComplete="off"
                className="w-20 h-14 text-center border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none bg-white text-2xl font-black shadow-xs transition-colors"
                value={mantissa}
                onChange={(e) => update(e.target.value, exponent)}
                onKeyDown={(e) => handleKeyDown(e, 'mantissa')}
                placeholder="a"
            />

            {/* Times 10 Base */}
            <span className="mx-2 text-2xl font-bold text-slate-400 select-none">· 10</span>

            {/* Exponent (n) */}
            <div className="relative -top-4">
                <input
                    ref={expRef}
                    type="text"
                    disabled={disabled}
                    autoComplete="off"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-lg font-black shadow-sm transition-colors"
                    value={exponent}
                    onChange={(e) => update(mantissa, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'exp')}
                    placeholder="n"
                />
            </div>
        </div>
    );
};