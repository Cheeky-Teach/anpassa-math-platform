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
                    { text: lang === 'sv' ? "Kom ihåg noll-regeln: Alla tal (utom noll) som är upphöjda till 0 blir alltid exakt 1." : "Remember the zero rule: Any number (except zero) raised to the power of 0 is always exactly 1.", latex: "x^{0} = 1" },
                    { text: lang === 'sv' ? "Detta beror på att en division av ett tal med sig självt skapar en noll-exponent." : "This is because dividing a number by itself creates a zero exponent.", latex: "\\frac{x^n}{x^n} = x^{n-n} = x^0 = 1" }
                ] : [
                    { text: lang === 'sv' ? "En exponent på 1 betyder att basen bara förekommer en enda gång." : "An exponent of 1 means the base appears only one single time.", latex: "x^{1} = x" },
                    { text: lang === 'sv' ? `Eftersom talet bara står där en gång förblir värdet ${base}.` : `Since the number is only there once, the value remains ${base}.`, latex: `${base}^{1} = ${base}` }
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
                    description: lang === 'sv' ? "Vilket av följande påståenden om potenser är FALSKT?" : "Which of the following statements about powers is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([true1, true2, lie])
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "En vanlig fälla är att multiplicera basen med exponenten. Men en potens betyder upprepad multiplikation!" : "A common trap is multiplying the base by the exponent. But a power means repeated multiplication!", latex: `${base}^{${exp}} = ` + Array(exp).fill(base).join(" \\cdot ") }
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
                description: lang === 'sv' ? `Beräkna potensen genom att multiplicera basen med sig själv ${exp} gånger.` : `Calculate the power by multiplying the base by itself ${exp} times.`,
                latex: `${base}^{${exp}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `Exponenten (${exp}) talar om att vi ska ha ${exp} stycken faktorer av basen (${base}).` : `The exponent (${exp}) tells us to have ${exp} factors of the base (${base}).`, latex: Array(exp).fill(base).join(' \\cdot ') },
                { text: lang === 'sv' ? "Räkna ut produkten av dessa faktorer." : "Calculate the product of these factors.", latex: `${ans}` }
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
                    description: lang === 'sv' ? "Skriv tiopotensen som ett decimaltal." : "Write the power of ten as a decimal number.",
                    latex: `10^{-${power}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr),
                clues: [
                    { text: lang === 'sv' ? "En negativ exponent betyder att vi dividerar 1 med basen." : "A negative exponent means we divide 1 by the base.", latex: `10^{-${power}} = \\frac{1}{10^{${power}}}` },
                    { text: lang === 'sv' ? `Detta resulterar i ett decimaltal där 1:an hamnar på den ${power}:e decimalplatsen.` : `This results in a decimal where the 1 is placed at the ${power}:th decimal position.`, latex: ansStr }
                ],
                metadata: { variation_key: "ten_negative_exponent", difficulty: 2 }
            };
        }

        if (v === 'ten_inverse_counting') {
            const zeros = MathUtils.randomInt(2, 7);
            const num = "1" + "0".repeat(zeros);
            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv talet ${num.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} som en potens med basen 10.` : `Write the number ${num.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} as a power with base 10.`,
                    latex: `10^{?} = ${num}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`10^${zeros}`),
                clues: [
                    { text: lang === 'sv' ? "Räkna hur många nollor som står efter ettan. Antalet nollor motsvarar exponenten." : "Count how many zeros follow the one. The number of zeros corresponds to the exponent.", latex: `\\text{Antal nollor} = ${zeros}` }
                ],
                metadata: { variation_key: "ten_inverse_counting", difficulty: 2 }
            };
        }

        const ans = Math.pow(10, power);
        return {
            renderData: {
                description: lang === 'sv' ? "Skriv tiopotensen som ett vanligt heltal." : "Write the power of ten as a standard integer.",
                latex: `10^{${power}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `En snabb regel för basen 10 är att skriva en 1:a och sedan lägga till lika många nollor som exponenten visar.` : `A quick rule for base 10 is writing a 1 and then adding as many zeros as the exponent shows.`, latex: `1 \\rightarrow ${ans}` }
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
                    description: lang === 'sv' 
                        ? `Skriv talet ${number.toLocaleString(lang)} i grundpotensform.` 
                        : `Write the number ${number.toLocaleString(lang)} in scientific notation.`,
                    answerType: 'structured_scientific'
                },
                token: this.toBase64(`${mantissa}*10^${exponent}`),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Flytta decimalkommat så att du får ett tal mellan 1 och 10." : "Step 1: Move the decimal point so you get a number between 1 and 10.", latex: `a = ${mantissa}` },
                    { text: lang === 'sv' ? `Steg 2: Räkna hur många steg kommat flyttades. Det blir din tiopotens.` : `Step 2: Count how many steps the decimal was moved. That will be your power of ten.`, latex: `10^{${exponent}}` }
                ],
                metadata: { variation_key: "scientific_to_form", difficulty: 3 }
            };
        }

        const isMantissaMissing = v === 'scientific_missing_mantissa';
        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilket värde saknas för att talet ska vara korrekt skrivet i grundpotensform?` 
                    : `Which value is missing for the number to be correctly written in scientific notation?`,
                latex: `${number.toLocaleString(lang)} = ${isMantissaMissing ? 'a' : mantissa} \\cdot 10^{${isMantissaMissing ? exponent : 'n'}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(isMantissaMissing ? mantissa.toString() : exponent.toString()),
            clues: [
                { text: lang === 'sv' ? "Grundpotensform består always av en mantissa (mellan 1-10) och en tiopotens." : "Scientific notation always consists of a mantissa (between 1-10) and a power of ten.", latex: "a \\cdot 10^{n}" }
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
                    description: lang === 'sv' ? `Hitta det positiva värdet på x som gör att ekvationen stämmer.` : `Find the positive value of x that makes the equation true.`,
                    latex: `x^{2} = ${square}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [
                    { text: lang === 'sv' ? "För att få bort upphöjt till 2, drar vi kvadratroten ur båda sidor." : "To remove the power of 2, we take the square root of both sides.", latex: "x = \\sqrt{" + square + "}" },
                    { text: lang === 'sv' ? `Vilket tal gånger sig självt blir ${square}?` : `What number times itself equals ${square}?`, latex: `${base} \\cdot ${base} = ${square}` }
                ],
                metadata: { variation_key: "root_inverse_algebra", difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna kvadratroten ur talet." : "Calculate the square root of the number.",
                latex: `\\sqrt{${square}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(base.toString()),
            clues: [
                { text: lang === 'sv' ? `Kvadratroten ur ${square} är det tal som multiplicerat med sig självt blir ${square}.` : `The square root of ${square} is the number that, when multiplied by itself, equals ${square}.`, latex: `? \\cdot ? = ${square}` }
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
                    description: lang === 'sv' ? "Använd potenslagarna för att skriva om uttrycket till en enda potens." : "Use the power laws to rewrite the expression as a single power.",
                    latex: `x^{${a}} \\cdot x^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a + b}`),
                clues: [
                    { text: lang === 'sv' ? "När vi multiplicerar potenser med samma bas, adderar vi deras exponenter." : "When multiplying powers with the same base, we add their exponents.", latex: "x^{a} \\cdot x^{b} = x^{a+b}" },
                    { text: lang === 'sv' ? `Räkna ut den nya exponenten: ${a} + ${b}.` : `Calculate the new exponent: ${a} + ${b}.`, latex: `${a+b}` }
                ],
                metadata: { variation_key: "law_multiplication", difficulty: 3 }
            };
        }

        if (v === 'law_division') {
            const big = MathUtils.randomInt(b + 1, b + 12);
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla divisionen till en enda potens." : "Simplify the division to a single power.",
                    latex: `\\frac{x^{${big}}}{x^{${b}}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${big - b}`),
                clues: [
                    { text: lang === 'sv' ? "När vi dividerar potenser med samma bas, subtraherar vi nämnarens exponent från täljarens." : "When dividing powers with the same base, we subtract the denominator's exponent from the numerator's.", latex: "\\frac{x^{a}}{x^{b}} = x^{a-b}" },
                    { text: lang === 'sv' ? `Räkna ut den nya exponenten: ${big} - ${b}.` : `Calculate the new exponent: ${big} - ${b}.`, latex: `${big - b}` }
                ],
                metadata: { variation_key: "law_division", difficulty: 3 }
            };
        }

        if (v === 'law_mult_div_combined') {
            const nTerms = MathUtils.randomInt(2, 3);
            const dTerms = MathUtils.randomInt(1, 2);
            const nExps = Array.from({length: nTerms}, () => MathUtils.randomInt(2, 8));
            const dExps = Array.from({length: dTerms}, () => MathUtils.randomInt(2, 5));
            
            const nSum = nExps.reduce((acc, cur) => acc + cur, 0);
            const dSum = dExps.reduce((acc, cur) => acc + cur, 0);
            const finalExp = nSum - dSum;

            // Prevent negative results for basic level
            if (finalExp < 0) return this.level5_LawsBasic(lang, v);

            const nLatex = nExps.map(e => `x^{${e}}`).join(' \\cdot ');
            const dLatex = dExps.map(e => `x^{${e}}`).join(' \\cdot ');
            const fullLatex = `\\frac{${nLatex}}{${dLatex}}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket genom att kombinera både multiplikations- och divisionsreglerna." : "Simplify the expression by combining both the multiplication and division rules.",
                    latex: fullLatex,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${finalExp}`),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Förenkla täljaren och nämnaren var för sig genom att addera exponenterna." : "Step 1: Simplify the numerator and denominator separately by adding the exponents.", latex: `\\frac{x^{${nSum}}}{x^{${dSum}}}` },
                    { text: lang === 'sv' ? "Steg 2: Subtrahera nämnarens exponent från täljarens." : "Step 2: Subtract the denominator's exponent from the numerator's.", latex: `x^{${nSum} - ${dSum}} = x^{${finalExp}}` }
                ],
                metadata: { variation_key: "law_mult_div_combined", difficulty: 4 }
            };
        }

        const q = lang === 'sv' ? `Går det att förenkla $x^{${a}} + x^{${b}}$ med hjälp av potenslagarna?` : `Is it possible to simplify $x^{${a}} + x^{${b}}$ using the power laws?`;
        const options = lang === 'sv' ? ["Nej, lagarna gäller bara mult/div", "Ja, det blir x upphöjt till summan"] : ["No, laws only apply to mult/div", "Yes, it becomes x to the power of the sum"];
        
        return {
            renderData: { description: q, answerType: 'multiple_choice', options },
            token: this.toBase64(options[0]),
            clues: [
                { text: lang === 'sv' ? "Potenslagarna är begränsade. De fungerar bara när vi multiplicerar eller dividerar baserna." : "Power laws are limited. They only work when we multiply or divide the bases.", latex: "x^a + x^b \\neq x^{a+b}" }
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
                    description: lang === 'sv' ? "Använd regeln för 'potens av en potens' för att förenkla uttrycket." : "Use the 'power of a power' rule to simplify the expression.",
                    latex: `(x^{${a}})^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a * b}`),
                clues: [
                    { text: lang === 'sv' ? "När en potens är upphöjd till en annan exponent, ska exponenterna multipliceras." : "When a power is raised to another exponent, the exponents should be multiplied.", latex: "(x^{a})^{b} = x^{a \\cdot b}" },
                    { text: lang === 'sv' ? `Multiplicera ${a} med ${b}.` : `Multiply ${a} by ${b}.`, latex: `${a * b}` }
                ],
                metadata: { variation_key: "law_power_of_power", difficulty: 4 }
            };
        }

        if (v === 'law_all_combined') {
            // ((x^a)^b * (x^c)^d) / (x^e)^f
            const e1 = MathUtils.randomInt(2, 4);
            const p1 = MathUtils.randomInt(2, 4);
            const e2 = MathUtils.randomInt(2, 4);
            const p2 = MathUtils.randomInt(2, 3);
            const e3 = MathUtils.randomInt(2, 5);
            const p3 = MathUtils.randomInt(2, 4);

            const n1 = e1 * p1;
            const n2 = e2 * p2;
            const d1 = e3 * p3;
            
            const nSum = n1 + n2;
            const finalExp = nSum - d1;

            // Ensure difficulty fits advanced level but remains solvable
            if (finalExp < 0 || finalExp > 25) return this.level6_LawsAdvanced(lang, v);

            const fullLatex = `\\frac{(x^{${e1}})^{${p1}} \\cdot (x^{${e2}})^{${p2}}}{(x^{${e3}})^{${p3}}}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla hela uttrycket till en enda potens. Använd alla potenslagar du lärt dig." : "Simplify the entire expression to a single power. Use all the power laws you have learned.",
                    latex: fullLatex,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${finalExp}`),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Använd 'potens av en potens' för att förenkla varje parentes först." : "Step 1: Use the 'power of a power' rule to simplify each set of parentheses first.", latex: `\\frac{x^{${n1}} \\cdot x^{${n2}}}{x^{${d1}}}` },
                    { text: lang === 'sv' ? "Steg 2: Addera exponenterna i täljaren." : "Step 2: Add the exponents in the numerator.", latex: `\\frac{x^{${nSum}}}{x^{${d1}}}` },
                    { text: lang === 'sv' ? "Steg 3: Subtrahera nämnarens exponent från täljarens." : "Step 3: Subtract the denominator's exponent from the numerator's.", latex: `x^{${nSum} - ${d1}} = x^{${finalExp}}` }
                ],
                metadata: { variation_key: "law_all_combined", difficulty: 5 }
            };
        }

        const target = a * b;
        return {
            renderData: {
                description: lang === 'sv' ? `Vilket värde på y gör att förenklingen stämmer?` : `What value of y makes the simplification correct?`,
                latex: `(x^{${a}})^{y} = x^{${target}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(b.toString()),
            clues: [
                { text: lang === 'sv' ? "Eftersom regeln är multiplikation söker vi ett tal y som gånger a blir resultatet." : "Since the rule is multiplication, we seek a number y that times a equals the result.", latex: `${a} \\cdot y = ${target}` }
            ],
            metadata: { variation_key: "law_inverse_algebra", difficulty: 4 }
        };
    }
}