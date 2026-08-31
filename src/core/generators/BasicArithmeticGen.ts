import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class BasicArithmeticGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        let questionData: any;

        // 🛑 Capture the level output inside a local variable instead of immediate returns
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

        // Run the question data through the decorator for default fallback parameters
        enrichQuestionMetadata(questionData);

        // Level-wide capability override for Practice Mode
        // 🟢 Don't forget to add the new Level 9 (old 8) to the word problem list!
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 4, 7, 9];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Must match skillBuckets.js keys exactly.
     */
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

        // Word Problem Decorator: Passes the built question through the universal decorator for interceptor toggle button in practice view
        return enrichQuestionMetadata(questionData);
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private makeVertical(top: number | string, bottom: number | string, op: string): string {
        return `\\begin{array}{r} ${top} \\\\ ${op} \\; ${bottom} \\\\ \\hline \\end{array}`;
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

    // Safely format numbers with commas for Swedish
    private formatNum(num: number, lang: string): string {
        // Strip trailing zeros caused by JS float math, then format
        const cleanNum = parseFloat(num.toFixed(4));
        return lang === 'sv' ? cleanNum.toString().replace('.', ',') : cleanNum.toString();
    }

    // --- LEVEL 1: ADDITION ---
    private level1_AddSimple(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'add_std_vertical', type: 'calculate' },
            { key: 'add_std_horizontal', type: 'calculate' },
            { key: 'add_missing_variable', type: 'calculate' },
            { key: 'add_spot_the_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'add_std_vertical' || v === 'add_std_horizontal') {
            const a = MathUtils.randomInt(10, 200);
            const b = MathUtils.randomInt(10, 200);
            const isVertical = v === 'add_std_vertical';
            const ans = a + b;
            
            // Extract place values for step-by-step visual distribution strategy
            const aHundreds = Math.floor(a / 100) * 100, bHundreds = Math.floor(b / 100) * 100;
            const aTens = Math.floor((a % 100) / 10) * 10, bTens = Math.floor((b % 100) / 10) * 10;
            const aOnes = a % 10, bOnes = b % 10;
            const baseExpression = isVertical ? this.makeVertical(a, b, '+') : `${a} + ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna summan." : "Calculate the sum.",
                    latex: baseExpression,
                    interceptorToken: `${a} + ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Vi beräknar additionen genom att dela upp talen i hundratal, tiotal och ental." : "We calculate the addition by breaking the numbers into hundreds, tens, and ones.", 
                        latex: baseExpression 
                    },
                    { 
                        text: lang === 'sv' ? `Börja med att addera hundratalen tillsammans: ${aHundreds} + ${bHundreds}` : `Start by adding the hundreds place values together: ${aHundreds} + ${bHundreds}`, 
                        latex: `\\mathbf{${aHundreds} + ${bHundreds}} + ${aTens} + ${bTens} + ${aOnes} + ${bOnes}` 
                    },
                    { 
                        text: lang === 'sv' ? `Addera nu tiotalen tillsammans: ${aTens} + ${bTens}` : `Now add the tens place values together: ${aTens} + ${bTens}`, 
                        latex: `${aHundreds + bHundreds} + \\mathbf{${aTens} + ${bTens}} + ${aOnes} + ${bOnes}` 
                    },
                    { 
                        text: lang === 'sv' ? `Addera till sist entalen tillsammans: ${aOnes} + ${bOnes}` : `Finally, add the ones place values together: ${aOnes} + ${bOnes}`, 
                        latex: `${aHundreds + bHundreds} + ${aTens + bTens} + \\mathbf{${aOnes} + ${bOnes}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Slå ihop delsummorna för att få fram det slutgiltiga svaret." : "Combine the partial sums together to reach the final calculated total.", 
                        latex: `\\mathbf{${aHundreds + bHundreds} + ${aTens + bTens} + ${aOnes + bOnes}} = ${ans}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        if (v === 'add_missing_variable') {
            const a = MathUtils.randomInt(5, 100);
            const x = MathUtils.randomInt(5, 100);
            const sum = a + x;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket tal saknas för att summan ska stämma?" : "What number is missing to make the sum correct?",
                    latex: `${a} + x = ${sum}`, answerType: 'numeric'
                },
                token: this.toBase64(x.toString()),
                variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "För att hitta ett okänt tal i en addition gör vi det motsatta, vilket är subtraktion." : "To find an unknown missing term in an addition equation, we perform the inverse action, which is subtraction.", 
                        latex: `${a} + x = ${sum}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ta bort ${a} från vänster sida genom att subtrahera ${a} på båda sidor.` : `Isolate x by subtracting the known number ${a} from both sides of the equation.`, 
                        latex: `${a} \\mathbf{- ${a}} + x = ${sum} \\mathbf{- ${a}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut subtraktionen på höger sida för att hitta det saknade värdet.` : `Calculate the subtraction on the right side to discover the value of the missing piece.`, 
                        latex: `x = \\mathbf{${sum} - ${a}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Förenkla raden för att få fram slutsvar.` : `Simplify the line to reach your final answer key value.`, 
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
        const sTrue = `${n1} + ${n2} = ${n1 + n2}`;
        const sFalse = `${n1} + ${n2} = ${n1 + n2 + MathUtils.randomChoice([-2, 1, 2])}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Vilken uträkning är felaktig?" : "Which calculation is incorrect?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue, `${MathUtils.randomInt(10,30)} + 10 = ${MathUtils.randomInt(45,60)}`, sFalse])
            },
            token: this.toBase64(sFalse),
            variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Testa alternativen genom att addera tiotalen och entalen för sig." : "Test the options by adding the tens and ones separately.", 
                    latex: `\\text{Kontrollera: } ${n1} + ${n2}` 
                },
                { 
                    text: lang === 'sv' ? `Lägg ihop tiotalen (${Math.floor(n1/10)*10} + ${Math.floor(n2/10)*10}) och entalen (${n1%10} + ${n2%10}).` : `Add the tens (${Math.floor(n1/10)*10} + ${Math.floor(n2/10)*10}) and the ones (${n1%10} + ${n2%10}).`, 
                    latex: `(${Math.floor(n1/10)*10} + ${Math.floor(n2/10)*10}) + (${n1%10} + ${n2%10}) = ${n1 + n2}` 
                },
                { 
                    text: lang === 'sv' ? `Svaret ska bli ${n1 + n2}, vilket betyder att den här uträkningen är fel:` : `The answer should be ${n1 + n2}, which means this calculation is wrong:`, 
                    latex: `\\mathbf{${sFalse}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${sFalse}` : `Answer: ${sFalse}`, 
                    latex: `\\text{${sFalse}}` 
                }
            ]
        };
    }

    // --- LEVEL 2: SUBTRACTION ---
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
            
            // Refactored pedagogical strategy: Horizontal jump adjustments to eliminate borrowing confusion
            const nearestTen = Math.ceil(b / 10) * 10;
            const jumpToTen = nearestTen - b;
            const jumpToTarget = a - nearestTen;

            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna differensen." : "Calculate the difference.",
                    latex: baseExpression,
                    interceptorToken: `${a} - ${b}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ett smart sätt att räkna subtraktion är att mäta avståndet (hoppa) från det minsta talet upp till det största." : "A clever tracking strategy for subtraction is measuring the step-by-step jump distance upwards from the smaller number to the larger number.", 
                        latex: baseExpression 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 1: Räkna ut hoppet från ${b} upp till närmaste jämna tiotal (${nearestTen}).` : `Step 1: Calculate the distance from ${b} up to the nearest clean multiple of ten (${nearestTen}).`, 
                        latex: `${b} + \\mathbf{${jumpToTen}} = ${nearestTen}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 2: Räkna ut hoppet från ${nearestTen} hela vägen upp till målet ${a}.` : `Step 2: Calculate the remaining jump from ${nearestTen} all the way up to the final target number ${a}.`, 
                        latex: `${nearestTen} + \\mathbf{${jumpToTarget}} = ${a}` 
                    },
                    { 
                        text: lang === 'sv' ? `Steg 3: Lägg ihop de två hoppen (${jumpToTen} + ${jumpToTarget}) för att få fram den totala skillnaden.` : `Step 3: Combine your two separate jump values (${jumpToTen} + ${jumpToTarget}) to find the total combined difference.`, 
                        latex: `\\text{Differens} = \\mathbf{${jumpToTen} + ${jumpToTarget}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Förenkla additionen för att hitta det slutgiltiga svaret." : "Simplify the addition row to calculate the final scalar response.", 
                        latex: `\\text{Differens} = \\mathbf{${ans}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `${ans}` 
                    }
                ]
            };
        }

        const x = MathUtils.randomInt(20, 80), start = x + MathUtils.randomInt(20, 100);
        const resultVal = start - x;
        return {
            renderData: { description: lang === 'sv' ? "Vilket tal saknas?" : "Find the missing number.", latex: `${start} - x = ${resultVal}`, answerType: 'numeric' },
            token: this.toBase64(x.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "För att hitta ett subtraherat dolt tal, vill vi kika på skillnaden mellan starttalet och målet." : "To find a missing term that is being subtracted, we examine the distance balance between our starting number and the result output value.", 
                    latex: `${start} - x = ${resultVal}` 
                },
                { 
                    text: lang === 'sv' ? `Vi kan skriva om ekvationen genom att byta plats på x och ${resultVal}:` : `We can restructure this line horizontally by swapping the variable position with the product limit value:`, 
                    latex: `${start} - \\mathbf{${resultVal}} = x` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut subtraktionen för att frigöra och beräkna variabeln x.` : `Perform the calculation on the left side to isolate and reveal the value of x.`, 
                    latex: `\\mathbf{${start - resultVal}} = x` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ]
        };
    }

    // --- LEVEL 3: DECIMALS (EXCLUSIVELY HORIZONTAL) ---
    private level3_Decimals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'dec_add_vertical', type: 'calculate' },
            { key: 'dec_sub_vertical', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const op = v === 'dec_add_vertical' ? '+' : '-';
        const a = MathUtils.randomInt(10, 500) / 10;
        const b = MathUtils.randomInt(10, 500) / 100;
        const val1 = op === '+' ? a : Math.max(a, b);
        const val2 = op === '+' ? b : Math.min(a, b);
        const ans = Math.round((op === '+' ? val1 + val2 : val1 - val2) * 100) / 100;

        // add_spot_the_lie
        const n1 = MathUtils.randomInt(10, 50), n2 = MathUtils.randomInt(10, 50);
        const sTrue = `${n1} + ${n2} = ${n1 + n2}`;
        const sFalse = `${n1} + ${n2} = ${n1 + n2 + MathUtils.randomChoice([-2, 1, 2])}`;
        return {
            renderData: {
                description: lang === 'sv' ? "Ställ upp och beräkna." : "Calculate.",
                latex: `${val1} ${op} ${val2}`, answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Se till att kommatecknen hamnar rakt under varandra." : "Make sure the decimal points align straight under each other.", 
                    latex: `${val1} ${op} ${val2}` 
                },
                { 
                    text: lang === 'sv' ? "Lägg till en nolla i slutet om det behövs så att talen blir lika långa." : "Add a zero at the end if needed so the numbers are the same length.", 
                    latex: `${val1.toString().includes('.') && val1.toString().split('.')[1].length === 1 ? val1 + '0' : val1} ${op} ${val2.toString().includes('.') && val2.toString().split('.')[1].length === 1 ? val2 + '0' : val2}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna nu talsort för talsort för att få fram svaret." : "Now calculate place value by place value to find the answer.", 
                    latex: `${val1} ${op} ${val2} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 4: MULT EASY ---
    private level4_MultEasy(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_table_std', type: 'calculate' },
            { key: 'mult_commutative', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10);

        if (v === 'mult_table_std') {
            // Refactored strategy: Anchor breakdown grids to show struggling students landmark combinations (like 5x or 10x)
            const intermediateFactor = a > 5 ? 5 : 2;
            const remainderFactor = a - intermediateFactor;

            return {
                renderData: { 
                    description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", 
                    latex: `${a} \\cdot ${b}`, 
                    interceptorToken: `${a} · ${b}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Om multiplikationstabellen känns klurig kan vi dela upp ${a} i enklare delar, t.ex. (${intermediateFactor} + ${remainderFactor}).` : `If the full multiplication table feels tricky, we can decompose ${a} into manageable components, like (${intermediateFactor} + ${remainderFactor}).`, 
                        latex: `${a} \\cdot ${b} = (${intermediateFactor} + ${remainderFactor}) \\cdot ${b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Multiplicera in i parentesen: Räkna ut ${intermediateFactor} · ${b} och ${remainderFactor} · ${b} var för sig.` : `Distribute across the brackets: Calculate ${intermediateFactor} · ${b} and ${remainderFactor} · ${b} independently.`, 
                        latex: `= \\mathbf{${intermediateFactor} \\cdot ${b}} + \\mathbf{${remainderFactor} \\cdot ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Skriv ut delprodukterna (${intermediateFactor * b} och ${remainderFactor * b}):` : `Evaluate those individual helper multiplication pieces (${intermediateFactor * b} and ${remainderFactor * b}):`, 
                        latex: `= \\mathbf{${intermediateFactor * b}} + \\mathbf{${remainderFactor * b}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Addera ihop delarna för att få fram det färdiga svaret." : "Add the two products together to get the final unified response value.", 
                        latex: `= \\mathbf{${a * b}}` 
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
                answerType: 'multiple_choice', options: MathUtils.shuffle([correct, `${a}+${b}`, `${a}-${b}`])
            },
            token: this.toBase64(correct), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Vid multiplikation spelar det ingen roll i vilken ordning du tar talen." : "In multiplication, it does not matter which order you multiply the numbers.", 
                    latex: `${a} \\cdot ${b}` 
                },
                { 
                    text: lang === 'sv' ? "Det betyder att vi kan byta plats på siffrorna och ändå få exakt samma svar." : "This means we can swap the places of the numbers and still get the exact same answer.", 
                    latex: `${a} \\cdot ${b} = \\mathbf{${b} \\cdot ${a}}` 
                },
                { 
                    text: lang === 'sv' ? `Båda sätten ger svaret ${a * b}, så det rätta alternativet är:` : `Both ways give the answer ${a * b}, so the correct option is:`, 
                    latex: `\\mathbf{${correct}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                    latex: `\\mathbf{${correct}}` 
                }
            ]
        };
    }

    // --- LEVEL 5: MULT MEDIUM ---
    private level5_MultMedium(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_2x1_vertical', type: 'calculate' },
            { key: 'mult_distributive', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(12, 45), b = MathUtils.randomInt(3, 9);
        const p1 = Math.floor(a / 10) * 10, p2 = a % 10;

        if (v === 'mult_2x1_vertical') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna." : "Calculate.", latex: this.makeVertical(a, b, '\\times'), answerType: 'numeric' },
                token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Dela upp talet ${a} i tiotal (${p1}) och ental (${p2}) för att göra det enklare.` : `Break the number ${a} into tens (${p1}) and ones (${p2}) to make it easier.`, 
                        latex: `${a} \\cdot ${b} = (${p1} + ${p2}) \\cdot ${b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra först entalet med ${b}: ${p2} · ${b} = ${p2 * b}` : `First, multiply the ones digit by ${b}: ${p2} · ${b} = ${p2 * b}`, 
                        latex: `= ${p1} \\cdot ${b} + \\mathbf{${p2} \\cdot ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Gångra sedan tiotalet med ${b}: ${p1} · ${b} = ${p1 * b}` : `Next, multiply the tens digit by ${b}: ${p1} · ${b} = ${p1 * b}`, 
                        latex: `= \\mathbf{${p1} \\cdot ${b}} + ${p2 * b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Plussa ihop de två svaren (${p1 * b} + ${p2 * b}) för att få slutsvaret.` : `Add the two answers (${p1 * b} + ${p2 * b}) together to get the final total.`, 
                        latex: `= \\mathbf{${p1 * b} + ${p2 * b}} = ${a * b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${a * b}` : `Answer: ${a * b}`, 
                        latex: `${a * b}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? `Beräkna ${p1+p2}·${b} genom att göra så här: (${p1}·${b})+(${p2}·${b})` : `Calculate ${p1+p2}·${b} by splitting the factors like this: (${p1}·${b})+(${p2}·${b})`, answerType: 'numeric' },
            token: this.toBase64((a * b).toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna ut det första gångertalet i den vänstra parentesen först." : "Calculate the first multiplication inside the left parentheses first.", 
                    latex: `\\mathbf{(${p1} \\cdot ${b})} + (${p2} \\cdot ${b})` 
                },
                { 
                    text: lang === 'sv' ? "Räkna sedan ut det andra gångertalet i den högra parentesen." : "Next, calculate the second multiplication inside the right parentheses.", 
                    latex: `${p1 * b} + \\mathbf{(${p2} \\cdot ${b})}` 
                },
                { 
                    text: lang === 'sv' ? `Plussa till sist ihop de två svaren (${p1 * b} + ${p2 * b}).` : `Finally, add those two answers (${p1 * b} + ${p2 * b}) together.`, 
                    latex: `\\mathbf{${p1 * b} + ${p2 * b}}` 
                },
                { 
                    text: lang === 'sv' ? "Slutför plussandet för att få fram det färdiga resultatet." : "Complete the addition to reach your final answer.", 
                    latex: `\\mathbf{${a * b}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${a * b}` : `Answer: ${a * b}`, 
                    latex: `${a * b}` 
                }
            ]
        };
    }

    // --- LEVEL 6: MULT HARD (1 OR 2 DECIMALS) ---
    private level6_MultHard(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'mult_decimal_std', type: 'calculate' },
            { key: 'mult_decimal_placement', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        // Dynamically allow 1 or 2 decimal places, completely avoiding trailing zeroes
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
        const shiftFactor = Math.pow(10, numDecimals);

        if (v === 'mult_decimal_std') {
            return {
                renderData: { description: lang === 'sv' ? "Beräkna produkten." : "Calculate the product.", latex: `${aStr} \\cdot ${b}`, answerType: 'numeric' },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Tänk bort kommatecknet först och räkna som ett vanligt gångertal: ${wholeA} · ${b}.` : `Ignore the decimal point first and calculate as a regular multiplication: ${wholeA} · ${b}.`, 
                        latex: `\\mathbf{${wholeA}} \\cdot ${b}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut svaret: ${wholeA} gånger ${b} blir ${wholeA * b}.` : `Calculate the answer: ${wholeA} times ${b} equals ${wholeA * b}.`, 
                        latex: `${wholeA} \\cdot ${b} = \\mathbf{${wholeA * b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Sätt tillbaka kommatecknet. Eftersom ${aStr} har ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''} efter kommat ska även svaret ha det.` : `Put the decimal point back. Since ${aStr} has ${numDecimals} decimal${numDecimals > 1 ? 's' : ''} after the comma, the answer must also have ${numDecimals}.`, 
                        latex: `\\frac{${wholeA * b}}{\\mathbf{${shiftFactor}}} = \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                        latex: `${ansStr}` 
                    }
                ]
            };
        }

        const correctStr = `${aStr} \\cdot ${b} = ${ansStr}`;
        const trapUp = this.formatNum(Math.round(ans * 10 * 100) / 100, lang);
        const trapDown = this.formatNum(Math.round(ans / 10 * 1000) / 1000, lang);

        return {
            renderData: { description: lang === 'sv' ? "Vilken uträkning har placerat kommatecknet rätt?" : "Which calculation placed the decimal point correctly?", answerType: 'multiple_choice', options: MathUtils.shuffle([correctStr, `${aStr} \\cdot ${b} = ${trapUp}`, `${aStr} \\cdot ${b} = ${trapDown}`]) },
            token: this.toBase64(correctStr), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna hur många decimaler (siffror efter kommat) det finns i talen totalt." : "Count how many decimals (digits after the comma) there are in the numbers in total.", 
                    latex: `${aStr} \\cdot ${b}` 
                },
                { 
                    text: lang === 'sv' ? `Talet ${aStr} har ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''} och ${b} har 0 decimaler. Svaret måste ha exakt ${numDecimals} decimal${numDecimals > 1 ? 'er' : ''}.` : `The number ${aStr} has ${numDecimals} decimal${numDecimals > 1 ? 's' : ''} and ${b} has 0 decimals. The answer must have exactly ${numDecimals} decimal${numDecimals > 1 ? 's' : ''}.`, 
                    latex: `${numDecimals} + 0 = \\mathbf{${numDecimals} \\text{ decimal${numDecimals > 1 && lang === 'sv' ? 'er' : numDecimals > 1 && lang === 'en' ? 's' : ''}}}` 
                },
                { 
                    text: lang === 'sv' ? `Bland alternativen är det bara en uträkning som har kommatecknet på rätt plats:` : `Among the options, only one calculation has the decimal point in the correct place:`, 
                    latex: `\\mathbf{${correctStr}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${correctStr}` : `Answer: ${correctStr}`, 
                    latex: `\\text{${correctStr}}` 
                }
            ]
        };
    }

    // --- LEVEL 7: DIVISION ---
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
                token: this.toBase64(f2.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Division betyder att vi letar efter hur många gånger nämnaren får plats i täljaren. Det är multiplikation baklänges!" : "Division means finding how many times the denominator fits inside the numerator. Think of it as multiplication in reverse!", 
                        latex: `\\frac{${prod}}{${f1}} = x` 
                    },
                    { 
                        text: lang === 'sv' ? `Vi kan skriva om bråket till en multiplikationsfråga: Vilket tal multiplicerat med ${f1} blir ${prod}?` : `We can flip this fraction into a multiplication balancing question: What number multiplied by ${f1} equals ${prod}?`, 
                        latex: `${f1} \\cdot \\mathbf{x} = ${prod}` 
                    },
                    { 
                        text: lang === 'sv' ? `Eftersom vi vet från multiplikationstabellen att ${f1} · ${f2} = ${prod}, så är kvoten lika med ${f2}.` : `Since we know from standard multiplication tables that ${f1} · ${f2} = ${prod}, the unknown quotient variable matches ${f2}.`, 
                        latex: `${f1} \\cdot \\mathbf{${f2}} = ${prod}` 
                    },
                    { 
                        text: lang === 'sv' ? "Slutför uppgiften genom att skriva ner kvoten ensam." : "Complete the task by setting the quotient isolated on the board.", 
                        latex: `x = \\mathbf{${f2}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}`, 
                        latex: `${f2}` 
                    }
                ]
            };
        }

        return {
            renderData: { description: lang === 'sv' ? `Om vi vet att ${f1} · ${f2} = ${prod}, vad är då ${prod} / ${f1}?` : `If we know ${f1} · ${f2} = ${prod}, what is ${prod} / ${f1}?`, answerType: 'numeric' },
            token: this.toBase64(f2.toString()), variationKey: v, type: 'concept',
            clues: [
                { 
                    text: lang === 'sv' ? "Gånger och delat hör ihop i samma talfamilj." : "Multiplication and division belong together in the same number family.", 
                    latex: `${f1} \\cdot ${f2} = ${prod}` 
                },
                { 
                    text: lang === 'sv' ? `Om ${f1} gånger ${f2} blir ${prod}, så blir ${prod} delat med ${f1} det tal som blir över.` : `If ${f1} times ${f2} equals ${prod}, then ${prod} divided by ${f1} gives the number that is left over.`, 
                    latex: `\\frac{${prod}}{${f1}} = \\mathbf{x}` 
                },
                { 
                    text: lang === 'sv' ? `Tittar vi på sambandet ser vi direkt att det tal som saknas är den andra siffran:` : `Looking at the relationship, we can see directly that the missing number is the other digit:`, 
                    latex: `x = \\mathbf{${f2}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${f2}` : `Answer: ${f2}`, 
                    latex: `${f2}` 
                }
            ]
        };
    }

    // --- LEVEL 8: DIVISIBILITY RULES ---
    private level8_DivisibilityRules(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'div_rule_check', type: 'calculate' },
            { key: 'div_rule_missing', type: 'calculate' },
            { key: 'div_rule_tf', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const divisors = [2, 3, 5, 10];
        const d = MathUtils.randomChoice(divisors);

        // Clue helpers based on divisor
        const getRuleText = (div: number) => {
            if (div === 2) return lang === 'sv' ? "Regel: Ett tal är delbart med 2 om sista siffran är jämn (0, 2, 4, 6, 8)." : "Rule: A number is divisible by 2 if its last digit is even (0, 2, 4, 6, 8).";
            if (div === 5) return lang === 'sv' ? "Regel: Ett tal är delbart med 5 om sista siffran är 0 eller 5." : "Rule: A number is divisible by 5 if its last digit is 0 or 5.";
            if (div === 10) return lang === 'sv' ? "Regel: Ett tal är delbart med 10 om sista siffran är 0." : "Rule: A number is divisible by 10 if its last digit is 0.";
            return lang === 'sv' ? "Regel: Ett tal är delbart med 3 om dess siffersumma (alla siffror adderade) finns i 3:ans tabell." : "Rule: A number is divisible by 3 if its digit sum is a multiple of 3.";
        };

        if (v === 'div_rule_check') {
            // Generate one correct and two false answers
            let correct = 0;
            let traps = [0, 0];
            
            while (correct % d !== 0 || correct < 100) correct = MathUtils.randomInt(100, 999);
            while (traps[0] % d === 0 || traps[0] < 100) traps[0] = MathUtils.randomInt(100, 999);
            while (traps[1] % d === 0 || traps[1] === traps[0] || traps[1] < 100) traps[1] = MathUtils.randomInt(100, 999);

            const optionsArr = MathUtils.shuffle([correct.toString(), traps[0].toString(), traps[1].toString()]);

            let dynamicClues = [];
            dynamicClues.push({ text: getRuleText(d), latex: "" });

            if (d === 3) {
                // Break down the digit sum for all options explicitly
                const latexSums = optionsArr.map(opt => {
                    const sum = opt.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
                    return `\\text{${opt}: } ${opt.split('').join(' + ')} = ${sum}`;
                }).join(' \\\\ ');

                const correctSum = correct.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);

                dynamicClues.push({
                    text: lang === 'sv' ? "Steg 1: Räkna ut siffersumman (addera siffrorna) för varje svarsalternativ:" : "Step 1: Calculate the digit sum (add the digits) for each option:",
                    latex: `\\begin{aligned} ${latexSums} \\end{aligned}`
                });

                dynamicClues.push({
                    text: lang === 'sv' ? `Steg 2: Kontrollera resultaten. Endast siffersumman ${correctSum} finns i 3:ans tabell (${correctSum} / 3 = ${correctSum / 3}).` : `Step 2: Check the results. Only the digit sum ${correctSum} is in the 3 times table (${correctSum} / 3 = ${correctSum / 3}).`,
                    latex: `\\mathbf{${correct}}`
                });

            } else {
                // Break down the last digit logic for 2, 5, 10
                let endingReq = "";
                if (d === 2) endingReq = lang === 'sv' ? "en jämn siffra (0, 2, 4, 6, 8)" : "an even digit (0, 2, 4, 6, 8)";
                if (d === 5) endingReq = lang === 'sv' ? "en 0:a eller 5:a" : "a 0 or a 5";
                if (d === 10) endingReq = lang === 'sv' ? "en 0:a" : "a 0";

                const latexEnds = optionsArr.map(opt => {
                    return lang === 'sv' ? `\\text{${opt} slutar på } \\mathbf{${opt.slice(-1)}}` : `\\text{${opt} ends in } \\mathbf{${opt.slice(-1)}}`;
                }).join(' \\\\ ');

                dynamicClues.push({
                    text: lang === 'sv' ? `Steg 1: Kika bara på den allra sista siffran i varje tal för att se om regeln uppfylls:` : `Step 1: Just look at the very last digit of each number to see if the rule is met:`,
                    latex: `\\begin{aligned} ${latexEnds} \\end{aligned}`
                });

                dynamicClues.push({
                    text: lang === 'sv' ? `Steg 2: Endast talet ${correct} slutar på ${endingReq}. Därför är det rätt val!` : `Step 2: Only the number ${correct} ends in ${endingReq}. Therefore, it is the right choice!`,
                    latex: `\\mathbf{${correct}}`
                });
            }

            dynamicClues.push({ text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, latex: `\\text{${correct}}` });

            return {
                renderData: { 
                    description: lang === 'sv' ? `Vilket av följande tal är delbart med ${d}?` : `Which of the following numbers is divisible by ${d}?`, 
                    answerType: 'multiple_choice',
                    options: optionsArr
                },
                token: this.toBase64(correct.toString()), variationKey: v, type: 'calculate',
                clues: dynamicClues
            };
        }

        if (v === 'div_rule_missing') {
            const isSmallest = MathUtils.randomChoice([true, false]);
            const prefix = MathUtils.randomInt(10, 99).toString(); 
            
            let validDigits = [];
            for (let i = 0; i <= 9; i++) {
                if (parseInt(prefix + i) % d === 0) validDigits.push(i);
            }

            const targetDigit = isSmallest ? Math.min(...validDigits) : Math.max(...validDigits);
            const sizeWord = isSmallest ? (lang === 'sv' ? "minsta möjliga" : "smallest possible") : (lang === 'sv' ? "största möjliga" : "largest possible");

            let clues = [
                { text: getRuleText(d), latex: "" }
            ];

            if (d === 3) {
                const prefixSum = parseInt(prefix[0]) + parseInt(prefix[1]);
                clues.push({ 
                    text: lang === 'sv' ? `Steg 1: Addera de siffror vi redan vet värdet på: ${prefix[0]} + ${prefix[1]} = ${prefixSum}.` : `Step 1: Add the digits we already know: ${prefix[0]} + ${prefix[1]} = ${prefixSum}.`, 
                    // 🟢 FIXED: Replaced x with LaTeX escaped underscore
                    latex: `\\text{Siffersumma: } ${prefixSum} + \\_` 
                });
                clues.push({ 
                    text: lang === 'sv' ? `Steg 2: Vi söker den ${sizeWord} siffran (mellan 0-9) som gör att hela summan hamnar i 3:ans tabell.` : `Step 2: We need the ${sizeWord} digit (from 0-9) that makes the total sum land in the 3 times table.`, 
                    latex: `${prefixSum} + \\mathbf{${targetDigit}} = ${prefixSum + targetDigit}` 
                });
            } else {
                clues.push({ 
                    text: lang === 'sv' ? `Steg 1: Ignorera början av talet. När vi delar med ${d} är det bara den allra sista siffran (strecket) som spelar roll.` : `Step 1: Ignore the beginning of the number. When dividing by ${d}, only the very last digit (the blank) matters.`, 
                    latex: `\\text{Sista siffran = } \\_` 
                });
                clues.push({ 
                    text: lang === 'sv' ? `Steg 2: Välj den ${sizeWord} siffran (0-9) som uppfyller regeln för ${d}.` : `Step 2: Choose the ${sizeWord} digit (0-9) that fulfills the rule for ${d}.`, 
                    latex: `\\_ = \\mathbf{${targetDigit}}` 
                });
            }

            clues.push({ text: lang === 'sv' ? `Svar: ${targetDigit}` : `Answer: ${targetDigit}`, latex: `\\_ = ${targetDigit}` });

            return {
                renderData: { 
                    // 🟢 FIXED: Rewrote descriptions to ask about the blank line
                    description: lang === 'sv' ? `Vilken är den ${sizeWord} siffran som kan ersätta strecket för att talet ${prefix}_ ska vara delbart med ${d}?` : `What is the ${sizeWord} digit that can replace the blank to make the number ${prefix}_ divisible by ${d}?`, 
                    latex: `${prefix}\\_`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(targetDigit.toString()), variationKey: v, type: 'calculate',
                clues: clues
            };
        }

        // div_rule_tf (True / False overlap logic)
        const statements = [
            { text: lang === 'sv' ? "Om ett tal är delbart med 10, är det alltid delbart med 5." : "If a number is divisible by 10, it is always divisible by 5.", isTrue: true, reason: lang === 'sv' ? "Ja! Alla tal som slutar på 0 uppfyller också regeln för 5 (slutar på 0 eller 5)." : "Yes! All numbers ending in 0 also fulfill the rule for 5 (ends in 0 or 5)." },
            { text: lang === 'sv' ? "Om ett tal är delbart med 5, är det alltid delbart med 10." : "If a number is divisible by 5, it is always divisible by 10.", isTrue: false, reason: lang === 'sv' ? "Nej. Talet 15 är delbart med 5, men slutar inte på 0, så det är inte delbart med 10." : "No. The number 15 is divisible by 5, but doesn't end in 0, so it isn't divisible by 10." },
            { text: lang === 'sv' ? "Om ett tal är delbart med 2 och slutar på 5, är det delbart med 10." : "If a number is divisible by 2 and ends in 5, it is divisible by 10.", isTrue: false, reason: lang === 'sv' ? "Nej! Det är omöjligt. Ett tal kan inte vara delbart med 2 om det slutar på 5 (det är udda)." : "No! This is impossible. A number cannot be divisible by 2 if it ends in 5 (it is odd)." }
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
            token: this.toBase64(ans), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Tänk noga på delbarhetsreglerna för de nämnda talen." : "Think carefully about the divisibility rules for the mentioned numbers.", latex: "" },
                { text: chosen.reason, latex: "" },
                { text: lang === 'sv' ? `Påståendet är därför:` : `The statement is therefore:`, latex: `\\mathbf{${ans}}` }
            ]
        };
    }

    // --- 🟢 LEVEL 9: DIVISION WITH DECIMALS (Shifted from 8) ---
    private level9_DecimalDivision(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'div_decimal_dividend', type: 'calculate' },
            { key: 'div_decimal_divisor', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'div_decimal_dividend') {
            const divisor = MathUtils.randomInt(2, 9);
            const quotientWhole = MathUtils.randomInt(2, 12);
            const decShift = MathUtils.randomChoice([10, 100]); // Generates 1 or 2 decimals
            
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
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "När vi delar ett decimaltal med ett heltal kan vi tillfälligt ignorera kommatecknet och dela som vanligt." : "When dividing a decimal by a whole number, we can temporarily ignore the decimal point and divide normally.", 
                        latex: `\\frac{${divisor * quotientWhole}}{${divisor}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut hela talet först: ${divisor * quotientWhole} delat med ${divisor} blir ${quotientWhole}.` : `Calculate the whole numbers first: ${divisor * quotientWhole} divided by ${divisor} is ${quotientWhole}.`, 
                        latex: `\\frac{${divisor * quotientWhole}}{${divisor}} = \\mathbf{${quotientWhole}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Sätt nu tillbaka kommatecknet i svaret precis på samma position som det stod i talet där uppe (täljaren)." : "Now place the decimal point back into the answer in the exact same position it had in the top number (the dividend).", 
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
        const ans = MathUtils.randomInt(2, 12); // The whole number quotient answer
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
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "Det är svårt att dela med ett decimaltal! Vi måste göra om talet där nere (nämnaren) till ett heltal." : "It is tricky to divide by a decimal! We need to turn the bottom number (the denominator) into a whole number.", 
                    latex: `\\frac{${dividendStr}}{\\mathbf{${divisorStr}}}` 
                },
                { 
                    text: lang === 'sv' ? `För att flytta bort kommatecknet förlänger vi bråket. Multiplicera både uppe och nere med ${decShift}.` : `To shift the decimal point away, we expand the fraction. Multiply both top and bottom by ${decShift}.`, 
                    latex: `\\frac{${dividendStr} \\cdot \\mathbf{${decShift}}}{${divisorStr} \\cdot \\mathbf{${decShift}}}` 
                },
                { 
                    text: lang === 'sv' ? `Nu har vi ett mycket enklare bråk utan decimaler där nere: ${ans * divisorWhole} delat med ${divisorWhole}.` : `Now we have a much simpler fraction with no decimals on the bottom: ${ans * divisorWhole} divided by ${divisorWhole}.`, 
                    latex: `\\frac{${ans * divisorWhole}}{${divisorWhole}}` 
                },
                { 
                    text: lang === 'sv' ? "Eftersom bråkets värde aldrig ändras när vi förlänger det, är det bara att räkna ut den nya kvoten!" : "Since a fraction's value never changes when we expand it, just calculate this new quotient!", 
                    latex: `\\frac{${ans * divisorWhole}}{${divisorWhole}} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- 🟢 LEVEL 10: MIXED INTEGERS (Shifted from 9) ---
    private level10_MixedIntegers(lang: string, options: any): any {
        const key = MathUtils.randomChoice(['add_std_horizontal', 'sub_std_horizontal', 'mult_table_std', 'div_basic_std']);
        const res = this.generateByVariation(key, lang);
        res.metadata = { ...res.metadata, mixed: true };
        return res;
    }

    // --- 🟢 LEVEL 11: MIXED DECIMALS (Shifted from 10) ---
    private level11_MixedDecimals(lang: string, options: any): any {
        const key = MathUtils.randomChoice([
            'dec_add_vertical', 
            'dec_sub_vertical', 
            'mult_decimal_std', 
            'div_decimal_dividend', 
            'div_decimal_divisor'
        ]);
        const res = this.generateByVariation(key, lang);
        res.metadata = { ...res.metadata, mixed: true };
        return res;
    }
}