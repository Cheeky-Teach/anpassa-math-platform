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
        const op = usePlus ? '+' : '-';

        let a, b, c, result, latex, clues = [];

        if (useMult) {
            a = MathUtils.randomInt(2, 6);
            b = MathUtils.randomInt(2, 8);
            c = MathUtils.randomInt(1, 10);
            const product = a * b;

            if (isMDFirst) {
                result = usePlus ? product + c : product - c;
                if (result <= 0) { c = product - 1; result = 1; }
                latex = `${a} \\cdot ${b} ${op} ${c}`;
                clues = [
                    { 
                        text: lang === 'sv' ? `Multiplikation går före ${usePlus ? 'addition' : 'subtraktion'}. Räkna ut produkten först:` : `Multiplication comes before ${usePlus ? 'addition' : 'subtraction'}. Calculate the product first:`,
                        latex: `${a} \\cdot ${b} = ${product} \\\\ ${product} ${op} ${c}`
                    }
                ];
            } else {
                result = usePlus ? c + product : c - product;
                if (result <= 0) { c = product + MathUtils.randomInt(1, 5); result = c - product; }
                latex = `${c} ${op} ${a} \\cdot ${b}`;
                clues = [
                    { 
                        text: lang === 'sv' ? `Multiplikation prioriteras alltid före ${usePlus ? 'addition' : 'subtraktion'}.` : `Multiplication is always prioritized before ${usePlus ? 'addition' : 'subtraction'}.`,
                        latex: `${a} \\cdot ${b} = ${product} \\\\ ${c} ${op} ${product}`
                    }
                ];
            }
        } else {
            b = MathUtils.randomInt(2, 6);
            const quotient = MathUtils.randomInt(2, 8);
            const dividend = b * quotient; 
            c = MathUtils.randomInt(1, 15);

            if (isMDFirst) {
                latex = `\\frac{${dividend}}{${b}} ${op} ${c}`;
                result = usePlus ? quotient + c : quotient - c;
                if (result <= 0) { c = quotient + 1; result = quotient - c; }
                
                clues = [
                    { 
                        text: lang === 'sv' ? `Divisionen (bråkstrecket) ska räknas ut före ${usePlus ? 'addition' : 'subtraktion'}.` : `The division (fraction bar) must be calculated before ${usePlus ? 'addition' : 'subtraction'}.`,
                        latex: `\\frac{${dividend}}{${b}} = ${quotient} \\\\ ${quotient} ${op} ${c}`
                    }
                ];
            } else {
                latex = `${c} ${op} \\frac{${dividend}}{${b}}`;
                result = usePlus ? c + quotient : c - quotient;
                if (result <= 0) { c = quotient + 2; result = c - quotient; }

                clues = [
                    { 
                        text: lang === 'sv' ? `Division har förtur över ${usePlus ? 'addition' : 'subtraktion'}.` : `Division has priority over ${usePlus ? 'addition' : 'subtraction'}.`,
                        latex: `\\frac{${dividend}}{${b}} = ${quotient} \\\\ ${c} ${op} ${quotient}`
                    }
                ];
            }
        }

        clues.push({ text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${result}` });

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna värdet." : "Calculate the value.", answerType: 'numeric' },
            token: this.toBase64(result.toString()),
            clues,
            metadata: { variation_key: 'order_basic', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Parentheses ---
    private level2_Parentheses(lang: string): any {
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10), c = MathUtils.randomInt(2, 5), d = MathUtils.randomInt(1, 10);
        const templates = [
            {
                latex: `(${a} + ${b}) \\cdot ${c} - ${d}`,
                ans: (a + b) * c - d,
                clues: [
                    { t: lang === 'sv' ? `Börja med det som står i parentesen.` : `Start with what is inside the parentheses.`, l: `${a} + ${b} = ${a + b} \\\\ ${a + b} \\cdot ${c} - ${d}` },
                    { t: lang === 'sv' ? `Multiplicera därefter innan du subtraherar.` : `Then multiply before subtracting.`, l: `${a + b} \\cdot ${c} = ${(a + b) * c} \\\\ ${(a + b) * c} - ${d}` }
                ]
            },
            {
                latex: `${a} \\cdot (${b} + ${c}) + ${d}`,
                ans: a * (b + c) + d,
                clues: [
                    { t: lang === 'sv' ? `Räkna ut parentesen först.` : `Calculate the parentheses first.`, l: `${b} + ${c} = ${b + c} \\\\ ${a} \\cdot ${b + c} + ${d}` },
                    { t: lang === 'sv' ? `Genomför multiplikationen:` : `Perform the multiplication:`, l: `${a} \\cdot ${b + c} = ${a * (b + c)} \\\\ ${a * (b + c)} + ${d}` }
                ]
            },
            {
                latex: `${a} + (${b} + ${c}) \\cdot ${d}`,
                ans: a + (b + c) * d,
                clues: [
                    { t: lang === 'sv' ? `Parenteser har högsta prioritet i räkneordningen.` : `Parentheses have the highest priority in the order of operations.`, l: `${b} + ${c} = ${b + c} \\\\ ${a} + ${b + c} \\cdot ${d}` },
                    { t: lang === 'sv' ? `Multiplikation går före addition.` : `Multiplication comes before addition.`, l: `${b + c} \\cdot ${d} = ${(b + c) * d} \\\\ ${a} + ${(b + c) * d}` }
                ]
            }
        ];

        const p = MathUtils.randomChoice(templates);
        const finalClues = p.clues.map(c => ({ text: c.t, latex: c.l }));
        finalClues.push({ text: lang === 'sv' ? "Det slutgiltiga svaret är:" : "The final answer is:", latex: `${p.ans}` });

        return {
            renderData: { latex: p.latex, description: lang === 'sv' ? "Beräkna" : "Calculate.", answerType: 'numeric' },
            token: this.toBase64(p.ans.toString()),
            clues: finalClues,
            metadata: { variation_key: 'order_paren', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Complex ---
    private level3_Complex(lang: string): any {
        const div = MathUtils.randomInt(2, 4), quotient = MathUtils.randomInt(2, 5), numVal = div * quotient;
        const n1 = MathUtils.randomInt(1, numVal - 1), n2 = numVal - n1;
        const m1 = MathUtils.randomInt(2, 4), m2 = MathUtils.randomInt(2, 3), product = m1 * m2;
        const constant = MathUtils.randomInt(10, 20);
        
        const result = constant + quotient - product;
        const latex = `${constant} + \\frac{${n1} + ${n2}}{${div}} - ${m1} \\cdot ${m2}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna" : "Calculate.", answerType: 'numeric' },
            token: this.toBase64(result.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Täljaren i ett bråk fungerar som en parentes. Börja där:` : `The numerator of a fraction acts like parentheses. Start there:`, 
                    latex: `${n1} + ${n2} = ${numVal} \\\\ ${constant} + \\frac{${numVal}}{${div}} - ${m1} \\cdot ${m2}` 
                },
                { 
                    text: lang === 'sv' ? `Utför nu både division och multiplikation:` : `Now perform both division and multiplication:`, 
                    latex: `\\frac{${numVal}}{${div}} = ${quotient}, \\; ${m1} \\cdot ${m2} = ${product} \\\\ ${constant} + ${quotient} - ${product}` 
                },
                { 
                    text: lang === 'sv' ? `Slutför med addition och subtraktion från vänster till höger:` : `Complete with addition and subtraction from left to right:`, 
                    latex: `${constant} + ${quotient} = ${constant + quotient} \\\\ ${constant + quotient} - ${product}` 
                },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${result}` }
            ],
            metadata: { variation_key: 'order_fraction', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Powers ---
    private level4_Powers(lang: string): any {
        const base = MathUtils.randomInt(2, 4), pVal = base * base;
        const div = 2, quotient = MathUtils.randomInt(2, 4), numVal = div * quotient;
        const n1 = MathUtils.randomInt(1, numVal - 1), n2 = numVal - n1;
        const m1 = 3, m2 = 2, product = m1 * m2;

        const result = pVal + quotient - product;
        const latex = `${base}^2 + \\frac{${n1} + ${n2}}{${div}} - ${m1} \\cdot ${m2}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna" : "Calculate.", answerType: 'numeric' },
            token: this.toBase64(result.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Steg 1: Beräkna täljaren i bråket först.` : `Step 1: Calculate the numerator in the fraction first.`, 
                    latex: `${n1} + ${n2} = ${numVal} \\\\ ${base}^2 + \\frac{${numVal}}{${div}} - ${m1} \\cdot ${m2}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Potenser räknas ut före multiplikation och division.` : `Step 2: Powers are calculated before multiplication and division.`, 
                    latex: `${base}^2 = ${pVal} \\\\ ${pVal} + \\frac{${numVal}}{${div}} - ${m1} \\cdot ${m2}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 3: Utför multiplikation och division.` : `Step 3: Perform multiplication and division.`, 
                    latex: `\\frac{${numVal}}{${div}} = ${quotient}, \\; ${m1} \\cdot ${m2} = ${product} \\\\ ${pVal} + ${quotient} - ${product}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 4: Slutför uträkningen från vänster till höger.` : `Step 4: Finish the calculation from left to right.`, 
                    latex: `${pVal} + ${quotient} = ${pVal + quotient} \\\\ ${pVal + quotient} - ${product}` 
                },
                { text: lang === 'sv' ? "Slutresultatet är:" : "The final result is:", latex: `${result}` }
            ],
            metadata: { variation_key: 'order_powers', difficulty: 4 }
        };
    }
}