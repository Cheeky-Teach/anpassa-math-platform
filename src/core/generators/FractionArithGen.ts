import { MathUtils } from '../utils/MathUtils.js';

export class FractionArithGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
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

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'add_concept':
            case 'add_missing':
            case 'add_calc':
            case 'sub_calc': 
                return this.level1_SameDenom(lang, key);
            case 'lcd_find':
            case 'add_error_spot':
            case 'add_diff_denom':
            case 'sub_diff_denom':
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
        return { n: n / common, d: d / common, gcd: common };
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
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_calc', type: 'calculate' },
            { key: 'sub_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v === 'sub_calc';

        const d = MathUtils.randomInt(4, 12);
        const n1 = MathUtils.randomInt(2, d - 1);
        const n2 = isSub ? MathUtils.randomInt(1, n1 - 1) : MathUtils.randomInt(1, Math.floor(d / 2));
        
        const rawRes = isSub ? n1 - n2 : n1 + n2;
        const simp = this.simplify(rawRes, d);
        const op = isSub ? '-' : '+';

        const clues = [
            {
                text: lang === 'sv' 
                    ? `Steg 1: Eftersom nämnarna är lika (${d}), behåller vi nämnaren och fokuserar på täljarna.` 
                    : `Step 1: Since the denominators are the same (${d}), we keep the denominator and focus on the numerators.`,
                latex: `${n1} ${op} ${n2}`
            },
            {
                text: lang === 'sv'
                    ? `Steg 2: Räkna ut resultatet för täljarna. Just nu har vi:`
                    : `Step 2: Calculate the result for the numerators. Right now we have:`,
                latex: `\\frac{${n1} ${op} ${n2}}{${d}} = \\frac{${rawRes}}{${d}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Steg 3: Vi kan förenkla bråket genom att dividera både täljare och nämnare med ${simp.gcd}. Just nu har vi:`
                    : `Step 3: We can simplify the fraction by dividing both numerator and denominator by ${simp.gcd}. Right now we have:`,
                latex: `\\frac{${rawRes} \\div ${simp.gcd}}{${d} \\div ${simp.gcd}} = \\frac{${simp.n}}{${simp.d}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna ${isSub ? 'differensen' : 'summan'}.` : `Calculate the ${isSub ? 'difference' : 'sum'}.`, 
                latex: `\\frac{${n1}}{${d}} ${op} \\frac{${n2}}{${d}}`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_diff_denom', type: 'calculate' },
            { key: 'sub_diff_denom', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const isSub = v === 'sub_diff_denom';

        const d1 = MathUtils.randomInt(2, 6);
        let d2 = MathUtils.randomInt(2, 8);
        while (d1 === d2) d2 = MathUtils.randomInt(2, 8);

        const lcd = this.lcm(d1, d2);
        const f1 = lcd / d1;
        const f2 = lcd / d2;
        
        const n1 = MathUtils.randomInt(1, 3);
        const n2 = MathUtils.randomInt(1, 3);
        
        // Ensure positive subtraction
        let startN1 = n1, startN2 = n2;
        if (isSub && (n1 * f1 <= n2 * f2)) { startN1 = n2 + 1; startN2 = n1; }
        
        const ext1 = startN1 * f1;
        const ext2 = startN2 * f2;
        const op = isSub ? '-' : '+';
        const rawRes = isSub ? ext1 - ext2 : ext1 + ext2;
        const simp = this.simplify(rawRes, lcd);

        const clues = [
            {
                text: lang === 'sv'
                    ? `Steg 1: Hitta den minsta gemensamma nämnaren (MGN) för ${d1} och ${d2}.`
                    : `Step 1: Find the lowest common denominator (LCD) for ${d1} and ${d2}.`,
                latex: `MGN = ${lcd}`
            },
            {
                text: lang === 'sv'
                    ? `Steg 2: Förläng det första bråket med ${f1} så att nämnaren blir ${lcd}. Just nu har vi:`
                    : `Step 2: Extend the first fraction by ${f1} so the denominator becomes ${lcd}. Right now we have:`,
                latex: `\\frac{${startN1} \\cdot ${f1}}{${d1} \\cdot ${f1}} = \\frac{${ext1}}{${lcd}}`
            },
            {
                text: lang === 'sv'
                    ? `Steg 3: Förläng det andra bråket med ${f2} så att nämnaren blir ${lcd}. Just nu har vi:`
                    : `Step 3: Extend the second fraction by ${f2} so the denominator becomes ${lcd}. Right now we have:`,
                latex: `\\frac{${startN2} \\cdot ${f2}}{${d2} \\cdot ${f2}} = \\frac{${ext2}}{${lcd}}`
            },
            {
                text: lang === 'sv'
                    ? `Steg 4: Nu när nämnarna är lika kan vi ${isSub ? 'subtrahera' : 'addera'} täljarna. Just nu har vi:`
                    : `Step 4: Now that the denominators are equal, we can ${isSub ? 'subtract' : 'add'} the numerators. Right now we have:`,
                latex: `\\frac{${ext1}}{${lcd}} ${op} \\frac{${ext2}}{${lcd}} = \\frac{${rawRes}}{${lcd}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv'
                    ? `Steg 5: Förenkla bråket genom att dividera med ${simp.gcd}. Just nu har vi:`
                    : `Step 5: Simplify the fraction by dividing by ${simp.gcd}. Right now we have:`,
                latex: `\\frac{${rawRes} \\div ${simp.gcd}}{${lcd} \\div ${simp.gcd}} = \\frac{${simp.n}}{${simp.d}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna ${isSub ? 'differensen' : 'summan'}.` : `Calculate the ${isSub ? 'difference' : 'sum'}.`, 
                latex: `\\frac{${startN1}}{${d1}} ${op} \\frac{${startN2}}{${d2}}`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
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

        const w1 = MathUtils.randomInt(3, 5), w2 = MathUtils.randomInt(1, 2);
        const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomInt(3, 5);
        const n1 = 1, n2 = 1;

        const imp1N = w1 * d1 + n1, imp2N = w2 * d2 + n2;
        const lcd = this.lcm(d1, d2);
        const ext1N = imp1N * (lcd / d1), ext2N = imp2N * (lcd / d2);
        const resN = isSub ? ext1N - ext2N : ext1N + ext2N;
        
        const finalW = Math.floor(resN / lcd);
        const finalRemN = resN % lcd;
        const simp = this.simplify(finalRemN, lcd);
        const finalAnsStr = simp.n === 0 ? `${finalW}` : `${finalW} ${simp.n}/${simp.d}`;
        const op = isSub ? '-' : '+';

        const clues = [
            {
                text: lang === 'sv' ? `Steg 1: Gör om det första talet till bråkform.` : `Step 1: Convert the first number to an improper fraction.`,
                latex: `${w1}\\frac{${n1}}{${d1}} = \\frac{${w1} \\cdot ${d1} + ${n1}}{${d1}} = \\frac{${imp1N}}{${d1}}`
            },
            {
                text: lang === 'sv' ? `Steg 2: Gör om det andra talet till bråkform. Just nu har vi:` : `Step 2: Convert the second number to an improper fraction. Right now we have:`,
                latex: `${w2}\\frac{${n2}}{${d2}} = \\frac{${w2} \\cdot ${d2} + ${n2}}{${d2}} = \\frac{${imp2N}}{${d2}}`
            },
            {
                text: lang === 'sv' ? `Steg 3: Hitta MGN för ${d1} och ${d2}.` : `Step 3: Find the LCD for ${d1} and ${d2}.`,
                latex: `MGN = ${lcd}`
            },
            {
                text: lang === 'sv' ? `Steg 4: Förläng båda bråken till nämnaren ${lcd}. Just nu har vi:` : `Step 4: Extend both fractions to the denominator ${lcd}. Right now we have:`,
                latex: `\\frac{${ext1N}}{${lcd}} ${op} \\frac{${ext2N}}{${lcd}}`
            },
            {
                text: lang === 'sv' ? `Steg 5: Räkna ut ${isSub ? 'skillnaden' : 'summan'} i bråkform.` : `Step 5: Calculate the ${isSub ? 'difference' : 'sum'} in fraction form.`,
                latex: `\\frac{${resN}}{${lcd}}`
            }
        ];

        if (finalW > 0) {
            clues.push({
                text: lang === 'sv' ? `Steg 6: Omvandla tillbaka till blandad form genom att se hur många hela (${lcd}/${lcd}) som får plats i täljaren.` : `Step 6: Convert back to mixed form by seeing how many wholes (${lcd}/${lcd}) fit in the numerator.`,
                latex: `\\frac{${resN}}{${lcd}} = ${finalW}\\frac{${finalRemN}}{${lcd}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: finalAnsStr
        });

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna och svara i blandad form.` : `Calculate and answer in mixed form.`, 
                latex: `${w1}\\frac{${n1}}{${d1}} ${op} ${w2}\\frac{${n2}}{${d2}}`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(finalAnsStr), variationKey: v, clues
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [{ key: 'mult_calc', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);

        const n1 = MathUtils.randomInt(1, 5), d1 = MathUtils.randomInt(2, 6);
        const n2 = MathUtils.randomInt(1, 5), d2 = MathUtils.randomInt(2, 6);
        const resN = n1 * n2, resD = d1 * d2;
        const simp = this.simplify(resN, resD);

        const clues = [
            {
                text: lang === 'sv' ? `Steg 1: Vid multiplikation multiplicerar vi täljare med täljare.` : `Step 1: In multiplication, we multiply numerator by numerator.`,
                latex: `${n1} \\cdot ${n2} = ${resN}`
            },
            {
                text: lang === 'sv' ? `Steg 2: Multiplicera sedan nämnare med nämnare. Just nu har vi:` : `Step 2: Then multiply denominator by denominator. Right now we have:`,
                latex: `${d1} \\cdot ${d2} = ${resD} \\rightarrow \\frac{${resN}}{${resD}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Steg 3: Förenkla bråket genom att dividera med ${simp.gcd}. Just nu har vi:` : `Step 3: Simplify the fraction by dividing by ${simp.gcd}. Right now we have:`,
                latex: `\\frac{${simp.n}}{${simp.d}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { description: lang === 'sv' ? "Multiplicera bråken. Svara i enklaste form." : "Multiply the fractions. Answer in simplest form.", latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [{ key: 'div_calc', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);

        const n1 = MathUtils.randomInt(1, 4), d1 = MathUtils.randomInt(5, 10);
        const n2 = MathUtils.randomInt(1, 4), d2 = MathUtils.randomInt(5, 10);

        const resN = n1 * d2;
        const resD = d1 * n2;
        const simp = this.simplify(resN, resD);

        const clues = [
            {
                text: lang === 'sv' ? `Steg 1: Att dividera med ett bråk är samma sak som att multiplicera med det inverterade bråket ("vända upp och ner").` : `Step 1: Dividing by a fraction is the same as multiplying by its reciprocal ("flipping it upside down").`,
                latex: `\\frac{${n2}}{${d2}} \\rightarrow \\frac{${d2}}{${n2}}`
            },
            {
                text: lang === 'sv' ? `Steg 2: Skriv om uppgiften till multiplikation. Just nu har vi:` : `Step 2: Rewrite the problem as multiplication. Right now we have:`,
                latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${d2}}{${n2}}`
            },
            {
                text: lang === 'sv' ? `Steg 3: Multiplicera täljare för sig och nämnare för sig.` : `Step 3: Multiply the numerators and denominators separately.`,
                latex: `\\frac{${n1} \\cdot ${d2}}{${d1} \\cdot ${n2}} = \\frac{${resN}}{${resD}}`
            }
        ];

        if (simp.gcd > 1) {
            clues.push({
                text: lang === 'sv' ? `Steg 4: Förenkla bråket. Just nu har vi:` : `Step 4: Simplify the fraction. Right now we have:`,
                latex: `\\frac{${simp.n}}{${simp.d}}`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Svaret är: ` : `The answer is: `,
            latex: `\\frac{${simp.n}}{${simp.d}}`
        });

        return {
            renderData: { description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`), variationKey: v, clues
        };
    }
}