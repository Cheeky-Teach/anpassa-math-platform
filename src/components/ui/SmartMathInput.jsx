import React, { useRef, useEffect } from 'react';
import { FractionInput, ExponentInput, ScientificInput } from './InputComponents';

/**
 * Universal mathematical input sanitizer.
 * Strips script tags, HTML tags, and harmful control characters
 * while allowing standard mathematical symbols and variable letters (a-z).
 */
export const sanitizeMathExpression = (val, maxLen = 100) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/<[^>]*>?/gm, '') // Strip any HTML/XML tags
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters
        .replace(/[^a-zA-Z0-9+\-*/:.,><=^()_\s;]/g, '') // Allow math symbols and variables (including n, x, y)
        .substring(0, maxLen);
};

export default function SmartMathInput({
    value = '',
    onChange,
    onSubmit,
    inputType = 'text',
    disabled = false,
    autoFocus = false,
    placeholder = 'Ditt svar...',
    className = '',
    inputRef: externalRef,
    isMobile = false
}) {
    const localRef = useRef(null);
    const activeRef = externalRef || localRef;

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
    if (inputType === 'mixed_fraction') {
        return (
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
                <div className="transform origin-center">
                    <FractionInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        allowMixed={true} 
                        autoFocus={autoFocus && !isMobile} 
                    />
                </div>
            </div>
        );
    }

    if (inputType === 'fraction') {
        return (
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
                <div className="transform origin-center">
                    <FractionInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        allowMixed={false} 
                        autoFocus={autoFocus && !isMobile} 
                    />
                </div>
            </div>
        );
    }

    if (inputType === 'exponent' || inputType === 'structured_power') {
        return (
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
                <div className="transform origin-center">
                    <ExponentInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        autoFocus={autoFocus && !isMobile} 
                    />
                </div>
            </div>
        );
    }

    if (inputType === 'scientific' || inputType === 'structured_scientific') {
        return (
            <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full">
                <div className="transform origin-center">
                    <ScientificInput 
                        value={value} 
                        onChange={(val) => onChange(sanitizeMathExpression(val, 30))} 
                        autoFocus={autoFocus && !isMobile} 
                    />
                </div>
            </div>
        );
    }

    if (inputType === 'free_text') {
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

    // 2. Standard Text/Formula Input (Allows numbers, operators, and variables like 'n', 'x', 'y')
    return (
        <input
            ref={activeRef}
            type="text"
            inputMode="text" // Enables full keyboard on mobile for variables (3n+2, 2x+1)
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