import { StoryRules, StoryValidationResult } from './wordProblemContract';

/**
 * Normalizes raw string parameters into clean floats and calculates compound helpers.
 */
export function parseNumericParams(rawParams: Record<string, string | number>): Record<string, number> {
    const parsed: Record<string, number> = {};

    for (const [key, val] of Object.entries(rawParams)) {
        if (typeof val === 'number') {
            parsed[key] = val;
            continue;
        }

        // Clean up formatting: normalize commas to dots, remove parentheses and spaces
        const cleanStr = String(val)
            .replace(/[()]/g, '')
            .replace(/\s+/g, '')
            .replace(',', '.');

        const num = parseFloat(cleanStr);
        if (!isNaN(num)) {
            parsed[key] = num;
        }
    }

    // Auto-calculate currentSum from knownList if knownList exists
    if (rawParams.knownList && typeof rawParams.knownList === 'string') {
        const numbers = rawParams.knownList
            .split(/[,\s]+/)
            .map(s => parseFloat(s.trim().replace(',', '.')))
            .filter(n => !isNaN(n));
        
        if (numbers.length > 0) {
            parsed.currentSum = numbers.reduce((a, b) => a + b, 0);
        }
    }

    // Compound Fraction Helper 1: n1 / d1
    if (parsed.n1 !== undefined && parsed.d1 !== undefined && parsed.d1 !== 0) {
        parsed.n1_over_d1 = parsed.n1 / parsed.d1;
    }

    // Compound Fraction Helper 2: n2 / d2
    if (parsed.n2 !== undefined && parsed.d2 !== undefined && parsed.d2 !== 0) {
        parsed.n2_over_d2 = parsed.n2 / parsed.d2;
    }

    // Compound Fraction Division Quotient: (n1/d1) / (n2/d2)
    if (parsed.n1_over_d1 !== undefined && parsed.n2_over_d2 !== undefined && parsed.n2_over_d2 !== 0) {
        parsed.result = parsed.n1_over_d1 / parsed.n2_over_d2;
    }

    // Compound Powers of Ten Helper: num / power
    if (parsed.num !== undefined && parsed.power !== undefined && parsed.power !== 0) {
        parsed.result = parsed.num / parsed.power;
    }

    return parsed;
}

/**
 * Universal evaluator that checks numeric parameters against declarative StoryRules.
 */
export function evaluateStoryRules(
    rules: StoryRules | undefined,
    rawParams: Record<string, string | number>
): StoryValidationResult {
    if (!rules) {
        return { isValid: true };
    }

    const params = parseNumericParams(rawParams);

    // 1. Integer Only Constraint
    if (rules.integerOnly) {
        for (const key of rules.integerOnly) {
            const val = params[key];
            if (val !== undefined && !Number.isInteger(val)) {
                return { isValid: false, failedRule: `integerOnly:${key}` };
            }
        }
    }

    // 2. Greater Than Constraint (asserts params[a] > params[b])
    if (rules.greaterThan) {
        const [aKey, bKey] = rules.greaterThan;
        const aVal = params[aKey];
        const bVal = params[bKey];
        if (aVal !== undefined && bVal !== undefined && aVal <= bVal) {
            return { isValid: false, failedRule: `greaterThan:${aKey}>${bKey}` };
        }
    }

    // 3. Less Than Constraint (asserts params[a] < params[b])
    if (rules.lessThan) {
        const [aKey, bKey] = rules.lessThan;
        const aVal = params[aKey];
        const bVal = params[bKey];
        if (aVal !== undefined && bVal !== undefined && aVal >= bVal) {
            return { isValid: false, failedRule: `lessThan:${aKey}<${bKey}` };
        }
    }

    // In evaluateStoryRules:
    const targetVal = 
        params.result ?? 
        params.ans ?? 
        params.val ?? 
        params.pWin ?? 
        params.c ?? 
        params.n1_over_d1;

    // 4. Minimum Result Constraint
    if (rules.minResult !== undefined) {
        if (targetVal !== undefined && targetVal < rules.minResult) {
            return { isValid: false, failedRule: `minResult:${rules.minResult}` };
        }
    }

    // 5. Maximum Result Constraint
    if (rules.maxResult !== undefined) {
        if (targetVal !== undefined && targetVal > rules.maxResult) {
            return { isValid: false, failedRule: `maxResult:${rules.maxResult}` };
        }
    }

    // 6. Triangle Inequality Constraint (sum of any two sides must exceed the third)
    if (rules.triangleInequality) {
        const [aKey, bKey, cKey] = rules.triangleInequality;
        const a = params[aKey];
        const b = params[bKey];
        const c = params[cKey];

        if (a !== undefined && b !== undefined && c !== undefined) {
            if (a + b <= c || a + c <= b || b + c <= a) {
                return { isValid: false, failedRule: 'triangleInequality' };
            }
        }
    }

    // 7. Custom Logic Callback
    if (rules.custom) {
        try {
            if (!rules.custom(params)) {
                return { isValid: false, failedRule: 'custom' };
            }
        } catch {
            return { isValid: false, failedRule: 'customException' };
        }
    }

    return { isValid: true };
}