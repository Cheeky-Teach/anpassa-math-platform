// src/components/practice/InlineCheckpointRunner.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Beaker, CheckCircle2, XCircle, Loader2, RotateCcw,
    ArrowRight, Trophy, Zap
} from 'lucide-react';
import { decodeConfig, BUNDLE_PRESETS } from '../../core/utils/labCodeUtils';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { syncProgress } from '../../lib/progressSync';
import QuestionPromptCard from '../shared/QuestionPromptCard';
import QuestionResponseBox from '../shared/QuestionResponseBox';
import MathDisplay from '../shared/MathDisplay';

export default function InlineCheckpointRunner({
    step,
    lang = 'sv',
    onCompleteStep,
    onAdvanceNextStep
}) {
    const [phase, setPhase] = useState('LOADING'); // 'LOADING' | 'ACTIVE' | 'SUMMARY'
    const [meta, setMeta] = useState({ mode: 'practice', limit: 10, wordProblem: false });
    const [packet, setPacket] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect' | 'submitted'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responses, setResponses] = useState({});
    const [revealedSolutions, setRevealedSolutions] = useState({});

    const loadCheckpoint = useCallback(async () => {
        if (!step?.configCode) return;
        setPhase('LOADING');
        setPacket([]);
        setResponses({});
        setRevealedSolutions({});
        setCurrentIndex(0);
        setInputValue('');
        setFeedback(null);
        setIsSubmitting(false);

        try {
            const decoded = decodeConfig(step.configCode);
            if (!decoded) {
                setPhase('SUMMARY');
                return;
            }

            let selection = decoded.selection || {};
            if (decoded.meta?.isNationalTest && decoded.meta?.bundleId) {
                const bundleId = decoded.meta.bundleId;
                const preset = BUNDLE_PRESETS[bundleId];
                const expanded = {};
                Object.entries(CATEGORIES).forEach(([catId, cat]) => {
                    if (bundleId === 'NP-ALL' || catId === preset?.category) {
                        cat.topics.forEach(topic => {
                            const lvls = LEVEL_DESCRIPTIONS[topic.id]
                                ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number)
                                : [1];
                            expanded[topic.id] = { enabled: true, levels: lvls };
                        });
                    }
                });
                selection = expanded;
            }

            const enabledTopics = Object.keys(selection).filter(id => selection[id]?.enabled);
            const limit = Number(decoded.meta?.limit) > 0 ? Number(decoded.meta.limit) : (step.questionCount || 10);
            const testMode = decoded.meta?.mode || step.testMode || 'practice';
            const wordProblem = Boolean(decoded.meta?.wordProblem);

            setMeta({ mode: testMode, limit, wordProblem });

            if (enabledTopics.length === 0) {
                setPhase('SUMMARY');
                return;
            }

            const requests = Array.from({ length: limit }).map((_, idx) => {
                const topicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
                const levels = selection[topicId]?.levels?.length > 0 ? selection[topicId].levels : [1];
                const randomLevel = levels[Math.floor(Math.random() * levels.length)];
                return {
                    topic: topicId,
                    level: randomLevel,
                    lang,
                    wordProblem,
                    force: true,
                    seed: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
                };
            });

            const res = await fetch(`/api/batch?t=${Date.now()}`, {
                method: 'POST',
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const questions = await res.json();
            setPacket(Array.isArray(questions) ? questions : []);
            setPhase('ACTIVE');
        } catch (err) {
            console.error('Inline checkpoint fetch failed:', err);
            setPhase('SUMMARY');
        }
    }, [step?.id, step?.configCode, step?.questionCount, step?.testMode, lang]);

    useEffect(() => {
        loadCheckpoint();
    }, [loadCheckpoint]);

    const handleAnswerSubmit = async (submittedVal) => {
        const currentQ = packet[currentIndex];
        if (!currentQ || isSubmitting || !String(submittedVal).trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: String(submittedVal).trim(),
                    token: currentQ.resolvedData?.token,
                    mode: meta.mode
                })
            });
            const result = await res.json();
            const isCorrect = Boolean(result.correct);

            syncProgress('unit_checkpoint_answered', {
                app_mode: 'practice_unit_checkpoint',
                step_id: step.id,
                topic: currentQ.topicId || currentQ.topic || 'unknown',
                is_correct: isCorrect,
                test_mode: meta.mode
            });

            const nextResponses = {
                ...responses,
                [currentIndex]: { answer: submittedVal, isCorrect }
            };
            setResponses(nextResponses);
            setFeedback(meta.mode === 'exam' ? 'submitted' : isCorrect ? 'correct' : 'incorrect');

            setTimeout(() => {
                const nextIdx = currentIndex + 1;
                if (nextIdx >= packet.length) {
                    const correctCount = Object.values(nextResponses).filter(r => r.isCorrect).length;
                    const accuracy = packet.length > 0 ? correctCount / packet.length : 0;

                    syncProgress('unit_checkpoint_completed', {
                        app_mode: 'practice_unit_checkpoint',
                        step_id: step.id,
                        total_questions: packet.length,
                        final_accuracy: parseFloat(accuracy.toFixed(2))
                    });

                    onCompleteStep?.(step.id);
                    setPhase('SUMMARY');
                } else {
                    setCurrentIndex(nextIdx);
                    setInputValue('');
                    setFeedback(null);
                }
            }, meta.mode === 'exam' ? 650 : 1000);
        } catch (err) {
            console.error('Checkpoint submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (phase === 'LOADING') {
        return (
            <div className="card p-12 flex flex-col items-center justify-center gap-4 border border-[var(--border-main)] shadow-lg min-h-[420px]">
                <Loader2 className="animate-spin text-amber-600" size={40} />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {lang === 'sv' ? 'Förbereder delprov...' : 'Preparing checkpoint...'}
                </span>
            </div>
        );
    }

    if (phase === 'SUMMARY') {
        const total = packet.length;
        const correctCount = Object.values(responses).filter(r => r.isCorrect).length;
        const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

        return (
            <div className="card p-6 sm:p-8 border border-[var(--border-main)] shadow-lg space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-main)]">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                {lang === 'sv' ? 'Delprov slutfört' : 'Checkpoint Complete'}
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
                                {step.title || (lang === 'sv' ? 'Delprov' : 'Checkpoint')}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[var(--bg-surface)] px-4 py-2.5 rounded-xl border border-[var(--border-main)]">
                        <span className="text-xs font-bold text-[var(--text-muted)]">
                            {correctCount} / {total} {lang === 'sv' ? 'rätt' : 'correct'}
                        </span>
                        <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {scorePct}%
                        </span>
                    </div>
                </div>

                {/* Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                    {packet.map((qItem, idx) => {
                        const res = responses[idx];
                        if (!res) return null;
                        const rd = qItem.resolvedData?.renderData || {};
                        const clues = qItem.clues || qItem.resolvedData?.clues || [];

                        return (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border bg-[var(--bg-surface)]/60 flex flex-col justify-between gap-2.5 ${
                                    res.isCorrect ? 'border-emerald-500' : 'border-rose-500'
                                }`}
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold font-mono uppercase text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Uppgift' : 'Question'} {idx + 1}
                                        </span>
                                        {res.isCorrect ? (
                                            <CheckCircle2 size={16} className="text-emerald-600" />
                                        ) : (
                                            <XCircle size={16} className="text-rose-600" />
                                        )}
                                    </div>
                                    <div className="text-xs font-bold text-[var(--text-main)]">
                                        <MathDisplay
                                            content={
                                                typeof rd.description === 'object'
                                                    ? rd.description[lang] || rd.description.sv
                                                    : rd.description
                                            }
                                        />
                                    </div>
                                    {rd.latex && (
                                        <div className="text-sm font-serif text-center py-1">
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-[var(--border-main)] text-xs">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Ditt svar:' : 'Your answer:'}
                                        </span>
                                        <span className="font-mono">{res.answer}</span>
                                    </div>
                                    {!res.isCorrect && qItem.resolvedData?.token && (
                                        <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                                            <span>{lang === 'sv' ? 'Rätt svar:' : 'Correct:'}</span>
                                            <span className="font-mono">{atob(qItem.resolvedData.token)}</span>
                                        </div>
                                    )}

                                    {clues.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRevealedSolutions(prev => ({ ...prev, [idx]: !prev[idx] }))
                                            }
                                            className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <Zap size={12} />
                                            <span>
                                                {revealedSolutions[idx]
                                                    ? lang === 'sv'
                                                        ? 'Dölj lösning'
                                                        : 'Hide solution'
                                                    : lang === 'sv'
                                                        ? 'Visa lösning'
                                                        : 'Show solution'}
                                            </span>
                                        </button>
                                    )}

                                    {revealedSolutions[idx] && (
                                        <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] space-y-1.5">
                                            {clues.map((c, cIdx) => {
                                                const txt = typeof c === 'object' ? c[lang] || c.text : c;
                                                const ltx = typeof c === 'object' ? c.latex : null;
                                                return (
                                                    <div key={cIdx} className="text-[11px] space-y-0.5">
                                                        <MathDisplay content={txt} />
                                                        {ltx && <MathDisplay content={`$$${ltx}$$`} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={loadCheckpoint}
                        className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-xs font-black uppercase tracking-wider text-[var(--text-main)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCcw size={15} />
                        <span>{lang === 'sv' ? 'Gör om delprov' : 'Retake Checkpoint'}</span>
                    </button>

                    {onAdvanceNextStep && (
                        <button
                            type="button"
                            onClick={onAdvanceNextStep}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <span>{lang === 'sv' ? 'Fortsätt till nästa steg' : 'Continue to Next Step'}</span>
                            <ArrowRight size={15} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = packet[currentIndex];

    return (
        <div className="card p-6 sm:p-8 border border-[var(--border-main)] shadow-lg flex flex-col justify-between min-h-[420px] space-y-5">
            {/* Checkpoint Header Bar */}
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[var(--border-main)]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <Beaker size={16} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                            {meta.mode === 'exam'
                                ? lang === 'sv'
                                    ? 'Delprov (Dolda svar)'
                                    : 'Checkpoint (Exam Mode)'
                                : lang === 'sv'
                                    ? 'Delprov (Direkt feedback)'
                                    : 'Checkpoint (Practice)'}
                        </span>
                        <h3 className="text-sm font-extrabold text-[var(--text-main)]">
                            {step.title || (lang === 'sv' ? 'Delprov' : 'Checkpoint')}
                        </h3>
                    </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-xs font-black font-mono text-[var(--text-main)]">
                    {currentIndex + 1} / {packet.length}
                </div>
            </div>

            {/* Shared Question Prompt */}
            <QuestionPromptCard
                question={currentQ}
                lang={lang}
                isWordProblem={meta.wordProblem}
            />

            {/* Shared Response Box */}
            <QuestionResponseBox
                question={currentQ}
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleAnswerSubmit}
                feedback={feedback}
                isSubmitting={isSubmitting}
                lang={lang}
                submitLabel={lang === 'sv' ? 'Svara' : 'Submit'}
            />
        </div>
    );
}