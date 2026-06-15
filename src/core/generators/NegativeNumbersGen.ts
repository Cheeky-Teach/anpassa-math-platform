import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class NegativeNumbersGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to calculation fluency
        if (level === 1 && options.hideConcept && options.exclude?.includes('theory_number_line')) {
            return this.level2_AddSubFluency(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Foundations(lang, undefined, options); break;
            case 2: questionData = this.level2_AddSubFluency(lang, undefined, options); break;
            case 3: questionData = this.level3_Multiplication(lang, undefined, options); break;
            case 4: questionData = this.level4_Division(lang, undefined, options); break;
            case 5: questionData = this.level5_Mixed(lang, options); break;
            default: questionData = this.level1_Foundations(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [2, 3, 4, 5];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js exactly to prevent breakage.
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
     * Formats negative numbers with parentheses for LaTeX consistency
     */
    private p(n: number): string {
        return n < 0 ? `(${n})` : `${n}`;
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

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'theory_number_line', type: 'calculate' },
            { key: 'theory_sign_dominance', type: 'concept' },
            { key: 'theory_spot_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'theory_number_line') {
            const start = MathUtils.randomInt(-8, 5);
            const steps = MathUtils.randomInt(3, 7);
            const isRight = Math.random() > 0.5;
            const ans = isRight ? start + steps : start - steps;
            const dirSv = isRight ? "höger" : "vänster";
            const dirEn = isRight ? "right" : "left";
            const op = isRight ? '+' : '-';

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Du står på talet ${start} på tallinjen. Om du går ${steps} steg åt ${dirSv}, på vilket tal hamnar du?` 
                        : `You are at ${start} on the number line. If you move ${steps} steps to the ${dirEn}, what number do you land on?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Tänk på tallinjen som en liggande termometer. Vi startar på siffran ${start}.` : `Think of the number line as a horizontal thermometer. We start at the number ${start}.`, 
                        latex: `\\text{Start} = ${start}` 
                    },
                    { 
                        text: lang === 'sv' ? (isRight ? `Att gå åt höger betyder att det blir större. Vi plussar på (+) steg.` : `Att gå åt vänster betyder att det blir mindre. Vi minusar (-) steg.`) : (isRight ? `Moving right means it gets bigger. We add (+) steps.` : `Moving left means it gets smaller. We subtract (-) steps.`), 
                        latex: `\\text{Uträkning: } ${start} \\mathbf{${op}} ${steps}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna stegen längs linjen för hita var vi landar till slut.` : `Count the steps along the line to find where we end up at last.`, 
                        latex: `${start} ${op} ${steps} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        if (v === 'theory_sign_dominance') {
            const pos = MathUtils.randomInt(10, 25);
            const neg = MathUtils.randomInt(-30, -11);
            const isNegStronger = Math.abs(neg) > pos;
            const ans = isNegStronger ? (lang === 'sv' ? "Negativt" : "Negative") : (lang === 'sv' ? "Positivt" : "Positive");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Utan att räkna ut svaret, avgör om $${pos} + (${neg})$ blir positivt eller negativt.` 
                        : `Without calculating the answer, determine if $${pos} + (${neg})$ will be positive or negative.`,
                    answerType: 'multiple_choice', options: lang === 'sv' ? ["Positivt", "Negativt"] : ["Positive", "Negative"]
                },
                token: this.toBase64(ans), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Tänk på detta som en dragkamp mellan det positiva laget och det negativa laget." : "Think of this as a tug-of-war match between the positive team and the negative team.", 
                        latex: `${pos} + (${neg})` 
                    },
                    { 
                        text: lang === 'sv' ? `Det positiva laget drar med styrkan ${pos}. Det negativa laget drar åt andra hållet med styrkan ${Math.abs(neg)}.` : `The positive team pulls with a strength of ${pos}. The negative team pulls the other way with a strength of ${Math.abs(neg)}.`, 
                        latex: `\\text{Styrka: } ${pos} \\quad \\text{mot} \\quad \\mathbf{${Math.abs(neg)}}` 
                    },
                    { 
                        text: lang === 'sv' ? (isNegStronger ? `Eftersom ${Math.abs(neg)} är större än ${pos}, vinner det negativa laget kampen.` : `Eftersom ${pos} är större än ${Math.abs(neg)}, vinner det positiva laget kampen.`) : (isNegStronger ? `Since ${Math.abs(neg)} is larger than ${pos}, the negative team wins the pull.` : `Since ${pos} is larger than ${Math.abs(neg)}, the positive team wins the pull.`), 
                        latex: isNegStronger ? `${Math.abs(neg)} > ${pos} \\rightarrow \\mathbf{\\text{${ans}}}` : `${pos} > ${Math.abs(neg)} \\rightarrow \\mathbf{\\text{${ans}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `\\text{${ans}}` 
                    }
                ]
            };
        }

        const n1 = MathUtils.randomInt(-20, -10), n2 = MathUtils.randomInt(-9, -2);
        const lie = `${n1} > ${n2}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående stämmer inte?" : "Which statement is NOT correct?",
                answerType: 'multiple_choice', options: MathUtils.shuffle([`${n2} > ${n1}`, lie, "-1 < 0", "0 > -5"])
            },
            token: this.toBase64(lie), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "På en termometer är talen mindre ju kallare de är (längre ner eller längre till vänster)." : "On a thermometer, numbers are smaller the colder they get (further down or further left).", 
                    latex: `\\text{Jämför: } ${n1} \\quad \\text{och} \\quad ${n2}` 
                },
                { 
                    text: lang === 'sv' ? `Talet ${n1} är mycket kallare och ligger längre ner än talet ${n2}.` : `The number ${n1} is much colder and sits further down than the number ${n2}.`, 
                    latex: `${n1} < ${n2}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom ${n1} är mindre än ${n2}, blir det fel att påstå att ${n1} är större än (>) ${n2}. Det här stämmer alltså inte:` : `Since ${n1} is smaller than ${n2}, claiming that ${n1} is larger than (>) ${n2} is false. This statement is the lie:`, 
                    latex: `\\mathbf{${lie}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}`, 
                    latex: `\\text{${lie}}` 
                }
            ]
        };
    }

    // --- LEVEL 2: ADD/SUB FLUENCY ---
    private level2_AddSubFluency(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'fluency_chain_4', type: 'calculate' },
            { key: 'fluency_double_neg', type: 'calculate' },
            { key: 'fluency_transform_match', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'fluency_chain_4') {
            const a = MathUtils.randomInt(-5, 5), b = MathUtils.randomInt(-5, 5);
            const c = MathUtils.randomInt(-5, 5), d = MathUtils.randomInt(-5, 5);
            const res1 = a + b, res2 = res1 - c, res3 = res2 + d;
            const fullExpr = `${this.p(a)} + ${this.p(b)} - ${this.p(c)} + ${this.p(d)}`;
            
            return {
                renderData: {
                    latex: fullExpr,
                    description: lang === 'sv' ? "Beräkna värdet." : "Calculate the value.",
                    answerType: 'numeric'
                },
                token: this.toBase64(res3.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ta hand om de två första talen allra längst fram på raden först." : "Take care of the first two numbers at the very front of the line first.", 
                        latex: `\\mathbf{${this.p(a)} + ${this.p(b)}} - ${this.p(c)} + ${this.p(d)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut den första biten: ${a} + ${b} blir ${res1}.` : `Calculate that first piece: ${a} + ${b} equals ${res1}.`, 
                        latex: `\\mathbf{${res1}} - ${this.p(c)} + ${this.p(d)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ta med nästa tal i ordningen och räkna ut: ${res1} - ${this.p(c)} blir ${res2}.` : `Include the next number in order and calculate: ${res1} - ${this.p(c)} equals ${res2}.`, 
                        latex: `\\mathbf{${res1} - ${this.p(c)}} + ${this.p(d)} \\rightarrow \\mathbf{${res2}} + ${this.p(d)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna till sist ut den sista biten: ${res2} + ${this.p(d)}.` : `Finally, calculate the very last piece remaining: ${res2} + ${this.p(d)}.`, 
                        latex: `\\mathbf{${res2} + ${this.p(d)}} = \\mathbf{${res3}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${res3}` : `Answer: ${res3}`, 
                        latex: `${res3}` 
                    }
                ]
            };
        }

        if (v === 'fluency_transform_match') {
            const a = MathUtils.randomInt(-10, 10), b = MathUtils.randomInt(2, 12);
            const correct = `${a} + ${b}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilket uttryck betyder exakt samma sak som $${a} - (-${b})$?` : `Which expression means exactly the same thing as $${a} - (-${b})$?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${a} - ${b}`, `-${a} + ${b}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "När två minustecken krockar direkt med varandra utan något annat tal emellan, förvandlas de tillsammans till ett vanligt plustecken." : "When two minus signs crash directly into each other with no other number in between, they join together to form a regular plus sign.", 
                        latex: `${a} \\mathbf{- (-} ${b} )` 
                    },
                    { 
                        text: lang === 'sv' ? "Tänk på det som att de två minusstrecken läggs korsvis över varandra och bildar ett kors (+)." : "Think of it as the two minus dashes being placed crosswise over each other to form a cross (+).", 
                        latex: `\\mathbf{-(-)} \\rightarrow \\mathbf{+}` 
                    },
                    { 
                        text: lang === 'sv' ? `Därför kan uttrycket skrivas om helt utan parentesväggar som en ren addition:` : `Therefore, the expression can be rewritten entirely without parenthesis walls as a pure addition:`, 
                        latex: `\\mathbf{${a} + ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                        latex: `\\text{${correct}}` 
                    }
                ]
            };
        }

        const a = MathUtils.randomInt(-10, 10), b = MathUtils.randomInt(5, 15);
        const ans = a + b;
        return {
            renderData: { latex: `${a} - (-${b})`, description: lang === 'sv' ? "Förenkla tecknen emellan och räkna ut svaret." : "Simplify the signs in between and calculate the answer.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med att städa bort teckenkrocken i mitten. Två minustecken intill varandra blir till ett plus." : "Start by cleaning up the sign clash in the middle. Two minus signs next to each other turn into a plus.", 
                    latex: `${a} \\mathbf{- (-} ${b} )` 
                },
                { 
                    text: lang === 'sv' ? "Skriv raden på nytt som ett enkelt plustal på tavlan:" : "Rewrite the row as a simple addition statement on the board:", 
                    latex: `= ${a} \\mathbf{+} ${b}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna nu ut additionen från startläget ${a}: klättra uppåt med ${b} steg.` : `Now calculate the addition from the starting point ${a}: climb upwards by ${b} steps.`, 
                    latex: `${a} + ${b} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 3: MULTIPLICATION ---
    private level3_Multiplication(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_same_sign', type: 'calculate' },
            { key: 'mult_diff_sign', type: 'calculate' },
            { key: 'mult_chain', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'mult_chain') {
            const f1 = MathUtils.randomInt(-3, 3) || 1;
            const f2 = MathUtils.randomInt(-3, 3) || 1;
            const f3 = MathUtils.randomInt(-3, 3) || 1;
            const res1 = f1 * f2, res2 = res1 * f3;
            const fullExpr = `${this.p(f1)} \\cdot ${this.p(f2)} \\cdot ${this.p(f3)}`;
            
            return {
                renderData: {
                    latex: fullExpr,
                    description: lang === 'sv' ? "Beräkna." : "Calculate.",
                    answerType: 'numeric'
                },
                token: this.toBase64(res2.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Börja med de två första gångertalen längst fram på raden." : "Start with the first two multiplication factors at the front of the line.", 
                        latex: `\\mathbf{${this.p(f1)} \\cdot ${this.p(f2)}} \\cdot ${this.p(f3)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut första biten. Kom ihåg: Lika tecken ger plus, olika tecken ger minus! Det blir ${res1}.` : `Calculate that first piece. Remember: Same signs make a plus, different signs make a minus! It equals ${res1}.`, 
                        latex: `\\mathbf{${res1}} \\cdot ${this.p(f3)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Multiplicera nu det uträknade numret med den sista biten på raden: ${res1} · ${this.p(f3)}.` : `Now multiply that calculated number by the very last factor left on the line: ${res1} · ${this.p(f3)}.`, 
                        latex: `\\mathbf{${res1} \\cdot ${this.p(f3)}} = \\mathbf{${res2}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${res2}` : `Answer: ${res2}`, 
                        latex: `${res2}` 
                    }
                ]
            };
        }

        const aVal = MathUtils.randomInt(2, 9), bVal = MathUtils.randomInt(2, 9);
        const isSame = v === 'mult_same_sign';
        const a = aVal * -1;
        const b = isSame ? bVal * -1 : bVal;
        const ans = a * b;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.",
                latex: `${this.p(a)} \\cdot ${this.p(b)}`,
                interceptorToken: `${a} * ${b}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Börja med att multiplicera siffrorna som vanligt utan att tänka på tecknen: ${Math.abs(a)} gånger ${Math.abs(b)}.` : `Start by multiplying the numbers normally without thinking about the signs: ${Math.abs(a)} times ${Math.abs(b)}.`, 
                    latex: `${Math.abs(a)} \\cdot ${Math.abs(b)} = \\mathbf{${Math.abs(ans)}}` 
                },
                { 
                    text: lang === 'sv' ? "Kolla nu på tecknen. En av siffrorna är negativ och den andra är positiv." : "Now check the signs. One of the numbers is negative and the other is positive.", 
                    latex: isSame ? `(-)\\cdot(-) \\rightarrow \\mathbf{(+)}` : `(-)\\cdot(+) \\rightarrow \\mathbf{(-)}` 
                },
                { 
                    text: lang === 'sv' ? `Regeln säger att ${isSame ? 'lika' : 'olika'} tecken alltid ger ett ${isSame ? 'positivt (plus)' : 'negativt (minus)'} svar. Därför blir svaret ${ans}.` : `The rule states that ${isSame ? 'same' : 'different'} signs always give a ${isSame ? 'positive (plus)' : 'negative (minus)'} answer. Therefore the answer is ${ans}.`, 
                    latex: `\\text{Resultat} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 4: DIVISION ---
    private level4_Division(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_diff_sign', type: 'calculate' },
            { key: 'div_check_logic', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const bVal = MathUtils.randomInt(2, 8), qVal = MathUtils.randomInt(2, 8);
        const a = bVal * qVal * -1; // Force negative numerator
        const b = bVal; 
        const ans = a / b;

        if (v === 'div_check_logic') {
            const correct = `${this.p(ans)} \\cdot ${this.p(b)} = ${a}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken multiplikation bevisar att $\\frac{${a}}{${b}} = ${ans}$?` : `Which multiplication layout proves that $\\frac{${a}}{${b}} = ${ans}$?`,
                    answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${ans} + ${b} = ${a}`, `${a} \\cdot ${b} = ${ans}`])
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi kan alltid testa om en delning (division) är rätt genom att räkna baklänges med multiplikation." : "We can always double-check if a division statement is true by running backwards using multiplication.", 
                        latex: `\\frac{${a}}{${b}} = ${ans}` 
                    },
                    { 
                        text: lang === 'sv' ? "Att ta ett tal delat med b som blir c, betyder att svaret c gånger b måste träffa täljaren a där uppe." : "Dividing a value by b to reach c means that the answer c times the bottom term b must perfectly strike back to the top term a.", 
                        latex: `\\frac{a}{b} = c \\iff \\mathbf{c \\cdot b = a}` 
                    },
                    { 
                        text: lang === 'sv' ? `Sätter vi in våra siffror ser vi att svaret ${ans} gånger bottentalet ${b} ska bli starttalet ${a}:` : `Plugging in our actual numbers shows that the answer ${ans} times the bottom number ${b} must equal the top number ${a}:`, 
                        latex: `\\mathbf{${correct}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                        latex: `\\text{${correct}}` 
                    }
                ]
            };
        }

        return {
            renderData: { latex: `\\frac{${a}}{${b}}`, description: lang === 'sv' ? "Räkna ut kvoten." : "Calculate the quotient.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Dela först siffrorna precis som vanligt utan att titta på minustecknet: ${Math.abs(a)} delat med ${b}.` : `First, divide the numbers as usual without looking at the minus sign: ${Math.abs(a)} divided by ${b}.`, 
                    latex: `\\frac{${Math.abs(a)}}{${b}} = \\mathbf{${Math.abs(ans)}}` 
                },
                { 
                    text: lang === 'sv' ? "Kolla nu på tecknen. Precis som i multiplikation gäller regeln: Olika tecken ger alltid ett minussvar." : "Now check the signs. Just like in multiplication, the rule applies: Different signs always result in a minus answer.", 
                    latex: `\\mathbf{\\frac{(-)}{(+)} \\rightarrow (-)}` 
                },
                { 
                    text: lang === 'sv' ? `Eftersom vi delar ett minustal med ett plustal (olika tecken), blir kvoten ett kallt minustal: ${ans}.` : `Since we divide a minus number by a plus number (different signs), the quotient results in a negative number: ${ans}.`, 
                    latex: `\\text{Resultat} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang, options);
    }
}