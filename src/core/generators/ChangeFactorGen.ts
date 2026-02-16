import { MathUtils } from '../utils/MathUtils.js';

export class ChangeFactorGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Concepts(lang);
            case 2: return this.level2_ApplyFactor(lang);
            case 3: return this.level3_FindOriginal(lang);
            case 4: return this.level4_TotalChange(lang);
            case 5: return this.level5_WordProblems(lang);
            default: return this.level1_Concepts(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
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
            
            case 'word_population':
            case 'word_interest':
            case 'word_depreciation':
            case 'word_sale':
            case 'word_decay':
            case 'word_salary':
            case 'word_inflation':
            case 'word_stock':
                return this.level5_WordProblems(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: CONCEPTS & DEFINITION ---
    private level1_Concepts(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['pct_to_factor_inc', 'pct_to_factor_dec', 'factor_to_pct_inc', 'factor_to_pct_dec']);
        
        const isIncrease = v.endsWith('_inc');
        const isToFactor = v.startsWith('pct_to_factor');
        
        let pct = 0;
        if (Math.random() < 0.3) pct = MathUtils.randomInt(1, 9) * 10;
        else pct = MathUtils.randomInt(1, 150);
        
        let factor = 0;
        if (isIncrease) {
            factor = 1 + (pct / 100);
        } else {
            pct = Math.min(pct, 99);
            factor = 1 - (pct / 100);
        }
        factor = Math.round(factor * 100) / 100;

        if (isToFactor) {
            const desc = lang === 'sv'
                ? (isIncrease ? `Ett värde ökar med ${pct}%. Vilken förändringsfaktor motsvarar denna ökning?` : `Ett värde minskar med ${pct}%. Vilken förändringsfaktor motsvarar denna minskning?`)
                : (isIncrease ? `A value increases by ${pct}%. What is the change factor corresponding to this increase?` : `A value decreases by ${pct}%. What is the change factor corresponding to this decrease?`);
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi utgår från 100% (det hela), vilket motsvarar talet 1,0 i decimalform." : "We start with 100% (the whole), which corresponds to the number 1.0 in decimal form.", 
                        latex: "100\\% = 1.0" 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isIncrease ? `Addera ökningen (${pct}%) till basen (100%).` : `Dra bort minskningen (${pct}%) från basen (100%).`)
                            : (isIncrease ? `Add the increase (${pct}%) to the base (100%).` : `Subtract the decrease (${pct}%) from the base (100%).`),
                        latex: isIncrease ? `1.0 + ${pct/100} = ${factor}` : `1.0 - ${pct/100} = ${factor}` 
                    },
                    {
                        text: lang === 'sv' ? "Svaret är:" : "The answer is:",
                        latex: `${factor}`
                    }
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
                clues: [
                    { 
                        text: lang === 'sv' ? "Jämför förändringsfaktorn med 1,0 för att se hur stor skillnaden är." : "Compare the change factor with 1.0 to see the size of the difference.", 
                        latex: factor > 1 ? `${factor} - 1.0 = ${diff.toFixed(2)}` : `1.0 - ${factor} = ${diff.toFixed(2)}` 
                    },
                    { 
                        text: lang === 'sv' ? "Gör om skillnaden till procent genom att multiplicera med 100." : "Convert the difference to a percentage by multiplying by 100.", 
                        latex: `${diff.toFixed(2)} \\cdot 100 = ${diffPct}\\%` 
                    },
                    {
                        text: lang === 'sv' ? "Svaret är:" : "The answer is:",
                        latex: `${diffPct}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }
    }

    // --- LEVEL 2: APPLYING FACTOR ---
    private level2_ApplyFactor(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['apply_factor_inc', 'apply_factor_dec']);
        const isIncrease = v === 'apply_factor_inc';
        
        const pct = MathUtils.randomInt(1, 95);
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        let base = MathUtils.randomInt(2, 50) * 100;
        const ans = Math.round(base * factor);

        const desc = lang === 'sv'
            ? `Ett pris på ${base} kr ska ${isIncrease ? 'höjas' : 'sänkas'} med ${pct}%. Beräkna det nya priset.`
            : `A price of ${base} kr is to be ${isIncrease ? 'increased' : 'decreased'} by ${pct}%. Calculate the new price.`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Först räknar vi ut förändringsfaktorn för en ${pct}% ${isIncrease ? 'höjning' : 'sänkning'}.` : `First, calculate the change factor for a ${pct}% ${isIncrease ? 'increase' : 'decrease'}.`, 
                    latex: isIncrease ? `1.0 + ${pct/100} = ${factor}` : `1.0 - ${pct/100} = ${factor}` 
                },
                { 
                    text: lang === 'sv' ? "Multiplicera sedan det gamla värdet med förändringsfaktorn för att få det nya värdet." : "Then multiply the old value by the change factor to get the new value.", 
                    latex: `${base} \\cdot ${factor} = ${ans}` 
                },
                {
                    text: lang === 'sv' ? "Det nya priset blir:" : "The new price will be:",
                    latex: `${ans}`
                }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: FINDING ORIGINAL ---
    private level3_FindOriginal(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['find_original_inc', 'find_original_dec']);
        const isIncrease = v === 'find_original_inc';
        
        const pct = MathUtils.randomInt(5, 80);
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        const original = MathUtils.randomInt(2, 25) * 100;
        const newPrice = Math.round(original * factor);

        const desc = lang === 'sv'
            ? `Efter en ${isIncrease ? 'höjning' : 'sänkning'} med ${pct}% kostar en vara nu ${newPrice} kr. Vad var priset från början?`
            : `After a ${isIncrease ? 'increase' : 'decrease'} of ${pct}%, an item now costs ${newPrice} kr. What was the price from the beginning?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(original.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Hitta förändringsfaktorn för en ${isIncrease ? 'ökning' : 'minskning'} på ${pct}%.` : `Find the change factor for a ${isIncrease ? 'increase' : 'decrease'} of ${pct}%.`, 
                    latex: `f = ${factor}` 
                },
                { 
                    text: lang === 'sv' ? "För att hitta det ursprungliga värdet delar (dividerar) vi det nya värdet med förändringsfaktorn." : "To find the original value, we divide the new value by the change factor.", 
                    latex: `\\frac{${newPrice}}{${factor}} = ${original}` 
                },
                {
                    text: lang === 'sv' ? "Det ursprungliga priset var:" : "The original price was:",
                    latex: `${original}`
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: TOTAL CHANGE (SEQUENTIAL) ---
    private level4_TotalChange(lang: string, variationKey?: string): any {
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

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(totalFactor.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "När flera förändringar sker efter varandra multiplicerar vi de enskilda förändringsfaktorerna med varandra." : "When multiple changes occur one after the other, we multiply the individual change factors with each other.", 
                    latex: `F_1 = ${f1}, \\; F_2 = ${f2}` 
                },
                { 
                    text: lang === 'sv' ? "Den totala förändringsfaktorn får vi genom att räkna ut produkten." : "The total change factor is obtained by calculating the product.", 
                    latex: `${f1} \\cdot ${f2} = ${totalFactor}` 
                },
                {
                    text: lang === 'sv' ? "Resultatet är:" : "The result is:",
                    latex: `${totalFactor}`
                }
            ],
            metadata: { variation_key: 'sequential_factors', difficulty: 4 }
        };
    }

    // --- LEVEL 5: WORD PROBLEMS ---
    private level5_WordProblems(lang: string, variationKey?: string): any {
        const scenarios = ['word_population', 'word_interest', 'word_depreciation', 'word_sale', 'word_decay', 'word_salary', 'word_inflation', 'word_stock'];
        const v = variationKey || MathUtils.randomChoice(scenarios);

        if (v === 'word_population' || v === 'word_salary' || v === 'word_stock') {
            const start = MathUtils.randomInt(10, 50) * 1000;
            const pct = MathUtils.randomInt(5, 40);
            const isInc = v !== 'word_stock';
            const factor = isInc ? 1 + pct/100 : 1 - pct/100;
            const end = Math.round(start * factor);

            let desc = "";
            if (v === 'word_population') {
                desc = lang === 'sv' 
                    ? `Befolkningen i en stad ändrades från ${start} till ${end} invånare. Beräkna förändringsfaktorn.` 
                    : `The population of a city changed from ${start} to ${end} inhabitants. Calculate the change factor.`;
            } else if (v === 'word_salary') {
                desc = lang === 'sv'
                    ? `En lön höjdes från ${start} kr till ${end} kr. Vilken förändringsfaktor motsvarar detta?`
                    : `A salary was increased from ${start} kr to ${end} kr. Which change factor corresponds to this?`;
            } else {
                desc = lang === 'sv'
                    ? `Värdet på en aktie sjönk från ${start} kr till ${end} kr. Beräkna förändringsfaktorn.`
                    : `The value of a stock fell from ${start} kr to ${end} kr. Calculate the change factor.`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Förändringsfaktorn beräknas genom att dividera det nya värdet med det gamla." : "The change factor is calculated by dividing the new value by the old value.", 
                        latex: `\\text{Faktor} = \\frac{\\text{Nytt}}{\\text{Gammalt}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Ställ upp divisionen med dina värden." : "Set up the division with your values.", 
                        latex: `\\frac{${end}}{${start}} = ${factor}` 
                    },
                    {
                        text: lang === 'sv' ? "Svaret är:" : "The answer is:",
                        latex: `${factor}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        if (v === 'word_interest' || v === 'word_depreciation' || v === 'word_decay') {
            const money = MathUtils.randomInt(10, 50) * 1000;
            const rate = MathUtils.randomInt(2, 15);
            const isInc = v === 'word_interest';
            const factor = isInc ? 1 + rate/100 : 1 - rate/100;
            const years = 2;
            const ans = Math.round(money * Math.pow(factor, years));

            let desc = "";
            if (v === 'word_interest') {
                desc = lang === 'sv' 
                    ? `Ett sparande på ${money} kr har en årlig ränta på ${rate}%. Hur mycket finns på kontot efter ${years} år? (Avrunda till heltal).`
                    : `Savings of ${money} kr have an annual interest rate of ${rate}%. How much is in the account after ${years} years? (Round to integer).`;
            } else if (v === 'word_depreciation') {
                desc = lang === 'sv'
                    ? `En maskin kostade ${money} kr och tappar ${rate}% i värde varje år. Vad är den värd efter ${years} år? (Avrunda till heltal).`
                    : `A machine cost ${money} kr and loses ${rate}% in value every year. What is it worth after ${years} years? (Round to integer).`;
            } else {
                desc = lang === 'sv'
                    ? `Ett ämne med massan ${money} gram minskar med ${rate}% per dygn. Hur stor massa återstår efter ${years} dygn? (Avrunda till heltal).`
                    : `A substance with a mass of ${money} grams decreases by ${rate}% per day. How much mass remains after ${years} days? (Round to integer).`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Förändringsfaktorn för ett år är ${factor}. Eftersom förändringen sker under ${years} år använder vi potenser.` : `The change factor for one year is ${factor}. Since the change occurs over ${years} years, we use powers.`, 
                        latex: `\\text{Värde} = ${money} \\cdot ${factor}^{${years}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Beräkna resultatet av potensen och multiplikationen." : "Calculate the result of the power and multiplication.", 
                        latex: `${money} \\cdot ${Math.round(Math.pow(factor, years) * 1000) / 1000} \\approx ${ans}` 
                    },
                    {
                        text: lang === 'sv' ? "Svaret är:" : "The answer is:",
                        latex: `${ans}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        if (v === 'word_sale' || v === 'word_inflation') {
            const pct = MathUtils.randomChoice([10, 20, 25, 50]);
            const isInc = v === 'word_inflation';
            const factor = isInc ? 1 + pct/100 : 1 - pct/100;
            const original = MathUtils.randomInt(5, 20) * 100;
            const current = Math.round(original * factor);

            let desc = "";
            if (v === 'word_sale') {
                desc = lang === 'sv'
                    ? `Efter ${pct}% rabatt kostar en vara ${current} kr. Vad var ordinarie pris före rean?`
                    : `After ${pct}% discount, an item costs ${current} kr. What was the regular price before the sale?`;
            } else {
                desc = lang === 'sv'
                    ? `Pga inflation har priset stigit med ${pct}% och är nu ${current} kr. Vad var priset innan höjningen?`
                    : `Due to inflation, the price has risen by ${pct}% and is now ${current} kr. What was the price before the increase?`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(original.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `En förändring på ${isInc ? '+' : '-'}${pct}% motsvarar förändringsfaktorn ${factor}.` : `A change of ${isInc ? '+' : '-'}${pct}% corresponds to the change factor ${factor}.`, 
                        latex: `f = ${factor}` 
                    },
                    { 
                        text: lang === 'sv' ? "För att få reda på det gamla priset dividerar vi det nya priset med förändringsfaktorn." : "To find out the old price, we divide the new price by the change factor.", 
                        latex: `\\frac{${current}}{${factor}} = ${original}` 
                    },
                    {
                        text: lang === 'sv' ? "Det gamla priset var:" : "The old price was:",
                        latex: `${original}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        return this.level2_ApplyFactor(lang);
    }
}