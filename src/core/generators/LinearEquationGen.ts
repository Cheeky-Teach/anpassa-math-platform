import { MathUtils } from '../utils/MathUtils.js';
import { LinearEquationProblemGen } from './LinearEquationProblemGen.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class LinearEquationGen {
    private problemGen: LinearEquationProblemGen;

    constructor() {
        // Instantiate the connection handler during main class initialization
        this.problemGen = new LinearEquationProblemGen();
    }

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        // Adaptive Fallback: If Level 1 concepts are mastered, push to Level 2 logic
        if (level === 1 && options.hideConcept && options.exclude?.includes('onestep_calc')) {
            return this.level2_TwoStep(lang, undefined, options);
        }

        let questionData: any;

        // RESTORED: Direct delegation captured safely to pass through the decorator pipeline
        if (level === 5 || level === 6) {
            questionData = this.problemGen.generate(level, lang, options);
        } else if (level === 7) {
            questionData = this.level7_Mixed(lang, options);
        } else {
            switch (level) {
                case 1: questionData = this.level1_OneStep(lang, undefined, options); break;
                case 2: questionData = this.level2_TwoStep(lang, undefined, options); break;
                case 3: questionData = this.level3_Parentheses(lang, undefined, options); break;
                case 4: questionData = this.level4_BothSides(lang, undefined, options); break;
                default: questionData = this.level1_OneStep(lang, undefined, options); break;
            }
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6, 7];
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
    public generateByVariation(key: string, lang: string = 'sv'): any {
        // 🟢 Legacy word problem routing array is completely deleted.
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

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: ONE-STEP EQUATIONS ---
    private level1_OneStep(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'onestep_concept_inverse', type: 'concept' },
            { key: 'onestep_spot_lie', type: 'concept' },
            { key: 'onestep_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'onestep_concept_inverse') {
            const type = MathUtils.randomInt(1, 4);
            const val1 = MathUtils.randomInt(2, 12);
            const val2 = MathUtils.randomInt(2, 12);
            let q = "", ansVal = "", rule = "", example = "";

            const ops = lang === 'sv' 
                ? ["Addition (+)", "Subtraktion (-)", "Multiplikation (·)", "Division (/)"] 
                : ["Addition (+)", "Subtraction (-)", "Multiplication (·)", "Division (/)"];

            if (type === 1) {
                q = `x + ${val1} = ${val1 + val2}`;
                ansVal = lang === 'sv' ? "Subtraktion (-)" : "Subtraction (-)";
                rule = lang === 'sv' ? "För att få bort en addition (+) använder vi motsatsen." : "To remove an addition (+), we use the opposite.";
                example = `${val1 + val2} - ${val1} = ${val2}`;
            } else if (type === 2) {
                q = `x - ${val1} = ${val2}`;
                ansVal = lang === 'sv' ? "Addition (+)" : "Addition (+)";
                rule = lang === 'sv' ? "För att få bort en subtraktion (-) använder vi motsatsen." : "To remove a subtraction (-), we use the opposite.";
                example = `${val2} + ${val1} = ${val1 + val2}`;
            } else if (type === 3) {
                q = `${val1}x = ${val1 * val2}`;
                ansVal = lang === 'sv' ? "Division (/)" : "Division (/)";
                rule = lang === 'sv' ? "När x är multiplicerat med ett tal, använder vi division för att få x ensamt." : "When x is multiplied by a number, we use division to isolate x.";
                example = `\\frac{${val1 * val2}}{${val1}} = ${val2}`;
            } else {
                q = `\\frac{x}{${val1}} = ${val2}`;
                ansVal = lang === 'sv' ? "Multiplikation (·)" : "Multiplication (·)";
                rule = lang === 'sv' ? "När x är dividerat med ett tal, använder vi multiplikation för att få x ensamt." : "When x is divided by a number, we use multiplication to isolate x.";
                example = `${val2} · ${val1} = ${val1 * val2}`;
            }

            return {
                renderData: { 
                    latex: q, 
                    description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", 
                    answerType: 'text' 
                },
                token: this.toBase64(ansVal), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Målet med att lösa en ekvation är att få variabeln (x) helt ensam på ena sidan." : "Step 1: The goal of solving an equation is to isolate the variable (x) on one side." },
                    { text: lang === 'sv' ? "Steg 2: Vi gör detta genom att utföra 'motsatt operation' på båda sidor om likhetstecknet." : "Step 2: We do this by performing the 'inverse operation' on both sides of the equals sign." },
                    { text: rule },
                    { text: lang === 'sv' ? "Exempel på uträkning:" : "Example calculation:", latex: example },
                    { text: lang === 'sv' ? `Svar: ${ansVal}` : `Answer: ${ansVal}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'onestep_spot_lie') {
            const targetX = MathUtils.randomInt(3, 10);
            const b = MathUtils.randomInt(2, 15);
            const lie = `x - ${b} = ${targetX + b}`; 

            return {
                renderData: {
                    description: lang === 'sv' ? `Om $x = ${targetX}$, vilket påstående är FALSKT?` : `If $x = ${targetX}$, which statement is FALSE?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([`x + ${b} = ${targetX + b}`, `2x = ${2 * targetX}`, lie])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: För att testa om ett påstående är sant, ersätt x med värdet " + targetX + "." : "Step 1: To test if a statement is true, replace x with the value " + targetX + "." },
                    { text: lang === 'sv' ? `Steg 2: Kontrollera $${targetX} - ${b}$.` : `Step 2: Check $${targetX} - ${b}$.` },
                    { text: lang === 'sv' ? `Uträkning: ${targetX} - ${b} = ${targetX - b}.` : `Calculation: ${targetX} - ${b} = ${targetX - b}.` },
                    { text: lang === 'sv' ? `Eftersom ${targetX - b} inte är lika med ${targetX + b}, är påståendet falskt.` : `Since ${targetX - b} is not equal to ${targetX + b}, the statement is false.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        const type = MathUtils.randomInt(1, 2);
        const x = MathUtils.randomInt(2, 12);
        let latex = '';
        let clues = [];
        
        // 🟢 Define placeholder vars outside the branches so they are accessible to the token string builder below
        let modifierVal = 0;
        let finalRes = 0;
        let isPlus = false;

        if (type === 1) {
            const k = MathUtils.randomInt(2, 9);
            const res = k * x;
            modifierVal = k;   // 🟢 Safely preserve for token compilation
            finalRes = res;    // 🟢 Safely preserve for token compilation
            latex = `${k}x = ${res}`;
            clues = [
                { 
                    text: lang === 'sv' ? "Målet är att isolera x och få det helt ensamt på sin sida." : "The goal is to isolate x and get it completely by itself on its side.", 
                    latex: `${k}x = ${res}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 1: Ta bort multiplikationen genom att dela med ${k} på båda sidor.` : `Step 1: Undo the multiplication by dividing both sides by ${k}.`, 
                    latex: `\\frac{${k}x}{\\mathbf{${k}}} = \\frac{${res}}{\\mathbf{${k}}}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla divisionen för att se vad x blir." : "Simplify the division to see what x equals.", 
                    latex: `x = \\mathbf{${x}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ];
        } else {
            const k = MathUtils.randomInt(1, 20);
            isPlus = Math.random() > 0.5;
            const res = isPlus ? x + k : x - k;
            modifierVal = k;   // 🟢 Safely preserve for token compilation
            finalRes = res;    // 🟢 Safely preserve for token compilation
            latex = isPlus ? `x + ${k} = ${res}` : `x - ${k} = ${res}`;
            clues = [
                { 
                    text: lang === 'sv' ? "Målet är att isolera x och få det helt ensamt på sin sida." : "The goal is to isolate x and get it completely by itself on its side.", 
                    latex: isPlus ? `x + ${k} = ${res}` : `x - ${k} = ${res}` 
                },
                { 
                    text: lang === 'sv' ? (isPlus ? `Steg 1: Ta bort +${k} genom att subtrahera ${k} från båda sidor.` : `Step 1: Remove -${k} by adding ${k} to both sides.`) : (isPlus ? `Step 1: Undo +${k} by subtracting ${k} from both sides.` : `Step 1: Undo -${k} by adding ${k} to both sides.`), 
                    latex: isPlus ? `x + ${k} \\mathbf{- ${k}} = ${res} \\mathbf{- ${k}}` : `x - ${k} \\mathbf{+ ${k}} = ${res} \\mathbf{+ ${k}}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla uttrycket på båda sidor för att få fram svaret." : "Simplify the expression on both sides to get the answer.", 
                    latex: `x = \\mathbf{${x}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ];
        }

        // 🟢 Strategy B Token Definition unifies algebraic states using outer scoped tracking variables
        const backgroundToken = type === 1 
            ? `multiply ; ${modifierVal} ; ${finalRes}`
            : (isPlus ? `add ; ${modifierVal} ; ${finalRes}` : `sub ; ${modifierVal} ; ${finalRes}`);

        return {
            renderData: { 
                latex, 
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", 
                interceptorToken: backgroundToken, // Hidden parsing lane link
                answerType: 'text' 
            },
            token: this.toBase64(x.toString()),
            variationKey: 'onestep_calc', 
            type: 'calculate',
            clues: clues,
            metadata: { variation_key: v, difficulty: 1 }
        };
    }

    // --- LEVEL 2: TWO-STEP EQUATIONS ---
    private level2_TwoStep(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'twostep_concept_order', type: 'concept' },
            { key: 'twostep_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        
        if (v === 'twostep_concept_order') {
            const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 10);
            const correct = lang === 'sv' ? `Subtrahera ${b} från båda sidor` : `Subtract ${b} from both sides`;
            return {
                renderData: {
                    description: lang === 'sv' ? `För $${a}x + ${b} = 20$, vilket strategiskt steg är bäst att börja med?` : `For $${a}x + ${b} = 20$, which strategic step is best to start with?`,
                    answerType: 'multiple_choice', options: [correct, lang === 'sv' ? `Dela båda sidor med ${a}` : `Divide both sides by ${a}`]
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { 
                        text: lang === 'sv' ? "När vi löser tvåstegsekvationer arbetar vi baklänges enligt prioriteringsreglerna. Vi städar bort 'lösa' siffror först." : "When uncovering multi-step algebraic balances, we execute inverse operations in reverse order, stripping loose constants first.", 
                        latex: `${a}x + ${b} = 20` 
                    },
                    { 
                        text: lang === 'sv' ? `Genom att ta bort siffertermen +${b} först slipper vi krångliga bråkdelar över hela ekvationen.` : `By eliminating the constant addition term +${b} first, we avoid creating messy fractions across the structural equation line.`, 
                        latex: `${a}x + ${b} \\mathbf{- ${b}} = 20 \\mathbf{- ${b}}` 
                    },
                    { 
                        text: lang === 'sv' ? "Det bästa och renaste första steget på tavlan är därför:" : "The cleanest and most tactical opening execution path on the board is therefore:", 
                        latex: `\\mathbf{\\text{${correct}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}`, 
                        latex: `\\text{${correct}}` 
                    }
                ],
                metadata: { variation_key: v, difficulty: 2 }
            };
        }

        // Calculation Logic for 4 types: ax+b=c, ax-b=c, x/a+b=c, x/a-b=c
        const isMultiplication = Math.random() > 0.5; // Toggle between multiplication (ax) and division (x/a)
        const isPlus = Math.random() > 0.5; // Toggle between +b and -b
        
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(1, 15);
        let x: number, c: number, intermediate: number;
        let equationLatex: string;

        if (isMultiplication) {
            x = MathUtils.randomInt(2, 12);
            intermediate = a * x;
            c = isPlus ? intermediate + b : intermediate - b;
            equationLatex = `${a}x ${isPlus ? '+' : '-'} ${b} = ${c}`;
        } else {
            // Ensure integer results: c must be integer, so result of x/a must be integer
            const k = MathUtils.randomInt(2, 10); // Result of x/a
            x = k * a;
            intermediate = k;
            c = isPlus ? intermediate + b : intermediate - b;
            equationLatex = `\\frac{x}{${a}} ${isPlus ? '+' : '-'} ${b} = ${c}`;
        }

        const clues = [
            { 
                text: lang === 'sv' ? "Vi löser tvåstegsekvationer genom att först ta bort de lösa sifferkonstanterna." : "We solve two-step equations by removing loose numerical constants first.", 
                latex: equationLatex 
            },
            { 
                text: lang === 'sv' ? (isPlus ? `Steg 1: Ta bort +${b} genom och subtrahera ${b} från båda sidor.` : `Steg 1: Ta bort -${b} genom att addera ${b} på båda sidor.`) : (isPlus ? `Step 1: Remove +${b} by subtracting ${b} from both sides.` : `Step 1: Remove -${b} by adding ${b} to both sides.`), 
                latex: isMultiplication 
                    ? `${a}x ${isPlus ? '+' : '-'} ${b} \\mathbf{${isPlus ? '-' : '+'}} ${b} = ${c} \\mathbf{${isPlus ? '-' : '+'}} ${b}`
                    : `\\frac{x}{${a}} ${isPlus ? '+' : '-'} ${b} \\mathbf{${isPlus ? '-' : '+'}} ${b} = ${c} \\mathbf{${isPlus ? '-' : '+'}} ${b}`
            },
            { 
                text: lang === 'sv' ? "Förenkla siffertermerna så att variabeltermen står helt ensam:" : "Simplify the constants to isolate the variable term:", 
                latex: isMultiplication ? `${a}x = \\mathbf{${intermediate}}` : `\\frac{x}{${a}} = \\mathbf{${intermediate}}` 
            },
            { 
                text: isMultiplication 
                    ? (lang === 'sv' ? `Steg 2: Dela båda sidor med ${a} för att få bort multiplikationen.` : `Step 2: Divide both sides by ${a} to undo the multiplication.`)
                    : (lang === 'sv' ? `Steg 2: Multiplicera båda sidor med ${a} för att få bort divisionen.` : `Step 2: Multiply both sides by ${a} to undo the division.`),
                latex: isMultiplication
                    ? `\\frac{${a}x}{\\mathbf{${a}}} = \\frac{${intermediate}}{\\mathbf{${a}}}`
                    : `\\frac{x}{${a}} \\mathbf{\\cdot ${a}} = ${intermediate} \\mathbf{\\cdot ${a}}`
            },
            { 
                text: lang === 'sv' ? "Förenkla raden för att beräkna värdet på x." : "Simplify the line to calculate the final value of x.", 
                latex: `x = \\mathbf{${x}}` 
            },
            { 
                text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                latex: `x = ${x}` 
            }
        ];

        // 🟢 Strategy B Background Contract: Unifies both equations into a clean data string for the regex parser
        const backgroundToken = isMultiplication 
            ? `multiply ; ${a} ; ${isPlus ? '+' : '-'} ; ${b} ; ${c}`
            : `divide ; ${a} ; ${isPlus ? '+' : '-'} ; ${b} ; ${c}`;

        return {
            renderData: { 
                latex: equationLatex, 
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.", 
                interceptorToken: backgroundToken, // Hidden data layer channel passed safely to interceptor
                answerType: 'text' 
            },
            token: this.toBase64(x.toString()), 
            variationKey: 'twostep_calc', 
            type: 'calculate',
            clues: clues,
            metadata: { variation_key: v, difficulty: 2 } 
        };
    }

    // --- LEVEL 3: PARENTHESES ---
    private level3_Parentheses(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'paren_lie_distribution', type: 'concept' },
            { key: 'paren_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const a = MathUtils.randomInt(2, 5), b = MathUtils.randomInt(2, 6);

        if (v === 'paren_lie_distribution') {
            const correct = `${a}(x + ${b}) = ${a}x + ${a*b}`;
            const lie = `${a}(x + ${b}) = ${a}x + ${b}`; 
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilken uträkning är FALSK?" : "Which calculation is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([correct, lie, `${a}(x + 1) = ${a}x + ${a}`])
                },
                token: this.toBase64(lie), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: Distributiva lagen innebär att faktorn utanför parentesen ska multipliceras med VARJE term inuti." : "Step 1: The distributive law means the factor outside the parentheses must be multiplied by EVERY term inside." },
                    { text: lang === 'sv' ? `Steg 2: Beräkna ${a} · x och ${a} · ${b}.` : `Step 2: Calculate ${a} · x and ${a} · ${b}.` },
                    { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `${a}x + ${a*b}` },
                    { text: lang === 'sv' ? `Eftersom ${b} inte multiplicerats med ${a} i ett av alternativen, är det lögnen.` : `Since ${b} was not multiplied by ${a} in one of the options, that is the lie.` },
                    { text: lang === 'sv' ? `Svar: ${lie}` : `Answer: ${lie}` }
                ],
                metadata: { variation_key: v, difficulty: 3 }
            };
        }

        const x = MathUtils.randomInt(1, 8);
        const constantSum = a * (x + b);
        const expandedConst = a * b;
        const diff = constantSum - expandedConst;

        return {
            renderData: {
                latex: `${a}(x + ${b}) = ${constantSum}`,
                description: lang === 'sv' ? "Lös ekvationen." : "Solve the equation.",
                answerType: 'text'
            },
            token: this.toBase64(x.toString()), 
            variationKey: 'paren_calc', // Forces key grouping for pattern detection
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "När en ekvation innehåller en parentes börjar vi med att multiplicera in i den." : "When an equation contains a parenthesis, we start by multiplying into it.", 
                    latex: `${a}(x + ${b}) = ${constantSum}` 
                },
                { 
                    text: lang === 'sv' ? `Multiplicera ${a} med både x och ${b} på insidan av parentesen:` : `Multiply ${a} by both x and ${b} on the inside of the parentheses:`, 
                    latex: `\\mathbf{${a} \\cdot x + ${a} \\cdot ${b}} = ${constantSum}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla multiplikationen för att få en vanlig tvåstegsekvation:" : "Simplify the multiplication to generate a standard two-step equation:", 
                    latex: `${a}x + \\mathbf{${expandedConst}} = ${constantSum}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 1: Ta bort siffertermen genom att ta -${expandedConst} på båda sidor.` : `Step 1: Remove the constant term by subtracting ${expandedConst} from both sides.`, 
                    latex: `${a}x + ${expandedConst} \\mathbf{- ${expandedConst}} = ${constantSum} \\mathbf{- ${expandedConst}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut subtraktionen på höger och vänster sida:" : "Calculate the subtraction on the right and left sides:", 
                    latex: `${a}x = \\mathbf{${diff}}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Dela båda sidor med ${a} för att få x helt fritt.` : `Step 2: Divide both sides by ${a} to set x completely free.`, 
                    latex: `\\frac{${a}x}{\\mathbf{${a}}} = \\frac{${diff}}{\\mathbf{${a}}}` 
                },
                { 
                    text: lang === 'sv' ? "Utför divisionen för att räkna ut svaret." : "Perform the division to compute the final answer.", 
                    latex: `x = \\mathbf{${x}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 3 }
        };
    }

    // --- LEVEL 4: BOTH SIDES ---
    private level4_BothSides(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'bothsides_concept_strategy', type: 'concept' },
            { key: 'bothsides_calc', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const x = MathUtils.randomInt(2, 10), a = MathUtils.randomInt(6, 10), c = MathUtils.randomInt(2, 5);
        const b = MathUtils.randomInt(2, 12);
        const d = (a - c) * x + b;
        const eq = `${a}x + ${b} = ${c}x + ${d}`;

        if (v === 'bothsides_concept_strategy') {
            const correct = lang === 'sv' ? `Subtrahera ${c}x` : `Subtract ${c}x`;
            return {
                renderData: {
                    description: lang === 'sv' ? `För $${eq}$, vad är smartast att göra först?` : `For $${eq}$, what is smartest to do first?`,
                    answerType: 'multiple_choice', options: [correct, lang === 'sv' ? `Addera ${a}x` : `Add ${a}x`]
                },
                token: this.toBase64(correct), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Steg 1: När x finns på båda sidor vill vi samla dem på en och samma sida." : "Step 1: When x is on both sides, we want to gather them on one side." },
                    { text: lang === 'sv' ? "Steg 2: Det är oftast bäst att ta bort den MINSTA x-termen först för att undvika negativa tal." : "Step 2: It is usually best to remove the SMALLEST x-term first to avoid negative numbers." },
                    { text: lang === 'sv' ? `Svar: ${correct}` : `Answer: ${correct}` }
                ],
                metadata: { variation_key: v, difficulty: 4 }
            };
        }

        const diffX = a - c;
        const diffConst = d - b;

        return {
            renderData: { 
                latex: eq, 
                description: lang === 'sv' ? "Samla x på ena sidan och siffror på den andra." : "Gather x on one side and numbers on the other.", 
                answerType: 'text' 
            },
            token: this.toBase64(x.toString()), 
            variationKey: 'bothsides_calc', // 🟢 Forces key grouping for pattern detection
            type: 'calculate',
            clues: [
                { 
                    text: lang === 'sv' ? "När det finns x på båda sidor samlar vi dem först på den sida som har flest." : "When x is on both sides, we first collect them on the side that has more.", 
                    latex: eq 
                },
                { 
                    text: lang === 'sv' ? `Steg 1: Ta bort den minsta x-termen (${c}x) genom att subtrahera den från båda sidor.` : `Step 1: Remove the smallest x-term (${c}x) by subtracting it from both sides.`, 
                    latex: `${a}x \\mathbf{- ${c}x} + ${b} = ${c}x \\mathbf{- ${c}x} + ${d}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla x-termerna. Nu har vi bara x på en och samma sida:" : "Simplify the x-terms. Now we have x on one side only:", 
                    latex: `\\mathbf{${diffX}}x + ${b} = ${d}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 2: Ta bort siffertermen +${b} genom att ta -${b} på båda sidor.` : `Step 2: Remove the constant term +${b} by subtracting ${b} from both sides.`, 
                    latex: `${diffX}x + ${b} \\mathbf{- ${b}} = ${d} \\mathbf{- ${b}}` 
                },
                { 
                    text: lang === 'sv' ? "Förenkla sifferkonstanterna för att få variabeltermen ensam:" : "Simplify the constant numbers to isolate the variable term:", 
                    latex: `${diffX}x = \\mathbf{${diffConst}}` 
                },
                { 
                    text: lang === 'sv' ? `Steg 3: Dela båda sidor med ${diffX} för att räkna ut vad ett ensamt x är värt.` : `Step 3: Divide both sides by ${diffX} to calculate what a single x is worth.`, 
                    latex: `\\frac{${diffX}x}{\\mathbf{${diffX}}} = \\frac{${diffConst}}{\\mathbf{${diffX}}}` 
                },
                { 
                    text: lang === 'sv' ? "Dividera för att få fram värdet på x." : "Divide to reveal the final value of x.", 
                    latex: `x = \\mathbf{${x}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: x = ${x}` : `Answer: x = ${x}`, 
                    latex: `x = ${x}` 
                }
            ],
            metadata: { variation_key: v, difficulty: 4 }
        };
    }

    // --- LEVEL 7: MIXED ---
    private level7_Mixed(lang: string, options: any): any {
        // Expand range to 1-6 to include Word Problems (5-6)
        const subLevel = MathUtils.randomInt(1, 6);
        const data = this.generate(subLevel, lang, options);
        
        // Fix: Safety check to ensure metadata exists before assigning property
        // Some variations in level 1 (concepts) did not return a metadata object
        if (!data.metadata) {
            data.metadata = { variation_key: data.variationKey || 'mixed_calc' };
        }
        
        data.metadata.mixed = true;
        data.metadata.original_level = subLevel;
        return data;
    }
}