// src/core/utils/WordProblemInterceptor.ts

import { GLOBAL_STORY_REGISTRY } from './stories/index.js';
import { StoryScenario } from './wordProblemContract.js';
import { evaluateStoryRules } from './evaluateStoryRules.js';

export interface VariationConfig {
    key: string;
    contextType?: string;
    extractorPattern?: RegExp;
    [key: string]: any;
}

export class WordProblemInterceptor {
    public static process(questionData: any, variationConfig: VariationConfig, lang: string = 'sv'): any {
        if (!questionData) {
            return this.markFallback(questionData);
        }

        if (!variationConfig || !variationConfig.contextType || !variationConfig.extractorPattern) {
            return this.markFallback(questionData);
        }

        // 1. Extract source token (interceptorToken preferred, latex fallback)
        const sourceToken = questionData?.renderData?.interceptorToken || questionData?.renderData?.latex;
        if (!sourceToken || typeof sourceToken !== 'string') {
            return this.markFallback(questionData);
        }

        // 2. Regex matching
        const matchResult = sourceToken.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return this.markFallback(questionData);
        }

        const extractedParams = { ...matchResult.groups };
        if (!extractedParams.label1) extractedParams.label1 = lang === 'en' ? 'red' : 'röda';
        if (!extractedParams.label2) extractedParams.label2 = lang === 'en' ? 'blue' : 'blåa';
        if (extractedParams.favorable && !extractedParams.match) {
            extractedParams.match = extractedParams.favorable;
        }
        if (extractedParams.match && !extractedParams.favorable) {
            extractedParams.favorable = extractedParams.match;
        }

        // 2.5 Auto-derive compound parameters BEFORE rule evaluation
        if (extractedParams.knownList && !extractedParams.currentSum) {
            const sum = String(extractedParams.knownList)
                .split(/[,\s]+/)
                .map(s => parseFloat(s.trim().replace(',', '.')))
                .filter(n => !isNaN(n))
                .reduce((a, b) => a + b, 0);
            extractedParams.currentSum = String(sum);
        }

        // 3. Retrieve raw registry entry
        let entry: any = (GLOBAL_STORY_REGISTRY as Record<string, any>)[variationConfig.contextType];
        if (!entry) {
            return this.markFallback(questionData);
        }

        // 4. Dynamic Operator / Sub-bucket Routing
        if (!Array.isArray(entry) && entry && typeof entry === 'object') {
            const targetSubKey = extractedParams.type && extractedParams.op 
                ? `${extractedParams.type}_${extractedParams.op === '+' ? 'plus' : 'minus'}`
                : extractedParams.type || extractedParams.op;

            if (entry[targetSubKey]) {
                entry = entry[targetSubKey];
            }
        }

        const candidateArray: StoryScenario[] = Array.isArray(entry) ? entry : [entry];

        // 5. Filter viable stories using evaluateStoryRules (currentSum is now available!)
        const viableStories = candidateArray.filter(scenario => 
            evaluateStoryRules(scenario.rules, extractedParams).isValid
        );

        // 6. Safe Fallback if 0 stories pass constraints
        if (viableStories.length === 0) {
            return this.markFallback(questionData);
        }

        // 7. Robust deterministic selection (handles strings, floats, ints evenly)
        const seedValue = Object.entries(extractedParams).reduce((acc, [key, val]) => {
            const str = `${key}:${String(val).replace(/[()]/g, '')}`;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return acc + Math.abs(hash);
        }, 0);

        const selectedIndex = Math.abs(seedValue) % viableStories.length;
        const activeScenario = viableStories[selectedIndex];

        // 8. Template placeholder replacement with defensive fallback
        let localizedStory = (lang === 'en' ? activeScenario.en : activeScenario.sv) 
            || activeScenario.sv 
            || activeScenario.en 
            || '';

        if (!localizedStory) {
            return this.markFallback(questionData);
        }

