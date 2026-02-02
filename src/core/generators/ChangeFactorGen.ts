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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    public getLevelKey(level: number): string {
        const map: any = {
            1: 'concept',
            2: 'apply_factor',
            3: 'find_original',
            4: 'total_change',
            5: 'word_problems'
        };
        return map[level] || 'unknown';
    }

    // Level 1: Concept & Definition (Factor <-> Percent)
    private level1_Concepts(lang: string): any {
        const type = MathUtils.randomChoice(['pct_to_factor', 'factor_to_pct']);
        const isIncrease = MathUtils.randomInt(0, 1) === 1;
        
        // Expanded range: 1% to 150% (allowing >100% increases)
        // Bias towards integers, but allow 1.5% type things? No, keep integer percents for now.
        let pct = 0;
        if (Math.random() < 0.3) pct = MathUtils.randomInt(1, 9) * 10; // 10, 20...
        else pct = MathUtils.randomInt(1, 150); // 1..150
        
        let factor = 0;
        if (isIncrease) factor = 1 + (pct / 100);
        else {
            // For decrease, max 99%
            pct = Math.min(pct, 99);
            factor = 1 - (pct / 100);
        }
        
        factor = Math.round(factor * 100) / 100;

        if (type === 'pct_to_factor') {
            const desc = lang === 'sv'
                ? (isIncrease ? `En ökning med ${pct}%. Vad är förändringsfaktorn?` : `En minskning med ${pct}%. Vad är förändringsfaktorn?`)
                : (isIncrease ? `An increase of ${pct}%. What is the change factor?` : `A decrease of ${pct}%. What is the change factor?`);
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Utgå alltid från 100%." : "Always start from 100%.",
                        latex: `100\\%` 
                    },
                    {
                        text: lang === 'sv' 
                            ? (isIncrease ? `Addera ökningen (${pct}%).` : `Dra bort minskningen (${pct}%).`)
                            : (isIncrease ? `Add the increase (${pct}%).` : `Subtract the decrease (${pct}%).`),
                        latex: isIncrease 
                            ? `100\\% + ${pct}\\% = ${100+pct}\\% = ${factor}`
                            : `100\\% - ${pct}\\% = ${100-pct}\\% = ${factor}`
                    }
                ]
            };
        } else {
            // Factor -> Percent
            const diff = Math.abs(1 - factor);
            const diffPct = Math.round(diff * 100);
            
            const desc = lang === 'sv'
                ? `Förändringsfaktorn är ${factor}. Vad är ${factor > 1 ? 'ökningen' : 'minskningen'} i procent?`
                : `The change factor is ${factor}. What is the ${factor > 1 ? 'increase' : 'decrease'} in percent?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(diffPct.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? "Jämför med 1 (som är 100%)." : "Compare with 1 (which is 100%).",
                        latex: factor > 1 
                            ? `${factor} - 1.00 = ${diff.toFixed(2)}`
                            : `1.00 - ${factor} = ${diff.toFixed(2)}`
                    },
                    {
                        text: lang === 'sv' ? "Gör om decimaltalet till procent." : "Convert decimal to percent.",
                        latex: `${diff.toFixed(2)} = ${diffPct}\\%`
                    }
                ]
            };
        }
    }

    // Level 2: Applying the Factor (New = Old * Factor)
    private level2_ApplyFactor(lang: string): any {
        // Generate diverse percent
        const pct = MathUtils.randomInt(1, 99);
        const isIncrease = MathUtils.randomInt(0, 1) === 1;
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        // Choose base so answer is integer
        // We need base * factor = Integer
        // factor = X / 100. So base * X / 100 = Int.
        // Base must clear the denominator of (factor simplified).
        // Simplest strategy: Base is always a multiple of 100.
        // Or multiple of 10 if factor ends in .X
        
        let base = MathUtils.randomInt(1, 50) * 100; // 100...5000
        // Add variety to base (e.g. 250, 50)
        if (Math.random() < 0.5) base = MathUtils.randomInt(1, 20) * 50;

        const ans = Math.round(base * factor * 100) / 100; // Should be clean

        const desc = lang === 'sv'
            ? `Ett pris på ${base} kr ${isIncrease ? 'ökar' : 'minskar'} med ${pct}%. Beräkna nya priset med förändringsfaktor.`
            : `A price of ${base} kr ${isIncrease ? 'increases' : 'decreases'} by ${pct}%. Calculate the new price using the change factor.`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(ans.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Hitta förändringsfaktorn först." : "Find the change factor first.",
                    latex: isIncrease ? `100\\% + ${pct}\\% = ${factor}` : `100\\% - ${pct}\\% = ${factor}`
                },
                {
                    text: lang === 'sv' ? "Multiplicera gamla värdet med faktorn." : "Multiply the old value by the factor.",
                    latex: `\\text{Nytt} = ${base} \\cdot ${factor} = ${ans}`
                }
            ]
        };
    }

    // Level 3: Finding Original (Old = New / Factor)
    private level3_FindOriginal(lang: string): any {
        const pct = MathUtils.randomInt(1, 99); // Varied percent
        const isIncrease = MathUtils.randomInt(0, 1) === 1;
        let factor = isIncrease ? 1 + pct/100 : 1 - pct/100;
        factor = Math.round(factor * 100) / 100;

        // Reverse Engineering:
        // We want Original to be Integer.
        // New = Original * Factor
        // Pick Original first.
        const original = MathUtils.randomInt(1, 50) * 100; // e.g. 500
        const newPrice = Math.round(original * factor * 100) / 100;

        const desc = lang === 'sv'
            ? `Efter en ${isIncrease ? 'ökning' : 'minskning'} med ${pct}% kostar en vara ${newPrice} kr. Vad kostade den från början?`
            : `After a ${isIncrease ? 'increase' : 'decrease'} of ${pct}%, an item costs ${newPrice} kr. What was the original price?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(original.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Vi vet Nya priset. Vi söker Gamla priset." : "We know the New price. We seek the Old price.",
                    latex: `\\text{Gammalt} \\cdot ${factor} = ${newPrice}`
                },
                {
                    text: lang === 'sv' ? "Dividera med förändringsfaktorn." : "Divide by the change factor.",
                    latex: `\\frac{${newPrice}}{${factor}} = ${original}`
                }
            ]
        };
    }

    // Level 4: Total Change (Sequential Factors)
    private level4_TotalChange(lang: string): any {
        const pct1 = MathUtils.randomChoice([5, 10, 15, 20, 25, 30, 40, 50]);
        const pct2 = MathUtils.randomChoice([5, 10, 15, 20, 25, 30, 40, 50]);
        
        const inc1 = MathUtils.randomInt(0, 1) === 1;
        const inc2 = MathUtils.randomInt(0, 1) === 1; 

        const f1 = inc1 ? 1 + pct1/100 : 1 - pct1/100;
        const f2 = inc2 ? 1 + pct2/100 : 1 - pct2/100;
        
        // Round to 4 decimals to avoid float errors, then display
        const totalFactor = Math.round(f1 * f2 * 10000) / 10000;

        const desc = lang === 'sv'
            ? `Värdet ändras först med ${inc1 ? '+' : '-'}${pct1}%, och sedan med ${inc2 ? '+' : '-'}${pct2}%. Vad är den totala förändringsfaktorn?`
            : `The value changes first by ${inc1 ? '+' : '-'}${pct1}%, then by ${inc2 ? '+' : '-'}${pct2}%. What is the total change factor?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(totalFactor.toString()),
            clues: [
                {
                    text: lang === 'sv' ? "Gör om varje procent till en faktor." : "Convert each percent to a factor.",
                    latex: `F_1 = ${f1}, \\quad F_2 = ${f2}`
                },
                {
                    text: lang === 'sv' ? "Multiplicera faktorerna med varandra." : "Multiply the factors.",
                    latex: `${f1} \\cdot ${f2} = ${totalFactor}`
                }
            ]
        };
    }

    // Level 5: Word Problems (Expanded Scenarios)
    private level5_WordProblems(lang: string): any {
        const scenarios = [
            'population', // Inc
            'interest',   // Inc
            'depreciation', // Dec (Car)
            'sale',         // Dec (Clothes)
            'decay',        // Dec (Bacteria/Substance)
            'salary',       // Inc
            'inflation',    // Inc
            'stock'         // Mixed
        ];
        
        const type = MathUtils.randomChoice(scenarios);

        // --- 1. Population (Find Factor) ---
        if (type === 'population') {
            const start = MathUtils.randomInt(50, 500) * 100; // 5000 - 50000
            // Make end a clean ratio? Not strictly necessary for "Find Factor" but nicer.
            // Let's just pick random pct change
            const pct = MathUtils.randomInt(1, 50);
            const end = Math.round(start * (1 + pct/100));
            const factor = 1 + pct/100;
            
            const desc = lang === 'sv'
                ? `En stad ökade sin befolkning från ${start} till ${end}. Vad är förändringsfaktorn?`
                : `A city increased its population from ${start} to ${end}. What is the change factor?`;
            
            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? "Jämför det nya värdet med det gamla." : "Compare the new value with the old.",
                        latex: `\\text{Faktor} = \\frac{\\text{Nytt}}{\\text{Gammalt}}`
                    },
                    { latex: `\\frac{${end}}{${start}} = ${factor}` }
                ]
            };
        } 
        
        // --- 2. Interest (Apply Factor ^ Years) ---
        else if (type === 'interest') {
            const money = MathUtils.randomInt(10, 100) * 100; // 1000 - 10000
            const years = 2;
            const rate = MathUtils.randomInt(2, 12); 
            const factor = 1 + rate/100;
            // Round to nearest kr
            const ans = Math.round(money * factor * factor); 

            const desc = lang === 'sv'
                ? `Du sparar ${money} kr med ${rate}% ränta per år. Hur mycket har du efter ${years} år? (Avrunda till heltal)`
                : `You save ${money} kr with ${rate}% interest per year. How much do you have after ${years} years? (Round to integer)`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(ans.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Förändringsfaktorn är ${factor}. Vi multiplicerar den två gånger.` : `The factor is ${factor}. Multiply it twice.`,
                        latex: `${money} \\cdot ${factor} \\cdot ${factor}`
                    },
                    { latex: `${money} \\cdot ${Math.round(factor*factor*1000)/1000} \\approx ${ans}` }
                ]
            };
        }

        // --- 3. Car Depreciation (Decrease) ---
        else if (type === 'depreciation') {
            const price = MathUtils.randomInt(10, 50) * 10000; // 100k - 500k
            const drop = MathUtils.randomInt(5, 25);
            const factor = 1 - drop/100;
            const years = 2;
            const ans = Math.round(price * factor * factor);

            const desc = lang === 'sv'
                ? `En bil värderad till ${price} kr minskar i värde med ${drop}% per år. Vad är värdet efter ${years} år? (Avrunda till heltal)`
                : `A car valued at ${price} kr depreciates by ${drop}% per year. What is the value after ${years} years? (Round to integer)`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(ans.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Minskning med ${drop}% ger faktorn ${factor}.` : `Decrease by ${drop}% gives factor ${factor}.`,
                        latex: `100\\% - ${drop}\\% = ${factor}`
                    },
                    {
                        text: lang === 'sv' ? "Multiplicera för varje år." : "Multiply for each year.",
                        latex: `${price} \\cdot ${factor} \\cdot ${factor} \\approx ${ans}`
                    }
                ]
            };
        }

        // --- 4. Sale (Find Original from New) ---
        else if (type === 'sale') {
            const discount = MathUtils.randomChoice([10, 15, 20, 25, 30, 40, 50]);
            const factor = 1 - discount/100;
            const original = MathUtils.randomInt(4, 20) * 50; // 200 - 1000
            const salePrice = original * factor; 

            const desc = lang === 'sv'
                ? `På rean sänks priset med ${discount}%. Nu kostar tröjan ${salePrice} kr. Vad var ordinarie pris?`
                : `On sale, the price drops by ${discount}%. The shirt now costs ${salePrice} kr. What was the original price?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(original.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Sänkning med ${discount}% betyder att ${(100-discount)}% är kvar (Faktor ${factor}).` : `${discount}% drop means ${(100-discount)}% remains (Factor ${factor}).`,
                        latex: `x \\cdot ${factor} = ${salePrice}`
                    },
                    { latex: `x = \\frac{${salePrice}}{${factor}} = ${original}` }
                ]
            };
        }

        // --- 5. Decay (Bacteria/Substance) ---
        else if (type === 'decay') {
            const start = 1000;
            const rate = MathUtils.randomChoice([10, 20, 50]);
            const factor = 1 - rate/100;
            const hours = 3;
            const ans = Math.round(start * Math.pow(factor, hours));

            const desc = lang === 'sv'
                ? `En mängd på ${start} g minskar med ${rate}% varje timme. Hur mycket finns kvar efter ${hours} timmar? (Avrunda)`
                : `An amount of ${start} g decreases by ${rate}% every hour. How much remains after ${hours} hours? (Round)`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(ans.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Faktorn är ${factor}.` : `Factor is ${factor}.`,
                        latex: `100\\% - ${rate}\\% = ${factor}`
                    },
                    { latex: `${start} \\cdot ${factor}^3 \\approx ${ans}` }
                ]
            };
        }

        // --- 6. Salary (Increase - Find Factor) ---
        else if (type === 'salary') {
            const oldSal = MathUtils.randomInt(20, 40) * 1000; // 20k-40k
            const increase = MathUtils.randomInt(2, 8); // 2-8% raise
            const newSal = oldSal * (1 + increase/100);
            const factor = 1 + increase/100;

            const desc = lang === 'sv'
                ? `Din lön ökade från ${oldSal} kr till ${newSal} kr. Vad är förändringsfaktorn?`
                : `Your salary increased from ${oldSal} kr to ${newSal} kr. What is the change factor?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    { latex: `\\text{Faktor} = \\frac{\\text{Nytt}}{\\text{Gammalt}}` },
                    { latex: `\\frac{${newSal}}{${oldSal}} = ${factor}` }
                ]
            };
        }

        // --- 7. Inflation (Reverse - Find Old Value) ---
        else if (type === 'inflation') {
            const rate = MathUtils.randomInt(2, 5); // 2-5% inflation
            const factor = 1 + rate/100;
            const costBefore = MathUtils.randomInt(10, 50) * 10;
            const costNow = costBefore * factor;

            const desc = lang === 'sv'
                ? `Priset på en vara är idag ${costNow} kr efter en ökning på ${rate}%. Vad kostade den innan ökningen?`
                : `The price of an item is today ${costNow} kr after an increase of ${rate}%. What did it cost before?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(costBefore.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? `Ökning på ${rate}% ger faktorn ${factor}.` : `${rate}% increase gives factor ${factor}.`,
                        latex: `\\text{Gammalt} \\cdot ${factor} = ${costNow}`
                    },
                    { latex: `\\frac{${costNow}}{${factor}} = ${costBefore}` }
                ]
            };
        }

        // --- 8. Stock Market (Decrease - Find Factor) ---
        else {
            const start = 200;
            const drop = MathUtils.randomInt(10, 50);
            const end = start * (1 - drop/100);
            const factor = 1 - drop/100;

            const desc = lang === 'sv'
                ? `En aktie föll från ${start} kr till ${end} kr. Vad är förändringsfaktorn?`
                : `A stock fell from ${start} kr to ${end} kr. What is the change factor?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(factor.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? "Eftersom värdet minskar ska faktorn vara mindre än 1." : "Since value decreased, factor should be less than 1.",
                        latex: `\\frac{\\text{Nytt}}{\\text{Gammalt}}`
                    },
                    { latex: `\\frac{${end}}{${start}} = ${factor}` }
                ]
            };
        }
    }
}