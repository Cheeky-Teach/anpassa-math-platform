import { MathUtils } from '../utils/MathUtils.js';

export class NegativeNumbersGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Foundations(lang);
            case 2: return this.level2_AddSubFluency(lang);
            case 3: return this.level3_Multiplication(lang);
            case 4: return this.level4_Division(lang);
            case 5: return this.level5_Mixed(lang);
            default: return this.level1_Foundations(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    /**
     * Formats negative numbers with parentheses for LaTeX if needed
     */
    private p(n: number): string {
        return n < 0 ? `(${n})` : `${n}`;
    }

    // --- LEVEL 1: FOUNDATIONS (Theory & Number Line) ---
    private level1_Foundations(lang: string): any {
        const variation = Math.random();

        // Variation A: Number Line Direction
        if (variation < 0.35) {
            const start = MathUtils.randomInt(-8, 5);
            const steps = MathUtils.randomInt(2, 6);
            const isRight = Math.random() > 0.5;
            const ans = isRight ? start + steps : start - steps;
            const dirSv = isRight ? "HÖGER" : "VÄNSTER";
            const dirEn = isRight ? "RIGHT" : "LEFT";

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Du står på ${start} på tallinjen och går ${steps} steg åt ${dirSv}. Var hamnar du?` 
                        : `You are at ${start} on the number line and move ${steps} steps to the ${dirEn}. Where do you land?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Tänk på en termometer eller en tallinje.` : `Think of a thermometer or a number line.`, latex: "" },
                    { text: lang === 'sv' ? `Att gå åt ${dirSv} betyder att talet blir ${isRight ? 'större' : 'mindre'}.` : `Moving to the ${dirEn} means the number gets ${isRight ? 'larger' : 'smaller'}.`, latex: `${start} ${isRight ? '+' : '-'} ${steps} = ${ans}` }
                ],
                metadata: { variation: 'theory_number_line', difficulty: 1 }
            };
        }

        // Variation B: Magnitude Logic (Conceptual)
        if (variation < 0.7) {
            const pos = MathUtils.randomInt(5, 15);
            const neg = MathUtils.randomInt(-15, -5);
            const isPosLarger = pos > Math.abs(neg);
            const q = lang === 'sv' 
                ? `Blir resultatet av ${pos} + (${neg}) positivt eller negativt?` 
                : `Will the result of ${pos} + (${neg}) be positive or negative?`;
            
            const ans = isPosLarger ? (lang === 'sv' ? "Positivt" : "Positive") : (lang === 'sv' ? "Negativt" : "Negative");
            const wrong = isPosLarger ? (lang === 'sv' ? "Negativt" : "Negative") : (lang === 'sv' ? "Positivt" : "Positive");

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: [ans, wrong]
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Jämför avståndet till noll (absolutbeloppet). Vilket tal är 'starkast'?" : "Compare the distance to zero (absolute value). Which number is 'strongest'?", latex: `|${pos}| \\text{ vs } |${neg}|` },
                    { text: lang === 'sv' ? `Eftersom ${isPosLarger ? pos : neg} har störst absolutvärde kommer dess tecken att styra resultatet.` : `Since ${isPosLarger ? pos : neg} has the larger absolute value, its sign will control the result.`, latex: "" }
                ],
                metadata: { variation: 'theory_sign_dominance', difficulty: 1 }
            };
        }

        // Variation C: Spot the Lie (Dynamic)
        const generateComparison = (isCorrect: boolean) => {
            const n1 = MathUtils.randomInt(-10, 0);
            const n2 = MathUtils.randomInt(-10, 0);
            if (n1 === n2) return generateComparison(isCorrect);
            if (isCorrect) return n1 > n2 ? `${n1} > ${n2}` : `${n2} > ${n1}`;
            else return n1 > n2 ? `${n2} > ${n1}` : `${n1} > ${n2}`;
        };

        const sTrue1 = generateComparison(true);
        const sTrue2 = generateComparison(true);
        const sFalse = generateComparison(false);

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående om storleksordning är FALSKT?" : "Which statement about magnitude is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { text: lang === 'sv' ? "Kom ihåg: På tallinjen är talet till höger alltid större. -1 är närmare noll och därför större än -10." : "Remember: On the number line, the number to the right is always larger. -1 is closer to zero and therefore larger than -10.", latex: "" }
            ],
            metadata: { variation: 'theory_spot_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: ADD/SUB FLUENCY (Sign Transformations & Chains) ---
    private level2_AddSubFluency(lang: string): any {
        const variation = Math.random();

        // --- Variation C: The Ultimate Chain Fluency (New) ---
        // Tests 4-5 terms with randomized signs and operators
        if (variation < 0.4) {
            const numTerms = MathUtils.randomChoice([4, 5]);
            const terms = [];
            const ops = [];
            
            for(let i=0; i<numTerms; i++) terms.push(MathUtils.randomInt(-10, 10));
            for(let i=0; i<numTerms-1; i++) ops.push(MathUtils.randomChoice(['+', '-']));

            let latex = this.p(terms[0]);
            let simplifiedParts = [terms[0].toString()];
            let runningTotal = terms[0];

            for(let i=0; i<numTerms-1; i++) {
                const nextTerm = terms[i+1];
                const op = ops[i];
                latex += ` ${op} ${this.p(nextTerm)}`;

                // Calculate result
                if (op === '+') runningTotal += nextTerm;
                else runningTotal -= nextTerm;

                // Create simplified pedagogical step (+- -> -, -- -> +)
                const effectiveSign = (op === '+' && nextTerm >= 0) || (op === '-' && nextTerm < 0) ? '+' : '-';
                const signStr = i === 0 && simplifiedParts[0].startsWith('+') ? "" : effectiveSign;
                simplifiedParts.push(`${effectiveSign} ${Math.abs(nextTerm)}`);
            }

            const simplifiedLatex = simplifiedParts.join(" ").replace("+ +", "+").replace("- +", "-");

            return {
                renderData: {
                    latex: latex,
                    description: lang === 'sv' ? "Beräkna värdet av uttrycket." : "Calculate the value of the expression.",
                    answerType: 'numeric'
                },
                token: this.toBase64(runningTotal.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Steg 1: Förenkla alla dubbeltecken först." : "Step 1: Simplify all double signs first.", 
                        latex: simplifiedLatex 
                    },
                    { 
                        text: lang === 'sv' ? "Steg 2: Räkna ut summan steg för steg från vänster till höger." : "Step 2: Calculate the sum step-by-step from left to right.", 
                        latex: `\\text{Resultat} = ${runningTotal}` 
                    }
                ],
                metadata: { variation: `fluency_chain_${numTerms}`, difficulty: 4 }
            };
        }

        // Variation A: Double Sign Standard Practice
        if (variation < 0.8) {
            const a = MathUtils.randomInt(-10, 10);
            const b = MathUtils.randomInt(1, 10);
            const op = MathUtils.randomChoice(['+', '-']);
            const ans = op === '+' ? a + (-b) : a - (-b);

            return {
                renderData: {
                    latex: `${a} ${op} (-${b})`,
                    description: lang === 'sv' ? "Förenkla tecknen och beräkna." : "Simplify the signs and calculate.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: op === '-' 
                            ? (lang === 'sv' ? "Två minus blir PLUS. Att ta bort en skuld är som att få pengar." : "Two minuses become PLUS. Removing a debt is like getting money.")
                            : (lang === 'sv' ? "Plus och minus blir MINUS. Att lägga till en skuld minskar värdet." : "Plus and minus become MINUS. Adding a debt reduces the value."), 
                        latex: op === '-' ? "- (-) \\rightarrow +" : "+ (-) \\rightarrow -" 
                    },
                    { 
                        text: lang === 'sv' ? "Skriv om uttrycket:" : "Rewrite the expression:", 
                        latex: `${a} ${op === '-' ? '+' : '-'} ${b} = ${ans}` 
                    }
                ],
                metadata: { variation: op === '-' ? 'fluency_double_neg' : 'fluency_plus_neg', difficulty: 2 }
            };
        }

        // Variation B: Sign Transformation Match
        const a = MathUtils.randomInt(-10, 10);
        const b = MathUtils.randomInt(1, 10);
        const op = MathUtils.randomChoice(['+', '-']);
        const correctForm = op === '-' ? `${a} + ${b}` : `${a} - ${b}`;
        const wrongForm = op === '-' ? `${a} - ${b}` : `${a} + ${b}`;
        
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket uttryck betyder samma sak som: ${a} ${op} (-${b})?` : `Which expression means the same as: ${a} ${op} (-${b})?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([correctForm, wrongForm, `${a} ${op} ${b}`])
            },
            token: this.toBase64(correctForm),
            clues: [
                { text: lang === 'sv' ? "Kolla bara på tecknen i mitten. +(-) blir minus, -(-) blir plus." : "Just look at the signs in the middle. +(-) becomes minus, -(-) becomes plus.", latex: "" }
            ],
            metadata: { variation: 'fluency_transform_match', difficulty: 2 }
        };
    }

    // --- LEVEL 3: MULTIPLICATION ---
    private level3_Multiplication(lang: string): any {
        const variation = Math.random();
        const aVal = MathUtils.randomInt(2, 9);
        const bVal = MathUtils.randomInt(2, 9);
        const signA = Math.random() > 0.5 ? 1 : -1;
        const signB = Math.random() > 0.5 ? 1 : -1;
        const a = aVal * signA;
        const b = bVal * signB;
        const ans = a * b;
        const sameSign = signA === signB;

        if (variation < 0.6) {
            return {
                renderData: {
                    latex: `${this.p(a)} \\cdot ${this.p(b)}`,
                    description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Steg 1: Bestäm tecknet. Lika tecken ger (+), olika tecken ger (-)." : "Step 1: Determine the sign. Same signs result in (+), different signs result in (-).", 
                        latex: sameSign ? "(-) \\cdot (-) = +" : "(+) \\cdot (-) = -" 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Multiplicera siffrorna: ${aVal} x ${bVal} = ${Math.abs(ans)}.` : `Step 2: Multiply the numbers: ${aVal} x ${bVal} = ${Math.abs(ans)}.`, 
                        latex: "" 
                    }
                ],
                metadata: { variation: sameSign ? 'mult_same_sign' : 'mult_diff_sign', difficulty: 2 }
            };
        }

        return {
            renderData: {
                latex: `${this.p(a)} \\cdot ? = ${ans}`,
                description: lang === 'sv' ? "Hitta faktorn som saknas." : "Find the missing factor.",
                answerType: 'numeric'
            },
            token: this.toBase64(b.toString()),
            clues: [
                { text: lang === 'sv' ? `Om resultatet är ${ans > 0 ? 'positivt' : 'negativt'}, vad säger det om tecknet på det saknade talet?` : `If the result is ${ans > 0 ? 'positive' : 'negative'}, what does that say about the sign of the missing number?`, latex: "" }
            ],
            metadata: { variation: 'mult_inverse_missing', difficulty: 3 }
        };
    }

    // --- LEVEL 4: DIVISION ---
    private level4_Division(lang: string): any {
        const variation = Math.random();
        const bVal = MathUtils.randomInt(2, 10);
        const resVal = MathUtils.randomInt(2, 10);
        const signB = Math.random() > 0.5 ? 1 : -1;
        const signRes = Math.random() > 0.5 ? 1 : -1;
        
        const b = bVal * signB;
        const res = resVal * signRes;
        const a = res * b;
        const sameSign = (a > 0 && b > 0) || (a < 0 && b < 0);

        if (variation < 0.7) {
            return {
                renderData: {
                    latex: `\\frac{${a}}{${b}}`,
                    description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.",
                    answerType: 'numeric'
                },
                token: this.toBase64(res.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Steg 1: Bestäm tecknet. Samma regler som för multiplikation gäller." : "Step 1: Determine the sign. The same rules as for multiplication apply.", 
                        latex: sameSign ? "(-) / (-) = +" : "(-) / (+) = -" 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Dividera siffrorna: ${Math.abs(a)} / ${Math.abs(b)} = ${resVal}.` : `Step 2: Divide the numbers: ${Math.abs(a)} / ${Math.abs(b)} = ${resVal}.`, 
                        latex: "" 
                    }
                ],
                metadata: { variation: sameSign ? 'div_same_sign' : 'div_diff_sign', difficulty: 2 }
            };
        }

        // Corrected options to use 'x' instead of '\cdot' for button rendering
        const options = [
            `${this.p(res)} x ${this.p(b)} = ${a}`,
            `${this.p(res)} + ${this.p(b)} = ${a}`,
            `${this.p(a)} x ${this.p(b)} = ${res}`
        ];

        return {
            renderData: {
                description: lang === 'sv' ? `Vilken multiplikation bevisar att ${a} / ${b} = ${res}?` : `Which multiplication proves that ${a} / ${b} = ${res}?`,
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options)
            },
            token: this.toBase64(options[0]),
            clues: [
                { text: lang === 'sv' ? "Division är multiplikation baklänges. Kvoten gånger nämnaren måste bli täljaren." : "Division is multiplication in reverse. The quotient times the denominator must equal the numerator.", latex: "" }
            ],
            metadata: { variation: 'div_check_logic', difficulty: 2 }
        };
    }

    private level5_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        const data = this.generate(lvl, lang);
        data.metadata.mixed = true;
        return data;
    }
}