import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ExponentsGen {
    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('foundations_calc')) {
            return this.level2_PowersOfTen(lang, undefined, options);
        }

        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Foundations(lang, undefined, options); break;
            case 2: questionData = this.level2_PowersOfTen(lang, undefined, options); break;
            case 3: questionData = this.level3_ScientificNotation(lang, undefined, options); break;
            case 4: questionData = this.level4_SquareRoots(lang, undefined, options); break;
            case 5: questionData = this.level5_LawsBasic(lang, undefined, options); break;
            case 6: questionData = this.level6_LawsAdvanced(lang, undefined, options); break;
            default: questionData = this.level1_Foundations(lang, undefined, options); break;
        }

        // run through the decorator
        enrichQuestionMetadata(questionData);

        // practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    /**
     * Targeted Generation for Question Studio
     * Maps ALL keys from skillBuckets.js to preserve Studio compatibility.
     */
    public generateByVariation(key: string, lang: string = 'sv', options: any = {}): any {
        switch (key) {
            case 'zero_rule':
            case 'power_of_one':
            case 'foundations_calc':
            case 'foundations_spot_the_lie':
                return this.level1_Foundations(lang, key, options);
            case 'ten_positive_exponent':
            case 'ten_negative_exponent':
            case 'ten_inverse_counting':
                return this.level2_PowersOfTen(lang, key, options);
            case 'scientific_to_form':
            case 'scientific_missing_mantissa':
            case 'scientific_missing_exponent':
                return this.level3_ScientificNotation(lang, key, options);
            case 'root_calc':
            case 'root_inverse_algebra':
                return this.level4_SquareRoots(lang, key, options);
            case 'law_multiplication':
            case 'law_division':
            case 'law_addition_trap':
            case 'law_mult_div_combined':
                return this.level5_LawsBasic(lang, key, options);
            case 'law_power_of_power':
            case 'law_inverse_algebra':
            case 'law_all_combined':
                return this.level6_LawsAdvanced(lang, key, options);
            default:
                return this.generate(1, lang, options);
        }
    }

    // --- PRIVATE UTILITIES ---
    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private toSup(text: string | number): string {
        const str = String(text);
        const map: any = { 
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', 
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' 
        };
        return str.split('').map(c => map[c] || c).join('');
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

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'zero_rule', type: 'concept' },
            { key: 'power_of_one', type: 'concept' },
            { key: 'foundations_calc', type: 'calculate' },
            { key: 'foundations_spot_the_lie', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'zero_rule' || v === 'power_of_one') {
            const isZero = v === 'zero_rule';
            const base = MathUtils.randomInt(5, 500);
            const ansValue = isZero ? "1" : base.toString();
            const expr = isZero ? `${base}^{0}` : `${base}^{1}`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna värdet av uttrycket." : "Calculate the value of the expression.",
                    latex: expr,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansValue), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? (isZero ? "Kom ihåg den enklaste regeln: Vilket tal som helst upphöjt till 0 blir ALLTID exakt 1." : "Remember the easiest rule: Any number raised to the power of 0 ALWAYS equals exactly 1.") : (isZero ? "Remember the rule: Any number raised to the power of 0 ALWAYS equals exactly 1." : "Remember the rule: Any number raised to the power of 1 is just that exact same number unchanged."), 
                        latex: isZero ? `\\mathbf{x^0 = 1}` : `\\mathbf{x^1 = x}` 
                    },
                    { 
                        text: lang === 'sv' ? (isZero ? `Eftersom exponenten är noll, slår regeln in direkt och hela uttrycket förvandlas till en etta.` : `Eftersom exponenten är 1 betyder det att basen bara står skriven en enda gång.`) : (isZero ? `Since the exponent is zero, the rule kicks in instantly and the whole expression turns into 1.` : `Since the exponent is 1, it means the base number is written down only one single time.`), 
                        latex: isZero ? `${base}^{0} = \\mathbf{1}` : `${base}^{1} = \\mathbf{${base}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansValue}` : `Answer: ${ansValue}`, 
                        latex: `${ansValue}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'foundations_spot_the_lie') {
            const b = MathUtils.randomInt(2, 5), e = MathUtils.randomInt(2, 3);
            const val = Math.pow(b, e);
            const t1 = `${b}^{${e}} = ${val}`, t2 = `${MathUtils.randomInt(10, 99)}^{0} = 1`, lie = `${b}^{${e}} = ${b * e}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice', options: MathUtils.shuffle([t1, lie, t2])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? `För att hitta lögnen måste vi minnas vad en potens betyder: Exponenten uppe i hörnet berättar hur många gånger talet ska multipliceras med sig själv.` : `To spot the lie, we must recall what a power means: The small exponent tells us how many times to multiply the base by itself.`, 
                        latex: `${b}^{${e}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Vi skriver ut och testar: ${b} upphöjt till ${e} betyder ${b} gånger sig själv ${e} gånger.` : `Let's write it out completely: ${b} raised to the power of ${e} means ${b} multiplied by itself ${e} times.`, 
                        latex: `${b}^{${e}} = \\mathbf{` + Array(e).fill(b).join(' \\cdot ') + `}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räknar vi ut multiplikationen får vi produkten ${val}. Det är ett vanligt fuskfel att bara råka ta ${b} · ${e} = ${b * e}!` : `When we calculate that product, we get exactly ${val}. It's a common trick trap to accidentally just multiply the base by the exponent (${b} · ${e} = ${b * e})!`, 
                        latex: `${b}^{${e}} = \\mathbf{${val}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Därför är den här uträkningen en lögn och helt felaktig:` : `Therefore, this specific option statement is a lie and completely incorrect:`, 
                        latex: `\\mathbf{${b}^{${e}} = ${b * e}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${b}^{${e}} = ${b * e}` : `Answer: ${b}^{${e}} = ${b * e}`, 
                        latex: `${b}^{${e}} = ${b * e}` 
                    }
                ]
            };
        }

        const base = MathUtils.randomInt(2, 10), exp = MathUtils.randomInt(2, 4);
        const ans = Math.pow(base, exp);
        const chain = Array(exp).fill(base).join(' \\cdot ');

        return {
            renderData: { 
                description: lang === 'sv' ? "Beräkna potensen." : "Calculate the power.", 
                latex: `${base}^{${exp}}`, 
                interceptorToken: `${base} ; ${exp} ; ${ans}`,
                answerType: 'numeric' 
            },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Det lilla talet däruppe (${exp}) berättar hur många gånger vi ska skriva upp och multiplicera basen (${base}).` : `The small number on top (${exp}) tells us exactly how many times to write out and multiply the main base number (${base}).`, 
                    latex: `${base}^{${exp}}` 
                },
                { 
                    text: lang === 'sv' ? `Vi skriver ut potensen som en lång multiplikationskedja:` : `Let's expand the power completely into a long chain of multiplication:`, 
                    latex: `${base}^{${exp}} = \\mathbf{${chain}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut multiplikationen steg för steg för att hitta det färdiga talet.` : `Perform the multiplication step-by-step to arrive at the final number.`, 
                    latex: `${base}^{${exp}} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 2: POWERS OF 10 ---
    private level2_PowersOfTen(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'ten_positive_exponent', type: 'calculate' },
            { key: 'ten_negative_exponent', type: 'calculate' },
            { key: 'ten_inverse_counting', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const p = MathUtils.randomInt(1, 6);

        if (v === 'ten_negative_exponent') {
            const ansStr = (1 / Math.pow(10, p)).toString();
            return {
                renderData: { 
                    description: lang === 'sv' ? "Skriv som ett decimaltal." : "Write as a decimal number.", 
                    latex: `10^{-${p}}`, 
                    interceptorToken: `${p} ; ${ansStr}`,
                    answerType: 'numeric' 
                },
                token: this.toBase64(ansStr), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ett minustecken framför en exponent betyder helt enkelt att talet ska vändas upp-och-ner och bli ett bråk med en etta därefter." : "A minus sign in front of an exponent simply means the expression turns upside down into a fraction with 1 on top.", 
                        latex: `10^{-${p}} = \\frac{1}{10^{${p}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut nämnaren där nere. En tiopotens med exponenten ${p} betyder en etta följt av ${p} nollor.` : `Calculate the denominator block below. A power of 10 with an exponent of ${p} means a 1 followed by ${p} zeros.`, 
                        latex: `10^{-${p}} = \\frac{1}{\\mathbf{${Math.pow(10, p)}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `När vi delar 1 med ${Math.pow(10, p)} flyttas decimaltecknet ${p} steg åt vänster, vilket ger oss ett litet decimaltal.` : `When we divide 1 by ${Math.pow(10, p)}, the decimal point hops ${p} steps to the left, revealing our decimal answer.`, 
                        latex: `10^{-${p}} = \\mathbf{${ansStr}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ansStr}` : `Answer: ${ansStr}`, 
                        latex: `${ansStr}` 
                    }
                ]
            };
        }

        if (v === 'ten_inverse_counting') {
            const zeros = MathUtils.randomInt(2, 7);
            const num = "1" + "0".repeat(zeros);
            return {
                renderData: { 
                    description: lang === 'sv' ? `Skriv ${num} som en tiopotens.` : `Write ${num} as a power of ten.`, 
                    latex: `10^{x} = ${num}`, 
                    interceptorToken: `${num} ; ${zeros}`,
                    answerType: 'structured_power' 
                },
                token: this.toBase64(`10^${zeros}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `När vi ska skriva stora jämna noll-tal med basen 10, räknar vi helt enkelt antalet nollor som står efter ettan.` : `When writing clean multi-zero numbers as a power of 10, we simply look closely and count the total zeros trailing behind the leading 1.`, 
                        latex: `10^{x} = ${num}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räknar vi nollorna i ${num} ser vi att det finns exakt ${zeros} stycken.` : `Counting the exact zero placeholders inside ${num} reveals a total of ${zeros}.`, 
                        latex: `10^{x} = 1\\mathbf{` + "0".repeat(zeros) + `} \\rightarrow \\text{${zeros} st}` 
                    },
                    { 
                        text: lang === 'sv' ? `Antalet nollor matchar direkt vårt okända x uppe i hörnet på tiopotensen.` : `The total number of zeros directly matches our unknown placeholder x up in the exponent slot.`, 
                        latex: `10^{\\mathbf{${zeros}}} = ${num}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: 10^{${zeros}}` : `Answer: 10^{${zeros}}`, 
                        latex: `10^{${zeros}}` 
                    }
                ]
            };
        }

        const ans = Math.pow(10, p);
        return {
            renderData: { description: lang === 'sv' ? "Skriv tiopotensen som ett heltal." : "Write the power of ten as an integer.", latex: `10^{${p}}`, answerType: 'numeric' },
            token: this.toBase64(ans.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Exponenten ${p} talar om hur många gånger vi ska multiplicera 10 med sig självt.` : `Step 1: The exponent ${p} tells us how many times to multiply 10 by itself.` },
                { text: lang === 'sv' ? "Steg 2: För tiopotenser innebär detta helt enkelt en etta följt av lika många nollor som exponenten anger." : "Step 2: For powers of ten, this simply means a one followed by as many zeros as the exponent indicates." },
                { text: lang === 'sv' ? `Uträkning: En etta följt av ${p} nollor.` : `Calculation: A one followed by ${p} zeros.`, latex: `10^{${p}} \\rightarrow ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: SCIENTIFIC NOTATION ---
    private level3_ScientificNotation(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'scientific_to_form', type: 'calculate' },
            { key: 'scientific_missing_mantissa', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const mantissa = (MathUtils.randomInt(11, 99) / 10), exponent = MathUtils.randomInt(3, 7);
        const number = mantissa * Math.pow(10, exponent);

        if (v === 'scientific_to_form') {
            return {
                renderData: { 
                    description: lang === 'sv' ? `Skriv ${number.toLocaleString(lang)} med en tiopotens.` : `Write ${number.toLocaleString(lang)} using a power of ten.`, 
                    interceptorToken: `${number} ; ${mantissa} ; ${exponent}`,
                    answerType: 'structured_scientific' 
                },
                token: this.toBase64(`${mantissa}*10^${exponent}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? "Ett smart sätt att skriva stora tal är att sätta ett kommatecken så att det bara blir EN siffra kvar framför." : "A clever way to write large numbers is putting a decimal point so only ONE single digit is left in front.", 
                        latex: `\\text{Mål: } ${number}` 
                    },
                    { 
                        text: lang === 'sv' ? `Flytta kommatecknet från slutet av talet tills det hamnar direkt efter den första siffran: ${mantissa}.` : `Flytta kommatecknet från slutet av talet tills det hamnar direkt efter den första siffran: ${mantissa}.`, 
                        latex: `\\mathbf{${mantissa}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna hur många steg du tvingades flytta kommat. Det var exakt ${exponent} steg, vilket blir vårt lilla hörntal.` : `Count how many steps you had to jump the comma. It was exactly ${exponent} steps, which becomes our small corner exponent.`, 
                        latex: `${mantissa} \\cdot 10^{\\mathbf{${exponent}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${mantissa} · 10^{${exponent}}` : `Answer: ${mantissa} · 10^{${exponent}}`, 
                        latex: `${mantissa} \\cdot 10^{${exponent}}` 
                    }
                ]
            };
        }

        return {
            renderData: { 
                description: lang === 'sv' ? "Vilket tal saknas på platsen för 'a'?" : "Which number is missing in place of 'a'?", 
                latex: `${number.toLocaleString(lang)} = a \\cdot 10^{${exponent}}`, 
                interceptorToken: `${number} ; ${exponent} ; ${mantissa}`,
                answerType: 'numeric' 
            },
            token: this.toBase64(mantissa.toString()), variationKey: v, type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? `Hörntalet ${exponent} berättar att talet till höger har flyttat sitt kommatecken ${exponent} steg.` : `The corner number ${exponent} tells us that the expression on the right has moved its decimal point ${exponent} steps.`, 
                    latex: `${number} = a \\cdot 10^{${exponent}}` 
                },
                { 
                    text: lang === 'sv' ? `För att hitta det saknade talet 'a' delar vi helt enkelt det stora talet med ${Math.pow(10, exponent)}.` : `To find the missing number 'a', we simply divide the large starting value by ${Math.pow(10, exponent)}.`, 
                    latex: `a = \\frac{${number}}{\\mathbf{10^{${exponent}}}}` 
                },
                { 
                    text: lang === 'sv' ? `Gör om tiopotensen och räkna ut divisionen: Flytta kommatecknet i ${number} bakåt ${exponent} steg.` : `Solve the division step: Move the decimal point in ${number} backward by ${exponent} positions.`, 
                    latex: `a = \\frac{${number}}{\\mathbf{${Math.pow(10, exponent)}}} = \\mathbf{${mantissa}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${mantissa}` : `Answer: ${mantissa}`, 
                    latex: `${mantissa}` 
                }
            ]
        };
    }

    // --- LEVEL 4: SQUARE ROOTS ---
    private level4_SquareRoots(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [{ key: 'root_calc', type: 'calculate' }, { key: 'root_inverse_algebra', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);
        const base = MathUtils.randomInt(2, 12), square = base * base;

        if (v === 'root_inverse_algebra') {
            return {
                renderData: { 
                    description: lang === 'sv' ? "Lös ekvationen (hitta x)." : "Solve the equation (find x).", 
                    latex: `x^2 = ${square}`, 
                    interceptorToken: `${square} ; ${base}`,
                    answerType: 'numeric' },
                token: this.toBase64(base.toString()), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Motsatsen till att upphöja något till 2 är att ta kvadratroten." : "Step 1: The opposite of squaring something is taking the square root." },
                    { text: lang === 'sv' ? `Steg 2: Vi letar efter ett tal som multiplicerat med sig självt blir ${square}.` : `Step 2: We are looking for a number that, when multiplied by itself, equals ${square}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\sqrt{${square}} = ${base}` },
                    { text: lang === 'sv' ? `Svar: ${base}` : `Answer: ${base}` }
                ]
            };
        }

        return {
            renderData: { 
                description: lang === 'sv' ? "Beräkna kvadratroten." : "Calculate the square root.", 
                latex: `\\sqrt{${square}}`, 
                interceptorToken: `${square} ; ${base}`,
                answerType: 'numeric' },
            token: this.toBase64(base.toString()), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Steg 1: Kvadratroten ur ${square} är det positiva tal som multiplicerat med sig självt blir ${square}.` : `Step 1: The square root of ${square} is the positive number that, when multiplied by itself, equals ${square}.` },
                { text: lang === 'sv' ? "Tänk: Vad · Vad = " + square + "?" : "Think: What · What = " + square + "?" },
                { text: lang === 'sv' ? `Eftersom ${base} · ${base} = ${square}, är roten ${base}.` : `Since ${base} · ${base} = ${square}, the root is ${base}.` },
                { text: lang === 'sv' ? `Svar: ${base}` : `Answer: ${base}` }
            ]
        };
    }

    // --- LEVEL 5: LAWS BASIC ---
    private level5_LawsBasic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'law_multiplication', type: 'calculate' },
            { key: 'law_division', type: 'calculate' },
            { key: 'law_mult_div_combined', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 10), b = MathUtils.randomInt(2, 10);

        if (v === 'law_multiplication') {
            return {
                renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `x^{${a}} \\cdot x^{${b}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${a + b}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Gångertecknet mellan de två x-baserna talar om att vi helt enkelt ska addera ihop (plussa) de två små hörntalen.` : `The multiplication dot between identical bases tells us that we simply add the two small corner exponents together.`, 
                        latex: `x^{${a}} \\cdot x^{${b}} = x^{${a} + ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut summan av exponenterna: ${a} + ${b} blir ${a + b}.` : `Calculate the sum of those corner values: ${a} + ${b} equals ${a + b}.`, 
                        latex: `x^{${a}} \\cdot x^{${b}} = x^{\\mathbf{${a + b}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x^{${a + b}}` : `Answer: x^{${a + b}}`, 
                        latex: `x^{${a + b}}` 
                    }
                ]
            };
        }

        if (v === 'law_division') {
            const big = a + b;
            return {
                renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `\\frac{x^{${big}}}{x^{${a}}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${b}`), variationKey: v, type: 'calculate',
                clues: [
                    { 
                        text: lang === 'sv' ? `Bråkstrecket (delat med) betyder att vi ska dra bort (subtrahera) den nedre lilla exponenten från den övre.` : `The fraction bar (division) tells us that we work downwards by subtracting the lower exponent from the upper exponent value.`, 
                        latex: `\\frac{x^{${big}}}{x^{${a}}} = x^{${big} - ${a}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut skillnaden mellan de små hörntalen: ${big} minus ${a} blir ${b}.` : `Calculate the difference between those corner items: ${big} minus ${a} equals ${b}.`, 
                        latex: `\\frac{x^{${big}}}{x^{${a}}} = x^{\\mathbf{${b}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: x^{${b}}` : `Answer: x^{${b}}`, 
                        latex: `x^{${b}}` 
                    }
                ]
            };
        }

        const n1 = MathUtils.randomInt(2, 5), n2 = MathUtils.randomInt(2, 5), d1 = MathUtils.randomInt(2, 4);
        const resExp = n1 + n2 - d1;
        return {
            renderData: { description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", latex: `\\frac{x^{${n1}} · x^{${n2}}}{x^{${d1}}}`, answerType: 'structured_power' },
            token: this.toBase64(`x^${resExp}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Förenkla täljaren först genom att addera exponenterna." : "Step 1: Simplify the numerator first by adding the exponents.", latex: `x^{${n1} + ${n2}} = x^{${n1+n2}}` },
                { text: lang === 'sv' ? "Steg 2: Subtrahera nu nämnarens exponent från den nya täljaren." : "Step 2: Now subtract the denominator's exponent from the new numerator.", latex: `${n1+n2} - ${d1} = ${resExp}` },
                { text: lang === 'sv' ? `Svar: x${this.toSup(resExp)}` : `Answer: x${this.toSup(resExp)}` }
            ]
        };
    }

    // --- LEVEL 6: LAWS ADVANCED ---
    private level6_LawsAdvanced(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [{ key: 'law_power_of_power', type: 'calculate' }, { key: 'law_all_combined', type: 'calculate' }];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 5);

        if (v === 'law_power_of_power') {
            return {
                renderData: { description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.", latex: `(x^{${a}})^{${b}}`, answerType: 'structured_power' },
                token: this.toBase64(`x^${a * b}`), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vid en potens av en potens ska exponenterna multipliceras." : "Step 1: For a power of a power, the exponents must be multiplied.", latex: "(x^a)^b = x^{a · b}" },
                    { text: lang === 'sv' ? `Steg 2: Multiplicera ${a} med ${b}.` : `Step 2: Multiply ${a} by ${b}.`, latex: `${a} · ${b} = ${a*b}` },
                    { text: lang === 'sv' ? `Svar: x${this.toSup(a*b)}` : `Answer: x${this.toSup(a*b)}` }
                ]
            };
        }

        const e1 = MathUtils.randomInt(2, 3), p1 = MathUtils.randomInt(2, 3), e2 = MathUtils.randomInt(2, 4);
        const resExp = (e1 * p1) + e2;
        return {
            renderData: { description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.", latex: `(x^{${e1}})^{${p1}} · x^{${e2}}`, answerType: 'structured_power' },
            token: this.toBase64(`x^${resExp}`), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Steg 1: Börja med att förenkla parentesen (potens av en potens) genom multiplikation." : "Step 1: Start by simplifying the parentheses (power of a power) using multiplication.", latex: `x^{${e1} · ${p1}} = x^{${e1*p1}}` },
                { text: lang === 'sv' ? "Steg 2: Addera nu den andra exponenten pga multiplikationen mellan baserna." : "Step 2: Now add the other exponent due to the multiplication between the bases.", latex: `${e1*p1} + ${e2} = ${resExp}` },
                { text: lang === 'sv' ? `Svar: x${this.toSup(resExp)}` : `Answer: x${this.toSup(resExp)}` }
            ]
        };
    }
}