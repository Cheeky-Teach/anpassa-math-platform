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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
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

    private gcd(a: number, b: number): number {
        return MathUtils.gcd(a, b);
    }

    private lcm(a: number, b: number): number {
        return (a * b) / this.gcd(a, b);
    }

    private simplify(n: number, d: number): { n: number, d: number } {
        const div = this.gcd(n, d);
        return { n: n / div, d: d / div };
    }

    // --- LEVEL 1: SAME DENOMINATORS ---
    private level1_SameDenom(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['add_concept', 'add_missing', 'add_calc']);

        if (v === 'add_concept') {
            const d = MathUtils.randomInt(4, 9);
            const n1 = MathUtils.randomInt(1, 3);
            const n2 = MathUtils.randomInt(1, 3);
            const sum = n1 + n2;
            
            const correctEq = `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = \\frac{${sum}}{${d}}`;
            const lieType = Math.random() > 0.5 ? 'add_denoms' : 'wrong_numerators';
            const wrongEq = lieType === 'add_denoms' 
                ? `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = \\frac{${sum}}{${d + d}}`
                : `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = \\frac{${n1}}{${d}}`; 
            
            const isCorrectA = Math.random() > 0.5;
            const optCorrect = isCorrectA 
                ? (lang === 'sv' ? "Alternativ A" : "Option A")
                : (lang === 'sv' ? "Alternativ B" : "Option B");

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken av de två uträkningarna nedan följer reglerna för bråkräkning?" : "Which calculation below follows the proper rules of fractions?",
                    latex: `\\text{A: } ${isCorrectA ? correctEq : wrongEq} \\quad \\text{B: } ${isCorrectA ? wrongEq : correctEq}`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([optCorrect, isCorrectA ? (lang === 'sv' ? "Alternativ B" : "Option B") : (lang === 'sv' ? "Alternativ A" : "Option A")])
                },
                token: this.toBase64(optCorrect),
                clues: [{ text: lang === 'sv' ? "Kom ihåg: När vi adderar bråk med samma nämnare lägger vi bara ihop täljarna. Nämnaren förblir densamma." : "Remember: When adding fractions with the same denominator, we only add the numerators. The denominator remains the same." }],
                metadata: { variation_key: 'add_concept', difficulty: 1 }
            };
        }

        const den = MathUtils.randomInt(4, 15);
        const n1 = MathUtils.randomInt(1, den - 2);
        const n2 = MathUtils.randomInt(1, den - n1 - 1) || 1;
        const simp = this.simplify(n1 + n2, den);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna summan av bråken och svara i enklaste form." : "Calculate the sum of the fractions and answer in simplest form.",
                latex: `\\frac{${n1}}{${den}} + \\frac{${n2}}{${den}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [{ text: lang === 'sv' ? `Addera täljarna: $${n1} + ${n2} = ${n1+n2}$. Behåll nämnaren $${den}$.` : `Add the numerators: $${n1} + ${n2} = ${n1+n2}$. Keep the denominator $${den}$.`, latex: `\\frac{${n1+n2}}{${den}}` }],
            metadata: { variation_key: 'add_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['lcd_find', 'add_error_spot', 'add_diff_denom']);

        if (v === 'add_error_spot') {
            const isActuallyCorrect = Math.random() > 0.5;
            const d1 = MathUtils.randomInt(2, 4);
            const d2 = MathUtils.randomInt(d1 + 1, 5);
            const lcd = this.lcm(d1, d2);
            const resN = (lcd / d1) + (lcd / d2);
            const equation = isActuallyCorrect 
                ? `\\frac{1}{${d1}} + \\frac{1}{${d2}} = \\frac{${resN}}{${lcd}}`
                : `\\frac{1}{${d1}} + \\frac{1}{${d2}} = \\frac{2}{${d1 + d2}}`;

            const ans = isActuallyCorrect ? (lang === 'sv' ? "Rätt" : "Correct") : (lang === 'sv' ? "Fel" : "Wrong");

            return {
                renderData: {
                    description: lang === 'sv' ? "Granska uträkningen nedan. Är den korrekt utförd?" : "Review the calculation below. Is it correctly performed?",
                    latex: equation,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Rätt", "Fel"] : ["Correct", "Wrong"]
                },
                token: this.toBase64(ans),
                clues: [{ text: isActuallyCorrect ? (lang === 'sv' ? "Korrekt! Bråken har fått en gemensam nämnare innan additionen." : "Correct! The fractions were given a common denominator before addition.") : (lang === 'sv' ? "Felaktigt. Man kan aldrig addera nämnarna direkt." : "Incorrect. You can never add the denominators directly.") }],
                metadata: { variation_key: 'add_error_spot', difficulty: 2 }
            };
        }

        const d1 = MathUtils.randomInt(2, 5);
        const d2 = MathUtils.randomInt(2, 5);
        if (d1 === d2) return this.level2_DiffDenom(lang, v);
        const lcd = this.lcm(d1, d2);
        const simp = this.simplify(lcd/d1 + lcd/d2, lcd);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna summan genom att först hitta en gemensam nämnare." : "Calculate the sum by first finding a common denominator.",
                latex: `\\frac{1}{${d1}} + \\frac{1}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [
                { text: lang === 'sv' ? `Förläng bråken så de båda får nämnaren $${lcd}$.` : `Extend the fractions so they both have the denominator $${lcd}$.`, latex: `\\frac{${lcd/d1}}{${lcd}} + \\frac{${lcd/d2}}{${lcd}}` }
            ],
            metadata: { variation_key: 'add_diff_denom', difficulty: 3 }
        };
    }

    // --- LEVEL 3: MIXED NUMBERS ---
    private level3_MixedNumbers(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mixed_add_same', 'mixed_add_diff', 'mixed_sub_same', 'mixed_sub_diff']);
        const isSub = v.includes('_sub');
        const isDiff = v.includes('_diff');

        // Randomized values with subtraction safety
        let w1 = MathUtils.randomInt(3, 7);
        let w2 = MathUtils.randomInt(1, 2);
        let d1 = MathUtils.randomChoice([2, 3, 4, 5]);
        let d2 = isDiff ? MathUtils.randomChoice([2, 3, 4, 5].filter(x => x !== d1)) : d1;
        let n1 = MathUtils.randomInt(1, d1 - 1);
        let n2 = MathUtils.randomInt(1, d2 - 1);

        // Logic check: Ensure answer > 0 and Whole number > 0
        const val1 = w1 + n1 / d1;
        const val2 = w2 + n2 / d2;
        if (isSub && (val1 - val2 < 1)) return this.level3_MixedNumbers(lang, v);

        // Step 1: Improper conversions
        const imp1N = w1 * d1 + n1;
        const imp2N = w2 * d2 + n2;

        // Step 2: Common Denominator
        const commonD = this.lcm(d1, d2);
        const k1 = commonD / d1;
        const k2 = commonD / d2;
        const adjN1 = imp1N * k1;
        const adjN2 = imp2N * k2;

        // Step 3: Operation
        const resN = isSub ? adjN1 - adjN2 : adjN1 + adjN2;
        const finalW = Math.floor(resN / commonD);
        const finalN = resN % commonD;
        const finalAns = finalN === 0 ? `${finalW}` : `${finalW} ${finalN}/${commonD}`;

        const opSym = isSub ? "-" : "+";
        const opWord = isSub ? (lang === 'sv' ? "subtraktionen" : "subtraction") : (lang === 'sv' ? "additionen" : "addition");

        const steps = [
            {
                text: lang === 'sv' 
                    ? `Steg 1: Gör om det första talet till bråkform genom att beräkna $(${w1} \\cdot ${d1}) + ${n1}$.` 
                    : `Step 1: Convert the first number to an improper fraction by calculating $(${w1} \\cdot ${d1}) + ${n1}$.`,
                latex: `${w1}\\frac{${n1}}{${d1}} = \\frac{${w1} \\cdot ${d1} + ${n1}}{${d1}} = \\frac{${imp1N}}{${d1}}`
            },
            {
                text: lang === 'sv' 
                    ? `Steg 2: Gör samma sak med det andra talet genom att beräkna $(${w2} \\cdot ${d2}) + ${n2}$.` 
                    : `Step 2: Convert the second number to an improper fraction by calculating $(${w2} \\cdot ${d2}) + ${n2}$.`,
                latex: `${w2}\\frac{${n2}}{${d2}} = \\frac{${w2} \\cdot ${d2} + ${n2}}{${d2}} = \\frac{${imp2N}}{${d2}}`
            }
        ];

        if (isDiff) {
            steps.push({
                text: lang === 'sv' 
                    ? `Steg 3: Hitta gemensam nämnare ($${commonD}$). Multiplicera täljare och nämnare i båda bråken så de får samma botten.` 
                    : `Step 3: Find a common denominator ($${commonD}$). Multiply the numerator and denominator of both fractions to get the same base.`,
                latex: `\\frac{${imp1N} \\cdot ${k1}}{${d1} \\cdot ${k1}} = \\frac{${adjN1}}{${commonD}}, \\quad \\frac{${imp2N} \\cdot ${k2}}{${d2} \\cdot ${k2}} = \\frac{${adjN2}}{${commonD}}`
            });
        }

        steps.push({
            text: lang === 'sv' 
                ? `Steg ${isDiff ? '4' : '3'}: Beräkna ${isSub ? 'skillnaden' : 'summan'} och omvandla sedan tillbaka till blandad form.` 
                : `Step ${isDiff ? '4' : '3'}: Calculate the ${isSub ? 'difference' : 'sum'} and then convert back to mixed form.`,
            latex: `\\frac{${adjN1} ${opSym} ${adjN2}}{${commonD}} = \\frac{${resN}}{${commonD}} = ${finalAns}`
        });

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna ${opWord} och svara i blandad form.` : `Calculate the ${opWord} and answer in mixed form.`,
                latex: `${w1}\\frac{${n1}}{${d1}} ${opSym} ${w2}\\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(finalAns),
            clues: steps,
            metadata: { variation_key: v, difficulty: isDiff ? 4 : 3 }
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_scaling', 'mult_calc']);

        if (v === 'mult_scaling') {
            const int = MathUtils.randomChoice([10, 20, 50]);
            const fracD = MathUtils.randomChoice([2, 4, 5]);
            const ans = lang === 'sv' ? "Mindre" : "Smaller";

            return {
                renderData: {
                    description: lang === 'sv' ? `Om du multiplicerar ${int} med $\\frac{1}{${fracD}}$, blir resultatet större eller mindre än ${int}?` : `If you multiply ${int} by $\\frac{1}{${fracD}}$, will the result be larger or smaller than ${int}?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Större", "Mindre"] : ["Larger", "Smaller"]
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? `Att multiplicera med ett bråk mindre än 1 (som $\\frac{1}{${fracD}}$) är som att dela upp talet i bitar. Därför minskar värdet.` : `Multiplying by a fraction less than 1 (like $\\frac{1}{${fracD}}$) is like splitting the number into pieces. Therefore, the value decreases.` }],
                metadata: { variation_key: 'mult_scaling', difficulty: 2 }
            };
        }

        const n1 = MathUtils.randomInt(1, 3), d1 = MathUtils.randomInt(4, 6);
        const n2 = MathUtils.randomInt(1, 3), d2 = MathUtils.randomInt(4, 6);
        const simp = this.simplify(n1 * n2, d1 * d2);

        return {
            renderData: {
                description: lang === 'sv' ? "Multiplicera bråken med varandra." : "Multiply the fractions together.",
                latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [{ text: lang === 'sv' ? "Multiplicera täljarna för sig och nämnarna för sig." : "Multiply the numerators together and the denominators together.", latex: `\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}}` }],
            metadata: { variation_key: 'mult_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['div_reciprocal', 'div_calc']);

        if (v === 'div_reciprocal') {
            const n = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(6, 9);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket bråk är det inverterade talet (reciproka värdet) till bråket nedan?` : `Which fraction is the reciprocal of the fraction below?`,
                    latex: `\\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${d}/${n}`),
                clues: [{ text: lang === 'sv' ? "För att invertera ett bråk byter du helt enkelt plats på siffran där uppe och siffran där nere." : "To invert a fraction, you simply swap the top number and the bottom number." }],
                metadata: { variation_key: 'div_reciprocal', difficulty: 2 }
            };
        }

        const d1 = MathUtils.randomInt(3, 8), d2 = MathUtils.randomInt(2, 4);
        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna kvoten genom att multiplicera med det inverterade bråket." : "Calculate the quotient by multiplying with the reciprocal.",
                latex: `\\frac{1}{${d1}} \\div \\frac{1}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${d2}/${d1}`),
            clues: [{ text: lang === 'sv' ? "Vänd på det andra bråket och ändra divisionen till multiplikation." : "Flip the second fraction and change the division to multiplication.", latex: `\\frac{1}{${d1}} \\cdot \\frac{${d2}}{1}` }],
            metadata: { variation_key: 'div_calc', difficulty: 3 }
        };
    }
}