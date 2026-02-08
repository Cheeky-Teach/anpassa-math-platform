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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'theory_number_line':
            case 'theory_sign_dominance':
            case 'theory_spot_lie':
                return this.level1_Foundations(lang, key);
            
            case 'fluency_chain_4':
            case 'fluency_chain_5':
            case 'fluency_double_neg':
            case 'fluency_plus_neg':
            case 'fluency_transform_match':
                return this.level2_AddSubFluency(lang, key);
            
            case 'mult_same_sign':
            case 'mult_diff_sign':
            case 'mult_inverse_missing':
            case 'mult_chain':
                return this.level3_Multiplication(lang, key);
            
            case 'div_same_sign':
            case 'div_diff_sign':
            case 'div_check_logic':
                return this.level4_Division(lang, key);

            default:
                return this.generate(1, lang);
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

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['theory_number_line', 'theory_sign_dominance', 'theory_spot_lie']);

        if (v === 'theory_number_line') {
            const start = MathUtils.randomInt(-8, 5);
            const steps = MathUtils.randomInt(2, 6);
            const isRight = Math.random() > 0.5;
            const ans = isRight ? start + steps : start - steps;
            const dir = isRight 
                ? (lang === 'sv' ? "HÖGER" : "RIGHT") 
                : (lang === 'sv' ? "VÄNSTER" : "LEFT");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Föreställ dig att du står på talet ${start} på tallinjen. Om du går exakt ${steps} steg åt ${dir}, på vilket tal hamnar du då?` 
                        : `Imagine you are standing at the number ${start} on the number line. If you move exactly ${steps} steps to the ${dir}, what number do you land on?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `När du går åt ${dir} på tallinjen blir talet ${isRight ? 'större' : 'mindre'}.` : `When you move to the ${dir} on the number line, the number gets ${isRight ? 'larger' : 'smaller'}.`, latex: `${start} ${isRight ? '+' : '-'} ${steps} = ${ans}` }
                ],
                metadata: { variation_key: 'theory_number_line', difficulty: 1 }
            };
        }

        if (v === 'theory_sign_dominance') {
            const pos = MathUtils.randomInt(5, 15);
            const neg = MathUtils.randomInt(-15, -5);
            const isPosLarger = pos > Math.abs(neg);
            const ansLabel = isPosLarger ? (lang === 'sv' ? "Positivt" : "Positive") : (lang === 'sv' ? "Negativt" : "Negative");
            const wrongLabel = isPosLarger ? (lang === 'sv' ? "Negativt" : "Negative") : (lang === 'sv' ? "Positivt" : "Positive");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Utan att räkna ut det exakta svaret, avgör om resultatet av $${pos} + (${neg})$ blir positivt eller negativt.` 
                        : `Without calculating the exact answer, determine if the result of $${pos} + (${neg})$ will be positive or negative.`,
                    answerType: 'multiple_choice',
                    options: [ansLabel, wrongLabel]
                },
                token: this.toBase64(ansLabel),
                clues: [
                    { text: lang === 'sv' ? "Titta på vilket tal som har störst avstånd till noll (störst absolutbelopp). Det tecknet vinner." : "Look at which number has the greatest distance to zero (greatest absolute value). That sign wins.", latex: `|${pos}| \\text{ vs } |${neg}|` }
                ],
                metadata: { variation_key: 'theory_sign_dominance', difficulty: 1 }
            };
        }

        const generateComparison = (isCorrect: boolean) => {
            const n1 = MathUtils.randomInt(-12, -1);
            const n2 = MathUtils.randomInt(-12, -1);
            if (n1 === n2) return "0 > -1"; // Fallback
            const realCorrect = n1 > n2;
            const text = realCorrect === isCorrect ? `${n1} > ${n2}` : `${n1} < ${n2}`;
            return text;
        };

        const lie = generateComparison(false);
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket av följande påståenden om negativa tals storleksordning är FALSKT?" : "Which of the following statements about the magnitude of negative numbers is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([generateComparison(true), generateComparison(true), lie])
            },
            token: this.toBase64(lie),
            clues: [{ text: lang === 'sv' ? "Tänk på att ett negativt tal som är 'långt till vänster' på tallinjen alltid är mindre än ett tal närmare noll." : "Keep in mind that a negative number that is 'far to the left' on the number line is always smaller than a number closer to zero." }],
            metadata: { variation_key: 'theory_spot_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 2: ADD/SUB FLUENCY ---
    private level2_AddSubFluency(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['fluency_chain_4', 'fluency_double_neg', 'fluency_plus_neg', 'fluency_transform_match']);

        if (v.startsWith('fluency_chain')) {
            const numTerms = v.endsWith('5') ? 5 : 4;
            const terms = Array.from({length: numTerms}, () => MathUtils.randomInt(-10, 10));
            const ops = Array.from({length: numTerms - 1}, () => MathUtils.randomChoice(['+', '-']));

            let latex = this.p(terms[0]);
            let runningTotal = terms[0];
            let simplifiedParts = [terms[0].toString()];

            for(let i=0; i < numTerms - 1; i++) {
                const next = terms[i+1];
                const op = ops[i];
                latex += ` ${op} ${this.p(next)}`;
                if (op === '+') runningTotal += next; else runningTotal -= next;

                const effectiveSign = (op === '+' && next >= 0) || (op === '-' && next < 0) ? '+' : '-';
                simplifiedParts.push(`${effectiveSign} ${Math.abs(next)}`);
            }

            return {
                renderData: {
                    latex: latex,
                    description: lang === 'sv' ? "Beräkna värdet av uttrycket genom att steg för steg förenkla tecknen." : "Calculate the value of the expression by simplifying the signs step by step.",
                    answerType: 'numeric'
                },
                token: this.toBase64(runningTotal.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Skriv om uttrycket genom att förenkla alla dubbeltecken först." : "Step 1: Rewrite the expression by simplifying all double signs first.", latex: simplifiedParts.join(" ") },
                    { text: lang === 'sv' ? "Steg 2: Räkna ut summan från vänster till höger." : "Step 2: Calculate the sum from left to right.", latex: `\\text{Resultat} = ${runningTotal}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        if (v === 'fluency_transform_match') {
            const a = MathUtils.randomInt(-5, 5);
            const b = MathUtils.randomInt(2, 9);
            const op = MathUtils.randomChoice(['+', '-']);
            const correct = op === '-' ? `${a} + ${b}` : `${a} - ${b}`;
            const wrong = op === '-' ? `${a} - ${b}` : `${a} + ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket förenklat uttryck betyder exakt samma sak som: $${a} ${op} (-${b})$?` : `Which simplified expression means exactly the same as: $${a} ${op} (-${b})$?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong, `${a} ${op} ${b}`])
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Kom ihåg teckenreglerna: plus och minus blir minus, medan två minus blir plus." : "Remember the sign rules: plus and minus become minus, while two minuses become plus.", latex: op === '-' ? "-(-) \\rightarrow +" : "+(-) \\rightarrow -" }],
                metadata: { variation_key: 'fluency_transform_match', difficulty: 2 }
            };
        }

        const a = MathUtils.randomInt(-10, 10);
        const b = MathUtils.randomInt(1, 10);
        const op = v === 'fluency_double_neg' ? '-' : '+';
        const ans = op === '-' ? a + b : a - b;

        return {
            renderData: {
                latex: `${a} ${op} (-${b})`,
                description: lang === 'sv' ? "Förenkla de dubbla tecknen och beräkna det slutgiltiga värdet." : "Simplify the double signs and calculate the final value.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? (op === '-' ? "Två minustecken intill varandra blir ett plus." : "Ett plustecken och ett minustecken intill varandra blir ett minus.") : (op === '-' ? "Two minus signs next to each other become a plus." : "A plus sign and a minus sign next to each other become a minus."), latex: op === '-' ? "-(-) \\rightarrow +" : "+(-) \\rightarrow -" }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: MULTIPLICATION ---
    private level3_Multiplication(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_same_sign', 'mult_diff_sign', 'mult_inverse_missing', 'mult_chain']);

        if (v === 'mult_chain') {
            const numTerms = MathUtils.randomInt(3, 5);
            const factors = Array.from({length: numTerms}, () => {
                let n = MathUtils.randomInt(-5, 5);
                return n === 0 ? 1 : n; // Avoid zero for sign tracking focus
            });
            
            const ans = factors.reduce((acc, cur) => acc * cur, 1);
            const negCount = factors.filter(f => f < 0).length;
            const isEven = negCount % 2 === 0;

            const latex = factors.map(f => this.p(f)).join(' \\cdot ');

            return {
                renderData: {
                    latex,
                    description: lang === 'sv' 
                        ? "Beräkna produkten av alla talen i kedjan. Var extra noga med om svaret ska bli positivt eller negativt!" 
                        : "Calculate the product of all the numbers in the chain. Pay extra attention to whether the answer should be positive or negative!",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Räkna hur många negativa tal det finns. Det är ${negCount} stycken.` 
                            : `Step 1: Count how many negative numbers there are. There are ${negCount}.`, 
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' 
                            ? (isEven ? `Ett jämnt antal minustecken (${negCount}) gör att resultatet blir POSITIVT.` : `Ett udda antal minustecken (${negCount}) gör att resultatet blir NEGATIVT.`)
                            : (isEven ? `An even number of minus signs (${negCount}) results in a POSITIVE answer.` : `An odd number of minus signs (${negCount}) results in a NEGATIVE answer.`), 
                        latex: isEven ? "(-) \\cdot (-) = +" : "(-) \\cdot (-) \\cdot (-) = -"
                    },
                    {
                        text: lang === 'sv' ? "Steg 2: Multiplicera siffervärdena som vanligt." : "Step 2: Multiply the numerical values as usual.",
                        latex: factors.map(f => Math.abs(f)).join(' \\cdot ') + ` = ${Math.abs(ans)}`
                    }
                ],
                metadata: { variation_key: 'mult_chain', difficulty: 4 }
            };
        }

        const aVal = MathUtils.randomInt(2, 9), bVal = MathUtils.randomInt(2, 9);
        const signA = Math.random() > 0.5 ? 1 : -1;
        const signB = (v === 'mult_same_sign') ? signA : (v === 'mult_diff_sign' ? -signA : (Math.random() > 0.5 ? 1 : -1));
        
        const a = aVal * signA, b = bVal * signB;
        const ans = a * b;

        if (v === 'mult_inverse_missing') {
            return {
                renderData: {
                    latex: `${this.p(a)} \\cdot ? = ${ans}`,
                    description: lang === 'sv' ? "Vilken faktor saknas för att multiplikationen ska stämma?" : "What factor is missing for the multiplication to be correct?",
                    answerType: 'numeric'
                },
                token: this.toBase64(b.toString()),
                clues: [{ text: lang === 'sv' ? `Om produkten är ${ans > 0 ? 'positiv' : 'negativ'} och den första faktorn är ${a > 0 ? 'positiv' : 'negativ'}, vad måste då den andra faktorn ha för tecken?` : `If the product is ${ans > 0 ? 'positive' : 'negative'} and the first factor is ${a > 0 ? 'positive' : 'negative'}, what sign must the second factor have?` }],
                metadata: { variation_key: 'mult_inverse_missing', difficulty: 3 }
            };
        }

        return {
            renderData: {
                latex: `${this.p(a)} \\cdot ${this.p(b)}`,
                description: lang === 'sv' ? "Beräkna produkten av de två talen." : "Calculate the product of the two numbers.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Steg 1: Bestäm tecknet. Lika tecken ger ett positivt svar, olika tecken ger ett negativt svar." : "Step 1: Determine the sign. Like signs give a positive answer, different signs give a negative answer.", latex: signA === signB ? "(-) \\cdot (-) = +" : "(+) \\cdot (-) = -" },
                { text: lang === 'sv' ? `Steg 2: Multiplicera siffervärdena: $${aVal} \\cdot ${bVal} = ${Math.abs(ans)}$.` : `Step 2: Multiply the numerical values: $${aVal} \\cdot ${bVal} = ${Math.abs(ans)}$.`, latex: "" }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 4: DIVISION ---
    private level4_Division(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['div_same_sign', 'div_diff_sign', 'div_check_logic']);
        const bVal = MathUtils.randomInt(2, 10), resVal = MathUtils.randomInt(2, 10);
        const signB = Math.random() > 0.5 ? 1 : -1;
        const signRes = (v === 'div_same_sign') ? (signB === 1 ? 1 : -1) : (v === 'div_diff_sign' ? -signB : (Math.random() > 0.5 ? 1 : -1));
        
        const b = bVal * signB, res = resVal * signRes;
        const a = b * res;

        if (v === 'div_check_logic') {
            const options = [
                `${this.p(res)} · ${this.p(b)} = ${a}`,
                `${this.p(res)} + ${this.p(b)} = ${a}`,
                `${this.p(a)} · ${this.p(b)} = ${res}`
            ];
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken multiplikation bevisar att divisionen $${a} / ${this.p(b)} = ${res}$ är korrekt?` : `Which multiplication proves that the division $${a} / ${this.p(b)} = ${res}$ is correct?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(options[0]),
                clues: [{ text: lang === 'sv' ? "Division är multiplikation baklänges. Kvoten gånger nämnaren ska alltid bli lika med täljaren." : "Division is multiplication in reverse. The quotient times the denominator must always equal the numerator." }],
                metadata: { variation_key: 'div_check_logic', difficulty: 2 }
            };
        }

        return {
            renderData: {
                latex: `\\frac{${a}}{${this.p(b)}}`,
                description: lang === 'sv' ? "Beräkna kvoten av divisionen." : "Calculate the quotient of the division.",
                answerType: 'numeric'
            },
            token: this.toBase64(res.toString()),
            clues: [
                { text: lang === 'sv' ? "Teckenreglerna för division är exakt desamma som för multiplikation." : "The sign rules for division are exactly the same as for multiplication.", latex: (a > 0 && b > 0) || (a < 0 && b < 0) ? "(-) / (-) = +" : "(-) / (+) = -" }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    private level5_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        const data = this.generate(lvl, lang);
        data.metadata.mixed = true;
        return data;
    }
}