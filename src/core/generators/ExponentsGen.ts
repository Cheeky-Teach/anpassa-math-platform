import { MathUtils } from '../utils/MathUtils.js';

export class ExponentsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Foundations(lang);
            case 2: return this.level2_PowersOfTen(lang);
            case 3: return this.level3_ScientificNotation(lang);
            case 4: return this.level4_SquareRoots(lang);
            case 5: return this.level5_LawsBasic(lang);
            case 6: return this.level6_LawsAdvanced(lang);
            default: return this.level1_Foundations(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'zero_rule':
            case 'power_of_one':
            case 'foundations_calc':
            case 'foundations_spot_the_lie':
                return this.level1_Foundations(lang, key);
            
            case 'ten_positive_exponent':
            case 'ten_negative_exponent':
            case 'ten_inverse_counting':
                return this.level2_PowersOfTen(lang, key);
            
            case 'scientific_to_form':
            case 'scientific_missing_mantissa':
            case 'scientific_missing_exponent':
                return this.level3_ScientificNotation(lang, key);
            
            case 'root_calc':
            case 'root_inverse_algebra':
                return this.level4_SquareRoots(lang, key);
            
            case 'law_multiplication':
            case 'law_division':
            case 'law_addition_trap':
            case 'law_mult_div_combined':
                return this.level5_LawsBasic(lang, key);
            
            case 'law_power_of_power':
            case 'law_inverse_algebra':
            case 'law_all_combined':
                return this.level6_LawsAdvanced(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['zero_rule', 'power_of_one', 'foundations_calc', 'foundations_spot_the_lie']);

        if (v === 'zero_rule' || v === 'power_of_one') {
            const isZero = v === 'zero_rule';
            const base = MathUtils.randomInt(5, 500);
            const desc = lang === 'sv'
                ? `Beräkna värdet av uttrycket nedan.`
                : `Calculate the value of the expression below.`;

            return {
                renderData: {
                    description: desc,
                    latex: isZero ? `${base}^{0}` : `${base}^{1}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(isZero ? "1" : base.toString()),
                clues: isZero ? [
                    { text: lang === 'sv' ? "Alla tal som är upphöjda till 0 (utom noll) blir alltid exakt 1." : "Any number raised to the power of 0 (except zero) is always exactly 1.", latex: "x^{0} = 1" },
                    { text: lang === 'sv' ? "Svaret är alltså:" : "The answer is therefore:", latex: "1" }
                ] : [
                    { text: lang === 'sv' ? "När ett tal är upphöjt till 1 betyder det att basen bara förekommer en enda gång." : "When a number is raised to 1, it means the base appears only once.", latex: "x^{1} = x" },
                    { text: lang === 'sv' ? "Värdet förblir oförändrat:" : "The value remains unchanged:", latex: `${base}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'foundations_spot_the_lie') {
            const base = MathUtils.randomInt(2, 5);
            const exp = MathUtils.randomInt(2, 3);
            const val = Math.pow(base, exp);
            
            const true1 = `${base}^{${exp}} = ${val}`;
            const true2 = `${MathUtils.randomInt(10, 99)}^{0} = 1`;
            const lie = `${base}^{${exp}} = ${base * exp}`; 

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([true1, true2, lie])
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "En potens betyder upprepad multiplikation, inte multiplikation mellan basen och exponenten." : "A power means repeated multiplication, not multiplication between the base and the exponent.", latex: `${base}^{${exp}} = ` + Array(exp).fill(base).join(" \\cdot ") },
                    { text: lang === 'sv' ? "Denna beräkning är alltså felaktig:" : "This calculation is therefore incorrect:", latex: `${lie}` }
                ],
                metadata: { variation_key: "foundations_spot_the_lie", difficulty: 2 }
            };
        }

        const base = MathUtils.randomInt(2, 10);
        const exp = MathUtils.randomInt(2, 4);
        if (Math.pow(base, exp) > 1000) return this.level1_Foundations(lang, v);
        const ans = Math.pow(base, exp);

        return {
            renderData: {
                description: lang === 'sv' ? `Beräkna potensen.` : `Calculate the power.`,
                latex: `${base}^{${exp}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `Exponenten visar hur många gånger basen ${base} ska multipliceras med sig själv.` : `The exponent shows how many times the base ${base} should be multiplied by itself.`, latex: Array(exp).fill(base).join(' \\cdot ') },
                { text: lang === 'sv' ? "Räkna ut produkten för att få det slutgiltiga svaret." : "Calculate the product to get the final answer.", latex: `${ans}` }
            ],
            metadata: { variation_key: "foundations_calc", difficulty: 1 }
        };
    }

    // --- LEVEL 2: POWERS OF 10 ---
    private level2_PowersOfTen(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['ten_positive_exponent', 'ten_negative_exponent', 'ten_inverse_counting']);
        const power = MathUtils.randomInt(1, 6);

        if (v === 'ten_negative_exponent') {
            const ansStr = (1 / Math.pow(10, power)).toString();
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som ett decimaltal." : "Write as a decimal number.",
                    latex: `10^{-${power}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr),
                clues: [
                    { text: lang === 'sv' ? "En negativ exponent innebär att vi dividerar 1 med basen upphöjt till samma positiva tal." : "A negative exponent means we divide 1 by the base raised to the same positive power.", latex: `10^{-${power}} = \\frac{1}{10^{${power}}}` },
                    { text: lang === 'sv' ? `Detta ger en etta på den ${power}:e decimalplatsen.` : `This results in a one at the ${power}:th decimal place.`, latex: `${ansStr}` }
                ],
                metadata: { variation_key: "ten_negative_exponent", difficulty: 2 }
            };
        }

        if (v === 'ten_inverse_counting') {
            const zeros = MathUtils.randomInt(2, 7);
            const num = "1" + "0".repeat(zeros);
            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv ${num.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} som en tiopotens.` : `Write ${num.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} as a power of ten.`,
                    latex: `10^{?} = ${num}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`10^${zeros}`),
                clues: [
                    { text: lang === 'sv' ? "Räkna antalet nollor efter ettan. Antalet nollor motsvarar exponenten i tiopotensen." : "Count the number of zeros after the one. The number of zeros corresponds to the exponent in the power of ten.", latex: `\\text{Antal nollor} = ${zeros}` },
                    { text: lang === 'sv' ? "Svaret skrivs som:" : "The answer is written as:", latex: `10^{${zeros}}` }
                ],
                metadata: { variation_key: "ten_inverse_counting", difficulty: 2 }
            };
        }

        const ans = Math.pow(10, power);
        return {
            renderData: {
                description: lang === 'sv' ? "Skriv ut tiopotensen som ett heltal." : "Write the power of ten as an integer.",
                latex: `10^{${power}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `För tiopotenser skriver man en etta följt av lika många nollor som exponenten anger.` : `For powers of ten, write a one followed by as many zeros as the exponent indicates.`, latex: `10^{${power}} = 1\\underbrace{00...0}_{${power}}` },
                { text: lang === 'sv' ? "Detta ger oss talet:" : "This gives us the number:", latex: `${ans}` }
            ],
            metadata: { variation_key: "ten_positive_exponent", difficulty: 1 }
        };
    }

    // --- LEVEL 3: SCIENTIFIC NOTATION ---
    private level3_ScientificNotation(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['scientific_to_form', 'scientific_missing_mantissa', 'scientific_missing_exponent']);
        
        const mantissa = (MathUtils.randomInt(11, 99) / 10); 
        const exponent = MathUtils.randomInt(3, 8);
        const number = mantissa * Math.pow(10, exponent);

        if (v === 'scientific_to_form') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv ${number.toLocaleString(lang)} i grundpotensform.` : `Write ${number.toLocaleString(lang)} in scientific notation.`,
                    answerType: 'structured_scientific'
                },
                token: this.toBase64(`${mantissa}*10^${exponent}`),
                clues: [
                    { text: lang === 'sv' ? "Flytta kommat så du får ett tal mellan 1 och 10." : "Move the decimal point so you get a number between 1 and 10.", latex: `${mantissa}` },
                    { text: lang === 'sv' ? "Räkna antalet steg kommat flyttades för att få exponenten." : "Count the number of steps the decimal point was moved to get the exponent.", latex: `n = ${exponent}` },
                    { text: lang === 'sv' ? "Hela talet blir då:" : "The whole number is then:", latex: `${mantissa} \\cdot 10^{${exponent}}` }
                ],
                metadata: { variation_key: "scientific_to_form", difficulty: 3 }
            };
        }

        const isMantissaMissing = v === 'scientific_missing_mantissa';
        const ans = isMantissaMissing ? mantissa : exponent;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde saknas i uttrycket?` : `Which value is missing in the expression?`,
                latex: `${number.toLocaleString(lang)} = ${isMantissaMissing ? 'a' : mantissa} \\cdot 10^{${isMantissaMissing ? exponent : 'n'}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Grundpotensform ska bestå av ett tal mellan 1 och 10 multiplicerat med en tiopotens." : "Scientific notation must consist of a number between 1 and 10 multiplied by a power of ten.", latex: "a \\cdot 10^{n}" },
                { text: lang === 'sv' ? "Det saknade värdet är:" : "The missing value is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: SQUARE ROOTS ---
    private level4_SquareRoots(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['root_calc', 'root_inverse_algebra']);
        const base = MathUtils.randomInt(2, 12);
        const square = base * base;

        if (v === 'root_inverse_algebra') {
            return {
                renderData: {
                    description: lang === 'sv' ? `Lös ekvationen (hitta det positiva värdet på x).` : `Solve the equation (find the positive value of x).`,
                    latex: `x^{2} = ${square}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [
                    { text: lang === 'sv' ? "Motsatsen till 'upphöjt till 2' är kvadratroten." : "The opposite of 'squared' is the square root.", latex: "x = \\sqrt{" + square + "}" },
                    { text: lang === 'sv' ? "Vi letar efter det tal som multiplicerat med sig självt blir resultatet." : "We are looking for the number that, when multiplied by itself, equals the result.", latex: `${base} \\cdot ${base} = ${square}` },
                    { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `${base}` }
                ],
                metadata: { variation_key: "root_inverse_algebra", difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna kvadratroten." : "Calculate the square root.",
                latex: `\\sqrt{${square}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(base.toString()),
            clues: [
                { text: lang === 'sv' ? `Fråga dig själv: Vilket positivt tal gånger sig självt blir ${square}?` : `Ask yourself: Which positive number times itself equals ${square}?`, latex: `? \\cdot ? = ${square}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${base}` }
            ],
            metadata: { variation_key: "root_calc", difficulty: 2 }
        };
    }

    // --- LEVEL 5: LAWS BASIC ---
    private level5_LawsBasic(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['law_multiplication', 'law_division', 'law_addition_trap', 'law_mult_div_combined']);
        const a = MathUtils.randomInt(2, 12);
        const b = MathUtils.randomInt(2, 8);

        if (v === 'law_multiplication') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.",
                    latex: `x^{${a}} \\cdot x^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a + b}`),
                clues: [
                    { text: lang === 'sv' ? "Vid multiplikation av potenser med samma bas adderar vi exponenterna." : "When multiplying powers with the same base, we add the exponents.", latex: "x^{a} \\cdot x^{b} = x^{a+b}" },
                    { text: lang === 'sv' ? `Räkna ut summan av exponenterna.` : `Calculate the sum of the exponents.`, latex: `${a} + ${b} = ${a + b}` },
                    { text: lang === 'sv' ? "Den förenklade potensen blir:" : "The simplified power is:", latex: `x^{${a + b}}` }
                ],
                metadata: { variation_key: "law_multiplication", difficulty: 3 }
            };
        }

        if (v === 'law_division') {
            const big = MathUtils.randomInt(b + 1, b + 12);
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.",
                    latex: `\\frac{x^{${big}}}{x^{${b}}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${big - b}`),
                clues: [
                    { text: lang === 'sv' ? "Vid division av potenser med samma bas subtraherar vi täljarens exponent med nämnarens." : "When dividing powers with the same base, we subtract the denominator's exponent from the numerator's.", latex: "\\frac{x^{a}}{x^{b}} = x^{a-b}" },
                    { text: lang === 'sv' ? "Räkna ut skillnaden mellan exponenterna." : "Calculate the difference between the exponents.", latex: `${big} - ${b} = ${big - b}` },
                    { text: lang === 'sv' ? "Den förenklade potensen blir:" : "The simplified power is:", latex: `x^{${big - b}}` }
                ],
                metadata: { variation_key: "law_division", difficulty: 3 }
            };
        }

        if (v === 'law_mult_div_combined') {
            const n1 = MathUtils.randomInt(2, 8), n2 = MathUtils.randomInt(2, 8), d1 = MathUtils.randomInt(2, 5);
            const finalExp = n1 + n2 - d1;
            if (finalExp < 1) return this.level5_LawsBasic(lang, v);

            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket till en enda potens." : "Simplify the expression to a single power.",
                    latex: `\\frac{x^{${n1}} \\cdot x^{${n2}}}{x^{${d1}}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${finalExp}`),
                clues: [
                    { text: lang === 'sv' ? "Börja med att förenkla täljaren genom att addera exponenterna." : "Start by simplifying the numerator by adding the exponents.", latex: `x^{${n1} + ${n2}} = x^{${n1+n2}}` },
                    { text: lang === 'sv' ? "Subtrahera sedan nämnarens exponent från den nya täljaren." : "Then subtract the denominator's exponent from the new numerator.", latex: `x^{${n1+n2} - ${d1}}` },
                    { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `x^{${finalExp}}` }
                ],
                metadata: { variation_key: "law_mult_div_combined", difficulty: 4 }
            };
        }

        const options = lang === 'sv' ? ["Nej, lagarna gäller bara mult/div", "Ja, det blir x upphöjt till summan"] : ["No, laws only apply to mult/div", "Yes, it becomes x to the power of the sum"];
        return {
            renderData: { 
                description: lang === 'sv' ? `Går det att förenkla $x^{${a}} + x^{${b}}$ med potenslagarna?` : `Can $x^{${a}} + x^{${b}}$ be simplified with the power laws?`, 
                answerType: 'multiple_choice', 
                options 
            },
            token: this.toBase64(options[0]),
            clues: [
                { text: lang === 'sv' ? "Potenslagarna för exponenter fungerar bara när vi multiplicerar eller dividerar samma bas." : "The power laws for exponents only work when we multiply or divide the same base.", latex: "x^a \\cdot x^b = x^{a+b}" },
                { text: lang === 'sv' ? "Därför är svaret:" : "Therefore the answer is:", latex: `\\text{${options[0]}}` }
            ],
            metadata: { variation_key: "law_addition_trap", difficulty: 2 }
        };
    }

    // --- LEVEL 6: LAWS ADVANCED ---
    private level6_LawsAdvanced(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['law_power_of_power', 'law_inverse_algebra', 'law_all_combined']);
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 6);

        if (v === 'law_power_of_power') {
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket." : "Simplify the expression.",
                    latex: `(x^{${a}})^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a * b}`),
                clues: [
                    { text: lang === 'sv' ? "När man har en 'potens av en potens' ska exponenterna multipliceras." : "When you have a 'power of a power', the exponents should be multiplied.", latex: "(x^{a})^{b} = x^{a \\cdot b}" },
                    { text: lang === 'sv' ? "Räkna ut produkten av exponenterna." : "Calculate the product of the exponents.", latex: `${a} \\cdot ${b} = ${a*b}` },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `x^{${a*b}}` }
                ],
                metadata: { variation_key: "law_power_of_power", difficulty: 4 }
            };
        }

        if (v === 'law_all_combined') {
            const e1 = MathUtils.randomInt(2, 4), p1 = MathUtils.randomInt(2, 3), e2 = MathUtils.randomInt(2, 5);
            const n1 = e1 * p1;
            const finalExp = n1 + e2;

            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla till en enda potens." : "Simplify to a single power.",
                    latex: `(x^{${e1}})^{${p1}} \\cdot x^{${e2}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${finalExp}`),
                clues: [
                    { text: lang === 'sv' ? "Börja med att förenkla parentesen genom att multiplicera exponenterna." : "Start by simplifying the parentheses by multiplying the exponents.", latex: `x^{${e1} \\cdot ${p1}} = x^{${n1}}` },
                    { text: lang === 'sv' ? "Addera nu den andra exponenten eftersom det är multiplikation mellan baserna." : "Now add the other exponent because there is multiplication between the bases.", latex: `x^{${n1} + ${e2}}` },
                    { text: lang === 'sv' ? "Den förenklade potensen är:" : "The simplified power is:", latex: `x^{${finalExp}}` }
                ],
                metadata: { variation_key: "law_all_combined", difficulty: 5 }
            };
        }

        const target = a * b;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde på y saknas?` : `Which value of y is missing?`,
                latex: `(x^{${a}})^{y} = x^{${target}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(b.toString()),
            clues: [
                { text: lang === 'sv' ? "Vid potens av en potens multipliceras exponenterna för att få slutresultatet." : "For a power of a power, the exponents are multiplied to get the final result.", latex: `${a} \\cdot y = ${target}` },
                { text: lang === 'sv' ? "Lös ut y för att få svaret:" : "Solve for y to get the answer:", latex: `${b}` }
            ],
            metadata: { variation_key: "law_inverse_algebra", difficulty: 4 }
        };
    }
}