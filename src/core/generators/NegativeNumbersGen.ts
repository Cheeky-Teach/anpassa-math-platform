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
                    { 
                        text: lang === 'sv' ? `När du går åt ${dir} på tallinjen blir talet ${isRight ? 'större (addition)' : 'mindre (subtraktion)'}.` : `When you move to the ${dir} on the number line, the number gets ${isRight ? 'larger (addition)' : 'smaller (subtraction)'}.`, 
                        latex: `${start} ${isRight ? '+' : '-'} ${steps}` 
                    },
                    {
                        text: lang === 'sv' ? "Du hamnar på talet:" : "You land on the number:",
                        latex: `${ans}`
                    }
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
                    { 
                        text: lang === 'sv' ? "Jämför talens avstånd till noll (absolutbelopp). Det tal som är längst ifrån noll bestämmer tecknet på svaret." : "Compare the numbers' distance to zero (absolute value). The number furthest from zero determines the sign of the answer.", 
                        latex: `|${pos}| \\text{ vs } |${neg}|` 
                    },
                    {
                        text: lang === 'sv' ? "Resultatet blir därför:" : "The result will therefore be:",
                        latex: `\\text{${ansLabel}}`
                    }
                ],
                metadata: { variation_key: 'theory_sign_dominance', difficulty: 1 }
            };
        }

        const generateComparison = (isCorrect: boolean) => {
            const n1 = MathUtils.randomInt(-12, -1);
            const n2 = MathUtils.randomInt(-12, -1);
            if (n1 === n2) return "-2 > -5"; 
            const realCorrect = n1 > n2;
            return realCorrect === isCorrect ? `${n1} > ${n2}` : `${n1} < ${n2}`;
        };

        const sFalse = generateComparison(false);
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående om negativa tals storleksordning är FALSKT?" : "Which of the following statements about the magnitude of negative numbers is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([generateComparison(true), generateComparison(true), sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { 
                    text: lang === 'sv' ? "Ju längre till vänster ett tal står på tallinjen, desto mindre är det. Ett tal som är 'mer negativt' är mindre." : "The further left a number is on the number line, the smaller it is. A number that is 'more negative' is smaller.",
                    latex: "-10 < -2"
                },
                {
                    text: lang === 'sv' ? "Detta påstående stämmer inte:" : "This statement is incorrect:",
                    latex: `\\text{${sFalse}}`
                }
            ],
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
                    description: lang === 'sv' ? "Beräkna värdet av uttrycket." : "Calculate the value of the expression.",
                    answerType: 'numeric'
                },
                token: this.toBase64(runningTotal.toString()),
                clues: [
                    { text: lang === 'sv' ? "Börja med att förenkla alla dubbeltecken så att varje tal bara har ett tecken framför sig." : "Start by simplifying all double signs so each number has only one sign in front of it.", latex: simplifiedParts.join(" ") },
                    { text: lang === 'sv' ? "Räkna nu ut summan från vänster till höger." : "Now calculate the sum from left to right.", latex: `${runningTotal}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        if (v === 'fluency_transform_match') {
            const a = MathUtils.randomInt(-5, 5);
            const b = MathUtils.randomInt(2, 9);
            const op = MathUtils.randomChoice(['+', '-']);
            const correct = op === '-' ? `${a} + ${b}` : `${a} - ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket förenklat uttryck betyder samma sak som: $${a} ${op} (-${b})$?` : `Which simplified expression means the same as: $${a} ${op} (-${b})$?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, `${a} ${op} ${b}`, `${a} ${op === '-' ? '-' : '+'} ${b}`])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Följ teckenregeln: Två minus blir plus, medan plus och minus blir minus." : "Follow the sign rule: Two minuses become plus, while plus and minus become minus.", latex: op === '-' ? "-(-) \\rightarrow +" : "+(-) \\rightarrow -" },
                    { text: lang === 'sv' ? "Det korrekta uttrycket är:" : "The correct expression is:", latex: `\\text{${correct}}` }
                ],
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
                description: lang === 'sv' ? "Förenkla tecknen och beräkna värdet." : "Simplify the signs and calculate the value.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? (op === '-' ? "Två minustecken bredvid varandra förvandlas till ett plustecken." : "Ett plus och ett minus bredvid varandra förvandlas till ett minustecken.") : (op === '-' ? "Two minus signs next to each other turn into a plus sign." : "A plus and a minus next to each other turn into a minus sign."), latex: op === '-' ? `${a} + ${b}` : `${a} - ${b}` },
                { text: lang === 'sv' ? "Slutresultatet blir:" : "The final result is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 2 }
        };
    }

    // --- LEVEL 3: MULTIPLICATION ---
    private level3_Multiplication(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['mult_same_sign', 'mult_diff_sign', 'mult_inverse_missing', 'mult_chain']);

        if (v === 'mult_chain') {
            const numTerms = MathUtils.randomInt(3, 4);
            const factors = Array.from({length: numTerms}, () => {
                let n = MathUtils.randomInt(-4, 4);
                return n === 0 ? 1 : n;
            });
            const ans = factors.reduce((acc, cur) => acc * cur, 1);
            const negCount = factors.filter(f => f < 0).length;
            const isEven = negCount % 2 === 0;

            return {
                renderData: {
                    latex: factors.map(f => this.p(f)).join(' \\cdot '),
                    description: lang === 'sv' ? "Beräkna produkten av talen." : "Calculate the product of the numbers.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Räkna antalet negativa tecken. Här finns det ${negCount} stycken.` : `Count the number of negative signs. There are ${negCount} here.`, latex: `\\text{Antal minus} = ${negCount}` },
                    { text: lang === 'sv' ? (isEven ? "Eftersom antalet minus är jämnt blir svaret positivt." : "Eftersom antalet minus är udda blir svaret negativt.") : (isEven ? "Since the number of minuses is even, the answer is positive." : "Since the number of minuses is odd, the answer is negative."), latex: isEven ? "+" : "-" },
                    { text: lang === 'sv' ? "Multiplicera siffervärdena och lägg till tecknet:" : "Multiply the numerical values and apply the sign:", latex: `${ans}` }
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
                    description: lang === 'sv' ? "Hitta den saknade faktorn." : "Find the missing factor.",
                    answerType: 'numeric'
                },
                token: this.toBase64(b.toString()),
                clues: [
                    { text: lang === 'sv' ? `Dela produkten (${ans}) med den kända faktorn (${a}) för att hitta x.` : `Divide the product (${ans}) by the known factor (${a}) to find x.`, latex: `x = \\frac{${ans}}{${this.p(a)}}` },
                    { text: lang === 'sv' ? "Den saknade faktorn är:" : "The missing factor is:", latex: `${b}` }
                ],
                metadata: { variation_key: 'mult_inverse_missing', difficulty: 3 }
            };
        }

        return {
            renderData: {
                latex: `${this.p(a)} \\cdot ${this.p(b)}`,
                description: lang === 'sv' ? "Multiplicera talen." : "Multiply the numbers.",
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Lika tecken (+/+) eller (-/-) ger ett positivt svar. Olika tecken (+/-) ger ett negativt svar." : "Like signs (+/+) or (-/-) give a positive answer. Different signs (+/-) give a negative answer.", latex: signA === signB ? "(-) \\cdot (-) = +" : "(+) \\cdot (-) = -" },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
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
            const correct = `${this.p(res)} \\cdot ${this.p(b)} = ${a}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket samband bevisar att $${a} / ${this.p(b)} = ${res}$?` : `Which relationship proves that $${a} / ${this.p(b)} = ${res}$?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, `${this.p(res)} + ${this.p(b)} = ${a}`, `${this.p(a)} \\cdot ${this.p(b)} = ${res}`])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Kontrollera divisionen genom att multiplicera svaret (kvoten) med talet där nere (nämnaren)." : "Check the division by multiplying the answer (quotient) by the number at the bottom (denominator).", latex: "\\text{Kvoten} \\cdot \\text{Nämnaren} = \\text{Täljaren}" },
                    { text: lang === 'sv' ? "Rätt samband är:" : "The correct relationship is:", latex: correct }
                ],
                metadata: { variation_key: 'div_check_logic', difficulty: 2 }
            };
        }

        return {
            renderData: {
                latex: `\\frac{${a}}{${this.p(b)}}`,
                description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.",
                answerType: 'numeric'
            },
            token: this.toBase64(res.toString()),
            clues: [
                { text: lang === 'sv' ? "Teckenreglerna för division fungerar exakt som för multiplikation." : "The sign rules for division work exactly like those for multiplication.", latex: (a > 0 && b > 0) || (a < 0 && b < 0) ? "(-) / (-) = +" : "(-) / (+) = -" },
                { text: lang === 'sv' ? "Kvoten är:" : "The quotient is:", latex: `${res}` }
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