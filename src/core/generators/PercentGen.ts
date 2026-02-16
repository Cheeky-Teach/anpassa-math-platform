import { MathUtils } from '../utils/MathUtils.js';

export class PercentGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_ConceptsAndVisuals(lang);
            case 2: return this.level2_MentalMath(lang);
            case 3: return this.level3_BuildingBlocks(lang);
            case 4: return this.level4_PercentEquation(lang);
            case 5: return this.level5_ReversePercentage(lang);
            case 6: return this.level6_PercentageChange(lang);
            default: return this.level1_ConceptsAndVisuals(lang);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_translation':
            case 'visual_lie':
            case 'equivalence':
            case 'equivalence_basic_frac': // Added new case
            case 'equivalence_basic_dec':  // Added new case
                return this.level1_ConceptsAndVisuals(lang, key);
            
            case 'benchmark_calc':
            case 'benchmark_inverse':
            case 'benchmark_commutative':
                return this.level2_MentalMath(lang, key);
            
            case 'composition':
            case 'decomposition':
            case 'estimation':
                return this.level3_BuildingBlocks(lang, key);
            
            case 'find_percent_basic':
            case 'find_percent_test':
            case 'find_percent_discount':
            case 'find_percent_group':
                return this.level4_PercentEquation(lang, key);
            
            case 'reverse_find_whole':
            case 'reverse_scaling':
            case 'reverse_concept':
                return this.level5_ReversePercentage(lang, key);
            
            case 'change_calc':
            case 'change_multiplier':
            case 'change_trap':
                return this.level6_PercentageChange(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }
    // --- LEVEL 1: CONCEPTS & VISUALS ---
    private level1_ConceptsAndVisuals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['visual_translation', 'visual_lie', 'equivalence', 'equivalence_basic_frac', 'equivalence_basic_dec']);

        // New Variation: Basic Fraction to Percent Facts
        if (v === 'equivalence_basic_frac') {
            const facts = [
                { f: "1/2", p: "50" }, { f: "1/3", p: "33" }, { f: "1/4", p: "25" }, 
                { f: "1/5", p: "20" }, { f: "1/10", p: "10" }, { f: "1/100", p: "1" }
            ];
            const item = MathUtils.randomChoice(facts);
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur många procent motsvarar bråket $${item.f}$?` : `What percentage corresponds to the fraction $${item.f}$?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(item.p),
                clues: [
                    { text: lang === 'sv' ? "Procent betyder 'per hundra'. Vi vill ta reda på hur många hundradelar bråket motsvarar." : "Percent means 'per hundred'. We want to find out how many hundredths the fraction represents.", latex: `${item.f} = \\frac{?}{100}` },
                    { text: lang === 'sv' ? "Genom att dividera täljaren med nämnaren får vi andelen." : "By dividing the numerator by the denominator, we get the share.", latex: `${item.f} \\approx ${Number(item.p)/100}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${item.p}\\%` }
                ],
                metadata: { variation_key: 'equivalence_basic_frac', difficulty: 1 }
            };
        }
        if (v === 'visual_translation') {
            const colored = MathUtils.randomInt(1, 99);
            const targetType = MathUtils.randomChoice(['fraction', 'decimal', 'percent']);
            let answer = "";
            let desc = "";

            if (targetType === 'fraction') {
                desc = lang === 'sv' ? "Titta på rutnätet nedan. Hur stor andel av rutorna är färgade? Svara i bråkform." : "Look at the grid below. What fraction of the squares are colored? Answer as a fraction.";
                answer = `${colored}/100`;
            } else if (targetType === 'decimal') {
                desc = lang === 'sv' ? "Studera figuren och ange hur stor andel som är färgad i decimalform." : "Study the figure and state how large a part is colored in decimal form.";
                answer = (colored / 100).toString().replace('.', ',');
            } else {
                desc = lang === 'sv' ? "Hur många procent av hela rutnätet är färgat med blå färg?" : "What percentage of the entire grid is colored in blue?";
                answer = colored.toString();
            }

            return {
                renderData: {
                    description: desc,
                    answerType: targetType === 'fraction' ? 'fraction' : 'numeric',
                    suffix: targetType === 'percent' ? '%' : '',
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(answer),
                clues: [
                    { text: lang === 'sv' ? "Hela rutnätet har 100 rutor. Varje färgad ruta motsvarar en hundradel (1%)." : "The whole grid has 100 squares. Each colored square corresponds to one hundredth (1%).", latex: `\\frac{1}{100} = 1\\%` },
                    { text: lang === 'sv' ? `Eftersom det är ${colored} färgade rutor blir svaret:` : `Since there are ${colored} colored squares, the answer is:`, latex: targetType === 'fraction' ? `\\frac{${colored}}{100}` : `${answer}` }
                ],
                metadata: { variation_key: 'visual_translation', difficulty: 1 }
            };
        }

        if (v === 'visual_lie') {
            const colored = MathUtils.randomInt(15, 85);
            const sTrue1 = `${colored}%`;
            const sTrue2 = (colored > 50) ? (lang === 'sv' ? "Mer än hälften" : "More than half") : (lang === 'sv' ? "Mindre än hälften" : "Less than half");
            const sFalse = (colored / 10).toString().replace('.', ',');

            return {
                renderData: {
                    description: lang === 'sv' ? "Granska figuren och påståendena. Vilket av alternativen är FALSKT?" : "Examine the figure and statements. Which of the options is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(sFalse),
                clues: [
                    { text: lang === 'sv' ? `Det finns ${colored} färgade rutor av 100 totalt. Det motsvarar ${colored}% eller ${colored/100} i decimalform.` : `There are ${colored} colored squares out of 100 total. That corresponds to ${colored}% or ${colored/100} in decimal form.`, latex: `\\frac{${colored}}{100} = ${colored}\\%` },
                    { text: lang === 'sv' ? "Därför är detta påstående lögnen:" : "Therefore, this statement is the lie:", latex: `\\text{${sFalse}}` }
                ],
                metadata: { variation_key: 'visual_lie', difficulty: 1 }
            };
        }

        const p = MathUtils.randomChoice([10, 20, 25, 40, 50, 75, 80]);
        const dec = (p / 100).toString().replace('.', ',');
        const wrong = (p / 10).toString().replace('.', ','); 

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket alternativ representerar INTE samma värde som ${p}%?` : `Which of the following options does NOT represent the same value as ${p}%?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([dec, `${p}/100`, `${p/MathUtils.gcd(p,100)}/${100/MathUtils.gcd(p,100)}`, wrong]) 
            },
            token: this.toBase64(wrong),
            clues: [
                { text: lang === 'sv' ? "Procent betyder hundradelar. För att få decimalform flyttar vi decimalkommat två steg till vänster." : "Percent means hundredths. To get the decimal form, move the decimal point two places to the left.", latex: `${p}\\% = \\frac{${p}}{100} = ${p/100}` },
                { text: lang === 'sv' ? "Det felaktiga svaret är:" : "The incorrect answer is:", latex: `\\text{${wrong}}` }
            ],
            metadata: { variation_key: 'equivalence', difficulty: 1 }
        };
    }

    // --- LEVEL 2: MENTAL MATH ---
    private level2_MentalMath(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['benchmark_calc', 'benchmark_inverse', 'benchmark_commutative']);
        const benchmark = MathUtils.randomChoice([10, 20, 25, 50]);

        if (v === 'benchmark_calc') {
            const step = benchmark === 50 ? 2 : (benchmark === 25 ? 4 : (benchmark === 20 ? 5 : 10));
            const base = MathUtils.randomInt(3, 15) * step;
            const ans = (base * benchmark) / 100;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${benchmark}% av ${base}.` : `Calculate ${benchmark}% of ${base}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Tänk på ${benchmark}% som bråkdelen 1/${step}. Du kan då bara dela talet med ${step}.` : `Think of ${benchmark}% as the fraction 1/${step}. You can then just divide the number by ${step}.`, latex: `\\frac{${base}}{${step}}` },
                    { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'benchmark_calc', difficulty: 2 }
            };
        }

        if (v === 'benchmark_inverse') {
            const part = MathUtils.randomInt(4, 20);
            const step = benchmark === 50 ? 2 : (benchmark === 25 ? 4 : (benchmark === 20 ? 5 : 10));
            const total = part * step;

            return {
                renderData: {
                    description: lang === 'sv' ? `Om ${benchmark}% av ett okänt tal är ${part}, vad är då 100%?` : `If ${benchmark}% of an unknown number is ${part}, what is 100%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? `Det går ${step} stycken delar av ${benchmark}% på en helhet (100%).` : `There are ${step} parts of ${benchmark}% in a whole (100%).`, latex: `${benchmark}\\% \\cdot ${step} = 100\\%` },
                    { text: lang === 'sv' ? "Multiplicera därför delens värde med antalet delar:" : "Therefore, multiply the part's value by the number of parts:", latex: `${part} \\cdot ${step} = ${total}` }
                ],
                metadata: { variation_key: 'benchmark_inverse', difficulty: 2 }
            };
        }

        const n1 = MathUtils.randomChoice([25, 50]);
        const n2 = MathUtils.randomInt(4, 15) * (n1 === 25 ? 4 : 2);
        const ans = (n1 * n2) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna: ${n2}% av ${n1}.` : `Calculate: ${n2}% of ${n1}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Räkna smart genom att byta plats på talen: x% av y är samma som y% av x." : "Calculate smartly by swapping the numbers: x% of y is the same as y% of x.", latex: `${n1}\\% \\text{ av } ${n2}` },
                { text: lang === 'sv' ? "Detta ger oss svaret:" : "This gives us the answer:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'benchmark_commutative', difficulty: 2 }
        };
    }

    // --- LEVEL 3: BUILDING BLOCKS ---
    private level3_BuildingBlocks(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['composition', 'decomposition', 'estimation']);

        if (v === 'composition') {
            const base = MathUtils.randomInt(4, 15) * 10;
            const pct = MathUtils.randomChoice([30, 40, 60, 70, 80, 90]);
            const ans = (base * pct) / 100;

            return {
                renderData: {
                    description: lang === 'sv' ? `Räkna ut ${pct}% av ${base} genom att först hitta 10%.` : `Calculate ${pct}% of ${base} by first finding 10%.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Hitta först 10% genom att dela talet med 10." : "First find 10% by dividing the number by 10.", latex: `10\\% = ${base/10}` },
                    { text: lang === 'sv' ? `Eftersom du vill ha ${pct}%, multiplicera värdet för 10% med ${pct/10}.` : `Since you want ${pct}%, multiply the value for 10% by ${pct/10}.`, latex: `${base/10} \\cdot ${pct/10} = ${ans}` }
                ],
                metadata: { variation_key: 'composition', difficulty: 2 }
            };
        }

        if (v === 'decomposition') {
            const base = MathUtils.randomInt(5, 20) * 20;
            const ans = (base * 5) / 100;

            return {
                renderData: {
                    description: lang === 'sv' ? `Om 10% av ${base} är ${base/10}, vad är då 5%?` : `If 10% of ${base} is ${base/10}, what is 5%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Eftersom 5% är hälften av 10%, delar vi 10-procentsvärdet med 2." : "Since 5% is half of 10%, we divide the 10-percent value by 2.", latex: `\\frac{${base/10}}{2}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'decomposition', difficulty: 2 }
            };
        }

        const base = MathUtils.randomInt(10, 60) * 2;
        const testPct = MathUtils.randomInt(11, 19);
        const target = base * 0.15; 
        const isGreater = (base * testPct / 100) > target;
        const ansTxt = isGreater ? (lang === 'sv' ? "Större" : "Greater") : (lang === 'sv' ? "Mindre" : "Smaller");

        return {
            renderData: {
                description: lang === 'sv' ? `Är ${testPct}% av ${base} större eller mindre än ${target.toString().replace('.', ',')}?` : `Is ${testPct}% of ${base} greater or smaller than ${target}?`,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Större", "Mindre"] : ["Greater", "Smaller"]
            },
            token: this.toBase64(ansTxt),
            clues: [
                { text: lang === 'sv' ? `Uppskatta genom att jämföra med 15% (hälften av 10% + 20%).` : `Estimate by comparing with 15% (half of 10% + 20%).`, latex: `15\\% \\text{ av } ${base} = ${target}` },
                { text: lang === 'sv' ? "Därför är svaret:" : "Therefore the answer is:", latex: `\\text{${ansTxt}}` }
            ],
            metadata: { variation_key: 'estimation', difficulty: 3 }
        };
    }

    // --- LEVEL 4: PERCENT EQUATION ---
    private level4_PercentEquation(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['find_percent_basic', 'find_percent_test', 'find_percent_discount', 'find_percent_group']);
        
        const scenarios = {
            find_percent_test: [
                { sv: (p:any, w:any) => `Du svarade rätt på ${p} frågor av totalt ${w} på ett prov. Hur många procent rätt hade du?`, en: (p:any, w:any) => `You answered ${p} questions correctly out of ${w} on a test. What percentage did you get right?` }
            ],
            find_percent_discount: [
                { sv: (p:any, w:any) => `En vara sänktes med ${p} kr från priset ${w} kr. Hur många procent var sänkningen?`, en: (p:any, w:any) => `An item was reduced by ${p} kr from the price ${w} kr. What percentage was the reduction?` }
            ],
            find_percent_group: [
                { sv: (p:any, w:any) => `I en grupp på ${w} bär ${p} stycken glasögon. Hur stor andel bär glasögon i procent?`, en: (p:any, w:any) => `In a group of ${w}, ${p} wear glasses. What percentage of the group wears glasses?` }
            ],
            find_percent_basic: [
                { sv: (p:any, w:any) => `${p} är hur många procent av ${w}?`, en: (p:any, w:any) => `${p} is what percentage of ${w}?` }
            ]
        };

        const w = MathUtils.randomChoice([20, 25, 40, 50, 200]);
        const p = MathUtils.randomChoice([5, 10, 15, 20, 25, 40, 60]);
        const part = (p * w) / 100;

        const s: any = MathUtils.randomChoice(scenarios[v as keyof typeof scenarios]);
        const desc = lang === 'sv' ? s.sv(part, w) : s.en(part, w);

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(p.toString()),
            clues: [
                { text: lang === 'sv' ? "Dividera delen med det hela för att få fram andelen." : "Divide the part by the whole to find the share.", latex: `\\frac{${part}}{${w}}` },
                { text: lang === 'sv' ? "Förläng eller förkorta bråket så att nämnaren blir 100." : "Extend or simplify the fraction so the denominator is 100.", latex: `\\frac{${p}}{100} = ${p}\\%` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${p}\\%` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 5: REVERSE PERCENTAGE ---
    private level5_ReversePercentage(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['reverse_find_whole', 'reverse_scaling', 'reverse_concept']);

        if (v === 'reverse_find_whole') {
            const p = MathUtils.randomChoice([5, 10, 20, 25, 50]);
            const w = MathUtils.randomInt(4, 15) * 20;
            const part = (p * w) / 100;

            const scenarios = [
                { sv: `${p}% av deltagarna är ${part} personer. Hur många deltog totalt?`, en: `${p}% of participants is ${part} people. How many participated total?` },
                { sv: `${p}% av pengarna är ${part} kr. Hur mycket finns det totalt?`, en: `${p}% of the money is ${part} kr. How much is there total?` }
            ];
            const s = MathUtils.randomChoice(scenarios);

            return {
                renderData: { description: lang === 'sv' ? s.sv : s.en, answerType: 'numeric' },
                token: this.toBase64(w.toString()),
                clues: [
                    { text: lang === 'sv' ? `Hitta först vad 1% är genom att dela ${part} med ${p}.` : `First find what 1% is by dividing ${part} by ${p}.`, latex: `1\\% = \\frac{${part}}{${p}} = ${part/p}` },
                    { text: lang === 'sv' ? "Multiplicera nu resultatet med 100 för att få fram 100%." : "Now multiply the result by 100 to find 100%.", latex: `${part/p} \\cdot 100 = ${w}` },
                    { text: lang === 'sv' ? "Hela antalet är:" : "The whole quantity is:", latex: `${w}` }
                ],
                metadata: { variation_key: 'reverse_find_whole', difficulty: 3 }
            };
        }

        if (v === 'reverse_scaling') {
            const val10 = MathUtils.randomInt(8, 60);
            const targetP = MathUtils.randomChoice([30, 40, 70, 80]);
            const factor = targetP / 10;
            const ans = val10 * factor;

            return {
                renderData: {
                    description: lang === 'sv' ? `10% av ett pris är ${val10} kr. Vad är då ${targetP}%?` : `10% of a price is ${val10} kr. What is ${targetP}%?`,
                    answerType: 'numeric', suffix: 'kr'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Eftersom ${targetP}% är ${factor} gånger så mycket som 10%, multiplicerar vi värdet med ${factor}.` : `Since ${targetP}% is ${factor} times as much as 10%, we multiply the value by ${factor}.`, latex: `${val10} \\cdot ${factor}` },
                    { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'reverse_scaling', difficulty: 3 }
            };
        }

        const ansL = lang === 'sv' ? "Multiplicera med 4" : "Multiply by 4";
        return {
            renderData: {
                description: lang === 'sv' ? "Om man vet vad 25% är, hur får man då fram 100%?" : "If you know what 25% is, how do you find 100%?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ansL, lang === 'sv' ? "Dividera med 4" : "Divide by 4", lang === 'sv' ? "Multiplicera med 25" : "Multiply by 25"])
            },
            token: this.toBase64(ansL),
            clues: [
                { text: lang === 'sv' ? "25% motsvarar en fjärdedel (1/4). Fyra sådana delar bildar 100%." : "25% corresponds to one fourth (1/4). Four such parts form 100%.", latex: "4 \\cdot 25\\% = 100\\%" },
                { text: lang === 'sv' ? "Därför ska man:" : "Therefore, you should:", latex: `\\text{${ansL}}` }
            ],
            metadata: { variation_key: 'reverse_concept', difficulty: 2 }
        };
    }

    // --- LEVEL 6: PERCENTAGE CHANGE ---
    private level6_PercentageChange(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['change_calc', 'change_multiplier', 'change_trap']);

        if (v === 'change_calc') {
            const oldVal = MathUtils.randomInt(3, 12) * 100;
            const p = MathUtils.randomChoice([10, 20, 25, 40, 50]);
            const isInc = Math.random() > 0.5;
            const newVal = isInc ? oldVal * (1 + p/100) : oldVal * (1 - p/100);

            return {
                renderData: {
                    description: lang === 'sv' ? `Ett värde ändrades från ${oldVal} till ${newVal}. Vad var förändringen i procent?` : `A value changed from ${oldVal} to ${newVal}. What was the change in percent?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(p.toString()),
                clues: [
                    { text: lang === 'sv' ? "Beräkna skillnaden och dividera den med det gamla värdet." : "Calculate the difference and divide it by the old value.", latex: `\\frac{|${newVal} - ${oldVal}|}{${oldVal}}` },
                    { text: lang === 'sv' ? "Svaret i procent är:" : "The answer in percent is:", latex: `${p}\\%` }
                ],
                metadata: { variation_key: 'change_calc', difficulty: 4 }
            };
        }

        if (v === 'change_multiplier') {
            const p = MathUtils.randomInt(5, 50);
            const isInc = Math.random() > 0.5;
            const ans = isInc ? (1 + p/100) : (1 - p/100);

            return {
                renderData: {
                    description: lang === 'sv' ? `Ange förändringsfaktorn för en ${isInc ? 'ökning' : 'minskning'} med ${p}%.` : `State the change factor for a ${isInc ? 'increase' : 'decrease'} of ${p}%.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString().replace('.', ',')),
                clues: [
                    { text: lang === 'sv' ? (isInc ? "Addera procentsatsen till 1,00." : "Subtrahera procentsatsen från 1,00.") : (isInc ? "Add the percentage to 1.00." : "Subtract the percentage from 1.00."), latex: isInc ? `1.00 + ${p/100}` : `1.00 - ${p/100}` },
                    { text: lang === 'sv' ? "Faktorn är:" : "The factor is:", latex: `${ans.toString().replace('.', ',')}` }
                ],
                metadata: { variation_key: 'change_multiplier', difficulty: 3 }
            };
        }

        const ansL = lang === 'sv' ? "Det är lägre än startpriset" : "It is lower than the starting price";
        return {
            renderData: {
                description: lang === 'sv' ? "Ett pris höjs först med 10% och sänks sedan med 10%. Vad händer med priset?" : "A price first increases by 10% and then decreases by 10%. What happens to the price?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ansL, lang === 'sv' ? "Det är samma som startpriset" : "It is the same as the starting price", lang === 'sv' ? "Det är högre än startpriset" : "It is higher than the starting price"])
            },
            token: this.toBase64(ansL),
            clues: [
                { text: lang === 'sv' ? "Den sista sänkningen beräknas på ett högre belopp, vilket gör att man tappar mer än man först vann." : "The final decrease is calculated on a larger amount, meaning you lose more than you first gained.", latex: `1.10 \\cdot 0.90 = 0.99` },
                { text: lang === 'sv' ? "Svaret är därför:" : "The answer is therefore:", latex: `\\text{${ansL}}` }
            ],
            metadata: { variation_key: 'change_trap', difficulty: 4 }
        };
    }
}