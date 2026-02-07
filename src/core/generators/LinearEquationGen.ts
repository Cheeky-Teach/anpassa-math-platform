import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv'): any {
        // Delegate Word Problems to the Specialist
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
        
        // Mixed Level Drill
        if (level === 7) {
            return this.level7_Mixed(lang);
        }

        switch (level) {
            case 1: return this.level1_OneStep(lang);
            case 2: return this.level2_TwoStep(lang);
            case 3: return this.level3_Parentheses(lang);
            case 4: return this.level4_BothSides(lang);
            default: return this.level1_OneStep(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: One-Step Equations ---
    private level1_OneStep(lang: string): any {
        const variation = Math.random();

        // Variation A: Conceptual "Opposite Operation" (Now fully randomized)
        if (variation < 0.25) {
            const type = MathUtils.randomInt(1, 4);
            const val1 = MathUtils.randomInt(2, 20);
            const val2 = MathUtils.randomInt(2, 20);
            
            let q = "";
            let correctOp = "";
            let clue = "";

            const opsSv = ["Addition (+)", "Subtraktion (-)", "Multiplikation (*)", "Division (/)"];
            const opsEn = ["Addition (+)", "Subtraction (-)", "Multiplication (*)", "Division (/)"];
            const ops = lang === 'sv' ? opsSv : opsEn;

            if (type === 1) { // x + a = b
                q = `x + ${val1} = ${val1 + val2}`;
                correctOp = lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)";
                clue = lang === 'sv' ? "Motsatsen till plus är minus." : "The opposite of plus is minus.";
            } else if (type === 2) { // x - a = b
                q = `x - ${val1} = ${val2}`;
                correctOp = lang === 'sv' ? "Addition (+)" : "Addition (+)";
                clue = lang === 'sv' ? "Motsatsen till minus är plus." : "The opposite of minus is plus.";
            } else if (type === 3) { // ax = b
                q = `${val1}x = ${val1 * val2}`;
                correctOp = lang === 'sv' ? "Division (/)" : "Division (/)";
                clue = lang === 'sv' ? "Motsatsen till gånger är delat med." : "The opposite of multiplication is division.";
            } else { // x / a = b
                q = `x / ${val1} = ${val2}`;
                correctOp = lang === 'sv' ? "Multiplikation (*)" : "Multiplication (*)";
                clue = lang === 'sv' ? "Motsatsen till delat med är gånger." : "The opposite of division is multiplication.";
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken räkneoperation ska du använda för att få x ensamt i: ${q}?` : `Which operation should you use to get x alone in: ${q}?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(ops)
                },
                token: this.toBase64(correctOp),
                clues: [{ text: clue }],
                metadata: { variation: 'onestep_concept_inverse', difficulty: 1 }
            };
        }

        // Variation B: Spot the Lie
        if (variation < 0.5) {
            const targetX = MathUtils.randomInt(2, 12);
            
            // Generate True 1: Multiplication style
            const a1 = MathUtils.randomInt(2, 6);
            const sTrue1 = `${a1}x = ${a1 * targetX}`;
            
            // Generate True 2: Addition style
            const b1 = MathUtils.randomInt(2, 20);
            const sTrue2 = `x + ${b1} = ${targetX + b1}`;
            
            // Generate False: Subtraction or Addition with an offset error
            const c1 = MathUtils.randomInt(1, 15);
            const offset = MathUtils.randomChoice([-3, -2, -1, 1, 2, 3]);
            const sFalse = `x - ${c1} = ${targetX - c1 + offset}`;

            const options = [sTrue1, sTrue2, sFalse];
            const desc = lang === 'sv' 
                ? `Vilket av följande påståenden är FALSKT om x = ${targetX}?` 
                : `Which of the following statements is FALSE if x = ${targetX}?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(sFalse),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Testa varje ekvation genom att ersätta x med ${targetX}.` 
                            : `Test each equation by replacing x with ${targetX}.`, 
                        latex: "" 
                    },
                    {
                        text: lang === 'sv'
                            ? `I det felaktiga alternativet ${sFalse} blir vänster sida inte lika med höger sida.`
                            : `In the incorrect option ${sFalse}, the left side will not equal the right side.`,
                        latex: `${targetX} - ${c1} \\neq ${targetX - c1 + offset}`
                    }
                ],
                metadata: { variation: 'onestep_spot_lie', difficulty: 1 }
            };
        }

        // Variation C: Standard Calculation
        const type = MathUtils.randomInt(1, 4);
        let latex = '', answer = '', clues = [];
        if (type === 1) { // x / k = res
            const k = MathUtils.randomInt(2, 9);
            const res = MathUtils.randomInt(2, 10);
            const val = res * k;
            latex = `\\frac{x}{${k}} = ${res}`;
            answer = val.toString();
            clues = [{ text: lang === 'sv' ? `Eftersom x är delat med ${k}, multiplicerar vi båda sidor med ${k}.` : `Since x is divided by ${k}, multiply both sides by ${k}.`, latex: `x = ${res} \\cdot ${k}` }];
        } else if (type === 2) { // kx = res
            const k = MathUtils.randomInt(2, 9);
            const val = MathUtils.randomInt(2, 10);
            latex = `${k}x = ${k * val}`;
            answer = val.toString();
            clues = [{ text: lang === 'sv' ? `Eftersom x är multiplicerat med ${k}, dividerar vi båda sidor med ${k}.` : `Since x is multiplied by ${k}, divide both sides by ${k}.`, latex: `x = \\frac{${k * val}}{${k}}` }];
        } else { // x + k = res or x - k = res
            const k = MathUtils.randomInt(1, 20);
            const val = MathUtils.randomInt(1, 20);
            const isPlus = type === 3;
            latex = isPlus ? `x + ${k} = ${val + k}` : `x - ${k} = ${val - k}`;
            answer = val.toString();
            clues = [{ text: lang === 'sv' ? (isPlus ? `Subtrahera ${k} från båda sidor.` : `Addera ${k} på båda sidor.`) : (isPlus ? `Subtract ${k} from both sides.` : `Add ${k} to both sides.`), latex: `x = ${isPlus ? (val + k) : (val - k)} ${isPlus ? '-' : '+'} ${k}` }];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen" : "Solve the equation", answerType: 'text' },
            token: this.toBase64(answer),
            clues,
            metadata: { variation: 'onestep_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Two-Step Equations ---
    private level2_TwoStep(lang: string): any {
        const variation = Math.random();
        
        // Variation A: Order of Steps Concept (Now fully randomized)
        if (variation < 0.3) {
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 15);
            const res = MathUtils.randomInt(20, 50);
            const q = `${a}x + ${b} = ${res}`;
            const correct = lang === 'sv' ? `Subtrahera ${b} först` : `Subtract ${b} first`;
            const wrong = lang === 'sv' ? `Dividera med ${a} först` : `Divide by ${a} first`;
            return {
                renderData: {
                    description: lang === 'sv' ? `För att lösa ekvationen ${q} mest effektivt, vad bör du göra först?` : `To solve ${q} most efficiently, what should you do first?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "I algebra gör vi oftast räkneordningen (prioriteringsreglerna) baklänges för att isolera x." : "In algebra, we usually perform the order of operations in reverse to isolate x." }],
                metadata: { variation: 'twostep_concept_order', difficulty: 2 }
            };
        }

        // Variation B: Standard Calculation
        const type = MathUtils.randomInt(1, 2);
        const x = MathUtils.randomInt(2, 10);
        const a = MathUtils.randomInt(2, 8);
        const b = MathUtils.randomInt(1, 15);
        let latex = '', answer = x.toString(), clues = [];

        if (type === 1) { // ax + b = c
            const c = a * x + b;
            latex = `${a}x + ${b} = ${c}`;
            clues = [
                { text: lang === 'sv' ? `Steg 1: Ta bort konstanten ${b} genom att subtrahera den från båda sidor.` : `Step 1: Remove the constant ${b} by subtracting it from both sides.`, latex: `${a}x = ${c} - ${b}` },
                { text: lang === 'sv' ? `Steg 2: Dela med koefficienten ${a}.` : `Step 2: Divide by the coefficient ${a}.`, latex: `x = \\frac{${c-b}}{${a}}` }
            ];
        } else { // ax - b = c
            const c = a * x - b;
            latex = `${a}x - ${b} = ${c}`;
            clues = [
                { text: lang === 'sv' ? `Steg 1: Ta bort minus ${b} genom att addera ${b} på båda sidor.` : `Step 1: Remove minus ${b} by adding ${b} to both sides.`, latex: `${a}x = ${c} + ${b}` },
                { text: lang === 'sv' ? `Steg 2: Dela med ${a}.` : `Step 2: Divide by ${a}.`, latex: `x = \\frac{${c+b}}{${a}}` }
            ];
        }

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen i två steg" : "Solve the equation in two steps", answerType: 'text' },
            token: this.toBase64(answer),
            clues,
            metadata: { variation: 'twostep_calc', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Parentheses ---
    private level3_Parentheses(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(2, 8);
        const x = MathUtils.randomInt(1, 10);

        // Variation A: Spot the Lie (Distribution Error)
        if (variation < 0.3) {
            const correct = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            const lie = `${a}(x + ${b}) = ${a}x + ${b}`; // Common mistake
            const altCorrect = `${a}(x + ${b}) = ${a}(x) + ${a}(${b})`;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken förenkling av parentesen är FELAKTIG?" : "Which simplification of the parentheses is INCORRECT?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lie, altCorrect]),
                },
                token: this.toBase64(lie),
                clues: [{ text: lang === 'sv' ? "Kom ihåg att multiplicera talet utanför parentesen med ALLA termer inuti." : "Remember to multiply the number outside the parentheses by ALL terms inside." }],
                metadata: { variation: 'paren_lie_distribution', difficulty: 3 }
            };
        }

        // Variation B: Standard Calculation
        const c = a * (x + b);
        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${c}`,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Multiplicera ${a} med både x och ${b}.` : `Step 1: Multiply ${a} by both x and ${b}.`, latex: `${a}x + ${a*b} = ${c}` },
                { text: lang === 'sv' ? "Steg 2: Lös nu som en vanlig tvåstegsekvation genom att subtrahera och sedan dividera." : "Step 2: Now solve as a regular two-step equation by subtracting and then dividing.", latex: `${a}x = ${c - a*b} \\\\ x = ${x}` }
            ],
            metadata: { variation: 'paren_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Both Sides ---
    private level4_BothSides(lang: string): any {
        const variation = Math.random();
        const x = MathUtils.randomInt(1, 12);
        const a = MathUtils.randomInt(5, 10);
        const c = MathUtils.randomInt(2, a - 1); // Keep x positive
        const b = MathUtils.randomInt(2, 15);
        const d = (a - c) * x + b;

        // Variation A: Strategic Choice (Now fully randomized)
        if (variation < 0.3) {
            const eq = `${a}x + ${b} = ${c}x + ${d}`;
            const correct = lang === 'sv' ? `Subtrahera ${c}x från båda sidor` : `Subtract ${c}x from both sides`;
            const wrong = lang === 'sv' ? `Addera ${a}x på båda sidor` : `Add ${a}x to both sides`;
            const neutral = lang === 'sv' ? `Subtrahera ${b} från båda sidor` : `Subtract ${b} from both sides`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `I ekvationen ${eq}, vilket steg är bäst att börja med för att hålla x positivt på bara en sida?` : `In the equation ${eq}, which step is best to start with to keep x positive on only one side?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, wrong, neutral])
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Genom att flytta den minsta x-termen först slipper vi arbeta med negativa antal x." : "By moving the smallest x-term first, we avoid working with negative amounts of x." }],
                metadata: { variation: 'bothsides_concept_strategy', difficulty: 3 }
            };
        }

        // Variation B: Standard Calculation
        return {
            renderData: {
                latex: `${a}x + ${b} = ${c}x + ${d}`,
                description: lang === 'sv' ? "Samla x-termerna på ena sidan och siffrorna på den andra för att lösa ut x." : "Gather x-terms on one side and numbers on the other to solve for x.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Flytta ${c}x till vänster sida genom att subtrahera det.` : `Step 1: Move ${c}x to the left side by subtracting it.`, latex: `${a-c}x + ${b} = ${d}` },
                { text: lang === 'sv' ? `Steg 2: Flytta ${b} genom att subtrahera det från höger sida.` : `Step 2: Move ${b} by subtracting it from the right side.`, latex: `${a-c}x = ${d-b}` },
                { text: lang === 'sv' ? "Steg 3: Dela resultatet med koefficienten för att få fram x." : "Step 3: Divide the result by the coefficient to find x.", latex: `x = ${x}` }
            ],
            metadata: { variation: 'bothsides_calc', difficulty: 4 }
        };
    }

    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(1, 4);
        const data = this.generate(subLevel, lang);
        data.metadata.mixed = true;
        return data;
    }
}