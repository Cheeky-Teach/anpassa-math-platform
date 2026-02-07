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
            
            // Randomize position of correct equation
            const isCorrectA = Math.random() > 0.5;
            const latexA = isCorrectA ? correctEq : wrongEq;
            const latexB = isCorrectA ? wrongEq : correctEq;
            
            const q = lang==='sv' ? "Vilken uträkning är rätt?" : "Which calculation is correct?";
            const optCorrect = isCorrectA 
                ? (lang==='sv' ? "Alternativ A" : "Option A")
                : (lang==='sv' ? "Alternativ B" : "Option B");
            
            const optWrong = isCorrectA
                ? (lang==='sv' ? "Alternativ B" : "Option B")
                : (lang==='sv' ? "Alternativ A" : "Option A");

            return {
                renderData: {
                    description: q,
                    latex: `A: ${latexA} \\quad B: ${latexB}`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([optCorrect, optWrong]) // Shuffle options list too, though logic handles correctness
                },
                token: this.toBase64(optCorrect),
                clues: [
                    { 
                        text: lang==='sv' ? "När man adderar bråk med samma nämnare, ändras INTE nämnaren." : "When adding fractions with the same denominator, the denominator does NOT change.", 
                        latex: "" 
                    }
                ],
                metadata: { variation: 'add_concept', difficulty: 1 }
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
                    { 
                        text: lang==='sv' ? "Täljarna måste bli summan. Vad plus ${n1} blir ${nTotal}?" : "Numerators must sum up. What plus ${n1} equals ${nTotal}?", 
                        latex: `${n1} + ? = ${nTotal}` 
                    }
                ],
                metadata: { variation: 'add_missing', difficulty: 2 }
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
            clues: [
                { 
                    text: lang === 'sv' ? "Addera bara täljarna. Behåll nämnaren." : "Add only the numerators. Keep the denominator.", 
                    latex: `${n1}+${n2}` 
                }
            ],
            metadata: { variation: 'add_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: DIFFERENT DENOMINATORS ---
    private level2_DiffDenom(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Find LCD Only
        if (variation < 0.3) {
            const d1 = MathUtils.randomChoice([4, 6, 8, 9, 10]);
            const d2 = MathUtils.randomChoice([2, 3, 5, 12]);
            
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
                    { 
                        text: lang==='sv' ? "Hitta multiplar för båda talen. Vilket är det minsta talet som finns i båda listorna?" : "Find multiples for both numbers. What is the smallest number present in both lists?", 
                        latex: "" 
                    }
                ],
                metadata: { variation: 'lcd_find', difficulty: 2 }
            };
        }

        // VARIATION B: Spot the Error
        if (variation < 0.6) {
            const stmtCorrect = lang==='sv' ? "Rätt" : "Correct";
            const stmtWrong = lang==='sv' ? "Fel" : "Wrong";
            
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
                    { 
                        text: lang==='sv' ? "Man får aldrig addera nämnare direkt. Man måste hitta gemensam nämnare först." : "You can never add denominators directly. You must find a common denominator first.", 
                        latex: "" 
                    }
                ],
                metadata: { variation: 'add_error_spot', difficulty: 2 }
            };
        }

        // VARIATION C: Standard Calculation
        const d1 = MathUtils.randomInt(2, 6);
        const d2 = MathUtils.randomInt(2, 6);
        if (d1 === d2) return this.level2_DiffDenom(lang);

        const n1 = 1;
        const n2 = 1; 

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
            clues: [
                { 
                    text: lang === 'sv' ? "Gör om till gemensam nämnare." : "Convert to common denominator.", 
                    latex: `\\frac{${newN1}}{${lcd}} + \\frac{${newN2}}{${lcd}}` 
                }
            ],
            metadata: { variation: 'add_diff_denom', difficulty: 3 }
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
                ],
                metadata: { variation: 'mixed_est', difficulty: 3 }
            };
        }

        // VARIATION B: Standard Calc
        const w1 = MathUtils.randomInt(1, 3);
        const w2 = MathUtils.randomInt(1, 3);
        const d = MathUtils.randomInt(3, 6);
        const n = 1;
        
        const resW = w1 + w2;
        const resN = n + n;
        
        return {
            renderData: {
                description: lang==='sv' ? "Beräkna:" : "Calculate:",
                latex: `${w1}\\frac{${n}}{${d}} + ${w2}\\frac{${n}}{${d}}`,
                answerType: 'mixed_fraction'
            },
            token: this.toBase64(`${resW} ${resN}/${d}`),
            clues: [
                { 
                    text: lang === 'sv' ? "Addera heltalen först, sedan bråken." : "Add the whole numbers first, then the fractions.", 
                    latex: `${w1}+${w2} = ${resW}, \\quad \\frac{${n}}{${d}}+\\frac{${n}}{${d}}=\\frac{${resN}}{${d}}` 
                }
            ],
            metadata: { variation: 'mixed_calc', difficulty: 3 }
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
                clues: [
                    { text: lang==='sv' ? "Att multiplicera med ett bråk mindre än 1 gör talet mindre." : "Multiplying by a fraction less than 1 makes the number smaller.", latex: `1/${fracD} < 1` }
                ],
                metadata: { variation: 'mult_scaling', difficulty: 2 }
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
                clues: [
                    { 
                        text: lang === 'sv' ? "Area är basen gånger höjden." : "Area is base times height.", 
                        latex: `\\frac{1}{${d1}} \\cdot \\frac{1}{${d2}}` 
                    }
                ],
                metadata: { variation: 'mult_area', difficulty: 3 }
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
            clues: [
                { 
                    text: lang === 'sv' ? "Multiplicera täljare med täljare, nämnare med nämnare." : "Multiply top with top, bottom with bottom.", 
                    latex: `\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}}` 
                }
            ],
            metadata: { variation: 'mult_calc', difficulty: 3 }
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
            
            const frac = "1/2"; 

            return {
                renderData: {
                    description: lang==='sv' ? "Vilket tecken saknas?" : "Which sign is missing?",
                    latex: `${frac} \\text{ [ ? ] } ${frac} = 1`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([opMult, opDiv, opAdd])
                },
                token: this.toBase64(opDiv),
                clues: [
                    { 
                        text: lang==='sv' ? "Ett tal delat med sig själv är alltid 1." : "A number divided by itself is always 1.", 
                        latex: "" 
                    }
                ],
                metadata: { variation: 'div_operator', difficulty: 2 }
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
                clues: [
                    { text: lang==='sv'?"Vänd upp och ner på bråket.":"Flip the fraction.", latex:"" }
                ],
                metadata: { variation: 'div_reciprocal', difficulty: 2 }
            };
        }

        // VARIATION C: Standard
        const d1 = MathUtils.randomInt(3, 6);
        const d2 = 2;

        return {
            renderData: { description: "Calculate:", latex: `\\frac{1}{${d1}} \\div \\frac{1}{${d2}}`, answerType: 'fraction' },
            token: this.toBase64(`${d2}/${d1}`),
            clues: [
                { 
                    text: lang === 'sv' ? "Vänd på det andra bråket och multiplicera." : "Flip the second fraction and multiply.", 
                    latex: `\\frac{1}{${d1}} \\cdot \\frac{${d2}}{1}` 
                }
            ],
            metadata: { variation: 'div_calc', difficulty: 3 }
        };
    }
}