        Object.entries(extractedParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const cleanValue = String(value).replace(/[()]/g, '');
                localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
            }
        });

        // 9. Standard instruction suffixes
        localizedStory = this.appendInstructionSuffix(localizedStory, variationConfig, questionData, lang);

        return {
            ...questionData,
            renderData: {
                ...questionData.renderData,
                description: localizedStory,
                availableStories: viableStories,
                extractedParams: extractedParams
            },
            metadata: {
                ...questionData.metadata,
                isWordProblemApplied: true,
                activeStoryId: activeScenario.id || null
            }
        };
    }

    private static markFallback(questionData: any): any {
        if (!questionData) {
            return {
                metadata: { isWordProblemApplied: false }
            };
        }
        return {
            ...questionData,
            metadata: {
                ...questionData?.metadata,
                isWordProblemApplied: false
            }
        };
    }

    private static appendInstructionSuffix(story: string, variationConfig: VariationConfig, questionData: any, lang: string): string {
        let text = story;
        const vKey = questionData.variationKey || variationConfig.key;
        const ctx = variationConfig.contextType || '';

        // 1. Explicit Formula / Equation Prompts
        if (vKey === 'table_formula' || vKey === 'find_formula') {
            return text + (lang === 'en' 
                ? " Write the formula that describes this situation." 
                : " Bestäm formeln som beskriver mönstret.");
        } 
        
        if (ctx.startsWith('algebra_expressions')) {
            return text + (lang === 'en'
                ? " Write and simplify the algebraic expression."
                : " Skriv och förenkla uttrycket.");
        } 
        
        if (questionData.metadata?.difficulty === 5 || vKey === 'twostep_write_problem') {
            return text + (lang === 'en' 
                ? " Write the equation that describes this situation." 
                : " Teckna ekvationen som beskriver situationen.");
        }

        // 2. Change Factor Instruction Suffixes
        if (vKey === 'apply_factor_inc' || vKey === 'apply_factor_dec') {
            return text + (lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.");
        }
        if (vKey === 'find_original_inc' || vKey === 'find_original_dec') {
            return text + (lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.");
        }
        if (vKey === 'sequential_factors' || vKey === 'factor_compound') {
            return text + (lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.");
        }

        // 3. Complete Self-Contained Native Narrative Domains (No Suffix Needed)
        const isSelfContainedDomain = 
            ctx.startsWith('geom_') ||
            ctx.startsWith('units_') ||
            ctx.startsWith('prob_') ||
            ctx.startsWith('percent_') ||
            ctx.startsWith('value_delta') ||
            ctx.startsWith('pyth_') ||
            ctx.startsWith('sim_') ||
            ctx.startsWith('transversal_') ||
            ctx.startsWith('scale_') ||
            ctx.startsWith('stats_') ||
            ctx.startsWith('exp_') ||
            ctx.startsWith('volume_');

        if (isSelfContainedDomain) {
            return text;
        }

        // 4. Specific Native Narrative bypass variations
        const bypassKeys = new Set([
            'high_term', 'visual_calc', 'reverse_calc',
            'add_std_horizontal', 'sub_std_horizontal',
            'mult_table_std', 'div_basic_std',
            'len_basic', 'len_decimals', 'weight_basic', 'weight_decimals', 'vol_basic', 'vol_decimals',
            'intercept_id', 'slope_pos_int', 'slope_pos_frac', 'slope_neg_int', 'slope_neg_frac',
            'eq_standard', 'eq_no_m', 'eq_horizontal'
        ]);

        if (bypassKeys.has(vKey)) {
            return text;
        }

        // 5. Traditional Algebra & Arithmetic Equation Solvers
        const isAlgebraOrArithmeticEquation = 
            vKey === 'onestep_calc' ||
            vKey === 'twostep_calc' ||
            vKey === 'twostep_solve_problem' || 
            vKey === 'paren_calc' ||       
            vKey === 'bothsides_calc' ||   
            vKey === 'mult_same_sign' ||
            vKey === 'mult_diff_sign' ||
            ctx.startsWith('algebra_onestep') ||
            ctx.startsWith('algebra_twostep') ||
            ctx.startsWith('algebra_parentheses') ||
            ctx.startsWith('algebra_bothsides');

        if (isAlgebraOrArithmeticEquation) {
            const isNegativeMath = vKey.startsWith('mult_');
            text += isNegativeMath 
                ? (lang === 'sv' ? " Beräkna." : " Calculate.") 
                : (lang === 'sv' ? " Beräkna värdet på x." : " Calculate the value of x.");
        }

        return text;
    }
}