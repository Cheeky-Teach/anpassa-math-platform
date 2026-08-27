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
            case 6: questionData = this.level6_OrderOfOperations(lang, undefined, options); break;
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
            case 'neg_order_frac_basic':
            case 'neg_order_frac_paren':
                return this.level6_OrderOfOperations(lang, key);
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
            const start = MathUtils.randomInt(-10, 10);
            const steps = MathUtils.randomInt(2, 12);
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
            // Randomly generate between 3 and 5 factors
            const numFactors = MathUtils.randomInt(3, 5); 
            const factors = [];
            for (let i = 0; i < numFactors; i++) {
                factors.push(MathUtils.randomInt(-5, 5) || 1); // || 1 prevents multiplying by 0
            }
            
            const fullExpr = factors.map(f => this.p(f)).join(' \\cdot ');
            const finalAns = factors.reduce((acc, val) => acc * val, 1);
            const res1 = factors[0] * factors[1];
            
            // Dynamically build the clues so they adapt to the chain's length
            const clues = [
                { 
                    text: lang === 'sv' ? "Börja med de två första gångertalen längst fram på raden." : "Start with the first two multiplication factors at the front of the line.", 
                    latex: `\\mathbf{${this.p(factors[0])} \\cdot ${this.p(factors[1])}} \\cdot ` + factors.slice(2).map(f => this.p(f)).join(' \\cdot ')
                },
                { 
                    text: lang === 'sv' ? `Räkna ut första biten. Kom ihåg: Lika tecken ger plus, olika tecken ger minus! Det blir ${res1}.` : `Calculate that first piece. Remember: Same signs make a plus, different signs make a minus! It equals ${res1}.`, 
                    latex: `\\mathbf{${res1}} \\cdot ` + factors.slice(2).map(f => this.p(f)).join(' \\cdot ')
                }
            ];

            let currentRes = res1;
            // Loop through any remaining factors and generate a clue for each step!
            for (let i = 2; i < factors.length; i++) {
                let nextRes = currentRes * factors[i];
                let remaining = factors.slice(i + 1).map(f => this.p(f));
                let remainingStr = remaining.length > 0 ? ' \\cdot ' + remaining.join(' \\cdot ') : '';
                
                clues.push({
                    text: lang === 'sv' 
                        ? `Multiplicera nu det uträknade numret med nästa bit på raden: ${currentRes} · ${this.p(factors[i])}.` 
                        : `Now multiply that calculated number by the next factor on the line: ${currentRes} · ${this.p(factors[i])}.`,
                    latex: `\\mathbf{${currentRes} \\cdot ${this.p(factors[i])}}${remainingStr} = \\mathbf{${nextRes}}${remainingStr}`
                });
                currentRes = nextRes;
            }

            clues.push({
                text: lang === 'sv' ? `Svar: ${finalAns}` : `Answer: ${finalAns}`,
                latex: `${finalAns}`
            });

            return {
                renderData: {
                    latex: fullExpr,
                    description: lang === 'sv' ? "Beräkna." : "Calculate.",
                    answerType: 'numeric'
                },
                token: this.toBase64(finalAns.toString()), variationKey: v, type: 'calculate',
                clues: clues
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
                interceptorToken: `${Math.abs(a)} * ${Math.abs(b)}`,
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
            // Added div_same_sign to the pool to match skillBuckets.js
            { key: 'div_same_sign', type: 'calculate' },
            { key: 'div_diff_sign', type: 'calculate' },
            { key: 'div_check_logic', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        const bVal = MathUtils.randomInt(2, 8), qVal = MathUtils.randomInt(2, 8);
        let a = bVal * qVal;
        let b = bVal;

        // Dynamic Sign Assignment Logic
        const isSameSign = v === 'div_same_sign';
        const isDiffSign = v === 'div_diff_sign';

        if (isSameSign || (v === 'div_check_logic' && Math.random() > 0.5)) {
            // Lika tecken (Same signs): 50% chance of both being positive, 50% chance both negative
            if (Math.random() > 0.5) {
                a = -a;
                b = -b;
            }
        } else {
            // Olika tecken (Different signs): 50% chance numerator is negative, 50% chance denominator is negative
            if (Math.random() > 0.5) {
                a = -a;
            } else {
                b = -b;
            }
        }

        const ans = a / b;
        const isSame = (a < 0 && b < 0) || (a > 0 && b > 0);

        if (v === 'div_check_logic') {
            const correct = `${this.p(ans)} \\cdot ${this.p(b)} = ${a}`;
            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken multiplikation bevisar att $\\frac{${a}}{${b}} = ${ans}$?` : `Which multiplication layout proves that $$\\frac{${a}}{${b}} = ${ans}$$?`,
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
                        text: lang === 'sv' ? `Svar:` : `Answer:`, 
                        latex: correct 
                    }
                ]
            };
        }

        // Generate the visual representation for the signs in the clue
        let signClueLatex = "";
        if (isSame) {
            signClueLatex = a < 0 ? `\\mathbf{\\frac{(-)}{(-)} \\rightarrow (+)}` : `\\mathbf{\\frac{(+)}{(+)} \\rightarrow (+)}`;
        } else {
            signClueLatex = a < 0 ? `\\mathbf{\\frac{(-)}{(+)} \\rightarrow (-)}` : `\\mathbf{\\frac{(+)}{(-)} \\rightarrow (-)}`;
        }

        return {
            renderData: { latex: `\\frac{${a}}{${b}}`, description: lang === 'sv' ? "Räkna ut kvoten." : "Calculate the quotient.", answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Dela först siffrorna precis som vanligt utan att titta på tecknen: ${Math.abs(a)} delat med ${Math.abs(b)}.` : `First, divide the numbers as usual without looking at the signs: ${Math.abs(a)} divided by ${Math.abs(b)}.`, 
                    latex: `\\frac{${Math.abs(a)}}{${Math.abs(b)}} = \\mathbf{${Math.abs(ans)}}` 
                },
                { 
                    text: lang === 'sv' ? "Kolla nu på tecknen. Lika tecken ger alltid plus, och olika tecken ger alltid minus." : "Now check the signs. Same signs always result in a plus, and different signs always result in a minus.", 
                    latex: signClueLatex
                },
                { 
                    text: lang === 'sv' ? `Eftersom vi delar två tal med ${isSame ? 'lika' : 'olika'} tecken, blir kvoten ${isSame ? 'positiv' : 'negativ'}: ${ans}.` : `Since we divide two numbers with ${isSame ? 'the same' : 'different'} signs, the quotient is ${isSame ? 'positive' : 'negative'}: ${ans}.`, 
                    latex: `\\text{Resultat} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 6: ORDER OF OPERATIONS WITH NEGATIVES ---
    private level6_OrderOfOperations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'neg_order_frac_basic', type: 'calculate' },
            { key: 'neg_order_frac_paren', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'neg_order_frac_basic') {
            // Structure: (a + b * c) / d
            let d = 0; while (d === 0) d = MathUtils.randomInt(-6, 6);
            let b = 0; while (b === 0) b = MathUtils.randomInt(-6, 6);
            let c = 0; while (c === 0 || c === 1) c = MathUtils.randomInt(-6, 6);
            
            // Guarantee an integer answer by working backwards
            let p = b * c;
            let ans = 0; while (ans === 0) ans = MathUtils.randomInt(-6, 6);
            let num = ans * d;
            let a = num - p;

            return {
                renderData: { 
                    latex: `\\frac{${a}  +  ${this.p(b)}  \\cdot  ${this.p(c)}}{${d}}`, 
                    description: lang === 'sv' ? "Beräkna uttrycket." : "Evaluate the expression.", 
                    answerType: 'numeric' 
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Täljaren (över bråkstrecket) fungerar som en stor parentes. Vi måste räkna ut den först." : "The numerator (above the fraction bar) acts as a large parenthesis. We must evaluate it first.", 
                        latex: `\\text{Täljare: } ${a} + ${this.p(b)} \\cdot ${this.p(c)}` 
                    },
                    { 
                        text: lang === 'sv' ? `Prioriteringsreglerna säger att multiplikation görs före addition. Beräkna ${this.p(b)} · ${this.p(c)} först.` : `Order of operations states that multiplication is done before addition. Calculate ${this.p(b)} · ${this.p(c)} first.`, 
                        latex: `${this.p(b)} \\cdot ${this.p(c)} = \\mathbf{${p}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Addera nu detta med starttalet i täljaren: ${a} + ${this.p(p)}.` : `Now add this to the starting number in the numerator: ${a} + ${this.p(p)}.`, 
                        latex: `${a} + ${this.p(p)} = \\mathbf{${num}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Nu är täljaren färdig. Dividera den med nämnaren ${d} (och glöm inte teckenreglerna!).` : `The numerator is now complete. Divide it by the denominator ${d} (and don't forget the sign rules!).`, 
                        latex: `\\frac{${num}}{${d}} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        // neg_order_frac_paren
        // Structure: (a * (b + c)) / d
        let b = MathUtils.randomInt(-8, 8);
        let c = MathUtils.randomInt(-8, 8);
        let sum = b + c;
        // Ensure the parenthesis doesn't evaluate to 0 to keep the division meaningful
        while (sum === 0) {
            c = MathUtils.randomInt(-8, 8);
            sum = b + c;
        }

        let d = 0; while (d === 0) d = MathUtils.randomInt(-5, 5);
        
        // Guarantee an integer answer: let a be a multiple of d
        let k = 0; while (k === 0) k = MathUtils.randomInt(-4, 4);
        let a = k * d;
        let num = a * sum;
        let ans = num / d;

        return {
            renderData: { 
                latex: `\\frac{${a} \\cdot (${b} + ${this.p(c)})}{${d}}`, 
                description: lang === 'sv' ? "Beräkna uttrycket." : "Evaluate the expression.", 
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()), variationKey: 'neg_order_frac_paren', type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med den innersta parentesen uppe i täljaren." : "Start with the innermost parenthesis up in the numerator.", 
                    latex: `(${b} + ${this.p(c)}) = \\mathbf{${sum}}` 
                },
                { 
                    text: lang === 'sv' ? `Multiplicera sedan parentesens värde med talet framför: ${a} · ${this.p(sum)}.` : `Then multiply the parenthesis's value by the number in front: ${a} · ${this.p(sum)}.`, 
                    latex: `${a} \\cdot ${this.p(sum)} = \\mathbf{${num}}` 
                },
                { 
                    text: lang === 'sv' ? `Till sist, dividera hela täljaren med nämnaren ${d}. Lika tecken ger plus, olika ger minus!` : `Finally, divide the entire numerator by the denominator ${d}. Same signs give plus, different give minus!`, 
                    latex: `\\frac{${num}}{${d}} = \\mathbf{${ans}}` 
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