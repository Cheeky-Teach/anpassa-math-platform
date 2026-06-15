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

        let a = 0, b = 0, c = 0, result = 0, latex = "", step1Latex = "", step2Latex = "";
        
        // 🟢 FIXED: Declare variables at the root function scope so clues can read them without block errors
        let product = 0;
        let quotient = 0;

        if (useMult) {
            a = MathUtils.randomInt(3, 7);
            b = MathUtils.randomInt(2, 6);
            product = a * b; // 🚀 Assigned to outer scoped variable

            if (usePlus) {
                c = MathUtils.randomInt(2, 10);
                result = product + c;
            } else {
                if (isPrioFirst) {
                    c = MathUtils.randomInt(1, product);
                    result = product - c;
                } else {
                    c = product + MathUtils.randomInt(1, 10);
                    result = c - product;
                }
            }

            if (isPrioFirst) {
                latex = `${a} · ${b} ${op} ${c}`;
            } else {
                latex = `${c} ${op} ${a} · ${b}`;
            }

        } else {
            b = MathUtils.randomInt(2, 5);
            quotient = MathUtils.randomInt(2, 8); // 🚀 Assigned to outer scoped variable
            a = b * quotient;

            if (usePlus) {
                c = MathUtils.randomInt(2, 12);
                result = quotient + c;
            } else {
                if (isPrioFirst) {
                    c = MathUtils.randomInt(1, quotient);
                    result = quotient - c;
                } else {
                    c = quotient + MathUtils.randomInt(1, 10);
                    result = c - quotient;
                }
            }

            if (isPrioFirst) {
                latex = `\\frac{${a}}{${b}} ${op} ${c}`;
            } else {
                latex = `${c} ${op} \\frac{${a}}{${b}}`;
            }
        }

        // 🟢 FIXED: Now clues can evaluate cleanly because both tracking variables are fully visible!
        return {
            renderData: { latex, description: lang === 'sv' ? "Räkna ut värdet i rätt ordning." : "Calculate the value using the correct order of operations.", answerType: 'numeric' },
            token: this.toBase64(result.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Tänk på "Räknestegen": Gånger (·) och delat (/) står på ett högre steg än plus och minus. Vi måste städa bort dem först!` : `Think of the "math ladder": Multiplication (·) and division (/) sit on a higher step than plus and minus. We must clear them away first!`, 
                    latex 
                },
                { 
                    text: lang === 'sv' ? (useMult ? `Räkna ut multiplikationen ${a} · ${b} först. Det blir ${product}.` : `Räkna ut delningstalet först: ${a} delat med ${b} blir ${quotient}.`) : (useMult ? `Calculate the multiplication ${a} · ${b} first. That equals ${product}.` : `Calculate the division first: ${a} divided by ${b} equals ${quotient}.`), 
                    latex: isPrioFirst 
                        ? (useMult ? `\\mathbf{${a} \\cdot ${b}} ${op} ${c} = \\mathbf{${product}} ${op} ${c}` : `\\mathbf{\\frac{${a}}{${b}}} ${op} ${c} = \\mathbf{${quotient}} ${op} ${c}`)
                        : (useMult ? `${c} ${op} \\mathbf{${a} \\cdot ${b}} = ${c} ${op} \\mathbf{${product}}` : `${c} ${op} \\mathbf{\\frac{${a}}{${b}}} = ${c} ${op} \\mathbf{${quotient}}`)
                },
                { 
                    text: lang === 'sv' ? `Nu är det bara plussandet eller minussandet kvar. Räkna ut slutsvaret:` : `Now only the addition or subtraction remains. Calculate the final answer:`, 
                    latex: isPrioFirst ? `\\mathbf{${useMult ? product : quotient} ${op} ${c}} = ${result}` : `\\mathbf{${c} ${op} ${useMult ? product : quotient}} = ${result}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${result}` : `Answer: ${result}`, 
                    latex: `${result}` 
                }
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
        
        const isTemplateOne = Math.random() > 0.5;
        const latex = isTemplateOne ? `(${a} + ${b}) \\cdot ${c} - ${d}` : `${d} + ${a} \\cdot (${b} - ${c})`;
        const ans = isTemplateOne ? (a + b) * c - d : d + a * (b - c);

        if (ans < 0) return this.level2_Parentheses(lang, variationKey, options);

        const clues = isTemplateOne ? [
            {
                text: lang === 'sv' ? "Parentesväggar skyddar det som står på insidan. Allt som gömmer sig inom en parentes måste ALLTID räknas ut allra först!" : "Parenthesis walls protect what is inside. Everything hiding inside a parenthesis must ALWAYS be calculated first!",
                latex
            },
            {
                text: lang === 'sv' ? `Räkna ut parentesen: ${a} + ${b} blir ${a + b}.` : `Calculate inside the parentheses: ${a} + ${b} equals ${a + b}.`,
                latex: `\\mathbf{(${a} + ${b})} \\cdot ${c} - ${d} = \\mathbf{${a + b}} \\cdot ${c} - ${d}`
            },
            {
                text: lang === 'sv' ? `Nu har vi en multiplikation och en subtraktion kvar. Gånger står högre upp på stegen, så vi räknar ut ${a + b} · ${c} = ${(a + b) * c}.` : `Now we have a multiplication and a subtraction left. Multiplication sits higher on the ladder, so we compute ${a + b} · ${c} = ${(a + b) * c}.`,
                latex: `\\mathbf{${a + b} \\cdot ${c}} - ${d} = \\mathbf{${(a + b) * c}} - ${d}`
            },
            {
                text: lang === 'sv' ? "Slutför genom att göra den sista subtraktionen." : "Finish by performing the final subtraction step.",
                latex: `\\mathbf{${(a + b) * c} - ${d}} = ${ans}`
            },
            {
                text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                latex: `${ans}`
            }
        ] : [
            {
                text: lang === 'sv' ? "Parentesväggar är viktigast av allt! Allt som gömmer sig inom en parentes måste ALLTID räknas ut allra först!" : "Parentheses are the most important thing of all! Everything hiding inside a parenthesis must ALWAYS be calculated first!",
                latex
            },
            {
                text: lang === 'sv' ? `Räkna ut parentesen: ${b} - ${c} blir ${b - c}.` : `Calculate inside the parentheses: ${b} - ${c} equals ${b - c}.`,
                latex: `${d} + ${a} \\cdot \\mathbf{(${b} - ${c})} = ${d} + ${a} \\cdot \\mathbf{${b - c}}`
            },
            {
                text: lang === 'sv' ? `Nu har vi ett plustal och ett gångertal kvar. Gånger går alltid före plus, så räkna ut ${a} · ${b - c} först.` : `Now we have an addition and a multiplication left. Multiplication always comes before addition, so compute ${a} · ${b - c} first.`,
                latex: `${d} + \\mathbf{${a} \\cdot ${b - c}} = ${d} + \\mathbf{${a * (b - c)}}`
            },
            {
                text: lang === 'sv' ? "Slutför genom att plussa ihop de sista siffrorna." : "Finish by adding the final remaining numbers together.",
                latex: `\\mathbf{${d} + ${a * (b - c)}} = ${ans}`
            },
            {
                text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                latex: `${ans}`
            }
        ];

        return {
            renderData: { latex, description: lang === 'sv' ? "Beräkna uttrycket i rätt ordning." : "Calculate the expression using the correct order of operations.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: 'order_paren', type: 'calculate',
            clues,
            metadata: { variation_key: 'order_paren', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Complex (Fractions & Parentheses Objects) ---
    private level3_Complex(lang: string, variationKey?: string, options: any = {}): any {
        // Generate common components (Multiplication and Constant)
        const m1 = MathUtils.randomInt(2, 10);
        const m2 = MathUtils.randomInt(2, 10);
        const product = m1 * m2;
        const c = MathUtils.randomInt(10, 40);

        // Helper to generate a Fraction term
        const getFraction = () => {
            const div = MathUtils.randomInt(2, 10);
            const quotient = MathUtils.randomInt(2, 8);
            const numTotal = div * quotient;
            const n1 = MathUtils.randomInt(1, numTotal - 1);
            const n2 = numTotal - n1;
            return {
                latex: `\\frac{${n1} + ${n2}}{${div}}`,
                val: quotient,
                type: 'fraction', 
                clues: [
                    { 
                        text: lang === 'sv' ? "Steg 1: Bråkstrecket fungerar som en parentes. Vi måste räkna ut täljaren först." : "Step 1: The fraction bar acts like parentheses. We must calculate the numerator first.", 
                        latex: `${n1} + ${n2} = ${numTotal}` 
                    },
                    { 
                        text: lang === 'sv' ? "Steg 2: Nu kan vi utföra divisionen." : "Step 2: Now we can perform the division.", 
                        latex: `\\frac{${numTotal}}{${div}} = ${quotient}` 
                    }
                ]
            };
        };

        const getParentheses = () => {
            const p1 = MathUtils.randomInt(2, 10);
            const p2 = MathUtils.randomInt(2, 10);
            const pSum = p1 + p2;
            const pMult = MathUtils.randomInt(2, 6);
            const pVal = pSum * pMult;
            return {
                latex: `(${p1} + ${p2}) · ${pMult}`,
                val: pVal,
                type: 'parentheses', 
                clues: [
                    { 
                        text: lang === 'sv' ? "Steg 1: Räkna ut värdet inom parentesen först." : "Step 1: Calculate the value inside the parentheses first.", 
                        latex: `${p1} + ${p2} = ${pSum}` 
                    },
                    { 
                        text: lang === 'sv' ? "Steg 2: Multiplicera sedan resultatet med talet utanför." : "Step 2: Then multiply the result with the number outside.", 
                        latex: `${pSum} · ${pMult} = ${pVal}` 
                    }
                ]
            };
        };
        
        

        // Pick which complex term to use for this question
        const complexTerm = Math.random() > 0.5 ? getFraction() : getParentheses();

        // Define the three distinct terms to shuffle
        const terms = [
            { latex: complexTerm.latex, val: complexTerm.val },
            { latex: `${m1} · ${m2}`, val: product },
            { latex: `${c}`, val: c }
        ];

        // Randomize the order of the terms
        const order = MathUtils.randomChoice([
            [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
        ]);
        
        // Randomize the operators
        const op1 = MathUtils.randomChoice(['+', '-']);
        const op2 = MathUtils.randomChoice(['+', '-']);

        const t1 = terms[order[0]];
        const t2 = terms[order[1]];
        const t3 = terms[order[2]];

        const latex = `${t1.latex} ${op1} ${t2.latex} ${op2} ${t3.latex}`;

        // Sequential evaluation for the final answer
        let intermediate;
        if (op1 === '+') intermediate = t1.val + t2.val;
        else intermediate = t1.val - t2.val;

        let ans;
        if (op2 === '+') ans = intermediate + t3.val;
        else ans = intermediate - t3.val;

        // Safety: If the intermediate or final result is negative, re-generate
        if (ans < 0 || intermediate < 0) return this.level3_Complex(lang, variationKey, options);

        const rewriteLatex = `${t1.val} ${op1} ${t2.val} ${op2} ${t3.val}`;

        // First, transform the dynamic helpers inside complexTerm to map clean visual replacements
        const step1Text = complexTerm.type === 'fraction'
            ? (lang === 'sv' ? "Ett långt bråkstreck fungerar precis som en skyddande parentes. Vi måste addera ihop täljaren där uppe allra först!" : "A long fraction bar acts exactly like a protective parenthesis. We must add the numerator on top together first!")
            : (lang === 'sv' ? "Börja med den skyddade parentesen på stegen. Räkna ut plusset på insidan först." : "Start with the protected parenthesis on the ladder. Calculate the addition on the inside first.");

        const step2Text = complexTerm.type === 'fraction'
            ? (lang === 'sv' ? "Nu kan vi räkna ut bråkdelningen: ta det samlade toppnumret delat med bottentalet." : "Now we can calculate the fraction division: take the combined top number divided by the bottom number.")
            : (lang === 'sv' ? "Gångra sedan parentesens svar med siffran som står precis utanför." : "Then multiply the parenthesis answer by the number standing directly outside.");

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Lös. Följ prioriteringsreglerna." : "Follow the order of operations to solve the expression.", 
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()), 
            variationKey: 'order_fraction', 
            type: 'calculate',
            clues: [
                { text: step1Text, latex },
                { 
                    text: step2Text, 
                    latex: complexTerm.type === 'fraction'
                        ? `\\dots = \\mathbf{\\frac{${complexTerm.clues[0].latex.split('=')[1].trim()}}{${complexTerm.latex.split('}{')[1].slice(0,-1)}}} \\dots`
                        : `\\dots = \\mathbf{${complexTerm.clues[0].latex.split('=')[1].trim()} \\cdot ${complexTerm.latex.split('·')[1].trim()}} \\dots`
                },
                { 
                    text: lang === 'sv' ? `Gå vidare till nästa del på raden och städa bort den fristående multiplikationen: ${m1} · ${m2} blir ${product}.` : `Move to the next part on the line and clear away the standalone multiplication: ${m1} · ${m2} equals ${product}.`, 
                    latex: `\\dots + \\mathbf{${m1} \\cdot ${m2}} \\dots = \\dots + \\mathbf{${product}} \\dots` 
                },
                { 
                    text: lang === 'sv' ? "Nu när alla parenteser, bråk och gångertecken är borta skriver vi ut den rena, enkla sifferraden:" : "Now that all parentheses, fractions, and multiplication dots are gone, let's write out the clean, simple row of numbers:", 
                    latex: `= ${rewriteLatex}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom plus och minus står på samma trappsteg räknar vi helt enkelt i ordning från vänster till höger.` : `Since plus and minus are on the same ladder step, we simply calculate in order from left to right.`, 
                    latex: `\\mathbf{${t1.val} ${op1} ${t2.val}} ${op2} ${t3.val} = \\mathbf{${intermediate}} ${op2} ${t3.val} = ${ans}` 
                },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` }
            ],
            metadata: { variation_key: 'order_fraction', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Powers, Priority & Optional Fractions ---
    private level4_Powers(lang: string, variationKey?: string, options: any = {}): any {
        // 1. Generate a Power Term (Mandatory for Level 4)
        const base = MathUtils.randomInt(2, 7);
        const exp = 2;
        const pVal = Math.pow(base, exp);
        const powerTerm = { 
            latex: `${base}^{${exp}}`, 
            val: pVal, 
            type: 'power',
            clue: { 
                sv: `Beräkna potensen först: ${base}^{${exp}} = ${pVal}`, 
                en: `Calculate the power first: ${base}^{${exp}} = ${pVal}` 
            }
        };

        // 2. Generate either a Multiplication Term OR a Fraction Term
        const useFraction = Math.random() > 0.5;
        let secondTerm;
        if (useFraction) {
            const div = MathUtils.randomInt(2, 11);
            const quotient = MathUtils.randomInt(2, 10);
            const n1 = MathUtils.randomInt(1, (div * quotient) - 1);
            const n2 = (div * quotient) - n1;
            secondTerm = {
                latex: `\\frac{${n1} + ${n2}}{${div}}`,
                val: quotient,
                type: 'fraction',
                clue: {
                    sv: `Räkna ut täljaren i bråket (parentesen): ${n1} + ${n2} = ${n1+n2}, sedan divisionen: \\frac{${n1+n2}}{${div}} = ${quotient}`,
                    en: `Calculate the numerator in the fraction (parentheses): ${n1} + ${n2} = ${n1+n2}, then the division: \\frac{${n1+n2}}{${div}} = ${quotient}`
                }
            };
        } else {
            const m1 = MathUtils.randomInt(2, 9), m2 = MathUtils.randomInt(2, 9);
            secondTerm = {
                latex: `${m1} · ${m2}`,
                val: m1 * m2,
                type: 'mult',
                clue: {
                    sv: `Beräkna multiplikationen: ${m1} · ${m2} = ${m1 * m2}`,
                    en: `Calculate the multiplication: ${m1} · ${m2} = ${m1 * m2}`
                }
            };
        }

        // 3. Generate a Constant Term
        const c = MathUtils.randomInt(5, 25);
        const constTerm = { latex: `${c}`, val: c, type: 'const' };

        // 4. Shuffle the 3 terms
        const terms = [powerTerm, secondTerm, constTerm];
        const order = MathUtils.randomChoice([
            [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
        ]);
        
        const op1 = MathUtils.randomChoice(['+', '-']);
        const op2 = MathUtils.randomChoice(['+', '-']);

        const t1 = terms[order[0]];
        const t2 = terms[order[1]];
        const t3 = terms[order[2]];

        const latex = `${t1.latex} ${op1} ${t2.latex} ${op2} ${t3.latex}`;

        // 5. Sequential Evaluation
        let intermediate;
        if (op1 === '+') intermediate = t1.val + t2.val;
        else intermediate = t1.val - t2.val;

        let ans;
        if (op2 === '+') ans = intermediate + t3.val;
        else ans = intermediate - t3.val;

        // Safety: Prevent negative results for pedagogical simplicity
        if (ans < 0 || intermediate < 0) return this.level4_Powers(lang, variationKey, options);

        const rewriteLatex = `${t1.val} ${op1} ${t2.val} ${op2} ${t3.val}`;

        // 6. Generate Priority-Ordered Clues matching the single cumulative line rule
        const clues = [
            {
                text: lang === 'sv' ? 'Nu lägger vi till ett ännu högre trappsteg på Räknestegen: Potenser (små upphöjda tal) står ALLRA HÖGST upp tillsammans med parenteser!' : 'Now we introduce an even higher step on our math ladder: Powers (small exponent numbers) sit at the ABSOLUTE TOP along with parentheses!',
                latex
            }
        ];
        
        if (useFraction) {
            clues.push({
                text: lang === 'sv' ? `Börja med bråkgruppen. Addera täljaren först och dela sedan med botten så att du frigör värdet ${secondTerm.val}.` : `Start with the fraction block. Add the numerator first, then divide by the bottom to unlock the value ${secondTerm.val}.`,
                latex: `\\dots \\mathbf{${secondTerm.latex}} \\dots = \\dots \\mathbf{${secondTerm.val}} \\dots`
            });
        }

        clues.push({
            text: lang === 'sv' ? `Räkna nu ut potensen uppe i hörnet: ${base} gånger sig själv blir ${pVal}.` : `Now calculate the corner power piece: ${base} times itself equals ${pVal}.`,
            latex: `\\dots \\mathbf{${powerTerm.latex}} \\dots = \\dots \\mathbf{${pVal}} \\dots`
        });

        if (!useFraction) {
            clues.push({
                text: lang === 'sv' ? `Gå ner ett steg på räknestegen och städa bort gångertecknet: ${secondTerm.latex} blir ${secondTerm.val}.` : `Move one step down the ladder and clear away the multiplication dot: ${secondTerm.latex} equals ${secondTerm.val}.`,
                latex: `\\dots \\mathbf{${secondTerm.latex}} \\dots = \\dots \\mathbf{${secondTerm.val}} \\dots`
            });
        }

        clues.push({
            text: lang === 'sv' ? "Nu när alla höga steg är rensade, skriver vi ut den enkla sifferraden på tavlan:" : "Now that all high-priority steps are cleared, let's write out the simple number chain on the board:",
            latex: `= ${rewriteLatex}`
        });

        clues.push({
            text: lang === 'sv' ? `Räkna till sist raden i ordning från vänster till höger för att få fram slutsvar.` : `Finally, calculate the row in straight order from left to right to discover the final answer code.`,
            latex: `\\mathbf{${t1.val} ${op1} ${t2.val}} ${op2} ${t3.val} = \\mathbf{${intermediate}} ${op2} ${t3.val} = ${ans}`
        });

        clues.push({ text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, latex: `${ans}` });

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Beräkna värdet med rätt ordning på stegen." : "Prioritize the correct steps to calculate the expression value.", 
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()), 
            variationKey: 'order_powers', 
            type: 'calculate',
            clues,
            metadata: { variation_key: 'order_powers', difficulty: 4 }
        };
    }
}