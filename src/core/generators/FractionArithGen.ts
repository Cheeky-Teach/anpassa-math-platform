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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    private lcm(a: number, b: number): number {
        return (a * b) / this.gcd(a, b);
    }

    private simplify(n: number, d: number): { n: number, d: number } {
        const div = this.gcd(n, d);
        return { n: n / div, d: d / div };
    }

    // Level 1: Same Denominators (+/-)
    private level1_SameDenom(lang: string): any {
        const op = MathUtils.randomChoice(['+', '-']);
        const den = MathUtils.randomInt(3, 20); // Expanded range
        
        let n1 = MathUtils.randomInt(1, den - 1);
        let n2 = MathUtils.randomInt(1, den - 1);
        
        // Prevent zero result and negatives
        if (op === '-') {
            if (n1 === n2) n2 = Math.max(1, n1 - 1); // Force diff
            if (n1 < n2) [n1, n2] = [n2, n1];
        }

        const resN = op === '+' ? n1 + n2 : n1 - n2;
        const resD = den;
        const simp = this.simplify(resN, resD);

        const desc = lang === 'sv' ? "Beräkna:" : "Calculate:";

        return {
            renderData: {
                description: desc,
                latex: `\\frac{${n1}}{${den}} ${op} \\frac{${n2}}{${den}}`,
                answerType: 'fraction', // Triggers n/d input
                geometry: null
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [
                { 
                    text: lang === 'sv' ? "Nämnarna (botten) är lika. Addera/subtrahera bara täljarna." : "Denominators are the same. Just add/subtract the numerators.",
                    latex: `\\frac{${n1} ${op} ${n2}}{${den}} = \\frac{${resN}}{${resD}}`
                },
                {
                    text: lang === 'sv' ? "Svara i enklaste form." : "Answer in simplest form.",
                    latex: `\\frac{${simp.n}}{${simp.d}}`
                }
            ]
        };
    }

    // Level 2: Different Denominators (+/-)
    private level2_DiffDenom(lang: string): any {
        const op = MathUtils.randomChoice(['+', '-']);
        const scenario = MathUtils.randomChoice(['fit', 'coprime', 'general']);
        
        let d1=0, d2=0;
        if (scenario === 'fit') {
            d1 = MathUtils.randomInt(2, 8);
            d2 = d1 * MathUtils.randomInt(2, 4);
        } else if (scenario === 'coprime') {
            d1 = MathUtils.randomInt(2, 7);
            d2 = d1 + 1; 
        } else {
            d1 = MathUtils.randomInt(3, 10);
            d2 = MathUtils.randomInt(3, 10);
            if (d1 === d2) d2++;
        }
        
        let n1 = MathUtils.randomInt(1, d1-1);
        let n2 = MathUtils.randomInt(1, d2-1);

        const commonD = this.lcm(d1, d2);
        const extN1 = n1 * (commonD/d1);
        const extN2 = n2 * (commonD/d2);
        
        // Prevent zero and negative
        if (op === '-') {
            if (extN1 === extN2) {
                // Adjust n1 to be larger
                n1 = Math.min(d1-1, n1+1); 
                // Recalc extension
            }
            // Swap if needed
            if (n1/d1 < n2/d2) {
                [n1, n2] = [n2, n1];
                [d1, d2] = [d2, d1];
            }
        }

        // Recalculate finals after potential swap/adjust
        const finalCommonD = this.lcm(d1, d2);
        const fExtN1 = n1 * (finalCommonD/d1);
        const fExtN2 = n2 * (finalCommonD/d2);
        
        const resN = op === '+' ? fExtN1 + fExtN2 : fExtN1 - fExtN2;
        if (resN === 0) return this.level2_DiffDenom(lang); // Reroll if still zero

        const simp = this.simplify(resN, finalCommonD);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna (Minsta gemensamma nämnare):" : "Calculate (Lowest Common Denominator):",
                latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}`,
                answerType: 'fraction',
                geometry: null
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [
                { 
                    text: lang === 'sv' ? `Hitta gemensam nämnare (MGN) för ${d1} och ${d2}.` : `Find common denominator (LCD) for ${d1} and ${d2}.`,
                    latex: `\\text{MGN} = ${finalCommonD}`
                },
                { 
                    text: lang === 'sv' ? "Förläng bråken." : "Extend the fractions.",
                    latex: `\\frac{${fExtN1}}{${finalCommonD}} ${op} \\frac{${fExtN2}}{${finalCommonD}}`
                },
                {
                    latex: `\\frac{${resN}}{${finalCommonD}} = \\frac{${simp.n}}{${simp.d}}`
                }
            ]
        };
    }

    // Level 3: Mixed Numbers (+/-)
    private level3_MixedNumbers(lang: string): any {
        const op = MathUtils.randomChoice(['+', '-']);
        
        // Generate two mixed numbers: A b/c
        const w1 = MathUtils.randomInt(1, 3);
        const d1 = MathUtils.randomInt(2, 6);
        const n1 = MathUtils.randomInt(1, d1 - 1);
        
        const w2 = MathUtils.randomInt(1, 2);
        const d2 = MathUtils.randomInt(2, 6);
        const n2 = MathUtils.randomInt(1, d2 - 1);

        // Convert to improper for calculation
        const impN1 = w1 * d1 + n1;
        const impN2 = w2 * d2 + n2; // d2 stays d2
        
        // Find LCM
        const commonD = this.lcm(d1, d2);
        const extN1 = impN1 * (commonD / d1);
        const extN2 = impN2 * (commonD / d2);
        
        // Handle Subtraction Constraints
        let finalN1 = extN1, finalN2 = extN2;
        let dispW1 = w1, dispN1 = n1, dispD1 = d1;
        let dispW2 = w2, dispN2 = n2, dispD2 = d2;

        if (op === '-') {
            if (extN1 <= extN2) {
                // Swap purely for the display variables and calculation
                // It's easier to just swap the whole objects
                [dispW1, dispW2] = [w2, w1];
                [dispN1, dispN2] = [n2, n1];
                [dispD1, dispD2] = [d2, d1];
                [finalN1, finalN2] = [extN2, extN1];
            }
        }

        const resNum = op === '+' ? finalN1 + finalN2 : finalN1 - finalN2;
        
        // Calculate result in mixed form
        const simp = this.simplify(resNum, commonD);
        const resWhole = Math.floor(simp.n / simp.d);
        const resRem = simp.n % simp.d;
        
        // Answer string logic: "1 1/2" or just "3/2" depending on preference.
        // Prompt asked for mixed form input.
        const tokenStr = resRem === 0 
            ? `${resWhole}` 
            : (resWhole > 0 ? `${resWhole} ${resRem}/${simp.d}` : `${resRem}/${simp.d}`);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna. Svara i blandad form." : "Calculate. Answer as a mixed number.",
                latex: `${dispW1} \\frac{${dispN1}}{${dispD1}} ${op} ${dispW2} \\frac{${dispN2}}{${dispD2}}`,
                answerType: 'mixed_fraction', // Fix: Triggers the 3-box input
                geometry: null
            },
            token: this.toBase64(tokenStr),
            clues: [
                { 
                    text: lang === 'sv' ? "Gör om till bråkform (improper) först." : "Convert to improper fractions first.",
                    latex: `\\frac{${finalN1}}{${commonD}} ${op} \\frac{${finalN2}}{${commonD}}`
                },
                {
                    text: lang === 'sv' ? "Beräkna och gör om till blandad form." : "Calculate and convert back to mixed number.",
                    latex: `${resWhole} \\frac{${resRem}}{${simp.d}}`
                }
            ]
        };
    }

    // Level 4: Multiplication
    private level4_Multiplication(lang: string): any {
        const isInteger = MathUtils.randomInt(0, 1) === 1;
        
        if (isInteger) {
            const int = MathUtils.randomInt(2, 8);
            const n = MathUtils.randomInt(1, 4);
            const d = MathUtils.randomInt(n + 1, 10);
            
            const resN = int * n;
            const simp = this.simplify(resN, d);
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `${int} \\cdot \\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${simp.n}/${simp.d}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Heltalet multipliceras bara med täljaren." : "The whole number multiplies only with the numerator.",
                        latex: `\\frac{${int} \\cdot ${n}}{${d}} = \\frac{${resN}}{${d}}`
                    }
                ]
            };
        } else {
            const n1 = MathUtils.randomInt(1, 6);
            const d1 = MathUtils.randomInt(n1 + 1, 10);
            const n2 = MathUtils.randomInt(1, 6);
            const d2 = MathUtils.randomInt(n2 + 1, 10);
            
            const resN = n1 * n2;
            const resD = d1 * d2;
            const simp = this.simplify(resN, resD);

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${simp.n}/${simp.d}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Multiplicera täljare med täljare, nämnare med nämnare." : "Top times top, bottom times bottom.",
                        latex: `\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}} = \\frac{${resN}}{${resD}}`
                    }
                ]
            };
        }
    }

    // Level 5: Division
    private level5_Division(lang: string): any {
        const n1 = MathUtils.randomInt(1, 5);
        const d1 = MathUtils.randomInt(n1 + 1, 8);
        const n2 = MathUtils.randomInt(1, 5);
        const d2 = MathUtils.randomInt(n2 + 1, 8);
        
        // n1/d1 divided by n2/d2 -> n1/d1 * d2/n2
        const resN = n1 * d2;
        const resD = d1 * n2;
        const simp = this.simplify(resN, resD);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                latex: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [
                { 
                    text: lang === 'sv' ? "Invertera det andra bråket och byt till gånger." : "Invert the second fraction and switch to multiply.",
                    latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${d2}}{${n2}}`
                },
                {
                    latex: `\\frac{${resN}}{${resD}}`
                }
            ]
        };
    }
}