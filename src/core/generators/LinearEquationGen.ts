import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv'): any {
        // Delegate Word Problems to the Specialist (Levels 5 & 6)
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
        
        // Mixed Level Drill (Level 7)
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

    public generateByVariation(key: string, lang: string = 'sv'): any {
        // Handle Word Problem delegation
        const wordProblemKeys = [
            'rate_fixed_add_write', 'rate_fixed_add_solve',
            'rate_fixed_sub_write', 'rate_fixed_sub_solve',
            'compare_word_sum_write', 'compare_word_sum_solve',
            'compare_word_diff_write', 'compare_word_diff_solve'
        ];

        if (wordProblemKeys.includes(key)) {
            const level = key.endsWith('_write') ? 5 : 6;
            return this.problemGen.generate(level, lang);
        }

        switch (key) {
            case 'onestep_concept_inverse':
            case 'onestep_spot_lie':
            case 'onestep_calc':
                return this.level1_OneStep(lang, key);
            
            case 'twostep_concept_order':
            case 'twostep_calc':
                return this.level2_TwoStep(lang, key);
            
            case 'paren_lie_distribution':
            case 'paren_calc':
                return this.level3_Parentheses(lang, key);
            
            case 'bothsides_concept_strategy':
            case 'bothsides_calc':
                return this.level4_BothSides(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // --- LEVEL 1: One-Step Equations ---
    private level1_OneStep(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['onestep_concept_inverse', 'onestep_spot_lie', 'onestep_calc']);

        if (v === 'onestep_concept_inverse') {
            const type = MathUtils.randomInt(1, 4);
            const val1 = MathUtils.randomInt(2, 12);
            const val2 = MathUtils.randomInt(2, 12);
            
            let q = "";
            let correctOp = "";
            let clueText = "";
            let latexStep = "";

            const ops = lang === 'sv' 
                ? ["Addition (+)", "Subtraktion (-)", "Multiplikation (·)", "Division (/)"] 
                : ["Addition (+)", "Subtraction (-)", "Multiplication (·)", "Division (/)"];

            if (type === 1) { // x + a = b
                q = `x + ${val1} = ${val1 + val2}`;
                correctOp = lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)";
                clueText = lang === 'sv' ? `Eftersom det står $+${val1}$, använder vi motsatsen (subtraktion) för att få x ensamt.` : `Since it says $+${val1}$, we use the opposite (subtraction) to get x alone.`;
                latexStep = `x = ${val1 + val2} - ${val1}`;
            } else if (type === 2) { // x - a = b
                q = `x - ${val1} = ${val2}`;
                correctOp = lang === 'sv' ? "Addition (+)" : "Addition (+)";
                clueText = lang === 'sv' ? `Eftersom det står $-${val1}$, använder vi motsatsen (addition) för att nollställa termen.` : `Since it says $-${val1}$, we use the opposite (addition) to cancel the term.`;
                latexStep = `x = ${val2} + ${val1}`;
            } else if (type === 3) { // ax = b
                q = `${val1}x = ${val1 * val2}`;
                correctOp = lang === 'sv' ? "Division (/)" : "Division (/)";
                clueText = lang === 'sv' ? `Talet står precis bredvid x, vilket betyder multiplikation. Motsatsen till det är division.` : `The number is right next to x, which means multiplication. The opposite of that is division.`;
                latexStep = `x = \\frac{${val1 * val2}}{${val1}}`;
            } else { // x / a = b
                q = `\\frac{x}{${val1}} = ${val2}`;
                correctOp = lang === 'sv' ? "Multiplikation (·)" : "Multiplication (·)";
                clueText = lang === 'sv' ? `Här är x dividerat med ${val1}. För att få x fritt använder vi multiplikation.` : `Here x is divided by ${val1}. To free x, we use multiplication.`;
                latexStep = `x = ${val2} \\cdot ${val1}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Betrakta ekvationen $${q}$. Vilken räkneoperation ska du utföra på båda sidor för att isolera variabeln x?` : `Consider the equation $${q}$. Which operation should you perform on both sides to isolate the variable x?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(ops)
                },
                token: this.toBase64(correctOp),
                clues: [{ text: clueText, latex: latexStep }],
                metadata: { variation_key: 'onestep_concept_inverse', difficulty: 1 }
            };
        }

        if (v === 'onestep_spot_lie') {
            const targetX = MathUtils.randomInt(2, 10);
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 15);
            const sTrue1 = `${a}x = ${a * targetX}`;
            const sTrue2 = `x + ${b} = ${targetX + b}`;
            const lie = `x - ${b} = ${targetX + b}`; 

            return {
                renderData: {
                    description: lang === 'sv' ? `Om vi utgår från att $x = ${targetX}$, vilket av följande påståenden stämmer då INTE?` : `Assuming that $x = ${targetX}$, which of the following statements is NOT true?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, lie])
                },
                token: this.toBase64(lie),
                clues: [{ 
                    text: lang === 'sv' ? `Testa att ersätta x med ${targetX} i ekvationerna. I en av dem kommer vänster sida inte bli lika med höger sida.` : `Try replacing x with ${targetX} in the equations. In one of them, the left side will not equal the right side.`,
                    latex: `${targetX} - ${b} \\neq ${targetX + b}`
                }],
                metadata: { variation_key: 'onestep_spot_lie', difficulty: 1 }
            };
        }

        // Standard Calculation
        const type = MathUtils.randomInt(1, 3);
        const x = MathUtils.randomInt(2, 12);
        let latex = '', answer = x.toString(), pedagogicalClues = [];
        
        if (type === 1) { // kx = res
            const k = MathUtils.randomInt(2, 9);
            const res = k * x;
            latex = `${k}x = ${res}`;
            pedagogicalClues = [
                { 
                    sv: `För att få x ensamt delar vi båda sidor med talet framför x, som är ${k}.`, 
                    en: `To get x alone, we divide both sides by the number in front of x, which is ${k}.`,
                    latex: `\\frac{${k}x}{${k}} = \\frac{${res}}{${k}}`
                },
                { 
                    sv: `Uträkningen ger oss svaret.`, 
                    en: `The calculation gives us the answer.`,
                    latex: `x = ${x}`
                }
            ];
        } else { // x +/- k = res
            const k = MathUtils.randomInt(1, 20);
            const isPlus = Math.random() > 0.5;
            const res = isPlus ? x + k : x - k;
            latex = isPlus ? `x + ${k} = ${res}` : `x - ${k} = ${res}`;
            pedagogicalClues = [
                { 
                    sv: isPlus ? `Ta bort $+${k}$ genom att subtrahera ${k} från båda sidor.` : `Ta bort $-${k}$ genom att addera ${k} till båda sidor.`, 
                    en: isPlus ? `Remove $+${k}$ by subtracting ${k} from both sides.` : `Remove $-${k}$ by adding ${k} to both sides.`,
                    latex: isPlus ? `x = ${res} - ${k}` : `x = ${res} + ${k}`
                },
                { 
                    sv: `Räkna ut värdet för att hitta x.`, 
                    en: `Calculate the value to find x.`,
                    latex: `x = ${x}`
                }
            ];
        }

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Beräkna värdet på variabeln x i ekvationen nedan." : "Calculate the value of the variable x in the equation below.", 
                answerType: 'text' 
            },
            token: this.toBase64(answer),
            clues: pedagogicalClues.map(c => ({ text: lang === 'sv' ? c.sv : c.en, latex: c.latex })),
            metadata: { variation_key: 'onestep_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Two-Step Equations ---
    private level2_TwoStep(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['twostep_concept_order', 'twostep_calc']);
        
        if (v === 'twostep_concept_order') {
            const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 10), c = 20;
            const correct = lang === 'sv' ? `Subtrahera ${b} först` : `Subtract ${b} first`;
            const wrong = lang === 'sv' ? `Dividera med ${a} först` : `Divide by ${a} first`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `För $${a}x + ${b} = ${c}$, vilket steg bör man börja med?` : `For $${a}x + ${b} = ${c}$, which step should you start with?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Börja med att ta bort termen som inte sitter ihop med x (additionen/subtraktionen)." : "Start by removing the term not attached to x (the addition/subtraction)." }],
                metadata: { variation_key: 'twostep_concept_order', difficulty: 2 }
            };
        }

        const x = MathUtils.randomInt(2, 10);
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(1, 15);
        const isPlus = Math.random() > 0.5;
        const c = isPlus ? a * x + b : a * x - b;

        return {
            renderData: { 
                latex: `${a}x ${isPlus ? '+' : '-'} ${b} = ${c}`, 
                description: lang === 'sv' ? "Lös ekvationen i två steg." : "Solve the equation in two steps.", 
                answerType: 'text' 
            },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    sv: `Steg 1: Flytta siffran som står ensam. Eftersom det står ${isPlus ? '+' : '-'}${b}, så ${isPlus ? 'tar vi bort' : 'lägger vi till'} ${b} på båda sidor.`, 
                    en: `Step 1: Move the standalone number. Since it says ${isPlus ? '+' : '-'}${b}, we ${isPlus ? 'subtract' : 'add'} ${b} on both sides.`,
                    latex: `${a}x = ${isPlus ? c - b : c + b}`
                },
                { 
                    sv: `Steg 2: Nu står det att ${a} gånger x är ${isPlus ? c-b : c+b}. Dela båda sidor med ${a} för att få fram x.`, 
                    en: `Step 2: Now it says that ${a} times x is ${isPlus ? c-b : c+b}. Divide both sides by ${a} to find x.`,
                    latex: `x = \\frac{${isPlus ? c-b : c+b}}{${a}}`
                },
                {
                    sv: "Då får vi det slutgiltiga svaret.",
                    en: "Then we get the final answer.",
                    latex: `x = ${x}`
                }
            ],
            metadata: { variation_key: 'twostep_calc', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Parentheses ---
    private level3_Parentheses(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['paren_lie_distribution', 'paren_calc']);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 6), x = MathUtils.randomInt(1, 8);

        if (v === 'paren_lie_distribution') {
            const lie = `${a}(x + ${b}) = ${a}x + ${b}`; 
            const correct1 = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            const correct2 = `${a}(x + ${b}) = ${a} · x + ${a} · ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket alternativ visar ett FELAKTIGT sätt att multiplicera in i parentesen?" : "Which option shows an INCORRECT way to distribute into the parentheses?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct1, lie, correct2]),
                },
                token: this.toBase64(lie),
                clues: [{ text: lang === 'sv' ? "Kom ihåg att siffran utanför parentesen måste multipliceras med ALLA delar inuti parentesen." : "Remember that the number outside the parentheses must be multiplied by ALL parts inside the parentheses." }],
                metadata: { variation_key: 'paren_lie_distribution', difficulty: 3 }
            };
        }

        const constantSum = a * (x + b);
        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${constantSum}`,
                description: lang === 'sv' ? "Förenkla uttrycket och lös ekvationen." : "Simplify the expression and solve the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    sv: `Steg 1: Ta bort parentesen genom att multiplicera ${a} med både x och ${b}.`, 
                    en: `Step 1: Remove the parentheses by multiplying ${a} with both x and ${b}.`,
                    latex: `${a} \\cdot x + ${a} \\cdot ${b} = ${constantSum} \\Rightarrow ${a}x + ${a*b} = ${constantSum}`
                },
                { 
                    sv: `Steg 2: Flytta nu $+${a*b}$ genom att subtrahera ${a*b} från båda sidor.`, 
                    en: `Step 2: Now move $+${a*b}$ by subtracting ${a*b} from both sides.`,
                    latex: `${a}x = ${constantSum - a*b}`
                },
                { 
                    sv: `Steg 3: Dela med ${a} på båda sidor för att få fram x.`, 
                    en: `Step 3: Divide by ${a} on both sides to find x.`,
                    latex: `x = \\frac{${constantSum - a*b}}{${a}}`
                },
                {
                    sv: "Resultat:",
                    en: "Result:",
                    latex: `x = ${x}`
                }
            ],
            metadata: { variation_key: 'paren_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Both Sides ---
    private level4_BothSides(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['bothsides_concept_strategy', 'bothsides_calc']);
        const x = MathUtils.randomInt(2, 8), a = MathUtils.randomInt(6, 10), c = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 12);
        const d = (a - c) * x + b;

        if (v === 'bothsides_concept_strategy') {
            const eq = `${a}x + ${b} = ${c}x + ${d}`;
            const correct = lang === 'sv' ? `Subtrahera ${c}x från båda sidor` : `Subtract ${c}x from both sides`;
            const wrong = lang === 'sv' ? `Subtrahera ${a}x från båda sidor` : `Subtract ${a}x from both sides`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `I $${eq}$, vilket steg är smartast för att hålla x positivt?` : `In $${eq}$, which step is smartest to keep x positive?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Det är oftast enklast att 'flytta' den minsta x-termen först. Då slipper man räkna med negativa antal x." : "It is usually easiest to 'move' the smallest x-term first. That way, you avoid working with negative amounts of x." }],
                metadata: { variation_key: 'bothsides_concept_strategy', difficulty: 3 }
            };
        }

        return {
            renderData: {
                latex: `${a}x + ${b} = ${c}x + ${d}`,
                description: lang === 'sv' ? "Samla x-termerna på ena sidan och talen på den andra." : "Gather x-terms on one side and constants on the other.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    sv: `Steg 1: Samla alla x på en sida. Dra bort den minsta x-termen (${c}x) från båda sidor.`, 
                    en: `Step 1: Collect all x's on one side. Subtract the smallest x-term (${c}x) from both sides.`,
                    latex: `${a}x - ${c}x + ${b} = ${d} \\Rightarrow ${a-c}x + ${b} = ${d}`
                },
                { 
                    sv: `Steg 2: Flytta nu siffran ${b} till den andra sidan genom att subtrahera ${b} från båda sidor.`, 
                    en: `Step 2: Now move the number ${b} to the other side by subtracting ${b} from both sides.`,
                    latex: `${a-c}x = ${d} - ${b} \\Rightarrow ${a-c}x = ${d-b}`
                },
                { 
                    sv: `Steg 3: Dela nu båda sidor med ${a-c} för att räkna ut vad ett x är värt.`, 
                    en: `Step 3: Now divide both sides by ${a-c} to calculate what one x is worth.`,
                    latex: `x = \\frac{${d-b}}{${a-c}}`
                },
                {
                    sv: "Svaret blir:",
                    en: "The answer is:",
                    latex: `x = ${x}`
                }
            ],
            metadata: { variation_key: 'bothsides_calc', difficulty: 4 }
        };
    }

    private level7_Mixed(lang: string): any {
        const subLevel = MathUtils.randomInt(1, 4);
        const data = this.generate(subLevel, lang);
        data.metadata.mixed = true;
        return data;
    }
}