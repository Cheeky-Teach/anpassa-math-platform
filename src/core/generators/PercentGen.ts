import { MathUtils } from '../utils/MathUtils.js';

export class PercentGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 Mental Math
        if (level === 1 && options.hideConcept && options.exclude?.includes('visual_translation')) {
            return this.level2_MentalMath(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_ConceptsAndVisuals(lang, undefined, options);
            case 2: return this.level2_MentalMath(lang, undefined, options);
            case 3: return this.level3_BuildingBlocks(lang, undefined, options);
            case 4: return this.level4_PercentEquation(lang, undefined, options);
            case 5: return this.level5_ReversePercentage(lang, undefined, options);
            case 6: return this.level6_PercentageChange(lang, undefined, options);
            default: return this.level1_ConceptsAndVisuals(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_translation':
            case 'visual_lie':
            case 'equivalence':
            case 'equivalence_basic_frac':
            case 'equivalence_basic_dec':
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

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: CONCEPTS & VISUALS ---
    private level1_ConceptsAndVisuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'visual_translation', type: 'calculate' },
            { key: 'visual_lie', type: 'concept' },
            { key: 'equivalence_basic_frac', type: 'concept' },
            { key: 'equivalence', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'equivalence_basic_frac') {
            const facts = [
                { f: "1/2", p: "50", d: 2 }, { f: "1/4", p: "25", d: 4 }, 
                { f: "1/5", p: "20", d: 5 }, { f: "1/10", p: "10", d: 10 }
            ];
            const item = MathUtils.randomChoice(facts);
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur många procent motsvarar bråket $${item.f}$?` : `What percentage corresponds to the fraction $${item.f}$?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(item.p), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Procent betyder 'per hundra' eller hundradelar." : "Step 1: Percent means 'per hundred' or hundredths." },
                    { text: lang === 'sv' ? `Steg 2: För att göra om ett bråk till procent kan vi försöka få nämnaren till 100.` : `Step 2: To convert a fraction to percent, we can try to make the denominator 100.` },
                    { text: lang === 'sv' ? `Multiplicera både täljare och nämnare med ett tal så att nämnaren blir 100.` : `Multiply both numerator and denominator by a number so the denominator becomes 100.`, latex: `\\frac{1 · ${100/item.d}}{${item.d} · ${100/item.d}} = \\frac{${item.p}}{100}` },
                    { text: lang === 'sv' ? `Steg 3: Eftersom vi nu har ${item.p} hundradelar, är svaret ${item.p}%.` : `Step 3: Since we now have ${item.p} hundredths, the answer is ${item.p}%.` },
                    { text: lang === 'sv' ? `Svar: ${item.p}%` : `Answer: ${item.p}%` }
                ]
            };
        }

        if (v === 'visual_translation') {
            const colored = MathUtils.randomInt(5, 95);
            return {
                renderData: {
                    description: lang === 'sv' ? "Hur många procent av rutnätet är färgat?" : "What percentage of the grid is colored?",
                    answerType: 'numeric', suffix: '%',
                    geometry: { type: 'percent_grid', total: 100, colored: colored }
                },
                token: this.toBase64(colored.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Ett helt rutnät består av 10x10 = 100 rutor." : "Step 1: A full grid consists of 10x10 = 100 squares." },
                    { text: lang === 'sv' ? "Steg 2: Varje enskild ruta representerar 1 hundradel, vilket är samma sak som 1%." : "Step 2: Each individual square represents 1 hundredth, which is the same as 1%." },
                    { text: lang === 'sv' ? `Steg 3: Räkna de färgade rutorna. Det finns ${colored} stycken.` : `Step 3: Count the colored squares. There are ${colored} of them.` },
                    { text: lang === 'sv' ? `Svar: ${colored}%` : `Answer: ${colored}%` }
                ]
            };
        }

        // Default equivalence (fraction/decimal/percent mapping)
        const p = MathUtils.randomChoice([10, 20, 25, 50, 75]);
        const dec = (p / 100).toString().replace('.', ',');
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket decimaltal motsvarar ${p}%?` : `Which decimal corresponds to ${p}%?`,
                answerType: 'numeric'
            },
            token: this.toBase64(dec), variationKey: 'equivalence', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Procent betyder hundradelar." : "Step 1: Percent means hundredths." },
                { text: lang === 'sv' ? `Steg 2: Skriv ${p}% som ett bråk med 100 i nämnaren.` : `Step 2: Write ${p}% as a fraction with 100 in the denominator.`, latex: `\\frac{${p}}{100}` },
                { text: lang === 'sv' ? "Steg 3: Dividera täljaren med 100 genom att flytta decimaltecknet två steg åt vänster." : "Step 3: Divide the numerator by 100 by moving the decimal point two places to the left." },
                { text: lang === 'sv' ? `Uträkning: ${p} / 100 = ${p/100}` : `Calculation: ${p} / 100 = ${p/100}` },
                { text: lang === 'sv' ? `Svar: ${dec}` : `Answer: ${p/100}` }
            ]
        };
    }

    // --- LEVEL 2: MENTAL MATH ---
    private level2_MentalMath(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'benchmark_calc', type: 'calculate' },
            { key: 'benchmark_inverse', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        if (v === 'benchmark_calc') {
            const pct = MathUtils.randomChoice([10, 25, 50]);
            const divisor = pct === 10 ? 10 : (pct === 25 ? 4 : 2);
            const base = MathUtils.randomInt(4, 20) * divisor;
            const ans = base / divisor;

            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${pct}% av ${base}.` : `Calculate ${pct}% of ${base}.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Tänk på ${pct}% som en bråkdel av det hela.` : `Step 1: Think of ${pct}% as a fraction of the whole.` },
                    { text: lang === 'sv' ? (pct === 10 ? "10% är samma sak som en tiondel (1/10)." : pct === 25 ? "25% är samma sak som en fjärdedel (1/4)." : "50% är samma sak som hälften (1/2).") : (pct === 10 ? "10% is the same as one tenth (1/10)." : pct === 25 ? "25% is the same as one fourth (1/4)." : "50% is the same as half (1/2).") },
                    { text: lang === 'sv' ? `Steg 2: Dela talet ${base} med ${divisor}.` : `Step 2: Divide the number ${base} by ${divisor}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${base}}{${divisor}} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const pctInv = MathUtils.randomChoice([10, 20, 25, 50]);
        const mult = pctInv === 10 ? 10 : (pctInv === 20 ? 5 : (pctInv === 25 ? 4 : 2));
        const part = MathUtils.randomInt(5, 25);
        const total = part * mult;

        return {
            renderData: {
                description: lang === 'sv' ? `Om ${pctInv}% av ett tal är ${part}, vad är då 100%?` : `If ${pctInv}% of a number is ${part}, what is 100%?`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()), variationKey: 'benchmark_inverse', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Vi vet att ${pctInv}% motsvarar värdet ${part}.` : `Step 1: We know that ${pctInv}% corresponds to the value ${part}.` },
                { text: lang === 'sv' ? `Steg 2: Räkna ut hur många sådana delar som behövs för att nå 100%.` : `Step 2: Calculate how many such parts are needed to reach 100%.` },
                { text: lang === 'sv' ? `Det behövs ${mult} stycken delar (eftersom ${mult} · ${pctInv} = 100).` : `There are ${mult} such parts needed (since ${mult} · ${pctInv} = 100).` },
                { text: lang === 'sv' ? `Steg 3: Multiplicera delens värde (${part}) med ${mult}.` : `Step 3: Multiply the value of the part (${part}) by ${mult}.`, latex: `${part} · ${mult} = ${total}` },
                { text: lang === 'sv' ? `Svar: ${total}` : `Answer: ${total}` }
            ]
        };
    }

    // --- LEVEL 3: BUILDING BLOCKS ---
    private level3_BuildingBlocks(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'composition', type: 'calculate' },
            { key: 'decomposition', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const base = MathUtils.randomInt(2, 8) * 100;

        if (v === 'composition') {
            const pct = MathUtils.randomChoice([30, 40, 70, 80]);
            const ans = (base * pct) / 100;
            return {
                renderData: {
                    description: lang === 'sv' ? `Beräkna ${pct}% av ${base} genom att först hitta 10%.` : `Calculate ${pct}% of ${base} by first finding 10%.`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Hitta värdet för 10% genom att dela det hela med 10." : "Step 1: Find the value of 10% by dividing the whole by 10.", latex: `10\\% = \\frac{${base}}{10} = ${base/10}` },
                    { text: lang === 'sv' ? `Steg 2: Eftersom du söker ${pct}%, multiplicerar vi 10-procentsvärdet med ${pct/10}.` : `Step 2: Since you are looking for ${pct}%, multiply the 10-percent value by ${pct/10}.`, latex: `${base/10} · ${pct/10} = ${ans}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const ans5 = (base * 5) / 100;
        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna 5% av ${base} med hjälp av 10%.` : `Calculate 5% of ${base} using 10%.`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans5.toString()), variationKey: 'decomposition', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Hitta värdet för 10% först." : "Step 1: Find the value of 10% first.", latex: `10\\% = \\frac{${base}}{10} = ${base/10}` },
                { text: lang === 'sv' ? "Steg 2: Eftersom 5% är hälften av 10%, delar vi 10-procentsvärdet med 2." : "Step 2: Since 5% is half of 10%, we divide the 10-percent value by 2.", latex: `\\frac{${base/10}}{2} = ${ans5}` },
                { text: lang === 'sv' ? `Svar: ${ans5}` : `Answer: ${ans5}` }
            ]
        };
    }

    // --- LEVEL 4: PERCENT EQUATION ---
    private level4_PercentEquation(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'find_percent_test', type: 'calculate' },
            { key: 'find_percent_discount', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        const w = MathUtils.randomChoice([20, 25, 40, 50, 200]);
        const p = MathUtils.randomChoice([10, 20, 25, 40, 60]);
        const part = (p * w) / 100;

        const isTest = v === 'find_percent_test';
        const desc = lang === 'sv' 
            ? (isTest ? `Du fick ${part} rätt av ${w} på ett prov. Hur många procent rätt hade du?` : `En vara sänktes med ${part} kr från priset ${w} kr. Vad var sänkningen i procent?`)
            : (isTest ? `You got ${part} correct out of ${w} on a test. What percentage did you get right?` : `An item was reduced by ${part} kr from the price ${w} kr. What was the reduction in percent?`);

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(p.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Identifiera 'delen' och 'det hela'." : "Step 1: Identify the 'part' and the 'whole'." },
                { text: lang === 'sv' ? `Delen är ${part} och det hela är ${w}.` : `The part is ${part} and the whole is ${w}.` },
                { text: lang === 'sv' ? "Steg 2: Ställ upp bråket (Delen / Helheten)." : "Step 2: Set up the fraction (Part / Whole).", latex: `\\frac{${part}}{${w}}` },
                { text: lang === 'sv' ? "Steg 3: Utför divisionen för att få andelen i decimalform." : "Step 3: Perform the division to get the share in decimal form.", latex: `${part} / ${w} = ${part/w}` },
                { text: lang === 'sv' ? "Steg 4: Multiplicera med 100 för att få procentsatsen." : "Step 4: Multiply by 100 to get the percentage.", latex: `${part/w} · 100 = ${p}` },
                { text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%` }
            ]
        };
    }

    // --- LEVEL 5: REVERSE PERCENTAGE ---
    private level5_ReversePercentage(lang: string, variationKey?: string, options: any = {}): any {
        const p = MathUtils.randomChoice([5, 10, 20, 25]);
        const w = MathUtils.randomInt(10, 50) * 10;
        const part = (p * w) / 100;

        return {
            renderData: {
                description: lang === 'sv' ? `${p}% av en summa pengar är ${part} kr. Vad är hela summan (100%)?` : `${p}% of a sum of money is ${part} kr. What is the total sum (100%)?`,
                answerType: 'numeric'
            },
            token: this.toBase64(w.toString()), variationKey: 'reverse_find_whole', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Vi vet att ${p}% motsvarar ${part} kr.` : `Step 1: We know that ${p}% corresponds to ${part} kr.` },
                { text: lang === 'sv' ? `Steg 2: Beräkna vad 1% är genom att dela värdet med ${p}.` : `Step 2: Calculate what 1% is by dividing the value by ${p}.`, latex: `1\\% = \\frac{${part}}{${p}} = ${part/p}` },
                { text: lang === 'sv' ? "Steg 3: Nu kan vi hitta 100% genom att multiplicera värdet för 1% med 100." : "Step 3: Now we can find 100% by multiplying the value for 1% by 100.", latex: `${part/p} · 100 = ${w}` },
                { text: lang === 'sv' ? `Svar: ${w}` : `Answer: ${w}` }
            ]
        };
    }

    // --- LEVEL 6: PERCENTAGE CHANGE ---
    private level6_PercentageChange(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'change_calc', type: 'calculate' },
            { key: 'change_multiplier', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'change_multiplier') {
            const p = MathUtils.randomInt(5, 50);
            const isInc = Math.random() > 0.5;
            const ans = isInc ? (1 + p/100) : (1 - p/100);
            const ansStr = ans.toString().replace('.', ',');

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken förändringsfaktor motsvarar en ${isInc ? 'ökning' : 'minskning'} med ${p}%?` : `Which change factor corresponds to an ${isInc ? 'increase' : 'decrease'} of ${p}%?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Utgå från helheten 100%, vilket motsvaras av faktorn 1,00." : "Step 1: Start from the whole 100%, which corresponds to the factor 1.00." },
                    { text: lang === 'sv' ? (isInc ? `Steg 2: Vid en ökning adderar vi procentsatsen (${p}%) till 100%.` : `Steg 2: At a decrease, we subtract the percentage (${p}%) from 100%.`) : (isInc ? `Step 2: At an increase, we add the percentage (${p}%) to 100%.` : `Step 2: At a decrease, we subtract the percentage (${p}%) from 100%.`), latex: isInc ? `1,00 + ${p/100}` : `1,00 - ${p/100}` },
                    { text: lang === 'sv' ? `Steg 3: Beräkna faktorn.` : `Step 3: Calculate the factor.`, latex: `${ansStr}` },
                    { text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}` }
                ]
            };
        }

        const oldV = MathUtils.randomInt(4, 15) * 100;
        const p = MathUtils.randomChoice([10, 20, 25, 50]);
        const isInc = Math.random() > 0.5;
        const diff = (oldV * p) / 100;
        const newV = isInc ? oldV + diff : oldV - diff;

        return {
            renderData: {
                description: lang === 'sv' ? `Ett pris ändrades från ${oldV} kr till ${newV} kr. Vad var förändringen i procent?` : `A price changed from ${oldV} kr to ${newV} kr. What was the change in percent?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(p.toString()), variationKey: 'change_calc', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna skillnaden (förändringen) i kronor." : "Step 1: Calculate the difference (change) in money.", latex: `${Math.max(oldV, newV)} - ${Math.min(oldV, newV)} = ${diff}` },
                { text: lang === 'sv' ? "Steg 2: Dividera förändringen med det URSPRUNGLIGA värdet." : "Step 2: Divide the change by the ORIGINAL value.", latex: `\\frac{${diff}}{${oldV}}` },
                { text: lang === 'sv' ? "Steg 3: Utför divisionen för att få andelen i decimalform." : "Step 3: Perform the division to get the share in decimal form.", latex: `${diff} / ${oldV} = ${diff/oldV}` },
                { text: lang === 'sv' ? "Steg 4: Gör om till procent genom att multiplicera med 100." : "Step 4: Convert to percent by multiplying by 100.", latex: `${diff/oldV} · 100 = ${p}` },
                { text: lang === 'sv' ? `Svar: ${p}%` : `Answer: ${p}%` }
            ]
        };
    }
}