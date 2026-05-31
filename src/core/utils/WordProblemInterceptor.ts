import { GLOBAL_STORY_REGISTRY } from './stories/index.js'; // 🟢 Dynamic content link

export interface StoryScenario {
    sv: string;
    en: string;
}

export class WordProblemInterceptor {
    public static process(questionData: any, variationConfig: VariationConfig, lang: string = 'sv'): any {
        if (!variationConfig || !variationConfig.contextType || !variationConfig.extractorPattern) {
            return questionData;
        }

        // 🟢 FALLBACK LANE: Prioritize standard latex field, fallback to hidden interceptorToken if empty
        const sourceToken = questionData?.renderData?.latex || questionData?.renderData?.interceptorToken;
        if (!sourceToken || typeof sourceToken !== 'string') {
            return questionData;
        }

        const matchResult = sourceToken.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return questionData; 
        }

        const extractedParams = matchResult.groups;
        
        // 🟢 FIXED: Reads from the clean, imported decentralized registry
        const entry = GLOBAL_STORY_REGISTRY[variationConfig.contextType];
        if (!entry) {
            return questionData;
        }

        let activeScenario: StoryScenario;
        if (Array.isArray(entry)) {
            const seedValue = Object.values(extractedParams).reduce((acc, val) => {
                const num = parseInt(String(val).replace(/[()]/g, '')) || 0;
                return acc + num;
            }, 0);
            const selectedIndex = Math.abs(seedValue) % entry.length;
            activeScenario = entry[selectedIndex];
        } else {
            activeScenario = entry;
        }

        let localizedStory = lang === 'en' ? activeScenario.en : activeScenario.sv;

        Object.entries(extractedParams).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
        });

        // --- FIXED AND UNIFIED SUFFIX SYSTEM ---
        if (variationConfig.key === 'table_formula' || variationConfig.key === 'find_formula') {
            localizedStory += lang === 'en' 
                ? " Write the formula that describes this situation." 
                : " Bestäm formeln som beskriver mönstret.";
        } 
        else if (
            variationConfig.key === 'distribute_plus' || 
            variationConfig.key === 'distribute_minus' || 
            variationConfig.key === 'distribute_combine_std'
        ) {
            localizedStory += lang === 'en'
                ? " Write and simplify the algebraic expression."
                : " Skriv och förenkla uttrycket.";
        }
        else if (questionData.metadata?.difficulty === 5) {
            // Level 5 explicitly appends ONE clean instruction to WRITE the equation
            localizedStory += lang === 'en' 
                ? " Write the equation that describes this situation." 
                : " Teckna ekvationen som beskriver situationen.";
        } else if (variationConfig.key === 'combine_standard_mixed') {
            const action1 = extractedParams.op1 === '+' ? "kliver på" : "går av";
            const action2 = extractedParams.op2 === '+' ? "kliver på" : "går av";
            const action3 = extractedParams.op3 === '+' ? "kliver på" : "går av";
            
            if (lang === 'sv') {
                localizedStory = `Inledningsvis finns det {a}x personer i ett område. Sedan ${action1} {b} personer, därefter ${action2} {c}x personer, och till sist ${action3} {d} personer. Skriv och förenkla ett uttryck för det nya antalet personer.`;
            } else {
                const action1En = extractedParams.op1 === '+' ? "board" : "leave";
                const action2En = extractedParams.op2 === '+' ? "board" : "leave";
                const action3En = extractedParams.op3 === '+' ? "board" : "leave";
                localizedStory = `Initially there are {a}x people in an area. Then {b} people ${action1En}, next {c}x people ${action2En}, and finally {d} people ${action3En}. Write and simplify an expression for the current count.`;
            }

            Object.entries(extractedParams).forEach(([key, value]) => {
                const cleanValue = String(value).replace(/[()]/g, '');
                localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
            });    
        } else if (
            questionData.variationKey === 'apply_factor_inc' || 
            questionData.variationKey === 'apply_factor_dec'
        ) {
            // Change FactorLevel 2 Appending Rule
            localizedStory += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
        } else if (
            questionData.variationKey === 'find_original_inc' || 
            questionData.variationKey === 'find_original_dec'
        ) {
            // Change Factor Level 3 Appending Rule
            localizedStory += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
        } else if (questionData.variationKey === 'sequential_factors') {
            // Change Factor Level 4 Appending Rule
            localizedStory += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
        } else {
            // All other levels (including Level 6 solve tasks) append ONE clean instruction to SOLVE for x
            localizedStory += lang === 'en' 
                ? " Calculate the value of x." 
                : " Beräkna värdet på x.";
        }

        return {
            ...questionData,
            renderData: {
                ...questionData.renderData,
                description: localizedStory,
                availableStories: Array.isArray(entry) ? entry : [entry],
                // Caches the raw values so the UI can inject them during text randomization loops
                extractedParams: extractedParams 
            },
            metadata: {
                ...questionData.metadata,
                isWordProblemApplied: true
            }
        };
    }
}