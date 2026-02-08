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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_translation':
            case 'visual_lie':
            case 'equivalence':
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
        const v = variationKey || MathUtils.randomChoice(['visual_translation', 'visual_lie', 'equivalence']);

        if (v === 'visual_translation') {
            const colored = MathUtils.randomInt(1, 99);
            const targetType = MathUtils.randomChoice(['fraction', 'decimal', 'percent']);
            
            let answer = "";
            let desc = "";

            if (targetType === 'fraction') {
                desc = lang === 'sv' 
                    ? "Titta på rutnätet nedan. Hur stor andel av rutorna är färgade? Svara i bråkform." 
                    : "Look at the grid below. What fraction of the squares are colored? Answer as a fraction.";
                answer = `${colored}/100`;
            } else if (targetType === 'decimal') {
                desc = lang === 'sv' 
                    ? "Studera figuren och ange hur stor andel som är färgad i decimalform." 
                    : "Study the figure and state how large a part is colored in decimal form.";
                answer = (colored / 100).toString().replace('.', ',');
            } else {
                desc = lang === 'sv' 
                    ? "Hur många procent av hela rutnätet är färgat med blå färg?" 
                    : "What percentage of the entire grid is colored in blue?";
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
                    { text: lang === 'sv' ? "Hela rutnätet består av exakt 100 rutor. Varje färgad ruta motsvarar därför en hundradel eller en procent." : "The whole grid consists of exactly 100 squares. Therefore, each colored square corresponds to one hundredth or one percent.", latex: "" },
                    { text: lang === 'sv' ? `Vi har ${colored} färgade rutor av totalt 100.` : `We have ${colored} colored squares out of a total of 100.`, latex: `\\frac{${colored}}{100} = ${colored}\\%` }
                ],
                metadata: { variation_key: 'visual_translation', difficulty: 1 }
            };
        }

        if (v === 'visual_lie') {
            const colored = MathUtils.randomInt(15, 85);
            const sTrue1 = `${colored}%`;
            const sTrue2 = (colored > 50) 
                ? (lang === 'sv' ? "Mer än hälften" : "More than half") 
                : (lang === 'sv' ? "Mindre än hälften" : "Less than half");
            const sFalse = (colored / 10).toString().replace('.', ',');

            return {
                renderData: {
                    description: lang === 'sv' ? "Granska figuren och påståendena nedan. Vilket av alternativen är FALSKT?" : "Examine the figure and the statements below. Which of the options is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, sFalse]),
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(sFalse),
                clues: [{ text: lang === 'sv' ? `Det finns exakt ${colored} blå rutor. Eftersom det är 100 rutor totalt motsvarar det ${colored}%, inte ${sFalse}.` : `There are exactly ${colored} blue squares. Since there are 100 squares total, that corresponds to ${colored}%, not ${sFalse}.` }],
                metadata: { variation_key: 'visual_lie', difficulty: 1 }
            };
        }

        const p = MathUtils.randomChoice([10, 20, 25, 40, 50, 75, 80]);
        const dec = (p / 100).toString().replace('.', ',');
        const wrong = (p / 10).toString().replace('.', ','); 

        return {
            renderData: {
                description: lang === 'sv' ? `Vilket av följande alternativ representerar INTE samma värde som ${p}%?` : `Which of the following options does NOT represent the same value as ${p}%?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([dec, `${p}/100`, `${p/MathUtils.gcd(p,100)}/${100/MathUtils.gcd(p,100)}`, wrong]) 
            },
            token: this.toBase64(wrong),
            clues: [{ text: lang === 'sv' ? "Kom ihåg att procent betyder hundradelar. För att få decimalform flyttar vi kommat två steg." : "Remember that percent means hundredths. To get decimal form, we move the decimal point two places.", latex: `${p}\\% = \\frac{${p}}{100} = ${p/100}` }],
            metadata: { variation_key: 'equivalence', difficulty: 1 }
        };
    }

    // --- LEVEL 2: MENTAL MATH BENCHMARKS ---
    private level2_MentalMath(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['benchmark_calc', 'benchmark_inverse', 'benchmark_commutative']);
        const benchmark = MathUtils.randomChoice([10, 20, 25, 50]);

        if (v === 'benchmark_calc') {
            const step = benchmark === 50 ? 2 : (benchmark === 25 ? 4 : (benchmark === 20 ? 5 : 10));
            const base = MathUtils.randomInt(3, 15) * step;
            const ans = (base * benchmark) / 100;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna hur mycket ${benchmark}% av ${base} är utan att använda miniräknare.` : `Calculate how much ${benchmark}% of ${base} is without using a calculator.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? `Tänk på ${benchmark}% som bråket $1/${step}$. Du kan alltså helt enkelt dela talet med ${step}.` : `Think of ${benchmark}% as the fraction $1/${step}$. You can simply divide the number by ${step}.`, latex: `\\frac{${base}}{${step}} = ${ans}` }],
                metadata: { variation_key: 'benchmark_calc', difficulty: 2 }
            };
        }

        if (v === 'benchmark_inverse') {
            const part = MathUtils.randomInt(4, 20);
            const step = benchmark === 50 ? 2 : (benchmark === 25 ? 4 : (benchmark === 20 ? 5 : 10));
            const total = part * step;

            return {
                renderData: {
                    description: lang === 'sv' ? `Vi vet att ${benchmark}% av ett okänt tal är ${part}. Vilket är då det hela talet (100%)?` : `We know that ${benchmark}% of an unknown number is ${part}. What is the whole number (100%)?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(total.toString()),
                clues: [{ text: lang === 'sv' ? `Eftersom det går ${step} stycken delar av ${benchmark}% på en helhet, multiplicerar vi delens värde med ${step}.` : `Since there are ${step} parts of ${benchmark}% in a whole, we multiply the part's value by ${step}.`, latex: `${part} \\cdot ${step} = ${total}` }],
                metadata: { variation_key: 'benchmark_inverse', difficulty: 2 }
            };
        }

        const n1 = MathUtils.randomChoice([25, 50]);
        const n2 = MathUtils.randomInt(4, 15) * (n1 === 25 ? 4 : 2);
        const ans = (n1 * n2) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `Använd ett smart knep för att beräkna detta i huvudet: ${n2}% av ${n1}.` : `Use a smart trick to calculate this in your head: ${n2}% of ${n1}.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [{ text: lang === 'sv' ? "Knepet är att $x \\%$ av $y$ är exakt samma sak som $y \\%$ av $x$. Det är enklare att räkna ut den kända procenten av det andra talet." : "The trick is that $x \\%$ of $y$ is exactly the same as $y \\%$ of $x$. It is easier to calculate the known percentage of the other number.", latex: `${n1}\\% \\text{ av } ${n2} = ${ans}` }],
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
                    description: lang === 'sv' ? `Räkna ut vad ${pct}% av ${base} är genom att först ta reda på vad 10% är.` : `Calculate what ${pct}% of ${base} is by first finding out what 10% is.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Hitta 10% genom att dela talet med 10." : "Step 1: Find 10% by dividing the number by 10.", latex: `10 \\% = \\frac{${base}}{10} = ${base/10}` },
                    { text: lang === 'sv' ? `Steg 2: Eftersom du vill ha ${pct}%, multiplicerar du 10-procentsvärdet med ${pct/10}.` : `Step 2: Since you want ${pct}%, multiply the 10-percent value by ${pct/10}.`, latex: `${base/10} \\cdot ${pct/10} = ${ans}` }
                ],
                metadata: { variation_key: 'composition', difficulty: 2 }
            };
        }

        if (v === 'decomposition') {
            const base = MathUtils.randomInt(5, 20) * 20;
            const ans = (base * 5) / 100;

            return {
                renderData: {
                    description: lang === 'sv' ? `Om du vet att 10% av ${base} är ${base/10}, vad är då hälften av det, alltså 5% av talet?` : `If you know that 10% of ${base} is ${base/10}, what is half of that, i.e., 5% of the number?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? "Dela helt enkelt värdet för 10% med 2 för att få fram vad 5% motsvarar." : "Simply divide the value for 10% by 2 to find what 5% corresponds to.", latex: `\\frac{${base/10}}{2} = ${ans}` }],
                metadata: { variation_key: 'decomposition', difficulty: 2 }
            };
        }

        const base = MathUtils.randomInt(10, 60) * 2;
        const testPct = MathUtils.randomInt(11, 19);
        const target = base * 0.15; 
        const isGreater = (base * testPct / 100) > target;
        const ans = isGreater ? (lang === 'sv' ? "Större" : "Greater") : (lang === 'sv' ? "Mindre" : "Smaller");

        return {
            renderData: {
                description: lang === 'sv' ? `Gör en snabb uppskattning: är ${testPct}% av ${base} större eller mindre än ${target.toString().replace('.', ',')}?` : `Make a quick estimate: is ${testPct}% of ${base} greater or smaller than ${target}?`,
                answerType: 'multiple_choice',
                options: lang === 'sv' ? ["Större", "Mindre"] : ["Greater", "Smaller"]
            },
            token: this.toBase64(ans),
            clues: [{ text: lang === 'sv' ? `Använd 10% och 20% som mentala stödjepunkter för att se om ${testPct}% hamnar över eller under målet.` : `Use 10% and 20% as mental benchmarks to see if ${testPct}% falls above or below the target.` }],
            metadata: { variation_key: 'estimation', difficulty: 3 }
        };
    }

    // --- LEVEL 4: PERCENT EQUATION (Word Problems) ---
    private level4_PercentEquation(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['find_percent_basic', 'find_percent_test', 'find_percent_discount', 'find_percent_group']);
        
        const scenarios = {
            find_percent_test: [
                { sv: (p:any, w:any) => `Du svarade rätt på ${p} frågor av totalt ${w} stycken på ett prov. Hur många procent rätt hade du?`, en: (p:any, w:any) => `You answered ${p} questions correctly out of a total of ${w} on a test. What percentage did you get right?` }
            ],
            find_percent_discount: [
                { sv: (p:any, w:any) => `En vara sänktes med ${p} kr från sitt ordinarie pris på ${w} kr. Hur många procent motsvarade sänkningen?`, en: (p:any, w:any) => `An item was reduced by ${p} kr from its original price of ${w} kr. What percentage was the reduction?` }
            ],
            find_percent_group: [
                { sv: (p:any, w:any) => `I en grupp på ${w} personer bär ${p} stycken glasögon. Hur stor andel av gruppen bär glasögon i procent?`, en: (p:any, w:any) => `In a group of ${w} people, ${p} wear glasses. What percentage of the group wears glasses?` }
            ],
            find_percent_basic: [
                { sv: (p:any, w:any) => `Talet ${p} är hur många procent av talet ${w}?`, en: (p:any, w:any) => `The number ${p} is what percentage of the number ${w}?` }
            ]
        };

        const wholes = [20, 25, 40, 50, 200];
        const w = MathUtils.randomChoice(wholes);
        const p = MathUtils.randomChoice([5, 10, 15, 20, 25, 40, 60, 80]);
        const part = (p * w) / 100;

        const s: any = MathUtils.randomChoice(scenarios[v as keyof typeof scenarios]);
        const desc = lang === 'sv' ? s.sv(part, w) : s.en(part, w);

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(p.toString()),
            clues: [
                { text: lang === 'sv' ? "För att hitta andelen i procent tar vi delen och dividerar den med det hela." : "To find the share in percent, we take the part and divide it by the whole.", latex: `\\text{Andel} = \\frac{${part}}{${w}}` },
                { text: lang === 'sv' ? "Omvandla bråket till procent genom att skriva om det till hundradelar." : "Convert the fraction to a percentage by rewriting it as hundredths.", latex: `\\frac{${part}}{${w}} = \\frac{${p}}{100} = ${p}\\%` }
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
                { sv: `${p}% av deltagarna i ett lopp är ${part} personer. Hur många deltog totalt?`, en: `${p}% of the participants in a race is ${part} people. How many participated in total?` },
                { sv: `${p}% av pengarna i en kassa är ${part} kr. Hur mycket finns det totalt?`, en: `${p}% of the money in a cash register is ${part} kr. How much is there in total?` }
            ];
            const s = MathUtils.randomChoice(scenarios);

            return {
                renderData: {
                    description: lang === 'sv' ? s.sv : s.en,
                    answerType: 'numeric'
                },
                token: this.toBase64(w.toString()),
                clues: [
                    { text: lang === 'sv' ? `Ta reda på vad 1% är genom att dela ${part} med ${p}.` : `Find out what 1% is by dividing ${part} by ${p}.`, latex: `1\\% = \\frac{${part}}{${p}} = ${part/p}` },
                    { text: lang === 'sv' ? "Multiplicera sedan detta värde med 100 för att få fram 100%." : "Then multiply this value by 100 to get 100%.", latex: `${part/p} \\cdot 100 = ${w}` }
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
                    description: lang === 'sv' ? `Du vet att 10% av ett pris är ${val10} kr. Hur mycket är då ${targetP}% av samma pris?` : `You know that 10% of a price is ${val10} kr. How much is ${targetP}% of the same price?`,
                    answerType: 'numeric', suffix: 'kr'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? `Eftersom ${targetP}% är ${factor} gånger så mycket som 10%, multiplicerar vi värdet med ${factor}.` : `Since ${targetP}% is ${factor} times as much as 10%, we multiply the value by ${factor}.`, latex: `${val10} \\cdot ${factor} = ${ans}` }],
                metadata: { variation_key: 'reverse_scaling', difficulty: 3 }
            };
        }

        const q = lang === 'sv' ? "Om vi vet värdet av 25% av ett tal, hur får vi då fram hela talet (100%) på enklaste sätt?" : "If we know the value of 25% of a number, how do we find the whole number (100%) in the simplest way?";
        const ansLabel = lang === 'sv' ? "Multiplicera med 4" : "Multiply by 4";

        return {
            renderData: {
                description: q,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ansLabel, lang === 'sv' ? "Dividera med 4" : "Divide by 4", lang === 'sv' ? "Multiplicera med 25" : "Multiply by 25"])
            },
            token: this.toBase64(ansLabel),
            clues: [{ text: lang === 'sv' ? "Eftersom $25 \\%$ är en fjärdedel ($1/4$), behövs det fyra sådana delar för att nå 100%." : "Since $25 \\%$ is a quarter ($1/4$), four such parts are needed to reach 100%." }],
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

            const scenarios = [
                { sv: `Priset på en aktie ändrades från ${oldVal} kr till ${newVal} kr. Hur stor var förändringen i procent?`, en: `The price of a stock changed from ${oldVal} kr to ${newVal} kr. How large was the change in percent?` },
                { sv: `Folkmängden i en by ändrades från ${oldVal} till ${newVal} invånare. Ange förändringen i procent.`, en: `The population of a village changed from ${oldVal} to ${newVal} inhabitants. State the change in percent?` }
            ];
            const s = MathUtils.randomChoice(scenarios);

            return {
                renderData: {
                    description: lang === 'sv' ? s.sv : s.en,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(p.toString()),
                clues: [
                    { text: lang === 'sv' ? "Använd formeln för procentuell förändring: Skillnaden dividerat med det ursprungliga värdet." : "Use the formula for percentage change: The difference divided by the original value.", latex: `\\text{Förändring} = \\frac{\\text{Skillnad}}{\\text{Ursprung}}` },
                    { text: lang === 'sv' ? `Skillnaden är ${Math.abs(newVal - oldVal)} enheter.` : `The difference is ${Math.abs(newVal - oldVal)} units.`, latex: `\\frac{${Math.abs(newVal - oldVal)}}{${oldVal}} = ${p/100} = ${p}\\%` }
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
                    description: lang === 'sv' ? `Vilken förändringsfaktor motsvarar en ${isInc ? 'prisökning' : 'prissänkning'} med ${p}%?` : `Which change factor corresponds to a ${isInc ? 'price increase' : 'price decrease'} of ${p}%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString().replace('.', ',')),
                clues: [{ text: lang === 'sv' ? (isInc ? "Vid en ökning lägger vi till procenten till 1,00." : "Vid en sänkning drar vi bort procenten från 1,00.") : (isInc ? "For an increase, we add the percentage to 1.00." : "For a decrease, we subtract the percentage from 1.00."), latex: isInc ? `1 + ${p/100} = ${ans}` : `1 - ${p/100} = ${ans}` }],
                metadata: { variation_key: 'change_multiplier', difficulty: 3 }
            };
        }

        const pVal = 10;
        const ansLabel = lang === 'sv' ? "Det är lägre än startpriset" : "It is lower than the starting price";
        return {
            renderData: {
                description: lang === 'sv' ? `Ett pris höjs först med ${pVal}% och sänks därefter omedelbart med ${pVal}%. Vilket påstående stämmer om det slutgiltiga priset?` : `A price first increases by ${pVal}% and then immediately after decreases by ${pVal}%. Which statement is true about the final price?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([ansLabel, lang === 'sv' ? "Det är samma som startpriset" : "It is the same as the starting price", lang === 'sv' ? "Det är högre än startpriset" : "It is higher than the starting price"])
            },
            token: this.toBase64(ansLabel),
            clues: [
                { text: lang === 'sv' ? "Detta är en klassisk fälla! Den andra sänkningen beräknas på det nya, högre priset, vilket gör sänkningen större i kronor räknat." : "This is a classic trap! The second decrease is calculated on the new, higher price, which makes the decrease larger in absolute terms.", latex: "" },
                { text: lang === 'sv' ? "Testa med 100 kr: $100 \\cdot 1,10 = 110$. Sedan $110 \\cdot 0,90 = 99$." : "Test with 100 kr: $100 \\cdot 1.10 = 110$. Then $110 \\cdot 0.90 = 99$.", latex: "" }
            ],
            metadata: { variation_key: 'change_trap', difficulty: 4 }
        };
    }
}