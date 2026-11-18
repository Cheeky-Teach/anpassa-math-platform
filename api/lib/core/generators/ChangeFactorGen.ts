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

    private formatNum(num: number, lang: string): string {
        const clean = Math.round(num * 10000) / 10000;
        return lang === 'sv' ? clean.toString().replace('.', ',') : clean.toString();
    }

    private getVariation(pool: { key: string; type: 'concept' | 'calculate' }[], options: any): string {
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
    // LEVEL 1: CONCEPTS & DEFINITION (% <-> Förändringsfaktor)
    // =========================================================================
    private level1_Concepts(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'pct_to_factor_inc', type: 'concept' },
            { key: 'pct_to_factor_dec', type: 'concept' },
            { key: 'factor_to_pct_inc', type: 'concept' },
            { key: 'factor_to_pct_dec', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const isIncrease = v.endsWith('_inc');
        const isToFactor = v.startsWith('pct_to_factor');
        const baseOne = lang === 'sv' ? '1,00' : '1.00';

        let pct: number;
        const roll = Math.random();
        if (isIncrease && roll < 0.2) {
            pct = MathUtils.randomChoice([110, 120, 125, 150, 175, 200, 250, 300]);
        } else if (roll < 0.35) {
            pct = MathUtils.randomChoice([2.5, 7.5, 12.5, 17.5, 37.5]);
        } else {
            pct = MathUtils.randomInt(1, isIncrease ? 99 : 95);
        }

        let factor = isIncrease ? 1 + pct / 100 : 1 - pct / 100;
        factor = Math.round(factor * 1000) / 1000;
        const factorStr = this.formatNum(factor, lang);
        const pctStr = this.formatNum(pct, lang);
        const decDeltaStr = this.formatNum(pct / 100, lang);

        if (isToFactor) {
            const desc = lang === 'sv'
                ? (isIncrease
                    ? `Ett värde ökar med ${pctStr}%. Vilken förändringsfaktor motsvarar denna ökning?`
                    : `Ett värde minskar med ${pctStr}%. Vilken förändringsfaktor motsvarar denna minskning?`)
                : (isIncrease
                    ? `A value increases by ${pctStr}%. What is the change factor corresponding to this increase?`
                    : `A value decreases by ${pctStr}%. What is the change factor corresponding to this decrease?`);

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                variationKey: v,
                type: 'concept',
                clues: [
                    {
                        text: lang === 'sv'
                            ? `Ursprungsvärdet motsvarar alltid 100% = ${baseOne}.`
                            : `The original baseline is always 100% = ${baseOne}.`,
                        latex: `100\\% = ${baseOne}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Skriv om ${pctStr}% i decimalform genom att dela med 100:`
                            : `Convert ${pctStr}% to decimal form by dividing by 100:`,
                        latex: `${pctStr}\\% = \\frac{${pctStr}}{100} = \\mathbf{${decDeltaStr}}`
                    },
                    {
                        text: lang === 'sv'
                            ? (isIncrease ? `Vid en ökning adderar vi ${decDeltaStr} till ${baseOne}:` : `Vid en minskning drar vi bort ${decDeltaStr} från ${baseOne}:`)
                            : (isIncrease ? `For an increase, add ${decDeltaStr} to ${baseOne}:` : `For a decrease, subtract ${decDeltaStr} from ${baseOne}:`),
                        latex: isIncrease
                            ? `${baseOne} + ${decDeltaStr} = \\mathbf{${factorStr}}`
                            : `${baseOne} - ${decDeltaStr} = \\mathbf{${factorStr}}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${factorStr}` : `Answer: ${factorStr}`,
                        latex: `\\mathbf{${factorStr}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        } else {
            const diff = Math.round(Math.abs(1 - factor) * 1000) / 1000;
            const diffPct = Math.round(diff * 1000) / 10;
            const diffStr = this.formatNum(diff, lang);
            const diffPctStr = this.formatNum(diffPct, lang);
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
                        text: lang === 'sv'
                            ? `Jämför förändringsfaktorn (${factorStr}) med utgångsläget ${baseOne} (100%):`
                            : `Compare the change factor (${factorStr}) with the baseline ${baseOne} (100%):`,
                        latex: isIncrease
                            ? `${factorStr} - ${baseOne} = \\mathbf{${diffStr}}`
                            : `${baseOne} - ${factorStr} = \\mathbf{${diffStr}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Multiplicera skillnaden i decimalform med 100 för att få procent:"
                            : "Multiply the decimal difference by 100 to convert to percent:",
                        latex: `${diffStr} \\cdot 100 = \\mathbf{${diffPctStr}\\%}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${diffPctStr}%` : `Answer: ${diffPctStr}%`,
                        latex: `\\mathbf{${diffPctStr}\\%}`
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
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'apply_factor_inc', type: 'calculate' },
            { key: 'apply_factor_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'apply_factor_inc';
        const baseOne = lang === 'sv' ? '1,00' : '1.00';

        const pct = MathUtils.randomInt(1, 85);
        let factor = isIncrease ? 1 + pct / 100 : 1 - pct / 100;
        factor = Math.round(factor * 100) / 100;
        const factorStr = this.formatNum(factor, lang);
        const decDeltaStr = this.formatNum(pct / 100, lang);

        const g = this.gcd(Math.round(factor * 100), 100);
        const requiredDenominator = 100 / g;

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
                        ? `Bestäm förändringsfaktorn för en ${isIncrease ? 'ökning' : 'minskning'} med ${pct}%:`
                        : `Find the change factor for an ${isIncrease ? 'increase' : 'decrease'} of ${pct}%:`,
                    latex: `f = ${baseOne} ${isIncrease ? '+' : '-'} ${decDeltaStr} = \\mathbf{${factorStr}}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera ursprungsvärdet med förändringsfaktorn:"
                        : "Multiply the original value by the change factor:",
                    latex: `\\text{Nytt värde} = ${base} \\cdot ${factorStr} = \\mathbf{${ans}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${ans} kr` : `Answer: ${ans} kr`,
                    latex: `\\mathbf{${ans}}`
                }
            ],
            metadata: { variation_key: v, difficulty: isIncrease ? 1 : 2 }
        };
    }

    // =========================================================================
    // LEVEL 3: FINDING ORIGINAL (Ursprungligt = Nytt / f)
    // =========================================================================
    private level3_FindOriginal(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'find_original_inc', type: 'calculate' },
            { key: 'find_original_dec', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isIncrease = v === 'find_original_inc';
        const baseOne = lang === 'sv' ? '1,00' : '1.00';

        const pct = MathUtils.randomChoice([
            2, 4, 5, 8, 10, 12, 15, 16, 20, 24, 25, 30, 35, 40, 45, 50, 60, 75
        ]);
        let factor = isIncrease ? 1 + pct / 100 : 1 - pct / 100;
        factor = Math.round(factor * 100) / 100;
        const factorStr = this.formatNum(factor, lang);
        const decDeltaStr = this.formatNum(pct / 100, lang);

        const g = this.gcd(Math.round(factor * 100), 100);
        const reqDenominator = 100 / g;

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
                        ? `Bestäm förändringsfaktorn för ${isIncrease ? 'höjningen' : 'sänkningen'} med ${pct}%:`
                        : `Determine the change factor for the ${pct}% ${isIncrease ? 'increase' : 'decrease'}:`,
                    latex: `f = ${baseOne} ${isIncrease ? '+' : '-'} ${decDeltaStr} = \\mathbf{${factorStr}}`
                },
                {
                    text: lang === 'sv'
                        ? `Eftersom Ursprungsvärde · ${factorStr} = ${newPrice}, delar vi med ${factorStr} för att räkna baklänges:`
                        : `Since Original · ${factorStr} = ${newPrice}, divide by ${factorStr} to work backwards:`,
                    latex: `\\text{Ursprungsvärde} = \\frac{${newPrice}}{${factorStr}} = \\mathbf{${original}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${original} kr` : `Answer: ${original} kr`,
                    latex: `\\mathbf{${original}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // =========================================================================
    // LEVEL 4: SEQUENTIAL CHANGE FACTOR (f_tot = f1 · f2)
    // =========================================================================
    private level4_TotalChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'sequential_factors', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const baseOne = lang === 'sv' ? '1,00' : '1.00';

        const pct1 = MathUtils.randomChoice([2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50]);
        const pct2 = MathUtils.randomChoice([2, 4, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50]);
        const inc1 = Math.random() > 0.45;
        const inc2 = Math.random() > 0.45;

        const f1 = inc1 ? 1 + pct1 / 100 : 1 - pct1 / 100;
        const f2 = inc2 ? 1 + pct2 / 100 : 1 - pct2 / 100;
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;

        const d1Str = this.formatNum(pct1 / 100, lang);
        const d2Str = this.formatNum(pct2 / 100, lang);
        const f1Str = this.formatNum(f1, lang);
        const f2Str = this.formatNum(f2, lang);
        const totalStr = this.formatNum(totalFactor, lang);

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
                        ? "Skriv om varje procentuell förändring till en egen förändringsfaktor:"
                        : "Convert each percentage change into its own change factor:",
                    latex: `\\begin{aligned} f_1 &= ${baseOne} ${inc1 ? '+' : '-'} ${d1Str} = \\mathbf{${f1Str}} \\\\ f_2 &= ${baseOne} ${inc2 ? '+' : '-'} ${d2Str} = \\mathbf{${f2Str}} \\end{aligned}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera förändringsfaktorerna med varandra för den totala förändringen:"
                        : "Multiply the change factors together for the combined change:",
                    latex: `f_{\\text{total}} = ${f1Str} \\cdot ${f2Str} = \\mathbf{${totalStr}}`
                },
                {
                    text: lang === 'sv' ? `Svar: ${totalStr}` : `Answer: ${totalStr}`,
                    latex: `\\mathbf{${totalStr}}`
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // =========================================================================
    // LEVEL 5: ADVANCED CHANGE (Repeated Years & Total % Change)
    // =========================================================================
    private level5_AdvancedChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: { key: string; type: 'concept' | 'calculate' }[] = [
            { key: 'sequential_total_pct', type: 'calculate' },
            { key: 'repeated_change_years', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const baseOne = lang === 'sv' ? '1,00' : '1.00';

        if (v === 'repeated_change_years') {
            const years = MathUtils.randomChoice([2, 3, 4]);
            const isInc = Math.random() > 0.5;
            const pct = MathUtils.randomChoice([2, 4, 5, 10, 15, 20]);
            const factor = isInc ? 1 + pct / 100 : 1 - pct / 100;
            const factorStr = this.formatNum(factor, lang);
            const decDeltaStr = this.formatNum(pct / 100, lang);

            const initialValue = MathUtils.randomChoice([
                1200, 1500, 2400, 3500, 4800, 6000, 8500, 12000, 15000, 24000, 36000, 50000, 120000, 250000
            ]);
            const finalValue = Math.round(initialValue * Math.pow(factor, years));
            const repeatedMult = Array(years).fill(factorStr).join(' \\cdot ');

            const desc = lang === 'sv'
                ? `Ett föremål är värt ${initialValue} kr och värdet ${isInc ? 'ökar' : 'minskar'} med ${pct}% varje år. Vad är föremålet värt efter ${years} år? Avrunda till hela kronor.`
                : `An item is worth ${initialValue} kr and its value ${isInc ? 'increases' : 'decreases'} by ${pct}% each year. What is the item worth after ${years} years? Round to the nearest whole kr.`;

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
                            ? `Bestäm förändringsfaktorn för ett år (${isInc ? 'ökning' : 'minskning'} med ${pct}%):`
                            : `Find the annual change factor (${pct}% ${isInc ? 'increase' : 'decrease'}):`,
                        latex: `f = ${baseOne} ${isInc ? '+' : '-'} ${decDeltaStr} = \\mathbf{${factorStr}}`
                    },
                    {
                        text: lang === 'sv'
                            ? `Multiplicera med ${factorStr} en gång för varje år (${years} gånger = (${factorStr})^${years}):`
                            : `Multiply by ${factorStr} once per year (${years} times = (${factorStr})^${years}):`,
                        latex: `${initialValue} \\cdot ${repeatedMult} = ${initialValue} \\cdot (${factorStr})^{${years}}`
                    },
                    {
                        text: lang === 'sv'
                            ? "Beräkna det nya värdet:"
                            : "Calculate the new value:",
                        latex: `\\mathbf{${finalValue}}\\text{ kr}`
                    },
                    {
                        text: lang === 'sv' ? `Svar: ${finalValue} kr` : `Answer: ${finalValue} kr`,
                        latex: `\\mathbf{${finalValue}}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 5 }
            };
        }

        // sequential_total_pct
        const p1 = MathUtils.randomChoice([5, 10, 12, 15, 20, 25, 30, 40, 50]);
        const p2 = MathUtils.randomChoice([5, 10, 12, 15, 20, 25, 30, 40, 50]);
        const inc1 = Math.random() > 0.45;
        const inc2 = Math.random() > 0.55;

        const f1 = inc1 ? 1 + p1 / 100 : 1 - p1 / 100;
        const f2 = inc2 ? 1 + p2 / 100 : 1 - p2 / 100;
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;

        const netChangePct = Math.round((totalFactor - 1) * 10000) / 100;
        const absNetPct = Math.abs(netChangePct);
        const netChangeStr = this.formatNum(netChangePct, lang);
        const absNetPctStr = this.formatNum(absNetPct, lang);
        const isNetIncrease = netChangePct >= 0;

        const d1Str = this.formatNum(p1 / 100, lang);
        const d2Str = this.formatNum(p2 / 100, lang);
        const f1Str = this.formatNum(f1, lang);
        const f2Str = this.formatNum(f2, lang);
        const totFactorStr = this.formatNum(totalFactor, lang);
        const diffFromOneStr = this.formatNum(totalFactor - 1, lang);

        const signHint = lang === 'sv'
            ? ' (Svara med minustecken vid minskning, t.ex. -12)'
            : ' (Use a minus sign for a decrease, e.g. -12)';

        const desc = lang === 'sv'
            ? `Ett pris ${inc1 ? 'höjs' : 'sänks'} först med ${p1}% och ${inc2 ? 'höjs' : 'sänks'} därefter med ${p2}%. Med hur många procent har priset förändrats totalt?${signHint}`
            : `A price is first ${inc1 ? 'increased' : 'decreased'} by ${p1}% and then ${inc2 ? 'increased' : 'decreased'} by ${p2}%. By what total percentage has the price changed?${signHint}`;

        const trackingToken = `${f1.toFixed(2)} · ${f2.toFixed(2)}`;

        return {
            renderData: {
                description: desc,
                interceptorToken: trackingToken,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(netChangePct.toString()),
            variationKey: v,
            type: 'calculate',
            clues: [
                {
                    text: lang === 'sv'
                        ? "Bestäm förändringsfaktorerna för respektive steg:"
                        : "Determine the change factors for each step:",
                    latex: `f_1 = ${baseOne} ${inc1 ? '+' : '-'} ${d1Str} = ${f1Str}, \\quad f_2 = ${baseOne} ${inc2 ? '+' : '-'} ${d2Str} = ${f2Str}`
                },
                {
                    text: lang === 'sv'
                        ? "Multiplicera förändringsfaktorerna för att få den totala förändringsfaktorn:"
                        : "Multiply the change factors to find the total change factor:",
                    latex: `f_{\\text{total}} = ${f1Str} \\cdot ${f2Str} = \\mathbf{${totFactorStr}}`
                },
                {
                    text: lang === 'sv'
                        ? `Jämför ${totFactorStr} med utgångsläget ${baseOne} och multiplicera med 100:`
                        : `Compare ${totFactorStr} with baseline ${baseOne} and multiply by 100:`,
                    latex: `(${totFactorStr} - ${baseOne}) \\cdot 100 = ${diffFromOneStr} \\cdot 100 = \\mathbf{${netChangeStr}\\%}`
                },
                {
                    text: lang === 'sv'
                        ? `Svar: ${netChangeStr}% (${isNetIncrease ? 'ökning' : 'minskning med ' + absNetPctStr + '%'})`
                        : `Answer: ${netChangeStr}% (${isNetIncrease ? 'increase' : 'decrease of ' + absNetPctStr + '%'})`,
                    latex: `\\mathbf{${netChangeStr}\\%}`
                }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }
}