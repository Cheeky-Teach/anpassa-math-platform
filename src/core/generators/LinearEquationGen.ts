import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv'): any {
        if (level === 5 || level === 6) {
            return this.problemGen.generate(level, lang);
        }
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
            let q = "", correctOp = "", clueText = "", latexStep = "", ansVal = "";

            const ops = lang === 'sv' 
                ? ["Addition (+)", "Subtraktion (-)", "Multiplikation (·)", "Division (/)"] 
                : ["Addition (+)", "Subtraction (-)", "Multiplication (·)", "Division (/)"];

            if (type === 1) {
                q = `x + ${val1} = ${val1 + val2}`;
                ansVal = (lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)");
                clueText = lang === 'sv' ? `För att nollställa $+${val1}$ använder vi den motsatta räkneoperationen.` : `To cancel out $+${val1}$, we use the opposite mathematical operation.`;
                latexStep = `${val1 + val2} - ${val1} = ${val2}`;
            } else if (type === 2) {
                q = `x - ${val1} = ${val2}`;
                ansVal = (lang === 'sv' ? "Addition (+)" : "Addition (+)");
                clueText = lang === 'sv' ? `Motsatsen till subtraktion är addition. Vi lägger till samma värde på båda sidor.` : `The opposite of subtraction is addition. We add the same value to both sides.`;
                latexStep = `${val2} + ${val1} = ${val1 + val2}`;
            } else if (type === 3) {
                q = `${val1}x = ${val1 * val2}`;
                ansVal = (lang === 'sv' ? "Division (/)" : "Division (/)");
                clueText = lang === 'sv' ? `Eftersom x är multiplicerat med ${val1}, måste vi dela (dividera) för att få x ensamt.` : `Since x is multiplied by ${val1}, we must divide to get x alone.`;
                latexStep = `\\frac{${val1 * val2}}{${val1}} = ${val2}`;
            } else {
                q = `\\frac{x}{${val1}} = ${val2}`;
                ansVal = (lang === 'sv' ? "Multiplikation (·)" : "Multiplication (·)");
                clueText = lang === 'sv' ? `Motsatsen till division är multiplikation. Multiplicera båda sidor med nämnaren.` : `The opposite of division is multiplication. Multiply both sides by the denominator.`;
                latexStep = `${val2} \\cdot ${val1} = ${val1 * val2}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' ? `Vilken operation isolerar x i $${q}$?` : `Which operation isolates x in $${q}$?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(ops)
                },
                token: this.toBase64(ansVal),
                clues: [
                    { text: clueText, latex: latexStep },
                    { text: lang === 'sv' ? "Rätt operation är:" : "The correct operation is:", latex: `\\text{${ansVal}}` }
                ],
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
                    description: lang === 'sv' ? `Om $x = ${targetX}$, vilket påstående är FALSKT?` : `If $x = ${targetX}$, which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([sTrue1, sTrue2, lie])
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? `Sätt in ${targetX} istället för x och kontrollera om båda sidor blir lika.` : `Substitute ${targetX} for x and check if both sides are equal.`, latex: `${targetX} - ${b} \\neq ${targetX + b}` },
                    { text: lang === 'sv' ? "Falskt påstående:" : "False statement:", latex: `\\text{${lie}}` }
                ],
                metadata: { variation_key: 'onestep_spot_lie', difficulty: 1 }
            };
        }

        const type = MathUtils.randomInt(1, 3);
        const x = MathUtils.randomInt(2, 12);
        let latex = '', pedagogicalClues = [];
        
        if (type === 1) {
            const k = MathUtils.randomInt(2, 9);
            const res = k * x;
            latex = `${k}x = ${res}`;
            pedagogicalClues = [
                { text: lang === 'sv' ? `Dela båda sidor med ${k} för att få x ensamt.` : `Divide both sides by ${k} to get x alone.`, latex: `\\frac{${res}}{${k}} = ${x} \\\\ x = ${x}` }
            ];
        } else {
            const k = MathUtils.randomInt(1, 20);
            const isPlus = Math.random() > 0.5;
            const res = isPlus ? x + k : x - k;
            latex = isPlus ? `x + ${k} = ${res}` : `x - ${k} = ${res}`;
            pedagogicalClues = [
                { text: lang === 'sv' ? (isPlus ? `Ta bort ${k} från båda sidor.` : `Lägg till ${k} på båda sidor.`) : (isPlus ? `Subtract ${k} from both sides.` : `Add ${k} to both sides.`), latex: isPlus ? `${res} - ${k} = ${x} \\\\ x = ${x}` : `${res} + ${k} = ${x} \\\\ x = ${x}` }
            ];
        }

        pedagogicalClues.push({ text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `x = ${x}` });

        return {
            renderData: { latex, description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", answerType: 'text' },
            token: this.toBase64(x.toString()),
            clues: pedagogicalClues,
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
                    description: lang === 'sv' ? `För $${a}x + ${b} = ${c}$, vilket steg är bäst att börja med?` : `For $${a}x + ${b} = ${c}$, which step is best to start with?`,
                    answerType: 'multiple_choice',
                    options: [correct, wrong]
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Det är lättast att först 'flytta' den term som inte innehåller x." : "It is easiest to first 'move' the term that does not contain x." },
                    { text: lang === 'sv' ? "Rätt steg är:" : "The correct step is:", latex: `\\text{${correct}}` }
                ],
                metadata: { variation_key: 'twostep_concept_order', difficulty: 2 }
            };
        }

        const x = MathUtils.randomInt(2, 10);
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(1, 15);
        const isPlus = Math.random() > 0.5;
        const c = isPlus ? a * x + b : a * x - b;
        const intermediate = isPlus ? c - b : c + b;

        return {
            renderData: { latex: `${a}x ${isPlus ? '+' : '-'} ${b} = ${c}`, description: lang === 'sv' ? "Lös ekvationen steg för steg." : "Solve the equation step by step.", answerType: 'text' },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Flytta siffran ${b} genom att utföra motsatt operation.` : `Move the number ${b} by performing the opposite operation.`,
                    latex: isPlus ? `${c} - ${b} = ${intermediate} \\\\ ${a}x = ${intermediate}` : `${c} + ${b} = ${intermediate} \\\\ ${a}x = ${intermediate}`
                },
                { 
                    text: lang === 'sv' ? `Dela nu båda sidor med ${a} för att isolera x.` : `Now divide both sides by ${a} to isolate x.`,
                    latex: `\\frac{${intermediate}}{${a}} = ${x} \\\\ x = ${x}`
                },
                { text: lang === 'sv' ? "Värdet på x är:" : "The value of x is:", latex: `x = ${x}` }
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
            const correct1 = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FELAKTIGT?" : "Which statement is INCORRECT?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct1, lie]),
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "Siffran framför parentesen måste multipliceras med ALLA termer inuti." : "The number in front of the parentheses must be multiplied by ALL terms inside.", latex: `${a} \\cdot x + ${a} \\cdot ${b}` },
                    { text: lang === 'sv' ? "Lögnen är:" : "The lie is:", latex: `\\text{${lie}}` }
                ],
                metadata: { variation_key: 'paren_lie_distribution', difficulty: 3 }
            };
        }

        const ab = a * b;
        const constantSum = a * (x + b);
        const diff = constantSum - ab;

        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${constantSum}`,
                description: lang === 'sv' ? "Lös ut x ur ekvationen." : "Solve for x in the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Multiplicera in ${a} i parentesen.` : `Distribute ${a} into the parentheses.`,
                    latex: `${a} \\cdot x + ${a} \\cdot ${b} = ${ab} \\\\ ${a}x + ${ab} = ${constantSum}`
                },
                { 
                    text: lang === 'sv' ? `Subtrahera ${ab} från båda sidor.` : `Subtract ${ab} from both sides.`,
                    latex: `${constantSum} - ${ab} = ${diff} \\\\ ${a}x = ${diff}`
                },
                { 
                    text: lang === 'sv' ? `Dela med ${a} för att få svaret.` : `Divide by ${a} to get the answer.`,
                    latex: `\\frac{${diff}}{${a}} = ${x} \\\\ x = ${x}`
                },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `x = ${x}` }
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
        const eq = `${a}x + ${b} = ${c}x + ${d}`;

        if (v === 'bothsides_concept_strategy') {
            const correct = lang === 'sv' ? `Subtrahera ${c}x från båda sidor` : `Subtract ${c}x from both sides`;
            return {
                renderData: {
                    description: lang === 'sv' ? `I $${eq}$, vad är smartast att göra först?` : `In $${eq}$, what is smartest to do first?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lang === 'sv' ? `Addera ${a}x` : `Add ${a}x` ])
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang === 'sv' ? "Det är oftast enklast att ta bort den minsta x-termen först för att slippa negativa tal." : "It's usually easiest to remove the smallest x-term first to avoid negative numbers." },
                    { text: lang === 'sv' ? "Rätt val är:" : "The correct choice is:", latex: `\\text{${correct}}` }
                ],
                metadata: { variation_key: 'bothsides_concept_strategy', difficulty: 3 }
            };
        }

        const ac = a - c;
        const db = d - b;

        return {
            renderData: {
                latex: eq,
                description: lang === 'sv' ? "Samla x på ena sidan och talen på den andra." : "Gather x on one side and numbers on the other.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? `Börja med att samla x på vänster sida genom att dra bort ${c}x.` : `Start by gathering x on the left side by subtracting ${c}x.`,
                    latex: `${a}x - ${c}x = ${ac}x \\\\ ${ac}x + ${b} = ${d}`
                },
                { 
                    text: lang === 'sv' ? `Flytta nu siffran ${b} genom att dra bort den från båda sidor.` : `Now move the number ${b} by subtracting it from both sides.`,
                    latex: `${d} - ${b} = ${db} \\\\ ${ac}x = ${db}`
                },
                { 
                    text: lang === 'sv' ? `Dela med ${ac} för att hitta x.` : `Divide by ${ac} to find x.`,
                    latex: `\\frac{${db}}{${ac}} = ${x} \\\\ x = ${x}`
                },
                { text: lang === 'sv' ? "Slutresultat:" : "Final result:", latex: `x = ${x}` }
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