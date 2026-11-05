// src/generators/ChangeFactorGen.ts

import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ChangeFactorGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        if (level === 1 && options.hideConcept) {
            return this.level2_ApplyFactor(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Concepts(lang, undefined, options); break;
            case 2: questionData = this.level2_ApplyFactor(lang, undefined, options); break;
            case 3: questionData = this.level3_FindOriginal(lang, undefined, options); break;
            case 4: questionData = this.level4_TotalChange(lang, undefined, options); break;
            case 5: questionData = this.level5_AdvancedChange(lang, undefined, options); break;
            default: questionData = this.level1_Concepts(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

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

            case 'sequential_total_pct':
            case 'repeated_change_years':
                return this.level5_AdvancedChange(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

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

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    // =========================================================================
    // LEVEL 1: CONCEPTS & DEFINITION
    // =========================================================================
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
        
        // Vast percentage pool: single digits, tens, prime numbers, halves, or large increases (>100%)
        let pct: number;
        const roll = Math.random();
        if (isIncrease && roll < 0.2) {
            pct = MathUtils.randomChoice([110, 120, 125, 150, 175, 200, 250, 300]);
        } else if (roll < 0.35) {
            pct = MathUtils.randomChoice([2.5, 7.5, 12.5, 17.5, 37.5]);
        } else {
            pct = MathUtils.randomInt(1, isIncrease ? 99 : 95);
        }
        
        let factor = isIncrease ? 1 + (pct / 100) : 1 - (pct / 100);
        factor = Math.round(factor * 1000) / 1000;
        const factorStr = lang === 'sv' ? factor.toString().replace('.', ',') : factor.toString();
        const pctStr = lang === 'sv' ? pct.toString().replace('.', ',') : pct.toString();

        if (isToFactor) {
            const desc = lang === 'sv'
                ? (isIncrease ? `Ett värde ökar med ${pctStr}%. Vilken förändringsfaktor motsvarar denna ökning?` : `Ett värde minskar med ${pctStr}%. Vilken förändringsfaktor motsvarar denna minskning?`)
                : (isIncrease ? `A value increases by ${pctStr}%. What is the change factor corresponding to this increase?` : `A value decreases by ${pctStr}%. What is the change factor corresponding to this decrease?`);
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                variationKey: v, 
                type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ursprungsvärdet motsvarar 100% (1,00 i decimalform)." : "The original value represents 100% (1.00 in decimal form).", 
                        latex: `100\\% = 1,00` 
                    },
                    { 
                        text: lang === 'sv' ? `Skriv om ${pctStr}% till decimalform: ${pctStr} / 100 = ${(pct / 100).toString().replace('.', ',')}.` : `Convert ${pctStr}% to decimal form: ${pctStr} / 100 = ${pct / 100}.`, 
                        latex: `${pctStr}\\% = \\frac{${pctStr}}{100} = \\mathbf{${(pct / 100).toString().replace('.', ',')}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isIncrease ? `Vid en ökning adderas decimalen till 1,00:` : `Vid en minskning dras decimalen bort från 1,00:`) 
                            : (isIncrease ? `For an increase, add the decimal to 1.00:` : `For a decrease, subtract the decimal from 1.00:`), 
                        latex: isIncrease ? `1,00 + ${(pct / 100).toString().replace('.', ',')} = \\mathbf{${factorStr}}` : `1,00 - ${(pct / 100).toString().replace('.', ',')} = \\mathbf{${factorStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${factorStr}` : `Answer: ${factorStr}`, 
                        latex: `${factorStr}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        } else {
            const diff = Math.round(Math.abs(1 - factor) * 1000) / 1000;
            const diffPct = Math.round(diff * 1000) / 10;
            const diffPctStr = lang === 'sv' ? diffPct.toString().replace('.', ',') : diffPct.toString();
            const desc = lang === 'sv'
                ? `Förändringsfaktorn är ${factorStr}. Hur många procents ${isIncrease ? 'ökning' : 'minskning'} innebär detta?`
                : `The change factor is ${factorStr}. What percentage ${isIncrease ? 'increase' : 'decrease'} does this represent?`;

            return {
                renderData: { description: desc, answerType: 'numeric', suffix: '%' },
                token: this.toBase64(diffPct.toString()),
                variationKey: v, 
                type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Jämför förändringsfaktorn med basen 1,00 (100%)." : "Compare the change factor with the baseline 1.00 (100%).", 
                        latex: `\\text{Bas} = 1,00` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isIncrease ? `Räkna ut skillnaden: ${factorStr} - 1,00 = ${diff.toString().replace('.', ',')}.` : `Räkna ut skillnaden: 1,00 - ${factorStr} = ${diff.toString().replace('.', ',')}.`) 
                            : (isIncrease ? `Calculate the difference: ${factorStr} - 1.00 = ${diff}.` : `Calculate the difference: 1.00 - ${factorStr} = ${diff}.`), 
                        latex: isIncrease ? `${factorStr} - 1,00 = \\mathbf{${diff.toString().replace('.', ',')}}` : `1,00 - ${factorStr} = \\mathbf{${diff.toString().replace('.', ',')}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Multiplicera med 100 för att få procentsatsen: ${diff.toString().replace('.', ',')} · 100 = ${diffPctStr}%.` : `Multiply by 100 to get the percentage: ${diff} · 100 = ${diffPctStr}%.`, 
                        latex: `${diff.toString().replace('.', ',')} \\cdot 100 = \\mathbf{${diffPctStr}\\%}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${diffPctStr}%` : `Answer: ${diffPctStr}%`, 
                        latex: `${diffPctStr}\\%` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }
    }

    // =========================================================================
    // LEVEL 2: APPLYING FACTOR (Nytt värde = Ursprung · f)
    // =========================================================================
    private level2_ApplyFactor(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'apply_factor_inc', type: 'calculate' },
            { key: 'apply_factor_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'apply_factor_inc';
        
        // Generate broad range of percentages (1% to 85%)
        const pct = MathUtils.randomInt(1, 85);
        let factor = isIncrease ? 1 + pct / 100 : 1 - pct / 100;
        factor = Math.round(factor * 100) / 100;
        const factorStr = lang === 'sv' ? factor.toString().replace('.', ',') : factor.toString();

        // Dynamically find reduced denominator to guarantee a clean integer product
        const g = this.gcd(Math.round(factor * 100), 100);
        const requiredDenominator = 100 / g;
        
        // Scale base realistically to represent realistic prices or counts (e.g. 120, 450, 1600, etc.)
        const mult = MathUtils.randomInt(1, 40);
        const base = requiredDenominator * mult * (requiredDenominator <= 10 ? 10 : 1);
        const ans = Math.round(base * factor);

        const desc = lang === 'sv'
            ? `Ett värde på ${base} kr ska ${isIncrease ? 'höjas' : 'sänkas'} med ${pct}%. Beräkna det nya värdet med hjälp av förändringsfaktor.`
            : `A value of ${base} kr is to be ${isIncrease ? 'increased' : 'decreased'} by ${pct}%. Calculate the new value using a change factor.`;

        const trackingToken = `${base} · ${factor.toFixed(2)} ; ${pct}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken,
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Bestäm först förändringsfaktorn: 1,00 ${isIncrease ? '+' : '-'} ${(pct / 100).toString().replace('.', ',')} = ${factorStr}.` 
                        : `Determine the change factor first: 1.00 ${isIncrease ? '+' : '-'} ${pct / 100} = ${factorStr}.`, 
                    latex: `\\text{Förändringsfaktor} = 1,00 ${isIncrease ? '+' : '-'} ${(pct / 100).toString().replace('.', ',')} = \\mathbf{${factorStr}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Multiplicera startvärdet med förändringsfaktorn i ett enda steg:` 
                        : `Multiply the original value by the change factor in a single step:`, 
                    latex: `\\text{Nytt värde} = ${base} \\cdot ${factorStr} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans} kr` : `Answer: ${ans} kr`, 
                    latex: `${ans}` 
                }
            ],
            metadata: { variation_key: v, difficulty: isIncrease ? 1 : 2 }
        };
    }

    // =========================================================================
    // LEVEL 3: FINDING ORIGINAL (Ursprungligt = Nytt / f)
    // =========================================================================
    private level3_FindOriginal(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_original_inc', type: 'calculate' },
            { key: 'find_original_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'find_original_inc';
        
        // Broad percentage selection
        const pct = MathUtils.randomChoice([
            2, 4, 5, 8, 10, 12, 15, 16, 20, 24, 25, 30, 35, 40, 45, 50, 60, 75
        ]);
        let factor = isIncrease ? 1 + pct / 100 : 1 - pct / 100;
        factor = Math.round(factor * 100) / 100;
        const factorStr = lang === 'sv' ? factor.toString().replace('.', ',') : factor.toString();

        const g = this.gcd(Math.round(factor * 100), 100);
        const reqDenominator = 100 / g;

        // Choose original as an integer multiple of the factor's denominator
        const multiplier = MathUtils.randomInt(2, 35);
        const original = reqDenominator * multiplier * (reqDenominator <= 5 ? 10 : 1);
        const newPrice = Math.round(original * factor);

        const desc = lang === 'sv'
            ? `Efter en ${isIncrease ? 'höjning' : 'sänkning'} med ${pct}% är det nya priset ${newPrice} kr. Vad var priset från början?`
            : `After an ${isIncrease ? 'increase' : 'decrease'} of ${pct}%, the new price is ${newPrice} kr. What was the original price?`;

        const trackingToken = `\\frac{${newPrice}}{${factor.toFixed(2)}} ; ${pct}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken,
                answerType: 'numeric' 
            },
            token: this.toBase64(original.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Bestäm förändringsfaktorn: 1,00 ${isIncrease ? '+' : '-'} ${(pct / 100).toString().replace('.', ',')} = ${factorStr}.` 
                        : `Determine the change factor: 1.00 ${isIncrease ? '+' : '-'} ${pct / 100} = ${factorStr}.`, 
                    latex: `\\text{Förändringsfaktor} = \\mathbf{${factorStr}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `För att räkna baklänges till ursprungsvärdet delar vi det nya värdet med förändringsfaktorn:` 
                        : `To work backwards to the original value, divide the new value by the change factor:`, 
                    latex: `\\text{Ursprungligt} = \\frac{${newPrice}}{${factorStr}} = \\mathbf{${original}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${original} kr` : `Answer: ${original} kr`, 
                    latex: `${original}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: SEQUENTIAL CHANGE FACTOR (f_tot = f1 · f2)
    // =========================================================================
    private level4_TotalChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sequential_factors', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        // Broad range of percentage changes
        const pct1 = MathUtils.randomChoice([2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50]);
        const pct2 = MathUtils.randomChoice([2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50]);
        const inc1 = Math.random() > 0.45;
        const inc2 = Math.random() > 0.45;

        const f1 = inc1 ? 1 + pct1 / 100 : 1 - pct1 / 100;
        const f2 = inc2 ? 1 + pct2 / 100 : 1 - pct2 / 100;
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;

        const f1Str = lang === 'sv' ? f1.toString().replace('.', ',') : f1.toString();
        const f2Str = lang === 'sv' ? f2.toString().replace('.', ',') : f2.toString();
        const totalStr = lang === 'sv' ? totalFactor.toString().replace('.', ',') : totalFactor.toString();

        const desc = lang === 'sv'
            ? `Ett pris ändras i två steg: först en ${inc1 ? 'ökning' : 'minskning'} med ${pct1}%, därefter en ${inc2 ? 'ökning' : 'minskning'} med ${pct2}%. Beräkna den totala förändringsfaktorn.`
            : `A price changes in two steps: first an ${inc1 ? 'increase' : 'decrease'} of ${pct1}%, then an ${inc2 ? 'increase' : 'decrease'} of ${pct2}%. Calculate the total change factor.`;

        const trackingToken = `${f1.toFixed(2)} · ${f2.toFixed(2)}`;

        return {
            renderData: { 
                description: desc, 
                interceptorToken: trackingToken,
                answerType: 'numeric' 
            },
            token: this.toBase64(totalFactor.toString()),
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Bestäm förändringsfaktorerna för de två stegen: f₁ = ${f1Str} och f₂ = ${f2Str}.` 
                        : `Determine the change factors for the two steps: f₁ = ${f1Str} and f₂ = ${f2Str}.`, 
                    latex: `f_1 = ${f1Str}, \\quad f_2 = ${f2Str}` 
                },
                { 
                    text: lang === 'sv' 
                        ? "Vid upprepade förändringar multipliceras förändringsfaktorerna med varandra:" 
                        : "For successive changes, multiply the change factors together:", 
                    latex: `f_{\\text{total}} = f_1 \\cdot f_2 = ${f1Str} \\cdot ${f2Str} = \\mathbf{${totalStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${totalStr}` : `Answer: ${totalStr}`, 
                    latex: `${totalStr}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 5: ADVANCED CHANGE (Repeated Years & Total % Change)
    // =========================================================================
    private level5_AdvancedChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sequential_total_pct', type: 'calculate' },
            { key: 'repeated_change_years', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'repeated_change_years') {
            const years = MathUtils.randomChoice([2, 3, 4]);
            const isInc = Math.random() > 0.5;
            const pct = MathUtils.randomChoice([2, 4, 5, 10, 15, 20]);
            const factor = isInc ? 1 + pct / 100 : 1 - pct / 100;
            const factorStr = lang === 'sv' ? factor.toString().replace('.', ',') : factor.toString();

            // Broad range of dynamic asset values
            const baseMultiplier = MathUtils.randomChoice([
                1200, 1500, 2400, 3500, 4800, 6000, 8500, 12000, 15000, 24000, 36000, 50000, 120000, 250000
            ]);
            const initialValue = baseMultiplier;
            const finalValue = Math.round(initialValue * Math.pow(factor, years));

            const desc = lang === 'sv'
                ? `Ett föremål är värt ${initialValue} kr och värdet ${isInc ? 'ökar' : 'minskar'} med ${pct}% varje år. Vad är föremålet värt efter ${years} år?`
                : `An item is worth ${initialValue} kr and its value ${isInc ? 'increases' : 'decreases'} by ${pct}% each year. What is the item worth after ${years} years?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric'
                },
                token: this.toBase64(finalValue.toString()),
                variationKey: v,
                type: 'calculate',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Förändringsfaktorn för ett år är ${factorStr}.`
                            : `The annual change factor is ${factorStr}.`,
                        latex: `a = ${factorStr}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Efter ${years} år har värdet förändrats med faktorn (${factorStr})^${years}:`
                            : `After ${years} years, the value scales by (${factorStr})^${years}:`,
                        latex: `y = ${initialValue} \\cdot (${factorStr})^{${years}} = \\mathbf{${finalValue}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${finalValue} kr` : `Answer: ${finalValue} kr`,
                        latex: `${finalValue}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        // sequential_total_pct: Procedurally generated paired changes
        // Generates combinations like +15% and -10%, +20% and -15%, +30% and -20%, etc.
        const p1 = MathUtils.randomChoice([5, 10, 12, 15, 20, 25, 30, 40, 50]);
        const p2 = MathUtils.randomChoice([5, 10, 12, 15, 20, 25, 30, 40, 50]);
        const inc1 = Math.random() > 0.45;
        const inc2 = Math.random() > 0.55;

        const f1 = inc1 ? 1 + p1 / 100 : 1 - p1 / 100;
        const f2 = inc2 ? 1 + p2 / 100 : 1 - p2 / 100;
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;
        
        // Exact net percentage change (can be 1 decimal place or integer)
        const netChangePct = Math.round((totalFactor - 1) * 10000) / 100;
        const netChangeStr = lang === 'sv' ? netChangePct.toString().replace('.', ',') : netChangePct.toString();

        const desc = lang === 'sv'
            ? `Ett pris ${inc1 ? 'höjs' : 'sänks'} först med ${p1}% och ${inc2 ? 'höjs' : 'sänks'} därefter med ${p2}%. Med hur många procent har priset förändrats totalt?`
            : `A price is first ${inc1 ? 'increased' : 'decreased'} by ${p1}% and then ${inc2 ? 'increased' : 'decreased'} by ${p2}%. By what total percentage has the price changed?`;

        const f1Str = lang === 'sv' ? f1.toString().replace('.', ',') : f1.toString();
        const f2Str = lang === 'sv' ? f2.toString().replace('.', ',') : f2.toString();
        const totFactorStr = lang === 'sv' ? totalFactor.toString().replace('.', ',') : totalFactor.toString();
        const isNetIncrease = netChangePct > 0;

        return {
            renderData: {
                description: desc,
                interceptorToken: `${f1.toFixed(2)} · ${f2.toFixed(2)}`,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(netChangePct.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? `Steg 1: Multiplicera förändringsfaktorerna: ${f1Str} · ${f2Str} = ${totFactorStr}.`
                        : `Step 1: Multiply the change factors: ${f1Str} · ${f2Str} = ${totFactorStr}.`,
                    latex: `f_{\\text{total}} = ${f1Str} \\cdot ${f2Str} = \\mathbf{${totFactorStr}}`
                },
                {
                    text: lang === 'sv'
                        ? `Steg 2: Jämför den totala förändringsfaktorn med basen 1,00:`
                        : `Step 2: Compare the total change factor against baseline 1.00:`,
                    latex: `${totFactorStr} - 1,00 = ${(totalFactor - 1).toFixed(4).replace('.', ',')} \\rightarrow \\mathbf{${netChangeStr}\\%}`
                },
                {
                    text: lang === 'sv'
                        ? `Svar: ${netChangeStr}% (${isNetIncrease ? 'ökning' : 'minskning'})`
                        : `Answer: ${netChangeStr}% (${isNetIncrease ? 'increase' : 'decrease'})`,
                    latex: `${netChangeStr}\\%`
                }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }
}