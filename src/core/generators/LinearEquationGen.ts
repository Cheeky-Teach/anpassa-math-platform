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

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
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
            let clue = "";

            const ops = lang === 'sv' 
                ? ["Addition (+)", "Subtraktion (-)", "Multiplikation (·)", "Division (/)"] 
                : ["Addition (+)", "Subtraction (-)", "Multiplication (·)", "Division (/)"];

            if (type === 1) { // x + a = b
                q = `x + ${val1} = ${val1 + val2}`;
                correctOp = lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)";
                clue = lang === 'sv' ? "För att få x ensamt måste vi göra motsatsen till addition, vilket är subtraktion." : "To get x alone, we must perform the opposite of addition, which is subtraction.";
            } else if (type === 2) { // x - a = b
                q = `x - ${val1} = ${val2}`;
                correctOp = lang === 'sv' ? "Addition (+)" : "Addition (+)";
                clue = lang === 'sv' ? "Eftersom vi har en subtraktion (-), använder vi motsatsen (addition) för att nollställa termen." : "Since we have a subtraction (-), we use the opposite (addition) to cancel the term.";
            } else if (type === 3) { // ax = b
                q = `${val1}x = ${val1 * val2}`;
                correctOp = lang === 'sv' ? "Division (/)" : "Division (/)";
                clue = lang === 'sv' ? "Talet står precis bredvid x, vilket betyder multiplikation. Motsatsen är division." : "The number is right next to x, which means multiplication. The opposite is division.";
            } else { // x / a = b
                q = `\\frac{x}{${val1}} = ${val2}`;
                correctOp = lang === 'sv' ? "Multiplikation (·)" : "Multiplication (·)";
                clue = lang === 'sv' ? "Här är x dividerat med ett tal. För att få x fritt använder vi multiplikation." : "Here x is divided by a number. To free x, we use multiplication.";
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Betrakta ekvationen $${q}$. Vilken räkneoperation ska du utföra på båda sidor för att isolera variabeln x?` : `Consider the equation $${q}$. Which operation should you perform on both sides to isolate the variable x?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(ops)
                },
                token: this.toBase64(correctOp),
                clues: [{ text: clue }],
                metadata: { variation_key: 'onestep_concept_inverse', difficulty: 1 }
            };
        }

        if (v === 'onestep_spot_lie') {
            const targetX = MathUtils.randomInt(2, 10);
            const a = MathUtils.randomInt(2, 6);
            const b = MathUtils.randomInt(2, 15);
            
            // Equation strings for buttons: Use middle dot instead of \cdot
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
                clues: [{ text: lang === 'sv' ? "Testa varje alternativ genom att ersätta x med talet. Den ekvation där vänster och höger sida inte blir lika är 'lögnen'." : "Test each option by replacing x with the number. The equation where the left and right sides are not equal is the 'lie'." }],
                metadata: { variation_key: 'onestep_spot_lie', difficulty: 1 }
            };
        }

        const type = MathUtils.randomInt(1, 3);
        const x = MathUtils.randomInt(2, 12);
        let latex = '', answer = x.toString(), clue = '';
        
        if (type === 1) { // kx = res
            const k = MathUtils.randomInt(2, 9);
            latex = `${k}x = ${k * x}`;
            clue = lang === 'sv' ? `Dela båda sidor med ${k} eftersom division är motsatsen till multiplikation.` : `Divide both sides by ${k} as division is the opposite of multiplication.`;
        } else { // x + k = res
            const k = MathUtils.randomInt(1, 20);
            const isPlus = Math.random() > 0.5;
            latex = isPlus ? `x + ${k} = ${x + k}` : `x - ${k} = ${x - k}`;
            clue = isPlus 
                ? (lang === 'sv' ? `Subtrahera ${k} från båda sidor för att få variabeln x ensam.` : `Subtract ${k} from both sides to get the variable x alone.`)
                : (lang === 'sv' ? `Eftersom du har en subtraktion av ${k}, addera ${k} på båda sidor för att nollställa termen.` : `Since you have a subtraction of ${k}, add ${k} to both sides to cancel out the term.`);
        }

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Beräkna värdet på variabeln x i ekvationen nedan." : "Calculate the value of the variable x in the equation below.", 
                answerType: 'text' 
            },
            token: this.toBase64(answer),
            clues: [{ text: clue }],
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
                    description: lang === 'sv' ? `När du ska lösa ekvationen $${a}x + ${b} = ${c}$, vilket av följande steg är mest logiskt att börja med?` : `When solving the equation $${a}x + ${b} = ${c}$, which of the following steps is most logical to perform first?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "I algebra använder vi oftast prioriteringsreglerna baklänges. Vi börjar med att ta bort addition eller subtraktion innan vi rör multiplikationen vid x." : "In algebra, we usually use the order of operations in reverse. We start by removing addition or subtraction before touching the multiplication at x." }],
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
                description: lang === 'sv' ? "Lös ekvationen steg för steg. Kom ihåg att alltid utföra samma ändring på båda sidor." : "Solve the equation step by step. Remember to always perform the same change on both sides.", 
                answerType: 'text' 
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Flytta konstanten ${b} genom att utföra den motsatta räkneoperationen.` : `Step 1: Move the constant ${b} by performing the opposite mathematical operation.`, latex: `${a}x = ${c} ${isPlus ? '-' : '+'} ${b}` },
                { text: lang === 'sv' ? `Steg 2: Dela nu båda sidor med ${a} för att få fram värdet på x.` : `Step 2: Now divide both sides by ${a} to find the value of x.`, latex: `x = \\frac{${isPlus ? c-b : c+b}}{${a}}` }
            ],
            metadata: { variation_key: 'twostep_calc', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Parentheses ---
    private level3_Parentheses(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['paren_lie_distribution', 'paren_calc']);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 6), x = MathUtils.randomInt(1, 8);

        if (v === 'paren_lie_distribution') {
            const correct = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            const lie = `${a}(x + ${b}) = ${a}x + ${b}`; 
            // Use middle dot (·) for button text instead of \cdot
            const altCorrect = `${a}(x + ${b}) = ${a} · x + ${a} · ${b}`;

            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket av alternativen nedan visar en FELAKTIG metod för att multiplicera in i parentesen?" : "Which of the options below shows an INCORRECT method for distributing into the parentheses?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lie, altCorrect]),
                },
                token: this.toBase64(lie),
                clues: [{ text: lang === 'sv' ? "Talet som står precis utanför parentesen är en faktor som ska multipliceras med VARJE term som finns inuti parentesen." : "The number just outside the parentheses is a factor that must be multiplied by EVERY term inside the parentheses." }],
                metadata: { variation_key: 'paren_lie_distribution', difficulty: 3 }
            };
        }

        const c = a * (x + b);
        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${c}`,
                description: lang === 'sv' ? "Förenkla uttrycket genom att multiplicera in i parentesen först, och lös därefter ekvationen." : "Simplify the expression by distributing into the parentheses first, and then solve the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Multiplicera in ${a} i parentesen så att den försvinner.` : `Step 1: Distribute ${a} into the parentheses to remove them.`, latex: `${a}x + ${a*b} = ${c}` },
                { text: lang === 'sv' ? "Steg 2: Lös nu ut variabeln x precis som i en vanlig tvåstegsekvation." : "Step 2: Now solve for the variable x just like in a standard two-step equation." }
            ],
            metadata: { variation_key: 'paren_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 4: Both Sides ---
    private level4_BothSides(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['bothsides_concept_strategy', 'bothsides_calc']);
        const x = MathUtils.randomInt(2, 10), a = MathUtils.randomInt(6, 10), c = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 12);
        const d = (a - c) * x + b;

        if (v === 'bothsides_concept_strategy') {
            const eq = `${a}x + ${b} = ${c}x + ${d}`;
            const correct = lang === 'sv' ? `Subtrahera ${c}x från båda sidor` : `Subtract ${c}x from both sides`;
            const wrong = lang === 'sv' ? `Subtrahera ${a}x från båda sidor` : `Subtract ${a}x from both sides`;
            
            return {
                renderData: {
                    description: lang === 'sv' ? `I ekvationen $${eq}$, vilket av dessa steg är mest strategiskt för att hålla antalet x positivt?` : `In the equation $${eq}$, which of these steps is most strategic for keeping the amount of x positive?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [{ text: lang === 'sv' ? "Genom att 'flytta' den minsta x-termen till den sida där det finns flest x, slipper vi arbeta med negativa antal x vilket underlättar uträkningen." : "By 'moving' the smallest x-term to the side with the most x's, we avoid working with negative amounts of x, which makes the calculation easier." }],
                metadata: { variation_key: 'bothsides_concept_strategy', difficulty: 3 }
            };
        }

        return {
            renderData: {
                latex: `${a}x + ${b} = ${c}x + ${d}`,
                description: lang === 'sv' ? "Samla alla termer med x på en sida och alla vanliga tal på den andra sidan för att lösa ut x." : "Gather all terms with x on one side and all constants on the other side to solve for x.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { text: lang === 'sv' ? `Steg 1: Subtrahera ${c}x från båda sidor för att samla x på vänster sida.` : `Step 1: Subtract ${c}x from both sides to gather x on the left side.`, latex: `${a-c}x + ${b} = ${d}` },
                { text: lang === 'sv' ? `Steg 2: Flytta konstanten ${b} genom att subtrahera den från båda sidor.` : `Step 2: Move the constant ${b} by subtracting it from both sides.`, latex: `${a-c}x = ${d-b}` },
                { text: lang === 'sv' ? "Steg 3: Slutför uträkningen genom att dividera med koefficienten framför x." : "Step 3: Complete the calculation by dividing by the coefficient in front of x.", latex: `x = ${x}` }
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