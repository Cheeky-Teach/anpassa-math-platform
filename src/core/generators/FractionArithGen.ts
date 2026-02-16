import { MathUtils } from '../utils/MathUtils.js';

export class FractionArithGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_SameDenom(lang);
            case 2: return this.level2_DiffDenom(lang);
            case 3: return this.level3_MixedNumbers(lang);
            case 4: return this.level4_Multiplication(lang);
            case 5: return this.level5_Division(lang);
            default: return this.level1_SameDenom(lang);
        }
    }

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

    /**
     * Helper to calculate Least Common Multiple
     */
    private lcm(a: number, b: number): number {
        if (a === 0 || b === 0) return 0;
        return Math.abs(a * b) / MathUtils.gcd(a, b);
    }

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string): any {
        const den = MathUtils.randomInt(5, 12);
        const n1 = MathUtils.randomInt(1, 3);
        const n2 = MathUtils.randomInt(1, 3);
        const sum = n1 + n2;
        const simp = this.simplify(sum, den);
        
        const tokenAnswer = `${simp.n}/${simp.d}`;
        const visualAnswer = `\\frac{${simp.n}}{${simp.d}}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna summan och svara i enklaste form." : "Calculate the sum and answer in simplest form.",
                latex: `\\frac{${n1}}{${den}} + \\frac{${n2}}{${den}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(tokenAnswer),
            clues: [
                { 
                    text: lang === 'sv' ? `Eftersom nämnarna är samma adderar vi bara täljarna: ${n1} + ${n2}.` : `Since the denominators are the same, we just add the numerators: ${n1} + ${n2}.`, 
                    latex: `\\frac{${n1} + ${n2}}{${den}} = \\frac{${sum}}{${den}}` 
                },
                { 
                    text: lang === 'sv' ? "Svaret i enklaste form är:" : "The answer in simplest form is:", 
                    latex: visualAnswer 
                }
            ],
            metadata: { variation_key: 'add_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string, variationKey?: string): any {
        const d1 = MathUtils.randomInt(2, 4);
        const d2 = MathUtils.randomChoice([3, 5].filter(x => x !== d1));
        
        // Fixed: this.lcm is now defined above
        const lcd = this.lcm(d1, d2);
        const f1 = lcd / d1, f2 = lcd / d2;
        const sumN = f1 + f2;
        const simp = this.simplify(sumN, lcd);

        const tokenAnswer = `${simp.n}/${simp.d}`;
        const visualAnswer = `\\frac{${simp.n}}{${simp.d}}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna summan genom att hitta en gemensam nämnare." : "Calculate the sum by finding a common denominator.",
                latex: `\\frac{1}{${d1}} + \\frac{1}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(tokenAnswer),
            clues: [
                { 
                    text: lang === 'sv' ? `För att kunna addera bråken måste de ha samma nämnare. Vi förlänger dem till ${lcd}.` : `To add the fractions, they must have the same denominator. We extend them to ${lcd}.`, 
                    latex: `\\frac{1 \\cdot ${f1}}{${d1} \\cdot ${f1}} + \\frac{1 \\cdot ${f2}}{${d2} \\cdot ${f2}} = \\frac{${f1}}{${lcd}} + \\frac{${f2}}{${lcd}}` 
                },
                { 
                    text: lang === 'sv' ? "Nu när nämnarna är lika kan vi addera täljarna." : "Now that the denominators are equal, we can add the numerators.", 
                    latex: `\\frac{${f1} + ${f2}}{${lcd}} = \\frac{${sumN}}{${lcd}}` 
                },
                { 
                    text: lang === 'sv' ? "Svaret i enklaste form är:" : "The answer in simplest form is:", 
                    latex: visualAnswer 
                }
            ],
            metadata: { variation_key: 'add_diff_denom', difficulty: 2 }
        };
    }

    // --- LEVEL 3: MIXED NUMBERS ---
    private level3_MixedNumbers(lang: string, variationKey?: string): any {
        const isSub = Math.random() > 0.5;
        const w1 = MathUtils.randomInt(3, 5), w2 = MathUtils.randomInt(1, 2);
        const d1 = 2, d2 = 3, lcd = 6;
        const n1 = 1, n2 = 1;

        const imp1N = w1 * d1 + n1, imp2N = w2 * d2 + n2;
        const ext1N = imp1N * 3, ext2N = imp2N * 2;
        const resN = isSub ? ext1N - ext2N : ext1N + ext2N;
        
        const finalW = Math.floor(resN / lcd);
        const finalN = resN % lcd;

        const tokenAnswer = finalN === 0 ? `${finalW}` : `${finalW} ${finalN}/${lcd}`;
        const visualAnswer = finalN === 0 ? `${finalW}` : `${finalW} \\frac{${finalN}}{${lcd}}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna och svara i blandad form." : "Calculate and answer in mixed form.",
                latex: `${w1}\\frac{${n1}}{${d1}} ${isSub ? '-' : '+'} ${w2}\\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(tokenAnswer),
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med att skriva om talen från blandad form till oäkta bråk." : "Start by rewriting the numbers from mixed form to improper fractions.", 
                    latex: `\\frac{${imp1N}}{${d1}} ${isSub ? '-' : '+'} \\frac{${imp2N}}{${d2}}` 
                },
                { 
                    text: lang === 'sv' ? `Förläng bråken så att de får den gemensamma nämnaren ${lcd}.` : `Extend the fractions so they get the common denominator ${lcd}.`, 
                    latex: `\\frac{${ext1N}}{${lcd}} ${isSub ? '-' : '+'} \\frac{${ext2N}}{${lcd}} = \\frac{${resN}}{${lcd}}` 
                },
                { 
                    text: lang === 'sv' ? "Omvandla tillbaka till blandad form för det slutgiltiga svaret:" : "Convert back to mixed form for the final answer:", 
                    latex: visualAnswer 
                }
            ],
            metadata: { variation_key: 'mixed_calc', difficulty: 4 }
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string, variationKey?: string): any {
        const n1 = MathUtils.randomInt(2, 4), d1 = MathUtils.randomInt(5, 7);
        const n2 = MathUtils.randomInt(1, 3), d2 = MathUtils.randomInt(4, 5);
        const simp = this.simplify(n1 * n2, d1 * d2);
        
        const tokenAnswer = `${simp.n}/${simp.d}`;
        const visualAnswer = `\\frac{${simp.n}}{${simp.d}}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Multiplicera bråken." : "Multiply the fractions.",
                latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(tokenAnswer),
            clues: [
                { 
                    text: lang === 'sv' ? "Vid multiplikation multiplicerar vi täljarna för sig och nämnarna för sig." : "In multiplication, we multiply the numerators separately and the denominators separately.", 
                    latex: `\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}} = \\frac{${n1*n2}}{${d1*d2}}` 
                },
                { 
                    text: lang === 'sv' ? "Svaret i enklaste form är:" : "The answer in simplest form is:", 
                    latex: visualAnswer 
                }
            ],
            metadata: { variation_key: 'mult_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string, variationKey?: string): any {
        const d1 = MathUtils.randomInt(3, 6), d2 = MathUtils.randomInt(2, 5);
        const visualAnswer = `\\frac{${d2}}{${d1}}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.",
                latex: `\\frac{1}{${d1}} \\div \\frac{1}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${d2}/${d1}`),
            clues: [
                { 
                    text: lang === 'sv' ? "Division med ett bråk är samma sak som multiplikation med det inverterade bråket (talet upp och ner)." : "Division by a fraction is the same as multiplication by the reciprocal (the number upside down).", 
                    latex: `\\frac{1}{${d1}} \\cdot \\frac{${d2}}{1}` 
                },
                { 
                    text: lang === 'sv' ? "Svaret är:" : "The answer is:", 
                    latex: visualAnswer 
                }
            ],
            metadata: { variation_key: 'div_calc', difficulty: 3 }
        };
    }
}