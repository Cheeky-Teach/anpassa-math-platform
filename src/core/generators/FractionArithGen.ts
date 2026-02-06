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

    // --- INTERNAL HELPERS ---
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
    private level1_SameDenom(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Concept Check (True/False)
        if (variation < 0.25) {
            const d = MathUtils.randomInt(4, 9);
            const n1 = 1;
            const n2 = MathUtils.randomInt(1, d - 2);
            const sum = n1 + n2;
            
            const correctEq = `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = \\frac{${sum}}{${d}}`;
            const wrongEq = `\\frac{${n1}}{${d}} + \\frac{${n2}}{${d}} = \\frac{${sum}}{${d*2}}`; // The Lie
            
            const q = lang==='sv' ? "Vilken uträkning är rätt?" : "Which calculation is correct?";
            const optCorrect = lang==='sv' ? "Alternativ A" : "Option A";
            const optWrong = lang==='sv' ? "Alternativ B" : "Option B";

            return {
                renderData: {
                    description: q,
                    latex: `A: ${correctEq} \\quad B: ${wrongEq}`,
                    answerType: 'multiple_choice',
                    options: [optCorrect, optWrong]
                },
                token: this.toBase64(optCorrect),
                clues: [
                    { text: lang==='sv' ? "Nämnaren ändras inte vid addition." : "Denominator does not change in addition.", latex: "" }
                ]
            };
        }

        // VARIATION B: Missing Term (Algebraic)
        if (variation < 0.5) {
            const d = MathUtils.randomInt(5, 12);
            const n1 = MathUtils.randomInt(1, d - 2);
            const nMissing = MathUtils.randomInt(1, d - n1 - 1);
            const nTotal = n1 + nMissing;

            return {
                renderData: {
                    description: lang==='sv' ? "Vad ska stå i rutan?" : "What goes in the box?",
                    latex: `\\frac{${n1}}{${d}} + \\frac{?}{${d}} = \\frac{${nTotal}}{${d}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(nMissing.toString()),
                clues: [
                    { text: lang==='sv' ? "Täljarna måste bli summan." : "Numerators must sum up.", latex: `${n1} + ? = ${nTotal}` }
                ]
            };
        }

        // VARIATION C: Standard Calculation
        const den = MathUtils.randomInt(4, 15);
        const n1 = MathUtils.randomInt(1, den-2);
        const n2 = MathUtils.randomInt(1, den - n1 - 1) || 1;
        const sumN = n1 + n2;
        const simp = this.simplify(sumN, den);

        return {
            renderData: {
                description: lang==='sv' ? "Beräkna:" : "Calculate:",
                latex: `\\frac{${n1}}{${den}} + \\frac{${n2}}{${den}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [{ text: "Add numerators only", latex: `${n1}+${n2}` }]
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Find LCD Only
        if (variation < 0.3) {
            // Generate pairs with interesting LCMs (not just products)
            const d1 = MathUtils.randomChoice([4, 6, 8, 9, 10]);
            const d2 = MathUtils.randomChoice([2, 3, 5, 12]);
            
            // Ensure distinct
            if (d1 === d2) return this.level2_DiffDenom(lang);

            const lcd = this.lcm(d1, d2);

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Vad är minsta gemensamma nämnare (MGN) för 1/${d1} och 1/${d2}?` 
                        : `What is the Lowest Common Denominator (LCD) for 1/${d1} and 1/${d2}?`,
                    latex: `\\frac{1}{${d1}} + \\frac{1}{${d2}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(lcd.toString()),
                clues: [
                    { text: lang==='sv' ? "Hitta multiplar..." : "Find multiples...", latex: "" }
                ]
            };
        }

        // VARIATION B: Spot the Error
        if (variation < 0.6) {
            const stmtCorrect = lang==='sv' ? "Rätt" : "Correct";
            const stmtWrong = lang==='sv' ? "Fel" : "Wrong";
            
            // Generate a random erroneous equation
            const n1=1, n2=1;
            const d1 = MathUtils.randomInt(2, 5);
            const d2 = MathUtils.randomInt(d1+1, 8);
            
            return {
                renderData: {
                    description: lang==='sv' ? "Är denna uträkning rätt?" : "Is this calculation correct?",
                    latex: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}} = \\frac{${n1+n2}}{${d1+d2}}`,
                    answerType: 'multiple_choice',
                    options: [stmtCorrect, stmtWrong]
                },
                token: this.toBase64(stmtWrong),
                clues: [
                    { text: lang==='sv' ? "Man får aldrig addera nämnare." : "You can never add denominators.", latex: "" }
                ]
            };
        }

        // VARIATION C: Standard Calculation
        const d1 = MathUtils.randomInt(2, 6);
        const d2 = MathUtils.randomInt(2, 6);
        // Ensure differents to force LCD logic
        if (d1 === d2) return this.level2_DiffDenom(lang);

        const n1 = 1;
        const n2 = 1; 

        // Calc
        const lcd = this.lcm(d1, d2);
        const newN1 = n1 * (lcd/d1);
        const newN2 = n2 * (lcd/d2);
        const resN = newN1 + newN2;
        const simp = this.simplify(resN, lcd);

        return {
            renderData: {
                description: lang==='sv' ? "Beräkna:" : "Calculate:",
                latex: `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [{latex: `\\frac{${newN1}}{${lcd}} + \\frac{${newN2}}{${lcd}}`}]
        };
    }

    // --- LEVEL 3: MIXED NUMBERS ---
    private level3_MixedNumbers(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Estimation
        if (variation < 0.3) {
            const w1 = MathUtils.randomInt(1, 3);
            const w2 = MathUtils.randomInt(1, 3);
            const threshold = w1 + w2 + 1;
            
            const ansYes = lang==='sv'?'Ja':'Yes';
            const ansNo = lang==='sv'?'Nej':'No';
            
            return {
                renderData: {
                    description: lang==='sv' ? `Är summan större än ${threshold}?` : `Is the sum greater than ${threshold}?`,
                    latex: `${w1}\\frac{3}{4} + ${w2}\\frac{3}{4}`,
                    answerType: 'multiple_choice',
                    options: [ansYes, ansNo]
                },
                token: this.toBase64(ansYes),
                clues: [
                    { text: `${w1} + ${w2} = ${w1+w2}`, latex: "" },
                    { text: "3/4 + 3/4 = 6/4 > 1", latex: "" }
                ]
            };
        }

        // VARIATION B: Standard Calc
        const w1 = MathUtils.randomInt(1, 3);
        const w2 = MathUtils.randomInt(1, 3);
        const d = MathUtils.randomInt(3, 6);
        const n = 1;
        
        // n/d + n/d = 2n/d. If 2n < d, no carry. If 2n >= d, carry.
        const resW = w1 + w2;
        const resN = n + n;
        
        return {
            renderData: {
                description: lang==='sv' ? "Beräkna:" : "Calculate:",
                latex: `${w1}\\frac{${n}}{${d}} + ${w2}\\frac{${n}}{${d}}`,
                answerType: 'mixed_fraction'
            },
            token: this.toBase64(`${resW} ${resN}/${d}`),
            clues: [{latex: `${w1}+${w2} = ${resW}, ${n}/${d}+${n}/${d}=${resN}/${d}`}]
        };
    }

    // --- LEVEL 4: MULTIPLICATION ---
    private level4_Multiplication(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Scaling Logic
        if (variation < 0.3) {
            const int = MathUtils.randomChoice([10, 20, 50, 100]);
            const fracD = MathUtils.randomChoice([2, 4, 5, 10]);
            
            const q = lang==='sv' 
                ? `Om du multiplicerar ${int} med 1/${fracD}, blir talet större eller mindre än ${int}?` 
                : `If you multiply ${int} by 1/${fracD}, does the number get bigger or smaller than ${int}?`;
            const optSmall = lang==='sv' ? "Mindre" : "Smaller";
            const optBig = lang==='sv' ? "Större" : "Bigger";

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: [optSmall, optBig]
                },
                token: this.toBase64(optSmall),
                clues: [{ text: `1/${fracD} < 1`, latex: "" }]
            };
        }

        // VARIATION B: Area Concept
        if (variation < 0.6) {
            const d1 = MathUtils.randomInt(2, 4);
            const d2 = MathUtils.randomInt(2, 5);
            
            const areaD = d1 * d2;

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `En rektangel har sidorna 1/${d1} m och 1/${d2} m. Vad är arean?` 
                        : `A rectangle has sides 1/${d1} m and 1/${d2} m. What is the area?`,
                    latex: "",
                    answerType: 'fraction',
                    suffix: 'm²'
                },
                token: this.toBase64(`1/${areaD}`),
                clues: [{text: "Area = base · height", latex: `\\frac{1}{${d1}} \\cdot \\frac{1}{${d2}}`}]
            };
        }

        // VARIATION C: Standard
        const n1 = MathUtils.randomInt(1, 4);
        const d1 = MathUtils.randomInt(n1+1, 6);
        const n2 = MathUtils.randomInt(1, 4);
        const d2 = MathUtils.randomInt(n2+1, 6);

        const resN = n1*n2;
        const resD = d1*d2;
        const simp = this.simplify(resN, resD);

        return {
            renderData: { description: "Calculate:", latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${simp.n}/${simp.d}`),
            clues: [{latex: `${n1}\\cdot${n2} / ${d1}\\cdot${d2}`}]
        };
    }

    // --- LEVEL 5: DIVISION ---
    private level5_Division(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Missing Operator
        if (variation < 0.3) {
            const opMult = "×";
            const opDiv = "÷";
            const opAdd = "+";
            
            const frac = "1/2"; // Keep simple for operator logic

            return {
                renderData: {
                    description: lang==='sv' ? "Vilket tecken saknas?" : "Which sign is missing?",
                    latex: `${frac} \\text{ [ ? ] } ${frac} = 1`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([opMult, opDiv, opAdd])
                },
                token: this.toBase64(opDiv),
                clues: [
                    { text: lang==='sv' ? "Ett tal delat med sig själv är alltid 1." : "A number divided by itself is always 1.", latex: "" }
                ]
            };
        }

        // VARIATION B: Reciprocal
        if (variation < 0.6) {
            const n = MathUtils.randomInt(2, 5);
            const d = MathUtils.randomInt(n+1, 9);
            return {
                renderData: {
                    description: lang==='sv' ? "Vad är inversen (reciprokalen) till:" : "What is the reciprocal of:",
                    latex: `\\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${d}/${n}`),
                clues: [{text: lang==='sv'?"Vänd upp och ner på bråket.":"Flip the fraction.", latex:""}]
            };
        }

        // VARIATION C: Standard
        const n = 1;
        const d1 = MathUtils.randomInt(3, 6);
        const d2 = 2; // Keep simple 1/2 division usually

        return {
            renderData: { description: "Calculate:", latex: `\\frac{1}{${d1}} \\div \\frac{1}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${d2}/${d1}`),
            clues: [{text: "Flip second and multiply", latex: `\\frac{1}{${d1}} \\cdot \\frac{${d2}}{1}`}]
        };
    }
}