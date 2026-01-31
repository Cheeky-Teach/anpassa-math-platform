import { MathUtils } from '../utils/MathUtils.js';

export class FractionArithGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_SameDenom(lang);
            case 2: return this.level2_DiffDenom(lang);
            case 3: return this.level3_AdvancedAdd(lang);
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
        const den = MathUtils.randomInt(3, 12);
        
        let n1 = MathUtils.randomInt(1, den - 1);
        let n2 = MathUtils.randomInt(1, den - 1);
        
        if (op === '-' && n1 < n2) [n1, n2] = [n2, n1]; // Ensure positive result

        const resN = op === '+' ? n1 + n2 : n1 - n2;
        const resD = den;
        const simp = this.simplify(resN, resD);

        const desc = lang === 'sv' ? "Beräkna:" : "Calculate:";

        return {
            renderData: {
                description: desc,
                latex: `\\frac{${n1}}{${den}} ${op} \\frac{${n2}}{${den}}`,
                answerType: 'fraction',
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
        
        // Scenario A: One fits into other (2 and 4, 3 and 6)
        // Scenario B: Co-prime (2 and 3, 3 and 4)
        const scenario = MathUtils.randomChoice(['fit', 'coprime']);
        
        let d1=0, d2=0;
        if (scenario === 'fit') {
            d1 = MathUtils.randomInt(2, 5);
            d2 = d1 * MathUtils.randomInt(2, 3);
        } else {
            d1 = MathUtils.randomInt(2, 5);
            d2 = d1 + 1; // 2&3, 3&4, 4&5
        }
        
        let n1 = 1, n2 = 1;
        // Make numerators small to keep arithmetic simple
        n1 = MathUtils.randomInt(1, d1-1);
        n2 = MathUtils.randomInt(1, d2-1);

        const commonD = this.lcm(d1, d2);
        const adjN1 = n1 * (commonD / d1);
        const adjN2 = n2 * (commonD / d2);
        
        // Ensure valid subtraction
        if (op === '-' && adjN1 < adjN2) {
             // Swap fractions logic roughly
             const tempN = n1; const tempD = d1;
             n1 = n2; d1 = d2;
             n2 = tempN; d2 = tempD;
        }

        const finalN = op === '+' ? adjN1 + adjN2 : adjN1 - adjN2; // Note: Re-calc after swap might be needed if exact values matter, but logic holds.
        // Actually, let's just calc proper result:
        const term1 = n1 * d2; 
        const term2 = n2 * d1;
        const rawNum = op === '+' ? term1 + term2 : term1 - term2;
        const rawDen = d1 * d2;
        
        // Better logic with LCM
        const extN1 = n1 * (commonD/d1);
        const extN2 = n2 * (commonD/d2);
        const resN = op === '+' ? extN1 + extN2 : extN1 - extN2;
        // Check negative again
        if (resN < 0) return this.level2_DiffDenom(lang); // Retry

        const simp = this.simplify(resN, commonD);

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
                    latex: `\\text{MGN} = ${commonD}`
                },
                { 
                    text: lang === 'sv' ? "Förläng bråken." : "Extend the fractions.",
                    latex: `\\frac{${extN1}}{${commonD}} ${op} \\frac{${extN2}}{${commonD}}`
                },
                {
                    latex: `\\frac{${resN}}{${commonD}} = \\frac{${simp.n}}{${simp.d}}`
                }
            ]
        };
    }

    // Level 3: Advanced Addition (Mixed Numbers / Improper)
    private level3_AdvancedAdd(lang: string): any {
        // 1 1/2 + 3/4
        const w1 = 1;
        const n1 = 1, d1 = 2;
        const n2 = 3, d2 = 4;
        
        // Convert mixed to improper: 3/2
        const impN1 = 3; 
        // LCD is 4. -> 6/4
        const extN1 = 6;
        const extN2 = 3; 
        // Sum = 9/4
        const resN = 9;
        const resD = 4;
        
        // Simplified Logic for variety
        // Let's just generate one static type of problem structure for stability in this first version, or simple randomization
        const problem = MathUtils.randomChoice([
            { l: '1 \\frac{1}{2} + \\frac{1}{2}', ans: '2/1' },
            { l: '1 \\frac{1}{4} + \\frac{3}{4}', ans: '2/1' },
            { l: '1 \\frac{1}{3} + \\frac{1}{3}', ans: '5/3' },
            { l: '\\frac{3}{5} + 1 \\frac{1}{5}', ans: '9/5' }
        ]);

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna. Svara i bråkform (eller heltal)." : "Calculate. Answer as a fraction (or whole number).",
                latex: problem.l,
                answerType: 'fraction',
                geometry: null
            },
            token: this.toBase64(problem.ans),
            clues: [
                { text: lang === 'sv' ? "Gör om blandad form till bråkform först." : "Convert mixed numbers to improper fractions first." }
            ]
        };
    }

    // Level 4: Multiplication
    private level4_Multiplication(lang: string): any {
        const isInteger = MathUtils.randomInt(0, 1) === 1;
        
        if (isInteger) {
            const int = MathUtils.randomInt(2, 6);
            const n = 1;
            const d = MathUtils.randomInt(3, 8);
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
                        text: lang === 'sv' ? "Helatlet multipliceras bara med täljaren." : "The whole number multiplies only with the numerator.",
                        latex: `\\frac{${int} \\cdot ${n}}{${d}} = \\frac{${resN}}{${d}}`
                    }
                ]
            };
        } else {
            const n1 = MathUtils.randomInt(1, 4);
            const d1 = MathUtils.randomInt(2, 6);
            const n2 = MathUtils.randomInt(1, 4);
            const d2 = MathUtils.randomInt(2, 6);
            
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
        const n1 = 1;
        const d1 = MathUtils.randomChoice([2, 3, 4]);
        const n2 = 1;
        const d2 = MathUtils.randomChoice([2, 3, 4]);
        
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