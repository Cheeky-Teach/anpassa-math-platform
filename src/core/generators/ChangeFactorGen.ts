import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js'; 

export class ChangeFactorGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If concepts (L1) are mastered, push to calculation (L2)
        if (level === 1 && options.hideConcept) {
            return this.level2_ApplyFactor(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Concepts(lang, undefined, options); break;
            case 2: questionData = this.level2_ApplyFactor(lang, undefined, options); break;
            case 3: questionData = this.level3_FindOriginal(lang, undefined, options); break;
            case 4: questionData = this.level4_TotalChange(lang, undefined, options); break;
            case 5: 
                if (Math.random() > 0.5) {
                    questionData = this.level2_ApplyFactor(lang, 'apply_factor_inc', options);
                } else {
                    questionData = this.level2_ApplyFactor(lang, 'apply_factor_dec', options);
                }
                break;
            default: questionData = this.level1_Concepts(lang, undefined, options); break;
        }

        // Run through the decorator to handle specific variation token detection
        enrichQuestionMetadata(questionData);

        // Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to the correct internal methods.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'pct_to_factor_inc':
            case 'pct_to_factor_dec':
            case 'factor_to_pct_inc':
            case 'factor_to_pct_dec':
                return this.level1_Concepts(lang, key);
            
            case 'apply_factor_inc':
            case 'apply_factor_dec':
                return this.level2_ApplyFactor(lang, key);
            
            case 'find_original_inc':
            case 'find_original_dec':
                return this.level3_FindOriginal(lang, key);
            
            case 'sequential_factors':
                return this.level4_TotalChange(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[0].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: CONCEPTS & DEFINITION ---
    private level1_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'pct_to_factor_inc', type: 'concept' },
            { key: 'pct_to_factor_dec', type: 'concept' },
            { key: 'factor_to_pct_inc', type: 'concept' },
            { key: 'factor_to_pct_dec', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        const isIncrease = v.endsWith('_inc');
        const isToFactor = v.startsWith('pct_to_factor');
        
        let pct = Math.random() < 0.3 ? MathUtils.randomInt(1, 9) * 10 : MathUtils.randomInt(1, 150);
        if (!isIncrease) pct = Math.min(pct, 99);
        
        let factor = isIncrease ? 1 + (pct / 100) : 1 - (pct / 100);
        factor = Math.round(factor * 100) / 100;

        if (isToFactor) {
            const desc = lang === 'sv'
                ? (isIncrease ? `Ett värde ökar med ${pct}%. Vilken förändringsfaktor motsvarar denna ökning?` : `Ett värde minskar med ${pct}%. Vilken förändringsfaktor motsvarar denna minskning?`)
                : (isIncrease ? `A value increases by ${pct}%. What is the change factor corresponding to this increase?` : `A value decreases by ${pct}%. What is the change factor corresponding to this decrease?`);
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vi utgår från 100% (det hela), vilket motsvarar talet 1,0 i decimalform." : "Step 1: We start with 100% (the whole), which corresponds to the number 1.0 in decimal form.", latex: "100\\% = 1.0" },
                    { text: lang === 'sv' ? (isIncrease ? `Addera ökningen (${pct}%) till basen (1,0).` : `Dra bort minskningen (${pct}%) från basen (1,0).`) : (isIncrease ? `Add the increase (${pct}%) to the base (1.0).` : `Subtract the decrease (${pct}%) from the base (1.0).`), latex: isIncrease ? `1.0 + ${pct/100} \\\\ ${factor}` : `1.0 - ${pct/100} \\\\ ${factor}` },
                    { text: lang === 'sv' ? `Svar: ${factor}` : `Answer: ${factor}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        } else {
            const diff = Math.abs(1 - factor);
            const diffPct = Math.round(diff * 100);
            const desc = lang === 'sv'
                ? `Förändringsfaktorn är ${factor}. Hur många procents ${isIncrease ? 'ökning' : 'minskning'} innebär detta?`
                : `The change factor is ${factor}. What percentage ${isIncrease ? 'increase' : 'decrease'} does this represent?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(diffPct.toString()),
                variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Jämför förändringsfaktorn med 1,0 för att se hur stor skillnaden är." : "Step 1: Compare the change factor with 1.0 to see the size of the difference.", latex: factor > 1 ? `${factor} - 1.0 \\\\ ${diff.toFixed(2)}` : `1.0 - ${factor} \\\\ ${diff.toFixed(2)}` },
                    { text: lang === 'sv' ? "Gör om skillnaden till procent genom att multiplicera med 100." : "Convert the difference to a percentage by multiplying by 100.", latex: `${diff.toFixed(2)} · 100 \\\\ ${diffPct}\\%` },
                    { text: lang === 'sv' ? `Svar: ${diffPct}` : `Answer: ${diffPct}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }
    }

    // --- LEVEL 2: APPLYING FACTOR ---
    private level2_ApplyFactor(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'apply_factor_inc', type: 'calculate' },
            { key: 'apply_factor_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'apply_factor_inc';
        
        const pct = MathUtils.randomInt(5, 45);
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        let base = MathUtils.randomInt(2, 50) * 100;
        const ans = Math.round(base * factor);

        const desc = lang === 'sv'
            ? `Ett pris på ${base} kr ska ${isIncrease ? 'höjas' : 'sänkas'} med ${pct}%. Beräkna det nya priset.`
            : `A price of ${base} kr is to be ${isIncrease ? 'increased' : 'decreased'} by ${pct}%. Calculate the new price.`;

        // 🟢 Strategy B Token: Uses standard \\cdot to perfectly satisfy the interceptor regex without leaking to the view
        const trackingToken = `${base} · ${factor.toFixed(2)}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken, // Dynamic background parsing target
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Hitta förändringsfaktorn för en ${pct}% ${isIncrease ? 'höjning' : 'sänkning'}.` : `Step 1: Find the change factor for a ${pct}% ${isIncrease ? 'increase' : 'decrease'}.`, latex: isIncrease ? `1.0 + ${pct/100} \\\\ ${factor}` : `1.0 - ${pct/100} \\\\ ${factor}` },
                { text: lang === 'sv' ? "Multiplicera det gamla värdet med förändringsfaktorn." : "Multiply the old value by the change factor.", latex: `${base} · ${factor} \\\\ ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ],
            metadata: { variation_key: v, difficulty: isIncrease ? 1 : 2 }
        };
    }

    // --- LEVEL 3: FINDING ORIGINAL ---
    private level3_FindOriginal(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_original_inc', type: 'calculate' },
            { key: 'find_original_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'find_original_inc';
        
        const pct = MathUtils.randomInt(5, 80);
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        const original = MathUtils.randomInt(2, 25) * 100;
        const newPrice = Math.round(original * factor);

        const desc = lang === 'sv'
            ? `Efter en ${isIncrease ? 'höjning' : 'sänkning'} med ${pct}% kostar en vara nu ${newPrice} kr. Vad var priset från början?`
            : `After an ${isIncrease ? 'increase' : 'decrease'} of ${pct}%, an item now costs ${newPrice} kr. What was the price originally?`;

        // 🟢 Strategy B Token: Standardized fractional tracking token kept hidden from student displays
        const trackingToken = `\\frac{${newPrice}}{${factor.toFixed(2)}}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken, // Dynamic background parsing target
                answerType: 'numeric' 
            },
            token: this.toBase64(original.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Hitta förändringsfaktorn för en ${pct}% ${isIncrease ? 'höjning' : 'sänkning'}.` : `Step 1: Find the change factor for a ${pct}% ${isIncrease ? 'increase' : 'decrease'}.`, latex: `f = ${factor}` },
                { text: lang === 'sv' ? "För att hitta ursprungsvärdet dividerar vi det nya värdet med förändringsfaktorn." : "To find the original value, divide the new value by the change factor.", latex: `\\frac{${newPrice}}{${factor}} \\\\ ${original}` },
                { text: lang === 'sv' ? `Svar: ${original}` : `Answer: ${original}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: TOTAL CHANGE ---
    private level4_TotalChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sequential_factors', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const pct1 = MathUtils.randomChoice([10, 20, 25, 50]);
        const pct2 = MathUtils.randomChoice([10, 20, 25, 50]);
        const inc1 = Math.random() > 0.5;
        const inc2 = Math.random() > 0.5;

        const f1 = inc1 ? 1 + pct1/100 : 1 - pct1/100;
        const f2 = inc2 ? 1 + pct2/100 : 1 - pct2/100;
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;

        const desc = lang === 'sv'
            ? `Värdet på ett föremål ändras först med ${inc1 ? '+' : '-'}${pct1}% och därefter med ${inc2 ? '+' : '-'}${pct2}%. Beräkna den totala förändringsfaktorn.`
            : `The value of an item changes first by ${inc1 ? '+' : '-'}${pct1}% and then by ${inc2 ? '+' : '-'}${pct2}%. Calculate the total change factor.`;

        // 🟢 Strategy B Token: Compounding operation token using synchronized \\cdot syntax
        const trackingToken = `${f1.toFixed(2)} · ${f2.toFixed(2)}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken, // Dynamic background parsing target
                answerType: 'numeric' 
            },
            token: this.toBase64(totalFactor.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Vid flera förändringar efter varandra multiplicerar vi förändringsfaktorerna med varandra." : "Step 1: For multiple changes in sequence, multiply the change factors together.", latex: `F_1 = ${f1}, \\; F_2 = ${f2}` },
                { text: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", latex: `${f1} · ${f2} \\\\ ${totalFactor}` },
                { text: lang === 'sv' ? `Svar: ${totalFactor}` : `Answer: ${totalFactor}` }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }
}