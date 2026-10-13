import React, { useState, useMemo } from 'react';
import { Activity, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../../constants/localization';
import MathDisplay from '../../shared/MathDisplay';
import VisualRenderer from '../../visuals/VisualRenderer';
import { validateQuestion } from '../../../core/utils/devTools/stressTestEngine';
import { SKILL_BUCKETS } from '../../../constants/skillBuckets'; // 🟢 Added import for Word Problem fallback extraction

const getUniqueTopics = () => {
    const unique = [];
    const seen = new Set();
    Object.values(CATEGORIES).forEach(cat => {
        if (cat.topics) {
            cat.topics.forEach(t => {
                if (!seen.has(t.id)) {
                    seen.add(t.id);
                    unique.push(t);
                }
            });
        }
    });

    // 🟢 Sort alphabetically by the English label (fallback to id if label missing)
    return unique.sort((a, b) => {
        const labelA = a.label?.en || a.id || '';
        const labelB = b.label?.en || b.id || '';
        return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
    });
};
const UNIQUE_TOPICS = getUniqueTopics();

// Extracts clean audit items for LLM evaluation
const formatForLlmAudit = (results, mode = 'markdown', onlyEdgeCases = false) => {
    const data = results.flatMap((res, i) => {
        const stories = res._testedStories || [];
        const rawLatex = res.latex || '';
        const params = res.extractedParams || {};

        // Identify edge cases that tend to cause linguistic & physical logic failure
        const hasNegative = /-\d/.test(rawLatex) || Object.values(params).some(v => String(v).includes('-'));
        const hasFraction = /\\frac|[/]/.test(rawLatex) || Object.values(params).some(v => String(v).includes('/'));
        const hasDecimal = /\d+\.\d+/.test(rawLatex) || Object.values(params).some(v => String(v).includes('.'));

        if (onlyEdgeCases && !hasNegative && !hasFraction && !hasDecimal) {
            return [];
        }

        return stories.map((story, sIdx) => ({
            run: i + 1,
            storyIdx: sIdx + 1,
            mathExpression: rawLatex,
            extractedParams: params,
            storyText: story,
            edgeCases: [
                hasNegative ? 'NEGATIVE' : null,
                hasFraction ? 'FRACTION' : null,
                hasDecimal ? 'DECIMAL' : null
            ].filter(Boolean)
        }));
    });

    if (mode === 'json') {
        return JSON.stringify(data, null, 2);
    }

    // Markdown formatted output
    let output = `# Word Problem Audit Report (${data.length} Scenarios)\n\n`;
    output += `| Run | Tags | Extracted Numbers | Math Formula | Generated Story |\n`;
    output += `| :--- | :--- | :--- | :--- | :--- |\n`;

    data.forEach(d => {
        const tags = d.edgeCases.length > 0 ? d.edgeCases.join(', ') : 'STANDARD';
        const paramsStr = JSON.stringify(d.extractedParams).replace(/["{}]/g, '');
        const cleanStory = d.storyText.replace(/\n/g, ' ').replace(/\|/g, '\\|');
        const cleanMath = d.mathExpression.replace(/\|/g, '\\|');
        output += `| #${d.run}.${d.storyIdx} | \`${tags}\` | ${paramsStr} | $${cleanMath}$ | ${cleanStory} |\n`;
    });

    return output;
};

export default function StressTesterTab({ lang }) {
    const [topicId, setTopicId] = useState('');
    const [level, setLevel] = useState('');
    const [iterations, setIterations] = useState(20);
    
    // 🟢 State for toggles
    const [includeClues, setIncludeClues] = useState(true);
    const [testWordProblems, setTestWordProblems] = useState(false);
    
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState([]);
    const [filter, setFilter] = useState('all');
    
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('markdown'); // 'markdown' | 'json'
    const [onlyEdgeCases, setOnlyEdgeCases] = useState(false);
    const [copied, setCopied] = useState(false);

    const sortedTopics = useMemo(() => {
        return [...UNIQUE_TOPICS].sort((a, b) => {
            const labelA = a.label?.[lang] || a.label?.en || a.id || '';
            const labelB = b.label?.[lang] || b.label?.en || b.id || '';
            return labelA.localeCompare(labelB, lang, { sensitivity: 'base' });
        });
    }, [lang]);

    const runStressTest = async () => {
        if (!topicId || !level) return alert("Select a topic and level first!");
        setIsRunning(true);
        setResults([]);
        const newResults = [];
        
        try {
            // 🟢 FIX: We must tell the backend API to trigger the word problem interceptor!
            const batchRequests = Array.from({ length: iterations }).map(() => ({
                topic: topicId,
                level: parseInt(level),
                lang: lang,
                wordProblem: testWordProblems,
                includeClues: includeClues // <-- Add this if your backend supports skipping clue generation
            }));

            // 🟢 Cache-busting timestamp guarantees a fresh run every time you click the button
            const res = await fetch(`/api/batch?_t=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests: batchRequests })
            });

            if (!res.ok) throw new Error(`API returned status ${res.status}`);
            const responseArray = await res.json();
            
            responseArray.forEach((item, index) => {
                if (item.type === 'error' || item.meta?.error) {
                    newResults.push({ id: index, flags: [item.text], isFlagged: true });
                    return;
                }
                const questionData = item.resolvedData;
                if (questionData && questionData.renderData) {
                    const combinedForValidation = { 
                        ...questionData,
                        ...questionData.renderData, 
                        clues: questionData.clues 
                    };

                    newResults.push(validateQuestion(combinedForValidation, includeClues, {
                        testWordProblems: testWordProblems,
                        lang: lang,
                        topicId: topicId,
                        variationKey: questionData.variationKey || questionData.metadata?.variation_key,
                        skillBuckets: SKILL_BUCKETS
                    }));
                } else {
                    newResults.push({ id: index, flags: ["Malformed API payload"], isFlagged: true });
                }
            });
        } catch (err) {
            console.error("Generator Error:", err);
            alert("Test suite failed to execute API calls.");
        }

        setResults(newResults);
        setIsRunning(false);
    };

    const flaggedCount = results.filter(r => r.isFlagged).length;
    const displayResults = filter === 'flagged' ? results.filter(r => r.isFlagged) : results;



    return (
        <div className="space-y-6">
            <div className="border-b border-[var(--border-main)] pb-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] mb-1">Generator Stress Tester</h3>
                <p className="text-xs text-[var(--text-muted)] font-medium">Batch generate questions to detect KaTeX crashes, floating decimals, double operators, and unrendered variables.</p>
            </div>
            
            {/* CONTROL PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-main)]">
                <select 
                    value={topicId} 
                    onChange={e => { setTopicId(e.target.value); setLevel(''); }} 
                    className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-2 text-xs font-bold text-[var(--text-main)] outline-none"
                >
                    <option value="">1. Select Topic...</option>
                    {sortedTopics.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.label?.[lang] || t.label?.en || t.id}
                        </option>
                    ))}
                </select>
                
                <select value={level} onChange={e => setLevel(e.target.value)} disabled={!topicId} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-2 text-xs font-bold text-[var(--text-main)] outline-none disabled:opacity-50">
                    <option value="">2. Select Level...</option>
                    {topicId && Object.keys(LEVEL_DESCRIPTIONS[topicId] || {}).map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>

                <select value={iterations} onChange={e => setIterations(Number(e.target.value))} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-2 text-xs font-bold text-[var(--text-main)] outline-none">
                    <option value={10}>10 Runs (Fast)</option>
                    <option value={50}>50 Runs (Standard)</option>
                    <option value={100}>100 Runs (Deep)</option>
                </select>

                <button onClick={runStressTest} disabled={isRunning || !topicId || !level} className="bg-slate-900 text-emerald-400 hover:bg-black font-black uppercase tracking-widest text-[10px] rounded-lg p-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {isRunning ? <Activity size={14} className="animate-spin"/> : <Zap size={14}/>} 
                    {isRunning ? "Testing..." : "Run Sequence"}
                </button>
                
                {/* 🟢 Toggles Grouped Side-by-Side */}
                <div className="md:col-span-4 flex items-center gap-6 pt-3 mt-1 border-t border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)]">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={includeClues} onChange={e => setIncludeClues(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                        Validate Clue/Coach Payloads
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={testWordProblems} onChange={e => setTestWordProblems(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                        Test Word Problem Stories
                    </label>
                </div>
            </div>

            {/* RESULTS SUMMARY */}
            {results.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${flaggedCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {flaggedCount > 0 ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>}
                                {flaggedCount} Flagged out of {results.length}
                            </div>
                        </div>
                        <div className="flex bg-[var(--bg-surface)] rounded-lg p-1 border border-[var(--border-main)]">
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--brand-solid)] text-[var(--text-main)] rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <span>🤖</span> Export Markdown ({results.reduce((acc, r) => acc + (r._testedStories?.length || 0), 0)} Stories)
                            </button>
                            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>All Results</button>
                            <button onClick={() => setFilter('flagged')} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'flagged' ? 'bg-[var(--bg-card)] shadow-sm text-rose-600' : 'text-[var(--text-muted)]'}`}>Flagged Only</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-10">
                        {displayResults.map((res, i) => (
                            <div key={i} className={`bg-[var(--bg-surface)] p-4 rounded-xl border-2 flex flex-col gap-4 ${res.isFlagged ? 'border-rose-400 bg-rose-50/10' : 'border-[var(--border-main)]'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Run #{i + 1}</span>
                                    {res.isFlagged && (
                                        <div className="flex flex-col gap-1 items-end">
                                            {res.flags.map((flag, fIndex) => <span key={fIndex} className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">{flag}</span>)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] flex flex-col overflow-hidden">
                                    <div className="p-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
                                        <p className="text-xs font-bold text-[var(--text-main)]">{res.description}</p>
                                    </div>
                                    <div className="w-full p-6 whiteboard-protect theme-slate flex flex-col items-center justify-center min-h-[120px]">
                                        <div className="w-full max-w-[300px] flex justify-center items-center pointer-events-none empty:hidden">
                                            <VisualRenderer data={res} isWordProblem={false} />
                                        </div>
                                        {res.latex && (
                                            <div className="font-serif text-xl flex justify-center text-center overflow-x-auto pt-2 text-slate-800">
                                                <MathDisplay content={`$$${res.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {res.options && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {res.options.map((opt, oIndex) => (
                                            <div key={oIndex} className={`text-xs font-bold p-2 border rounded-md text-center ${opt === res.correctAnswer ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-main)]'}`}>{opt}</div>
                                        ))}
                                    </div>
                                )}

                                {/* 🟢 VISUAL OUTPUT: Displays the generated word problem text directly in the card */}
                                {res._testedStories && res._testedStories.length > 0 && (
                                    <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
                                        <span className="text-[12px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                                            Word Problem Stories ({res._testedStories.length})
                                        </span>
                                        <div className="space-y-2">
                                            {res._testedStories.map((story, sIdx) => (
                                                <div key={sIdx} className="bg-amber-50/50 p-2.5 rounded border border-amber-200/50 text-[12px] font-medium text-slate-800 leading-relaxed">
                                                    {story}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 🟢 FIX: Added 'includeClues &&' to hide this UI block when toggled off */}
                                {includeClues && res.clues && res.clues.length > 0 && (
                                    <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
                                        <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">Step-by-Step Clues ({res.clues.length})</span>
                                        <div className="space-y-2">
                                            {res.clues.map((clue, cIdx) => (
                                                <div key={cIdx} className="whiteboard-protect theme-slate p-2.5 rounded border border-slate-200 text-[10px]">
                                                    <p className="font-bold text-slate-800 leading-relaxed mb-1">{clue.text}</p>
                                                    {clue.latex && <div className="font-serif text-slate-800 mt-1.5 overflow-x-auto"><MathDisplay content={`$$${clue.latex}$$`} /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {displayResults.length === 0 && <div className="col-span-full py-12 text-center text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">No flagged results found. Clean run!</div>}
                    </div>
                </div>
            )}

            {showExportModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] shadow-2xl p-6 w-full max-w-4xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b border-[var(--border-main)]">
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight text-[var(--text-main)]">Audit Export</h3>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Copy to audit domain realism</p>
                        </div>
                        <button onClick={() => setShowExportModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-xs uppercase">Close ✕</button>
                    </div>

                    {/* Config Toolbar */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-main)]">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={onlyEdgeCases}
                                    onChange={(e) => setOnlyEdgeCases(e.target.checked)}
                                    className="accent-emerald-500 rounded"
                                />
                                Filter to Edge Cases Only (Negatives, Decimals, Fractions)
                            </label>

                            <div className="flex bg-[var(--bg-surface)] rounded-md border border-[var(--border-main)] p-0.5">
                                <button
                                    onClick={() => setExportFormat('markdown')}
                                    className={`px-2.5 py-1 text-[12px] font-black uppercase rounded ${exportFormat === 'markdown' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
                                >
                                    Markdown
                                </button>
                                <button
                                    onClick={() => setExportFormat('json')}
                                    className={`px-2.5 py-1 text-[12px] font-black uppercase rounded ${exportFormat === 'json' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs' : 'text-[var(--text-muted)]'}`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const text = formatForLlmAudit(results, exportFormat, onlyEdgeCases);
                                navigator.clipboard.writeText(text);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider rounded-[var(--radius-btn)] transition-all shadow-sm"
                        >
                            {copied ? "✓ Copied to Clipboard" : "Copy Payload"}
                        </button>
                    </div>

                    {/* Payload Preview */}
                    <textarea
                        readOnly
                        value={formatForLlmAudit(results, exportFormat, onlyEdgeCases)}
                        className="flex-1 w-full p-4 font-mono text-xs bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg outline-none resize-none custom-scrollbar"
                    />
                </div>
            </div>
        )}
        </div>
    );
}