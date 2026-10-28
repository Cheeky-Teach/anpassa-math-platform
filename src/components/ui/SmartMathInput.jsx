// src/components/ui/SmartMathInput.jsx
import React, { useRef } from 'react';
import { FractionInput, ExponentInput, ScientificInput } from './InputComponents';

export const sanitizeMathExpression = (val, maxLen = 100) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/<[^>]*>?/gm, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/[^a-zA-Z0-9+\-*/:.,><=^()_\s;]/g, '')
        .substring(0, maxLen);
};

export default function SmartMathInput({
    value = '',
    onChange,
    onSubmit,
    inputType,          // explicit inputType prop
    answerType,         // fallback from question.answerType
    renderData,         // fallback from question.resolvedData.renderData
    disabled = false,
    autoFocus = false,
    placeholder = 'Ditt svar...',
    className = '',
    inputRef: externalRef,
    isMobile = false
}) {
    const localRef = useRef(null);
    const activeRef = externalRef || localRef;

    // 🟢 Resolve the effective type from any incoming prop format
    const effectiveType = (() => {
        const raw = inputType || answerType || renderData?.inputType || renderData?.answerType || renderData?.inputMode || 'text';
        
        // Normalize Swedish / variation aliases
        if (raw === 'brak' || raw === 'fraction') {
            return renderData?.allowMixed ? 'mixed_fraction' : 'fraction';
        }
        if (raw === 'grundpotensform' || raw === 'scientific') return 'scientific';
        if (raw === 'potens' || raw === 'exponent') return 'exponent';
        return raw;
    })();

    const handleTextChange = (e) => {
        const clean = sanitizeMathExpression(e.target.value, 100);
        onChange(clean);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSubmit && !disabled) {
            e.preventDefault();
            onSubmit();
        }
    };

    // Shared container class for specialized fraction/exponent/scientific widgets
    const specializedWrapperClass = `flex justify-center py-4 bg-slate-50 border-2 border-dashed border-slate-300 text-slate-900 rounded-[var(--radius-btn)] shadow-inner w-full ${className}`;

    // 1. Specialized inputs from InputComponents
    if (effectiveType === 'mixed_fraction') {
        return (
            <div className={specializedWrapperClass}>
                <div className="transform origin-center">
                    <FractionInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        allowMixed={true} 
                        autoFocus={autoFocus && !isMobile} 
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    if (effectiveType === 'fraction') {
        return (
            <div className={specializedWrapperClass}>
                <div className="transform origin-center">
                    <FractionInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        allowMixed={false} 
                        autoFocus={autoFocus && !isMobile} 
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    if (effectiveType === 'exponent' || effectiveType === 'structured_power') {
        return (
            <div className={specializedWrapperClass}>
                <div className="transform origin-center">
                    <ExponentInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        autoFocus={autoFocus && !isMobile} 
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    if (effectiveType === 'scientific' || effectiveType === 'structured_scientific') {
        return (
            <div className={specializedWrapperClass}>
                <div className="transform origin-center">
                    <ScientificInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        autoFocus={autoFocus && !isMobile} 
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    if (effectiveType === 'free_text') {
        return (
            <textarea
                ref={activeRef}
                autoFocus={autoFocus && !isMobile}
                disabled={disabled}
                value={value}
                maxLength={1500}
                onChange={(e) => onChange(e.target.value.replace(/<[^>]*>?/gm, '').substring(0, 1500))}
                placeholder={placeholder}
                className={`w-full h-36 bg-white border-2 border-slate-300 text-slate-900 placeholder-slate-400 rounded-[var(--radius-btn)] p-4 font-medium text-base outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none shadow-inner ${className}`}
            />
        );
    }

    // 2. Standard Text/Formula Input
    return (
        <input
            ref={activeRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            autoFocus={autoFocus && !isMobile}
            disabled={disabled}
            value={value}
            maxLength={100}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-4 text-center text-2xl font-black border-[3px] rounded-[var(--radius-btn)] outline-none shadow-inner transition-all border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white ${className}`}
        />
    );
}