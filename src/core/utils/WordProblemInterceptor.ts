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

        const extractedParams = matchResult.groups;

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

        // 5. Filter viable stories using evaluateStoryRules
        const viableStories = candidateArray.filter(scenario => 
            evaluateStoryRules(scenario.rules, extractedParams).isValid
        );

        // 6. Safe Fallback if 0 stories pass constraints
        if (viableStories.length === 0) {
            return this.markFallback(questionData);
        }

        // 7. Deterministic selection from viable stories
        const seedValue = Object.values(extractedParams).reduce((acc, val) => {
            const num = parseInt(String(val).replace(/[()]/g, ''), 10) || 0;
            return acc + num;
        }, 0);
        const selectedIndex = Math.abs(seedValue) % viableStories.length;
        const activeScenario = viableStories[selectedIndex];

        // 8. Template placeholder replacement
        let localizedStory = lang === 'en' ? activeScenario.en : activeScenario.sv;
        Object.entries(extractedParams).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            localizedStory = localizedStory.replace(new RegExp(`{${key}}`, 'g'), cleanValue);
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
                isWordProblemApplied: true
            }
        };
    }

    private static markFallback(questionData: any): any {
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

        if (variationConfig.key === 'table_formula' || variationConfig.key === 'find_formula') {
            text += lang === 'en' 
                ? " Write the formula that describes this situation." 
                : " Bestäm formeln som beskriver mönstret.";
        } else if (variationConfig.contextType?.startsWith('algebra_expressions')) {
            text += lang === 'en'
                ? " Write and simplify the algebraic expression."
                : " Skriv och förenkla uttrycket.";
        } else if (questionData.metadata?.difficulty === 5 || variationConfig.key === 'twostep_write_problem') {
            text += lang === 'en' 
                ? " Write the equation that describes this situation." 
                : " Teckna ekvationen som beskriver situationen.";
        } else if (
            questionData.variationKey === 'apply_factor_inc' || 
            questionData.variationKey === 'apply_factor_dec'
        ) {
            text += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
        } else if (
            questionData.variationKey === 'find_original_inc' || 
            questionData.variationKey === 'find_original_dec'
        ) {
            text += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
        } else if (questionData.variationKey === 'sequential_factors') {
            text += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
        } else if (
            // Native Narrative bypass keys
            questionData.variationKey === 'high_term' ||
            questionData.variationKey === 'visual_calc' ||
            questionData.variationKey === 'reverse_calc' ||
            questionData.variationKey === 'add_std_horizontal' ||
            questionData.variationKey === 'sub_std_horizontal' ||
            questionData.variationKey === 'mult_table_std' ||
            questionData.variationKey === 'div_basic_std' ||
            questionData.variationKey === 'vol_cuboid_std' ||
            questionData.variationKey === 'vol_tri_prism_std' ||
            questionData.variationKey === 'vol_cyl_std' ||
            questionData.variationKey === 'vol_pyramid_std' ||
            questionData.variationKey === 'vol_cone_std' ||
            questionData.variationKey === 'vol_sphere_std' ||
            questionData.variationKey === 'sim_calc_big' ||
            questionData.variationKey === 'sim_calc_small' ||
            questionData.variationKey === 'sim_find_k' ||
            questionData.variationKey === 'transversal_total' ||
            questionData.variationKey === 'transversal_extension' ||
            questionData.variationKey === 'calc_real' ||
            questionData.variationKey === 'calc_image' ||
            questionData.variationKey === 'map_real' ||
            questionData.variationKey === 'blueprint_draw' ||
            questionData.variationKey === 'area_reverse' ||
            questionData.variationKey === 'area_calc_large' ||
            questionData.variationKey === 'microscope_calc' ||
            questionData.variationKey === 'find_mode' ||
            questionData.variationKey === 'find_range' ||
            questionData.variationKey === 'calc_mean' ||
            questionData.variationKey === 'median_odd' ||
            questionData.variationKey === 'reverse_mean_calc' ||
            questionData.variationKey === 'freq_count' ||
            questionData.variationKey === 'freq_mode' ||
            questionData.variationKey === 'foundations_calc' ||
            questionData.variationKey === 'ten_positive_exponent' ||
            questionData.variationKey === 'ten_negative_exponent' ||
            questionData.variationKey === 'ten_inverse_counting' ||
            questionData.variationKey === 'scientific_to_form' ||
            questionData.variationKey === 'scientific_missing_mantissa' ||
            questionData.variationKey === 'root_calc' ||
            questionData.variationKey === 'root_inverse_algebra' ||
            questionData.variationKey === 'intercept_id' ||
            questionData.variationKey === 'slope_pos_int' ||
            questionData.variationKey === 'slope_pos_frac' ||
            questionData.variationKey === 'slope_neg_int' ||
            questionData.variationKey === 'slope_neg_frac' ||
            questionData.variationKey === 'eq_standard' ||
            questionData.variationKey === 'eq_no_m' ||
            questionData.variationKey === 'eq_horizontal' ||
            questionData.variationKey === 'hyp_visual' ||
            questionData.variationKey === 'leg_visual' ||
            questionData.variationKey === 'app_diagonal'
        ) {
            // Bypass
        } else if (
            variationConfig.key === 'onestep_calc' ||
            variationConfig.key === 'twostep_calc' ||
            variationConfig.key === 'twostep_solve_problem' || 
            variationConfig.key === 'paren_calc' ||       
            variationConfig.key === 'bothsides_calc' ||   
            variationConfig.key === 'mult_same_sign' ||
            variationConfig.key === 'mult_diff_sign' ||
            variationConfig.contextType?.startsWith('algebra_onestep') ||
            variationConfig.contextType?.startsWith('algebra_twostep') ||
            variationConfig.contextType?.startsWith('algebra_parentheses') ||
            variationConfig.contextType?.startsWith('algebra_bothsides')
        ) {
            const isNegativeMath = variationConfig.key.startsWith('mult_');
            text += isNegativeMath 
                ? (lang === 'sv' ? " Beräkna." : " Calculate.") 
                : (lang === 'sv' ? " Beräkna värdet på x." : " Calculate the value of x.");
        }

        return text;
    }
}