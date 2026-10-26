// src/lib/activityQuestionClient.js

/**
 * Robust Base64 decoder safe across UTF-8 characters and malformed tokens.
 */
function safeBase64Decode(token) {
    if (!token || typeof token !== 'string') return null;
    try {
        const decoded = atob(token.trim());
        try {
            return decodeURIComponent(escape(decoded));
        } catch {
            return decoded;
        }
    } catch {
        return null;
    }
}

/**
 * Standardizes raw question objects from /api/question, /api/batch,
 * or saved sheet packets into a unified, reliable game contract.
 */
export function normalizeActivityQuestion(item, fallbackTopic = 'basic_arithmetic', fallbackVariation = 'generic') {
    if (!item) return null;

    // Detect batch generator error objects
    if (item.type === 'error' || item.meta?.error) {
        return {
            id: item.id || `err_${Date.now()}`,
            isError: true,
            errorMessage: item.text || 'Question generation failed',
            topicId: fallbackTopic,
            variationKey: fallbackVariation,
            level: 1,
            clues: [],
            renderData: {},
            resolvedData: { renderData: {}, clues: [], level: 1 }
        };
    }

    // 1. Reconcile topic and variation keys across flat vs nested batch responses
    const topicId = item.topic_id || item.topicId || item.topic || fallbackTopic;
    const variationKey = item.variation_key || item.variationKey || item.variation || fallbackVariation;

    // 2. Reconcile resolvedData (question.ts is flat, batch.ts nests it under resolvedData)
    const resolvedData = item.resolvedData ? {
        renderData: item.resolvedData.renderData || {},
        token: item.resolvedData.token || null,
        clues: Array.isArray(item.resolvedData.clues) ? item.resolvedData.clues : [],
        level: Number(item.resolvedData.level) || Number(item.level) || 1
    } : {
        renderData: item.renderData || {},
        token: item.token || null,
        clues: Array.isArray(item.clues) ? item.clues : [],
        level: Number(item.level) || 1
    };

    const renderData = resolvedData.renderData || {};
    const clues = resolvedData.clues || [];

    // 3. Extract and decrypt the definitive answer
    let displayAnswer = renderData.answer || item.answer || null;
    if (!displayAnswer && resolvedData.token) {
        displayAnswer = safeBase64Decode(resolvedData.token);
    }

    // 4. Word problem flag detection
    const isWordProblem = Boolean(
        renderData.isWordProblemApplied ||
        item.wordProblem ||
        (item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined)
    );

    return {
        id: item.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        topicId,
        variationKey,
        name: item.name || topicId.replace(/_/g, ' '),
        level: Number(resolvedData.level) || 1,
        resolvedData,
        renderData,
        clues,
        answer: displayAnswer,
        token: resolvedData.token,
        slotId: item.slotId || null,
        wordProblem: isWordProblem,
        isError: false
    };
}

/**
 * Bulk question hydration via POST /api/batch in a single HTTP roundtrip.
 * @param {Array<{topic: string, level?: number, variation?: string, wordProblem?: boolean, slotId?: string}>} requests
 * @param {string} lang - 'sv' | 'en'
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBatchQuestions(requests, lang = 'sv') {
    if (!Array.isArray(requests) || requests.length === 0) return [];

    const payloadRequests = requests.map(r => ({
        topic: r.topic,
        level: Number(r.level) || 1,
        variation: r.variation && r.variation !== 'generic' ? r.variation : undefined,
        lang,
        wordProblem: Boolean(r.wordProblem)
    }));

    const res = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: payloadRequests })
    });

    if (!res.ok) {
        throw new Error(`Batch generation failed (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid response format from /api/batch: expected an array.");
    }

    return data.map((item, idx) => {
        const reqSpec = payloadRequests[idx];
        const normalized = normalizeActivityQuestion(item, reqSpec?.topic, reqSpec?.variation);
        return {
            ...normalized,
            slotId: requests[idx]?.slotId || `slot_${idx}`
        };
    });
}

/**
 * Single question query via GET /api/question (for targeted tile re-rolls & variations).
 * @param {{topic: string, level?: number, variation?: string, wordProblem?: boolean}} spec
 * @param {string} lang - 'sv' | 'en'
 * @returns {Promise<Object>}
 */
export async function fetchSingleQuestion({ topic, level = 1, variation, wordProblem = false }, lang = 'sv') {
    const params = new URLSearchParams({
        topic: String(topic),
        level: String(Number(level) || 1),
        lang: String(lang || 'sv'),
        wordProblem: String(Boolean(wordProblem))
    });

    if (variation && variation !== 'generic') {
        params.append('variation', variation);
    }

    const res = await fetch(`/api/question?${params.toString()}`);
    if (!res.ok) {
        throw new Error(`Single question generation failed (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return normalizeActivityQuestion(data, topic, variation);
}

/**
 * Helper: Generates 4 dynamic order-of-magnitude estimation brackets centered on the true answer.
 */
export function generateDynamicEstimationBrackets(rawAnswer) {
    if (rawAnswer === null || rawAnswer === undefined) return null;

    const numericStr = String(rawAnswer).replace(/[^0-9.-]/g, '');
    const A = parseFloat(numericStr);

    if (isNaN(A)) return null;

    let step = 1;
    const absA = Math.abs(A);

    if (absA > 100) step = 25;
    else if (absA > 20) step = 5;
    else if (absA > 5) step = 2;
    else if (absA <= 1) step = 0.25;

    const lowerBound = Math.floor(A / step) * step;
    const upperBound = lowerBound + step;

    return [
        { label: `< ${lowerBound}`, isCorrect: false },
        { label: `${lowerBound} – ${upperBound}`, isCorrect: true },
        { label: `${upperBound} – ${upperBound + step}`, isCorrect: false },
        { label: `> ${upperBound + step}`, isCorrect: false }
    ].sort(() => Math.random() - 0.5);
}