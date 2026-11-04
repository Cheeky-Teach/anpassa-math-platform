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

function mutateFraction(str, renderData = {}, raw = {}) {
    const clean = str.replace(/\$/g, '').replace(/\\left|\\right/g, '').trim();

    // 🟢 1. Flexible parser matching: "2 \frac{1}{3}", "2\frac{1}{3}", "\frac{1}{3}", "2 1/3", "1/3"
    const fracMatch = clean.match(/^(?:(\d+)\s*)?(?:\\frac\{\s*(\d+)\s*\}\{\s*(\d+)\s*\}|(\d+)\/(\d+))$/);
    if (!fracMatch) return null;

    const whole = fracMatch[1] ? parseInt(fracMatch[1], 10) : null;
    const num = parseInt(fracMatch[2] || fracMatch[4], 10);
    const den = parseInt(fracMatch[3] || fracMatch[5], 10);
    if (!den || den === 0) return null;

    const isLatex = clean.includes('frac');
    const fmt = (n, d, w = null) => {
        if (d === 0) return null;
        const frac = isLatex ? `\\frac{${n}}{${d}}` : `${n}/${d}`;
        return w !== null && w !== 0 ? `${w} ${frac}` : frac;
    };

    const decoys = new Set();

    // 🟢 2. Authentic Misconception: Inverted Numerator / Denominator (e.g. 3/4 -> 4/3)
    if (num !== den) {
        decoys.add(fmt(den, num, whole));
    }

    // 🟢 3. Authentic Misconception: Added Denominators or Unreduced Form
    // (e.g., student added denominators: 2/den -> 2/(den*2))
    decoys.add(fmt(num, den * 2, whole));
    if (den % 2 === 0 && den > 2) {
        decoys.add(fmt(num, den / 2, whole));
    }

    // 🟢 4. Authentic Misconception: Off-by-one in numerator (calculation slip)
    decoys.add(fmt(num + 1, den, whole));
    if (num > 1) {
        decoys.add(fmt(num - 1, den, whole));
    }

    // 🟢 5. Authentic Misconception: Off-by-one in denominator (common denominator slip)
    decoys.add(fmt(num, den + 1, whole));
    if (den > 2) {
        decoys.add(fmt(num, den - 1, whole));
    }

    // 🟢 6. Mixed Number Conversion Misconceptions
    if (whole !== null && whole > 0) {
        // Forgot the whole number: 2 1/3 -> 1/3
        decoys.add(fmt(num, den));
        // Wrong conversion to improper fraction: 2 1/3 -> (2*num + den)/den
        decoys.add(fmt(whole * num + den, den));
        // Off-by-one whole number: 2 1/3 -> 1 1/3, 3 1/3
        decoys.add(fmt(num, den, whole + 1));
        decoys.add(fmt(num, den, Math.max(1, whole - 1)));
    } else if (num > den) {
        // Improper fraction -> pseudo mixed number slip
        const fakeWhole = Math.floor(num / den);
        const rem = num % den;
        if (rem > 0) {
            decoys.add(fmt(rem, den, fakeWhole + 1));
            decoys.add(fmt(rem + 1, den, fakeWhole));
        }
    }

    return Array.from(decoys).filter(d => d !== null && !isNormalizedMatch(d, clean));
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

function mutateUnitConversion(cleanAns, renderData = {}, raw = {}) {
    const rawVal = renderData.ans ?? renderData.val ?? cleanAns;
    const isComma = String(cleanAns).includes(',');
    const num = parseFloat(String(rawVal).replace(',', '.'));
    
    if (isNaN(num) || num === 0) return null;

    const decoys = new Set();
    const shifts = [0.1, 10, 0.01, 100, 0.001, 1000];

    // Decimal point / comma movement distractors
    for (const factor of shifts) {
        const shifted = Number((num * factor).toPrecision(10));
        if (shifted !== num && Number.isFinite(shifted)) {
            // Keep formatting consistent (comma vs dot)
            const formatted = isComma 
                ? String(shifted).replace('.', ',') 
                : String(shifted);
            decoys.add(formatted);
        }
    }

    // Directional inverse error if factor is available
    if (renderData.factor && renderData.val !== undefined) {
        const val = parseFloat(String(renderData.val).replace(',', '.'));
        const inverseAns = Number((val / renderData.factor).toPrecision(10));
        const inverseMult = Number((val * renderData.factor).toPrecision(10));
        if (inverseAns !== num) decoys.add(isComma ? String(inverseAns).replace('.', ',') : String(inverseAns));
        if (inverseMult !== num) decoys.add(isComma ? String(inverseMult).replace('.', ',') : String(inverseMult));
    }

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
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

function mutateChangeFactor(cleanAns, renderData = {}, raw = {}) {
    const isComma = String(cleanAns).includes(',');
    const val = parseFloat(String(cleanAns).replace(',', '.'));
    if (isNaN(val)) return null;

    const decoys = new Set();
    const fmt = (num) => {
        const rounded = Number(num.toFixed(4));
        return isComma ? String(rounded).replace('.', ',') : String(rounded);
    };

    // Case 1: Answer is a Change Factor (e.g., 1.25, 0.80, 1.05, 0.95)
    if (val > 0 && val < 4 && !cleanAns.includes('%')) {
        // Misconception 1: Direction reversal (1 + p instead of 1 - p, or vice-versa)
        if (val > 1) {
            const pct = (val - 1);
            if (1 - pct > 0) decoys.add(fmt(1 - pct)); // e.g. 1.25 -> 0.75
            decoys.add(fmt(pct));                      // e.g. 1.25 -> 0.25 (forgot the base 1)
            decoys.add(fmt(1 + pct * 10));             // e.g. 1.05 -> 1.50 (decimal zero error)
        } else if (val < 1) {
            const pct = (1 - val);
            decoys.add(fmt(1 + pct));                  // e.g. 0.80 -> 1.20
            decoys.add(fmt(pct));                      // e.g. 0.80 -> 0.20
            decoys.add(fmt(val * 100));                // e.g. 0.85 -> 85 (confusing remaining with change)
            if (val > 0.9) decoys.add(fmt(1 - pct * 10)); // e.g. 0.95 -> 0.50
        }
    }

    // Case 2: Answer is a Percentage resulting from a Change Factor (e.g. 15, 25, 80)
    else if (!cleanAns.includes('·') && !cleanAns.includes('/') && Number.isInteger(val)) {
        if (val > 0 && val < 100) {
            decoys.add(fmt(100 - val)); // Inverse remaining: e.g., 15% -> 85%
            decoys.add(fmt(val / 10));  // Shift error: e.g., 50% -> 5%
            decoys.add(fmt(val * 10));  // Shift error: e.g., 5% -> 50%
        }
    }

    // Case 3: Finding original price (Reverse Percentage)
    if (renderData.interceptorToken && String(renderData.interceptorToken).includes('frac')) {
        // e.g. \frac{newPrice}{factor}
        const match = String(renderData.interceptorToken).match(/\\frac\{(\d+)\}\{([0-9.,]+)\}/);
        if (match) {
            const newP = parseFloat(match[1]);
            const factor = parseFloat(match[2].replace(',', '.'));
            if (!isNaN(newP) && !isNaN(factor)) {
                // Reverse Fallacy: applying % directly to new price
                const pct = Math.abs(1 - factor);
                const falseMult = factor > 1 ? newP * (1 - pct) : newP * (1 + pct);
                const directMult = newP * factor;
                decoys.add(fmt(falseMult));
                decoys.add(fmt(directMult));
                decoys.add(fmt(newP));
            }
        }
    }

    // Case 4: Sequential Factors (e.g., 1.20 * 1.10 = 1.32)
    if (renderData.interceptorToken && String(renderData.interceptorToken).includes('·')) {
        const parts = String(renderData.interceptorToken).split('·').map(s => parseFloat(s.trim().replace(',', '.')));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const [f1, f2] = parts;
            const pct1 = Math.round((f1 - 1) * 100);
            const pct2 = Math.round((f2 - 1) * 100);
            // Additive fallacy: adding percentages instead of multiplying factors
            const additiveFactor = 1 + (pct1 + pct2) / 100;
            decoys.add(fmt(additiveFactor));
            // Cancelling fallacy if one inc and one dec
            if ((f1 > 1 && f2 < 1) || (f1 < 1 && f2 > 1)) {
                decoys.add(fmt(1.00));
            }
        }
    }

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
}

function mutatePercentage(cleanAns, renderData = {}, raw = {}) {
    const isComma = String(cleanAns).includes(',');
    const hasPercent = cleanAns.includes('%') || renderData.suffix === '%';
    const num = parseFloat(String(cleanAns).replace('%', '').replace(',', '.').trim());
    if (isNaN(num)) return null;

    const decoys = new Set();
    const fmt = (n) => {
        const clean = Number(n.toFixed(2));
        const base = isComma ? String(clean).replace('.', ',') : String(clean);
        return hasPercent ? `${base}%` : base;
    };

    // Case 1: Fraction / Decimal Equivalence (e.g., 1/4 -> 25%, 0.25)
    if (raw.variationKey === 'equivalence_basic_frac' || renderData.description?.includes('bråket')) {
        // Misconception: Denominator as percent (1/4 -> 4% or 40%, 1/5 -> 5% or 50%)
        const denomMatch = renderData.description?.match(/1\/(\d+)/);
        if (denomMatch) {
            const d = parseInt(denomMatch[1], 10);
            decoys.add(fmt(d));
            decoys.add(fmt(d * 10));
        }
        decoys.add(fmt(100 - num));
    }

    // Case 2: Percentage Rate Calculation (e.g., 15 out of 60 -> 25%)
    if (renderData.interceptorToken && String(renderData.interceptorToken).includes(';')) {
        const [partStr, wholeStr] = String(renderData.interceptorToken).split(';').map(s => parseFloat(s.trim().replace(',', '.')));
        if (!isNaN(partStr) && !isNaN(wholeStr) && wholeStr !== 0) {
            // Misconception: Dividing by (whole - part) or (whole + part)
            const falseRate = (partStr / (wholeStr - partStr)) * 100;
            if (Number.isFinite(falseRate)) decoys.add(fmt(falseRate));
            // Misconception: Ratio of Part to 100 directly
            decoys.add(fmt(partStr));
            // Misconception: Complementary percentage (100 - correct)
            decoys.add(fmt(100 - num));
        }
    }

    // Case 3: Percentage of Amount (e.g., 20% of 600 = 120)
    if (!hasPercent && num > 1) {
        // Decimal shift errors
        decoys.add(fmt(num / 10));
        decoys.add(fmt(num * 10));
        // Wrong benchmark divisor (e.g. dividing by 4 instead of 5, or 5 instead of 4)
        decoys.add(fmt(num * 1.25));
        decoys.add(fmt(num * 0.8));
    }

    // Case 4: General Percentage Shifts & Complement
    if (hasPercent) {
        if (num <= 100) decoys.add(fmt(100 - num));
        decoys.add(fmt(num / 10));
        if (num <= 10) decoys.add(fmt(num * 10));
    }

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
}

/**
 * Specialized mutator for LinearGraphGenerator
 * Handles: Find m, Find k (integers and fractions like "1/2", "-1/3"), and Equations (y = kx + m)
 */
function mutateLinearGraph(cleanAns, renderData = {}, raw = {}) {
    const vKey = raw?.variationKey || '';
    const token = String(renderData?.interceptorToken || '');
    const clean = cleanAns.replace(/\$/g, '').trim();
    const decoys = new Set();

    // 🟢 CASE 1: Full Equation (e.g. "y=2x+3", "y=-x-4", "y=3")
    if (clean.includes('y=') || clean.includes('x') || vKey.includes('table_to_function') || vKey.includes('eq_') || vKey.includes('scaled_equation')) {
        let k = 1;
        let m = 0;

        // Extract directly from interceptorToken if available: "${k} ; ${m} ; ${eq}"
        if (token.includes(';')) {
            const parts = token.split(';').map(p => p.trim());
            const parsedK = parseFloat(parts[0]);
            const parsedM = parseFloat(parts[1]);
            if (!isNaN(parsedK)) k = parsedK;
            if (!isNaN(parsedM)) m = parsedM;
        } else {
            // Regex fallback
            const match = clean.match(/(?:y\s*=\s*)?([+-]?\s*\d*)x\s*([+-]\s*\d+)?/);
            if (match) {
                const rawK = match[1].replace(/\s+/g, '');
                k = rawK === '' || rawK === '+' ? 1 : (rawK === '-' ? -1 : parseInt(rawK, 10));
                m = match[2] ? parseInt(match[2].replace(/\s+/g, ''), 10) : 0;
            }
        }

        const fmt = (slope, intercept) => {
            let eq = "y=";
            if (slope !== 0) {
                if (slope === 1) eq += "x";
                else if (slope === -1) eq += "-x";
                else eq += `${slope}x`;

                if (intercept > 0) eq += `+${intercept}`;
                else if (intercept < 0) eq += `${intercept}`;
            } else {
                eq += `${intercept}`;
            }
            return eq;
        };

        // Misconception 1: Swap k and m (y = mx + k)
        if (k !== m) decoys.add(fmt(m, k));
        // Misconception 2: Slope sign inversion (positive vs negative)
        if (k !== 0) decoys.add(fmt(-k, m));
        // Misconception 3: Intercept sign inversion
        if (m !== 0) decoys.add(fmt(k, -m));
        // Misconception 4: Both signs flipped
        if (k !== 0 && m !== 0) decoys.add(fmt(-k, -m));
        // Misconception 5: Off-by-one slope calculation
        decoys.add(fmt(k + 1, m));
        if (k !== 1 && k !== -1) decoys.add(fmt(k - 1, m));

        return Array.from(decoys).filter(d => !isNormalizedMatch(d, clean));
    }

    // 🟢 CASE 2: Fractional Slope (e.g. "1/2", "1/4", "-1/3", "-1/5")
    if (clean.includes('/')) {
        const isNeg = clean.startsWith('-');
        const parts = clean.replace('-', '').split('/');
        const dy = parseInt(parts[0], 10) || 1;
        const dx = parseInt(parts[1], 10) || 2;

        // Misconception 1: Inverted rise/run (dx/dy instead of dy/dx) -> e.g. 1/2 becomes 2
        decoys.add(isNeg ? `-${dx}` : `${dx}`);
        // Misconception 2: Sign error on slope
        decoys.add(isNeg ? `${dy}/${dx}` : `-${dy}/${dx}`);
        // Misconception 3: Inverted fraction with wrong sign
        decoys.add(isNeg ? `${dx}` : `-${dx}`);
        // Misconception 4: Off-by-one run
        decoys.add(isNeg ? `-${dy}/${dx + 1}` : `${dy}/${dx + 1}`);
        if (dx > 2) decoys.add(isNeg ? `-${dy}/${dx - 1}` : `${dy}/${dx - 1}`);

        return Array.from(decoys).filter(d => !isNormalizedMatch(d, clean));
    }

    // 🟢 CASE 3: Integer Slope (k) or Intercept (m)
    const num = parseFloat(clean.replace(',', '.'));
    if (!isNaN(num) && Number.isFinite(num)) {
        // Sign error
        if (num !== 0) decoys.add(String(-num));
        // Off-by-one grid count
        decoys.add(String(num + 1));
        decoys.add(String(num - 1));
        // Slope reciprocal misconception (e.g. 2 -> 1/2)
        if (Math.abs(num) >= 2 && Math.abs(num) <= 5) {
            decoys.add(num < 0 ? `-1/${Math.abs(num)}` : `1/${num}`);
        }
    }

    return Array.from(decoys).filter(d => !isNormalizedMatch(d, clean));
}

/**
 * Specialized mutator for PlaceValueGen
 * Handles: Digits, Value of digits (whole and decimal), Build numbers, and Rounding
 */
function mutatePlaceValue(cleanAns, renderData = {}, raw = {}) {
    const vKey = raw?.variationKey || '';
    const isComma = cleanAns.includes(',');
    const cleanStr = cleanAns.replace(',', '.').trim();
    const num = parseFloat(cleanStr);
    const decoys = new Set();

    const fmt = (n) => {
        const val = Number(n.toPrecision(10));
        return isComma ? String(val).replace('.', ',') : String(val);
    };

    // 🟢 CASE 1: Rounding Variations (pv_round_whole, pv_round_dec)
    if (vKey.includes('pv_round')) {
        const hasDecimals = cleanStr.includes('.');
        const decCount = hasDecimals ? cleanStr.split('.')[1].length : 0;
        const step = Math.pow(10, -decCount);

        // 1. Wrong rounding direction (rounded down instead of up or vice versa)
        decoys.add(fmt(num + step));
        if (num - step >= 0) decoys.add(fmt(num - step));

        // 2. Off-by-place error (rounded to tenth instead of hundredth, or ten instead of hundred)
        const biggerStep = step * 10;
        decoys.add(fmt(num + biggerStep));
        if (num - biggerStep >= 0) decoys.add(fmt(num - biggerStep));

        return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
    }

    // 🟢 CASE 2: Value of Digit (e.g., Value of 7 in 4.75 is 0.7; value of 3 in 3500 is 3000)
    if (vKey.includes('_value') || (!isNaN(num) && (num < 1 || num >= 10))) {
        // Place shift errors (powers of 10)
        const shifts = [10, 0.1, 100, 0.01];
        for (const s of shifts) {
            const shifted = num * s;
            if (Number.isFinite(shifted) && shifted > 0) {
                decoys.add(fmt(shifted));
            }
        }

        // Face value misconception: e.g. for 0.04 answering 4, or for 300 answering 3
        const nonZeroMatch = cleanStr.match(/[1-9]/);
        if (nonZeroMatch) {
            const faceVal = parseInt(nonZeroMatch[0], 10);
            if (faceVal !== num) {
                decoys.add(String(faceVal));
            }
        }

        return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
    }

    // 🟢 CASE 3: Single Digit Identification (e.g. Which digit is in the tens place? -> 4)
    if (vKey.includes('_digit') || (Number.isInteger(num) && num >= 0 && num <= 9)) {
        // Offer nearby digits 0–9
        for (let offset of [-2, -1, 1, 2, 3]) {
            const d = (num + offset + 10) % 10;
            if (d !== num) decoys.add(String(d));
        }
        return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
    }

    // 🟢 CASE 4: Build Numbers (pv_whole_build, pv_dec_build)
    if (vKey.includes('_build')) {
        // Missing zero place value trap (e.g. 4 hundreds and 3 ones -> 43 instead of 403)
        const digitsOnly = cleanStr.replace('.', '');
        if (digitsOnly.includes('0')) {
            decoys.add(cleanStr.replace(/0/g, ''));
        }
        // Swapped place values
        decoys.add(fmt(num + 10));
        decoys.add(fmt(num - 10));
        decoys.add(fmt(num + 100));
        return Array.from(decoys).filter(d => !isNormalizedMatch(d, cleanAns));
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
        candidates = [
            `Inte ${cleanAns}`,
            `Går ej att avgöra`,
            `Inget av alternativen`
        ];
    } else if (
        topicId?.includes('unit') || 
        topicId?.includes('conversion') || 
        Boolean(renderData?.fromUnit && renderData?.toUnit)
    ) {
        candidates = mutateUnitConversion(cleanAns, renderData, raw);
    } else if (
        topicId?.includes('change_factor') || 
        raw?.variationKey?.includes('factor')
    ) {
        candidates = mutateChangeFactor(cleanAns, renderData, raw);
    } else if (
        topicId?.includes('percent') || 
        cleanAns.includes('%') || 
        renderData?.suffix === '%'
    ) {
        candidates = mutatePercentage(cleanAns, renderData, raw);
    } else if (
        topicId?.includes('linear_graph') || 
        topicId?.includes('line') || 
        raw?.variationKey?.startsWith('slope_') || 
        raw?.variationKey?.startsWith('intercept_') || 
        raw?.variationKey?.startsWith('table_') || 
        raw?.variationKey?.startsWith('eq_') || 
        raw?.variationKey?.startsWith('scaled_') || 
        raw?.variationKey?.startsWith('parallel_') || 
        raw?.variationKey === 'point_on_line' || 
        renderData?.graph?.lines
    ) {
        // 🟢 LinearGraphGenerator (Slopes, Intercepts, Equations)
        candidates = mutateLinearGraph(cleanAns, renderData, raw);
    } else if (
        topicId?.includes('place_value') || 
        topicId?.includes('position') || 
        raw?.variationKey?.startsWith('pv_')
    ) {
        // 🟢 PlaceValueGen (Digits, Values, Decimal positions, Rounding)
        candidates = mutatePlaceValue(cleanAns, renderData, raw);
    } else if (cleanAns.includes('*10^') || cleanAns.includes('·10^') || cleanAns.includes('\\cdot 10^')) {
        candidates = mutateScientific(cleanAns);
    } else if (cleanAns.includes('^')) {
        candidates = mutateExponent(cleanAns);
    } else if (
        cleanAns.includes('/') || 
        cleanAns.includes('frac') || 
        topicId?.includes('frac') || 
        raw?.variationKey?.includes('frac')
    ) {
        candidates = mutateFraction(cleanAns, renderData, raw);
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