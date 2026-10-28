// src/components/live/core/liveAnswerUtils.js

/**
 * Safely extracts and decodes the correct answer from resolved question data,
 * handling plain-text answers, base64 UTF-8 tokens, and nested renderData payloads.
 */
export function extractDecodedAnswer(resolvedData) {
    if (!resolvedData) return null;

    // 1. Direct answer field
    if (resolvedData.answer !== undefined && resolvedData.answer !== null && String(resolvedData.answer).trim() !== '') {
        return String(resolvedData.answer);
    }

    // 2. Fallback to nested renderData.answer
    if (resolvedData.renderData?.answer !== undefined && resolvedData.renderData?.answer !== null) {
        return String(resolvedData.renderData.answer);
    }

    // 3. Extract token from either root or renderData
    const token = resolvedData.token || resolvedData.renderData?.token;
    if (!token) return null;

    // 4. Decode base64 UTF-8 byte stream (matches original monolith decoder)
    try {
        const binaryString = atob(token);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch {
        try {
            return atob(token);
        } catch {
            return null;
        }
    }
}

/**
 * Normalizes math answer strings for whitespace, decimal commas,
 * variable prefixes ("x="), swedish answer prefix ("svar:"), and multiplication dots.
 */
export function normalizeMathString(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(',', '.')
        .replace(/^[a-z]=/, '')
        .replace(/^svar:/, '')
        .replace(/·/g, '*');
}

/**
 * Evaluates student answer against decoded key.
 * Guarded against false positives from double-empty strings.
 */
export function evaluateAnswer(givenAnswer, expectedAnswer) {
    if (givenAnswer === null || givenAnswer === undefined) return false;
    if (expectedAnswer === null || expectedAnswer === undefined) return false;

    const normGiven = normalizeMathString(givenAnswer);
    const normExpected = normalizeMathString(expectedAnswer);

    // Prevent matching empty strings to each other
    if (!normGiven || !normExpected) return false;

    return normGiven === normExpected;
}