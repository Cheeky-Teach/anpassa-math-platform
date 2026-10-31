// src/lib/distractorGenerator.js
import { extractDecodedAnswer } from '../components/live/core/liveAnswerUtils.js';

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
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/(\d|[a-zA-Z\)\}])\s*\*\s*(\d|[a-zA-Z\(\{])/g, '$1 \\cdot $2')
        .replace(/·/g, '\\cdot')
        .replace(/\\times/g, '\\cdot')
        .trim();
}

/**
 * Ensures mathematical expressions with symbols are wrapped in $...$
 * Leaves plain words (e.g. "Spetsig", "Rät", "Ja", "Nej") as clean text.
 */
function ensureMathDelimiters(str) {
    if (str === null || str === undefined) return '';
    let s = String(str).trim();
    if (!s) return '';

    // Standardize bare carets like 10^5 or x^2 to 10^{5} or x^{2}
    s = s.replace(/\^([+-]?\w+)(?!\{)/g, '^{$1}');

    const hasDelimiters = s.startsWith('$') && s.endsWith('$');
    const inner = hasDelimiters ? s.slice(1, -1).trim() : s;

    // Only apply LaTeX delimiters if actual math syntax exists
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
 * Normalized comparison that matches the logic in api/answer.ts:
 * Strips whitespace, backslashes, Swedish commas to dots, and compares case-insensitively.
 */
function isNormalizedMatch(valA, valB) {
    if (valA === valB) return true;
    const norm = (s) => String(s || '')
        .toLowerCase()
        .replace(/^0+\s+/, '')
        .replace(/[\s_]+/g, '')
        .replace(',', '.')
        .replace(/\\/g, '')
        .replace(/^[a-z]=/, '')
        .replace(/^svar:/, '')
        .replace(/·/g, '*')
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\$/g, '')
        .replace(/[\{\}]/g, '')
        .trim();
    
    return norm(valA) === norm(valB);
}

/**
 * Universal label extractor: Safely returns a display string
 * whether opt is a string ("Spetsig"), number (90), boolean (true), or object ({ label: "Spetsig" })
 */
function resolveRawLabel(opt) {
    if (opt === null || opt === undefined) return '';
    if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
        return String(opt);
    }
    if (typeof opt === 'object') {
        const val = opt.label ?? opt.text ?? opt.value ?? opt.val ?? opt.name ?? opt.title;
        return val !== null && val !== undefined ? String(val) : '';
    }
    return String(opt);
}

/**
 * Universal Base64 token decoder matching api/answer.ts Buffer.from(token, 'base64')
 * Works in both browser (window.atob) and Node (Buffer)
 */
function decodeBase64Token(tokenStr) {
    if (!tokenStr || typeof tokenStr !== 'string') return null;
    try {
        if (typeof window !== 'undefined' && typeof window.atob === 'function') {
            return decodeURIComponent(escape(window.atob(tokenStr))).trim();
        }
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(tokenStr, 'base64').toString('utf-8').trim();
        }
    } catch {
        try {
            if (typeof window !== 'undefined' && typeof window.atob === 'function') {
                return window.atob(tokenStr).trim();
            }
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Robust extraction that checks correctAnswer, token (AnglesGen), resolvedData, and renderData
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

        // 1. Check for token first (used by AnglesGen and similar generators)
        if (cand.token) {
            const fromToken = decodeBase64Token(cand.token);
            if (fromToken) return fromToken;
        }

        // 2. Try extractDecodedAnswer utility
        try {
            const decoded = extractDecodedAnswer(cand);
            if (decoded !== null && decoded !== undefined && String(decoded).trim() !== '') {
                return String(decoded).trim();
            }
        } catch {
            // pass
        }

        // 3. Direct answer or solution fields
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

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, str));
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

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, str));
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

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, clean));
}

