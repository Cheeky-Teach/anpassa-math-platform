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
                    { text: lang === 'sv' ? "Tänk på 100% som det ursprungliga hela värdet, vilket skrivs som 1,00 i decimalform." : "Think of 100% as the original whole value, which is written as 1.00 in decimal form.", latex: "100\\% = 1.00" },
                    { 
                        text: lang === 'sv' 
                            ? (isIncrease ? `Addera ökningen (${pct}%) till det ursprungliga värdet (100%).` : `Dra bort minskningen (${pct}%) från det ursprungliga värdet (100%).`)
                            : (isIncrease ? `Add the increase (${pct}%) to the original value (100%).` : `Subtract the decrease (${pct}%) from the original value (100%).`),
                        latex: isIncrease ? `1.00 + ${pct/100} = ${factor}` : `1.00 - ${pct/100} = ${factor}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        } else {
            const diff = Math.abs(1 - factor);
            const diffPct = Math.round(diff * 100);
            const desc = lang === 'sv'
                ? `Förändringsfaktorn för en händelse är ${factor}. Hur många procents ${isIncrease ? 'ökning' : 'minskning'} innebär detta?`
                : `The change factor for an event is ${factor}. What percentage ${isIncrease ? 'increase' : 'decrease'} does this represent?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(diffPct.toString()),
                clues: [
                    { text: lang === 'sv' ? "Jämför förändringsfaktorn med 1,00 för att se hur mycket värdet har ändrats." : "Compare the change factor with 1.00 to see how much the value has changed.", latex: factor > 1 ? `${factor} - 1.00 = ${diff.toFixed(2)}` : `1.00 - ${factor} = ${diff.toFixed(2)}` },
                    { text: lang === 'sv' ? "Gör om skillnaden i decimalform till procent genom att multiplicera med 100." : "Convert the decimal difference to a percentage by multiplying by 100.", latex: `${diff.toFixed(2)} \\cdot 100 = ${diffPct}\\%` }
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
            ? `Ett pris på ${base} kr ska ${isIncrease ? 'höjas' : 'sänkas'} med ${pct}%. Beräkna det nya priset genom att använda en förändringsfaktor.`
            : `A price of ${base} kr is to be ${isIncrease ? 'increased' : 'decreased'} by ${pct}%. Calculate the new price by applying a change factor.`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Börja med att bestämma förändringsfaktorn för justeringen." : "Begin by determining the change factor for the adjustment.", latex: isIncrease ? `1.00 + ${pct/100} = ${factor}` : `1.00 - ${pct/100} = ${factor}` },
                { text: lang === 'sv' ? "Multiplicera det gamla värdet med faktorn för att få fram det nya priset." : "Multiply the old value by the factor to find the new price.", latex: `${base} \\cdot ${factor} = ${ans}` }
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
            ? `Efter en ${isIncrease ? 'prisökning' : 'prissänkning'} med ${pct}% kostar en vara nu ${newPrice} kr. Hur mycket kostade varan från början?`
            : `After a price ${isIncrease ? 'increase' : 'decrease'} of ${pct}%, an item now costs ${newPrice} kr. What was the original price of the item?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(original.toString()),
            clues: [
                { text: lang === 'sv' ? "Eftersom vi vet det nya värdet men söker det gamla, måste vi dividera med förändringsfaktorn." : "Since we know the new value but seek the old one, we must divide by the change factor.", latex: `\\text{Gammalt värde} = \\frac{\\text{Nytt värde}}{\\text{Faktor}}` },
                { text: lang === 'sv' ? `Förändringsfaktorn är ${factor}. Dela det nya priset med detta tal.` : `The change factor is ${factor}. Divide the new price by this number.`, latex: `\\frac{${newPrice}}{${factor}} = ${original}` }
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
            ? `Värdet på ett föremål ändras först med ${inc1 ? '+' : '-'}${pct1}% och därefter med ytterligare ${inc2 ? '+' : '-'}${pct2}%. Beräkna den totala förändringsfaktorn för båda händelserna.`
            : `The value of an item changes first by ${inc1 ? '+' : '-'}${pct1}% and then by an additional ${inc2 ? '+' : '-'}${pct2}%. Calculate the total change factor for both events combined.`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(totalFactor.toString()),
            clues: [
                { text: lang === 'sv' ? "När flera förändringar sker efter varandra i en kedja ska man multiplicera deras individuella faktorer." : "When multiple changes occur sequentially in a chain, you multiply their individual factors.", latex: `F_{total} = F_1 \\cdot F_2` },
                { text: lang === 'sv' ? `Beräkna produkten av ${f1} och ${f2}.` : `Calculate the product of ${f1} and ${f2}.`, latex: `${f1} \\cdot ${f2} = ${totalFactor}` }
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
                    ? `Folkmängden i en kommun har ändrats från ${start} till ${end} invånare under en femårsperiod. Beräkna förändringsfaktorn för denna befolkningsändring.` 
                    : `The population of a municipality changed from ${start} to ${end} inhabitants over a five-year period. Calculate the change factor for this population shift.`;
            } else if (v === 'word_salary') {
                desc = lang === 'sv'
                    ? `Efter en lyckad löneförhandling höjdes en anställds lön från ${start} kr till ${end} kr per månad. Vilken förändringsfaktor beskriver löneökningen?`
                    : `After a successful salary negotiation, an employee's salary was increased from ${start} kr to ${end} kr per month. Which change factor describes the increase?`;
            } else {
                desc = lang === 'sv'
                    ? `Värdet på en aktie sjönk från ${start} kr till ${end} kr under en turbulent handelsdag. Ange den förändringsfaktor som motsvarar värdeminskningen.`
                    : `The value of a stock fell from ${start} kr to ${end} kr during a turbulent trading day. State the change factor corresponding to the decrease in value.`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [{ text: lang === 'sv' ? "Förändringsfaktorn beräknas alltid genom att dela det nya värdet med det ursprungliga (gamla) värdet." : "The change factor is always calculated by dividing the new value by the original (old) value.", latex: `\\text{Faktor} = \\frac{\\text{Nytt}}{\\text{Gammalt}} = \\frac{${end}}{${start}}` }],
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
                    ? `Du sätter in ${money} kr på ett sparkonto med en årlig ränta på ${rate}%. Hur mycket pengar finns på kontot efter ${years} år om räntan är oförändrad? Avrunda till närmaste heltal.`
                    : `You deposit ${money} kr into a savings account with an annual interest rate of ${rate}%. How much money will be in the account after ${years} years if the rate remains unchanged? Round to the nearest integer.`;
            } else if (v === 'word_depreciation') {
                desc = lang === 'sv'
                    ? `En maskin som kostade ${money} kr vid inköp minskar i värde med ${rate}% varje år. Beräkna maskinens beräknade värde efter ${years} år. Avrunda till närmaste heltal.`
                    : `A machine that cost ${money} kr at purchase decreases in value by ${rate}% each year. Calculate the estimated value of the machine after ${years} years. Round to the nearest integer.`;
            } else {
                desc = lang === 'sv'
                    ? `Ett prov av ett radioaktivt ämne med massan ${money} gram minskar med ${rate}% i vikt per dygn. Hur stor massa återstår efter ${years} dygn? Avrunda till närmaste heltal.`
                    : `A sample of a radioactive substance with a mass of ${money} grams decreases by ${rate}% in weight per day. How much mass remains after ${years} days? Round to the nearest integer.`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Förändringsfaktorn för ett år är ${factor}. För att få värdet efter ${years} år multiplicerar vi startvärdet med faktorn två gånger.` : `The change factor for one year is ${factor}. To find the value after ${years} years, we multiply the starting value by the factor twice.`, latex: `${money} \\cdot ${factor}^2 = ${ans}` }
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
                    ? `Under en slutförsäljning sänks priset på en vara med ${pct}%. Det nya nedsatta priset är ${current} kr. Beräkna varans ordinarie pris före rean.`
                    : `During a clearance sale, the price of an item is reduced by ${pct}%. The new discounted price is ${current} kr. Calculate the item's regular price before the sale.`;
            } else {
                desc = lang === 'sv'
                    ? `På grund av hög inflation har priset på en tjänst stigit med ${pct}% och kostar nu ${current} kr. Hur mycket kostade tjänsten före prisökningen?`
                    : `Due to high inflation, the price of a service has risen by ${pct}% and now costs ${current} kr. How much did the service cost before the price increase?`;
            }

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(original.toString()),
                clues: [
                    { text: lang === 'sv' ? `En förändring på ${isInc ? '+' : '-'}${pct}% ger förändringsfaktorn ${factor}. För att hitta det ursprungliga priset dividerar vi det nuvarande priset med denna faktor.` : `A change of ${isInc ? '+' : '-'}${pct}% gives the change factor ${factor}. To find the original price, we divide the current price by this factor.`, latex: `\\frac{${current}}{${factor}} = ${original}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        // Standard Fallback for unexpected keys
        return this.level2_ApplyFactor(lang);
    }
}