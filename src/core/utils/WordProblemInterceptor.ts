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

        // 🟢 FIXED PRIORITY: Prioritize background tokens built for regex matching, fallback to latex display field if empty
        const sourceToken = questionData?.renderData?.interceptorToken || questionData?.renderData?.latex;
        if (!sourceToken || typeof sourceToken !== 'string') {
            return questionData;
        }

        const matchResult = sourceToken.match(variationConfig.extractorPattern);
        if (!matchResult || !matchResult.groups) {
            return questionData; 
        }

        const extractedParams = matchResult.groups;
        
        // 🟢 FIXED: Reads from the clean, imported decentralized registry
        let entry = GLOBAL_STORY_REGISTRY[variationConfig.contextType];
        if (!entry) {
            return questionData;
        }

        // 🟢 Dynamic Operator Router Lane: Automatically selects correct story sub-bucket
        if (!Array.isArray(entry) && entry && typeof entry === 'object') {
            const targetSubKey = extractedParams.type && extractedParams.op 
                ? `${extractedParams.type}_${extractedParams.op === '+' ? 'plus' : 'minus'}`
                : extractedParams.type || extractedParams.op;
            
            if (entry[targetSubKey]) {
                entry = entry[targetSubKey];
            }
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
        } else if (
            questionData.variationKey === 'high_term' ||
            questionData.variationKey === 'visual_calc' ||
            questionData.variationKey === 'reverse_calc' ||
            questionData.variationKey === 'add_std_horizontal' || // Suffix bypass row
            questionData.variationKey === 'sub_std_horizontal' ||
            questionData.variationKey === 'mult_table_std' ||
            questionData.variationKey === 'div_basic_std' ||
            questionData.variationKey === 'vol_cuboid_std' || // Added volume keys to bypass
            questionData.variationKey === 'vol_tri_prism_std' ||
            questionData.variationKey === 'vol_cyl_std' ||
            questionData.variationKey === 'vol_pyramid_std' ||
            questionData.variationKey === 'vol_cone_std' ||
            questionData.variationKey === 'vol_sphere_std' ||
            questionData.variationKey === 'sim_calc_big' ||      // Grounded similarity bypass targets
            questionData.variationKey === 'sim_calc_small' ||
            questionData.variationKey === 'sim_find_k' ||
            questionData.variationKey === 'transversal_total' ||
            questionData.variationKey === 'transversal_extension' ||
            questionData.variationKey === 'calc_real' ||      // Scale
            questionData.variationKey === 'calc_image' ||
            questionData.variationKey === 'map_real' ||
            questionData.variationKey === 'blueprint_draw' ||
            questionData.variationKey === 'area_reverse' ||    
            questionData.variationKey === 'area_calc_large' ||
            questionData.variationKey === 'microscope_calc' ||
            questionData.variationKey === 'find_mode' ||       //statistics
            questionData.variationKey === 'find_range' ||
            questionData.variationKey === 'calc_mean' ||
            questionData.variationKey === 'median_odd' ||
            questionData.variationKey === 'reverse_mean_calc' ||
            questionData.variationKey === 'freq_count' ||
            questionData.variationKey === 'freq_mode' ||
            questionData.variationKey === 'foundations_calc' ||   
            questionData.variationKey === 'ten_positive_exponent' ||  //exponents
            questionData.variationKey === 'ten_negative_exponent' ||
            questionData.variationKey === 'ten_inverse_counting' ||
            questionData.variationKey === 'scientific_to_form' ||
            questionData.variationKey === 'scientific_missing_mantissa' ||
            questionData.variationKey === 'root_calc' ||
            questionData.variationKey === 'root_inverse_algebra' ||
            questionData.variationKey === 'intercept_id' ||     // linear graph gen
            questionData.variationKey === 'slope_pos_int' ||
            questionData.variationKey === 'slope_pos_frac' ||
            questionData.variationKey === 'slope_neg_int' ||
            questionData.variationKey === 'slope_neg_frac' ||
            questionData.variationKey === 'eq_standard' ||
            questionData.variationKey === 'eq_no_m' ||
            questionData.variationKey === 'eq_horizontal' ||
            questionData.variationKey === 'hyp_visual' ||       //pythagoras
            questionData.variationKey === 'leg_visual' ||
            questionData.variationKey === 'app_diagonal'
            ) {
            // BYPASS PASS: These contain natural narrative questions natively.
            // Do not append any generic trailing math-class suffixes.
        } else if (variationConfig.key === 'twostep_write_problem') {
            // Level 5 Explicit Formulation Suffix
            localizedStory += lang === 'en' 
                ? " Write the equation that describes this situation." 
                : " Teckna ekvationen som beskriver situationen.";
        } else if (variationConfig.key === 'expressions_word_problem') {
            // Expression Level 5 Suffix
            localizedStory += lang === 'en'
                ? " Write and simplify an expression for the current count."
                : " Skriv och förenkla ett uttryck för det nya antalet.";
        } else if (
            variationConfig.key === 'onestep_calc' ||
            variationConfig.key === 'twostep_calc' ||
            variationConfig.key === 'twostep_solve_problem' || // Level 6 explicitly appended
            variationConfig.key === 'paren_calc' ||       
            variationConfig.key === 'bothsides_calc' ||   
            variationConfig.contextType?.startsWith('algebra_onestep') ||
            variationConfig.contextType?.startsWith('algebra_twostep') ||
            variationConfig.contextType?.startsWith('algebra_parentheses') ||
            variationConfig.contextType?.startsWith('algebra_bothsides')
        ) {
            localizedStory += lang === 'en' 
                ? " Calculate the value of x." 
                : " Beräkna värdet på x.";
        } else {
            // Does nothing! If a topic/generator doesn't explicitly register a 
            // suffix instruction, it leaves the story text completely untouched.
            // This prevents cross-contamination across different question modules.
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