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
    // Formats: "3/4", "1 1/2", "5"
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
        // If it's just a number, deciding where it goes depends on context, 
        // but usually for a fraction input, we assume it's the numerator until a slash is typed?
        // Actually, safer to rely on internal state for typing, but here we are controlled.
        // Let's assume if it's "3", it's the numerator of an incomplete fraction or a whole number.
        // For simplicity in this controlled component, we map 'n' to the value if no slash.
        n = value;
    }

    // Update parent with the constructed string
    const update = (newW: string, newN: string, newD: string) => {
        let res = "";
        if (newW) res += `${newW} `;
        if (newN || newD) res += `${newN}/${newD}`;
        onChange(res.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: 'w' | 'n' | 'd') => {
        // Slash navigation
        if (e.key === '/' || e.key === 'Divide') {
            e.preventDefault();
            if (field === 'w') numRef.current?.focus();
            if (field === 'n') denRef.current?.focus();
        }
        // Backspace navigation
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
        <div className="inline-flex items-center gap-2 font-mono text-xl">
            {/* Mixed Number (Whole) Part */}
            {allowMixed && (
                <input
                    ref={wholeRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-12 text-center border-2 border-slate-300 rounded focus:border-blue-500 focus:outline-none"
                    value={w}
                    onChange={(e) => update(e.target.value, n, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'w')}
                    placeholder="#"
                />
            )}

            {/* Fraction Part (Stack) */}
            <div className="flex flex-col items-center justify-center">
                {/* Numerator */}
                <input
                    ref={numRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded-t focus:border-blue-500 focus:outline-none focus:z-10"
                    value={n}
                    onChange={(e) => update(w, e.target.value, d)}
                    onKeyDown={(e) => handleKeyDown(e, 'n')}
                    placeholder="n"
                />
                
                {/* Vinculum */}
                <div className="w-full h-0.5 bg-slate-800 my-0.5"></div>
                
                {/* Denominator */}
                <input
                    ref={denRef}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-10 text-center border-2 border-slate-300 rounded-b focus:border-blue-500 focus:outline-none focus:z-10"
                    value={d}
                    onChange={(e) => update(w, n, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'd')}
                    placeholder="d"
                />
            </div>
        </div>
    );
};