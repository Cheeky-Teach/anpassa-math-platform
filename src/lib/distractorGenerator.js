// src/lib/distractorGenerator.js
import { extractDecodedAnswer, normalizeMathString } from '../components/live/core/liveAnswerUtils.js';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Uniformly formats multiplication symbols across all answer choices
 * (Replaces raw asterisks '*' with LaTeX '\cdot')
 */
function standardizeMultiplication(str) {
    if (!str) return '';
    return String(str)
        .replace(/(\d|[a-zA-Z\)\}])\s*\*\s*(\d|[a-zA-Z\(\{])/g, '$1 \\cdot $2')
        .replace(/·/g, '\\cdot')
        .replace(/\\times/g, '\\cdot')
        .trim();
}

/**
 * Ensures any math expression (with ^, \cdot, \frac, etc.) is wrapped in $...$
 * and brackets multi-digit / bare exponents so KaTeX formats real superscripts.
 */
function ensureMathDelimiters(str) {
    if (!str) return '';
    let s = String(str).trim();

    // Standardize bare carets like 10^5 or x^2 to 10^{5} or x^{2}
    s = s.replace(/\^([+-]?\w+)(?!\{)/g, '^{$1}');

    const hasDelimiters = s.startsWith('$') && s.endsWith('$');
    const inner = hasDelimiters ? s.slice(1, -1).trim() : s;

    // Check if inner content contains mathematical syntax requiring KaTeX rendering
    const hasMathSyntax = /\\cdot|\\frac|\^|_|\\times|\\div|[+\-=]/.test(inner);

    if (hasMathSyntax && !hasDelimiters) {
        return `$${inner}$`;
    }
    return hasDelimiters ? `$${inner}$` : s;
}

function cleanAnswer(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/\$/g, '')
        .replace(/\\left|\\right/g, '')
        .trim();
}

/**
 * Normalized comparison that treats `*`, `\cdot`, and `·` as identical
 */
function isMathEquivalent(valA, valB) {
    if (valA === valB) return true;
    const norm = (s) => String(s || '')
        .replace(/\$/g, '')
        .replace(/\s+/g, '')
        .replace(/\\cdot|·|\*|\\times/g, '*')
        .replace(/\\left|\\right|[\{\}]/g, '')
        .replace(/,/g, '.')
        .trim()
        .toLowerCase();
    
    return norm(valA) === norm(valB);
}

/**
 * Robust extraction that handles saved worksheets, boards, tokens, and generator payloads
 */
function extractPristineAnswer(correctAnswer, renderData, resolvedData, raw) {
    if (correctAnswer !== undefined && correctAnswer !== null && String(correctAnswer).trim() !== '') {
        return String(correctAnswer).trim();
    }

    const candidates = [
        resolvedData,
        raw?.resolvedData,
        renderData,
        raw?.renderData,
        raw
    ];

    for (const cand of candidates) {
        if (!cand) continue;
        const decoded = extractDecodedAnswer(cand);
        if (decoded !== null && decoded !== undefined && String(decoded).trim() !== '') {
            return String(decoded).trim();
        }
        if (cand.answer !== undefined && cand.answer !== null && String(cand.answer).trim() !== '') {
            return String(cand.answer).trim();
        }
        if (cand.solution !== undefined && cand.solution !== null && String(cand.solution).trim() !== '') {
            return String(cand.solution).trim();
        }
    }

    return '';
}

function getNumericalVariants(num, topicId = '') {
    const isInt = Number.isInteger(num);
    const abs = Math.abs(num);
    const isNegativeTopic = topicId?.includes('negative') || num < 0;

    const set = new Set();

    if (abs <= 10) {
        set.add(num + 1);
        set.add(num - 1);
        set.add(num + 2);
        set.add(num - 2);
        set.add(num + 3);
    } else if (abs <= 50) {
        set.add(num + 2);
        set.add(num - 2);
        set.add(num + 5);
        set.add(num - 5);
        set.add(num + 1);
        set.add(num - 1);
    } else {
        set.add(num + 10);
        set.add(num - 10);
        set.add(num + 5);
        set.add(num - 5);
        set.add(num + 2);
    }

    if (abs > 2 && num % 2 === 0) set.add(num / 2);
    if (abs > 0 && abs < 150) set.add(num * 2);

    if (isInt && abs >= 12 && abs <= 98 && abs % 10 !== 0) {
        const rev = parseInt(String(abs).split('').reverse().join(''), 10) * Math.sign(num);
        if (rev !== num) set.add(rev);
    }

    if (abs >= 10 && num % 10 === 0) set.add(num / 10);

    if (isNegativeTopic && num !== 0) {
        set.add(-num);
        set.add(-num + 1);
        set.add(-num - 1);
    }

    return Array.from(set)
        .filter(n => n !== num && Number.isFinite(n) && (isNegativeTopic || n >= 0))
        .map(n => isInt ? String(n) : String(parseFloat(n.toFixed(2))));
}

