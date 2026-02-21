import { MathUtils } from '../utils/MathUtils.js';

export class FractionArithGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If concepts are mastered, jump to calculation
        if (level === 1 && options.hideConcept) {
            return this.level2_DiffDenom(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_SameDenom(lang, undefined, options);
            case 2: return this.level2_DiffDenom(lang, undefined, options);
            case 3: return this.level3_MixedNumbers(lang, undefined, options);
            case 4: return this.level4_Multiplication(lang, undefined, options);
            case 5: return this.level5_Division(lang, undefined, options);
            default: return this.level1_SameDenom(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'add_concept':
            case 'add_missing':
            case 'add_calc':
                return this.level1_SameDenom(lang, key);
            case 'lcd_find':
            case 'add_error_spot':
            case 'add_diff_denom':
                return this.level2_DiffDenom(lang, key);
            case 'mixed_est':
            case 'mixed_add_same':
            case 'mixed_add_diff':
            case 'mixed_sub_same':
            case 'mixed_sub_diff':
                return this.level3_MixedNumbers(lang, key);
            case 'mult_scaling':
            case 'mult_area':
            case 'mult_calc':
                return this.level4_Multiplication(lang, key);
            case 'div_operator':
            case 'div_reciprocal':
            case 'div_calc':
                return this.level5_Division(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private simplify(n: number, d: number) {
        const common = MathUtils.gcd(n, d);
        return { n: n / common, d: d / common };
    }

    private lcm(a: number, b: number): number {
        if (a === 0 || b === 0) return 0;
        return Math.abs(a * b) / MathUtils.gcd(a, b);
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

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_concept', type: 'concept' },
            { key: 'add_missing', type: 'calculate' },
            { key: 'add_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'add_concept') {
            const opts = lang === 'sv' 
                ? ["Nämnaren förblir densamma", "Nämnarna adderas ihop", "Täljaren och nämnaren byter plats"] 
                : ["The denominator remains the same", "The denominators are added together", "Numerator and denominator swap places"];
            return {
                renderData: {
                    description: lang === 'sv' ? "Vad är regeln när man adderar bråk med samma nämnare?" : "What is the rule when adding fractions with the same denominator?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle(opts)
                },
                token: this.toBase64(opts[0]), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Nämnaren talar om vilken 'sort' bråket är (t.ex. femtedelar)." : "Step 1: The denominator tells us the 'kind' of fraction (e.g., fifths)." },
                    { text: lang === 'sv' ? "Steg 2: När vi lägger ihop delar av samma sort ändras inte sorten." : "Step 2: When we add parts of the same kind, the kind does not change." },
                    { text: lang === 'sv' ? `Svar: ${opts[0]}` : `Answer: ${opts[0]}` }
                ]
            };
        }

        const d = MathUtils.randomInt(5, 12);
        const n1 = MathUtils.randomInt(1, 3), n2 = MathUtils.randomInt(1, 3);
        const sum = n1 + n2;
        const simp = this.simplify(sum, d);

        if (v === 'add_missing') {
            return {
                renderData: { description: lang === 'sv' ? "Vilket tal saknas för att ekvationen ska stämma?" : "What number is missing for the equation to be true?", latex: `\\frac{${n1}}{${d}} + \\frac{?}{${d}} = \\frac{${sum}}{${d}}`, answerType: 'numeric' },
                token: this.toBase64(n2.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Eftersom nämnarna är lika på båda sidor fokuserar vi bara på täljarna." : "Step 1: Since the denominators are the same on both sides, we only focus on the numerators." },
                    { text: lang === 'sv' ? `Steg 2: Ställ upp ekvationen för täljarna: ${n1} + ? = ${sum}` : `Step 2: Set up the equation for the numerators: ${n1} + ? = ${sum}` },
                    { text: lang === 'sv' ? `Steg 3: Räkna ut skillnaden: ${sum} - ${n1} = ${n2}` : `Step 3: Calculate the difference: ${sum} - ${n1} = ${n2}` },
                    { text: lang === 'sv' ? `Svar: ${n2}` : `Answer: ${n2}` }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? "Beräkna summan. Svara i enklaste form." : "Calculate the sum. Answer in simplest form.", latex: `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Addera täljarna men låt nämnaren vara kvar." : "Step 1: Add the numerators but keep the denominator." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${n1} + ${n2}}{${d}} = \\frac{${sum}}{${d}}` },
                { text: lang === 'sv' ? "Steg 2: Kontrollera om bråket kan förenklas genom att dividera täljare och nämnare med samma tal." : "Step 2: Check if the fraction can be simplified by dividing numerator and denominator by the same number." },
                { text: lang === 'sv' ? `Steg 3: Förkorta bråket.` : `Step 3: Simplify the fraction.`, latex: `\\frac{${sum}}{${d}} \\rightarrow \\frac{${simp.n}}{${simp.d}}` },
                { text: lang === 'sv' ? `Svar: ${simp.n}/${simp.d}` : `Answer: ${simp.n}/${simp.d}` }
            ]
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'lcd_find', type: 'concept' },
            { key: 'add_error_spot', type: 'concept' },
            { key: 'add_diff_denom', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'lcd_find') {
            const d1 = MathUtils.randomChoice([2, 3, 4]), d2 = MathUtils.randomChoice([5, 6]);
            const res = this.lcm(d1, d2);
            return {
                renderData: { description: lang === 'sv' ? `Hitta den minsta gemensamma nämnaren (MGN) för ${d1} och ${d2}.` : `Find the lowest common denominator (LCD) for ${d1} and ${d2}.`, answerType: 'numeric' },
                token: this.toBase64(res.toString()), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vi letar efter det minsta talet som finns i båda talens multiplikationstabeller." : "Step 1: We are looking for the smallest number that appears in the multiplication tables of both numbers." },
                    { text: lang === 'sv' ? `Tabell ${d1}: ${d1}, ${d1*2}, ${d1*3}...` : `Table ${d1}: ${d1}, ${d1*2}, ${d1*3}...` },
                    { text: lang === 'sv' ? `Tabell ${d2}: ${d2}, ${d2*2}, ${d2*3}...` : `Table ${d2}: ${d2}, ${d2*2}, ${d2*3}...` },
                    { text: lang === 'sv' ? `Det första gemensamma talet är ${res}.` : `The first common number is ${res}.` },
                    { text: lang === 'sv' ? `Svar: ${res}` : `Answer: ${res}` }
                ]
            };
        }

        const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomChoice([3, 5].filter(x => x !== d1));
        const lcd = this.lcm(d1, d2);
        const f1 = lcd / d1, f2 = lcd / d2;
        const simp = this.simplify(f1 + f2, lcd);

        return {
            renderData: { description: lang === 'sv' ? "Beräkna summan genom att först göra nämnarna lika." : "Calculate the sum by first making the denominators equal.", latex: `\\frac{1}{${d1}} + \\frac{1}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Hitta en gemensam nämnare. MGN för ${d1} och ${d2} är ${lcd}.` : `Step 1: Find a common denominator. The LCD for ${d1} and ${d2} is ${lcd}.` },
                { text: lang === 'sv' ? `Steg 2: Förläng det första bråket med ${f1}.` : `Step 2: Extend the first fraction by ${f1}.`, latex: `\\frac{1 · ${f1}}{${d1} · ${f1}} = \\frac{${f1}}{${lcd}}` },
                { text: lang === 'sv' ? `Steg 3: Förläng det andra bråket med ${f2}.` : `Step 3: Extend the second fraction by ${f2}.`, latex: `\\frac{1 · ${f2}}{${d2} · ${f2}} = \\frac{${f2}}{${lcd}}` },
                { text: lang === 'sv' ? "Steg 4: Addera nu de nya bråken." : "Step 4: Now add the new fractions.", latex: `\\frac{${f1}}{${lcd}} + \\frac{${f2}}{${lcd}} = \\frac{${f1 + f2}}{${lcd}}` },
                { text: lang === 'sv' ? `Svar: ${simp.n}/${simp.d}` : `Answer: ${simp.n}/${simp.d}` }
            ]
        };
    }

    // --- LEVEL 3: MIXED NUMBERS ---
    private level3_MixedNumbers(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mixed_add_diff', type: 'calculate' },
            { key: 'mixed_sub_diff', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v.includes('sub');

        // Fully Randomizing denominators and whole numbers
        const d1 = MathUtils.randomChoice([2, 4]), d2 = MathUtils.randomChoice([3, 5]);
        const w1 = MathUtils.randomInt(3, 5), w2 = MathUtils.randomInt(1, 2);
        const n1 = 1, n2 = 1;

        const imp1N = w1 * d1 + n1, imp2N = w2 * d2 + n2;
        const lcd = this.lcm(d1, d2);
        const ext1N = imp1N * (lcd / d1), ext2N = imp2N * (lcd / d2);
        const resN = isSub ? ext1N - ext2N : ext1N + ext2N;
        
        const finalW = Math.floor(resN / lcd);
        const finalN = resN % lcd;
        const simp = this.simplify(finalN, lcd);
        const finalAnsStr = simp.n === 0 ? `${finalW}` : `${finalW} ${simp.n}/${simp.d}`;

        return {
            renderData: { description: lang === 'sv' ? "Beräkna och svara i blandad form." : "Calculate and answer in mixed form.", latex: `${w1}\\frac{${n1}}{${d1}} ${isSub ? '-' : '+'} ${w2}\\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(finalAnsStr), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Gör om talen från blandad form till bråkform (andradelar/tredjedelar osv)." : "Step 1: Convert the numbers from mixed form to improper fractions." },
                { text: lang === 'sv' ? "Omvandling:" : "Conversion:", latex: `\\frac{${imp1N}}{${d1}} ${isSub ? '-' : '+'} \\frac{${imp2N}}{${d2}}` },
                { text: lang === 'sv' ? `Steg 2: Hitta gemensam nämnare. MGN för ${d1} och ${d2} är ${lcd}.` : `Step 2: Find a common denominator. The LCD for ${d1} and ${d2} is ${lcd}.` },
                { text: lang === 'sv' ? "Steg 3: Förläng bråken och räkna ut summan/differensen." : "Step 3: Extend the fractions and calculate the sum/difference.", latex: `\\frac{${ext1N}}{${lcd}} ${isSub ? '-' : '+'} \\frac{${ext2N}}{${lcd}} = \\frac{${resN}}{${lcd}}` },
                { text: lang === 'sv' ? "Steg 4: Omvandla tillbaka till blandad form genom att se hur många hela som ryms i täljaren." : "Step 4: Convert back to mixed form by seeing how many wholes fit in the numerator." },
                { text: lang === 'sv' ? `Svar: ${finalAnsStr}` : `Answer: ${finalAnsStr}` }
            ]
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_scaling', type: 'concept' },
            { key: 'mult_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'mult_scaling') {
            const num = MathUtils.randomInt(3, 10);
            const opts = lang === 'sv' ? ["Mindre än " + num, "Större än " + num, "Exakt " + num] : ["Less than " + num, "Greater than " + num, "Exactly " + num];
            return {
                renderData: { description: lang === 'sv' ? `Blir resultatet av ${num} · 1/2 mindre eller större än ${num}?` : `Is the result of ${num} · 1/2 less than or greater than ${num}?`, answerType: 'multiple_choice', options: opts },
                token: this.toBase64(opts[0]), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Att multiplicera med ett bråk som är mindre än 1 är samma sak som att ta en del av talet." : "Step 1: Multiplying by a fraction smaller than 1 is the same as taking a part of the number." },
                    { text: lang === 'sv' ? "Steg 2: Eftersom 1/2 är mindre än 1, kommer produkten att bli mindre än ursprungstalet." : "Step 2: Since 1/2 is less than 1, the product will be smaller than the original number." },
                    { text: lang === 'sv' ? `Svar: ${opts[0]}` : `Answer: ${opts[0]}` }
                ]
            };
        }

        const n1 = MathUtils.randomInt(2, 4), d1 = MathUtils.randomInt(5, 7), n2 = MathUtils.randomInt(1, 3), d2 = MathUtils.randomInt(4, 5);
        const simp = this.simplify(n1 * n2, d1 * d2);
        return {
            renderData: { description: lang === 'sv' ? "Multiplicera bråken och svara i enklaste form." : "Multiply the fractions and answer in simplest form.", latex: `\\frac{${n1}}{${d1}} · \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Vid multiplikation multipliceras täljarna för sig och nämnarna för sig." : "Step 1: In multiplication, the numerators are multiplied together and the denominators are multiplied together." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${n1} · ${n2}}{${d1} · ${d2}} = \\frac{${n1*n2}}{${d1*d2}}` },
                { text: lang === 'sv' ? "Steg 2: Förkorta svaret om det är möjligt." : "Step 2: Simplify the answer if possible." },
                { text: lang === 'sv' ? `Svar: ${simp.n}/${simp.d}` : `Answer: ${simp.n}/${simp.d}` }
            ]
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_reciprocal', type: 'concept' },
            { key: 'div_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'div_reciprocal') {
            const n = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(6, 9);
            return {
                renderData: { description: lang === 'sv' ? `Vilket är det inverterade talet (reciproka värdet) till ${n}/${d}?` : `What is the reciprocal of the fraction ${n}/${d}?`, answerType: 'fraction' },
                token: this.toBase64(`${d}/${n}`), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Att invertera ett bråk innebär att man låter täljaren och nämnaren byta plats." : "Step 1: Inverting a fraction means letting the numerator and denominator swap places." },
                    { text: lang === 'sv' ? "Steg 2: Vänd på bråket." : "Step 2: Flip the fraction.", latex: `\\frac{${n}}{${d}} \\rightarrow \\frac{${d}}{${n}}` },
                    { text: lang === 'sv' ? `Svar: ${d}/${n}` : `Answer: ${d}/${n}` }
                ]
            };
        }

        const d1 = MathUtils.randomInt(3, 6), d2 = MathUtils.randomInt(2, 5);
        return {
            renderData: { description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", latex: `\\frac{1}{${d1}} \\div \\frac{1}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${d2}/${d1}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Division med ett bråk är samma sak som multiplikation med det inverterade bråket." : "Step 1: Division by a fraction is the same as multiplication by the reciprocal." },
                { text: lang === 'sv' ? "Steg 2: Skriv om uppgiften till multiplikation." : "Step 2: Rewrite the problem as multiplication.", latex: `\\frac{1}{${d1}} · \\frac{${d2}}{1}` },
                { text: lang === 'sv' ? "Steg 3: Multiplicera täljare med täljare och nämnare med nämnare." : "Step 3: Multiply numerator by numerator and denominator by denominator.", latex: `\\frac{1 · ${d2}}{${d1} · 1} = \\frac{${d2}}{${d1}}` },
                { text: lang === 'sv' ? `Svar: ${d2}/${d1}` : `Answer: ${d2}/${d1}` }
            ]
        };
    }
}