function mutateQuantityWithUnit(str, topicId) {
    const clean = str.replace(/\$/g, '').trim();
    const match = clean.match(/^([+-]?\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (!match || !match[1]) return null;

    const val = parseFloat(match[1].replace(',', '.'));
    const unit = match[2] ? ` ${match[2].trim()}` : '';
    if (isNaN(val)) return null;

    const variants = getNumericalVariants(val, topicId);
    return variants.map(v => `${v}${unit}`).filter(d => !isNormalizedMatch(d, clean));
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
        ].filter(d => !isNormalizedMatch(d, clean));
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
    // 🟢 Step 1: Extract options from anywhere in the payload
    const incomingOptions = Array.isArray(renderData?.options) 
        ? renderData.options 
        : Array.isArray(raw?.renderData?.options)
            ? raw.renderData.options
            : Array.isArray(raw?.options) 
                ? raw.options 
                : Array.isArray(resolvedData?.options) 
                    ? resolvedData.options 
                    : null;

    // 🟢 Step 2: Extract clean answer (including automatic base64 token decoding)
    const cleanTarget = extractPristineAnswer(correctAnswer, renderData, resolvedData, raw);

    // 🟢 Step 3: PRE-EXISTING OPTIONS GUARD (Universal: handles 2, 3, 4, or more options)
    // NEVER pad options. If the generator provides ["Ja", "Nej"], return exactly those 2 choices!
    if (incomingOptions && incomingOptions.length >= 2) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

        const hasExplicitFlags = incomingOptions.some(
            opt => typeof opt === 'object' && opt !== null && (opt.isCorrect !== undefined || opt.correct !== undefined)
        );

        let finalOptions = incomingOptions.map((opt, idx) => {
            const letter = letters[idx] || String(idx + 1);
            const rawLabel = resolveRawLabel(opt);
            const label = ensureMathDelimiters(standardizeMultiplication(rawLabel));

            let isCorrect = false;

            if (hasExplicitFlags && typeof opt === 'object' && opt !== null) {
                isCorrect = Boolean(opt.isCorrect ?? opt.correct);
            } else if (cleanTarget) {
                const optId = (typeof opt === 'object' && opt !== null) ? opt.id : null;
                isCorrect = (optId && String(optId).toUpperCase() === cleanTarget.toUpperCase()) ||
                            letter.toUpperCase() === cleanTarget.toUpperCase() ||
                            isNormalizedMatch(rawLabel, cleanTarget) ||
                            isNormalizedMatch(label, cleanTarget);
            }

            return {
                id: letter,
                label: label || rawLabel || letter,
                isCorrect: Boolean(isCorrect)
            };
        });

        // Ensure at least one option is marked correct if cleanTarget matches one of them
        const correctCount = finalOptions.filter(o => o.isCorrect).length;
        if (correctCount !== 1 && cleanTarget) {
            finalOptions = finalOptions.map((opt) => {
                const matches = isNormalizedMatch(opt.label, cleanTarget) || opt.id === cleanTarget.toUpperCase();
                return { ...opt, isCorrect: matches };
            });

            // Fallback: If cleanTarget did not match any of the provided strings, flag option A
            if (finalOptions.filter(o => o.isCorrect).length === 0 && finalOptions.length > 0) {
                finalOptions[0].isCorrect = true;
            }
        }

        return finalOptions;
    }

    // 🟢 Step 4: PROCEDURAL GENERATION (Only runs when no options array was supplied)
    let rawAns = cleanTarget || '4';
    const cleanAns = standardizeMultiplication(cleanAnswer(rawAns));
    const hasDigits = /\d/.test(cleanAns);
    let candidates = null;

    if (!hasDigits) {
        // Safe domain-agnostic fallback without numerical math modifications
        candidates = [
            `Inte ${cleanAns}`,
            `Går ej att avgöra`,
            `Inget av alternativen`
        ];
    } else if (cleanAns.includes('*10^') || cleanAns.includes('·10^') || cleanAns.includes('\\cdot 10^')) {
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

    // Sanitize & Remove equivalents
    let unique = Array.from(new Set(candidates || []))
        .map(standardizeMultiplication)
        .filter(c => !isNormalizedMatch(c, cleanAns) && c !== '');

    if (unique.length < 3 && hasDigits) {
        const digitMatch = cleanAns.match(/-?\d+/);
        if (digitMatch) {
            const baseNum = parseInt(digitMatch[0], 10);
            const variants = getNumericalVariants(baseNum, topicId);
            variants.forEach(v => {
                const sub = cleanAns.replace(digitMatch[0], v);
                const std = standardizeMultiplication(sub);
                if (!isNormalizedMatch(std, cleanAns) && !unique.includes(std)) {
                    unique.push(std);
                }
            });
        }
    }

    let step = 1;
    while (unique.length < 3) {
        const fallbackVal = hasDigits ? `${cleanAns} (+${step++})` : `Alternativ ${step++}`;
        unique.push(fallbackVal);
    }

    const chosen = shuffle(unique).slice(0, 3);

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

export function normalizeQuestionOptions(options, correctAnswer = '') {
    if (!Array.isArray(options) || options.length === 0) return null;

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const norm = (s) => String(s ?? '')
        .toLowerCase()
        .replace(/[\s_]+/g, '')
        .replace(/\\/g, '')
        .trim();
    const cleanTarget = norm(correctAnswer);

    return options.map((opt, idx) => {
        const text = typeof opt === 'object' && opt !== null
            ? String(opt.label ?? opt.text ?? opt.value ?? '')
            : String(opt);

        const isExplicit = typeof opt === 'object' && opt !== null && (opt.isCorrect !== undefined || opt.correct !== undefined)
            ? Boolean(opt.isCorrect ?? opt.correct)
            : norm(text) === cleanTarget;

        return {
            id: (typeof opt === 'object' && opt?.id) ? opt.id : (letters[idx] || String(idx + 1)),
            label: text,
            isCorrect: isExplicit
        };
    });
}