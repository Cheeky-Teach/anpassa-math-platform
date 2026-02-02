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

    // Level 1: Foundations & Zero Rule
    private level1_Foundations(lang: string): any {
        const type = MathUtils.randomInt(1, 3);
        
        if (type === 1) { // Zero Rule
            const base = MathUtils.randomInt(5, 1000);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `${base}^0`,
                    answerType: 'numeric'
                },
                token: this.toBase64("1"),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Tänk på division. Ett tal delat med sig självt är alltid 1." 
                            : "Think about division. A number divided by itself is always 1.",
                        latex: `\\frac{${base}^2}{${base}^2} = 1 \\quad \\text{and} \\quad ${base}^{2-2} = ${base}^0`
                    },
                    {
                        text: lang === 'sv' ? "Därför är alla tal upphöjt till 0 lika med 1." : "Therefore, any number to the power of 0 is just 1."
                    }
                ]
            };
        } else if (type === 2) { // Power of 1
            const base = MathUtils.randomInt(2, 20);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `${base}^1`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [{ text: lang === 'sv' ? "Ett tal upphöjt till 1 är bara talet självt." : "A number to the power of 1 is just the number itself." }]
            };
        } else { // Simple Square
            const base = MathUtils.randomInt(2, 12);
            const ans = base * base;
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna kvadraten:" : "Calculate the square:",
                    latex: `${base}^2`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "Exponenten är 2, så vi multiplicerar basen med sig själv en gång." 
                            : "The exponent is 2, so we multiply the base by itself one time.",
                        latex: `${base} \\cdot ${base}` 
                    }
                ]
            };
        }
    }

    // Level 2: Powers of 10 (Updated with Negative Exponents)
    private level2_PowersOfTen(lang: string): any {
        const isNegative = MathUtils.randomInt(0, 1) === 1;

        if (isNegative) {
            const power = MathUtils.randomInt(1, 8); // represents -1 to -8
            // Calculate decimal string manually to avoid scientific notation issues with very small numbers in JS
            // 10^-1 = 0.1, 10^-2 = 0.01
            let ansStr = "0.";
            for(let i=0; i<power-1; i++) ansStr += "0";
            ansStr += "1";

            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som ett decimaltal:" : "Write as a decimal number:",
                    latex: `10^{-${power}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ansStr),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? "En negativ exponent betyder att vi dividerar med 10." 
                            : "A negative exponent means we divide by 10.",
                        latex: `10^{-${power}} = \\frac{1}{10^{${power}}}`
                    },
                    {
                        text: lang === 'sv' 
                            ? `Exponenten (-${power}) berättar hur många decimaler talet ska ha.` 
                            : `The exponent (-${power}) tells you how many decimal places the number has.`,
                        latex: `10^{-${power}} \\rightarrow ${ansStr} \\quad (${power} \\text{ decimaler})`
                    }
                ]
            };
        } else {
            const power = MathUtils.randomInt(2, 6);
            const ans = Math.pow(10, power);
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som ett vanligt tal:" : "Write as a standard number:",
                    latex: `10^${power}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Räkna antalet nollor." : "Count the number of zeros.",
                        latex: `10^${power} \\rightarrow \\text{1 med ${power} nollor som följer}`
                    },
                    {
                        text: lang === 'sv' ? "Exponenten visar hur många gånger vi multiplicerar 10." : "The exponent shows how many times we multiply 10.",
                        latex: `10^${power} = \\underbrace{10 \\cdot ... \\cdot 10}_{${power} \\text{ gånger}}`
                    }
                ]
            };
        }
    }

    // Level 3: Scientific Notation
    private level3_ScientificNotation(lang: string): any {
        const base = MathUtils.randomInt(1, 9);
        const decimal = MathUtils.randomInt(1, 9);
        const power = MathUtils.randomInt(3, 6);
        const number = (base + decimal/10) * Math.pow(10, power); // e.g. 4.5 * 1000 = 4500
        
        const correct = `${base}.${decimal} \\cdot 10^${power}`; // "4.5 * 10^3"
        const wrong = `${base * 10 + decimal} \\cdot 10^${power-1}`; // "45 * 10^2"

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Skriv talet ${number} i grundpotensform.` 
                    : `Write the number ${number} in scientific notation.`,
                answerType: 'structured_scientific',
                options: MathUtils.shuffle([correct, wrong])
            },
            token: this.toBase64(correct),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "Först, hitta ett tal mellan 1 och 10." 
                        : "First, find a number between 1 and 10.",
                    latex: `${base}.${decimal}`
                },
                { 
                    text: lang === 'sv' 
                        ? "Räkna nu hur många steg decimalkommat flyttades." 
                        : "Now count how many steps the decimal point moved.",
                    latex: `${base}.${decimal} \\cdot 10 \\cdot ... \\rightarrow 10^${power}` 
                }
            ]
        };
    }

    // Level 4: Square Roots
    private level4_SquareRoots(lang: string): any {
        const base = MathUtils.randomInt(3, 15);
        const square = base * base;
        
        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                latex: `\\sqrt{${square}}`,
                answerType: 'numeric'
            },
            token: this.toBase64(base.toString()),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Vi söker ett tal som gånger sig självt blir ${square}.` 
                        : `We are looking for a number that, when squared, equals ${square}.`,
                    latex: `? \\cdot ? = ${square}`
                },
                {
                    text: lang === 'sv' ? "Testa dig fram..." : "Try testing numbers...",
                    latex: `${base-1} \\cdot ${base-1} = ${(base-1)**2} \\quad (\\text{Too Low})`
                }
            ]
        };
    }

    // Level 5: Basic Laws (Mult/Div)
    private level5_LawsBasic(lang: string): any {
        const isMult = MathUtils.randomInt(0, 1) === 1;
        const a = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 5);
        
        if (isMult) {
            const ans = a + b;
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `x^${a} \\cdot x^${b}`,
                    answerType: 'structured_power',
                    prefillBase: 'x'
                },
                token: this.toBase64(`x^${ans}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Skriv ut vad potenserna betyder." : "Write out what the powers mean.",
                        latex: `(\\underbrace{x \\cdot ...}_{${a}}) \\cdot (\\underbrace{x \\cdot ...}_{${b}})` 
                    },
                    {
                        text: lang === 'sv' ? "Räkna hur många x du har totalt." : "Count how many x's you have in total.",
                        latex: `${a} + ${b} = ${ans}`
                    }
                ]
            };
        } else {
            // Division (ensure a > b)
            const big = Math.max(a, b) + 2;
            const small = Math.min(a, b);
            const ans = big - small;
             return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `\\frac{x^${big}}{x^${small}}`,
                    answerType: 'structured_power',
                    prefillBase: 'x'
                },
                token: this.toBase64(`x^${ans}`),
                clues: [
                    { 
                        text: lang === 'sv' ? "Skriv ut x:en på toppen och botten." : "Write out the x's on top and bottom.",
                        latex: `\\frac{\\overbrace{x \\cdot ... \\cdot x}^{${big}}}{\\underbrace{x \\cdot ...}_{${small}}}`
                    },
                    {
                        text: lang === 'sv' ? "Stryk de som tar ut varandra. Hur många är kvar?" : "Cancel out the matching pairs. How many are left?",
                        latex: `${big} - ${small} = ${ans}`
                    }
                ]
            };
        }
    }

    // Level 6: Advanced Laws
    private level6_LawsAdvanced(lang: string): any {
        const a = MathUtils.randomInt(2, 4);
        const b = MathUtils.randomInt(2, 4);
        const ans = a * b;
        
        return {
             renderData: {
                description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                latex: `(x^${a})^${b}`,
                answerType: 'structured_power',
                prefillBase: 'x'
            },
            token: this.toBase64(`x^${ans}`),
            clues: [
                { 
                    text: lang === 'sv' ? `Den yttre exponenten (${b}) betyder att vi har ${b} grupper av innehållet.` : `The outer exponent (${b}) means we have ${b} groups of the inside part.`,
                    latex: `\\underbrace{x^${a} \\cdot ... \\cdot x^${a}}_{${b} \\text{ times}}`
                },
                {
                    text: lang === 'sv' ? "Räkna ihop alla x totalt." : "Now just add the total x's like before.",
                    latex: `${a} \\cdot ${b} = ${ans}`
                }
            ]
        };
    }
}