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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: FOUNDATIONS ---
    private level1_Foundations(lang: string): any {
        const variation = Math.random();

        // Variation A: Zero Rule & Power of 1
        if (variation < 0.3) {
            const isZero = Math.random() > 0.5;
            const base = MathUtils.randomInt(5, 500);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna värdet:" : "Calculate the value:",
                    latex: isZero ? `${base}^{0}` : `${base}^{1}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(isZero ? "1" : base.toString()),
                clues: isZero ? [
                    { text: lang === 'sv' ? "Steg 1: Kom ihåg regeln för noll-exponenter. Alla tal upphöjt till 0 blir alltid 1." : "Step 1: Remember the zero exponent rule. Any number raised to 0 always results in 1.", latex: "x^{0} = 1" },
                    { text: lang === 'sv' ? "Varför? Tänk på division: Ett tal delat med sig själv är 1." : "Why? A number divided by itself is 1.", latex: "\\frac{" + base + "^{2}}{" + base + "^{2}} = " + base + "^{2-2} = " + base + "^{0} = 1" }
                ] : [
                    { text: lang === 'sv' ? "Steg 1: En exponent på 1 betyder att talet bara förekommer en gång." : "Step 1: An exponent of 1 means the number appears only once.", latex: "x^{1} = x" },
                    { text: lang === 'sv' ? "Därför ändras inte värdet på basen." : "Therefore, the value of the base does not change.", latex: base + "^{1} = " + base }
                ],
                metadata: { variation: isZero ? "zero_rule" : "power_of_one", difficulty: 1 }
            };
        }

        // Variation B: Spot the Lie (Dynamic)
        if (variation < 0.6) {
            const base = MathUtils.randomInt(2, 5);
            const exp = MathUtils.randomInt(2, 3);
            const val = Math.pow(base, exp);
            
            const true1 = `${base}^{${exp}} = ${val}`;
            const true2 = `${MathUtils.randomInt(10, 99)}^{0} = 1`;
            const lie = `${base}^{${exp}} = ${base * exp}`; 

            const options = MathUtils.shuffle([true1, true2, lie]);
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "Kom ihåg: En potens betyder upprepad multiplikation, inte basen gånger exponenten!" : "Remember: A power means repeated multiplication, not the base times the exponent!", latex: base + "^{" + exp + "} = " + Array(exp).fill(base).join(" \\cdot ") + " = " + val }
                ],
                metadata: { variation: "foundations_spot_the_lie", difficulty: 2 }
            };
        }

        // Variation C: Basic Calculation
        const base = MathUtils.randomInt(2, 10);
        const exp = MathUtils.randomInt(2, 3);
        const ans = Math.pow(base, exp);
        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna potensen:" : "Calculate the power:",
                latex: `${base}^{${exp}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Skriv ut multiplikationen. Exponenten (${exp}) talar om hur många gånger basen (${base}) ska multipliceras.` : `Step 1: Write out the multiplication. The exponent (${exp}) tells you how many times to multiply the base (${base}).`, latex: Array(exp).fill(base).join(' \\cdot ') },
                { text: lang === 'sv' ? `Steg 2: Räkna ut produkten.` : `Step 2: Calculate the product.`, latex: Array(exp).fill(base).join(' \\cdot ') + " = " + ans }
            ],
            metadata: { variation: "foundations_calc", difficulty: 1 }
        };
    }

    // --- LEVEL 2: POWERS OF 10 ---
    private level2_PowersOfTen(lang: string): any {
        const variation = Math.random();
        const power = MathUtils.randomInt(1, 6);

        if (variation < 0.4) {
            // Negative Exponent (Decimals)
            let ansStr = "0." + "0".repeat(power - 1) + "1";
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som ett decimaltal:" : "Write as a decimal number:",
                    latex: `10^{-${power}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: En negativ exponent betyder att vi inverterar talet." : "Step 1: A negative exponent means we invert the number.", latex: "10^{-" + power + "} = \\frac{1}{10^{" + power + "}}" },
                    { text: lang === 'sv' ? `Steg 2: Exponenten (${power}) berättar hur många decimaler talet ska ha totalt.` : `Step 2: The exponent (${power}) tells you how many total decimal places the number should have.`, latex: power + " \\text{ decimaler}" }
                ],
                metadata: { variation: "ten_negative_exponent", difficulty: 2 }
            };
        }

        if (variation < 0.7) {
            // Inverse Powers
            const zeros = MathUtils.randomInt(2, 7);
            const num = "1" + "0".repeat(zeros);
            return {
                renderData: {
                    description: lang === 'sv' ? `Skriv talet ${num} som en potens med basen 10:` : `Write the number ${num} as a power with base 10:`,
                    latex: `10^{?} = ${num}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`10^${zeros}`),
                clues: [
                    { text: lang === 'sv' ? "Räkna antalet nollor som följer efter 1:an för att hitta exponenten." : "Count the number of zeros following the 1 to find the exponent.", latex: "" }
                ],
                metadata: { variation: "ten_inverse_counting", difficulty: 2 }
            };
        }

        const ans = Math.pow(10, power);
        return {
            renderData: {
                description: lang === 'sv' ? "Skriv som ett vanligt tal:" : "Write as a standard number:",
                latex: `10^{${power}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? `Genväg: Skriv en 1:a och lägg till ${power} stycken nollor efter den.` : `Shortcut: Write a 1 and add ${power} zeros after it.`, latex: "1 \\rightarrow " + ans }
            ],
            metadata: { variation: "ten_positive_exponent", difficulty: 1 }
        };
    }

    // --- LEVEL 3: SCIENTIFIC NOTATION (Structured) ---
    private level3_ScientificNotation(lang: string): any {
        const variation = Math.random();
        
        const mantissa = (MathUtils.randomInt(11, 99) / 10); 
        const exponent = MathUtils.randomInt(3, 8);
        const number = mantissa * Math.pow(10, exponent);

        if (variation < 0.6) {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Skriv talet ${number.toLocaleString(lang)} i grundpotensform.` 
                        : `Write the number ${number.toLocaleString(lang)} in scientific notation.`,
                    answerType: 'structured_scientific'
                },
                token: this.toBase64(`${mantissa}*10^${exponent}`),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Steg 1: Hitta ett tal 'a' som är mellan 1 och 10 genom att flytta decimalkommat." 
                            : "Step 1: Find a number 'a' between 1 and 10 by moving the decimal point.", 
                        latex: `a = ${mantissa}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Steg 2: Räkna hur många steg du flyttade kommat för att få exponenten 'n'.` 
                            : `Step 2: Count how many steps you moved the decimal to get the exponent 'n'.`, 
                        latex: `n = ${exponent}` 
                    }
                ],
                metadata: { variation: "scientific_to_form", difficulty: 3 }
            };
        }

        const isMantissaMissing = Math.random() > 0.5;
        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilket värde på ${isMantissaMissing ? 'a' : 'n'} saknas för att uttrycket ska stämma?` 
                    : `What value of ${isMantissaMissing ? 'a' : 'n'} is missing for the expression to be correct?`,
                latex: `${number.toLocaleString(lang)} = ${isMantissaMissing ? 'a' : mantissa} \\cdot 10^{${isMantissaMissing ? exponent : 'n'}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(isMantissaMissing ? mantissa.toString() : exponent.toString()),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Grundpotensform skrivs alltid som ett tal mellan 1 och 10 multiplicerat med en tiopotens." 
                        : "Scientific notation is always written as a number between 1 and 10 multiplied by a power of 10.", 
                    latex: "a \\cdot 10^{n}" 
                }
            ],
            metadata: { variation: isMantissaMissing ? "scientific_missing_mantissa" : "scientific_missing_exponent", difficulty: 3 }
        };
    }

    // --- LEVEL 4: SQUARE ROOTS ---
    private level4_SquareRoots(lang: string): any {
        const variation = Math.random();
        const base = MathUtils.randomInt(2, 12);
        const square = base * base;

        if (variation < 0.4) {
            return {
                renderData: {
                    description: lang === 'sv' ? `Om $x^{2} = ${square}$, vad är då $x$?` : `If $x^{2} = ${square}$, what is $x$?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Att lösa x² är motsatsen till att dra kvadratroten." : "Step 1: Solving x² is the inverse of taking the square root.", latex: "x = \\sqrt{" + square + "}" },
                    { text: lang === 'sv' ? `Steg 2: Fråga dig själv: Vilket tal gånger sig självt blir ${square}?` : `Step 2: Ask yourself: What number multiplied by itself equals ${square}?`, latex: base + " \\cdot " + base + " = " + square }
                ],
                metadata: { variation: "root_inverse_algebra", difficulty: 2 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna kvadratroten:" : "Calculate the square root:",
                latex: `\\sqrt{${square}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(base.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Kvadratroten ur ${square} betyder att vi söker det tal som multiplicerat med sig självt blir ${square}.` : `Step 1: The square root of ${square} means we are looking for the number that multiplied by itself results in ${square}.`, latex: "? \\cdot ? = " + square }
            ],
            metadata: { variation: "root_calc", difficulty: 2 }
        };
    }

    // --- LEVEL 5: LAWS BASIC ---
    private level5_LawsBasic(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 15); // Increased range to test multi-digit
        const b = MathUtils.randomInt(2, 8);

        if (variation < 0.4) {
            // Multiplication
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket till en enda potens:" : "Simplify the expression to a single power:",
                    latex: `x^{${a}} \\cdot x^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a + b}`),
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Vid multiplikation av potenser med samma bas adderar vi exponenterna.` : `Step 1: When multiplying powers with the same base, we add the exponents.`, latex: "x^{a} \\cdot x^{b} = x^{a+b}" },
                    { text: lang === 'sv' ? `Beräkning:` : `Calculation:`, latex: `x^{${a} + ${b}} = x^{${a + b}}` }
                ],
                metadata: { variation: "law_multiplication", difficulty: 3 }
            };
        }

        if (variation < 0.7) {
            // Division (FIXED: Added curly braces to exponents)
            const big = MathUtils.randomInt(b + 1, b + 9);
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket till en enda potens:" : "Simplify the expression to a single power:",
                    latex: `\\frac{x^{${big}}}{x^{${b}}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${big - b}`),
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Varje x i nämnaren tar ut ett x i täljaren. Subtrahera exponenterna.` : `Step 1: Each x in the denominator cancels out an x in the numerator. Subtract the exponents.`, latex: "\\frac{x^{a}}{x^{b}} = x^{a-b}" },
                    { text: lang === 'sv' ? `Beräkning:` : `Calculation:`, latex: `x^{${big} - ${b}} = x^{${big - b}}` }
                ],
                metadata: { variation: "law_division", difficulty: 3 }
            };
        }

        const q = lang === 'sv' ? `Kan du förenkla $x^{${a}} + x^{${b}}$ till en enda potens med lagarna?` : `Can you simplify $x^{${a}} + x^{${b}}$ into a single power using the laws?`;
        const options = lang === 'sv' ? ["Nej, lagarna gäller bara mult/div", "Ja"] : ["No, laws only apply to mult/div", "Yes"];
        
        return {
            renderData: { description: q, answerType: 'multiple_choice', options },
            token: this.toBase64(options[0]),
            clues: [
                { text: lang === 'sv' ? "Viktigt: Potenslagarna gäller när vi multiplicerar eller dividerar baser, aldrig vid addition eller subtraktion." : "Important: Power laws apply when we multiply or divide bases, never for addition or subtraction.", latex: "x^{a} + x^{b} \\neq x^{a+b}" }
            ],
            metadata: { variation: "law_addition_trap", difficulty: 2 }
        };
    }

    // --- LEVEL 6: LAWS ADVANCED ---
    private level6_LawsAdvanced(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);

        if (variation < 0.5) {
            // Power of Power
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla uttrycket till en enda potens:" : "Simplify the expression to a single power:",
                    latex: `(x^{${a}})^{${b}}`,
                    answerType: 'structured_power'
                },
                token: this.toBase64(`x^${a * b}`),
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Vid 'potens av en potens' multiplicerar vi exponenterna." : "Step 1: For 'power of a power', we multiply the exponents.", latex: "(x^{a})^{b} = x^{a \\cdot b}" },
                    { text: lang === 'sv' ? "Beräkning:" : "Calculation:", latex: `x^{${a} \\cdot ${b}} = x^{${a * b}}` }
                ],
                metadata: { variation: "law_power_of_power", difficulty: 4 }
            };
        }

        const target = a * b;
        return {
            renderData: {
                description: lang === 'sv' ? `Hitta det saknade värdet på y:` : `Find the missing value of y:`,
                latex: `(x^{${a}})^{y} = x^{${target}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(b.toString()),
            clues: [
                { text: lang === 'sv' ? `Regeln är multiplikation: a \cdot y = mål-exponenten.` : `The rule is multiplication: a \cdot y = target exponent.`, latex: `${a} \\cdot y = ${target}` }
            ],
            metadata: { variation: "law_inverse_algebra", difficulty: 4 }
        };
    }
}