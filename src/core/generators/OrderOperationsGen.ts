import { MathUtils } from '../utils/MathUtils.js';

export class OrderOperationsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 Foundations are mastered, push to Parentheses
        if (level === 1 && options.hideConcept && options.exclude?.includes('order_basic')) {
            return this.level2_Parentheses(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Basic(lang, undefined, options);
            case 2: return this.level2_Parentheses(lang, undefined, options);
            case 3: return this.level3_Complex(lang, undefined, options);
            case 4: return this.level4_Powers(lang, undefined, options);
            default: return this.level1_Basic(lang, undefined, options);
        }
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'order_basic': return this.level1_Basic(lang, key);
            case 'order_paren': return this.level2_Parentheses(lang, key);
            case 'order_fraction': return this.level3_Complex(lang, key);
            case 'order_powers': return this.level4_Powers(lang, key);
            default: return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
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

    // --- LEVEL 1: 3 Terms, 2 Ops (Multiplication/Division Priority) ---
    private level1_Basic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'order_basic', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const useMult = Math.random() > 0.5;
        const isPrioFirst = Math.random() > 0.5;
        const usePlus = Math.random() > 0.5;
        const op = usePlus ? '+' : '-';

        let a, b, c, result, latex, step1Latex, step2Latex;
        const multSym = "·";

        if (useMult) {
            a = MathUtils.randomInt(3, 7);
            b = MathUtils.randomInt(2, 6);
            const product = a * b;

            if (usePlus) {
                c = MathUtils.randomInt(2, 10);
                result = product + c;
            } else {
                // For subtraction, ensure result is non-negative
                if (isPrioFirst) {
                    // product - c
                    c = MathUtils.randomInt(1, product);
                    result = product - c;
                } else {
                    // c - product
                    c = product + MathUtils.randomInt(1, 10);
                    result = c - product;
                }
            }

            // FINAL ASSIGNMENT: Generate latex after c and result are confirmed
            if (isPrioFirst) {
                latex = `${a} · ${b} ${op} ${c}`;
                step1Latex = `${a} · ${b} = ${product}`;
                step2Latex = `${product} ${op} ${c} = ${result}`;
            } else {
                latex = `${c} ${op} ${a} · ${b}`;
                step1Latex = `${a} · ${b} = ${product}`;
                step2Latex = `${c} ${op} ${product} = ${result}`;
            }

        } else {
            b = MathUtils.randomInt(2, 5);
            const quotient = MathUtils.randomInt(2, 8);
            a = b * quotient;

            if (usePlus) {
                c = MathUtils.randomInt(2, 12);
                result = quotient + c;
            } else {
                // For subtraction, ensure result is non-negative
                if (isPrioFirst) {
                    // quotient - c
                    c = MathUtils.randomInt(1, quotient);
                    result = quotient - c;
                } else {
                    // c - quotient
                    c = quotient + MathUtils.randomInt(1, 10);
                    result = c - quotient;
                }
            }

            // FINAL ASSIGNMENT: Generate latex after c and result are confirmed
            if (isPrioFirst) {
                latex = `\\frac{${a}}{${b}} ${op} ${c}`;
                step1Latex = `\\frac{${a}}{${b}} = ${quotient}`;
                step2Latex = `${quotient} ${op} ${c} = ${result}`;
            } else {
                latex = `${c} ${op} \\frac{${a}}{${b}}`;
                step1Latex = `\\frac{${a}}{${b}} = ${quotient}`;
                step2Latex = `${c} ${op} ${quotient} = ${result}`;
            }
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna värdet med rätt räkneordning." : "Calculate the value using the correct order of operations.", answerType: 'numeric' },
            token: this.toBase64(result.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Identifiera prioriterade operationer. ${useMult ? 'Multiplikation' : 'Division'} går alltid före ${usePlus ? 'addition' : 'subtraktion'}.` : `Step 1: Identify prioritized operations. ${useMult ? 'Multiplication' : 'Division'} always comes before ${usePlus ? 'addition' : 'subtraction'}.` },
                { text: lang === 'sv' ? `Räkna ut ${useMult ? 'produkten' : 'kvoten'} först:` : `Calculate the ${useMult ? 'product' : 'quotient'} first:`, latex: step1Latex },
                { text: lang === 'sv' ? "Steg 2: Utför nu den sista räkneoperationen med resultatet." : "Step 2: Now perform the final operation with the result.", latex: step2Latex },
                { text: lang === 'sv' ? `Svar: ${result}` : `Answer: ${result}` }
            ],
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2: Parentheses ---
    private level2_Parentheses(lang: string, variationKey?: string, options: any = {}): any {
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(5, 10);
        const c = MathUtils.randomInt(2, 4); // Keep c small so b-c is positive
        const d = MathUtils.randomInt(1, 10);
        
        const templates = [
            {
                latex: `(${a} + ${b}) · ${c} - ${d}`,
                ans: (a + b) * c - d,
                steps: [
                    { sv: "Prioritera det som står inom parentesen först.", en: "Prioritize what is inside the parentheses first.", l: `${a} + ${b} = ${a + b}` },
                    { sv: "Multiplicera därefter resultatet med siffran utanför.", en: "Then multiply the result by the number outside.", l: `${a + b} · ${c} = ${(a + b) * c}` },
                    { sv: "Slutför genom att dra bort det sista talet.", en: "Finish by subtracting the last number.", l: `${(a+b)*c} - ${d} = ${(a + b) * c - d}` }
                ]
            },
            {
                latex: `${d} + ${a} · (${b} - ${c})`,
                ans: d + a * (b - c),
                steps: [
                    { sv: "Räkna ut värdet i parentesen först.", en: "Calculate the value in the parentheses first.", l: `${b} - ${c} = ${b - c}` },
                    { sv: "Utför multiplikationen innan du adderar.", en: "Perform the multiplication before adding.", l: `${a} · ${b - c} = ${a * (b - c)}` },
                    { sv: "Lägg slutligen ihop resultaten.", en: "Finally, add the results together.", l: `${d} + ${a*(b-c)} = ${d + a * (b - c)}` }
                ]
            }
        ];

        const p = MathUtils.randomChoice(templates);
        // Safety for negatives in Level 2: Re-generate if template 1 results in negative
        if (p.ans < 0) return this.level2_Parentheses(lang, variationKey, options);

        const finalClues = p.steps.map((s, i) => ({ text: lang === 'sv' ? `Steg ${i+1}: ${s.sv}` : `Step ${i+1}: ${s.en}`, latex: s.l }));
        finalClues.push({ text: lang === 'sv' ? `Svar: ${p.ans}` : `Answer: ${p.ans}` });

        return {
            renderData: { latex: p.latex, description: lang === 'sv' ? "Beräkna uttrycket." : "Calculate the expression.", answerType: 'numeric' },
            token: this.toBase64(p.ans.toString()), variationKey: 'order_paren', type: 'calculate',
            clues: finalClues,
            metadata: { variation_key: 'order_paren', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Complex (Fraction Bars as Parentheses) ---
    private level3_Complex(lang: string, variationKey?: string, options: any = {}): any {
        const div = MathUtils.randomInt(2, 4), quotient = MathUtils.randomInt(2, 5);
        const numTotal = div * quotient;
        const n1 = MathUtils.randomInt(1, numTotal - 1), n2 = numTotal - n1;
        const m1 = MathUtils.randomInt(2, 4), m2 = MathUtils.randomInt(2, 3);
        const constant = MathUtils.randomInt(15, 25); // Increased to ensure non-negative result
        
        const ans = constant + quotient - (m1 * m2);
        const latex = `${constant} + \\frac{${n1} + ${n2}}{${div}} - ${m1} · ${m2}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Följ räkneordningen för att lösa uttrycket." : "Follow the order of operations to solve the expression.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: 'order_fraction', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Bråkstrecket fungerar som en parentes. Vi måste räkna ut täljaren först." : "Step 1: The fraction bar acts like parentheses. We must calculate the numerator first.", latex: `${n1} + ${n2} = ${numTotal}` },
                { text: lang === 'sv' ? "Steg 2: Nu kan vi utföra divisionen." : "Step 2: Now we can perform the division.", latex: `\\frac{${numTotal}}{${div}} = ${quotient}` },
                { text: lang === 'sv' ? "Steg 3: Utför multiplikationen separat." : "Step 3: Perform the multiplication separately.", latex: `${m1} · ${m2} = ${m1 * m2}` },
                { text: lang === 'sv' ? "Steg 4: Skriv om uttrycket med de nya värdena." : "Step 4: Rewrite the expression with the new values.", latex: `${constant} + ${quotient} - ${m1 * m2}` },
                { text: lang === 'sv' ? "Steg 5: Slutför genom att addera och subtrahera från vänster till höger." : "Step 5: Finish by adding and subtracting from left to right.", latex: `${constant + quotient} - ${m1 * m2} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ],
            metadata: { variation_key: 'order_fraction', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Powers & Priority ---
    private level4_Powers(lang: string, variationKey?: string, options: any = {}): any {
        const base = MathUtils.randomInt(2, 4);
        const exponent = 2;
        const pVal = Math.pow(base, exponent);
        
        const m1 = MathUtils.randomInt(2, 4), m2 = MathUtils.randomInt(2, 3);
        const constant = MathUtils.randomInt(10, 15); // Ensure high enough to avoid negatives
        
        const ans = pVal + constant - (m1 * m2);
        const latex = `${base}^{${exponent}} + ${constant} - ${m1} · ${m2}`;

        return {
            renderData: { latex, description: lang === 'sv' ? "Prioritera rätt operationer." : "Prioritize the correct operations.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: 'order_powers', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Enligt prioriteringsreglerna räknar vi ut potenser först." : "Step 1: According to the priority rules, we calculate powers first." },
                { text: lang === 'sv' ? `Beräkna ${base} upphöjt till ${exponent}:` : `Calculate ${base} to the power of ${exponent}:`, latex: `${base}^{${exponent}} = ${pVal}` },
                { text: lang === 'sv' ? "Steg 2: Gå vidare till multiplikation och division." : "Step 2: Move on to multiplication and division.", latex: `${m1} · ${m2} = ${m1 * m2}` },
                { text: lang === 'sv' ? "Steg 3: Utför nu addition och subtraktion från vänster till höger." : "Step 3: Now perform addition and subtraction from left to right." },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${pVal} + ${constant} - ${m1 * m2} \\rightarrow ${pVal + constant} - ${m1 * m2} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ],
            metadata: { variation_key: 'order_powers', difficulty: 4 }
        };
    }
}