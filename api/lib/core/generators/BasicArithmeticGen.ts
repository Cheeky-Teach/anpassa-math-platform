// src/generators/BasicArithmeticGen.ts

import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class BasicArithmeticGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_AddSimple(lang, undefined, options); break;
            case 2: questionData = this.level2_SubSimple(lang, undefined, options); break;
            case 3: questionData = this.level3_Decimals(lang, undefined, options); break;
            case 4: questionData = this.level4_MultEasy(lang, undefined, options); break;
            case 5: questionData = this.level5_MultMedium(lang, undefined, options); break;
            case 6: questionData = this.level6_MultHard(lang, undefined, options); break;
            case 7: questionData = this.level7_DivEasy(lang, undefined, options); break;
            case 8: questionData = this.level8_DivisibilityRules(lang, undefined, options); break;
            case 9: questionData = this.level9_DecimalDivision(lang, undefined, options); break;
            case 10: questionData = this.level10_MixedIntegers(lang, options); break;
            case 11: questionData = this.level11_MixedDecimals(lang, options); break;
            default: questionData = this.level1_AddSimple(lang, undefined, options); break;
        }

        enrichQuestionMetadata(questionData);

        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 4, 7, 9];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        switch (key) {
            case 'add_std_vertical':
            case 'add_std_horizontal':
            case 'add_missing_variable':
            case 'add_spot_the_lie':
                questionData = this.level1_AddSimple(lang, key, options);
                break;
            case 'sub_std_vertical':
            case 'sub_std_horizontal':
            case 'sub_missing_variable':
                questionData = this.level2_SubSimple(lang, key, options);
                break;
            case 'dec_add_vertical': 
            case 'dec_sub_vertical':
                questionData = this.level3_Decimals(lang, key, options);
                break;
            case 'mult_table_std':
            case 'mult_commutative':
                questionData = this.level4_MultEasy(lang, key, options);
                break;
            case 'mult_2x1_vertical':
            case 'mult_distributive':
                questionData = this.level5_MultMedium(lang, key, options);
                break;
            case 'mult_decimal_std':
            case 'mult_decimal_placement':
                questionData = this.level6_MultHard(lang, key, options);
                break;
            case 'div_basic_std':
            case 'div_inverse_logic':
                questionData = this.level7_DivEasy(lang, key, options);
                break;
            case 'div_rule_check':
            case 'div_rule_missing':
            case 'div_rule_tf':
                questionData = this.level8_DivisibilityRules(lang, key, options);
                break;
            case 'div_decimal_dividend':
            case 'div_decimal_divisor':
                questionData = this.level9_DecimalDivision(lang, key, options);
                break;
            default:
                questionData = this.generate(1, lang, options);
                break;
        }

        return enrichQuestionMetadata(questionData);
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{rr} & ${top} \\\\ ${op} & ${bottom} \\\\ \\hline \\end{array}`;
    }

    /**
     * Renders a vertical column table with live carry/borrow marks above the top row
     * and an updated partial/final result below the rule.
     */
    private makeVerticalStep(
        top: number | string,
        bottom: number | string,
        op: string,
        carryNote: string = '',
        resultBottom: string = ''
    ): string {
        const lines: string[] = [];
        if (carryNote) {
            lines.push(`& \\scriptstyle{\\mathbf{${carryNote}}} \\\\`);
        }
        lines.push(`& ${top} \\\\`);
        lines.push(`${op} & ${bottom} \\\\`);
        lines.push(`\\hline`);
        if (resultBottom) {
            lines.push(`\\\\ & ${resultBottom}`);
        }
        return `\\begin{array}{rr} ${lines.join(' ')} \\end{array}`;
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[0].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    private formatNum(num: number, lang: string): string {
        const cleanNum = parseFloat(num.toFixed(4));
        return lang === 'sv' ? cleanNum.toString().replace('.', ',') : cleanNum.toString();
    }

    // =========================================================================
    // LEVEL 1: ADDITION
    // =========================================================================
    private level1_AddSimple(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_std_vertical', type: 'calculate' },
            { key: 'add_std_horizontal', type: 'calculate' },
            { key: 'add_missing_variable', type: 'calculate' },
            { key: 'add_spot_the_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'add_std_vertical' || v === 'add_std_horizontal') {
            let a = MathUtils.randomInt(10, 200);
            let b = MathUtils.randomInt(10, 200);
            const isVertical = v === 'add_std_vertical';

            if (isVertical && a < b) {
                [a, b] = [b, a];
            }

            const ans = a + b;

            const aOnes = a % 10;
            const bOnes = b % 10;
            const onesSum = aOnes + bOnes;
            const carry1 = Math.floor(onesSum / 10);
            const onesDigit = onesSum % 10;

            const aTens = Math.floor((a % 100) / 10);
            const bTens = Math.floor((b % 100) / 10);
            const tensSum = aTens + bTens + carry1;
            const carry2 = Math.floor(tensSum / 10);
            const tensDigit = tensSum % 10;

            const aHundreds = Math.floor(a / 100);
            const bHundreds = Math.floor(b / 100);
            const hundredsSum = aHundreds + bHundreds + carry2;

            const baseExpression = isVertical ? this.makeVertical(a, b, '+') : `${a} + ${b}`;

            const carryAfterOnes = carry1 > 0 ? `^${carry1}\\text{ (tiotal)}` : '';
            const carryAfterTens = carry2 > 0 ? `^${carry2}\\text{ (hundratal)}` : '';

            const clues: any[] = [
                { 
                    text: lang === 'sv' 
                        ? "Ställ upp talen lodrätt och börja med entalen (kolumnen längst till höger)." 
                        : "Set up the numbers vertically and start with the ones column on the far right.", 
                    latex: this.makeVerticalStep(a, b, '+')
                },
                {
                    text: carry1 > 0
                        ? (lang === 'sv' 
                            ? `Ental: ${aOnes} + ${bOnes} = ${onesSum}. Skriv ${onesDigit} i entalskolumnen och sätt minnessiffran ${carry1} ovanför tiotalen.` 
                            : `Ones: ${aOnes} + ${bOnes} = ${onesSum}. Write ${onesDigit} in the ones column and place the carried digit ${carry1} above the tens.`)
                        : (lang === 'sv' 
                            ? `Ental: ${aOnes} + ${bOnes} = ${onesSum}. Skriv ${onesDigit} i entalskolumnen (ingen minnessiffra).` 
                            : `Ones: ${aOnes} + ${bOnes} = ${onesSum}. Write ${onesDigit} in the ones column (no carry).`),
                    latex: this.makeVerticalStep(a, b, '+', carryAfterOnes, `\\mathbf{${onesDigit}}`)
                },
                {
                    text: carry1 > 0
                        ? (lang === 'sv' 
                            ? `Tiotal: Räkna ${aTens} + ${bTens} + minnessiffran ${carry1} = ${tensSum}. Skriv ${tensDigit} i tiotalskolumnen${carry2 > 0 ? ` och sätt ${carry2} i minne ovanför hundratalen` : ' (minnessiffran från entalen är nu använd)'}.` 
                            : `Tens: Calculate ${aTens} + ${bTens} + carried ${carry1} = ${tensSum}. Write ${tensDigit} in the tens column${carry2 > 0 ? ` and carry ${carry2} to the hundreds` : ' (ones carry is now used)'}.`)
                        : (lang === 'sv' 
                            ? `Tiotal: Räkna ${aTens} + ${bTens} = ${tensSum}. Skriv ${tensDigit} i tiotalskolumnen${carry2 > 0 ? ` och sätt ${carry2} i minne` : ''}.` 
                            : `Tens: Calculate ${aTens} + ${bTens} = ${tensSum}. Write ${tensDigit} in the tens column${carry2 > 0 ? ` and carry ${carry2}` : ''}.`),
                    latex: this.makeVerticalStep(a, b, '+', carryAfterTens, `\\mathbf{${tensDigit}${onesDigit}}`)
                }
            ];

            if (aHundreds > 0 || bHundreds > 0 || carry2 > 0) {
                clues.push({
                    text: carry2 > 0
                        ? (lang === 'sv' 
                            ? `Hundratal: Räkna ${aHundreds} + ${bHundreds} + minnessiffran ${carry2} = ${hundredsSum}. Nu är alla minnessiffror använda!` 
                            : `Hundreds: Calculate ${aHundreds} + ${bHundreds} + carried ${carry2} = ${hundredsSum}. All carries are now used!`)
                        : (lang === 'sv' 
                            ? `Hundratal: Räkna ${aHundreds} + ${bHundreds} = ${hundredsSum}.` 
                            : `Hundreds: Calculate ${aHundreds} + ${bHundreds} = ${hundredsSum}.`),
                    latex: this.makeVerticalStep(a, b, '+', '', `\\mathbf{${ans}}`)
                });
            }

            clues.push({
                text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                latex: `${ans}`
            });

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna summan." : "Calculate the sum.",
                    latex: baseExpression,
                    interceptorToken: `${a} + ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v, 
                type: 'calculate',
                clues
            };
        }

        if (v === 'add_missing_variable') {
            const a = MathUtils.randomInt(5, 100);
            const x = MathUtils.randomInt(5, 100);
            const sum = a + x;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas för att summan ska stämma?" : "What number is missing to make the sum correct?",
                    latex: `${a} + x = ${sum}`, 
                    answerType: 'numeric'
                },
                token: this.toBase64(x.toString()),
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "För att ta reda på ett saknat tal i en addition gör vi det motsatta räknesättet: subtraktion." 
                            : "To find a missing term in an addition equation, we use the inverse operation: subtraction.", 
                        latex: `${a} + x = ${sum}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Ta bort ${a} från summan för att hitta x:` 
                            : `Subtract ${a} from the sum to find x:`, 
                        latex: `x = ${sum} - ${a}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Räkna ut subtraktionen:` 
                            : `Calculate the subtraction:`, 
                        latex: `x = \\mathbf{${x}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${x}` : `Answer: ${x}`, 
                        latex: `x = ${x}` 
                    }
                ]
            };
        }

        // add_spot_the_lie
        const n1 = MathUtils.randomInt(10, 50), n2 = MathUtils.randomInt(10, 50);
        const n3 = MathUtils.randomInt(10, 30);
        
        const sTrue1 = `${n1} + ${n2} = ${n1 + n2}`;
        const sTrue2 = `${n3} + 10 = ${n3 + 10}`;
        const sFalse = `${n1} + ${n2} = ${n1 + n2 + MathUtils.randomChoice([-2, 1, 2])}`;
        
        return {
            renderData: {
                description: lang === 'sv' ? "Vilken uträkning är felaktig?" : "Which calculation is incorrect?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            variationKey: v, 
            type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Kontrollera uträkningarna genom att addera entalen och tiotalen för sig." 
                        : "Check the calculations by adding the ones and tens separately.", 
                    latex: `\\text{Kontrollera: } ${n1} + ${n2}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Rätt summa är ${n1 + n2}. Det betyder att följande påstående är felaktigt:` 
                        : `The correct sum is ${n1 + n2}. That means the following statement is false:`, 
                    latex: `\\mathbf{${sFalse}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${sFalse}` : `Answer: ${sFalse}`, 
                    latex: `\\text{${sFalse}}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 2: SUBTRACTION (WITH LIVE BORROW / LÅN UPDATES)
    // =========================================================================
    private level2_SubSimple(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'sub_std_vertical', type: 'calculate' },
            { key: 'sub_std_horizontal', type: 'calculate' },
            { key: 'sub_missing_variable', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(50, 200), b = MathUtils.randomInt(10, a - 1), ans = a - b;

        if (v === 'sub_std_vertical' || v === 'sub_std_horizontal') {
            const isVertical = v === 'sub_std_vertical';
            const baseExpression = isVertical ? this.makeVertical(a, b, '-') : `${a} - ${b}`;

            const aOnes = a % 10;
            const bOnes = b % 10;
            const aTens = Math.floor((a % 100) / 10);
            const bTens = Math.floor((b % 100) / 10);
            const aHundreds = Math.floor(a / 100);
            const bHundreds = Math.floor(b / 100);

            const needsBorrowOnes = aOnes < bOnes;
            const zeroInTens = aTens === 0 && needsBorrowOnes;

            let effectiveOnes = aOnes;
            let effectiveTens = aTens;
            let effectiveHundreds = aHundreds;

            if (zeroInTens) {
                effectiveHundreds -= 1;
                effectiveTens = 9;
                effectiveOnes += 10;
            } else if (needsBorrowOnes) {
                effectiveTens -= 1;
                effectiveOnes += 10;
            }

            const onesDiff = effectiveOnes - bOnes;

            const needsBorrowTens = effectiveTens < bTens;
            if (needsBorrowTens) {
                effectiveHundreds -= 1;
                effectiveTens += 10;
            }
            const tensDiff = effectiveTens - bTens;

            const clues: any[] = [
                { 
                    text: lang === 'sv' 
                        ? "Ställ upp talen lodrätt och börja med entalen (kolumnen längst till höger)." 
                        : "Set up the numbers vertically and start with the ones column on the far right.", 
                    latex: this.makeVerticalStep(a, b, '-')
                }
            ];

            if (zeroInTens) {
                const borrowNotice = lang === 'sv'
                    ? `\\text{Lån: 1 hundratal } \\rightarrow \\text{ 9 tiotal + 10 ental}`
                    : `\\text{Borrow: 1 hundred } \\rightarrow \\text{ 9 tens + 10 ones}`;

                clues.push({
                    text: lang === 'sv'
                        ? `Ental: ${aOnes} är mindre än ${bOnes}. Vi vill låna från tiotalen, men där står 0. Vi lånar därför 1 hundratal som blir 9 tiotal i minnet och 10 extra ental (${effectiveOnes} ental).`
                        : `Ones: ${aOnes} is smaller than ${bOnes}. There is a 0 in the tens column, so we borrow 1 hundred to make 9 tens in memory and 10 extra ones (${effectiveOnes} ones).`,
                    latex: this.makeVerticalStep(a, b, '-', borrowNotice)
                });
                clues.push({
                    text: lang === 'sv'
                        ? `Räkna entalen: ${effectiveOnes} - ${bOnes} = ${onesDiff}. Skriv ${onesDiff} under strecket (9 tiotal kvar i minnet).`
                        : `Subtract the ones: ${effectiveOnes} - ${bOnes} = ${onesDiff}. Write ${onesDiff} below the line (9 tens remaining in memory).`,
                    latex: this.makeVerticalStep(a, b, '-', lang === 'sv' ? `\\text{9 tiotal kvar}` : `\\text{9 tens left}`, `\\mathbf{${onesDiff}}`)
                });
                clues.push({
                    text: lang === 'sv'
                        ? `Tiotal: Använd de 9 tiotalen i minnet: 9 - ${bTens} = ${tensDiff}. Skriv ${tensDiff} i tiotalskolumnen.`
                        : `Tens: Use the 9 tens in memory: 9 - ${bTens} = ${tensDiff}. Write ${tensDiff} in the tens column.`,
                    latex: this.makeVerticalStep(a, b, '-', '', `\\mathbf{${ans}}`)
                });
            } else {
                const borrowOnesLabel = needsBorrowOnes
                    ? (lang === 'sv' ? `\\text{Lån: 1 tiotal } \\rightarrow \\text{ ${effectiveOnes} ental, ${effectiveTens} tiotal kvar}` : `\\text{Borrow: 1 ten } \\rightarrow \\text{ ${effectiveOnes} ones, ${effectiveTens} tens left}`)
                    : '';

                clues.push({
                    text: needsBorrowOnes
                        ? (lang === 'sv' 
                            ? `Ental: ${aOnes} är mindre än ${bOnes}. Låna 1 tiotal så att entalet blir ${effectiveOnes} (och ${effectiveTens} tiotal blir kvar). Räkna sedan: ${effectiveOnes} - ${bOnes} = ${onesDiff}.` 
                            : `Ones: ${aOnes} is less than ${bOnes}. Borrow 1 ten to make ${effectiveOnes} ones (${effectiveTens} tens left). Then calculate: ${effectiveOnes} - ${bOnes} = ${onesDiff}.`)
                        : (lang === 'sv' 
                            ? `Ental: Räkna ${aOnes} - ${bOnes} = ${onesDiff}. Skriv ${onesDiff} under strecket.` 
                            : `Ones: Calculate ${aOnes} - ${bOnes} = ${onesDiff}. Write ${onesDiff} below the line.`),
                    latex: this.makeVerticalStep(a, b, '-', borrowOnesLabel, `\\mathbf{${onesDiff}}`)
                });

                clues.push({
                    text: needsBorrowOnes
                        ? (lang === 'sv' 
                            ? `Tiotal: Räkna med de ${effectiveTens} tiotalen som är kvar: ${effectiveTens} - ${bTens} = ${tensDiff}. Nu är lånet använt!` 
                            : `Tens: Calculate with the ${effectiveTens} tens remaining: ${effectiveTens} - ${bTens} = ${tensDiff}. The borrow is now used!`)
                        : (lang === 'sv' 
                            ? `Tiotal: Räkna ${effectiveTens} - ${bTens} = ${tensDiff}.` 
                            : `Tens: Calculate ${effectiveTens} - ${bTens} = ${tensDiff}.`),
                    latex: this.makeVerticalStep(a, b, '-', '', `\\mathbf{${ans}}`)
                });
            }

            clues.push({
                text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`,
                latex: `${ans}`
            });

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna differensen." : "Calculate the difference.",
                    latex: baseExpression,
                    interceptorToken: `${a} - ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues
            };
        }

        const x = MathUtils.randomInt(20, 80), start = x + MathUtils.randomInt(20, 100);
        const resultVal = start - x;
        return {
            renderData: { 
                description: lang === 'sv' ? "Vilket tal saknas?" : "Find the missing number.", 
                latex: `${start} - x = ${resultVal}`, 
                answerType: 'numeric' 
            },
            token: this.toBase64(x.toString()), 
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "För att ta reda på det saknade subtraherade talet x tar vi starttalet minus resultatet:" 
                        : "To find the missing subtracted term x, subtract the result from the starting number:", 
                    latex: `${start} - x = ${resultVal}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Räkna ut subtraktionen:` 
                        : `Calculate the subtraction:`, 
                    latex: `x = ${start} - ${resultVal} = \\mathbf{${x}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 3: DECIMALS (LIVE VERTICAL PLACE-VALUE & CARRY/BORROW STEPS)
    // =========================================================================
    private level3_Decimals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'dec_add_vertical', type: 'calculate' },
            { key: 'dec_sub_vertical', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const op = v === 'dec_add_vertical' ? '+' : '-';
        const a = MathUtils.randomInt(10, 500) / 10;
        const b = MathUtils.randomInt(10, 500) / 100;

        const val1 = Math.max(a, b);
        const val2 = Math.min(a, b);
        const ans = Math.round((op === '+' ? val1 + val2 : val1 - val2) * 100) / 100;

        const val1Str = this.formatNum(val1, lang);
        const val2Str = this.formatNum(val2, lang);
        const ansStr = this.formatNum(ans, lang);

        const v1Pad = val1.toFixed(2);
        const v2Pad = val2.toFixed(2);
        const v1PadStr = lang === 'sv' ? v1Pad.replace('.', ',') : v1Pad;
        const v2PadStr = lang === 'sv' ? v2Pad.replace('.', ',') : v2Pad;

        const c1A = Number(v1Pad.slice(-1));
        const c1B = Number(v2Pad.slice(-1));
        const t1A = Number(v1Pad.split('.')[1][0]);
        const t1B = Number(v2Pad.split('.')[1][0]);

        const clues: any[] = [
            { 
                text: lang === 'sv' 
                    ? "Ställ upp talen lodrätt så att kommatecknen hamnar rakt under varandra." 
                    : "Set up the numbers vertically so the decimal points line up straight under each other.", 
                latex: this.makeVerticalStep(val1Str, val2Str, op)
            },
            { 
                text: lang === 'sv' 
                    ? "Fyll på med nollor i slutet så att båda talen har lika många decimaler (hundradelar)." 
                    : "Pad with trailing zeros so both numbers have the same number of decimal places (hundredths).", 
                latex: this.makeVerticalStep(v1PadStr, v2PadStr, op)
            }
        ];

        if (op === '+') {
            const rawHund = c1A + c1B;
            const carryHund = Math.floor(rawHund / 10);
            const hundDigit = rawHund % 10;

            const rawTent = t1A + t1B + carryHund;
            const carryTent = Math.floor(rawTent / 10);
            const tentDigit = rawTent % 10;

            const decSep = lang === 'sv' ? ',' : '.';

            clues.push({
                text: carryHund > 0
                    ? (lang === 'sv'
                        ? `Hundradelar: ${c1A} + ${c1B} = ${rawHund}. Skriv ${hundDigit} i hundradelskolumnen och sätt minnessiffran ${carryHund} ovanför tiondelarna.`
                        : `Hundredths: ${c1A} + ${c1B} = ${rawHund}. Write ${hundDigit} in the hundredths column and carry ${carryHund} above the tenths.`)
                    : (lang === 'sv'
                        ? `Hundradelar: ${c1A} + ${c1B} = ${hundDigit}. Skriv ${hundDigit} i hundradelskolumnen.`
                        : `Hundredths: ${c1A} + ${c1B} = ${hundDigit}. Write ${hundDigit} in the hundredths column.`),
                latex: this.makeVerticalStep(
                    v1PadStr,
                    v2PadStr,
                    '+',
                    carryHund > 0 ? `^${carryHund}\\text{ (tiondelar)}` : '',
                    `\\mathbf{${hundDigit}}`
                )
            });

            clues.push({
                text: carryHund > 0
                    ? (lang === 'sv'
                        ? `Tiondelar: Räkna ${t1A} + ${t1B} + minnessiffran ${carryHund} = ${rawTent}. Skriv ${tentDigit} och placera kommatecknet${carryTent > 0 ? ` (samt ${carryTent} i minne ovanför entalen)` : ''}.`
                        : `Tenths: Calculate ${t1A} + ${t1B} + carried ${carryHund} = ${rawTent}. Write ${tentDigit} and place the decimal point${carryTent > 0 ? ` (carrying ${carryTent} above the ones)` : ''}.`)
                    : (lang === 'sv'
                        ? `Tiondelar: Räkna ${t1A} + ${t1B} = ${rawTent}. Skriv ${tentDigit} och placera kommatecknet${carryTent > 0 ? ` (samt ${carryTent} i minne ovanför entalen)` : ''}.`
                        : `Tenths: Calculate ${t1A} + ${t1B} = ${rawTent}. Write ${tentDigit} and place the decimal point${carryTent > 0 ? ` (carrying ${carryTent} above the ones)` : ''}.`),
                latex: this.makeVerticalStep(
                    v1PadStr,
                    v2PadStr,
                    '+',
                    carryTent > 0 ? `^${carryTent}\\text{ (ental)}` : '',
                    `\\mathbf{${decSep}${tentDigit}${hundDigit}}`
                )
            });
        } else {
            const borrowHund = c1A < c1B;
            const effHundA = borrowHund ? c1A + 10 : c1A;
            const effTentA = borrowHund ? t1A - 1 : t1A;
            const hundDiff = effHundA - c1B;

            const borrowTent = effTentA < t1B;
            const effTentAfterBorrow = borrowTent ? effTentA + 10 : effTentA;
            const tentDiff = effTentAfterBorrow - t1B;
            const decSep = lang === 'sv' ? ',' : '.';

            clues.push({
                text: borrowHund
                    ? (lang === 'sv'
                        ? `Hundradelar: ${c1A} är mindre än ${c1B}. Låna 1 tiondel (10 hundradelar) så att vi får ${effHundA} hundradelar (${effTentA} tiondelar kvar). Räkna: ${effHundA} - ${c1B} = ${hundDiff}.`
                        : `Hundredths: ${c1A} is less than ${c1B}. Borrow 1 tenth (10 hundredths) to get ${effHundA} hundredths (${effTentA} tenths left). Calculate: ${effHundA} - ${c1B} = ${hundDiff}.`)
                    : (lang === 'sv'
                        ? `Hundradelar: Räkna ${c1A} - ${c1B} = ${hundDiff}.`
                        : `Hundredths: Calculate ${c1A} - ${c1B} = ${hundDiff}.`),
                latex: this.makeVerticalStep(
                    v1PadStr,
                    v2PadStr,
                    '-',
                    borrowHund ? (lang === 'sv' ? `\\text{${effTentA} tiondelar kvar}` : `\\text{${effTentA} tenths left}`) : '',
                    `\\mathbf{${hundDiff}}`
                )
            });

            clues.push({
                text: borrowTent
                    ? (lang === 'sv'
                        ? `Tiondelar: Låna 1 ental (10 tiondelar) till tiondelarna (${effTentAfterBorrow} tiondelar). Räkna: ${effTentAfterBorrow} - ${t1B} = ${tentDiff}.`
                        : `Tenths: Borrow 1 one (10 tenths) for the tenths column (${effTentAfterBorrow} tenths). Calculate: ${effTentAfterBorrow} - ${t1B} = ${tentDiff}.`)
                    : (lang === 'sv'
                        ? `Tiondelar: Räkna ${effTentA} - ${t1B} = ${tentDiff}.`
                        : `Tenths: Calculate ${effTentA} - ${t1B} = ${tentDiff}.`),
                latex: this.makeVerticalStep(
                    v1PadStr,
                    v2PadStr,
                    '-',
                    borrowTent ? (lang === 'sv' ? `\\text{Lån från ental}` : `\\text{Borrowed from ones}`) : '',
                    `\\mathbf{${decSep}${tentDiff}${hundDiff}}`
                )
            });
        }

        clues.push({
            text: lang === 'sv'
                ? `Slutför resten av kolumnerna: Svaret blir ${ansStr}.`
                : `Complete the remaining columns: The answer is ${ansStr}.`,
            latex: this.makeVerticalStep(v1PadStr, v2PadStr, op, '', `\\mathbf{${ansStr}}`)
        });

        clues.push({ 
            text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
            latex: `${ansStr}` 
        });

        return {
            renderData: {
                description: lang === 'sv' ? "Ställ upp och beräkna." : "Calculate.",
                latex: `${val1Str} ${op} ${val2Str}`, 
                answerType: 'numeric'
            },
            token: this.toBase64(ansStr), 
            variationKey: v, 
            type: 'calculate',
            clues
        };
    }

    // =========================================================================
    // LEVEL 4: MULT EASY
    // =========================================================================
    private level4_MultEasy(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_table_std', type: 'calculate' },
            { key: 'mult_commutative', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10);

        if (v === 'mult_table_std') {
            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", 
                    latex: `${a} \\cdot ${b}`, 
                    interceptorToken: `${a} · ${b}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64((a * b).toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Multiplikation betyder upprepad addition: ${a} · ${b} betyder ${a} grupper med ${b} i varje.` 
                            : `Multiplication means repeated addition: ${a} · ${b} means ${a} groups of ${b}.`, 
                        latex: `${a} \\cdot ${b}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Använd multiplikationstabellen:` 
                            : `Use the multiplication table:`, 
                        latex: `${a} \\cdot ${b} = \\mathbf{${a * b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${a * b}` : `Answer: ${a * b}`, 
                        latex: `${a * b}` 
                    }
                ]
            };
        }

        const correct = `${b} \\cdot ${a}`;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket uttryck ger samma svar som ${a} · ${b}?` : `Which expression gives the same answer as ${a} · ${b}?`,
                answerType: 'multiple_choice', 
                options: MathUtils.shuffle([correct, `${a}+${b}`, `${a}-${b}`])
            },
            token: this.toBase64(correct), 
            variationKey: v, 
            type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Vid multiplikation spelar det ingen roll i vilken ordning du tar talen (kommutativa lagen)." 
                        : "In multiplication, the order of factors does not matter (commutative property).", 
                    latex: `${a} \\cdot ${b} = \\mathbf{${b} \\cdot ${a}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Båda uttrycken ger svaret ${a * b}.` 
                        : `Both expressions equal ${a * b}.`, 
                    latex: `\\mathbf{${correct}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                    latex: `\\mathbf{${correct}}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 5: MULT MEDIUM (LIVE VERTICAL CARRY OVER TIOTAL)
    // =========================================================================
    private level5_MultMedium(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_2x1_vertical', type: 'calculate' },
            { key: 'mult_distributive', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(12, 45), b = MathUtils.randomInt(3, 9);
        const p1 = Math.floor(a / 10) * 10, p2 = a % 10;

        if (v === 'mult_2x1_vertical') {
            const aOnes = a % 10;
            const aTens = Math.floor(a / 10);
            const prodOnes = aOnes * b;
            const carry = Math.floor(prodOnes / 10);
            const onesResult = prodOnes % 10;
            const prodTens = aTens * b + carry;
            const ans = a * b;

            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna." : "Calculate.", 
                    latex: this.makeVertical(a, b, '\\times'), 
                    answerType: 'numeric' 
                },
                token: this.toBase64((a * b).toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Ställ upp multiplikationen lodrätt och börja med entalet i det övre talet." 
                            : "Set up the multiplication vertically and start with the ones digit of the top number.", 
                        latex: this.makeVerticalStep(a, b, '\\times')
                    },
                    { 
                        text: carry > 0
                            ? (lang === 'sv' 
                                ? `Ental: ${aOnes} · ${b} = ${prodOnes}. Skriv ${onesResult} under strecket och sätt minnessiffran ${carry} ovanför tiotalen.` 
                                : `Ones: ${aOnes} · ${b} = ${prodOnes}. Write ${onesResult} below the line and carry ${carry} above the tens column.`)
                            : (lang === 'sv' 
                                ? `Ental: ${aOnes} · ${b} = ${prodOnes}. Skriv ${onesResult} under strecket (ingen minnessiffra).` 
                                : `Ones: ${aOnes} · ${b} = ${prodOnes}. Write ${onesResult} below the line (no carry).`),
                        latex: this.makeVerticalStep(
                            a,
                            b,
                            '\\times',
                            carry > 0 ? `^${carry}\\text{ (minne)}` : '',
                            `\\mathbf{${onesResult}}`
                        )
                    },
                    { 
                        text: carry > 0
                            ? (lang === 'sv' 
                                ? `Tiotal: Multiplicera ${aTens} · ${b} och lägg till minnessiffran ${carry}: ${aTens * b} + ${carry} = ${prodTens}. Minnessiffran är nu använd!` 
                                : `Tens: Multiply ${aTens} · ${b} and add carried ${carry}: ${aTens * b} + ${carry} = ${prodTens}. The carry is now used!`)
                            : (lang === 'sv' 
                                ? `Tiotal: Multiplicera ${aTens} · ${b} = ${prodTens}.` 
                                : `Tens: Multiply ${aTens} · ${b} = ${prodTens}.`),
                        latex: this.makeVerticalStep(a, b, '\\times', '', `\\mathbf{${ans}}`)
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        return {
            renderData: { 
                description: lang === 'sv' ? `Beräkna ${p1+p2}·${b} genom att dela upp faktorn: (${p1}·${b})+(${p2}·${b})` : `Calculate ${p1+p2}·${b} by splitting the factors: (${p1}·${b})+(${p2}·${b})`, 
                answerType: 'numeric' 
            },
            token: this.toBase64((a * b).toString()), 
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna ut den första parentesen (tiotalen):" : "Calculate the first parentheses (tens):", 
                    latex: `\\mathbf{(${p1} \\cdot ${b})} = ${p1 * b}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna sedan ut den andra parentesen (entalen):" : "Next calculate the second parentheses (ones):", 
                    latex: `\\mathbf{(${p2} \\cdot ${b})} = ${p2 * b}` 
                },
                { 
                    text: lang === 'sv' ? `Addera delresultaten:` : `Add the partial products:`, 
                    latex: `${p1 * b} + ${p2 * b} = \\mathbf{${a * b}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${a * b}` : `Answer: ${a * b}`, 
                    latex: `${a * b}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 6: MULT HARD (DECIMALS WITH VERTICAL CARRY OVER)
    // =========================================================================
    private level6_MultHard(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_decimal_std', type: 'calculate' },
            { key: 'mult_decimal_placement', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        const numDecimals = MathUtils.randomChoice([1, 2]);
        let wholeA = numDecimals === 1 ? MathUtils.randomInt(1, 9) : MathUtils.randomInt(11, 99);
        if (numDecimals === 2) {
            while (wholeA % 10 === 0) wholeA = MathUtils.randomInt(11, 99);
        }

        const a = wholeA / Math.pow(10, numDecimals);
        const b = MathUtils.randomInt(3, 15);
        const ans = Math.round(a * b * 1000) / 1000;

        const aStr = this.formatNum(a, lang);
        const ansStr = this.formatNum(ans, lang);

        if (v === 'mult_decimal_std') {
            const onesDigitA = wholeA % 10;
            const tensDigitA = Math.floor(wholeA / 10);
            const onesDigitB = b % 10;
            const prodFirst = onesDigitA * onesDigitB;
            const carryFirst = Math.floor(prodFirst / 10);
            const remFirst = prodFirst % 10;
            const wholeProd = wholeA * b;

            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", 
                    latex: `${aStr} \\cdot ${b}`, 
                    answerType: 'numeric' 
                },
                token: this.toBase64(ansStr), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Börja med att räkna som vanliga heltal utan kommatecken: ställ upp ${wholeA} · ${b} och börja med sista siffran (${onesDigitA} · ${onesDigitB} = ${prodFirst}).` 
                            : `Start as whole numbers without decimal points: set up ${wholeA} · ${b} and begin with the rightmost digits (${onesDigitA} · ${onesDigitB} = ${prodFirst}).`, 
                        latex: this.makeVerticalStep(
                            wholeA,
                            b,
                            '\\times',
                            carryFirst > 0 ? `^${carryFirst}\\text{ (minne)}` : '',
                            `\\mathbf{${remFirst}}`
                        )
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Slutför heltalets multiplikation (${tensDigitA > 0 ? `lägg till minnessiffran ${carryFirst} när du multiplicerar vidare: ` : ''}${wholeA} · ${b} = ${wholeProd}).` 
                            : `Complete the whole-number multiplication (${tensDigitA > 0 ? `include the carry ${carryFirst} as you multiply the remaining digits: ` : ''}${wholeA} · ${b} = ${wholeProd}).`, 
                        latex: this.makeVerticalStep(wholeA, b, '\\times', '', `\\mathbf{${wholeProd}}`)
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Räkna decimalerna: ${aStr} har ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''} och ${b} har 0. Flytta kommatecknet ${numDecimals} steg från höger i ${wholeProd}.` 
                            : `Count the decimals: ${aStr} has ${numDecimals} decimal place${numDecimals > 1 ? 's' : ''} and ${b} has 0. Move the decimal point ${numDecimals} place${numDecimals > 1 ? 's' : ''} from the right in ${wholeProd}.`, 
                        latex: `${wholeProd} \\rightarrow \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                        latex: `${ansStr}` 
                    }
                ]
            };
        }

        const correctStr = `$${aStr} \\cdot ${b} = ${ansStr}$`;
        const trapUp = this.formatNum(Math.round(ans * 10 * 100) / 100, lang);
        const trapDown = this.formatNum(Math.round(ans / 10 * 1000) / 1000, lang);

        return {
            renderData: { 
                description: lang === 'sv' ? "Vilken uträkning har placerat kommatecknet rätt?" : "Which calculation placed the decimal point correctly?", 
                answerType: 'multiple_choice', 
                options: MathUtils.shuffle([correctStr, `$${aStr} \\cdot ${b} = ${trapUp}$`, `$${aStr} \\cdot ${b} = ${trapDown}$`]) 
            },
            token: this.toBase64(correctStr), 
            variationKey: v, 
            type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Räkna decimalerna i faktorerna: ${aStr} har ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''} och ${b} har inga decimaler.` 
                        : `Count the decimals in the factors: ${aStr} has ${numDecimals} decimal place${numDecimals > 1 ? 's' : ''} and ${b} has none.`, 
                    latex: `${numDecimals} + 0 = \\mathbf{${numDecimals}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Svaret måste ha exakt ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''}.` 
                        : `The answer must have exactly ${numDecimals} decimal place${numDecimals > 1 ? 's' : ''}.`, 
                    latex: `\\mathbf{${correctStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${correctStr}` : `Answer: ${correctStr}`, 
                    latex: `\\text{${correctStr}}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 7: DIVISION EASY
    // =========================================================================
    private level7_DivEasy(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_basic_std', type: 'calculate' },
            { key: 'div_inverse_logic', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const f1 = MathUtils.randomInt(3, 10), f2 = MathUtils.randomInt(3, 10), prod = f1 * f2;

        if (v === 'div_basic_std') {
            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", 
                    latex: `\\frac{${prod}}{${f1}}`, 
                    interceptorToken: `${prod} / ${f1}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(f2.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Division betyder: Hur många gånger får ${f1} plats i ${prod}?` 
                            : `Division means: How many times does ${f1} fit into ${prod}?`, 
                        latex: `\\frac{${prod}}{${f1}} = \\,?` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Tänk multiplikationstabellen baklänges: Vad ska vi multiplicera ${f1} med för att få ${prod}?` 
                            : `Think of the times table in reverse: What number multiplied by ${f1} gives ${prod}?`, 
                        latex: `${f1} \\cdot \\mathbf{?} = ${prod}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Eftersom ${f1} · ${f2} = ${prod}, så är kvoten lika med ${f2}.` 
                            : `Since ${f1} · ${f2} = ${prod}, the quotient is ${f2}.`, 
                        latex: `${f1} \\cdot \\mathbf{${f2}} = ${prod} \\rightarrow \\frac{${prod}}{${f1}} = \\mathbf{${f2}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}`, 
                        latex: `${f2}` 
                    }
                ]
            };
        }

        return {
            renderData: { 
                description: lang === 'sv' ? `Om vi vet att ${f1} · ${f2} = ${prod}, vad är då ${prod} / ${f1}?` : `If we know ${f1} · ${f2} = ${prod}, what is ${prod} / ${f1}?`, 
                answerType: 'numeric' 
            },
            token: this.toBase64(f2.toString()), 
            variationKey: v, 
            type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Multiplikation och division hör ihop i samma talfamilj." 
                        : "Multiplication and division belong together in the same fact family.", 
                    latex: `${f1} \\cdot ${f2} = ${prod}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `När vi dividerar produkten (${prod}) med en av faktorerna (${f1}) får vi den andra faktorn:` 
                        : `When we divide the product (${prod}) by one factor (${f1}), we get the other factor:`, 
                    latex: `\\frac{${prod}}{${f1}} = \\mathbf{${f2}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}`, 
                    latex: `${f2}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 8: DIVISIBILITY RULES
    // =========================================================================
    private level8_DivisibilityRules(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_rule_check', type: 'calculate' },
            { key: 'div_rule_missing', type: 'calculate' },
            { key: 'div_rule_tf', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const divisors = [2, 3, 5, 10];
        const d = MathUtils.randomChoice(divisors);

        const getRuleText = (div: number) => {
            if (div === 2) return lang === 'sv' ? "Regel för 2: Sista siffran måste vara jämn (0, 2, 4, 6, 8)." : "Rule for 2: Last digit must be even (0, 2, 4, 6, 8).";
            if (div === 5) return lang === 'sv' ? "Regel för 5: Sista siffran måste vara 0 eller 5." : "Rule for 5: Last digit must be 0 or 5.";
            if (div === 10) return lang === 'sv' ? "Regel för 10: Sista siffran måste vara 0." : "Rule for 10: Last digit must be 0.";
            return lang === 'sv' ? "Regel för 3: Siffersumman (alla siffror adderade) måste finnas i 3:ans tabell." : "Rule for 3: Digit sum must be a multiple of 3.";
        };

        if (v === 'div_rule_check') {
            let correct = 0;
            let traps = [0, 0];
            
            while (correct % d !== 0 || correct < 100) correct = MathUtils.randomInt(100, 999);
            while (traps[0] % d === 0 || traps[0] < 100) traps[0] = MathUtils.randomInt(100, 999);
            while (traps[1] % d === 0 || traps[1] === traps[0] || traps[1] < 100) traps[1] = MathUtils.randomInt(100, 999);

            const optionsArr = MathUtils.shuffle([correct.toString(), traps[0].toString(), traps[1].toString()]);

            const dynamicClues: any[] = [
                { text: getRuleText(d), latex: "" }
            ];

            if (d === 3) {
                const latexSums = optionsArr.map(opt => {
                    const sum = opt.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
                    return `\\text{${opt}: } ${opt.split('').join(' + ')} = ${sum}`;
                }).join(' \\\\ ');

                const correctSum = correct.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);

                dynamicClues.push({
                    text: lang === 'sv' ? "Beräkna siffersumman för alternativen:" : "Calculate the digit sum for each option:",
                    latex: `\\begin{aligned} ${latexSums} \\end{aligned}`
                });

                dynamicClues.push({
                    text: lang === 'sv' ? `Endast siffersumman ${correctSum} finns i 3:ans tabell.` : `Only the digit sum ${correctSum} is in the 3 times table.`,
                    latex: `\\mathbf{${correct}}`
                });
            } else {
                const latexEnds = optionsArr.map(opt => {
                    return lang === 'sv' ? `\\text{${opt} slutar på } \\mathbf{${opt.slice(-1)}}` : `\\text{${opt} ends in } \\mathbf{${opt.slice(-1)}}`;
                }).join(' \\\\ ');

                dynamicClues.push({
                    text: lang === 'sv' ? "Kontrollera sista siffran i alternativen:" : "Check the last digit of each option:",
                    latex: `\\begin{aligned} ${latexEnds} \\end{aligned}`
                });

                dynamicClues.push({
                    text: lang === 'sv' ? `Endast talet ${correct} uppfyller regeln.` : `Only the number ${correct} fulfills the rule.`,
                    latex: `\\mathbf{${correct}}`
                });
            }

            dynamicClues.push({ 
                text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                latex: `\\text{${correct}}` 
            });

            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilket av följande tal är delbart med ${d}?` : `Which of the following numbers is divisible by ${d}?`, 
                    answerType: 'multiple_choice',
                    options: optionsArr
                },
                token: this.toBase64(correct.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues: dynamicClues
            };
        }

        if (v === 'div_rule_missing') {
            const isSmallest = MathUtils.randomChoice([true, false]);
            const prefix = MathUtils.randomInt(10, 99).toString(); 
            
            let validDigits: number[] = [];
            for (let i = 0; i <= 9; i++) {
                if (parseInt(prefix + i) % d === 0) validDigits.push(i);
            }

            const targetDigit = isSmallest ? Math.min(...validDigits) : Math.max(...validDigits);
            const sizeWord = isSmallest 
                ? (lang === 'sv' ? "minsta möjliga" : "smallest possible") 
                : (lang === 'sv' ? "största möjliga" : "largest possible");

            const clues: any[] = [
                { text: getRuleText(d), latex: "" }
            ];

            if (d === 3) {
                const prefixSum = parseInt(prefix[0]) + parseInt(prefix[1]);
                clues.push({ 
                    text: lang === 'sv' 
                        ? `Addera de synliga siffrorna: ${prefix[0]} + ${prefix[1]} = ${prefixSum}.` 
                        : `Add the visible digits: ${prefix[0]} + ${prefix[1]} = ${prefixSum}.`, 
                    latex: `\\text{Del-summa: } ${prefix[0]} + ${prefix[1]} = ${prefixSum}` 
                });
                clues.push({ 
                    text: lang === 'sv' 
                        ? `Vi söker den ${sizeWord} siffran (0–9) som gör att hela summan finns i 3:ans tabell:` 
                        : `We find the ${sizeWord} digit (0–9) that makes the total digit sum a multiple of 3:`, 
                    latex: `${prefixSum} + \\mathbf{${targetDigit}} = ${prefixSum + targetDigit}` 
                });
            } else {
                clues.push({ 
                    text: lang === 'sv' 
                        ? `När vi undersöker delbarhet med ${d} är det bara sista siffran som avgör.` 
                        : `When testing divisibility by ${d}, only the last digit matters.`, 
                    latex: `\\text{Sista siffran} = \\mathbf{${targetDigit}}` 
                });
            }

            clues.push({ 
                text: lang === 'sv' ? `Svar: ${targetDigit}` : `Answer: ${targetDigit}`, 
                latex: `${targetDigit}` 
            });

            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilken är den ${sizeWord} siffran som kan ersätta strecket för att talet ${prefix}_ ska vara delbart med ${d}?` : `What is the ${sizeWord} digit that can replace the blank to make the number ${prefix}_ divisible by ${d}?`, 
                    latex: `${prefix}\\_`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(targetDigit.toString()), 
                variationKey: v, 
                type: 'calculate',
                clues
            };
        }

        // div_rule_tf
        const statements = [
            { text: lang === 'sv' ? "Om ett tal är delbart med 10, är det alltid delbart med 5." : "If a number is divisible by 10, it is always divisible by 5.", isTrue: true, reason: lang === 'sv' ? "Ja! Alla tal som slutar på 0 slutar också på 0 eller 5." : "Yes! All numbers ending in 0 also end in 0 or 5." },
            { text: lang === 'sv' ? "Om ett tal är delbart med 5, är det alltid delbart med 10." : "If a number is divisible by 5, it is always divisible by 10.", isTrue: false, reason: lang === 'sv' ? "Nej. Tal som slutar på 5 (t.ex. 15 eller 25) är inte delbara med 10." : "No. Numbers ending in 5 (e.g. 15 or 25) are not divisible by 10." },
            { text: lang === 'sv' ? "Om ett tal är delbart med 2 och slutar på 5, är det delbart med 10." : "If a number is divisible by 2 and ends in 5, it is divisible by 10.", isTrue: false, reason: lang === 'sv' ? "Nej. Ett tal som slutar på 5 är udda och kan aldrig vara delbart med 2." : "No. A number ending in 5 is odd and can never be divisible by 2." }
        ];

        const chosen = MathUtils.randomChoice(statements);
        const tBtn = lang === 'sv' ? "Sant" : "True";
        const fBtn = lang === 'sv' ? "Falskt" : "False";
        const ans = chosen.isTrue ? tBtn : fBtn;

        return {
            renderData: { 
                description: chosen.text, 
                answerType: 'multiple_choice',
                options: [tBtn, fBtn]
            },
            token: this.toBase64(ans), 
            variationKey: v, 
            type: 'concept',
            clues: [
                { text: getRuleText(10), latex: "" },
                { text: chosen.reason, latex: "" },
                { text: lang === 'sv' ? `Påståendet är: ${ans}` : `The statement is: ${ans}`, latex: `\\mathbf{${ans}}` }
            ]
        };
    }

    // =========================================================================
    // LEVEL 9: DIVISION WITH DECIMALS
    // =========================================================================
    private level9_DecimalDivision(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'div_decimal_dividend', type: 'calculate' },
            { key: 'div_decimal_divisor', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'div_decimal_dividend') {
            const divisor = MathUtils.randomInt(2, 9);
            const quotientWhole = MathUtils.randomInt(2, 12);
            const decShift = MathUtils.randomChoice([10, 100]);
            
            const dividend = (divisor * quotientWhole) / decShift;
            const ans = quotientWhole / decShift;
            const dividendStr = this.formatNum(dividend, lang);
            const ansStr = this.formatNum(ans, lang);

            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", 
                    latex: `\\frac{${dividendStr}}{${divisor}}`, 
                    interceptorToken: `${dividend} / ${divisor}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(ansStr), 
                variationKey: v, 
                type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Dela först som vanliga heltal utan kommatecken: ${this.formatNum(divisor * quotientWhole, lang)} / ${divisor}.` 
                            : `First divide as whole numbers without the decimal point: ${this.formatNum(divisor * quotientWhole, lang)} / ${divisor}.`, 
                        latex: `\\frac{${this.formatNum(divisor * quotientWhole, lang)}}{${divisor}} = \\mathbf{${quotientWhole}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Sätt tillbaka kommatecknet i svaret på samma plats som i täljaren (${dividendStr} har ${decShift === 10 ? '1 decimal' : '2 decimaler'}).` 
                            : `Place the decimal point in the answer at the exact same position as in the dividend (${dividendStr} has ${decShift === 10 ? '1 decimal' : '2 decimals'}).`, 
                        latex: `\\frac{${dividendStr}}{${divisor}} = \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                        latex: `${ansStr}` 
                    }
                ]
            };
        }

        // div_decimal_divisor
        const ans = MathUtils.randomInt(2, 12);
        const divisorWhole = MathUtils.randomInt(2, 9);
        const decShift = MathUtils.randomChoice([10, 100]);
        const divisor = divisorWhole / decShift;
        const dividend = (ans * divisorWhole) / decShift;
        
        const dividendStr = this.formatNum(dividend, lang);
        const divisorStr = this.formatNum(divisor, lang);

        return {
            renderData: { 
                description: lang === 'sv' ? "Beräkna kvoten." : "Calculate the quotient.", 
                latex: `\\frac{${dividendStr}}{${divisorStr}}`, 
                interceptorToken: `${dividend} / ${divisor}`,
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()), 
            variationKey: v, 
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Det är svårt att dela med ett decimaltal (${divisorStr}). Förläng bråket genom att multiplicera både täljare och nämnare med ${decShift} så att nämnaren blir ett heltal.` 
                        : `It is difficult to divide by a decimal (${divisorStr}). Multiply both top and bottom by ${decShift} so the denominator becomes a whole number.`, 
                    latex: `\\frac{${dividendStr} \\cdot \\mathbf{${decShift}}}{${divisorStr} \\cdot \\mathbf{${decShift}}} = \\frac{${ans * divisorWhole}}{${divisorWhole}}` 
                },
                { 
                    text: lang === 'sv' 
                        ? `Nu har vi en enkel division med heltal: ${ans * divisorWhole} / ${divisorWhole}.` 
                        : `Now we have a simple whole-number division: ${ans * divisorWhole} / ${divisorWhole}.`, 
                    latex: `\\frac{${ans * divisorWhole}}{${divisorWhole}} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // =========================================================================
    // LEVEL 10: MIXED INTEGERS
    // =========================================================================
    private level10_MixedIntegers(lang: string, options: any): any {
        const key = MathUtils.randomChoice(['add_std_horizontal', 'sub_std_horizontal', 'mult_table_std', 'div_basic_std']);
        const res = this.generateByVariation(key, lang, options);
        if (res && res.metadata) {
            res.metadata.mixed = true;
        }
        return res;
    }

    // =========================================================================
    // LEVEL 11: MIXED DECIMALS
    // =========================================================================
    private level11_MixedDecimals(lang: string, options: any): any {
        const key = MathUtils.randomChoice([
            'dec_add_vertical', 
            'dec_sub_vertical', 
            'mult_decimal_std', 
            'div_decimal_dividend', 
            'div_decimal_divisor'
        ]);
        const res = this.generateByVariation(key, lang, options);
        if (res && res.metadata) {
            res.metadata.mixed = true;
        }
        return res;
    }
}