function mutateScientific(str) {
    const norm = str.replace(/\$/g, '').replace(/\\cdot|·/g, '*').replace(/\s+/g, '');
    const match = norm.match(/^([+-]?\d+(?:[.,]\d+)?)\*10\^\{?([+-]?\d+)\}?$/);
    if (!match) return null;

    const mantissa = parseFloat(match[1].replace(',', '.'));
    const exp = parseInt(match[2], 10);
    const decoys = new Set();

    decoys.add(`${mantissa} \\cdot 10^{${exp + 1}}`);
    decoys.add(`${mantissa} \\cdot 10^{${exp - 1}}`);
    decoys.add(`${(mantissa * 10).toFixed(0)} \\cdot 10^{${exp - 1}}`);

    if (mantissa >= 2) {
        decoys.add(`${(mantissa - 1)} \\cdot 10^{${exp}}`);
    } else {
        decoys.add(`${(mantissa + 1)} \\cdot 10^{${exp}}`);
    }

    return Array.from(decoys).filter(d => !isMathEquivalent(d, str));
}

function mutateExponent(str) {
    const clean = str.replace(/\$/g, '').replace(/\\left|\\right|[\{\}]/g, '').trim();
    const match = clean.match(/^([+-]?\w+)\^([+-]?\d+)$/);
    if (!match) return null;

    const base = match[1];
    const exp = parseInt(match[2], 10);
    const decoys = new Set();

    decoys.add(`${base}^{${exp + 1}}`);
    decoys.add(`${base}^{${exp - 1}}`);

    const baseNum = parseInt(base, 10);
    if (!isNaN(baseNum) && baseNum !== exp) {
        decoys.add(`${exp}^{${baseNum}}`);
        decoys.add(String(baseNum * exp));
        decoys.add(`${baseNum + 1}^{${exp}}`);
    }

    return Array.from(decoys).filter(d => !isMathEquivalent(d, str));
}

function mutateFraction(str) {
    const clean = str.replace(/\$/g, '').trim();
    const fracMatch = clean.match(/(?:(\d+)\s+)?(?:\\frac\{\s*(\d+)\s*\}\{\s*(\d+)\s*\}|(\d+)\/(\d+))/);
    if (!fracMatch) return null;

    const whole = fracMatch[1] ? parseInt(fracMatch[1], 10) : null;
    const num = parseInt(fracMatch[2] || fracMatch[4], 10);
    const den = parseInt(fracMatch[3] || fracMatch[5], 10);
    if (!den) return null;

    const isLatex = clean.includes('frac');
    const fmt = (n, d, w = null) => {
        const frac = isLatex ? `\\frac{${n}}{${d}}` : `${n}/${d}`;
        return w !== null ? `${w} ${frac}` : frac;
    };

    const decoys = new Set();

    if (num !== den) decoys.add(fmt(den, num, whole));
    decoys.add(fmt(num + 1, den, whole));
    if (num > 1) decoys.add(fmt(num - 1, den, whole));
    decoys.add(fmt(num, den + 1, whole));
    if (den > 2) decoys.add(fmt(num, den - 1, whole));
    decoys.add(fmt(num * 2, den, whole));
    decoys.add(fmt(num, den * 2, whole));

    if (whole !== null) {
        decoys.add(fmt(num, den));
        decoys.add(fmt(whole * den + num, den));
    }

    return Array.from(decoys).filter(d => !isMathEquivalent(d, clean));
}

