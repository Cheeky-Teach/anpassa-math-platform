// src/core/utils/WordProblemInterceptor.ts

export interface VariationConfig {
    key: string;
    contextType?: string;
    extractorPattern?: RegExp;
    tags?: string[];
}

// 1. STORY REGISTRY DICTIONARY (Fully Localized)
const STORY_REGISTRY: Record<string, { sv: string; en: string }> = {
    discrete_pool: {
        sv: "I en skål ligger det totalt {total} frukter. Av dessa är {match} stycken äpplen och resten är päron. Om du tar en frukt helt slumpmässigt utan att titta, vad är sannolikheten att du får ett äpple?",
        en: "In a bowl there are {total} pieces of fruit in total. Of these, {match} are apples and the rest are pears. If you pick a fruit completely at random without looking, what is the probability that you get an apple?"
    },
    value_delta: {
        sv: "Ett par skor kostade ursprungligen {oldV} kr. Under en rea sänktes priset med {diff} kr. Hur stor var prissänkningen uttryckt i procent?",
        en: "A pair of shoes originally cost {oldV} kr. During a sale, the price was reduced by {diff} kr. How large was the price reduction expressed as a percentage?"
    }
};

export class WordProblemInterceptor {
    /**
     * Intercepts and transforms abstract descriptions into real-world contextual word problems.
     * Safely returns original data if any extraction metrics fail.
     */
    public static process(questionData: any, variationConfig: VariationConfig, lang: string = 'sv'): any {
        // --- GUARD 1: Check if configuration is set up for word problems ---
        if (!variationConfig || !variationConfig.contextType || !variationConfig.extractorPattern) {
            return questionData;
        }

        // --- GUARD 2: Ensure the question has rendering parameters and a LaTeX source to parse ---
        const latexSource = questionData?.renderData?.latex;
        if (!latexSource || typeof latexSource !== 'string') {
            return questionData;
        }

        // --- GUARD 3: Run the regex capture signature against the LaTeX source ---
        const matchResult = latexSource.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return questionData; // Safe fallback if regex misses the math signature
        }

        // Extract the named capture parameters (e.g., { match, total } or { diff, oldV })
        const extractedParams = matchResult.groups;

        // --- GUARD 4: Fetch the corresponding narrative string template ---
        const storyTemplate = STORY_REGISTRY[variationConfig.contextType];
        if (!storyTemplate) {
            return questionData;
        }

        // Choose the correct language text
        let localizedStory = storyTemplate[lang === 'en' ? 'en' : 'sv'];

        // --- COMPILER PASS: Dynamically swap placeholders with real values ---
        Object.entries(extractedParams).forEach(([key, value]) => {
            localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), String(value));
        });

        // --- RETURN CONTEXTUALIZED DATA BUNDLE ---
        return {
            ...questionData,
            renderData: {
                ...questionData.renderData,
                // Overwrite the dry abstract string with the narrative text cleanly
                description: localizedStory
            },
            metadata: {
                ...questionData.metadata,
                isWordProblemApplied: true
            }
        };
    }
}