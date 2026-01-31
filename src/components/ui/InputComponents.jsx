import React, { useRef, useEffect } from 'react';

// =====================================================================
// FRACTION INPUT COMPONENT
// =====================================================================
export const FractionInput = ({ value, onChange, allowMixed = false, autoFocus = false }) => {
    const wholeRef = useRef(null);
    const numRef = useRef(null);
    const denRef = useRef(null);

    // Safe parsing of the value
    let w = "", n = "", d = "";
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

    return (
        <div className="inline-flex items-center gap-2 font-mono text-xl text-slate-800">
            {allowMixed && (
                <input
                    ref={wholeRef}
                    className="w-12 h-14 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-2xl"
                    value={w}
                    onChange={(e) => update(e.target.value, n, d)}
                    placeholder="0"
                />
            )}
            <div className="flex flex-col items-center gap-1">
                <input
                    ref={numRef}
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                    value={n}
                    onChange={(e) => update(w, e.target.value, d)}
                    placeholder="n"
                />
                <div className="w-full h-0.5 bg-slate-800 rounded-full"></div>
                <input
                    ref={denRef}
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white"
                    value={d}
                    onChange={(e) => update(w, n, e.target.value)}
                    placeholder="d"
                />
            </div>
        </div>
    );
};

// =====================================================================
// EXPONENT INPUT COMPONENT
// =====================================================================
export const ExponentInput = ({ value, onChange, autoFocus = false }) => {
    const baseRef = useRef(null);
    const expRef = useRef(null);

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

    useEffect(() => {
        if (autoFocus) baseRef.current?.focus();
    }, [autoFocus]);

    return (
        <div className="inline-flex items-start font-mono text-xl text-slate-800 pt-4">
            <input
                ref={baseRef}
                className="w-16 h-12 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-2xl"
                value={base}
                onChange={(e) => update(e.target.value, exp)}
                placeholder="x"
            />
            <input
                ref={expRef}
                className="w-10 h-8 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-white text-sm relative -top-3 ml-1 shadow-sm"
                value={exp}
                onChange={(e) => update(base, e.target.value)}
                placeholder="n"
            />
        </div>
    );
};