function mutateQuantityWithUnit(str, topicId) {
    const clean = str.replace(/\$/g, '').trim();
    const match = clean.match(/^([+-]?\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (!match || !match[1]) return null;

    const val = parseFloat(match[1].replace(',', '.'));
    const unit = match[2] ? ` ${match[2].trim()}` : '';
    if (isNaN(val)) return null;

    const variants = getNumericalVariants(val, topicId);
    return variants.map(v => `${v}${unit}`).filter(d => !isMathEquivalent(d, clean));
}

function mutateAlgebra(str) {
    const clean = str.replace(/\$/g, '').trim();

    const varMatch = clean.match(/^([a-zA-Z])\s*=\s*([+-]?\d+(?:[.,]\d+)?)$/);
    if (varMatch) {
        const variable = varMatch[1];
        const num = parseFloat(varMatch[2].replace(',', '.'));
        const variants = getNumericalVariants(num, 'algebra');
        return variants.map(v => `${variable} = ${v}`);
    }

    const linMatch = clean.match(/([+-]?\s*\d*)x\s*([+-]\s*\d+)/);
    if (linMatch) {
        const a = parseInt(linMatch[1].replace(/\s+/g, '') || '1', 10);
        const b = parseInt(linMatch[2].replace(/\s+/g, ''), 10);
        const fmt = (k, m) => {
            const kPart = k === 1 ? 'x' : (k === -1 ? '-x' : `${k}x`);
            const mPart = m >= 0 ? ` + ${m}` : ` - ${Math.abs(m)}`;
            return `${kPart}${mPart}`;
        };
        return [
            fmt(b, a),
            fmt(a + 1, b),
            fmt(a, b + 1),
            fmt(a - 1, b)
        ].filter(d => !isMathEquivalent(d, clean));
    }

    return null;
}

// =========================================================================
// UNIVERSAL DISTRACTOR ENTRY POINT
// =========================================================================
export function generateDistractors({
    correctAnswer,
    topicId = '',
    renderData = {},
    resolvedData = null,
    raw = null
}) {
    // 🟢 1. IF GENERATOR ALREADY HAS OPTIONS (e.g. Spot-the-Lie, MCQ, True/False)
    if (Array.isArray(renderData.options) && renderData.options.length >= 4) {
        const cleanTarget = extractPristineAnswer(correctAnswer, renderData, resolvedData, raw);

        const hasExplicitFlags = renderData.options.some(
            opt => typeof opt === 'object' && (opt.isCorrect !== undefined || opt.correct !== undefined)
        );

        let finalOptions = renderData.options.slice(0, 4).map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const rawLabel = typeof opt === 'object' ? (opt.label ?? opt.text ?? '') : String(opt);
            
            // Standardize multiplication dots and wrap math in delimiters
            const label = ensureMathDelimiters(standardizeMultiplication(rawLabel));

            let isCorrect = false;

            if (hasExplicitFlags && typeof opt === 'object') {
                isCorrect = Boolean(opt.isCorrect ?? opt.correct);
            } else if (cleanTarget) {
                isCorrect = (opt.id && opt.id.toUpperCase() === cleanTarget.toUpperCase()) ||
                            letter.toUpperCase() === cleanTarget.toUpperCase() ||
                            isMathEquivalent(label, cleanTarget);
            }

            return { id: letter, label, isCorrect };
        });

        const correctCount = finalOptions.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
            finalOptions = finalOptions.map((opt, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx];
                const matches = isMathEquivalent(opt.label, cleanTarget) || letter === cleanTarget.toUpperCase();
                return { ...opt, isCorrect: matches };
            });

            if (finalOptions.filter(o => o.isCorrect).length === 0) {
                finalOptions[0].isCorrect = true;
            }
        }

        return finalOptions;
    }

    // 🟢 2. DECODE PRISTINE ANSWER & STANDARDIZE MULTIPLICATION
    let rawAns = extractPristineAnswer(correctAnswer, renderData, resolvedData, raw) || '4';
    const cleanAns = standardizeMultiplication(cleanAnswer(rawAns));

    let candidates = null;

    // 3. DETECT FORMAT STRUCTURE
    if (cleanAns.includes('*10^') || cleanAns.includes('·10^') || cleanAns.includes('\\cdot 10^')) {
        candidates = mutateScientific(cleanAns);
    } else if (cleanAns.includes('^')) {
        candidates = mutateExponent(cleanAns);
    } else if (cleanAns.includes('/') || cleanAns.includes('frac')) {
        candidates = mutateFraction(cleanAns);
    } else if (cleanAns.includes('=') || (cleanAns.includes('x') && (cleanAns.includes('+') || cleanAns.includes('-')))) {
        candidates = mutateAlgebra(cleanAns);
    } else {
        candidates = mutateQuantityWithUnit(cleanAns, topicId);
    }

    // 4. SANITIZE & REMOVE EQUIVALENTS
    let unique = Array.from(new Set(candidates || []))
        .map(standardizeMultiplication)
        .filter(c => !isMathEquivalent(c, cleanAns) && c !== '');

    if (unique.length < 3) {
        const digitMatch = cleanAns.match(/-?\d+/);
        if (digitMatch) {
            const baseNum = parseInt(digitMatch[0], 10);
            const variants = getNumericalVariants(baseNum, topicId);
            variants.forEach(v => {
                const sub = cleanAns.replace(digitMatch[0], v);
                const std = standardizeMultiplication(sub);
                if (!isMathEquivalent(std, cleanAns) && !unique.includes(std)) {
                    unique.push(std);
                }
            });
        }
    }

    let step = 1;
    while (unique.length < 3) {
        const fallbackVal = `${cleanAns} (+${step++})`;
        unique.push(fallbackVal);
    }

    const chosen = shuffle(unique).slice(0, 3);

    // 5. COMBINE AND SHUFFLE
    const choices = shuffle([
        { label: cleanAns, isCorrect: true },
        { label: String(chosen[0]), isCorrect: false },
        { label: String(chosen[1]), isCorrect: false },
        { label: String(chosen[2]), isCorrect: false }
    ]);

    const letters = ['A', 'B', 'C', 'D'];
    return choices.map((c, i) => ({
        id: letters[i],
        label: ensureMathDelimiters(c.label),
        isCorrect: c.isCorrect
    }));
}