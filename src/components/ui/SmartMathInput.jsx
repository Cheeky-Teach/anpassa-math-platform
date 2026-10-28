// src/components/ui/SmartMathInput.jsx
import React, { useRef, useEffect } from 'react';
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

    // 1. Specialized inputs from InputComponents
    if (effectiveType === 'mixed_fraction') {
        return (
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
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
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
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
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
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
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
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
                className={`w-full h-36 bg-[var(--bg-surface)] border-2 border-[var(--border-main)] rounded-[var(--radius-btn)] p-4 font-medium text-base outline-none focus:border-[var(--brand-solid)] transition-all resize-none shadow-inner ${className}`}
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
            className={`w-full p-4 text-center text-2xl font-black border-[3px] rounded-[var(--radius-btn)] outline-none shadow-inner transition-all border-[var(--border-main)] bg-[var(--bg-surface)] focus:border-[var(--brand-text)] focus:bg-[var(--bg-card)] text-[var(--text-main)] ${className}`}
        />
    );
}