import katex from 'katex';

export const validateQuestion = (q, includeClues) => {
    const flags = [];
    const payloadStr = JSON.stringify(q);

    // 1. Unrendered Variables (e.g., "{x}" left in the string)
    if (/\{[a-zA-Z0-9_]+\}/.test(q.description) || /\{[a-zA-Z0-9_]+\}/.test(q.latex)) {
        flags.push("Unrendered {variable}");
    }

    // 2. Trailing Decimals (e.g., "5.0" instead of "5")
    if (/\.0+(?!\d)/.test(payloadStr)) {
        flags.push("Trailing Decimal (.0)");
    }

    // 3. Double Operators (e.g., "+ -5" or "--3")
    if (/--|\+-|-\+|\+\+/.test(q.latex) || (q.clues && /--|\+-|-\+|\+\+/.test(JSON.stringify(q.clues)))) {
        flags.push("Double Operator (+- / --)");
    }

    // 4. Division by Zero (e.g., \frac{x}{0})
    if (/\\frac\{[^}]*\}\{0\}/.test(q.latex)) {
        flags.push("Division by Zero");
    }

    // 5. Duplicate Options (Multiple Choice)
    if (q.options && q.options.length > 0) {
        const uniqueOptions = new Set(q.options);
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

    return { ...q, flags, isFlagged: flags.length > 0 };
};