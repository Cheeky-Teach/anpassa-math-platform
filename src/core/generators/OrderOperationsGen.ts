import { MathUtils } from '../utils/MathUtils.js';

export class OrderOperationsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Basic(lang);
            case 2: return this.level2_Parentheses(lang);
            case 3: return this.level3_Complex(lang);
            case 4: return this.level4_Powers(lang);
            default: return this.level1_Basic(lang);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'order_basic': return this.level1_Basic(lang);
            case 'order_paren': return this.level2_Parentheses(lang);
            case 'order_fraction': return this.level3_Complex(lang);
            case 'order_powers': return this.level4_Powers(lang);
            default: return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: 3 Terms, 2 Ops (No Parentheses) ---
    private level1_Basic(lang: string): any {
        const useMult = Math.random() > 0.5;
        const isMDFirst = Math.random() > 0.5;
        const usePlus = Math.random() > 0.5;

        let a, b, c, result, latex, clues = [];

        if (useMult) {
            a = MathUtils.randomInt(2, 6);
            b = MathUtils.randomInt(2, 8);
            c = MathUtils.randomInt(1, 10);
            const product = a * b;

            if (isMDFirst) {
                result = usePlus ? product + c : product - c;
                if (result <= 0) { c = product - 1; result = 1; }
                latex = `${a} \\cdot ${b} ${usePlus ? '+' : '-'} ${c}`;
                clues = [
                    { 
                        sv: `Multiplikation går före ${usePlus ? 'addition' : 'subtraktion'}. Räkna ut ${a} $\\cdot$ ${b} först.`, 
                        en: `Multiplication comes before ${usePlus ? 'addition' : 'subtraction'}. Calculate ${a} $\\cdot$ ${b} first.`,
                        step: `${a} \\cdot ${b} = ${product}`
                    },
                    { 
                        sv: `Nu kan du ${usePlus ? 'addera' : 'subtrahera'} ${c}.`, 
                        en: `Now you can ${usePlus ? 'add' : 'subtract'} ${c}.`,
                        step: `${product} ${usePlus ? '+' : '-'} ${c} = ${result}`
                    }
                ];
            } else {
                result = usePlus ? c + product : c - product;
                if (result <= 0) { c = product + MathUtils.randomInt(1, 5); result = c - product; }
                latex = `${c} ${usePlus ? '+' : '-'} ${a} \\cdot ${b}`;
                clues = [
                    { 
                        sv: `Även om multiplikationen står sist så ska den räknas först. Räkna ut ${a} $\\cdot$ ${b}.`, 
                        en: `Even if the multiplication is last, it must be calculated first. Solve ${a} $\\cdot$ ${b}.`,
                        step: `${a} \\cdot ${b} = ${product}`
                    },
                    { 
                        sv: `Nu har vi: ${c} ${usePlus ? '+' : '-'} ${product}.`, 
                        en: `Now we have: ${c} ${usePlus ? '+' : '-'} ${product}.`,
                        step: `${c} ${usePlus ? '+' : '-'} ${product} = ${result}`
                    }
                ];
            }
        } else {
            b = MathUtils.randomInt(2, 6);
            result = MathUtils.randomInt(2, 8);
            const dividend = b * result; 
            c = MathUtils.randomInt(1, 15);

            if (isMDFirst) {
                latex = `\\frac{${dividend}}{${b}} ${usePlus ? '+' : '-'} ${c}`;
                const quotient = dividend / b;
                const finalResult = usePlus ? quotient + c : quotient - c;
                result = finalResult <= 0 ? quotient + 1 : finalResult;
                if (finalResult <= 0) { c = quotient - result; }
                
                clues = [
                    { 
                        sv: `Division ska göras före ${usePlus ? 'addition' : 'subtraktion'}.`, 
                        en: `Division must be done before ${usePlus ? 'addition' : 'subtraction'}.`,
                        step: `\\frac{${dividend}}{${b}} = ${quotient}`
                    },
                    { 
                        sv: `Slutför genom att räkna ut ${quotient} ${usePlus ? '+' : '-'} ${c}.`, 
                        en: `Finish by calculating ${quotient} ${usePlus ? '+' : '-'} ${c}.`,
                        step: `${quotient} ${usePlus ? '+' : '-'} ${c} = ${result}`
                    }
                ];
            } else {
                latex = `${c} ${usePlus ? '+' : '-'} \\frac{${dividend}}{${b}}`;
                const quotient = dividend / b;
                const finalResult = usePlus ? c + quotient : c - quotient;
                result = finalResult <= 0 ? quotient + 1 : finalResult;
                if (finalResult <= 0) { c = quotient + result; }

                clues = [
                    { 
                        sv: `Prioritera divisionen före ${usePlus ? 'addition' : 'subtraktion'}.`, 
                        en: `Prioritize the division before ${usePlus ? 'addition' : 'subtraction'}.`,
                        step: `\\frac{${dividend}}{${b}} = ${quotient}`
                    },
                    { 
                        sv: `Nu räknar vi ut resten.`, 
                        en: `Now calculate the rest.`,
                        step: `${c} ${usePlus ? '+' : '-'} ${quotient} = ${result}`
                    }
                ];
            }
        }

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Beräkna" : "Calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(result.toString()),
            clues: clues.map(c => ({ text: lang === 'sv' ? c.sv : c.en, latex: c.step })),
            metadata: { variation_key: 'order_basic', difficulty: 1 }
        };
    }

    // --- LEVEL 2: 3-4 Ops with Parentheses ---
    private level2_Parentheses(lang: string): any {
        const templates = [
            (a:number, b:number, c:number, d:number) => ({ 
                latex: `(${a} + ${b}) \\cdot ${c} - ${d}`, 
                ans: (a+b)*c - d,
                clues: [
                    { sv: `Börja alltid med det som står i parentesen.`, en: `Always start with what is inside the parentheses.`, step: `${a} + ${b} = ${a+b}` },
                    { sv: `Multiplicera sedan resultatet med ${c}.`, en: `Then multiply the result by ${c}.`, step: `${a+b} \\cdot ${c} = ${(a+b)*c}` }
                ]
            }),
            (a:number, b:number, c:number, d:number) => ({ 
                latex: `${a} \\cdot (${b} - ${c}) + ${d}`, 
                ans: a*(b-c) + d,
                clues: [
                    { sv: `Räkna ut parentesen först.`, en: `Calculate the parentheses first.`, step: `${b} - ${c} = ${b-c}` },
                    { sv: `Gör sedan multiplikationen.`, en: `Then do the multiplication.`, step: `${a} \\cdot ${b-c} = ${a*(b-c)}` }
                ]
            }),
            (a:number, b:number, c:number, d:number) => ({ 
                latex: `${a} + (${b} + ${c}) \\cdot ${d}`, 
                ans: a + (b+c)*d,
                clues: [
                    { sv: `Parentesen har högsta prioritet.`, en: `Parentheses have the highest priority.`, step: `${b} + ${c} = ${b+c}` },
                    { sv: `Multiplicera innan du adderar ${a}.`, en: `Multiply before adding ${a}.`, step: `${b+c} \\cdot ${d} = ${(b+c)*d}` }
                ]
            })
        ];

        const t = MathUtils.randomChoice(templates);
        let a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10), c = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(1, 10);
        
        let problem = t(a, b, c, d);
        while (problem.ans <= 0 || !Number.isInteger(problem.ans)) {
            a++; b++; d--;
            problem = t(a, b, c, d);
        }

        return {
            renderData: {
                latex: problem.latex,
                description: lang === 'sv' ? "Beräkna" : "Calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(problem.ans.toString()),
            clues: problem.clues.map((c:any) => ({ text: lang === 'sv' ? c.sv : c.en, latex: c.step })),
            metadata: { variation_key: 'order_paren', difficulty: 2 }
        };
    }

    // --- LEVEL 3: 4-5 Ops with Fractions as Parentheses ---
    private level3_Complex(lang: string): any {
        const variation = MathUtils.randomInt(1, 4);
        
        let latex = "";
        let result = 0;
        let pedagogicalClues = [];

        const div = MathUtils.randomInt(2, 5);
        const quotient = MathUtils.randomInt(2, 6);
        const numVal = div * quotient;
        const isNumPlus = Math.random() > 0.5;
        const n1 = isNumPlus ? MathUtils.randomInt(1, numVal - 1) : MathUtils.randomInt(numVal + 1, numVal + 8);
        const n2 = isNumPlus ? numVal - n1 : n1 - numVal;
        const numLatex = `(${n1} ${isNumPlus ? '+' : '-'} ${n2})`;

        const m1 = MathUtils.randomInt(2, 5);
        const m2 = MathUtils.randomInt(2, 4);
        const product = m1 * m2;

        const constant = MathUtils.randomInt(5, 20);

        switch (variation) {
            case 1: 
                result = constant + quotient - product;
                if (result <= 0) return this.level3_Complex(lang);
                latex = `${constant} + \\frac{${numLatex}}{${div}} - ${m1} \\cdot ${m2}`;
                break;
            case 2: 
                result = product + constant - quotient;
                if (result <= 0) return this.level3_Complex(lang);
                latex = `${m1} \\cdot ${m2} + ${constant} - \\frac{${numLatex}}{${div}}`;
                break;
            case 4: 
                result = quotient + product - MathUtils.randomInt(1, 5);
                if (result <= 0) return this.level3_Complex(lang);
                latex = `\\frac{${numLatex}}{${div}} + ${m1} \\cdot ${m2} - ${MathUtils.randomInt(1, 5)}`;
                break;
            default: 
                result = constant - product + quotient;
                if (result <= 0) return this.level3_Complex(lang);
                latex = `${constant} - ${m1} \\cdot ${m2} + \\frac{${numLatex}}{${div}}`;
                break;
        }

        pedagogicalClues = [
            {
                sv: `Steg 1: Börja med parentesen i täljaren. Bråkstrecket gör att allt där uppe räknas som en egen grupp.`,
                en: `Step 1: Start with the parentheses in the numerator. The fraction bar means everything on top is calculated as its own group.`,
                step: `${n1} ${isNumPlus ? '+' : '-'} ${n2} = ${numVal}`
            },
            {
                sv: `Steg 2: Utför nu divisionen $\\frac{${numVal}}{${div}}$ och multiplikationen ${m1} $\\cdot$ ${m2}.`,
                en: `Step 2: Now perform the division $\\frac{${numVal}}{${div}}$ and the multiplication ${m1} $\\cdot$ ${m2}.`,
                step: `\\frac{${numVal}}{${div}} = ${quotient}, \\quad ${m1} \\cdot ${m2} = ${product}`
            },
            {
                sv: `Steg 3: Slutför uträkningen genom att addera och subtrahera de kvarvarande talen från vänster till höger.`,
                en: `Step 3: Complete the calculation by adding and subtracting the remaining numbers from left to right.`,
                step: `\\text{Resultat} = ${result}`
            }
        ];

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Beräkna" : "Calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(result.toString()),
            clues: pedagogicalClues.map(c => ({ text: lang === 'sv' ? c.sv : c.en, latex: c.step })),
            metadata: { variation_key: 'order_fraction', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Powers Included (Complex Variations) ---
    // Refactored to use the same structural variability as Level 3 but with a squared term.
    private level4_Powers(lang: string): any {
        const variation = Math.random();
        const base = MathUtils.randomInt(2, 6);
        const pVal = base * base;
        const powerLatex = `${base}^2`;

        // We use the same structural elements as Level 3
        const div = MathUtils.randomInt(2, 4);
        const quotient = MathUtils.randomInt(2, 5);
        const numVal = div * quotient;
        const isNumPlus = Math.random() > 0.5;
        const n1 = isNumPlus ? MathUtils.randomInt(1, numVal - 1) : MathUtils.randomInt(numVal + 1, numVal + 8);
        const n2 = isNumPlus ? numVal - n1 : n1 - numVal;
        const numLatex = `(${n1} ${isNumPlus ? '+' : '-'} ${n2})`;

        const m1 = MathUtils.randomInt(2, 4);
        const m2 = MathUtils.randomInt(2, 3);
        const product = m1 * m2;

        let latex = "";
        let result = 0;

        // 4 structural variations
        if (variation < 0.25) {
            // base^2 + (n1 +/- n2)/div - m1 * m2
            result = pVal + quotient - product;
            if (result <= 0) return this.level4_Powers(lang);
            latex = `${powerLatex} + \\frac{${numLatex}}{${div}} - ${m1} \\cdot ${m2}`;
        } else if (variation < 0.5) {
            // m1 * m2 + base^2 - (n1 +/- n2)/div
            result = product + pVal - quotient;
            if (result <= 0) return this.level4_Powers(lang);
            latex = `${m1} \\cdot ${m2} + ${powerLatex} - \\frac{${numLatex}}{${div}}`;
        } else if (variation < 0.75) {
            // (n1 +/- n2)/div + m1 * m2 - base^2
            result = quotient + product - pVal;
            if (result <= 0) return this.level4_Powers(lang);
            latex = `\\frac{${numLatex}}{${div}} + ${m1} \\cdot ${m2} - ${powerLatex}`;
        } else {
            // base^2 - m1 * m2 + (n1 +/- n2)/div
            result = pVal - product + quotient;
            if (result <= 0) return this.level4_Powers(lang);
            latex = `${powerLatex} - ${m1} \\cdot ${m2} + \\frac{${numLatex}}{${div}}`;
        }

        const pedagogicalClues = [
            {
                sv: `Steg 1: Börja med parentesen i täljaren.`,
                en: `Step 1: Start with the parentheses in the numerator.`,
                step: `${n1} ${isNumPlus ? '+' : '-'} ${n2} = ${numVal}`
            },
            {
                sv: `Steg 2: Beräkna potensen. Potenser går före multiplikation och division.`,
                en: `Step 2: Calculate the power. Powers come before multiplication and division.`,
                step: `${base}^2 = ${pVal}`
            },
            {
                sv: `Steg 3: Utför divisionen $\\frac{${numVal}}{${div}}$ och multiplikationen ${m1} $\\cdot$ ${m2}.`,
                en: `Step 3: Perform the division $\\frac{${numVal}}{${div}}$ and the multiplication ${m1} $\\cdot$ ${m2}.`,
                step: `\\frac{${numVal}}{${div}} = ${quotient}, \\quad ${m1} \\cdot ${m2} = ${product}`
            },
            {
                sv: `Steg 4: Slutför uträkningen med addition och subtraktion från vänster till höger.`,
                en: `Step 4: Complete the calculation with addition and subtraction from left to right.`,
                step: `\\text{Resultat} = ${result}`
            }
        ];

        return {
            renderData: {
                latex,
                description: lang === 'sv' ? "Beräkna" : "Calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(result.toString()),
            clues: pedagogicalClues.map(c => ({ text: lang === 'sv' ? c.sv : c.en, latex: c.step })),
            metadata: { variation_key: 'order_powers', difficulty: 4 }
        };
    }
}