import katex from 'katex';

/**
 * Replicates the UI's word problem compiler so the Stress Tester 
 * evaluates exactly what the student will see on screen.
 */
export const buildStoryString = (q, storyIndex, lang = 'sv', topicId, variationKey, skillBuckets = null) => {
    if (!q.availableStories || !q.availableStories[storyIndex]) return null;
    
    let template = q.availableStories[storyIndex][lang === 'en' ? 'en' : 'sv'];
    if (!template) return null;

    let params = q.extractedParams;

    // Fallback regex extractor (mirrors PracticeView fallback)
    // Requires passing SKILL_BUCKETS into the validation options
    if (!params && skillBuckets && topicId && variationKey) {
        const category = Object.values(skillBuckets).find(cat => cat.topics[topicId]);
        const variation = category?.topics[topicId]?.variations?.find(v => v.key === variationKey);
        const sourceToken = q.latex || q.interceptorToken;
        if (variation?.extractorPattern && sourceToken) {
            const match = sourceToken.match(variation.extractorPattern);
            if (match && match.groups) params = match.groups;
        }
    }

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

    // You can optionally append the UI suffixes here if you want to test them,
    // but usually, the core template injection is what fails and needs testing.

    return template;
};

export const validateQuestion = (q, includeClues, options = {}) => {
    const { 
        testWordProblems = false, 
        lang = 'sv', 
        topicId = null, 
        variationKey = null, 
        skillBuckets = null 
    } = options;

    const flags = [];
    let payloadStr = JSON.stringify(q);

    // --- WORD PROBLEM INTERCEPTOR TESTING ---
    let generatedStories = [];
    if (testWordProblems && q.availableStories && q.availableStories.length > 0) {
        // Generate every available story for this question to ensure none are broken
        q.availableStories.forEach((_, idx) => {
            const storyStr = buildStoryString(q, idx, lang, topicId, variationKey, skillBuckets);
            if (storyStr) {
                generatedStories.push(storyStr);
                // Append the generated text to the payload string so the global regex 
                // checks below (decimals, double operators) also analyze the story text!
                payloadStr += ` ||| ${storyStr}`; 
            }
        });
    }

    // 1. Unrendered Variables (e.g., "{x}" left in the string)
    const unrenderedRegex = /\{[a-zA-Z0-9_]+\}/;
    if (unrenderedRegex.test(q.description) || unrenderedRegex.test(q.latex)) {
        flags.push("Unrendered {variable} in Math Data");
    }
    // Check if the interceptor failed to replace a variable in the story
    if (generatedStories.some(story => unrenderedRegex.test(story))) {
        flags.push("Unrendered {variable} in Word Problem Story");
    }

    // 2. Trailing Decimals (e.g., "5.0" instead of "5")
    if (/\.0+(?!\d)/.test(payloadStr)) {
        flags.push("Trailing Decimal (.0)");
    }

    // 3. Double Operators (e.g., "+ -5" or "--3")
    if (/--|\+-|-\+|\+\+/.test(payloadStr)) {
        flags.push("Double Operator (+- / --)");
    }

    // 4. Division by Zero (e.g., \frac{x}{0})
    if (/\\frac\{[^}]*\}\{0\}/.test(q.latex)) {
        flags.push("Division by Zero");
    }

    // 5. Duplicate Options (Multiple Choice)
    if (q.options && q.options.length > 0) {
        const uniqueOptions = new Set(q.options.map(opt => typeof opt === 'object' ? opt.value : opt));
        if (uniqueOptions.size !== q.options.length) {
            flags.push("Duplicate Options");
        }
    }

    // 6. Missing/Empty Clues (If coach mode is active)
    if (includeClues && (!q.clues || q.clues.length === 0)) {
        flags.push("Missing Clues Array");
    }

    // 7. KaTeX Parse Validation
    try {
        if (q.latex) katex.renderToString(q.latex, { throwOnError: true });
        if (q.clues) {
            q.clues.forEach(clue => {
                if (clue.math) katex.renderToString(clue.math, { throwOnError: true });
            });
        }
    } catch (e) {
        flags.push(`KaTeX Error: ${e.message.split('\n')[0]}`);
    }

    return { 
        ...q, 
        flags, 
        isFlagged: flags.length > 0,
        _testedStories: generatedStories // Optional: attach generated stories so you can review them in your bulk output UI
    };
};