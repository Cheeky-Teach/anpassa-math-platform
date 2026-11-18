// src/components/shared/QuestionResponseBox.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react';
import MathDisplay from './MathDisplay';
import SmartMathInput from '../ui/SmartMathInput';
import { FractionInput, ScientificInput, ExponentInput } from '../ui/InputComponents';

const sanitizeMathInput = (val) => String(val ?? '').replace(/[^a-zA-Z0-9+\-*/:.,><=^()\s]/g, '');

export default function QuestionResponseBox({
    question,
    value = '',
    onChange,
    onSubmit,
    onAdvance,
    feedback = null,       // null | 'correct' | 'incorrect' | 'submitted'
    disabled = false,
    isSubmitting = false,
    lang = 'sv',
    isMobile = false,
    autoFocus = true,
    submitLabel = null,
    submittedMessage = null,
    className = ''
}) {
    const inputRef = useRef(null);

    const rd = useMemo(() => {
        if (!question) return {};
        return question.resolvedData?.renderData || question.renderData || question;
    }, [question]);

    const answerType = useMemo(() => {
        if (rd?.answerType === 'multiple_choice' || (Array.isArray(rd?.options) && rd.options.length > 0)) {
            return 'multiple_choice';
        }
        return (
            question?.answerType ||
            question?.inputType ||
            rd?.answerType ||
            rd?.inputType ||
            rd?.inputMode ||
            'text'
        );
    }, [question, rd]);

    const isLocked = disabled || isSubmitting || feedback === 'correct' || feedback === 'submitted';

    useEffect(() => {
        if (autoFocus && !isMobile && !isLocked && answerType !== 'multiple_choice') {
            const timer = setTimeout(() => {
                inputRef.current?.focus?.();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [question, autoFocus, isMobile, isLocked, answerType]);

    const handleFormSubmit = (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (feedback === 'correct' && typeof onAdvance === 'function') {
            onAdvance();
            return;
        }
        if (!isLocked && String(value).trim().length > 0 && typeof onSubmit === 'function') {
            onSubmit(value);
        }
    };

    const handleChoiceSelect = (choiceValue) => {
        if (isLocked) return;
        if (typeof onChange === 'function') onChange(choiceValue);
        if (typeof onSubmit === 'function') onSubmit(choiceValue);
    };

    const resolvedSubmitLabel = useMemo(() => {
        if (submitLabel) return submitLabel;
        if (feedback === 'correct') return lang === 'sv' ? 'Nästa ➡' : 'Next ➡';
        if (feedback === 'incorrect') return lang === 'sv' ? 'Försök igen' : 'Try again';
        return lang === 'sv' ? 'Svara' : 'Submit';
    }, [submitLabel, feedback, lang]);

    // 1. Deferred / Silent Submission Banner (Checkpoints, Exam Mode, Live Sessions)
    if (feedback === 'submitted') {
        return (
            <div className={`w-full max-w-md mx-auto animate-in zoom-in-95 duration-150 ${className}`}>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2.5 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {submittedMessage || (lang === 'sv' ? 'Svar mottaget' : 'Answer received')}
                    </span>
                </div>
            </div>
        );
    }

    // 2. Multiple Choice Grid
    if (answerType === 'multiple_choice') {
        const options = Array.isArray(rd?.options) ? rd.options : [];
        return (
            <div className={`w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
                {options.map((choiceItem, idx) => {
                    const choiceLabel = typeof choiceItem === 'object' ? choiceItem.label : choiceItem;
                    const choiceValue = typeof choiceItem === 'object' ? (choiceItem.value ?? choiceItem.id) : choiceItem;

                    const isSelected = String(choiceValue) === String(value);
                    const isCorrect = feedback === 'correct' && isSelected;
                    const isIncorrect = feedback === 'incorrect' && isSelected;

                    return (
                        <button
                            key={idx}
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleChoiceSelect(choiceValue)}
                            className={`btn-3d w-full text-left flex items-center gap-3 cursor-pointer ${
                                isCorrect ? 'is-correct' : isIncorrect ? 'is-wrong' : ''
                            } ${
                                isSelected && !isCorrect && !isIncorrect
                                    ? 'bg-[var(--brand-bg)] border-[var(--brand-text)]'
                                    : ''
                            }`}
                        >
                            <span
                                className={`w-7 h-7 rounded-[var(--radius-btn)] flex items-center justify-center text-xs font-black shadow-inner shrink-0 font-mono ${
                                    isCorrect || isIncorrect
                                        ? 'bg-white/25 text-white'
                                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                }`}
                            >
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <MathDisplay content={String(choiceLabel)} />
                        </button>
                    );
                })}
            </div>
        );
    }

    // 3. Free Text / Reflection Input
    if (answerType === 'free_text') {
        return (
            <form onSubmit={handleFormSubmit} className={`w-full max-w-2xl mx-auto space-y-3.5 ${className}`}>
                <textarea
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={isLocked}
                    rows={3}
                    placeholder={lang === 'sv' ? 'Skriv ditt svar / resonemang här...' : 'Write your answer / explanation here...'}
                    className="w-full p-3.5 text-sm font-medium border border-[var(--border-strong)] rounded-xl outline-none focus:border-emerald-600 transition-all text-[var(--text-main)] bg-[var(--bg-surface)] resize-none shadow-inner"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || (!String(value).trim() && feedback !== 'correct')}
                    className="btn-3d w-full justify-center text-sm uppercase tracking-wider cursor-pointer bg-[var(--brand-solid)] text-white border-[var(--brand-text)] hover:opacity-90 disabled:opacity-35 flex items-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
                    <span>{resolvedSubmitLabel}</span>
                </button>
            </form>
        );
    }

    // 4. Structured Math & Standard Inputs
    return (
        <form onSubmit={handleFormSubmit} className={`w-full max-w-2xl mx-auto space-y-4 ${className}`}>
            <div className="relative group">
                {answerType === 'mixed_fraction' ? (
                    <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                        <FractionInput
                            value={value}
                            onChange={(val) => onChange?.(val)}
                            allowMixed={true}
                            autoFocus={autoFocus}
                        />
                    </div>
                ) : answerType === 'fraction' ? (
                    <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                        <FractionInput
                            value={value}
                            onChange={(val) => onChange?.(sanitizeMathInput(val))}
                            allowMixed={false}
                            autoFocus={false}
                        />
                    </div>
                ) : answerType === 'structured_power' ? (
                    <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                        <ExponentInput
                            value={value}
                            onChange={(val) => onChange?.(sanitizeMathInput(val))}
                            autoFocus={autoFocus}
                        />
                    </div>
                ) : answerType === 'structured_scientific' ? (
                    <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)] shadow-inner">
                        <ScientificInput
                            value={value}
                            onChange={(val) => onChange?.(sanitizeMathInput(val))}
                            autoFocus={autoFocus}
                        />
                    </div>
                ) : (
                    <SmartMathInput
                        inputRef={inputRef}
                        value={value}
                        onChange={(val) => onChange?.(val)}
                        onSubmit={() => handleFormSubmit()}
                        inputType={answerType}
                        renderData={rd}
                        disabled={isLocked}
                        isMobile={isMobile}
                        autoFocus={autoFocus}
                        className={
                            feedback === 'incorrect'
                                ? '!border-rose-500 !bg-rose-50 !text-rose-700'
                                : feedback === 'correct'
                                    ? '!border-emerald-500 !bg-emerald-50 !text-emerald-700'
                                    : ''
                        }
                    />
                )}

                {feedback === 'correct' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)] animate-bounce">
                        <CheckCircle2 size={16} />
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-card)]">
                        <XCircle size={16} />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || (!String(value).trim() && feedback !== 'correct')}
                className={`btn-3d w-full justify-center text-base sm:text-lg uppercase tracking-wider cursor-pointer disabled:opacity-35 flex items-center gap-2 ${
                    feedback === 'correct'
                        ? 'is-correct'
                        : feedback === 'incorrect'
                            ? 'is-wrong'
                            : 'bg-[var(--brand-solid)] text-white border-[var(--brand-text)] hover:opacity-90'
                }`}
            >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                <span>{resolvedSubmitLabel}</span>
            </button>
        </form>
    );
}